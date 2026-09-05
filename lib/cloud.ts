import { ref, get, set, push as dbPush, onValue, off, runTransaction, type DataSnapshot } from "firebase/database";
import { db, ensureSignedIn } from "./firebase";

// اتصال Firebase أحياناً يعلق بلا نهاية على بعض المتصفحات/الشبكات (لاحظنا هذا فعلياً بسفاري) —
// بدون هذا الحد الزمني، أي زر "تحديث" ينتظر السحابة يبقى عالقاً للأبد بلا أي رسالة خطأ للمستخدم.
const CLOUD_GET_TIMEOUT_MS = 12000;
// نفس المبدأ لعمليات الكتابة — كانت بلا أي حد زمني إطلاقاً، فأي تعليق صامت بالاتصال (نفس فئة
// عطل سفاري) كان يخلي التسجيل/القبول/الرفض يعلّق للأبد بدون أي رسالة نجاح أو فشل للمستخدم.
const CLOUD_WRITE_TIMEOUT_MS = 12000;

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error(`${label} timeout`)), ms)),
  ]);
}

export async function cloudGet<T>(key: string): Promise<T | null> {
  try {
    await withTimeout(ensureSignedIn(), CLOUD_GET_TIMEOUT_MS, "cloudGet sign-in");
    const snap = await withTimeout(get(ref(db, key)), CLOUD_GET_TIMEOUT_MS, "cloudGet");
    return snap.exists() ? (snap.val() as T) : null;
  } catch (e) {
    console.error(`cloudGet failed for "${key}":`, e);
    return null;
  }
}

export async function cloudSet(key: string, data: unknown): Promise<void> {
  try {
    await withTimeout(ensureSignedIn(), CLOUD_WRITE_TIMEOUT_MS, "cloudSet sign-in");
    await withTimeout(set(ref(db, key), data), CLOUD_WRITE_TIMEOUT_MS, "cloudSet");
  } catch (e) {
    console.error(`cloudSet failed for "${key}":`, e);
  }
}

// يضيف عنصراً جديداً لقائمة في Firebase بأمان حتى لو كتب شخصان بنفس اللحظة تماماً —
// يستخدم "معاملة" (transaction) حقيقية تعيد المحاولة تلقائياً لو تغيّرت البيانات أثناء الكتابة،
// بدل قراءة القائمة ثم استبدالها كاملة (كان يسبب ضياع عنصر لو حصل تزامن، لاحظناه فعلياً بالإنتاج).
// يرجّع true لو نجح الحفظ فعلياً بالسحابة، false لو فشل (مثلاً بدون إنترنت) — لازم يُتحقق منها قبل قول "تم" للمستخدم
export async function cloudPush<T>(key: string, item: T): Promise<boolean> {
  try {
    await withTimeout(ensureSignedIn(), CLOUD_WRITE_TIMEOUT_MS, "cloudPush sign-in");
    const result = await withTimeout(
      runTransaction(ref(db, key), (current: T[] | null) => {
        const arr = Array.isArray(current) ? current : [];
        return [...arr, item];
      }),
      CLOUD_WRITE_TIMEOUT_MS,
      "cloudPush"
    );
    return result.committed;
  } catch (e) {
    console.error(`cloudPush failed for "${key}":`, e);
    return false;
  }
}

// يعدّل قيمة موجودة في Firebase بأمان عبر دالة تحويل، مع إعادة محاولة تلقائية لو تغيّرت البيانات
// أثناء الكتابة (مفيد لتعديلات متزامنة من عدة أجهزة بنفس اللحظة، مثل إضافة مداخلة نقاش باجتماع).
// إرجاع "undefined" من updateFn يُلغي المعاملة بأمان بدون أي كتابة (بدل الاضطرار لتلفيق قيمة
// وهمية) — استخدمه لو current كان null ولا فيه شي منطقي تكتبه؛ لا تُرجع null أبداً هنا، لأن
// فايربيز يتعامل مع null كأمر "احذف هذا المسار" فعلياً، لا "لا تفعل شيء".
export async function cloudTransact<T>(key: string, updateFn: (current: T | null) => T | undefined): Promise<boolean> {
  try {
    await withTimeout(ensureSignedIn(), CLOUD_WRITE_TIMEOUT_MS, "cloudTransact sign-in");
    const result = await withTimeout(
      runTransaction(ref(db, key), (current: T | null) => updateFn(current)),
      CLOUD_WRITE_TIMEOUT_MS,
      "cloudTransact"
    );
    return result.committed;
  } catch (e) {
    console.error(`cloudTransact failed for "${key}":`, e);
    return false;
  }
}

// احتياطي غير مستخدم حالياً لكن متاح لو احتجنا مفاتيح فريدة لاحقاً
export function cloudPushKey(key: string): string | null {
  return dbPush(ref(db, key)).key;
}

// يراقب مفتاحاً بشكل مباشر (Realtime) — أي تغيير من أي جهاز يوصل فوراً بدون تحديث الصفحة.
// يرجّع دالة إلغاء الاشتراك، استدعها عند إزالة المكوّن (useEffect cleanup).
//
// طبقة حماية إضافية (سفاري تحديداً): لو تسجيل الدخول أو اتصال الـWebSocket الحي تعطّل بصمت ولا
// وصلت أي بيانات إطلاقاً، الصفحات المستهلكة (بوابة المنسّق/الطالب...) كانت تفضل بحالتها الابتدائية
// الفاضية للأبد بدون أي خطأ ظاهر — نفس شكل "المنصة ما تفتح". الحل: قراءة احتياطية (cloudGet، ولها
// حدها الزمني الخاص أصلاً) خلال 10 ثوانٍ لو ما وصلت قيمة حية بعد، ثم كل 20 ثانية كطبقة أمان دائمة
// تُبقي البيانات محدَّثة حتى لو الاتصال الحي معطوب كلياً طوال الجلسة.
export function cloudListen<T>(key: string, callback: (data: T | null) => void): () => void {
  const r = ref(db, key);
  let cancelled = false;
  let unsubscribe: (() => void) | null = null;
  let gotLiveValue = false;

  const fallbackPoll = () => {
    cloudGet<T>(key).then(data => { if (!cancelled) callback(data); });
  };

  ensureSignedIn()
    .then(() => {
      if (cancelled) return;
      const handler = (snap: DataSnapshot) => {
        gotLiveValue = true;
        callback(snap.exists() ? (snap.val() as T) : null);
      };
      onValue(r, handler, (e) => {
        console.error(`cloudListen failed for "${key}":`, e);
        fallbackPoll();
      });
      unsubscribe = () => off(r, "value", handler);
    })
    .catch((e) => {
      console.error(`cloudListen sign-in failed for "${key}":`, e);
      fallbackPoll();
    });

  const watchdog = setTimeout(() => { if (!cancelled && !gotLiveValue) fallbackPoll(); }, 10000);
  const pollTimer = setInterval(() => { if (!cancelled) fallbackPoll(); }, 20000);

  return () => {
    cancelled = true;
    clearTimeout(watchdog);
    clearInterval(pollTimer);
    if (unsubscribe) unsubscribe();
  };
}

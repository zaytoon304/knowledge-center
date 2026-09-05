import { ref, get, set, push as dbPush, onValue, off, runTransaction, type DataSnapshot } from "firebase/database";
import { db, ensureSignedIn } from "./firebase";

// اتصال Firebase أحياناً يعلق بلا نهاية على بعض المتصفحات/الشبكات (لاحظنا هذا فعلياً بسفاري) —
// بدون هذا الحد الزمني، أي زر "تحديث" ينتظر السحابة يبقى عالقاً للأبد بلا أي رسالة خطأ للمستخدم.
const CLOUD_GET_TIMEOUT_MS = 12000;

export async function cloudGet<T>(key: string): Promise<T | null> {
  try {
    await ensureSignedIn();
    const snap = await Promise.race([
      get(ref(db, key)),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("cloudGet timeout")), CLOUD_GET_TIMEOUT_MS)),
    ]);
    return snap.exists() ? (snap.val() as T) : null;
  } catch (e) {
    console.error(`cloudGet failed for "${key}":`, e);
    return null;
  }
}

export async function cloudSet(key: string, data: unknown): Promise<void> {
  try {
    await ensureSignedIn();
    await set(ref(db, key), data);
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
    await ensureSignedIn();
    const result = await runTransaction(ref(db, key), (current: T[] | null) => {
      const arr = Array.isArray(current) ? current : [];
      return [...arr, item];
    });
    return result.committed;
  } catch (e) {
    console.error(`cloudPush failed for "${key}":`, e);
    return false;
  }
}

// يعدّل قيمة موجودة في Firebase بأمان عبر دالة تحويل، مع إعادة محاولة تلقائية لو تغيّرت البيانات
// أثناء الكتابة (مفيد لتعديلات متزامنة من عدة أجهزة بنفس اللحظة، مثل إضافة مداخلة نقاش باجتماع).
export async function cloudTransact<T>(key: string, updateFn: (current: T | null) => T): Promise<boolean> {
  try {
    await ensureSignedIn();
    const result = await runTransaction(ref(db, key), (current: T | null) => updateFn(current));
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
export function cloudListen<T>(key: string, callback: (data: T | null) => void): () => void {
  const r = ref(db, key);
  let cancelled = false;
  let unsubscribe: (() => void) | null = null;
  ensureSignedIn()
    .then(() => {
      if (cancelled) return;
      const handler = (snap: DataSnapshot) => callback(snap.exists() ? (snap.val() as T) : null);
      onValue(r, handler, (e) => console.error(`cloudListen failed for "${key}":`, e));
      unsubscribe = () => off(r, "value", handler);
    })
    .catch((e) => console.error(`cloudListen sign-in failed for "${key}":`, e));
  return () => { cancelled = true; if (unsubscribe) unsubscribe(); };
}

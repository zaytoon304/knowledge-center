import { ref, get, set, push as dbPush, onValue, off, type DataSnapshot } from "firebase/database";
import { db, ensureSignedIn } from "./firebase";

export async function cloudGet<T>(key: string): Promise<T | null> {
  try {
    await ensureSignedIn();
    const snap = await get(ref(db, key));
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

// يجلب القائمة الحالية من Firebase ثم يضيف العنصر الجديد بدون حذف الباقين
// يرجّع true لو نجح الحفظ فعلياً بالسحابة، false لو فشل (مثلاً بدون إنترنت) — لازم يُتحقق منها قبل قول "تم" للمستخدم
export async function cloudPush<T>(key: string, item: T): Promise<boolean> {
  try {
    await ensureSignedIn();
    const existing = await cloudGet<T[]>(key);
    const arr = Array.isArray(existing) ? existing : [];
    await set(ref(db, key), [...arr, item]);
    return true;
  } catch (e) {
    console.error(`cloudPush failed for "${key}":`, e);
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

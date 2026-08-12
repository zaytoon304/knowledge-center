import { ref, get, set, push as dbPush } from "firebase/database";
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
export async function cloudPush<T>(key: string, item: T): Promise<void> {
  try {
    await ensureSignedIn();
    const existing = await cloudGet<T[]>(key);
    const arr = Array.isArray(existing) ? existing : [];
    await set(ref(db, key), [...arr, item]);
  } catch (e) {
    console.error(`cloudPush failed for "${key}":`, e);
  }
}

// احتياطي غير مستخدم حالياً لكن متاح لو احتجنا مفاتيح فريدة لاحقاً
export function cloudPushKey(key: string): string | null {
  return dbPush(ref(db, key)).key;
}

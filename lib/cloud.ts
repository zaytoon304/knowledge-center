const DB = "https://arqam-center-default-rtdb.firebaseio.com";

export async function cloudGet<T>(key: string): Promise<T | null> {
  try {
    const res = await fetch(`${DB}/${key}.json`);
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch { return null; }
}

export async function cloudSet(key: string, data: unknown): Promise<void> {
  try {
    await fetch(`${DB}/${key}.json`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch {}
}

// يجلب القائمة الحالية من Firebase ثم يضيف العنصر الجديد بدون حذف الباقين
export async function cloudPush<T>(key: string, item: T): Promise<void> {
  const existing = await cloudGet<T[]>(key);
  const arr = Array.isArray(existing) ? existing : [];
  await cloudSet(key, [...arr, item]);
}

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

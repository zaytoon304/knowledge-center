import { cloudGet, cloudTransact } from "./cloud";

// ملاحظات المتابعة (منسّقين وطلاب) — كانت محلية فقط بدون أي مزامنة سحابية،
// فلا تظهر الملاحظة إلا على نفس الجهاز اللي كُتبت منه. صارت تُقرأ وتُكتب من Firebase مباشرة.
export async function getNotes(key: string): Promise<string[]> {
  const cloud = await cloudGet<string[]>(key);
  return Array.isArray(cloud) ? cloud : [];
}

export async function addNote(key: string, text: string): Promise<string[] | null> {
  const entry = `${new Date().toLocaleDateString("ar-SA")} — ${text}`;
  let result: string[] = [];
  const ok = await cloudTransact<string[]>(key, current => {
    result = [...(Array.isArray(current) ? current : []), entry];
    return result;
  });
  return ok ? result : null;
}

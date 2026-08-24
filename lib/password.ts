// تشفير كلمات المرور (بدل حفظها كنص عادي بقاعدة البيانات) — PBKDF2 عبر Web Crypto API
// المتاحة أصلاً بالمتصفح، بدون أي مكتبة خارجية إضافية.
const ITERATIONS = 100000;

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
}
function hexToBytes(hex: string): Uint8Array {
  const arr = new Uint8Array(hex.length / 2);
  for (let i = 0; i < arr.length; i++) arr[i] = parseInt(hex.substr(i * 2, 2), 16);
  return arr;
}

async function deriveHex(password: string, salt: Uint8Array, iterations: number): Promise<string> {
  const keyMaterial = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: salt as BufferSource, iterations, hash: "SHA-256" }, keyMaterial, 256);
  return bytesToHex(new Uint8Array(bits));
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await deriveHex(password, salt, ITERATIONS);
  return `pbkdf2$${ITERATIONS}$${bytesToHex(salt)}$${hash}`;
}

export function isHashed(stored: string): boolean {
  return stored.startsWith("pbkdf2$");
}

// يقارن كلمة مرور مُدخلة بالقيمة المخزّنة — يدعم الحسابات القديمة المخزّنة كنص عادي (قبل هذا
// التحديث) بمقارنة مباشرة، والحسابات الجديدة/المُهجَّرة بفك التشفير والمقارنة. القيمة القديمة
// تُستبدل تلقائياً بأول دخول ناجح (راجع login/loginCoordinator بـ AuthContext.tsx).
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  if (!stored) return false;
  if (!isHashed(stored)) return password === stored;
  const parts = stored.split("$");
  if (parts.length !== 4) return false;
  const [, iterStr, saltHex, hashHex] = parts;
  const computed = await deriveHex(password, hexToBytes(saltHex), parseInt(iterStr, 10));
  return computed === hashHex;
}

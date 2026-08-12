// نظام رمز الجهاز + رمز الدخول للطلاب — نفس آلية أكاديمية زيتون بالضبط:
// كل جهاز يولّد رمز هوية ثابت (6 أحرف)، محمد يستخدمه ليولّد رمز دخول
// موقّع بهاش (بدون سيرفر)، الطالب يدخل الرمز فيتحقق منه الجهاز محلياً.

const DEVICE_KEY = "kc_device_id";
const ACCESS_KEY = "kc_device_access";
const SALT = "ArqamKnowledgeCenter_SecureKey_2026_ar";
const CHARS = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"; // بدون I/L/O/U لتفادي التشابه

function hash(str: string): string {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h).toString(36).toUpperCase().padStart(6, "0").slice(0, 6);
}

export function getDeviceId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    const arr = new Uint8Array(6);
    crypto.getRandomValues(arr);
    id = Array.from(arr).map(b => CHARS[b % CHARS.length]).join("");
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

// expiryDate: تاريخ انتهاء الوصول
export function generateAccessCode(deviceId: string, expiryDate: Date): string {
  const hours = Math.floor(expiryDate.getTime() / 3600000);
  const expStr = hours.toString(36).toUpperCase().padStart(7, "0");
  const h = hash(expStr + deviceId.trim().toUpperCase() + SALT);
  return `ARQAM-${expStr}-${h}`;
}

// يُعيد: null (خطأ) | "expired" | "wrong-device" | رقم انتهاء الصلاحية (ms)
export function validateAccessCode(raw: string, deviceId: string): null | "expired" | "wrong-device" | number {
  const code = (raw || "").trim().toUpperCase().replace(/\s+/g, "");
  const parts = code.split("-");
  if (parts.length !== 3 || parts[0] !== "ARQAM") return null;
  const [, expStr, hashGot] = parts;
  const hashExpected = hash(expStr + deviceId.trim().toUpperCase() + SALT);
  if (hashGot !== hashExpected) return "wrong-device";
  const hours = parseInt(expStr, 36);
  if (isNaN(hours)) return null;
  const expiry = hours * 3600000;
  return Date.now() > expiry ? "expired" : expiry;
}

export function grantAccess(expiry: number) {
  localStorage.setItem(ACCESS_KEY, JSON.stringify({ expiry, grantedAt: Date.now() }));
}

export function hasAccess(): boolean {
  try {
    const raw = localStorage.getItem(ACCESS_KEY);
    if (!raw) return false;
    const d = JSON.parse(raw);
    return !!d.expiry && Date.now() < d.expiry;
  } catch { return false; }
}

export function revokeAccess() {
  localStorage.removeItem(ACCESS_KEY);
}

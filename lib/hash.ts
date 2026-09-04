// هاش أحادي الاتجاه (SHA-256) عبر Web Crypto API الأصلية — بدون مكتبة خارجية.
// يُستخدم لبناء فهرس بحث عام (مثل رقم الهوية) بدون كشف القيمة الأصلية لأي قارئ للفهرس،
// مع تنويه: هاش وحده لقيمة قصيرة (10 أرقام) قابل نظرياً لكسر القوة الغاشمة من مهاجم
// محترف يملك تفريغاً كاملاً للفهرس — الحماية الحقيقية هي إخفاء البيانات نفسها (الاسم/الجوال)
// خلف قاعدة أمان، لا الاعتماد الكامل على الهاش وحده.
export async function sha256Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, "0")).join("");
}

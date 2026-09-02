export const ADMIN_WHATSAPP = "966583492250";

export function whatsappLink(message: string): string {
  return `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(message)}`;
}

// يحوّل رقم سعودي محلي (05xxxxxxxx أو 5xxxxxxxx) لصيغة دولية (966...) قبل بناء رابط واتساب
// موجّه لرقم مختلف عن رقم الإدارة — يتجاهل أي رمز/مسافات غير أرقام بالرقم المدخل. بعض الأرقام
// المُدخلة محلياً بأرقام عربية هندية (٠-٩) لا اللاتينية، فنحوّلها أولاً وإلا \D يحذفها بالكامل
export function whatsappLinkTo(phone: string, message: string): string {
  const arabicToLatin = phone.replace(/[٠-٩]/g, d => String(d.charCodeAt(0) - 0x0660));
  const digits = arabicToLatin.replace(/\D/g, "");
  const normalized = digits.startsWith("966") ? digits : digits.startsWith("0") ? `966${digits.slice(1)}` : `966${digits}`;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

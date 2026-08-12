export const ADMIN_WHATSAPP = "966583492250";

export function whatsappLink(message: string): string {
  return `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(message)}`;
}

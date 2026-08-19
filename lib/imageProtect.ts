import type { SyntheticEvent } from "react";

// رادع بسيط ضد تحميل الصور والمستندات — تعطيل الزر اليمين والسحب، بدون منع فتح
// الصور بالعارض (lightbox) اللي أصلاً تعتمد على onClick. لا يمنع لقطة الشاشة (مستحيل تقنياً)
// لكنه يوقف "حفظ الصورة باسم..." والسحب المباشر للسطح المكتب.
export const noDownloadProps = {
  onContextMenu: (e: SyntheticEvent) => e.preventDefault(),
  draggable: false,
};

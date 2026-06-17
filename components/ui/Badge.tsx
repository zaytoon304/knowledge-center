import clsx from "clsx";

const variants: Record<string, string> = {
  blue: "bg-blue-100 text-blue-700",
  purple: "bg-purple-100 text-purple-700",
  green: "bg-green-100 text-green-700",
  yellow: "bg-yellow-100 text-yellow-700",
  red: "bg-red-100 text-red-700",
  orange: "bg-orange-100 text-orange-700",
  teal: "bg-teal-100 text-teal-700",
  gray: "bg-gray-100 text-gray-700",
  gold: "bg-yellow-50 text-yellow-600 border border-yellow-200",
};

const statusVariants: Record<string, string> = {
  "فائز": "bg-yellow-100 text-yellow-700",
  "مكتمل": "bg-green-100 text-green-700",
  "قيد التنفيذ": "bg-blue-100 text-blue-700",
  "مشارك في مسابقة": "bg-purple-100 text-purple-700",
  "فكرة": "bg-gray-100 text-gray-600",
  "مفتوح": "bg-green-100 text-green-700",
  "مغلق": "bg-red-100 text-red-700",
  "قادم": "bg-blue-100 text-blue-700",
  "منتهي": "bg-gray-100 text-gray-600",
  "جارية": "bg-blue-100 text-blue-700",
  "منتهية": "bg-gray-100 text-gray-600",
  "قادمة": "bg-purple-100 text-purple-700",
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: string;
  className?: string;
}

export default function Badge({ children, variant, className }: BadgeProps) {
  const text = String(children);
  const colorClass = variant
    ? variants[variant] ?? variants.gray
    : statusVariants[text] ?? variants.gray;

  return (
    <span className={clsx("badge text-xs font-semibold", colorClass, className)}>
      {children}
    </span>
  );
}

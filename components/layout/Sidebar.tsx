"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, BookOpen, Layers, FolderOpen, GraduationCap,
  BarChart3, Cpu, Bot, UserSquare, Trophy, Users,
  Archive, Settings, ChevronLeft, Sparkles, X
} from "lucide-react";
import clsx from "clsx";

const navItems = [
  { href: "/", label: "الرئيسية", icon: Home },
  { href: "/knowledge", label: "مركز المعرفة", icon: BookOpen },
  { href: "/programs", label: "مركز البرامج", icon: Layers },
  { href: "/projects", label: "مركز المشاريع", icon: FolderOpen },
  { href: "/training", label: "مركز التدريب", icon: GraduationCap },
  { href: "/indicators", label: "مركز المؤشرات", icon: BarChart3 },
  { href: "/emerging-tech", label: "التقنيات الناشئة", icon: Cpu },
  { href: "/ai-assistant", label: "المساعد الذكي", icon: Bot },
  { href: "/portfolio", label: "الملف المهني", icon: UserSquare },
  { href: "/competitions", label: "المسابقات والجوائز", icon: Trophy },
  { href: "/student-portal", label: "بوابة الطلاب", icon: Users },
  { href: "/project-bank", label: "بنك المشاريع", icon: Archive },
  { href: "/admin", label: "لوحة الإدارة", icon: Settings },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={onClose} />
      )}

      <aside className={clsx("sidebar", isOpen ? "open" : "")}>
        {/* Logo */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-7 h-7 text-yellow-300" />
              </div>
              <div>
                <div className="text-white font-bold text-base leading-tight">مركز المعرفة والابتكار</div>
                <div className="text-blue-200 text-sm">بمدارس الأرق</div>
              </div>
            </div>
            <button onClick={onClose} className="md:hidden text-white/70 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                  isActive
                    ? "bg-white/20 text-white shadow-sm"
                    : "text-blue-100 hover:bg-white/10 hover:text-white"
                )}
              >
                <Icon className={clsx("w-5 h-5 flex-shrink-0", isActive ? "text-yellow-300" : "text-blue-200 group-hover:text-white")} />
                <span className="text-base font-medium">{item.label}</span>
                {isActive && <ChevronLeft className="w-4 h-4 mr-auto text-yellow-300" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <div className="text-center text-blue-200 text-sm">
            مدارس الأرق
          </div>
          <div className="text-center text-blue-300 text-xs mt-1">
            وحدة الموهبة والابتكار • 2025
          </div>
        </div>
      </aside>
    </>
  );
}

"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home, BookOpen, Layers, FolderOpen, GraduationCap,
  BarChart3, Cpu, Bot, UserSquare, Trophy, Users,
  Archive, Settings, ChevronLeft, Sparkles, X, LogOut, LogIn, Briefcase, Eye
} from "lucide-react";
import clsx from "clsx";
import { useAuth } from "@/contexts/AuthContext";

const adminNavItems = [
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

const studentNavItems = [
  { href: "/student-portal", label: "بوابتي", icon: Users },
];

const coordinatorNavItems = [
  { href: "/coordinator-portal", label: "بوابتي", icon: Briefcase },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  studentMode?: boolean;
  coordinatorMode?: boolean;
}

export default function Sidebar({ isOpen, onClose, studentMode = false, coordinatorMode = false }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isLoggedIn } = useAuth();
  const navItems = studentMode ? studentNavItems : coordinatorMode ? coordinatorNavItems : adminNavItems;

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
                <div className="text-white font-bold text-base leading-tight">مركز المعرفة والابتكار STEAM</div>
                <div className="text-blue-200 text-sm">بمدارس الأرقم</div>
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
          {isLoggedIn && user ? (
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-full overflow-hidden bg-white/20 flex-shrink-0 flex items-center justify-center text-white text-sm font-bold">
                {user.photo ? <img src={user.photo} alt="" className="w-full h-full object-cover" /> : user.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-semibold truncate">{user.name}</p>
                <p className="text-blue-300 text-xs truncate">{user.school}</p>
              </div>
              <button onClick={() => { logout(); router.push("/login"); }} className="text-blue-300 hover:text-red-300 transition-colors" title="تسجيل الخروج">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5 mb-3">
              <Link href="/login" onClick={onClose} className="flex items-center gap-2 text-blue-200 hover:text-white transition-colors">
                <LogIn className="w-4 h-4" /><span className="text-sm">تسجيل الدخول</span>
              </Link>
              <Link href="/visitor" onClick={onClose} className="flex items-center gap-2 text-blue-300 hover:text-white transition-colors">
                <Eye className="w-4 h-4" /><span className="text-sm">تصفح كزائر</span>
              </Link>
            </div>
          )}
          <div className="text-center text-blue-200 text-sm">
            مدارس الأرقم
          </div>
          <div className="text-center text-blue-300 text-xs mt-1">
            وحدة الموهبة والابتكار • 2025
          </div>
        </div>
      </aside>
    </>
  );
}

"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import {
  Home, BookOpen, Layers, FolderOpen, GraduationCap,
  BarChart3, Cpu, Bot, UserSquare, Trophy, Users,
  Archive, Settings, X, LogOut, LogIn, Briefcase, CalendarDays,
  MessageSquare, Video, ChevronLeft, Eye, Award, Medal, Kanban, Baby, Contact, QrCode, Radio, PenLine, Gamepad2, Brain, Sparkles, Images, Lightbulb
} from "lucide-react";
import clsx from "clsx";
import { useAuth, CoordinatorProfile } from "@/contexts/AuthContext";
import { cloudListen } from "@/lib/cloud";
import CenterLogo from "@/components/icons/CenterLogo";

// صوت تنبيه بسيط عند وصول ملاحظة جديدة من الإدارة — بدون أي ملف صوتي خارجي، يشتغل بأي صفحة بالمنصة
function playNotificationBeep() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch { /* المتصفح ما يدعم الصوت — تجاهل بصمت */ }
}

const adminNavItems = [
  { href: "/", label: "الرئيسية", icon: Home },
  { href: "/knowledge", label: "مركز المعرفة", icon: BookOpen },
  { href: "/lets-learn", label: "هيا نتعلم", icon: Lightbulb },
  { href: "/programs", label: "مركز البرامج", icon: Layers },
  { href: "/projects", label: "مركز المشاريع", icon: FolderOpen },
  { href: "/live", label: "البث المباشر", icon: Radio },
  { href: "/training", label: "مركز التدريب", icon: GraduationCap },
  { href: "/whiteboard", label: "السبورة الذكية", icon: PenLine },
  { href: "/play", label: "نلعب ونتعلم", icon: Gamepad2 },
  { href: "/iq-test", label: "اختبار الذكاء IQ", icon: Brain },
  { href: "/indicators", label: "مركز المؤشرات", icon: BarChart3 },
  { href: "/emerging-tech", label: "التقنيات الناشئة", icon: Cpu },
  { href: "/ai-assistant", label: "المساعد الذكي", icon: Bot },
  { href: "/portfolio", label: "الملف المهني", icon: UserSquare },
  { href: "/competitions", label: "المسابقات والجوائز", icon: Trophy },
  { href: "/student-portal", label: "بوابة الطلاب", icon: Users },
  { href: "/project-bank", label: "بنك المشاريع", icon: Archive },
  { href: "/daily-log", label: "يوميات المركز", icon: CalendarDays },
  { href: "/groups", label: "الجروبات", icon: MessageSquare },
  { href: "/meetings", label: "الاجتماعات", icon: Video },
  { href: "/project-tracking", label: "متابعة المشاريع", icon: Kanban },
  { href: "/leaderboard", label: "لوحة المتصدرين", icon: Medal },
  { href: "/certificates", label: "الشهادات الرقمية", icon: Award },
  { href: "/parent-portal", label: "بوابة الأولياء", icon: Baby },
  { href: "/gallery", label: "أرشيف المركز", icon: Images },
  { href: "/supervisor", label: "الملف الشخصي", icon: Contact },
  { href: "/platform-qr", label: "باركود المنصة", icon: QrCode },
  { href: "/admin", label: "لوحة الإدارة", icon: Settings },
];

const studentNavItems = [
  { href: "/student-portal", label: "بوابتي", icon: Users },
  { href: "/talent-test", label: "اختبار مهارات التفكير العليا", icon: Sparkles },
  { href: "/lets-learn", label: "هيا نتعلم", icon: Lightbulb },
  { href: "/gallery", label: "أرشيف المركز", icon: Images },
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
  const isSupervisor = isLoggedIn && (user as CoordinatorProfile)?.isSupervisor;

  // تنبيه صوتي فوري لأي منسّق لما تصله ملاحظة متابعة جديدة من الإدارة، بأي صفحة يكون فاتحها
  const firstNotesLoad = useRef(true);
  useEffect(() => {
    firstNotesLoad.current = true;
    if (!isLoggedIn || user?.role !== "coordinator") return;
    const unsub = cloudListen<string[]>(`kc_cnotes_${user.id}`, data => {
      const count = Array.isArray(data) ? data.length : 0;
      if (!firstNotesLoad.current) {
        const prev = Number(sessionStorage.getItem("kc_last_note_count") || "0");
        if (count > prev) playNotificationBeep();
      }
      firstNotesLoad.current = false;
      sessionStorage.setItem("kc_last_note_count", String(count));
    });
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, user?.id]);

  const navItems = studentMode
    ? studentNavItems
    : coordinatorMode
    ? [
        coordinatorNavItems[0],
        ...(isSupervisor ? [{ href: "/oversight", label: "متابعة المنسقين والطلاب", icon: Eye }] : []),
        ...adminNavItems.filter(i => i.href !== "/admin"),
      ]
    : adminNavItems;

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={onClose} />
      )}

      <aside className={clsx("sidebar", isOpen ? "open" : "")}>
        {/* Logo */}
        <div className="px-3 pt-3 pb-3 border-b border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-yellow-300 text-xs font-bold tracking-wide">مركز المعرفة والابتكار STEAM</span>
            <button onClick={onClose} className="md:hidden text-white/70 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex justify-center">
            <div className="bg-white rounded-2xl px-3 py-2 shadow-lg">
              <img
                src="/arqam-logo.png"
                alt="شعار مدارس الأرقم"
                className="w-44 object-contain"
              />
            </div>
          </div>
        </div>

        {/* Navigation — قابل للتمرير */}
        <div className="sidebar-nav">
          <nav className="p-3 space-y-1 pb-4">
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
                  <span className="text-sm font-medium">{item.label}</span>
                  {isActive && <ChevronLeft className="w-4 h-4 mr-auto text-yellow-300" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer — ثابت في الأسفل */}
        <div className="sidebar-footer p-4">
          {isLoggedIn && user ? (
            <div className="flex items-center gap-2 mb-2">
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
            <div className="flex gap-3 mb-2">
              <Link href="/login" onClick={onClose} className="flex items-center gap-1.5 text-blue-200 hover:text-white transition-colors text-xs">
                <LogIn className="w-4 h-4" /> دخول
              </Link>
              <Link href="/visitor" onClick={onClose} className="flex items-center gap-1.5 text-blue-300 hover:text-white transition-colors text-xs">
                <Eye className="w-4 h-4" /> زائر
              </Link>
            </div>
          )}
          <div className="text-center text-blue-300 text-xs">
            وحدة الموهبة والابتكار • 2025
          </div>
        </div>
      </aside>
    </>
  );
}

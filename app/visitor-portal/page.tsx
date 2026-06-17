"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Globe, GraduationCap, ShoppingBag, Rss, LogOut, CheckCircle, CalendarDays, Eye } from "lucide-react";

interface VisitorSession {
  id: string; name: string; phone: string; email: string;
  purpose: "courses" | "shop" | "activities";
  purposeLabel: string;
  status: "approved";
}

const SECTION_MAP: Record<string, { href: string; label: string; desc: string; icon: typeof Globe; gradient: string }[]> = {
  courses: [
    { href: "/training", label: "مركز التدريب", desc: "الدورات والبرامج التدريبية", icon: GraduationCap, gradient: "from-green-600 to-teal-400" },
    { href: "/programs", label: "مركز البرامج", desc: "الموهبة والابتكار وSTEAM", icon: GraduationCap, gradient: "from-purple-600 to-purple-400" },
  ],
  shop: [
    { href: "/project-bank", label: "بنك المشاريع", desc: "أفكار ومستلزمات المشاريع", icon: ShoppingBag, gradient: "from-amber-500 to-yellow-400" },
    { href: "/emerging-tech", label: "التقنيات الناشئة", desc: "أدوات وتقنيات متاحة", icon: ShoppingBag, gradient: "from-cyan-600 to-sky-400" },
  ],
  activities: [
    { href: "/daily-log", label: "يوميات المركز", desc: "أنشطة وفعاليات المركز", icon: CalendarDays, gradient: "from-indigo-700 to-blue-500" },
    { href: "/competitions", label: "المسابقات والجوائز", desc: "الفعاليات والبطولات", icon: Rss, gradient: "from-yellow-500 to-amber-400" },
    { href: "/knowledge", label: "مركز المعرفة", desc: "الموارد التعليمية المتاحة", icon: Rss, gradient: "from-blue-600 to-blue-400" },
  ],
};

const PURPOSE_LABELS: Record<string, string> = {
  courses: "الالتحاق بالدورات التدريبية",
  shop: "تصفح المتجر والشراء",
  activities: "متابعة أنشطة المركز",
};

const PURPOSE_EMOJIS: Record<string, string> = { courses: "🎓", shop: "🛍️", activities: "📰" };

export default function VisitorPortalPage() {
  const router = useRouter();
  const [visitor, setVisitor] = useState<VisitorSession | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("kc_visitor_session");
      if (!raw) { router.push("/login"); return; }
      const v = JSON.parse(raw);
      if (v.status !== "approved") { router.push("/login"); return; }
      setVisitor(v);
    } catch { router.push("/login"); }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("kc_visitor_session");
    router.push("/");
  };

  if (!visitor) return (
    <div className="flex items-center justify-center min-h-[60vh] text-gray-400 text-sm">
      جارٍ التحقق...
    </div>
  );

  const sections = SECTION_MAP[visitor.purpose] || [];

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">

      {/* Header */}
      <div className="bg-gradient-to-l from-teal-800 to-cyan-700 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">
              {PURPOSE_EMOJIS[visitor.purpose]}
            </div>
            <div>
              <p className="text-teal-200 text-xs mb-0.5">مرحباً، زائر معتمد</p>
              <h1 className="text-xl font-bold">{visitor.name}</h1>
              <p className="text-teal-200 text-sm mt-0.5">{PURPOSE_LABELS[visitor.purpose]}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 px-3 py-2 rounded-xl text-sm transition-colors">
            <LogOut className="w-4 h-4" /> خروج
          </button>
        </div>
        <div className="mt-4 flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
          <CheckCircle className="w-4 h-4 text-green-300 flex-shrink-0" />
          <p className="text-sm text-white/90">تم اعتماد حسابك — يمكنك الوصول للأقسام المخصصة لك</p>
        </div>
      </div>

      {/* Allowed Sections */}
      <div>
        <h2 className="text-base font-bold text-gray-700 mb-3 flex items-center gap-2">
          <Globe className="w-4 h-4 text-teal-600" /> الأقسام المتاحة لك
        </h2>
        <div className="grid grid-cols-1 gap-3">
          {sections.map(s => {
            const Icon = s.icon;
            return (
              <Link key={s.href} href={s.href}
                className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-teal-200 transition-all group">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">{s.label}</h3>
                  <p className="text-sm text-gray-500">{s.desc}</p>
                </div>
                <div className="text-teal-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  دخول ←
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* General sections always available */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 mb-2 flex items-center gap-2">
          <Eye className="w-4 h-4" /> متاح للجميع
        </h2>
        <div className="grid grid-cols-2 gap-2">
          <Link href="/daily-log"
            className="flex items-center gap-2 bg-white rounded-xl p-3 border border-gray-100 hover:border-teal-200 transition-all text-sm">
            <CalendarDays className="w-4 h-4 text-indigo-500" />
            <span className="font-medium text-gray-700">يوميات المركز</span>
          </Link>
          <Link href="/visitor"
            className="flex items-center gap-2 bg-white rounded-xl p-3 border border-gray-100 hover:border-teal-200 transition-all text-sm">
            <Globe className="w-4 h-4 text-teal-500" />
            <span className="font-medium text-gray-700">تصفح عام</span>
          </Link>
        </div>
      </div>

      {/* Info note */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-500 text-center">
        لتوسيع صلاحياتك أو الاستفسار، تواصل مع إدارة المركز
      </div>
    </div>
  );
}

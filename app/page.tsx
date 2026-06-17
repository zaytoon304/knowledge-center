"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen, Layers, FolderOpen, GraduationCap, BarChart3,
  Cpu, Bot, UserSquare, Trophy, Users, Archive, Settings,
  Sparkles, CalendarDays, Eye, ChevronLeft, Briefcase
} from "lucide-react";

const sections = [
  { href: "/knowledge", label: "مركز المعرفة", desc: "الأدلة، النماذج، السياسات", icon: BookOpen, gradient: "from-blue-600 to-blue-400" },
  { href: "/programs", label: "مركز البرامج", desc: "الموهبة، الابتكار، STEAM", icon: Layers, gradient: "from-purple-600 to-purple-400" },
  { href: "/projects", label: "مركز المشاريع", desc: "مشاريع الطلاب والمعلمين", icon: FolderOpen, gradient: "from-indigo-600 to-indigo-400" },
  { href: "/training", label: "مركز التدريب", desc: "الدورات والشهادات", icon: GraduationCap, gradient: "from-green-600 to-teal-400" },
  { href: "/indicators", label: "مركز المؤشرات", desc: "لوحة KPI والتقارير", icon: BarChart3, gradient: "from-orange-600 to-yellow-400" },
  { href: "/emerging-tech", label: "التقنيات الناشئة", desc: "AI، IoT، الروبوت، AR", icon: Cpu, gradient: "from-cyan-600 to-sky-400" },
  { href: "/ai-assistant", label: "المساعد الذكي", desc: "اقتراح أفكار ودعم المنسقين", icon: Bot, gradient: "from-violet-600 to-purple-400" },
  { href: "/portfolio", label: "الملف المهني", desc: "السيرة الذاتية والإنجازات", icon: UserSquare, gradient: "from-pink-600 to-rose-400" },
  { href: "/competitions", label: "المسابقات والجوائز", desc: "WRO، بيبراس، كانجارو", icon: Trophy, gradient: "from-yellow-500 to-amber-400" },
  { href: "/student-portal", label: "بوابة الطلاب", desc: "الدورات والمسابقات والملف", icon: Users, gradient: "from-emerald-600 to-green-400" },
  { href: "/project-bank", label: "بنك المشاريع", desc: "أفكار مشاريع جاهزة ومصنفة", icon: Archive, gradient: "from-slate-600 to-gray-400" },
  { href: "/daily-log", label: "يوميات المركز", desc: "أنشطتنا وفعالياتنا اليومية", icon: CalendarDays, gradient: "from-indigo-700 to-blue-500" },
  { href: "/visitor", label: "تصفح كزائر", desc: "المحتوى العام بدون تسجيل", icon: Eye, gradient: "from-teal-600 to-cyan-400" },
  { href: "/admin", label: "لوحة الإدارة", desc: "إدارة المستخدمين والمحتوى", icon: Settings, gradient: "from-red-600 to-rose-400" },
];

function loadCount(key: string): number {
  try { const d = localStorage.getItem(key); return d ? JSON.parse(d).length : 0; } catch { return 0; }
}

export default function HomePage() {
  const [stats, setStats] = useState({ students: 0, coordinators: 0, projects: 0, courses: 0, videos: 0, logEntries: 0 });

  useEffect(() => {
    const allStudents = (() => {
      try { const d = localStorage.getItem("kc_students"); return d ? JSON.parse(d) : []; } catch { return []; }
    })();
    setStats({
      students: allStudents.filter((s: { status: string }) => s.status === "approved").length,
      coordinators: (() => {
        try { const d = localStorage.getItem("kc_coordinators"); return d ? JSON.parse(d).filter((c: { status: string }) => c.status === "approved").length : 0; } catch { return 0; }
      })(),
      projects: loadCount("kc_projects"),
      courses: loadCount("kc_courses"),
      videos: loadCount("kc_videos"),
      logEntries: loadCount("kc_daily_log"),
    });
  }, []);

  const statCards = [
    { label: "طالب مسجّل", value: stats.students, from: "from-emerald-600", to: "to-emerald-400", emoji: "👨‍🎓" },
    { label: "منسق معتمد", value: stats.coordinators, from: "from-blue-600", to: "to-blue-400", emoji: "👨‍🏫" },
    { label: "مشروع", value: stats.projects, from: "from-indigo-600", to: "to-indigo-400", emoji: "💡" },
    { label: "دورة", value: stats.courses, from: "from-purple-600", to: "to-purple-400", emoji: "📚" },
    { label: "فيديو تعليمي", value: stats.videos, from: "from-red-600", to: "to-red-400", emoji: "🎬" },
    { label: "يومية مسجّلة", value: stats.logEntries, from: "from-amber-500", to: "to-amber-300", emoji: "📅" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">

      {/* Hero */}
      <div className="hero-gradient rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
          backgroundSize: "60px 60px"
        }} />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-yellow-300" />
            <span className="text-yellow-300 text-sm font-medium">وحدة الموهبة والابتكار والذكاء الاصطناعي</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-bold leading-tight mb-3">
            مركز المعرفة والابتكار STEAM
            <span className="block text-yellow-300 mt-1">بمدارس الأرقم</span>
          </h1>
          <p className="text-blue-100 text-sm md:text-base leading-relaxed mb-6 max-w-xl">
            منصة موحدة لإدارة البرامج والمشاريع والمسابقات والتدريب، وتمكين الطلاب والمنسقين من أدوات المستقبل.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/coordinator-portal" className="bg-white text-blue-900 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors flex items-center gap-2">
              <Briefcase className="w-4 h-4" /> بوابة المنسقين
            </Link>
            <Link href="/student-portal" className="bg-yellow-400 text-blue-900 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-yellow-300 transition-colors flex items-center gap-2">
              <Users className="w-4 h-4" /> بوابة الطلاب والطالبات
            </Link>
            <Link href="/daily-log" className="bg-white/20 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-white/30 transition-colors flex items-center gap-2">
              <CalendarDays className="w-4 h-4" /> يوميات المركز
            </Link>
            <Link href="/visitor" className="bg-white/10 text-white border border-white/30 px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-white/20 transition-colors flex items-center gap-2">
              <Eye className="w-4 h-4" /> تصفح كزائر
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" /> إحصائيات المنصة
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {statCards.map(s => (
            <div key={s.label} className={`rounded-2xl bg-gradient-to-br ${s.from} ${s.to} p-4 text-white shadow-sm`}>
              <div className="text-3xl mb-2">{s.emoji}</div>
              <div className="text-3xl font-bold leading-none">{s.value}</div>
              <div className="text-white/80 text-xs mt-1.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Sections */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" /> أقسام المنصة
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Link key={section.href} href={section.href} className="card p-5 group cursor-pointer hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${section.gradient} flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-800 text-sm mb-1">{section.label}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{section.desc}</p>
                <div className="mt-3 flex items-center gap-1 text-blue-600 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>استعرض</span><ChevronLeft className="w-3 h-3" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

    </div>
  );
}

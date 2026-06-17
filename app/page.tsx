import Link from "next/link";
import {
  BookOpen, Layers, FolderOpen, GraduationCap, BarChart3,
  Cpu, Bot, UserSquare, Trophy, Users, Archive, Settings,
  Sparkles, ChevronLeft, TrendingUp
} from "lucide-react";
import StatCard from "@/components/ui/StatCard";

const stats = [
  { label: "المشاريع المنفذة", value: 35, icon: <FolderOpen className="w-6 h-6" />, color: "bg-blue-600", trend: "+12%" },
  { label: "الدورات التدريبية", value: 12, icon: <GraduationCap className="w-6 h-6" />, color: "bg-purple-600", trend: "+3%" },
  { label: "المسابقات", value: 8, icon: <Trophy className="w-6 h-6" />, color: "bg-yellow-500", trend: "+2%" },
  { label: "الطلاب المشاركون", value: 120, icon: <Users className="w-6 h-6" />, color: "bg-green-600", trend: "+25%" },
  { label: "المعلمون والمنسقون", value: 18, icon: <UserSquare className="w-6 h-6" />, color: "bg-teal-600", trend: "+4%" },
  { label: "الإنجازات والجوائز", value: 15, icon: <Sparkles className="w-6 h-6" />, color: "bg-orange-500", trend: "+7%" },
];

const sections = [
  { href: "/knowledge", label: "مركز المعرفة", desc: "الأدلة، النماذج، السياسات، الإجراءات", icon: BookOpen, gradient: "from-blue-600 to-blue-400", bg: "bg-blue-50" },
  { href: "/programs", label: "مركز البرامج", desc: "الموهبة، الابتكار، STEAM، الذكاء الاصطناعي، الروبوت", icon: Layers, gradient: "from-purple-600 to-purple-400", bg: "bg-purple-50" },
  { href: "/projects", label: "مركز المشاريع", desc: "مشاريع الطلاب والمعلمين ومعرض المشاريع", icon: FolderOpen, gradient: "from-indigo-600 to-indigo-400", bg: "bg-indigo-50" },
  { href: "/training", label: "مركز التدريب", desc: "الدورات، الحقائب التدريبية، الشهادات، التسجيل", icon: GraduationCap, gradient: "from-green-600 to-teal-400", bg: "bg-green-50" },
  { href: "/indicators", label: "مركز المؤشرات", desc: "لوحة KPI، رسوم بيانية، تقارير الأداء", icon: BarChart3, gradient: "from-orange-600 to-yellow-400", bg: "bg-orange-50" },
  { href: "/emerging-tech", label: "التقنيات الناشئة", desc: "AI، IoT، الروبوت، AR، الطباعة ثلاثية الأبعاد", icon: Cpu, gradient: "from-cyan-600 to-sky-400", bg: "bg-cyan-50" },
  { href: "/ai-assistant", label: "المساعد الذكي", desc: "اقتراح أفكار، توليد نماذج، دعم المنسقين", icon: Bot, gradient: "from-violet-600 to-purple-400", bg: "bg-violet-50" },
  { href: "/portfolio", label: "الملف المهني", desc: "السيرة الذاتية، الإنجازات، معرض الأعمال", icon: UserSquare, gradient: "from-pink-600 to-rose-400", bg: "bg-pink-50" },
  { href: "/competitions", label: "المسابقات والجوائز", desc: "WRO، RoboRave، بيبراس، كانجارو، هاكاثون", icon: Trophy, gradient: "from-yellow-500 to-amber-400", bg: "bg-yellow-50" },
  { href: "/student-portal", label: "بوابة الطلاب", desc: "الدورات، المسابقات، الإنجازات، ملف الطالب", icon: Users, gradient: "from-emerald-600 to-green-400", bg: "bg-emerald-50" },
  { href: "/project-bank", label: "بنك المشاريع", desc: "أفكار مشاريع جاهزة ومصنفة للتنفيذ", icon: Archive, gradient: "from-slate-600 to-gray-400", bg: "bg-slate-50" },
  { href: "/admin", label: "لوحة الإدارة", desc: "إدارة المستخدمين والصلاحيات والمحتوى", icon: Settings, gradient: "from-red-600 to-rose-400", bg: "bg-red-50" },
];

const recentProjects = [
  { name: "النفق الذكي", school: "ثانوية الملك فهد", status: "فائز", field: "AI" },
  { name: "المزرعة الذكية", school: "متوسطة الأميرة نورة", status: "مشارك", field: "IoT" },
  { name: "الشجرة الذكية", school: "ثانوية الإشراق", status: "فائز", field: "STEAM" },
];

const statusColors: Record<string, string> = {
  "فائز": "bg-yellow-100 text-yellow-700",
  "مشارك": "bg-purple-100 text-purple-700",
  "قيد التنفيذ": "bg-blue-100 text-blue-700",
};

export default function HomePage() {
  return (
    <div className="space-y-8 animate-fade-in">

      {/* Hero */}
      <div className="hero-gradient rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
          backgroundSize: "60px 60px"
        }} />
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-yellow-300" />
            <span className="text-yellow-300 text-sm font-medium">وحدة الموهبة والابتكار والذكاء الاصطناعي</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-bold leading-tight mb-4">
            نحو منظومة معرفية وتعليمية
            <span className="block text-yellow-300">مستدامة للموهبة والابتكار</span>
          </h1>
          <p className="text-blue-100 text-base md:text-lg leading-relaxed mb-8">
            منصة موحدة لإدارة البرامج والمشاريع والمسابقات والتدريب والمؤشرات،
            وتمكين الطلاب والمعلمين والمنسقين من أدوات المستقبل.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/programs" className="bg-white text-blue-800 px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-yellow-50 transition-colors flex items-center gap-2">
              <Layers className="w-4 h-4" /> استعرض البرامج
            </Link>
            <Link href="/student-portal" className="bg-yellow-400 text-blue-900 px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-yellow-300 transition-colors flex items-center gap-2">
              <Users className="w-4 h-4" /> بوابة الطلاب
            </Link>
            <Link href="/projects" className="bg-white/20 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-white/30 transition-colors flex items-center gap-2">
              <FolderOpen className="w-4 h-4" /> أضف مشروعاً
            </Link>
            <Link href="/ai-assistant" className="bg-white/10 text-white border border-white/30 px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-white/20 transition-colors flex items-center gap-2">
              <Bot className="w-4 h-4" /> المساعد الذكي
            </Link>
          </div>
        </div>

        {/* Stats overlay */}
        <div className="absolute bottom-6 left-6 hidden md:flex gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-300">92%</div>
            <div className="text-blue-200 text-xs">نسبة إنجاز الخطة</div>
          </div>
          <div className="w-px bg-white/20" />
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-300">6</div>
            <div className="text-blue-200 text-xs">برامج تعليمية</div>
          </div>
          <div className="w-px bg-white/20" />
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-300">2025</div>
            <div className="text-blue-200 text-xs">العام الدراسي</div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          إحصائيات المنصة
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      </div>

      {/* Sections */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          أقسام المنصة
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Link
                key={section.href}
                href={section.href}
                className="card p-5 group cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${section.gradient} flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-800 text-sm mb-1">{section.label}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{section.desc}</p>
                <div className="mt-3 flex items-center gap-1 text-blue-600 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>استعرض</span>
                  <ChevronLeft className="w-3 h-3" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom row: recent projects + competitions */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-indigo-600" />
              أحدث المشاريع
            </h3>
            <Link href="/projects" className="text-blue-600 text-xs hover:underline">عرض الكل</Link>
          </div>
          <div className="space-y-3">
            {recentProjects.map((p) => (
              <div key={p.name} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <div className="font-medium text-sm text-gray-800">{p.name}</div>
                  <div className="text-xs text-gray-400">{p.school}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{p.field}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[p.status] ?? "bg-gray-100 text-gray-600"}`}>{p.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Plan Progress */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-orange-600" />
              إنجاز الخطة السنوية
            </h3>
            <Link href="/indicators" className="text-blue-600 text-xs hover:underline">التفاصيل</Link>
          </div>
          <div className="space-y-4">
            {[
              { label: "برنامج الموهبة", value: 90 },
              { label: "برنامج الابتكار", value: 85 },
              { label: "برنامج الذكاء الاصطناعي", value: 95 },
              { label: "برنامج الروبوت", value: 88 },
              { label: "البحث العلمي", value: 78 },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{item.label}</span>
                  <span className="font-semibold text-blue-700">{item.value}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-l from-blue-600 to-blue-400 rounded-full transition-all duration-500"
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

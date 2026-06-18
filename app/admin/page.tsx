"use client";
import { useState, useEffect, useRef } from "react";
import {
  Settings, Users, Shield, Plus, Trash2, CheckCircle,
  Clock, XCircle, MessageSquare, Radio, BookOpen, Play, Lightbulb, Lock,
  Briefcase, ShoppingBag, Star, Key, CalendarDays, ChevronDown, ChevronUp, Code, Image as ImageIcon,
  Layers, Trophy, Archive, Cpu, BarChart3, Video, Globe, UserSquare2, GraduationCap, Award as AwardIcon, ExternalLink
} from "lucide-react";
import dynamic from "next/dynamic";
const KnowledgeAdmin = dynamic(() => import("@/components/admin/KnowledgeAdmin"), { ssr: false });
const SectionCMS = dynamic(() => import("@/components/admin/SectionCMS"), { ssr: false });

const PROGRAMS_CONFIG = {
  storageKey: "kc_programs", title: "البرامج", icon: "🎯",
  displayField: "title", subField: "description",
  fields: [
    { key: "title", label: "اسم البرنامج", type: "text" as const, required: true, placeholder: "مثال: برنامج الروبوت" },
    { key: "description", label: "الوصف", type: "textarea" as const, placeholder: "وصف مختصر للبرنامج..." },
    { key: "emoji", label: "أيقونة", type: "emoji" as const },
    { key: "gradient", label: "اللون", type: "text" as const, placeholder: "from-blue-700 to-blue-500" },
    { key: "targetAudience", label: "الفئة المستهدفة", type: "select" as const, options: ["طلاب ابتدائي", "طلاب متوسط", "طلاب ثانوي", "الجميع", "معلمون", "منسقون"] },
    { key: "duration", label: "المدة", type: "text" as const, placeholder: "مثال: 8 أسابيع" },
    { key: "status", label: "الحالة", type: "select" as const, options: ["نشط", "قادم", "منتهي"] },
    { key: "image", label: "صورة", type: "image" as const },
  ],
};

const COMPETITIONS_CONFIG = {
  storageKey: "kc_competitions", title: "المسابقات والجوائز", icon: "🏆",
  displayField: "title", subField: "description",
  fields: [
    { key: "title", label: "اسم المسابقة", type: "text" as const, required: true, placeholder: "مثال: مسابقة WRO 2025" },
    { key: "description", label: "الوصف", type: "textarea" as const, placeholder: "تفاصيل المسابقة..." },
    { key: "type", label: "النوع", type: "select" as const, options: ["محلية", "وطنية", "دولية", "مدرسية"] },
    { key: "subject", label: "المجال", type: "select" as const, options: ["روبوت", "رياضيات", "علوم", "برمجة", "ذكاء اصطناعي", "ابتكار", "متعدد"] },
    { key: "date", label: "تاريخ المسابقة", type: "date" as const },
    { key: "status", label: "الحالة", type: "select" as const, options: ["مفتوح", "قادم", "منتهي"] },
    { key: "registrationLink", label: "رابط التسجيل", type: "url" as const, placeholder: "https://..." },
    { key: "tags", label: "الأعمار المستهدفة", type: "tags" as const, placeholder: "مثال: 10-14 سنة" },
    { key: "image", label: "صورة", type: "image" as const },
  ],
};

const PROJECT_BANK_CONFIG = {
  storageKey: "kc_project_bank", title: "بنك المشاريع", icon: "💡",
  displayField: "title", subField: "description",
  fields: [
    { key: "title", label: "عنوان المشروع", type: "text" as const, required: true, placeholder: "مثال: روبوت تتبع الخط" },
    { key: "description", label: "وصف المشروع", type: "textarea" as const, placeholder: "فكرة المشروع وأهدافه..." },
    { key: "category", label: "التصنيف", type: "select" as const, options: ["روبوت", "ذكاء اصطناعي", "إلكترونيات", "IoT", "برمجة", "بيئة", "ابتكار", "أخرى"] },
    { key: "difficulty", label: "الصعوبة", type: "select" as const, options: ["سهل", "متوسط", "صعب", "متقدم"] },
    { key: "duration", label: "المدة التقديرية", type: "text" as const, placeholder: "مثال: 3 أسابيع" },
    { key: "materials", label: "المكونات والأدوات", type: "textarea" as const, placeholder: "اذكر المكونات المطلوبة..." },
    { key: "status", label: "الحالة", type: "select" as const, options: ["نشط", "قيد التنفيذ", "منتهي"] },
    { key: "image", label: "صورة", type: "image" as const },
  ],
};

const EMERGING_TECH_CONFIG = {
  storageKey: "kc_emerging_tech", title: "التقنيات الناشئة", icon: "💡",
  displayField: "title", subField: "subtitle",
  fields: [
    { key: "title", label: "اسم التقنية", type: "text" as const, required: true, placeholder: "مثال: الذكاء الاصطناعي" },
    { key: "subtitle", label: "الاسم بالإنجليزية", type: "text" as const, placeholder: "Artificial Intelligence" },
    { key: "emoji", label: "أيقونة", type: "emoji" as const },
    { key: "color", label: "لون التدرج", type: "text" as const, placeholder: "from-indigo-600 to-purple-500" },
    { key: "description", label: "الوصف", type: "textarea" as const, placeholder: "شرح مختصر للتقنية..." },
    { key: "tools", label: "الأدوات والتطبيقات (بفاصلة)", type: "textarea" as const, placeholder: "ChatGPT, Scratch, Teachable Machine..." },
    { key: "applications", label: "مجالات التطبيق (بفاصلة)", type: "textarea" as const, placeholder: "التعرف على الصور, الترجمة الآلية..." },
    { key: "projects", label: "أفكار مشاريع (بفاصلة)", type: "textarea" as const, placeholder: "كاشف النفايات, مساعد ذكي..." },
    { key: "levels", label: "المراحل الدراسية", type: "tags" as const, placeholder: "ابتدائي / متوسط / ثانوي" },
    { key: "image", label: "صورة", type: "image" as const },
  ],
};

const INDICATORS_CONFIG = {
  storageKey: "kc_indicators", title: "مؤشرات الأداء", icon: "📊",
  displayField: "label", subField: "value",
  fields: [
    { key: "label", label: "اسم المؤشر", type: "text" as const, required: true, placeholder: "مثال: البرامج المنفذة" },
    { key: "value", label: "القيمة", type: "text" as const, required: true, placeholder: "مثال: 6 أو 92%" },
    { key: "total", label: "المستهدف", type: "text" as const, placeholder: "مثال: 8" },
    { key: "emoji", label: "أيقونة", type: "emoji" as const },
    { key: "color", label: "اللون", type: "select" as const, options: ["bg-purple-600", "bg-blue-600", "bg-green-600", "bg-yellow-500", "bg-teal-600", "bg-orange-500", "bg-red-600"] },
    { key: "note", label: "ملاحظة", type: "text" as const, placeholder: "مثال: حتى نهاية الفصل الأول" },
  ],
};

import { useAuth, StudentProfile, CoordinatorProfile, ChatGroup, CourseItem, LessonItem, VideoItem, ProjectItem, ProjectVideo, ShopItem, PlatformAchievement, DailyLogEntry } from "@/contexts/AuthContext";

interface VisitorRequest {
  id: string; name: string; phone: string; email: string;
  purpose: "courses" | "shop" | "activities";
  purposeLabel: string; notes: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
}

const PURPOSE_LABELS_MAP: Record<string, string> = {
  courses: "🎓 الدورات التدريبية",
  shop: "🛍️ المتجر",
  activities: "📰 متابعة الأنشطة",
};

function loadVisitorRequests(): VisitorRequest[] {
  try { return JSON.parse(localStorage.getItem("kc_visitor_requests") || "[]"); } catch { return []; }
}
function saveVisitorRequests(data: VisitorRequest[]) {
  localStorage.setItem("kc_visitor_requests", JSON.stringify(data));
}

const ADMIN_PASSWORD = "arqam2025";

function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);
  const check = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw === ADMIN_PASSWORD) { localStorage.setItem("kc_admin_auth", "1"); onSuccess(); }
    else { setError(true); setPw(""); }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Lock className="w-8 h-8 text-red-700" />
          </div>
          <h1 className="text-xl font-bold text-gray-800">لوحة الإدارة</h1>
          <p className="text-sm text-gray-400 mt-1">مركز المعرفة والابتكار STEAM بمدارس الأرقم</p>
        </div>
        <form onSubmit={check} className="space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm text-center">كلمة المرور غير صحيحة</div>}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">كلمة مرور الإدارة</label>
            <input type="password" value={pw} onChange={e => { setPw(e.target.value); setError(false); }}
              placeholder="أدخل كلمة المرور" autoFocus
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 outline-none focus:border-red-400" />
          </div>
          <button type="submit" className="w-full bg-red-700 text-white py-3 rounded-xl font-bold hover:bg-red-600">دخول</button>
        </form>
      </div>
    </div>
  );
}

const GROUP_COLORS = [
  { label: "أزرق", value: "from-blue-700 to-blue-500" },
  { label: "أخضر", value: "from-green-700 to-teal-500" },
  { label: "بنفسجي", value: "from-violet-700 to-purple-500" },
  { label: "برتقالي", value: "from-orange-600 to-amber-500" },
  { label: "أحمر", value: "from-red-700 to-rose-500" },
  { label: "سماوي", value: "from-cyan-700 to-sky-500" },
];

const EMOJIS = ["🤖", "🏆", "🧠", "🔬", "💡", "🚀", "⭐", "📚", "🎯", "🌟"];

export default function AdminPage() {
  const { getAllStudents, approveStudent, rejectStudent, deleteStudent,
    getAllCoordinators, approveCoordinator, rejectCoordinator, deleteCoordinator,
    getGroups, createGroup, deleteGroup,
    getLiveStream, updateLiveStream, getCourses, addCourse, deleteCourse,
    getVideos, addVideo, deleteVideo, getProjects, addProject, deleteProject,
    getShopItems, addShopItem, deleteShopItem,
    getPlatformAchievements, addPlatformAchievement, deletePlatformAchievement,
    getRegCodes, setRegCodes,
    getDailyLog, addDailyLogEntry, deleteDailyLogEntry } = useAuth();

  // --- كل الـ hooks أولاً قبل أي return ---
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState("students");
  const [visitorRequests, setVisitorRequests] = useState<VisitorRequest[]>([]);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [coordinators, setCoordinators] = useState<CoordinatorProfile[]>([]);
  const [groups, setGroups] = useState<ChatGroup[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [live, setLive] = useState(getLiveStream());
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [platformAchievements, setPlatformAchievements] = useState<PlatformAchievement[]>([]);
  const [regCodes, setRegCodesState] = useState(getRegCodes());
  const [sForm, setSForm] = useState({ name: "", description: "", price: "", image: "", imageName: "", category: "كتب", contact: "" });
  const [showSForm, setShowSForm] = useState(false);
  const [aForm, setAForm] = useState({ title: "", description: "", date: "", image: "", imageName: "" });
  const [showAForm, setShowAForm] = useState(false);
  const [gForm, setGForm] = useState({ name: "", description: "", emoji: "🤖", color: GROUP_COLORS[0].value, type: "team" as "general" | "team" });
  const [showGForm, setShowGForm] = useState(false);
  const [cForm, setCForm] = useState({ title: "", description: "", emoji: "📚", instructor: "", duration: "" });
  const [showCForm, setShowCForm] = useState(false);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [lessonForm, setLessonForm] = useState({ title: "", videoUrl: "", pdfUrl: "", pdfName: "", duration: "" });
  const [showLessonForm, setShowLessonForm] = useState<string | null>(null);
  const [vForm, setVForm] = useState({ title: "", description: "", link: "", emoji: "🎬" });
  const [showVForm, setShowVForm] = useState(false);
  const EMPTY_PFORM = { title: "", description: "", field: "", level: "متوسط", emoji: "💡", image: "", imageName: "", students: "", division: "", components: "", code: "", codeFile: "", codeFileName: "", videos: [] as import("@/contexts/AuthContext").ProjectVideo[] };
  const [pForm, setPForm] = useState(EMPTY_PFORM);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [showPForm, setShowPForm] = useState(false);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [showVideoForm, setShowVideoForm] = useState<string | null>(null);
  const [videoForm, setVideoForm] = useState({ title: "", url: "", type: "journey" as ProjectVideo["type"], description: "" });
  const [dailyLog, setDailyLog] = useState<DailyLogEntry[]>([]);
  const [showDForm, setShowDForm] = useState(false);
  const [dForm, setDForm] = useState({
    title: "", date: "", description: "", category: "نشاط",
    images: [] as Array<{ data: string; name: string }>,
    videoLinks: [""],
  });

  const refresh = () => {
    setStudents(getAllStudents());
    setCoordinators(getAllCoordinators());
    setGroups(getGroups());
    setCourses(getCourses());
    setVideos(getVideos());
    setProjects(getProjects());
    setLive(getLiveStream());
    setShopItems(getShopItems());
    setPlatformAchievements(getPlatformAchievements());
    setRegCodesState(getRegCodes());
    setDailyLog(getDailyLog());
    setVisitorRequests(loadVisitorRequests());
  };

  useEffect(() => {
    if (localStorage.getItem("kc_admin_auth") === "1") setAuthed(true);
  }, []);

  useEffect(() => { if (authed) refresh(); }, [authed]);

  // --- الآن نتحقق من تسجيل الدخول ---
  if (!authed) return <AdminLogin onSuccess={() => setAuthed(true)} />;

  const pending = students.filter(s => s.status === "pending");
  const approved = students.filter(s => s.status === "approved");

  const pendingCoords = coordinators.filter(c => c.status === "pending");

  const navTabs = [
    { id: "students", label: "طلبات الطلاب", icon: Users, badge: pending.length },
    { id: "coordinators", label: "طلبات المنسقين", icon: Briefcase, badge: pendingCoords.length },
    { id: "approved", label: "الطلاب المعتمدون", icon: CheckCircle },
    { id: "groups", label: "الجروبات", icon: MessageSquare },
    { id: "live", label: "البث المباشر", icon: Radio },
    { id: "courses", label: "الدورات", icon: BookOpen },
    { id: "videos", label: "الفيديوهات", icon: Play },
    { id: "projects", label: "المشاريع", icon: Lightbulb },
    { id: "shop", label: "المتجر", icon: ShoppingBag },
    { id: "achievements", label: "الإنجازات", icon: Star },
    { id: "codes", label: "رموز التسجيل", icon: Key },
    { id: "daily", label: "يوميات المركز", icon: CalendarDays, badge: dailyLog.length || undefined },
    { id: "knowledge", label: "مركز المعرفة", icon: BookOpen },
    { id: "programs_cms", label: "البرامج", icon: Layers },
    { id: "competitions_cms", label: "المسابقات", icon: Trophy },
    { id: "project_bank_cms", label: "بنك المشاريع", icon: Archive },
    { id: "emerging_tech_cms", label: "التقنيات الناشئة", icon: Cpu },
    { id: "indicators_cms", label: "المؤشرات", icon: BarChart3 },
    { id: "meetings_admin", label: "الاجتماعات", icon: Video },
    { id: "monthly_report", label: "التقرير الشهري", icon: BarChart3 },
    { id: "visitors", label: "طلبات الزوار", icon: Globe, badge: visitorRequests.filter(v => v.status === "pending").length || undefined },
    { id: "whiteboard_admin", label: "السبورة الذكية", icon: BookOpen },
    { id: "supervisor_profile", label: "ملفي الشخصي", icon: UserSquare2 },
    { id: "permissions", label: "الصلاحيات", icon: Shield },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="card p-6 bg-gradient-to-l from-red-800 to-rose-700 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center"><Settings className="w-7 h-7" /></div>
          <div>
            <h1 className="text-2xl font-bold">لوحة الإدارة</h1>
            <p className="text-red-200 text-sm">إدارة الطلاب والجروبات والمحتوى</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "طلبات انتظار", value: pending.length, color: "bg-yellow-500", icon: Clock },
          { label: "طلاب معتمدون", value: approved.length, color: "bg-green-600", icon: CheckCircle },
          { label: "الجروبات", value: groups.length, color: "bg-blue-600", icon: MessageSquare },
          { label: "البث", value: live.enabled ? "مباشر" : "مغلق", color: live.enabled ? "bg-red-500" : "bg-gray-400", icon: Radio },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="card p-4 flex items-center gap-3">
              <div className={`${s.color} w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0`}><Icon className="w-5 h-5" /></div>
              <div><div className="text-2xl font-bold text-gray-800">{s.value}</div><div className="text-xs text-gray-500">{s.label}</div></div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {navTabs.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => { setTab(t.id); refresh(); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all relative ${tab === t.id ? "bg-red-700 text-white shadow-md" : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"}`}>
              <Icon className="w-4 h-4" /> {t.label}
              {t.badge ? <span className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 text-gray-800 text-xs rounded-full flex items-center justify-center font-bold">{t.badge}</span> : null}
            </button>
          );
        })}
      </div>

      {/* Pending Students */}
      {tab === "students" && (
        <div className="space-y-3">
          <h2 className="font-bold text-gray-800">طلبات التسجيل المعلقة ({pending.length})</h2>
          {pending.length === 0
            ? <div className="card p-10 text-center text-gray-400"><Clock className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>لا توجد طلبات معلقة</p></div>
            : pending.map(s => (
              <div key={s.id} className="card p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center text-xl font-bold text-gray-500">
                    {s.photo ? <img src={s.photo} alt="" className="w-full h-full object-cover" /> : s.name[0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">{s.name}</p>
                    <p className="text-sm text-gray-500">{s.school} • {s.grade}</p>
                    <p className="text-xs text-gray-400">{s.phone} • هوية: {s.nationalId}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { approveStudent(s.id); refresh(); }}
                      className="flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-500">
                      <CheckCircle className="w-4 h-4" /> قبول
                    </button>
                    <button onClick={() => { rejectStudent(s.id); refresh(); }}
                      className="flex items-center gap-1.5 bg-red-100 text-red-600 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-200">
                      <XCircle className="w-4 h-4" /> رفض
                    </button>
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      )}

      {/* Approved Students */}
      {tab === "approved" && (
        <div className="space-y-3">
          <h2 className="font-bold text-gray-800">الطلاب المعتمدون ({approved.length})</h2>
          {approved.length === 0
            ? <div className="card p-10 text-center text-gray-400"><Users className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>لا يوجد طلاب معتمدون بعد</p></div>
            : <div className="card overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>{["الطالب", "المدرسة", "الصف", "الجوال", "حذف"].map(h => <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 text-right">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {approved.map(s => (
                      <tr key={s.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-emerald-100 flex-shrink-0 flex items-center justify-center text-xs font-bold text-emerald-700">
                              {s.photo ? <img src={s.photo} alt="" className="w-full h-full object-cover" /> : s.name[0]}
                            </div>
                            <span className="text-sm font-medium">{s.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{s.school}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{s.grade}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{s.phone}</td>
                        <td className="px-4 py-3"><button onClick={() => { if(confirm("حذف هذا الطالب؟")) { deleteStudent(s.id); refresh(); } }} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
          }
        </div>
      )}

      {/* Groups */}
      {tab === "groups" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-800">إدارة الجروبات ({groups.length})</h2>
            <button onClick={() => setShowGForm(!showGForm)} className="flex items-center gap-2 bg-blue-800 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700">
              <Plus className="w-4 h-4" /> جروب جديد
            </button>
          </div>
          {showGForm && (
            <div className="card p-5 space-y-3">
              <h3 className="font-bold text-gray-700">إنشاء جروب جديد</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">اسم الجروب *</label>
                  <input value={gForm.name} onChange={e => setGForm(p => ({ ...p, name: e.target.value }))} placeholder="مثال: فريق WRO 2025" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-blue-500" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">الوصف</label>
                  <input value={gForm.description} onChange={e => setGForm(p => ({ ...p, description: e.target.value }))} placeholder="وصف الجروب" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">النوع</label>
                  <select value={gForm.type} onChange={e => setGForm(p => ({ ...p, type: e.target.value as "general" | "team" }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none">
                    <option value="general">جروب عام (للجميع)</option>
                    <option value="team">جروب فريق</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">الإيموجي</label>
                  <select value={gForm.emoji} onChange={e => setGForm(p => ({ ...p, emoji: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none">
                    {EMOJIS.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">اللون</label>
                  <div className="flex gap-2 flex-wrap">
                    {GROUP_COLORS.map(c => (
                      <button key={c.value} onClick={() => setGForm(p => ({ ...p, color: c.value }))}
                        className={`w-8 h-8 rounded-lg bg-gradient-to-br ${c.value} border-2 ${gForm.color === c.value ? "border-gray-800" : "border-transparent"}`} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { if (!gForm.name.trim()) return; createGroup(gForm); setShowGForm(false); setGForm({ name: "", description: "", emoji: "🤖", color: GROUP_COLORS[0].value, type: "team" }); refresh(); }}
                  className="bg-blue-800 text-white px-6 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700">إنشاء</button>
                <button onClick={() => setShowGForm(false)} className="bg-gray-100 text-gray-600 px-6 py-2 rounded-xl text-sm">إلغاء</button>
              </div>
            </div>
          )}
          {groups.length === 0
            ? <div className="card p-10 text-center text-gray-400"><MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>لا توجد جروبات بعد</p></div>
            : <div className="grid md:grid-cols-2 gap-4">
                {groups.map(g => (
                  <div key={g.id} className={`card p-4 bg-gradient-to-br ${g.color} text-white`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{g.emoji}</span>
                        <div><p className="font-bold">{g.name}</p><p className="text-white/70 text-xs">{g.description}</p></div>
                      </div>
                      <button onClick={() => { deleteGroup(g.id); refresh(); }} className="p-2 bg-white/20 hover:bg-white/30 rounded-xl"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <div className="mt-2"><span className="bg-white/20 text-white/90 text-xs px-2 py-0.5 rounded-full">{g.type === "general" ? "عام" : "فريق"}</span></div>
                  </div>
                ))}
              </div>
          }
        </div>
      )}

      {/* Live Stream */}
      {tab === "live" && (
        <div className="card p-6 max-w-xl space-y-4">
          <h2 className="font-bold text-gray-800 flex items-center gap-2"><Radio className="w-5 h-5 text-red-500" /> التحكم في البث المباشر</h2>

          {/* اختيار منصة البث */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-2 block">منصة البث</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "youtube", emoji: "▶", label: "YouTube Live" },
                { id: "meet", emoji: "🎥", label: "Google Meet" },
                { id: "zoom", emoji: "📹", label: "Zoom" },
              ].map(p => (
                <button key={p.id} onClick={() => setLive(prev => ({ ...prev, streamType: p.id as "youtube" | "meet" | "zoom" }))}
                  className={`p-3 rounded-xl text-center border-2 transition-all ${(live.streamType || "youtube") === p.id ? "border-blue-500 bg-blue-50" : "border-gray-100 bg-gray-50 hover:border-gray-200"}`}>
                  <div className="text-2xl mb-1">{p.emoji}</div>
                  <div className="text-xs font-bold text-gray-700">{p.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">عنوان الجلسة</label>
            <input value={live.title} onChange={e => setLive(p => ({ ...p, title: e.target.value }))}
              placeholder="مثال: درس الذكاء الاصطناعي - الجلسة الأولى"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-blue-500" />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">
              {(live.streamType || "youtube") === "youtube" ? "رابط YouTube Live" : (live.streamType === "meet" ? "رابط Google Meet" : "رابط Zoom")}
            </label>
            <input value={live.url || live.zoomLink || ""}
              onChange={e => setLive(p => ({ ...p, url: e.target.value, zoomLink: e.target.value }))}
              placeholder={(live.streamType || "youtube") === "youtube" ? "https://youtube.com/live/..." : (live.streamType === "meet" ? "https://meet.google.com/..." : "https://zoom.us/j/...")}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-blue-500 font-mono" dir="ltr" />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">وصف الجلسة (اختياري)</label>
            <input value={live.description} onChange={e => setLive(p => ({ ...p, description: e.target.value }))}
              placeholder="مثال: نتعلم اليوم أساسيات الذكاء الاصطناعي..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-blue-500" />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">موعد البث القادم (اختياري)</label>
            <input value={live.scheduledAt || ""} onChange={e => setLive(p => ({ ...p, scheduledAt: e.target.value }))}
              placeholder="مثال: الإثنين 10 ذي القعدة الساعة 10 صباحاً"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-blue-500" />
          </div>

          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
            <span className="text-sm font-semibold text-gray-700">البث نشط الآن:</span>
            <button onClick={() => setLive(p => ({ ...p, enabled: !p.enabled }))}
              className={`relative w-14 h-7 rounded-full transition-colors ${live.enabled ? "bg-green-500" : "bg-gray-300"}`}>
              <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-all ${live.enabled ? "right-0.5" : "left-0.5"}`} />
            </button>
            <span className={`text-sm font-bold ${live.enabled ? "text-red-600" : "text-gray-400"}`}>
              {live.enabled ? "🔴 مباشر الآن" : "مغلق"}
            </span>
          </div>

          <button onClick={() => {
            const toSave = { ...live, url: live.url || live.zoomLink || "" };
            updateLiveStream(toSave);
            localStorage.setItem("kc_live_stream", JSON.stringify({
              isLive: toSave.enabled,
              streamType: toSave.streamType || "youtube",
              title: toSave.title,
              url: toSave.url || toSave.zoomLink || "",
              description: toSave.description,
              scheduledAt: toSave.scheduledAt || "",
            }));
            alert("✅ تم حفظ إعدادات البث!");
          }} className="w-full bg-blue-800 text-white py-3 rounded-xl font-bold hover:bg-blue-700 flex items-center justify-center gap-2">
            <Radio className="w-4 h-4" /> حفظ الإعدادات
          </button>

          <div className="p-3 bg-blue-50 rounded-xl text-xs text-blue-700">
            <strong>ملاحظة:</strong> YouTube يُعرض داخل المنصة مباشرة • Google Meet وZoom يفتحان في نافذة جديدة
          </div>
        </div>
      )}

      {/* Courses */}
      {tab === "courses" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-800">الدورات التدريبية ({courses.length})</h2>
            <button onClick={() => setShowCForm(!showCForm)} className="flex items-center gap-2 bg-blue-800 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700"><Plus className="w-4 h-4" /> دورة جديدة</button>
          </div>

          {/* فورم إضافة دورة */}
          {showCForm && (
            <div className="card p-5 space-y-3 border-2 border-blue-100">
              <h3 className="font-bold text-gray-700 text-sm">دورة جديدة</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">اسم الدورة *</label>
                  <input value={cForm.title} onChange={e => setCForm(p => ({ ...p, title: e.target.value }))} placeholder="مثال: دورة الذكاء الاصطناعي للمبتدئين" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">الوصف</label>
                  <textarea value={cForm.description} onChange={e => setCForm(p => ({ ...p, description: e.target.value }))} rows={2} placeholder="وصف مختصر للدورة..." className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none resize-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">المدرب</label>
                  <input value={cForm.instructor} onChange={e => setCForm(p => ({ ...p, instructor: e.target.value }))} placeholder="اسم المدرب" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">المدة</label>
                  <input value={cForm.duration} onChange={e => setCForm(p => ({ ...p, duration: e.target.value }))} placeholder="مثال: 5 ساعات" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">الأيقونة</label>
                  <select value={cForm.emoji} onChange={e => setCForm(p => ({ ...p, emoji: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none">
                    {["📚", "🤖", "🧠", "💡", "🔬", "🚀", "⭐", "🎯", "🌟", "🏆", "🎓", "💻", "🔧", "⚡", "🌐"].map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => {
                  if (!cForm.title.trim()) return;
                  addCourse({ ...cForm, lessons: [], createdAt: new Date().toLocaleDateString("ar-SA") });
                  setShowCForm(false);
                  setCForm({ title: "", description: "", emoji: "📚", instructor: "", duration: "" });
                  refresh();
                }} className="bg-blue-800 text-white px-6 py-2 rounded-xl text-sm font-semibold">إضافة الدورة</button>
                <button onClick={() => setShowCForm(false)} className="bg-gray-100 text-gray-600 px-6 py-2 rounded-xl text-sm">إلغاء</button>
              </div>
            </div>
          )}

          {/* قائمة الدورات */}
          {courses.length === 0
            ? <div className="card p-10 text-center text-gray-400"><GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>لا توجد دورات بعد</p></div>
            : <div className="space-y-3">{courses.map(c => {
                const cTyped = c as CourseItem & { lessons?: LessonItem[] };
                const lessons: LessonItem[] = cTyped.lessons || [];
                const isOpen = expandedCourse === c.id;
                return (
                  <div key={c.id} className="card overflow-hidden">
                    <div className="p-4 flex items-center gap-3">
                      <span className="text-3xl">{c.emoji}</span>
                      <div className="flex-1">
                        <p className="font-bold text-gray-800">{c.title}</p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-xs text-gray-400">{lessons.length} درس</span>
                          {cTyped.instructor && <span className="text-xs text-gray-400">• {cTyped.instructor}</span>}
                          {cTyped.duration && <span className="text-xs text-gray-400">• {cTyped.duration}</span>}
                        </div>
                      </div>
                      <button onClick={() => setExpandedCourse(isOpen ? null : c.id)}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100">
                        <BookOpen className="w-3.5 h-3.5" /> {isOpen ? "إخفاء" : "الدروس"}
                        {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                      <button onClick={() => { deleteCourse(c.id); refresh(); }} className="p-2 text-red-400 hover:bg-red-50 rounded-xl"><Trash2 className="w-4 h-4" /></button>
                    </div>

                    {isOpen && (
                      <div className="border-t border-gray-100 bg-gray-50 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-gray-600">الدروس ({lessons.length})</p>
                          <button onClick={() => setShowLessonForm(showLessonForm === c.id ? null : c.id)}
                            className="flex items-center gap-1 text-xs text-green-700 bg-green-100 hover:bg-green-200 px-3 py-1.5 rounded-lg">
                            <Plus className="w-3 h-3" /> إضافة درس
                          </button>
                        </div>

                        {showLessonForm === c.id && (
                          <div className="bg-white rounded-xl p-4 space-y-3 border border-green-100">
                            <p className="text-xs font-bold text-gray-600">درس جديد</p>
                            <input value={lessonForm.title} onChange={e => setLessonForm(p => ({ ...p, title: e.target.value }))}
                              placeholder="عنوان الدرس *"
                              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 outline-none" />
                            <input value={lessonForm.videoUrl} onChange={e => setLessonForm(p => ({ ...p, videoUrl: e.target.value }))}
                              placeholder="رابط فيديو YouTube (اختياري)"
                              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 outline-none font-mono" dir="ltr" />
                            <div className="grid grid-cols-2 gap-2">
                              <input value={lessonForm.pdfName} onChange={e => setLessonForm(p => ({ ...p, pdfName: e.target.value }))}
                                placeholder="اسم ملف PDF"
                                className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 outline-none" />
                              <input value={lessonForm.duration} onChange={e => setLessonForm(p => ({ ...p, duration: e.target.value }))}
                                placeholder="المدة (مثال: 20 دقيقة)"
                                className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 outline-none" />
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => {
                                if (!lessonForm.title.trim()) return;
                                const newLesson: LessonItem = { ...lessonForm, id: Date.now().toString() };
                                const updatedLessons = [...lessons, newLesson];
                                const allCourses = courses.map(cc => cc.id === c.id ? { ...cc, lessons: updatedLessons } : cc);
                                localStorage.setItem("kc_courses", JSON.stringify(allCourses));
                                setLessonForm({ title: "", videoUrl: "", pdfUrl: "", pdfName: "", duration: "" });
                                setShowLessonForm(null);
                                refresh();
                              }} className="bg-green-700 text-white px-4 py-1.5 rounded-xl text-xs font-semibold">إضافة الدرس</button>
                              <button onClick={() => setShowLessonForm(null)} className="bg-gray-100 text-gray-600 px-4 py-1.5 rounded-xl text-xs">إلغاء</button>
                            </div>
                          </div>
                        )}

                        {lessons.length === 0
                          ? <p className="text-xs text-gray-400 text-center py-3">لا توجد دروس — أضف الدرس الأول</p>
                          : <div className="space-y-1.5">
                              {lessons.map((l, idx) => (
                                <div key={l.id} className="flex items-center gap-2 bg-white rounded-lg p-2.5 border border-gray-100">
                                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold flex-shrink-0">{idx + 1}</span>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-gray-700 truncate">{l.title}</p>
                                    <div className="flex gap-2">
                                      {l.videoUrl && <span className="text-[10px] text-blue-500">▶ فيديو</span>}
                                      {l.pdfName && <span className="text-[10px] text-red-400">📄 {l.pdfName}</span>}
                                      {l.duration && <span className="text-[10px] text-gray-400">{l.duration}</span>}
                                    </div>
                                  </div>
                                  <button onClick={() => {
                                    const updatedLessons = lessons.filter(ll => ll.id !== l.id);
                                    const allCourses = courses.map(cc => cc.id === c.id ? { ...cc, lessons: updatedLessons } : cc);
                                    localStorage.setItem("kc_courses", JSON.stringify(allCourses));
                                    refresh();
                                  }} className="p-1 text-red-300 hover:text-red-500 flex-shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
                                </div>
                              ))}
                            </div>
                        }
                      </div>
                    )}
                  </div>
                );
              })}</div>
          }
        </div>
      )}

      {/* Videos */}
      {tab === "videos" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-800">الفيديوهات ({videos.length})</h2>
            <button onClick={() => setShowVForm(!showVForm)} className="flex items-center gap-2 bg-blue-800 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700"><Plus className="w-4 h-4" /> فيديو جديد</button>
          </div>
          {showVForm && (
            <div className="card p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><label className="text-xs font-semibold text-gray-600 mb-1 block">عنوان الفيديو *</label><input value={vForm.title} onChange={e => setVForm(p => ({ ...p, title: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none" /></div>
                <div className="col-span-2"><label className="text-xs font-semibold text-gray-600 mb-1 block">الوصف</label><input value={vForm.description} onChange={e => setVForm(p => ({ ...p, description: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none" /></div>
                <div className="col-span-2"><label className="text-xs font-semibold text-gray-600 mb-1 block">رابط الفيديو</label><input value={vForm.link} onChange={e => setVForm(p => ({ ...p, link: e.target.value }))} placeholder="https://youtube.com/..." className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none" /></div>
                <div><label className="text-xs font-semibold text-gray-600 mb-1 block">الإيموجي</label><select value={vForm.emoji} onChange={e => setVForm(p => ({ ...p, emoji: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none">{EMOJIS.map(e => <option key={e} value={e}>{e}</option>)}</select></div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { if (!vForm.title.trim()) return; addVideo(vForm); setShowVForm(false); setVForm({ title: "", description: "", link: "", emoji: "🎬" }); refresh(); }} className="bg-blue-800 text-white px-6 py-2 rounded-xl text-sm font-semibold">إضافة</button>
                <button onClick={() => setShowVForm(false)} className="bg-gray-100 text-gray-600 px-6 py-2 rounded-xl text-sm">إلغاء</button>
              </div>
            </div>
          )}
          {videos.length === 0 ? <div className="card p-10 text-center text-gray-400"><Play className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>لا توجد فيديوهات بعد</p></div>
            : <div className="space-y-3">{videos.map(v => (
                <div key={v.id} className="card p-4 flex items-center gap-3">
                  <span className="text-3xl">{v.emoji}</span>
                  <div className="flex-1"><p className="font-bold text-gray-800">{v.title}</p><p className="text-xs text-gray-400 truncate">{v.link}</p></div>
                  <button onClick={() => { deleteVideo(v.id); refresh(); }} className="p-2 text-red-400 hover:bg-red-50 rounded-xl"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}</div>}
        </div>
      )}

      {/* Projects */}
      {tab === "projects" && (() => {
        const PROJECT_EMOJIS = ["💡", "🤖", "🔬", "⚡", "🚀", "🧠", "🌱", "🔧", "📡", "💻", "🎯", "🏆", "🌟", "🔩", "🛠️"];
        const PROJECT_FIELDS = ["الذكاء الاصطناعي", "إنترنت الأشياء", "الروبوت", "STEAM", "برمجة", "إلكترونيات", "بيئة", "ابتكار", "أخرى"];
        const PROJECT_LEVELS = ["ابتدائي", "متوسط", "ثانوي", "متقدم"];

        const saveEditedProject = () => {
          if (!pForm.title.trim()) return;
          const all: ProjectItem[] = JSON.parse(localStorage.getItem("kc_projects") || "[]");
          const updated = all.map(p => p.id === editingProjectId ? { ...p, ...pForm } : p);
          localStorage.setItem("kc_projects", JSON.stringify(updated));
          setEditingProjectId(null);
          setShowPForm(false);
          setPForm(EMPTY_PFORM);
          refresh();
        };

        const startEdit = (p: ProjectItem) => {
          setPForm({
            title: p.title, description: p.description, field: p.field, level: p.level,
            emoji: p.emoji || "💡", image: p.image || "", imageName: p.imageName || "",
            students: p.students || "", division: p.division || "",
            components: p.components || "", code: p.code || "",
            codeFile: p.codeFile || "", codeFileName: p.codeFileName || "",
            videos: p.videos || [],
          });
          setEditingProjectId(p.id);
          setShowPForm(true);
          setExpandedProject(null);
        };

        const ProjectForm = () => (
          <div className="card p-5 space-y-4 border-2 border-blue-100">
            <h3 className="font-bold text-gray-700">{editingProjectId ? "✏️ تعديل المشروع" : "➕ مشروع جديد"}</h3>

            {/* الأيقونة */}
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-2 block">الأيقونة</label>
              <div className="flex gap-2 flex-wrap">
                {PROJECT_EMOJIS.map(em => (
                  <button key={em} onClick={() => setPForm(p => ({ ...p, emoji: em }))}
                    className={`text-2xl w-10 h-10 rounded-xl flex items-center justify-center transition-all ${pForm.emoji === em ? "bg-blue-100 border-2 border-blue-500 scale-110" : "bg-gray-50 hover:bg-gray-100 border border-gray-200"}`}>
                    {em}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs font-semibold text-gray-600 mb-1 block">اسم المشروع *</label>
                <input value={pForm.title} onChange={e => setPForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="مثال: روبوت تجنب العقبات"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-blue-500" />
              </div>

              <div className="col-span-2">
                <label className="text-xs font-semibold text-gray-600 mb-1 block">فكرة المشروع ووصفه</label>
                <textarea value={pForm.description} onChange={e => setPForm(p => ({ ...p, description: e.target.value }))}
                  rows={3} placeholder="اشرح فكرة المشروع وأهدافه..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none resize-none" />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">المجال</label>
                <select value={pForm.field} onChange={e => setPForm(p => ({ ...p, field: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none">
                  <option value="">-- اختر المجال --</option>
                  {PROJECT_FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">المرحلة الدراسية</label>
                <select value={pForm.level} onChange={e => setPForm(p => ({ ...p, level: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none">
                  {PROJECT_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              <div className="col-span-2">
                <label className="text-xs font-semibold text-gray-600 mb-1 block">أسماء الطلاب</label>
                <input value={pForm.students} onChange={e => setPForm(p => ({ ...p, students: e.target.value }))}
                  placeholder="مثال: أحمد محمد، علي عبدالله، خالد سعد"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none" />
              </div>

              <div className="col-span-2">
                <label className="text-xs font-semibold text-gray-600 mb-1 block">الشعبة / الفصل</label>
                <input value={pForm.division} onChange={e => setPForm(p => ({ ...p, division: e.target.value }))}
                  placeholder="مثال: الصف الثاني المتوسط - 2أ"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none" />
              </div>

              <div className="col-span-2">
                <label className="text-xs font-semibold text-gray-600 mb-1 block">المكونات والأدوات</label>
                <textarea value={pForm.components} onChange={e => setPForm(p => ({ ...p, components: e.target.value }))}
                  rows={2} placeholder="مثال: Arduino UNO, محرك Servo x2, حساس مسافة HC-SR04..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none resize-none" />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">صورة المشروع</label>
                <label className={`border-2 border-dashed rounded-xl px-3 py-2.5 cursor-pointer text-sm flex items-center gap-2 ${pForm.image ? "border-blue-400 bg-blue-50 text-blue-700" : "border-gray-300 text-gray-400 hover:border-blue-400"}`}>
                  <ImageIcon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{pForm.imageName || "اختر صورة"}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={e => {
                    const f = e.target.files?.[0]; if (!f) return;
                    const r = new FileReader(); r.onload = ev => setPForm(p => ({ ...p, image: ev.target?.result as string, imageName: f.name })); r.readAsDataURL(f); e.target.value = "";
                  }} />
                </label>
                {pForm.image && <button onClick={() => setPForm(p => ({ ...p, image: "", imageName: "" }))} className="text-xs text-red-400 mt-1 hover:underline">إزالة الصورة</button>}
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">ملف الكود (.ino / .py)</label>
                <label className={`border-2 border-dashed rounded-xl px-3 py-2.5 cursor-pointer text-sm flex items-center gap-2 ${pForm.codeFile ? "border-green-400 bg-green-50 text-green-700" : "border-gray-300 text-gray-400 hover:border-green-400"}`}>
                  <Code className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{pForm.codeFileName || "اختر ملف الكود"}</span>
                  <input type="file" accept=".ino,.py,.cpp,.c,.js,.txt" className="hidden" onChange={e => {
                    const f = e.target.files?.[0]; if (!f) return;
                    const r = new FileReader(); r.onload = ev => setPForm(p => ({ ...p, codeFile: ev.target?.result as string, codeFileName: f.name })); r.readAsDataURL(f); e.target.value = "";
                  }} />
                </label>
              </div>

              <div className="col-span-2">
                <label className="text-xs font-semibold text-gray-600 mb-1 block">الكود البرمجي (نص مباشر)</label>
                <textarea value={pForm.code} onChange={e => setPForm(p => ({ ...p, code: e.target.value }))}
                  rows={5} placeholder="الصق الكود هنا مباشرة..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none resize-none font-mono text-xs" dir="ltr" />
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-gray-100">
              <button onClick={() => {
                if (!pForm.title.trim()) { alert("أدخل اسم المشروع أولاً"); return; }
                if (editingProjectId) { saveEditedProject(); }
                else { addProject(pForm); setShowPForm(false); setPForm(EMPTY_PFORM); refresh(); }
              }} className="bg-blue-800 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700">
                {editingProjectId ? "💾 حفظ التعديلات" : "➕ إضافة المشروع"}
              </button>
              <button onClick={() => { setShowPForm(false); setEditingProjectId(null); setPForm(EMPTY_PFORM); }}
                className="bg-gray-100 text-gray-600 px-6 py-2.5 rounded-xl text-sm hover:bg-gray-200">إلغاء</button>
            </div>
          </div>
        );

        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" /> مركز المشاريع ({projects.length})
              </h2>
              <button onClick={() => { setEditingProjectId(null); setPForm(EMPTY_PFORM); setShowPForm(!showPForm); }}
                className="flex items-center gap-2 bg-blue-800 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700">
                <Plus className="w-4 h-4" /> مشروع جديد
              </button>
            </div>

            {showPForm && <ProjectForm />}

            {projects.length === 0
              ? <div className="card p-12 text-center text-gray-400">
                  <Lightbulb className="w-14 h-14 mx-auto mb-4 opacity-20" />
                  <p className="font-semibold text-gray-500">لا توجد مشاريع بعد</p>
                  <p className="text-sm mt-1">اضغط "مشروع جديد" لإضافة أول مشروع</p>
                </div>
              : <div className="space-y-3">
                  {projects.map(p => (
                    <div key={p.id} className="card overflow-hidden">
                      <div className="flex items-center gap-3 p-4">
                        {p.image
                          ? <img src={p.image} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                          : <span className="text-3xl w-14 h-14 flex items-center justify-center bg-blue-50 rounded-xl flex-shrink-0">{p.emoji || "💡"}</span>
                        }
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-800 truncate">{p.title}</p>
                          <div className="flex gap-1.5 mt-0.5 flex-wrap">
                            {p.field && <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">{p.field}</span>}
                            {p.level && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{p.level}</span>}
                            {p.division && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full truncate max-w-[120px]">{p.division}</span>}
                          </div>
                          {p.students && <p className="text-xs text-gray-400 mt-1 truncate">👥 {p.students}</p>}
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <button onClick={() => startEdit(p)}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl" title="تعديل">
                            ✏️
                          </button>
                          <button onClick={() => setExpandedProject(expandedProject === p.id ? null : p.id)}
                            className="p-2 text-gray-400 hover:bg-gray-50 rounded-xl">
                            {expandedProject === p.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                          <button onClick={() => { if(confirm("حذف هذا المشروع نهائياً؟")) { deleteProject(p.id); refresh(); } }}
                            className="p-2 text-red-400 hover:bg-red-50 rounded-xl"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                      {expandedProject === p.id && (() => {
                        const videos: ProjectVideo[] = (p as ProjectItem & { videos?: ProjectVideo[] }).videos || [];
                        const VIDEO_TYPES = [
                          { id: "journey", label: "رحلة الابتكار", emoji: "🚀", color: "bg-blue-100 text-blue-700" },
                          { id: "presentation", label: "العرض النهائي", emoji: "🎯", color: "bg-green-100 text-green-700" },
                          { id: "problems", label: "المشكلات والحلول", emoji: "🔧", color: "bg-orange-100 text-orange-700" },
                          { id: "other", label: "أخرى", emoji: "📹", color: "bg-gray-100 text-gray-600" },
                        ];
                        const addVideo = () => {
                          if (!videoForm.url.trim() || !videoForm.title.trim()) return;
                          const newVideo: ProjectVideo = { ...videoForm, id: Date.now().toString() };
                          const all: ProjectItem[] = JSON.parse(localStorage.getItem("kc_projects") || "[]");
                          const updated = all.map(pr => pr.id === p.id
                            ? { ...pr, videos: [...((pr as ProjectItem & { videos?: ProjectVideo[] }).videos || []), newVideo] }
                            : pr);
                          localStorage.setItem("kc_projects", JSON.stringify(updated));
                          setVideoForm({ title: "", url: "", type: "journey", description: "" });
                          setShowVideoForm(null);
                          refresh();
                        };
                        const deleteVideo = (vid: string) => {
                          const all: ProjectItem[] = JSON.parse(localStorage.getItem("kc_projects") || "[]");
                          const updated = all.map(pr => pr.id === p.id
                            ? { ...pr, videos: ((pr as ProjectItem & { videos?: ProjectVideo[] }).videos || []).filter(v => v.id !== vid) }
                            : pr);
                          localStorage.setItem("kc_projects", JSON.stringify(updated));
                          refresh();
                        };
                        return (
                          <div className="border-t border-gray-100 bg-gray-50/50 p-4 space-y-4">
                            {/* معلومات المشروع */}
                            {p.description && <div><p className="text-xs font-semibold text-gray-500 mb-1">الوصف</p><p className="text-sm text-gray-700 leading-relaxed">{p.description}</p></div>}
                            {p.components && <div><p className="text-xs font-semibold text-gray-500 mb-1">المكونات</p><p className="text-sm text-gray-700">{p.components}</p></div>}
                            {p.code && <div><p className="text-xs font-semibold text-gray-500 mb-1">الكود</p><pre className="bg-gray-900 text-green-400 rounded-xl p-3 text-xs overflow-x-auto whitespace-pre-wrap">{p.code}</pre></div>}
                            {p.codeFile && <button onClick={() => { const a = document.createElement("a"); a.href = p.codeFile; a.download = p.codeFileName || "code"; a.click(); }} className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-xl text-sm hover:bg-green-100"><Code className="w-4 h-4" /> تحميل {p.codeFileName}</button>}

                            {/* ===== قسم الفيديوهات ===== */}
                            <div className="border-t border-gray-200 pt-4">
                              <div className="flex items-center justify-between mb-3">
                                <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                  🎬 فيديوهات المشروع ({videos.length})
                                </p>
                                <button onClick={() => setShowVideoForm(showVideoForm === p.id ? null : p.id)}
                                  className="flex items-center gap-1.5 text-xs bg-blue-800 text-white px-3 py-1.5 rounded-xl hover:bg-blue-700">
                                  <Plus className="w-3 h-3" /> إضافة فيديو
                                </button>
                              </div>

                              {/* أنواع الفيديو */}
                              <div className="grid grid-cols-4 gap-2 mb-3">
                                {VIDEO_TYPES.map(t => {
                                  const count = videos.filter(v => v.type === t.id).length;
                                  return (
                                    <div key={t.id} className={`rounded-xl p-2 text-center ${t.color}`}>
                                      <div className="text-lg">{t.emoji}</div>
                                      <div className="text-[10px] font-bold leading-tight">{t.label}</div>
                                      <div className="text-lg font-bold">{count}</div>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* فورم إضافة فيديو */}
                              {showVideoForm === p.id && (
                                <div className="bg-white rounded-xl p-4 space-y-3 border border-blue-100 mb-3">
                                  <p className="text-xs font-bold text-gray-600">فيديو جديد</p>
                                  <div>
                                    <label className="text-xs text-gray-500 mb-1 block">نوع الفيديو</label>
                                    <div className="grid grid-cols-2 gap-2">
                                      {VIDEO_TYPES.map(t => (
                                        <button key={t.id} onClick={() => setVideoForm(prev => ({ ...prev, type: t.id as ProjectVideo["type"] }))}
                                          className={`flex items-center gap-2 p-2 rounded-xl border-2 text-xs font-medium transition-all ${videoForm.type === t.id ? "border-blue-500 bg-blue-50" : "border-gray-100 hover:border-gray-200"}`}>
                                          <span>{t.emoji}</span> {t.label}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                  <input value={videoForm.title} onChange={e => setVideoForm(p => ({ ...p, title: e.target.value }))}
                                    placeholder="عنوان الفيديو (مثال: لقطة من اليوم الأول)"
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 outline-none" />
                                  <input value={videoForm.url} onChange={e => setVideoForm(p => ({ ...p, url: e.target.value }))}
                                    placeholder="رابط YouTube (مثال: https://youtu.be/...)"
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 outline-none font-mono" dir="ltr" />
                                  <input value={videoForm.description} onChange={e => setVideoForm(p => ({ ...p, description: e.target.value }))}
                                    placeholder="وصف مختصر (اختياري)"
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 outline-none" />
                                  <div className="flex gap-2">
                                    <button onClick={addVideo} className="bg-blue-800 text-white px-4 py-1.5 rounded-xl text-xs font-bold">إضافة</button>
                                    <button onClick={() => setShowVideoForm(null)} className="bg-gray-100 text-gray-600 px-4 py-1.5 rounded-xl text-xs">إلغاء</button>
                                  </div>
                                </div>
                              )}

                              {/* قائمة الفيديوهات */}
                              {videos.length === 0
                                ? <p className="text-xs text-gray-400 text-center py-3 bg-white rounded-xl border border-dashed border-gray-200">لا توجد فيديوهات — أضف أول فيديو لتوثيق رحلة المشروع</p>
                                : (
                                  <div className="space-y-2">
                                    {VIDEO_TYPES.map(vt => {
                                      const typeVideos = videos.filter(v => v.type === vt.id);
                                      if (typeVideos.length === 0) return null;
                                      return (
                                        <div key={vt.id}>
                                          <p className="text-xs font-bold text-gray-500 mb-1 flex items-center gap-1">{vt.emoji} {vt.label}</p>
                                          {typeVideos.map(v => (
                                            <div key={v.id} className="flex items-center gap-2 bg-white rounded-lg p-2.5 border border-gray-100 mb-1.5">
                                              <Play className="w-4 h-4 text-red-500 flex-shrink-0" />
                                              <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium text-gray-700 truncate">{v.title}</p>
                                                <p className="text-[10px] text-gray-400 truncate font-mono">{v.url}</p>
                                              </div>
                                              <button onClick={() => deleteVideo(v.id)} className="p-1 text-red-300 hover:text-red-500 flex-shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
                                            </div>
                                          ))}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )
                              }
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  ))}
                </div>
            }
          </div>
        );
      })()}

      {/* Coordinators */}
      {tab === "coordinators" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-800">طلبات المنسقين ({pendingCoords.length})</h2>
            <button onClick={async () => {
              const { cloudGet } = await import("@/lib/cloud");
              const [coords, students] = await Promise.all([
                cloudGet<import("@/contexts/AuthContext").CoordinatorProfile[]>("kc_coordinators"),
                cloudGet<import("@/contexts/AuthContext").StudentProfile[]>("kc_students"),
              ]);
              if (Array.isArray(coords) && coords.length > 0) localStorage.setItem("kc_coordinators", JSON.stringify(coords));
              if (Array.isArray(students) && students.length > 0) localStorage.setItem("kc_students", JSON.stringify(students));
              refresh();
            }} className="flex items-center gap-1.5 bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-green-500">
              ☁️ مزامنة من الإنترنت
            </button>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
            ⚠️ <strong>ملاحظة:</strong> يجب أن يسجّل المنسق من <strong>نفس المتصفح والجهاز</strong> الذي تستخدمه للإدارة. البيانات محفوظة محلياً في هذا المتصفح فقط.
          </div>
          {pendingCoords.length === 0
            ? <div className="card p-10 text-center text-gray-400"><Briefcase className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>لا توجد طلبات معلقة من المنسقين</p><p className="text-xs mt-2">اضغط "تحديث" إذا سجّل منسق جديد للتو</p></div>
            : pendingCoords.map(c => (
              <div key={c.id} className="card p-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center text-xl font-bold text-gray-500">
                    {c.photo ? <img src={c.photo} alt="" className="w-full h-full object-cover" /> : c.name[0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">{c.name}</p>
                    <p className="text-sm text-gray-500">{c.school} • {c.subject}</p>
                    <p className="text-xs text-gray-400">{c.email} • {c.phone}</p>
                    {c.cv && (
                      <button onClick={() => { const a = document.createElement("a"); a.href = c.cv; a.download = c.cvName || "cv.pdf"; a.click(); }}
                        className="mt-2 text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
                        📄 تحميل السيرة الذاتية ({c.cvName})
                      </button>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <button onClick={() => { approveCoordinator(c.id); refresh(); }}
                      className="flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-500">
                      <CheckCircle className="w-4 h-4" /> قبول
                    </button>
                    <button onClick={() => { rejectCoordinator(c.id); refresh(); }}
                      className="flex items-center gap-1.5 bg-orange-100 text-orange-600 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-orange-200">
                      <XCircle className="w-4 h-4" /> رفض
                    </button>
                    <button onClick={() => { if(confirm("حذف هذا المنسق نهائياً؟")) { deleteCoordinator(c.id); refresh(); } }}
                      className="flex items-center gap-1.5 bg-red-100 text-red-600 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-200">
                      <Trash2 className="w-4 h-4" /> حذف
                    </button>
                  </div>
                </div>
              </div>
            ))
          }
          {/* المنسقون المعتمدون */}
          {coordinators.filter(c => c.status === "approved").length > 0 && (
            <div className="mt-6">
              <h3 className="font-bold text-gray-700 mb-3">المنسقون المعتمدون ({coordinators.filter(c => c.status === "approved").length})</h3>
              <div className="card overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>{["المنسق", "المدرسة", "المادة", "البريد", "حذف"].map(h => <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 text-right">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {coordinators.filter(c => c.status === "approved").map(c => (
                      <tr key={c.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-100 flex-shrink-0 flex items-center justify-center text-xs font-bold text-blue-700">
                              {c.photo ? <img src={c.photo} alt="" className="w-full h-full object-cover" /> : c.name[0]}
                            </div>
                            <span className="text-sm font-medium">{c.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{c.school}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{c.subject}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{c.email}</td>
                        <td className="px-4 py-3"><button onClick={() => { if(confirm("حذف هذا المنسق؟")) { deleteCoordinator(c.id); refresh(); } }} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Shop */}
      {tab === "shop" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-800">المتجر ({shopItems.length})</h2>
            <button onClick={() => setShowSForm(!showSForm)} className="flex items-center gap-2 bg-blue-800 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700"><Plus className="w-4 h-4" /> منتج جديد</button>
          </div>
          {showSForm && (
            <div className="card p-5 space-y-3">
              <h3 className="font-bold text-gray-700">إضافة منتج جديد للمتجر</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><label className="text-xs font-semibold text-gray-600 mb-1 block">اسم المنتج *</label><input value={sForm.name} onChange={e => setSForm(p => ({ ...p, name: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-blue-500" /></div>
                <div className="col-span-2"><label className="text-xs font-semibold text-gray-600 mb-1 block">الوصف</label><textarea value={sForm.description} onChange={e => setSForm(p => ({ ...p, description: e.target.value }))} rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none resize-none" /></div>
                <div><label className="text-xs font-semibold text-gray-600 mb-1 block">السعر (ر.س) *</label><input value={sForm.price} onChange={e => setSForm(p => ({ ...p, price: e.target.value }))} placeholder="مثال: 50" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-blue-500" /></div>
                <div><label className="text-xs font-semibold text-gray-600 mb-1 block">الفئة</label><select value={sForm.category} onChange={e => setSForm(p => ({ ...p, category: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none"><option>كتب</option><option>مكونات إلكترونية</option><option>أدوات</option><option>روبوتات</option><option>أخرى</option></select></div>
                <div><label className="text-xs font-semibold text-gray-600 mb-1 block">رقم التواصل</label><input value={sForm.contact} onChange={e => setSForm(p => ({ ...p, contact: e.target.value }))} placeholder="05XXXXXXXX" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-blue-500" /></div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">صورة المنتج</label>
                  <label className={`border-2 border-dashed rounded-xl px-3 py-2.5 cursor-pointer text-sm flex items-center gap-2 ${sForm.image ? "border-blue-400 bg-blue-50 text-blue-700" : "border-gray-300 text-gray-400 hover:border-blue-400"}`}>
                    <ShoppingBag className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{sForm.imageName || "اختر صورة"}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={e => {
                      const f = e.target.files?.[0]; if (!f) return;
                      const r = new FileReader();
                      r.onload = ev => setSForm(p => ({ ...p, image: ev.target?.result as string, imageName: f.name }));
                      r.readAsDataURL(f); e.target.value = "";
                    }} />
                  </label>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { if (!sForm.name.trim() || !sForm.price.trim()) return; addShopItem(sForm); setShowSForm(false); setSForm({ name: "", description: "", price: "", image: "", imageName: "", category: "كتب", contact: "" }); refresh(); }} className="bg-blue-800 text-white px-6 py-2 rounded-xl text-sm font-semibold">إضافة</button>
                <button onClick={() => setShowSForm(false)} className="bg-gray-100 text-gray-600 px-6 py-2 rounded-xl text-sm">إلغاء</button>
              </div>
            </div>
          )}
          {shopItems.length === 0
            ? <div className="card p-10 text-center text-gray-400"><ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>لا توجد منتجات في المتجر بعد</p></div>
            : <div className="grid md:grid-cols-2 gap-4">
                {shopItems.map(s => (
                  <div key={s.id} className="card overflow-hidden">
                    {s.image
                      ? <img src={s.image} alt="" className="w-full h-32 object-cover" />
                      : <div className="w-full h-32 bg-gray-100 flex items-center justify-center text-4xl">🛒</div>
                    }
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div><p className="font-bold text-gray-800">{s.name}</p><span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{s.category}</span></div>
                        <span className="font-bold text-green-600">{s.price} ر.س</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 mb-3">{s.description}</p>
                      <button onClick={() => { if(confirm("حذف هذا المنتج؟")) { deleteShopItem(s.id); refresh(); } }} className="flex items-center gap-2 text-red-500 text-xs hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /> حذف</button>
                    </div>
                  </div>
                ))}
              </div>
          }
        </div>
      )}

      {/* Platform Achievements */}
      {tab === "achievements" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-800">إنجازات المنصة ({platformAchievements.length})</h2>
            <button onClick={() => setShowAForm(!showAForm)} className="flex items-center gap-2 bg-blue-800 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700"><Plus className="w-4 h-4" /> إنجاز جديد</button>
          </div>
          {showAForm && (
            <div className="card p-5 space-y-3">
              <h3 className="font-bold text-gray-700">إضافة إنجاز جديد للمنصة</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><label className="text-xs font-semibold text-gray-600 mb-1 block">عنوان الإنجاز *</label><input value={aForm.title} onChange={e => setAForm(p => ({ ...p, title: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-blue-500" /></div>
                <div className="col-span-2"><label className="text-xs font-semibold text-gray-600 mb-1 block">الوصف</label><textarea value={aForm.description} onChange={e => setAForm(p => ({ ...p, description: e.target.value }))} rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none resize-none" /></div>
                <div><label className="text-xs font-semibold text-gray-600 mb-1 block">التاريخ</label><input type="date" value={aForm.date} onChange={e => setAForm(p => ({ ...p, date: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none" /></div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">صورة الإنجاز</label>
                  <label className={`border-2 border-dashed rounded-xl px-3 py-2.5 cursor-pointer text-sm flex items-center gap-2 ${aForm.image ? "border-yellow-400 bg-yellow-50 text-yellow-700" : "border-gray-300 text-gray-400 hover:border-yellow-400"}`}>
                    <Star className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{aForm.imageName || "اختر صورة"}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={e => {
                      const f = e.target.files?.[0]; if (!f) return;
                      const r = new FileReader();
                      r.onload = ev => setAForm(p => ({ ...p, image: ev.target?.result as string, imageName: f.name }));
                      r.readAsDataURL(f); e.target.value = "";
                    }} />
                  </label>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { if (!aForm.title.trim()) return; addPlatformAchievement(aForm); setShowAForm(false); setAForm({ title: "", description: "", date: "", image: "", imageName: "" }); refresh(); }} className="bg-blue-800 text-white px-6 py-2 rounded-xl text-sm font-semibold">إضافة</button>
                <button onClick={() => setShowAForm(false)} className="bg-gray-100 text-gray-600 px-6 py-2 rounded-xl text-sm">إلغاء</button>
              </div>
            </div>
          )}
          {platformAchievements.length === 0
            ? <div className="card p-10 text-center text-gray-400"><Star className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>لا توجد إنجازات بعد</p></div>
            : <div className="grid md:grid-cols-2 gap-4">
                {platformAchievements.map(a => (
                  <div key={a.id} className="card overflow-hidden">
                    {a.image && <img src={a.image} alt="" className="w-full h-36 object-cover" />}
                    <div className="p-4">
                      <p className="font-bold text-gray-800">{a.title}</p>
                      {a.date && <p className="text-xs text-gray-400 mt-0.5">{new Date(a.date).toLocaleDateString("ar-SA")}</p>}
                      <p className="text-sm text-gray-600 mt-2">{a.description}</p>
                      <button onClick={() => { if(confirm("حذف هذا الإنجاز؟")) { deletePlatformAchievement(a.id); refresh(); } }} className="mt-3 flex items-center gap-2 text-red-500 text-xs hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /> حذف</button>
                    </div>
                  </div>
                ))}
              </div>
          }
        </div>
      )}

      {/* Registration Codes */}
      {tab === "codes" && (
        <div className="space-y-5 max-w-lg">

        {/* مفتاح Groq */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center text-xl">🤖</div>
            <div>
              <h2 className="font-bold text-gray-800">مفتاح المساعد الذكي (Groq)</h2>
              <p className="text-xs text-gray-400">مجاني 100% — أسرع من Gemini — لا يحتاج بطاقة بنكية</p>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-xs text-green-800 space-y-1">
            <p className="font-semibold">طريقة الحصول على المفتاح المجاني:</p>
            <p>١. افتح: <span className="font-mono bg-green-100 px-1 rounded">console.groq.com</span></p>
            <p>٢. سجّل حساباً جديداً (بريد إلكتروني فقط)</p>
            <p>٣. من القائمة اضغط <span className="font-semibold">API Keys</span> ثم <span className="font-semibold">Create API Key</span></p>
            <p>٤. انسخ المفتاح (يبدأ بـ <span className="font-mono">gsk_</span>) والصقه أدناه</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">مفتاح Groq API</label>
            <input
              type="password"
              id="groq-key-input"
              defaultValue={typeof window !== "undefined" ? localStorage.getItem("kc_groq_key") || "" : ""}
              onChange={e => { if (typeof window !== "undefined") localStorage.setItem("kc_groq_key", e.target.value.trim()); }}
              placeholder="gsk_..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-violet-500 font-mono"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={() => {
              const key = typeof window !== "undefined" ? localStorage.getItem("kc_groq_key") : "";
              if (!key) { alert("❌ الحقل فارغ — أدخل المفتاح أولاً"); return; }
              alert("✅ المفتاح محفوظ بنجاح! يمكنك الآن استخدام المساعد الذكي");
            }} className="bg-violet-700 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-violet-600">
              حفظ
            </button>
            <button onClick={() => {
              if (typeof window !== "undefined") { localStorage.removeItem("kc_groq_key"); }
              const input = document.getElementById("groq-key-input") as HTMLInputElement;
              if (input) input.value = "";
              alert("تم حذف المفتاح");
            }} className="bg-gray-100 text-gray-600 px-5 py-2 rounded-xl text-sm hover:bg-gray-200">
              حذف
            </button>
          </div>
        </div>

        {/* رموز التسجيل */}
        <div className="card p-6 space-y-5">
          <div className="flex items-center gap-3 mb-2">
            <Key className="w-6 h-6 text-yellow-600" />
            <h2 className="font-bold text-gray-800 text-lg">رموز التسجيل السرية</h2>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
            إذا تركت الرمز فارغاً يمكن لأي شخص التسجيل بدون رمز. إذا حددت رمزاً فلن يستطيع التسجيل إلا من يعرفه.
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">رمز تسجيل الطلاب</label>
            <input
              value={regCodes.studentCode}
              onChange={e => setRegCodesState(p => ({ ...p, studentCode: e.target.value }))}
              placeholder="اتركه فارغاً للسماح للجميع"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">رمز تسجيل المنسقين</label>
            <input
              value={regCodes.coordCode}
              onChange={e => setRegCodesState(p => ({ ...p, coordCode: e.target.value }))}
              placeholder="اتركه فارغاً للسماح للجميع"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-blue-500"
            />
          </div>
          <button
            onClick={() => { setRegCodes(regCodes); alert("تم حفظ رموز التسجيل بنجاح ✓"); }}
            className="w-full bg-yellow-500 text-white py-3 rounded-xl font-bold hover:bg-yellow-400">
            حفظ الرموز
          </button>
          {(regCodes.studentCode || regCodes.coordCode) && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-1">
              <p className="text-xs font-semibold text-green-700">الرموز الحالية:</p>
              {regCodes.studentCode && <p className="text-sm text-green-800">طلاب: <span className="font-mono font-bold">{regCodes.studentCode}</span></p>}
              {regCodes.coordCode && <p className="text-sm text-green-800">منسقون: <span className="font-mono font-bold">{regCodes.coordCode}</span></p>}
            </div>
          )}
        </div>
        </div>
      )}

      {/* Daily Log */}
      {tab === "daily" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-800">يوميات مركز الابتكار ({dailyLog.length})</h2>
            <button onClick={() => setShowDForm(!showDForm)} className="flex items-center gap-2 bg-blue-800 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700"><Plus className="w-4 h-4" /> إضافة يومية</button>
          </div>
          {showDForm && (
            <div className="card p-5 space-y-3">
              <h3 className="font-bold text-gray-700">إضافة يومية جديدة</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><label className="text-xs font-semibold text-gray-600 mb-1 block">العنوان *</label><input value={dForm.title} onChange={e => setDForm(p => ({ ...p, title: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-blue-500" /></div>
                <div><label className="text-xs font-semibold text-gray-600 mb-1 block">التاريخ</label><input type="date" value={dForm.date} onChange={e => setDForm(p => ({ ...p, date: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none" /></div>
                <div><label className="text-xs font-semibold text-gray-600 mb-1 block">التصنيف</label><select value={dForm.category} onChange={e => setDForm(p => ({ ...p, category: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none"><option>نشاط</option><option>مسابقة</option><option>زيارة</option><option>إنجاز</option><option>تدريب</option><option>ورشة عمل</option><option>أخرى</option></select></div>
                <div className="col-span-2"><label className="text-xs font-semibold text-gray-600 mb-1 block">الوصف / التفاصيل</label><textarea value={dForm.description} onChange={e => setDForm(p => ({ ...p, description: e.target.value }))} rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none resize-none" /></div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">صور ({dForm.images.length})</label>
                  <label className="border-2 border-dashed border-gray-300 rounded-xl px-3 py-2.5 cursor-pointer text-sm flex items-center gap-2 text-gray-400 hover:border-blue-400">
                    <ImageIcon className="w-4 h-4" /> إضافة صور (متعددة)
                    <input type="file" accept="image/*" multiple className="hidden" onChange={e => {
                      const files = Array.from(e.target.files || []);
                      files.forEach(f => {
                        const r = new FileReader();
                        r.onload = ev => setDForm(p => ({ ...p, images: [...p.images, { data: ev.target?.result as string, name: f.name }] }));
                        r.readAsDataURL(f);
                      });
                      e.target.value = "";
                    }} />
                  </label>
                  {dForm.images.length > 0 && (
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {dForm.images.map((img, i) => (
                        <div key={i} className="relative">
                          <img src={img.data} alt="" className="w-16 h-16 rounded-lg object-cover" />
                          <button onClick={() => setDForm(p => ({ ...p, images: p.images.filter((_, j) => j !== i) }))}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">روابط الفيديو (YouTube)</label>
                  {dForm.videoLinks.map((link, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <input value={link} onChange={e => setDForm(p => ({ ...p, videoLinks: p.videoLinks.map((l, j) => j === i ? e.target.value : l) }))}
                        placeholder="https://youtube.com/..." className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 outline-none" />
                      {dForm.videoLinks.length > 1 && <button onClick={() => setDForm(p => ({ ...p, videoLinks: p.videoLinks.filter((_, j) => j !== i) }))} className="text-red-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>}
                    </div>
                  ))}
                  <button onClick={() => setDForm(p => ({ ...p, videoLinks: [...p.videoLinks, ""] }))} className="text-xs text-blue-600 hover:text-blue-700">+ إضافة رابط</button>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => {
                  if (!dForm.title.trim()) return;
                  addDailyLogEntry({ ...dForm, videoLinks: dForm.videoLinks.filter(l => l.trim()) });
                  setShowDForm(false);
                  setDForm({ title: "", date: "", description: "", category: "نشاط", images: [], videoLinks: [""] });
                  refresh();
                }} className="bg-blue-800 text-white px-6 py-2 rounded-xl text-sm font-semibold">نشر</button>
                <button onClick={() => setShowDForm(false)} className="bg-gray-100 text-gray-600 px-6 py-2 rounded-xl text-sm">إلغاء</button>
              </div>
            </div>
          )}
          {dailyLog.length === 0
            ? <div className="card p-10 text-center text-gray-400"><CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>لا توجد يوميات بعد</p></div>
            : <div className="space-y-4">
                {[...dailyLog].reverse().map(entry => {
                  const catColors: Record<string, string> = { نشاط: "bg-blue-100 text-blue-700", مسابقة: "bg-yellow-100 text-yellow-700", زيارة: "bg-teal-100 text-teal-700", إنجاز: "bg-green-100 text-green-700", تدريب: "bg-purple-100 text-purple-700", "ورشة عمل": "bg-orange-100 text-orange-700", أخرى: "bg-gray-100 text-gray-600" };
                  return (
                    <div key={entry.id} className="card overflow-hidden">
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div>
                            <h3 className="font-bold text-gray-800">{entry.title}</h3>
                            <div className="flex gap-2 mt-1">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${catColors[entry.category] || catColors["أخرى"]}`}>{entry.category}</span>
                              {entry.date && <span className="text-xs text-gray-400">{new Date(entry.date).toLocaleDateString("ar-SA")}</span>}
                            </div>
                          </div>
                          <button onClick={() => { if(confirm("حذف هذه اليومية؟")) { deleteDailyLogEntry(entry.id); refresh(); } }} className="p-2 text-red-400 hover:bg-red-50 rounded-xl flex-shrink-0"><Trash2 className="w-4 h-4" /></button>
                        </div>
                        {entry.description && <p className="text-sm text-gray-600 leading-relaxed">{entry.description}</p>}
                        {entry.images.length > 0 && (
                          <div className="flex gap-2 mt-3 flex-wrap">
                            {entry.images.map((img, i) => <img key={i} src={img.data} alt="" className="w-20 h-20 rounded-xl object-cover" />)}
                          </div>
                        )}
                        {entry.videoLinks.length > 0 && (
                          <div className="mt-3 space-y-1">
                            {entry.videoLinks.map((link, i) => <a key={i} href={link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-red-600 hover:text-red-500"><Play className="w-3.5 h-3.5" /> {link}</a>)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
          }
        </div>
      )}

      {/* مركز المعرفة CMS */}
      {tab === "knowledge" && (
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">إدارة مركز المعرفة</h3>
              <p className="text-xs text-gray-400">أضف وعدّل وأحذف الأدلة والنماذج والسياسات والإجراءات والخطط</p>
            </div>
          </div>
          <KnowledgeAdmin />
        </div>
      )}

      {/* البرامج CMS */}
      {tab === "programs_cms" && (
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center"><Layers className="w-5 h-5 text-purple-700" /></div>
            <div><h3 className="font-bold text-gray-800">إدارة البرامج</h3><p className="text-xs text-gray-400">أضف وعدّل وأحذف برامج مركز البرامج</p></div>
          </div>
          <SectionCMS config={PROGRAMS_CONFIG} />
        </div>
      )}

      {/* المسابقات CMS */}
      {tab === "competitions_cms" && (
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center"><Trophy className="w-5 h-5 text-yellow-700" /></div>
            <div><h3 className="font-bold text-gray-800">إدارة المسابقات والجوائز</h3><p className="text-xs text-gray-400">أضف وعدّل وأحذف المسابقات</p></div>
          </div>
          <SectionCMS config={COMPETITIONS_CONFIG} />
        </div>
      )}

      {/* بنك المشاريع CMS */}
      {tab === "project_bank_cms" && (
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center"><Archive className="w-5 h-5 text-slate-700" /></div>
            <div><h3 className="font-bold text-gray-800">إدارة بنك المشاريع</h3><p className="text-xs text-gray-400">أضف وعدّل وأحذف أفكار المشاريع</p></div>
          </div>
          <SectionCMS config={PROJECT_BANK_CONFIG} />
        </div>
      )}

      {/* التقنيات الناشئة CMS */}
      {tab === "emerging_tech_cms" && (
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center"><Cpu className="w-5 h-5 text-indigo-700" /></div>
            <div><h3 className="font-bold text-gray-800">إدارة التقنيات الناشئة</h3><p className="text-xs text-gray-400">أضف وعدّل وأحذف التقنيات الناشئة</p></div>
          </div>
          <SectionCMS config={EMERGING_TECH_CONFIG} />
        </div>
      )}

      {/* المؤشرات CMS */}
      {tab === "indicators_cms" && (
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center"><BarChart3 className="w-5 h-5 text-orange-700" /></div>
            <div><h3 className="font-bold text-gray-800">إدارة مؤشرات الأداء</h3><p className="text-xs text-gray-400">عدّل مؤشرات الأداء الرئيسية KPIs</p></div>
          </div>
          <SectionCMS config={INDICATORS_CONFIG} />
        </div>
      )}

      {/* الاجتماعات */}
      {tab === "meetings_admin" && (
        <div className="space-y-4">
          <div className="card p-5 bg-gradient-to-l from-violet-800 to-indigo-700 text-white">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center"><Video className="w-6 h-6" /></div>
                <div>
                  <h3 className="font-bold text-lg">إدارة الاجتماعات</h3>
                  <p className="text-indigo-200 text-xs">إنشاء واستعراض وإدارة اجتماعات المنسقين</p>
                </div>
              </div>
              <a href="/meetings" className="bg-white text-violet-800 px-4 py-2 rounded-xl text-sm font-bold hover:bg-violet-50 flex items-center gap-2 flex-shrink-0">
                <Video className="w-4 h-4" /> فتح إدارة الاجتماعات
              </a>
            </div>
            {(() => {
              try {
                const ms: {status:string;agenda:{status:string}[];discussions:{id:string}[];title:string;date:string}[] = JSON.parse(localStorage.getItem("kc_meetings") || "[]");
                const total = ms.length;
                const active = ms.filter(m=>m.status==="active").length;
                const upcoming = ms.filter(m=>m.status==="upcoming").length;
                const completed = ms.filter(m=>m.status==="completed").length;
                return (
                  <div className="grid grid-cols-4 gap-2 mt-4">
                    {[{n:total,l:"إجمالي",e:"📊"},{n:active,l:"جارٍ",e:"🟢"},{n:upcoming,l:"قادم",e:"⏳"},{n:completed,l:"منتهي",e:"✅"}].map(s=>(
                      <div key={s.l} className="bg-white/10 rounded-xl p-2 text-center">
                        <div className="text-lg">{s.e}</div>
                        <div className="text-xl font-bold">{s.n}</div>
                        <div className="text-indigo-200 text-[10px]">{s.l}</div>
                      </div>
                    ))}
                  </div>
                );
              } catch { return null; }
            })()}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              { emoji: "📌", title: "المحاور", desc: "حدد محاور الاجتماع مسبقاً وتابع حالة كل محور" },
              { emoji: "💬", title: "النقاش المفتوح", desc: "كل منسق يضيف رأيه ومداخلته على كل محور" },
              { emoji: "🗳️", title: "التصويت", desc: "صوّت على قرارات الاجتماع مع بار تقدم مرئي" },
              { emoji: "📄", title: "المحضر الرسمي", desc: "توليد المحضر تلقائياً من النقاش والقرارات" },
            ].map(f=>(
              <div key={f.emoji} className="card p-4 flex items-start gap-3">
                <div className="text-3xl flex-shrink-0">{f.emoji}</div>
                <div>
                  <p className="font-bold text-gray-800 text-sm">{f.title}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="card p-5 bg-amber-50 border border-amber-100">
            <p className="font-bold text-amber-800 text-sm mb-2">📋 دليل سريع — مراحل الاجتماع</p>
            <div className="space-y-2">
              {[
                { step: "١", text: "إنشاء اجتماع: أضف العنوان، التاريخ، الوقت، المعنيين" },
                { step: "٢", text: "المحاور: أضف نقاط جدول الأعمال قبل الاجتماع" },
                { step: "٣", text: "النقاش: كل منسق يكتب رأيه على كل محور" },
                { step: "٤", text: "التصويت: اضغط 👍 أو 👎 لكل محور ثم اكتب القرار" },
                { step: "٥", text: "المحضر: اضغط «توليد تلقائي» أو اكتب يدوياً ثم اطبع" },
              ].map(s=>(
                <div key={s.step} className="flex items-start gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-200 text-amber-800 text-xs flex items-center justify-center font-bold flex-shrink-0">{s.step}</span>
                  <p className="text-amber-700 text-xs leading-relaxed">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* التقرير الشهري */}
      {tab === "monthly_report" && <MonthlyReport />}

      {/* السبورة الذكية */}
      {tab === "whiteboard_admin" && (
        <div className="space-y-4 max-w-lg">
          <div className="card p-6 bg-gradient-to-l from-indigo-800 to-blue-700 text-white">
            <div className="flex items-center gap-3">
              <div className="text-4xl">🖊️</div>
              <div>
                <h2 className="text-xl font-bold">السبورة الذكية</h2>
                <p className="text-blue-200 text-sm">أداة رسم وشرح تفاعلية للمعلم والطالب</p>
              </div>
            </div>
          </div>

          <div className="card p-5 space-y-4">
            <h3 className="font-bold text-gray-700">مزايا السبورة</h3>
            {[
              { emoji: "✏️", title: "الرسم الحر", desc: "قلم بأحجام وألوان متعددة مع ممحاة" },
              { emoji: "📐", title: "الأشكال الهندسية", desc: "مستطيل، دائرة، خط، سهم" },
              { emoji: "🔤", title: "إضافة نصوص", desc: "اكتب تعليقات وشروحات بالعربية" },
              { emoji: "🖼️", title: "رفع الصور", desc: "ارفع صورة وارسم عليها توضيحات" },
              { emoji: "↩️", title: "التراجع والإعادة", desc: "تراجع عن أي خطأ بسهولة" },
              { emoji: "💾", title: "تحميل كصورة", desc: "احفظ السبورة كملف PNG" },
              { emoji: "🖥️", title: "ملء الشاشة", desc: "وضع العرض التقديمي للشرح" },
              { emoji: "🎨", title: "ألوان ومقاسات", desc: "10 ألوان جاهزة + منتقي لون مخصص" },
            ].map(f => (
              <div key={f.emoji} className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">{f.emoji}</span>
                <div>
                  <p className="font-semibold text-gray-700 text-sm">{f.title}</p>
                  <p className="text-gray-400 text-xs">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="card p-5 space-y-3">
            <h3 className="font-bold text-gray-700">أين تظهر السبورة؟</h3>
            {[
              { page: "صفحة البث المباشر", path: "/live", color: "bg-red-50 text-red-700 border-red-100" },
              { page: "صفحة الدورات التدريبية", path: "/training", color: "bg-green-50 text-green-700 border-green-100" },
              { page: "صفحة السبورة المستقلة", path: "/whiteboard", color: "bg-indigo-50 text-indigo-700 border-indigo-100" },
            ].map(p => (
              <div key={p.path} className={`flex items-center justify-between p-3 rounded-xl border ${p.color}`}>
                <span className="text-sm font-medium">{p.page}</span>
                <a href={p.path} target="_blank" rel="noopener noreferrer"
                  className="text-xs underline opacity-70 hover:opacity-100">{p.path}</a>
              </div>
            ))}
          </div>

          <a href="/whiteboard" target="_blank" rel="noopener noreferrer"
            className="card p-4 flex items-center justify-center gap-3 bg-indigo-700 text-white hover:bg-indigo-600 transition-colors cursor-pointer text-lg font-bold rounded-2xl">
            🖊️ فتح السبورة الذكية
          </a>
        </div>
      )}

      {/* ملف المشرف الشخصي */}
      {tab === "supervisor_profile" && <SupervisorProfileEditor />}

      {/* طلبات الزوار */}
      {tab === "visitors" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <Globe className="w-5 h-5 text-teal-600" />
              طلبات تسجيل الزوار ({visitorRequests.filter(v => v.status === "pending").length} معلق)
            </h2>
            <div className="flex gap-2 text-xs">
              <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-lg font-medium">
                ⏳ معلق: {visitorRequests.filter(v => v.status === "pending").length}
              </span>
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-lg font-medium">
                ✅ معتمد: {visitorRequests.filter(v => v.status === "approved").length}
              </span>
              <span className="bg-red-100 text-red-700 px-2 py-1 rounded-lg font-medium">
                ❌ مرفوض: {visitorRequests.filter(v => v.status === "rejected").length}
              </span>
            </div>
          </div>

          {visitorRequests.length === 0 && (
            <div className="card p-10 text-center text-gray-400">
              <Globe className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>لا توجد طلبات زوار حتى الآن</p>
            </div>
          )}

          {/* المعلقة أولاً */}
          {visitorRequests.filter(v => v.status === "pending").map(v => (
            <div key={v.id} className="card p-4 border-r-4 border-yellow-400">
              <div className="flex items-start gap-4 flex-wrap">
                <div className="w-11 h-11 bg-teal-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                  {v.purpose === "courses" ? "🎓" : v.purpose === "shop" ? "🛍️" : "📰"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-gray-800">{v.name}</p>
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">⏳ بانتظار الموافقة</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{v.phone}{v.email ? ` • ${v.email}` : ""}</p>
                  <p className="text-sm text-teal-700 font-medium mt-1">{PURPOSE_LABELS_MAP[v.purpose]}</p>
                  {v.notes && <p className="text-xs text-gray-400 mt-1 bg-gray-50 rounded-lg px-2 py-1">"{v.notes}"</p>}
                  <p className="text-xs text-gray-300 mt-1">{new Date(v.submittedAt).toLocaleDateString("ar-SA")}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => {
                    const updated = visitorRequests.map(r => r.id === v.id ? { ...r, status: "approved" as const } : r);
                    saveVisitorRequests(updated); setVisitorRequests(updated);
                  }} className="flex items-center gap-1.5 bg-green-600 text-white px-3 py-2 rounded-xl text-sm font-semibold hover:bg-green-500">
                    <CheckCircle className="w-4 h-4" /> قبول
                  </button>
                  <button onClick={() => {
                    const updated = visitorRequests.map(r => r.id === v.id ? { ...r, status: "rejected" as const } : r);
                    saveVisitorRequests(updated); setVisitorRequests(updated);
                  }} className="flex items-center gap-1.5 bg-red-100 text-red-600 px-3 py-2 rounded-xl text-sm font-semibold hover:bg-red-200">
                    <XCircle className="w-4 h-4" /> رفض
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* المعتمدة */}
          {visitorRequests.filter(v => v.status === "approved").length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-2 mt-4">الزوار المعتمدون</h3>
              {visitorRequests.filter(v => v.status === "approved").map(v => (
                <div key={v.id} className="card p-3 mb-2 flex items-center gap-3">
                  <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                    {v.purpose === "courses" ? "🎓" : v.purpose === "shop" ? "🛍️" : "📰"}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 text-sm">{v.name}</p>
                    <p className="text-xs text-gray-400">{v.phone} • {PURPOSE_LABELS_MAP[v.purpose]}</p>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✅ معتمد</span>
                  <button onClick={() => {
                    const updated = visitorRequests.filter(r => r.id !== v.id);
                    saveVisitorRequests(updated); setVisitorRequests(updated);
                  }} className="text-red-400 hover:text-red-600 p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Permissions */}
      {tab === "permissions" && (
        <div className="card p-5">
          <h3 className="font-bold text-gray-800 mb-1">مصفوفة الصلاحيات</h3>
          <p className="text-xs text-gray-400 mb-4">جميع أقسام المنصة وصلاحيات كل دور</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-l from-blue-900 to-indigo-800 text-white">
                  <th className="px-4 py-3 text-right rounded-r-xl font-semibold">القسم / الصلاحية</th>
                  {[
                    { label: "مدير النظام", emoji: "👑" },
                    { label: "المنسق", emoji: "👨‍🏫" },
                    { label: "الطالب", emoji: "👨‍🎓" },
                    { label: "الزائر", emoji: "🌐" },
                  ].map(r => (
                    <th key={r.label} className="px-3 py-3 text-center font-semibold last:rounded-l-xl">
                      <div>{r.emoji}</div>
                      <div className="text-xs font-normal mt-0.5">{r.label}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { section: "📋 الأقسام الرئيسية", header: true },
                  { perm: "مركز المعرفة",           roles: [true,  true,  true,  false] },
                  { perm: "مركز البرامج",            roles: [true,  true,  true,  false] },
                  { perm: "مركز المشاريع",           roles: [true,  true,  true,  false] },
                  { perm: "مركز التدريب",            roles: [true,  true,  true,  true]  },
                  { perm: "مركز المؤشرات",           roles: [true,  true,  false, false] },
                  { perm: "التقنيات الناشئة",        roles: [true,  true,  true,  false] },
                  { perm: "بنك المشاريع",            roles: [true,  true,  true,  true]  },
                  { perm: "يوميات المركز",           roles: [true,  true,  true,  true]  },
                  { perm: "المسابقات والجوائز",      roles: [true,  true,  true,  true]  },

                  { section: "👤 البوابات الشخصية", header: true },
                  { perm: "بوابة الطلاب",            roles: [true,  true,  true,  false] },
                  { perm: "بوابة المنسقين",          roles: [true,  true,  false, false] },
                  { perm: "بوابة الأولياء",          roles: [true,  true,  false, false] },
                  { perm: "بوابة الزوار",            roles: [true,  false, false, true]  },
                  { perm: "الملف المهني",            roles: [true,  true,  true,  false] },
                  { perm: "الملف الشخصي للمشرف",    roles: [true,  false, false, false] },

                  { section: "🤝 التعاون والتواصل", header: true },
                  { perm: "الجروبات والمحادثات",    roles: [true,  true,  true,  false] },
                  { perm: "الاجتماعات",              roles: [true,  true,  false, false] },
                  { perm: "البث المباشر",            roles: [true,  false, false, false] },
                  { perm: "المساعد الذكي",           roles: [true,  true,  true,  false] },

                  { section: "📊 المتابعة والإنجاز", header: true },
                  { perm: "متابعة المشاريع (كانبان)", roles: [true, true,  true,  false] },
                  { perm: "لوحة المتصدرين",          roles: [true,  true,  true,  false] },
                  { perm: "الشهادات الرقمية",        roles: [true,  true,  true,  false] },
                  { perm: "التقارير الشهرية",        roles: [true,  false, false, false] },

                  { section: "⚙️ الإدارة والتحكم", header: true },
                  { perm: "لوحة الإدارة الكاملة",   roles: [true,  false, false, false] },
                  { perm: "اعتماد الطلاب والمنسقين", roles: [true,  false, false, false] },
                  { perm: "إدارة المحتوى (CMS)",    roles: [true,  false, false, false] },
                  { perm: "رموز التسجيل",            roles: [true,  false, false, false] },
                  { perm: "إدارة المتجر",            roles: [true,  false, false, false] },
                  { perm: "طلبات الزوار",            roles: [true,  false, false, false] },
                  { perm: "مصفوفة الصلاحيات",       roles: [true,  false, false, false] },
                ].map((row, idx) => {
                  if ("header" in row) {
                    return (
                      <tr key={idx}>
                        <td colSpan={5} className="px-4 py-2 text-xs font-bold text-gray-500 bg-gray-50 border-t border-b border-gray-100">
                          {row.section}
                        </td>
                      </tr>
                    );
                  }
                  return (
                    <tr key={idx} className="hover:bg-blue-50/30 border-b border-gray-50">
                      <td className="px-4 py-2.5 font-medium text-gray-700">{row.perm}</td>
                      {row.roles.map((ok, i) => (
                        <td key={i} className="px-3 py-2.5 text-center">
                          <span className={`text-base font-bold ${ok ? "text-green-500" : "text-gray-200"}`}>
                            {ok ? "✓" : "✗"}
                          </span>
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===== مكوّن التقرير الشهري ===== */
function MonthlyReport() {
  const [generated, setGenerated] = useState(false);

  const g = (key: string) => { try { const d = localStorage.getItem(key); return d ? JSON.parse(d) : []; } catch { return []; } };

  const students: {status:string}[] = g("kc_students");
  const coords: {status:string}[] = g("kc_coordinators");
  const programs = g("kc_programs");
  const competitions = g("kc_competitions");
  const courses = g("kc_courses");
  const projects = g("kc_projects");
  const kanban: {stage:string}[] = g("kc_kanban");
  const certs = g("kc_certificates");
  const points: {points:number}[] = g("kc_points");
  const meetings: {status:string}[] = g("kc_meetings");
  const knowledge = ["kc_knowledge_guides","kc_knowledge_forms","kc_knowledge_policies","kc_knowledge_procedures","kc_knowledge_plans"].reduce((s,k)=>s+(g(k) as unknown[]).length,0);

  const approvedStudents = students.filter(s=>s.status==="approved").length;
  const approvedCoords = coords.filter(c=>c.status==="approved").length;
  const totalPoints = points.reduce((s,p)=>s+(p.points||0),0);
  const completedKanban = kanban.filter(k=>k.stage==="final").length;
  const completedMeetings = meetings.filter(m=>m.status==="completed").length;

  const now = new Date();
  const monthName = now.toLocaleDateString("ar-SA",{month:"long",year:"numeric"});

  const stats = [
    {label:"الطلاب المعتمدون",value:approvedStudents,icon:"👨‍🎓"},
    {label:"المنسقون",value:approvedCoords,icon:"👩‍💼"},
    {label:"البرامج",value:programs.length,icon:"📚"},
    {label:"المسابقات",value:competitions.length,icon:"🏆"},
    {label:"الدورات التدريبية",value:courses.length,icon:"🎓"},
    {label:"مشاريع مكتملة",value:completedKanban,icon:"✅"},
    {label:"الشهادات المصدرة",value:certs.length,icon:"🎖️"},
    {label:"النقاط الموزعة",value:totalPoints,icon:"⭐"},
    {label:"الاجتماعات المنعقدة",value:completedMeetings,icon:"📋"},
    {label:"وثائق المعرفة",value:knowledge,icon:"📁"},
    {label:"إجمالي المشاريع",value:projects.length,icon:"💡"},
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center"><BarChart3 className="w-5 h-5 text-orange-700"/></div>
          <div><h3 className="font-bold text-gray-800">التقرير الشهري التلقائي</h3><p className="text-xs text-gray-400">{monthName}</p></div>
        </div>
        <div className="flex gap-2">
          <button onClick={()=>setGenerated(true)} className="bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-orange-500 flex items-center gap-2">
            <BarChart3 className="w-4 h-4"/> توليد التقرير
          </button>
          {generated && <button onClick={()=>window.print()} className="bg-gray-700 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-600">🖨️ طباعة PDF</button>}
        </div>
      </div>
      {!generated ? (
        <div className="card p-10 text-center text-gray-400">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30"/>
          <p>اضغط "توليد التقرير" لاستخراج إحصائيات المنصة كاملة</p>
        </div>
      ) : (
        <div>
          <div className="card p-6 bg-gradient-to-l from-orange-700 to-amber-600 text-white mb-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold">تقرير مركز المعرفة والابتكار STEAM</h2>
              <p className="text-orange-100 mt-1">{monthName} | مدارس الأرقم</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {stats.map(s=>(
              <div key={s.label} className="card p-4 text-center hover:shadow-md transition-shadow">
                <div className="text-3xl mb-2">{s.icon}</div>
                <div className="text-3xl font-bold text-gray-800">{s.value}</div>
                <div className="text-xs text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="card p-5 mb-3">
            <h4 className="font-bold text-gray-800 mb-3">ملخص إنجازات المركز</h4>
            <div className="space-y-2 text-sm text-gray-700 leading-relaxed">
              <p>• بلغ إجمالي الطلاب المعتمدين <strong>{approvedStudents}</strong> طالباً والمنسقين <strong>{approvedCoords}</strong> منسقاً</p>
              <p>• تم تنفيذ <strong>{programs.length}</strong> برنامجاً و<strong>{courses.length}</strong> دورة تدريبية و<strong>{competitions.length}</strong> مسابقة</p>
              <p>• بلغ إجمالي المشاريع <strong>{projects.length}</strong>، أُكمل منها <strong>{completedKanban}</strong> مشروعاً بالكامل</p>
              <p>• صُدرت <strong>{certs.length}</strong> شهادة رقمية ووُزِّعت <strong>{totalPoints}</strong> نقطة تحفيزية على الطلاب</p>
              <p>• عُقد <strong>{completedMeetings}</strong> اجتماعاً رسمياً مسجلة محاضره في المنصة</p>
              <p>• يضم مركز المعرفة <strong>{knowledge}</strong> وثيقة من أدلة ونماذج وسياسات وإجراءات</p>
            </div>
          </div>
          <div className="card p-4 bg-gray-50 text-center">
            <p className="text-xs text-gray-400">📅 تاريخ الإصدار: {now.toLocaleDateString("ar-SA",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</p>
            <p className="text-xs text-gray-400 mt-1">تم إنشاء هذا التقرير تلقائياً من منصة مركز المعرفة والابتكار</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===== مكوّن محرر الملف الشخصي للمشرف ===== */
interface SPProfile {
  name: string; nameEn: string; title: string; subtitle: string; bio: string;
  photo: string; phone: string; email: string; twitter: string; location: string;
  skills: string[]; siteUrl: string;
  education: Array<{ degree: string; institution: string; year: string; emoji: string }>;
  experience: Array<{ role: string; org: string; period: string; desc: string }>;
  certificates: Array<{ title: string; issuer: string; year: string; image: string }>;
  cvFile: string; cvName: string;
}

const SP_DEFAULT: SPProfile = {
  name: "", nameEn: "", title: "مشرف الموهبة والذكاء الاصطناعي",
  subtitle: "مدارس الأرقم — مركز المعرفة والابتكار STEAM",
  bio: "", photo: "", phone: "", email: "", twitter: "", location: "المملكة العربية السعودية",
  skills: ["الذكاء الاصطناعي", "الروبوتيك", "STEAM", "تعليم الابتكار"],
  education: [], experience: [], certificates: [], cvFile: "", cvName: "", siteUrl: "",
};

function SupervisorProfileEditor() {
  const [profile, setProfile] = useState<SPProfile>(() => {
    try { const d = localStorage.getItem("kc_supervisor_profile"); return d ? { ...SP_DEFAULT, ...JSON.parse(d) } : SP_DEFAULT; } catch { return SP_DEFAULT; }
  });
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState<"basic" | "edu" | "exp" | "certs">("basic");
  const [skillInput, setSkillInput] = useState("");
  const [newEdu, setNewEdu] = useState({ degree: "", institution: "", year: "", emoji: "🎓" });
  const [newExp, setNewExp] = useState({ role: "", org: "", period: "", desc: "" });
  const [newCert, setNewCert] = useState({ title: "", issuer: "", year: "", image: "" });
  const photoRef = useRef<HTMLInputElement>(null);
  const certImgRef = useRef<HTMLInputElement>(null);
  const cvRef = useRef<HTMLInputElement>(null);

  const save = () => {
    localStorage.setItem("kc_supervisor_profile", JSON.stringify(profile));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toBase64 = (file: File, cb: (s: string) => void) => {
    const r = new FileReader(); r.onload = e => cb(e.target?.result as string); r.readAsDataURL(file);
  };

  const addSkill = () => {
    if (!skillInput.trim()) return;
    setProfile(p => ({ ...p, skills: [...p.skills, skillInput.trim()] }));
    setSkillInput("");
  };

  const sectionBtns = [
    { id: "basic" as const, label: "البيانات الأساسية", emoji: "👤" },
    { id: "edu" as const, label: "التعليم", emoji: "🎓" },
    { id: "exp" as const, label: "الخبرات", emoji: "💼" },
    { id: "certs" as const, label: "الشهادات", emoji: "🏅" },
  ];

  const pageUrl = typeof window !== "undefined" ? `${window.location.origin}/supervisor` : "/supervisor";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="card p-5 bg-gradient-to-l from-indigo-900 to-blue-800 text-white">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <UserSquare2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold">ملفي الشخصي المهني</h3>
              <p className="text-blue-200 text-xs">صفحة عامة قابلة للمشاركة مع الطلاب والمنسقين</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <a href="/supervisor" target="_blank"
              className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-xl text-sm transition-colors">
              <ExternalLink className="w-4 h-4" /> معاينة الصفحة
            </a>
            <button onClick={save}
              className="flex items-center gap-1.5 bg-yellow-400 text-blue-900 px-4 py-2 rounded-xl text-sm font-bold hover:bg-yellow-300">
              {saved ? "✅ تم الحفظ!" : "💾 حفظ التغييرات"}
            </button>
          </div>
        </div>
        <div className="mt-3 bg-white/10 rounded-xl p-2.5 flex items-center gap-2">
          <span className="text-xs text-blue-200">رابط صفحتك:</span>
          <span className="text-white text-xs font-mono flex-1">{pageUrl}</span>
        </div>
      </div>

      {/* Section Nav */}
      <div className="flex gap-2 flex-wrap">
        {sectionBtns.map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeSection === s.id ? "bg-indigo-700 text-white shadow" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>
            <span>{s.emoji}</span> {s.label}
          </button>
        ))}
      </div>

      {/* ===== البيانات الأساسية ===== */}
      {activeSection === "basic" && (
        <div className="card p-5 space-y-4">
          {/* الصورة */}
          <div className="flex flex-col items-center gap-2 mb-2">
            <div onClick={() => photoRef.current?.click()}
              className="w-28 h-28 rounded-2xl overflow-hidden border-4 border-indigo-100 cursor-pointer hover:border-indigo-400 bg-gray-50 flex items-center justify-center transition-colors">
              {profile.photo
                ? <img src={profile.photo} alt="" className="w-full h-full object-cover" />
                : <div className="text-center text-gray-400"><UserSquare2 className="w-10 h-10 mx-auto mb-1" /><p className="text-xs">صورتك الشخصية</p></div>
              }
            </div>
            <input ref={photoRef} type="file" accept="image/*" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) toBase64(f, v => setProfile(p => ({ ...p, photo: v }))); }} />
            <button onClick={() => photoRef.current?.click()} className="text-indigo-700 text-xs underline">
              {profile.photo ? "تغيير الصورة" : "رفع الصورة"}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <label className="text-xs font-semibold text-gray-600 mb-1 block">الاسم بالعربية *</label>
              <input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                placeholder="اسمك الكامل" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-indigo-400" />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="text-xs font-semibold text-gray-600 mb-1 block">الاسم بالإنجليزية</label>
              <input value={profile.nameEn} onChange={e => setProfile(p => ({ ...p, nameEn: e.target.value }))}
                placeholder="Your Full Name" dir="ltr" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-600 mb-1 block">المسمى الوظيفي</label>
              <input value={profile.title} onChange={e => setProfile(p => ({ ...p, title: e.target.value }))}
                placeholder="مثال: مشرف الموهبة والذكاء الاصطناعي" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-indigo-400" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-600 mb-1 block">العنوان الفرعي</label>
              <input value={profile.subtitle} onChange={e => setProfile(p => ({ ...p, subtitle: e.target.value }))}
                placeholder="مثال: مدارس الأرقم — مركز المعرفة" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">الجوال</label>
              <input value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                placeholder="05XXXXXXXX" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">البريد الإلكتروني</label>
              <input type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                placeholder="email@example.com" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">تويتر / X</label>
              <input value={profile.twitter} onChange={e => setProfile(p => ({ ...p, twitter: e.target.value }))}
                placeholder="@username" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">الموقع</label>
              <input value={profile.location} onChange={e => setProfile(p => ({ ...p, location: e.target.value }))}
                placeholder="المدينة / البلد" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-600 mb-1 block">رابط مخصص لرمز QR <span className="font-normal text-gray-400">(اتركه فارغاً لاستخدام الرابط التلقائي)</span></label>
              <input value={profile.siteUrl} onChange={e => setProfile(p => ({ ...p, siteUrl: e.target.value }))}
                placeholder={pageUrl} dir="ltr"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none font-mono text-xs" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-600 mb-1 block">النبذة التعريفية</label>
              <textarea value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} rows={4}
                placeholder="اكتب نبذة مختصرة عنك ومسيرتك المهنية وشغفك في مجال STEAM..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none resize-none" />
            </div>
          </div>

          {/* السيرة الذاتية */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-2 block">السيرة الذاتية (PDF)</label>
            <div onClick={() => cvRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-3 cursor-pointer flex items-center gap-2 transition-colors ${profile.cvFile ? "border-indigo-400 bg-indigo-50" : "border-gray-300 bg-gray-50 hover:border-indigo-300"}`}>
              <AwardIcon className={`w-5 h-5 flex-shrink-0 ${profile.cvFile ? "text-indigo-600" : "text-gray-400"}`} />
              <span className={`text-sm truncate ${profile.cvFile ? "text-indigo-700 font-medium" : "text-gray-400"}`}>
                {profile.cvName || "اضغط لرفع السيرة الذاتية (PDF)"}
              </span>
            </div>
            <input ref={cvRef} type="file" accept=".pdf,.doc,.docx" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) toBase64(f, v => setProfile(p => ({ ...p, cvFile: v, cvName: f.name }))); e.target.value = ""; }} />
          </div>

          {/* المهارات */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-2 block">المهارات والتخصصات</label>
            <div className="flex gap-2 mb-2">
              <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addSkill()}
                placeholder="أضف مهارة..." className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 outline-none" />
              <button onClick={addSkill} className="bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-600">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((s, i) => (
                <span key={i} className="flex items-center gap-1 bg-indigo-50 border border-indigo-200 text-indigo-800 px-3 py-1 rounded-xl text-sm">
                  {s}
                  <button onClick={() => setProfile(p => ({ ...p, skills: p.skills.filter((_, j) => j !== i) }))} className="text-red-400 hover:text-red-600 mr-1">×</button>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== التعليم ===== */}
      {activeSection === "edu" && (
        <div className="card p-5 space-y-4">
          <h3 className="font-bold text-gray-800">المؤهلات العلمية</h3>
          <div className="grid grid-cols-2 gap-2 p-4 bg-emerald-50 rounded-xl">
            <div>
              <label className="text-xs text-gray-600 mb-1 block">الدرجة العلمية *</label>
              <input value={newEdu.degree} onChange={e => setNewEdu(p => ({ ...p, degree: e.target.value }))}
                placeholder="بكالوريوس، ماجستير..." className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white outline-none" />
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">الجامعة / المعهد *</label>
              <input value={newEdu.institution} onChange={e => setNewEdu(p => ({ ...p, institution: e.target.value }))}
                placeholder="اسم الجامعة" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white outline-none" />
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">السنة</label>
              <input value={newEdu.year} onChange={e => setNewEdu(p => ({ ...p, year: e.target.value }))}
                placeholder="مثال: 2018" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white outline-none" />
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">الأيقونة</label>
              <input value={newEdu.emoji} onChange={e => setNewEdu(p => ({ ...p, emoji: e.target.value }))}
                placeholder="🎓" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white outline-none text-center text-lg" maxLength={2} />
            </div>
            <div className="col-span-2">
              <button onClick={() => {
                if (!newEdu.degree || !newEdu.institution) return;
                setProfile(p => ({ ...p, education: [...p.education, newEdu] }));
                setNewEdu({ degree: "", institution: "", year: "", emoji: "🎓" });
              }} className="w-full bg-emerald-700 text-white py-2 rounded-xl text-sm font-medium hover:bg-emerald-600 flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> إضافة مؤهل
              </button>
            </div>
          </div>
          <div className="space-y-2">
            {profile.education.map((e, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <span className="text-2xl">{e.emoji}</span>
                <div className="flex-1">
                  <p className="font-medium text-gray-800 text-sm">{e.degree}</p>
                  <p className="text-gray-500 text-xs">{e.institution} {e.year ? `• ${e.year}` : ""}</p>
                </div>
                <button onClick={() => setProfile(p => ({ ...p, education: p.education.filter((_, j) => j !== i) }))} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
            {profile.education.length === 0 && <p className="text-center text-gray-400 text-sm py-4">لم تُضَف مؤهلات بعد</p>}
          </div>
        </div>
      )}

      {/* ===== الخبرات ===== */}
      {activeSection === "exp" && (
        <div className="card p-5 space-y-4">
          <h3 className="font-bold text-gray-800">الخبرات المهنية</h3>
          <div className="grid grid-cols-2 gap-2 p-4 bg-violet-50 rounded-xl">
            <div>
              <label className="text-xs text-gray-600 mb-1 block">المسمى الوظيفي *</label>
              <input value={newExp.role} onChange={e => setNewExp(p => ({ ...p, role: e.target.value }))}
                placeholder="مثال: منسق برامج STEAM" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white outline-none" />
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">المؤسسة *</label>
              <input value={newExp.org} onChange={e => setNewExp(p => ({ ...p, org: e.target.value }))}
                placeholder="اسم المدرسة / الجهة" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white outline-none" />
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">الفترة</label>
              <input value={newExp.period} onChange={e => setNewExp(p => ({ ...p, period: e.target.value }))}
                placeholder="2020 — حتى الآن" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white outline-none" />
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">وصف مختصر</label>
              <input value={newExp.desc} onChange={e => setNewExp(p => ({ ...p, desc: e.target.value }))}
                placeholder="أبرز المهام..." className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white outline-none" />
            </div>
            <div className="col-span-2">
              <button onClick={() => {
                if (!newExp.role || !newExp.org) return;
                setProfile(p => ({ ...p, experience: [...p.experience, newExp] }));
                setNewExp({ role: "", org: "", period: "", desc: "" });
              }} className="w-full bg-violet-700 text-white py-2 rounded-xl text-sm font-medium hover:bg-violet-600 flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> إضافة خبرة
              </button>
            </div>
          </div>
          <div className="space-y-2">
            {profile.experience.map((ex, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <Briefcase className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-gray-800 text-sm">{ex.role}</p>
                  <p className="text-gray-500 text-xs">{ex.org} {ex.period ? `• ${ex.period}` : ""}</p>
                  {ex.desc && <p className="text-gray-400 text-xs mt-0.5">{ex.desc}</p>}
                </div>
                <button onClick={() => setProfile(p => ({ ...p, experience: p.experience.filter((_, j) => j !== i) }))} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
            {profile.experience.length === 0 && <p className="text-center text-gray-400 text-sm py-4">لم تُضَف خبرات بعد</p>}
          </div>
        </div>
      )}

      {/* ===== الشهادات ===== */}
      {activeSection === "certs" && (
        <div className="card p-5 space-y-4">
          <h3 className="font-bold text-gray-800">الشهادات والدورات</h3>
          <div className="grid grid-cols-2 gap-2 p-4 bg-yellow-50 rounded-xl">
            <div className="col-span-2">
              <label className="text-xs text-gray-600 mb-1 block">اسم الشهادة *</label>
              <input value={newCert.title} onChange={e => setNewCert(p => ({ ...p, title: e.target.value }))}
                placeholder="مثال: شهادة Google AI Fundamentals" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white outline-none" />
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">الجهة المانحة</label>
              <input value={newCert.issuer} onChange={e => setNewCert(p => ({ ...p, issuer: e.target.value }))}
                placeholder="Google, Coursera, وزارة..." className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white outline-none" />
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">السنة</label>
              <input value={newCert.year} onChange={e => setNewCert(p => ({ ...p, year: e.target.value }))}
                placeholder="2024" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white outline-none" />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-gray-600 mb-1 block">صورة الشهادة <span className="font-normal text-gray-400">(اختياري)</span></label>
              <div onClick={() => certImgRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-3 cursor-pointer flex items-center gap-2 transition-colors ${newCert.image ? "border-yellow-400 bg-yellow-100" : "border-gray-300 bg-white"}`}>
                {newCert.image
                  ? <img src={newCert.image} alt="" className="w-12 h-12 object-cover rounded-lg" />
                  : <span className="text-gray-400 text-sm">اضغط لرفع صورة الشهادة</span>
                }
              </div>
              <input ref={certImgRef} type="file" accept="image/*" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) toBase64(f, v => setNewCert(p => ({ ...p, image: v }))); e.target.value = ""; }} />
            </div>
            <div className="col-span-2">
              <button onClick={() => {
                if (!newCert.title) return;
                setProfile(p => ({ ...p, certificates: [...p.certificates, newCert] }));
                setNewCert({ title: "", issuer: "", year: "", image: "" });
              }} className="w-full bg-yellow-600 text-white py-2 rounded-xl text-sm font-medium hover:bg-yellow-500 flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> إضافة شهادة
              </button>
            </div>
          </div>
          <div className="space-y-2">
            {profile.certificates.map((c, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                {c.image ? <img src={c.image} alt="" className="w-12 h-12 object-cover rounded-lg flex-shrink-0" /> : <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">🏅</div>}
                <div className="flex-1">
                  <p className="font-medium text-gray-800 text-sm">{c.title}</p>
                  <p className="text-gray-500 text-xs">{c.issuer} {c.year ? `• ${c.year}` : ""}</p>
                </div>
                <button onClick={() => setProfile(p => ({ ...p, certificates: p.certificates.filter((_, j) => j !== i) }))} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
            {profile.certificates.length === 0 && <p className="text-center text-gray-400 text-sm py-4">لم تُضَف شهادات بعد</p>}
          </div>
        </div>
      )}

      {/* Save Button */}
      <button onClick={save}
        className="w-full bg-indigo-700 text-white py-3 rounded-xl font-bold hover:bg-indigo-600 flex items-center justify-center gap-2 text-base">
        {saved ? "✅ تم حفظ الملف الشخصي!" : "💾 حفظ جميع التغييرات"}
      </button>
    </div>
  );
}

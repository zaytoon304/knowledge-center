"use client";
import { useState, useEffect } from "react";
import {
  Settings, Users, Shield, Plus, Trash2, CheckCircle,
  Clock, XCircle, MessageSquare, Radio, BookOpen, Play, Lightbulb, Lock,
  Briefcase, ShoppingBag, Star, Key
} from "lucide-react";
import { useAuth, StudentProfile, CoordinatorProfile, ChatGroup, CourseItem, VideoItem, ProjectItem, ShopItem, PlatformAchievement } from "@/contexts/AuthContext";

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
    getRegCodes, setRegCodes } = useAuth();

  // --- كل الـ hooks أولاً قبل أي return ---
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState("students");
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
  const [cForm, setCForm] = useState({ title: "", description: "", type: "free" as "free" | "paid", link: "", emoji: "📚" });
  const [showCForm, setShowCForm] = useState(false);
  const [vForm, setVForm] = useState({ title: "", description: "", link: "", emoji: "🎬" });
  const [showVForm, setShowVForm] = useState(false);
  const [pForm, setPForm] = useState({ title: "", description: "", field: "", level: "متوسط", emoji: "💡" });
  const [showPForm, setShowPForm] = useState(false);

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
            <button key={t.id} onClick={() => setTab(t.id)}
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
        <div className="card p-6 max-w-lg space-y-4">
          <h2 className="font-bold text-gray-800 flex items-center gap-2"><Radio className="w-5 h-5 text-red-500" /> التحكم في البث المباشر</h2>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">عنوان البث</label>
            <input value={live.title} onChange={e => setLive(p => ({ ...p, title: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">وصف البث</label>
            <input value={live.description} onChange={e => setLive(p => ({ ...p, description: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">رابط Zoom</label>
            <input value={live.zoomLink} onChange={e => setLive(p => ({ ...p, zoomLink: e.target.value }))} placeholder="https://zoom.us/j/..." className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-blue-500" />
          </div>
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
            <span className="text-sm font-semibold text-gray-700">تفعيل البث المباشر:</span>
            <button onClick={() => setLive(p => ({ ...p, enabled: !p.enabled }))}
              className={`relative w-14 h-7 rounded-full transition-colors ${live.enabled ? "bg-green-500" : "bg-gray-300"}`}>
              <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-all ${live.enabled ? "right-0.5" : "left-0.5"}`} />
            </button>
            <span className={`text-sm font-bold ${live.enabled ? "text-green-600" : "text-gray-400"}`}>{live.enabled ? "مفعّل 🔴" : "مغلق"}</span>
          </div>
          <button onClick={() => updateLiveStream(live)} className="w-full bg-blue-800 text-white py-3 rounded-xl font-bold hover:bg-blue-700">حفظ الإعدادات</button>
        </div>
      )}

      {/* Courses */}
      {tab === "courses" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-800">الدورات ({courses.length})</h2>
            <button onClick={() => setShowCForm(!showCForm)} className="flex items-center gap-2 bg-blue-800 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700"><Plus className="w-4 h-4" /> دورة جديدة</button>
          </div>
          {showCForm && (
            <div className="card p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><label className="text-xs font-semibold text-gray-600 mb-1 block">اسم الدورة *</label><input value={cForm.title} onChange={e => setCForm(p => ({ ...p, title: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none" /></div>
                <div className="col-span-2"><label className="text-xs font-semibold text-gray-600 mb-1 block">الوصف</label><input value={cForm.description} onChange={e => setCForm(p => ({ ...p, description: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none" /></div>
                <div><label className="text-xs font-semibold text-gray-600 mb-1 block">النوع</label><select value={cForm.type} onChange={e => setCForm(p => ({ ...p, type: e.target.value as "free" | "paid" }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none"><option value="free">مجاني</option><option value="paid">مدفوع</option></select></div>
                <div><label className="text-xs font-semibold text-gray-600 mb-1 block">الإيموجي</label><select value={cForm.emoji} onChange={e => setCForm(p => ({ ...p, emoji: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none">{EMOJIS.map(e => <option key={e} value={e}>{e}</option>)}</select></div>
                <div className="col-span-2"><label className="text-xs font-semibold text-gray-600 mb-1 block">رابط الدورة</label><input value={cForm.link} onChange={e => setCForm(p => ({ ...p, link: e.target.value }))} placeholder="https://..." className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none" /></div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { if (!cForm.title.trim()) return; addCourse(cForm); setShowCForm(false); setCForm({ title: "", description: "", type: "free", link: "", emoji: "📚" }); refresh(); }} className="bg-blue-800 text-white px-6 py-2 rounded-xl text-sm font-semibold">إضافة</button>
                <button onClick={() => setShowCForm(false)} className="bg-gray-100 text-gray-600 px-6 py-2 rounded-xl text-sm">إلغاء</button>
              </div>
            </div>
          )}
          {courses.length === 0 ? <div className="card p-10 text-center text-gray-400"><BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>لا توجد دورات بعد</p></div>
            : <div className="grid md:grid-cols-2 gap-4">{courses.map(c => (
                <div key={c.id} className="card p-4 flex items-center gap-3">
                  <span className="text-3xl">{c.emoji}</span>
                  <div className="flex-1"><p className="font-bold text-gray-800">{c.title}</p><p className="text-xs text-gray-400">{c.type === "free" ? "مجاني" : "مدفوع"}</p></div>
                  <button onClick={() => { deleteCourse(c.id); refresh(); }} className="p-2 text-red-400 hover:bg-red-50 rounded-xl"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}</div>}
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
      {tab === "projects" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-800">المشاريع المقترحة ({projects.length})</h2>
            <button onClick={() => setShowPForm(!showPForm)} className="flex items-center gap-2 bg-blue-800 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700"><Plus className="w-4 h-4" /> مشروع جديد</button>
          </div>
          {showPForm && (
            <div className="card p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><label className="text-xs font-semibold text-gray-600 mb-1 block">اسم المشروع *</label><input value={pForm.title} onChange={e => setPForm(p => ({ ...p, title: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none" /></div>
                <div className="col-span-2"><label className="text-xs font-semibold text-gray-600 mb-1 block">الوصف</label><input value={pForm.description} onChange={e => setPForm(p => ({ ...p, description: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none" /></div>
                <div><label className="text-xs font-semibold text-gray-600 mb-1 block">المجال</label><input value={pForm.field} onChange={e => setPForm(p => ({ ...p, field: e.target.value }))} placeholder="مثال: AI, روبوت" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none" /></div>
                <div><label className="text-xs font-semibold text-gray-600 mb-1 block">المستوى</label><select value={pForm.level} onChange={e => setPForm(p => ({ ...p, level: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none"><option>مبتدئ</option><option>متوسط</option><option>متقدم</option></select></div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { if (!pForm.title.trim()) return; addProject(pForm); setShowPForm(false); setPForm({ title: "", description: "", field: "", level: "متوسط", emoji: "💡" }); refresh(); }} className="bg-blue-800 text-white px-6 py-2 rounded-xl text-sm font-semibold">إضافة</button>
                <button onClick={() => setShowPForm(false)} className="bg-gray-100 text-gray-600 px-6 py-2 rounded-xl text-sm">إلغاء</button>
              </div>
            </div>
          )}
          {projects.length === 0 ? <div className="card p-10 text-center text-gray-400"><Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>لا توجد مشاريع مقترحة بعد</p></div>
            : <div className="grid md:grid-cols-2 gap-4">{projects.map(p => (
                <div key={p.id} className="card p-4 flex items-center gap-3">
                  <span className="text-3xl">{p.emoji}</span>
                  <div className="flex-1"><p className="font-bold text-gray-800">{p.title}</p><p className="text-xs text-gray-400">{p.field} • {p.level}</p></div>
                  <button onClick={() => { deleteProject(p.id); refresh(); }} className="p-2 text-red-400 hover:bg-red-50 rounded-xl"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}</div>}
        </div>
      )}

      {/* Coordinators */}
      {tab === "coordinators" && (
        <div className="space-y-3">
          <h2 className="font-bold text-gray-800">طلبات المنسقين ({pendingCoords.length})</h2>
          {pendingCoords.length === 0
            ? <div className="card p-10 text-center text-gray-400"><Briefcase className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>لا توجد طلبات معلقة من المنسقين</p></div>
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
        <div className="card p-6 max-w-lg space-y-5">
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
      )}

      {/* Permissions */}
      {tab === "permissions" && (
        <div className="card p-5">
          <h3 className="font-bold text-gray-800 mb-4">مصفوفة الصلاحيات</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 text-right">الصلاحية</th>
                  {["مدير النظام", "المنسق", "المعلم", "الطالب"].map(r => <th key={r} className="px-4 py-3 text-xs font-semibold text-gray-500 text-center">{r}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[
                  { perm: "اعتماد الطلاب", roles: [true, false, false, false] },
                  { perm: "إنشاء جروبات", roles: [true, true, false, false] },
                  { perm: "التحكم في البث", roles: [true, false, false, false] },
                  { perm: "إضافة دورات/فيديوهات", roles: [true, true, false, false] },
                  { perm: "عرض بطاقة الطالب", roles: [true, true, false, false] },
                  { perm: "الدخول للجروبات", roles: [true, true, true, true] },
                  { perm: "مشاهدة المحتوى", roles: [true, true, true, true] },
                ].map(row => (
                  <tr key={row.perm} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-700">{row.perm}</td>
                    {row.roles.map((ok, i) => (
                      <td key={i} className="px-4 py-3 text-center">
                        <span className={`text-lg ${ok ? "text-green-500" : "text-gray-200"}`}>{ok ? "✓" : "✗"}</span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";
import { useState } from "react";
import { useAuth, CoordinatorProfile } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  Briefcase, Calendar, Layers, Trophy, Star, Archive, GraduationCap,
  LogIn, Clock, XCircle, Download, FileText, Camera
} from "lucide-react";
import dynamic from "next/dynamic";

const PlansSection = dynamic(() => import("@/components/coordinator/PlansSection"), { ssr: false });
const ProgramsSection = dynamic(() => import("@/components/coordinator/ProgramsSection"), { ssr: false });
const CompetitionsSection = dynamic(() => import("@/components/coordinator/CompetitionsSection"), { ssr: false });
const AchievementsSection = dynamic(() => import("@/components/coordinator/AchievementsSection"), { ssr: false });
const ArchiveSection = dynamic(() => import("@/components/coordinator/ArchiveSection"), { ssr: false });
const ProfDevSection = dynamic(() => import("@/components/coordinator/ProfDevSection"), { ssr: false });

const tabs = [
  { id: "dashboard", label: "رئيسيتي", icon: Briefcase },
  { id: "plans", label: "الخطط", icon: Calendar },
  { id: "programs", label: "البرامج", icon: Layers },
  { id: "competitions", label: "المسابقات", icon: Trophy },
  { id: "achievements", label: "إنجازاتي", icon: Star },
  { id: "archive", label: "الأرشيف", icon: Archive },
  { id: "profdev", label: "التطوير المهني", icon: GraduationCap },
  { id: "profile", label: "ملفي المهني", icon: FileText },
];

function ProfileEditor({ coord }: { coord: CoordinatorProfile }) {
  const { updateProfile } = useAuth();
  const [form, setForm] = useState({ name: coord.name, phone: coord.phone, school: coord.school, subject: coord.subject, photo: coord.photo, cv: coord.cv, cvName: coord.cvName });
  const [saved, setSaved] = useState(false);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader(); r.onload = ev => setForm(p => ({ ...p, photo: ev.target?.result as string })); r.readAsDataURL(f); e.target.value = "";
  };
  const handleCV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader(); r.onload = ev => setForm(p => ({ ...p, cv: ev.target?.result as string, cvName: f.name })); r.readAsDataURL(f); e.target.value = "";
  };

  const save = () => { updateProfile(form); setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="card p-6 max-w-lg space-y-4">
      <h2 className="font-bold text-gray-800">الملف المهني</h2>
      {saved && <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">✓ تم الحفظ</div>}
      <div className="flex flex-col items-center mb-2">
        <div className="relative">
          <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-100">
            {form.photo ? <img src={form.photo} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-400">{coord.name[0]}</div>}
          </div>
          <label className="absolute bottom-0 left-0 bg-blue-700 text-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer hover:bg-blue-600">
            <Camera className="w-3.5 h-3.5" /><input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
          </label>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2"><label className="text-xs font-semibold text-gray-600 mb-1 block">الاسم</label><input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none" /></div>
        <div><label className="text-xs font-semibold text-gray-600 mb-1 block">الجوال</label><input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none" /></div>
        <div><label className="text-xs font-semibold text-gray-600 mb-1 block">المدرسة</label><input value={form.school} onChange={e => setForm(p => ({ ...p, school: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none" /></div>
        <div className="col-span-2"><label className="text-xs font-semibold text-gray-600 mb-1 block">التخصص / المادة</label><input value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none" /></div>
        <div className="col-span-2">
          <label className="text-xs font-semibold text-gray-600 mb-1 block">السيرة الذاتية</label>
          {form.cv && (
            <button onClick={() => { const a = document.createElement("a"); a.href = form.cv; a.download = form.cvName || "cv"; a.click(); }}
              className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2.5 rounded-xl text-sm mb-2 hover:bg-blue-100">
              <Download className="w-4 h-4" /> {form.cvName || "السيرة الذاتية الحالية"}
            </button>
          )}
          <label className={`flex items-center gap-2 border-2 border-dashed rounded-xl px-3 py-2.5 cursor-pointer text-sm ${form.cv ? "border-gray-300 text-gray-400 hover:border-blue-400" : "border-blue-300 bg-blue-50 text-blue-600"}`}>
            <FileText className="w-4 h-4" /> {form.cv ? "تحديث السيرة الذاتية" : "رفع السيرة الذاتية (PDF)"}
            <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleCV} />
          </label>
        </div>
      </div>
      <button onClick={save} className="w-full bg-blue-800 text-white py-3 rounded-xl font-bold hover:bg-blue-700">حفظ التغييرات</button>
    </div>
  );
}

export default function CoordinatorPortalPage() {
  const { user, isCoordinator, isLoggedIn, isApproved, logout } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState("dashboard");

  if (!isLoggedIn || !isCoordinator) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center"><LogIn className="w-10 h-10 text-blue-700" /></div>
        <h2 className="text-2xl font-bold text-gray-800">بوابة المنسقين</h2>
        <p className="text-gray-500">يجب تسجيل الدخول كمنسق للوصول لهذه البوابة.</p>
        <button onClick={() => router.push("/login")} className="bg-blue-800 text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-700">دخول / تسجيل</button>
      </div>
    );
  }

  if (!isApproved) {
    const isRejected = user?.status === "rejected";
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <div className={`w-20 h-20 rounded-3xl flex items-center justify-center ${isRejected ? "bg-red-100" : "bg-yellow-100"}`}>
          {isRejected ? <XCircle className="w-10 h-10 text-red-500" /> : <Clock className="w-10 h-10 text-yellow-500" />}
        </div>
        <h2 className="text-2xl font-bold text-gray-800">{isRejected ? "تم رفض طلبك" : "طلبك قيد المراجعة"}</h2>
        <p className="text-gray-500 max-w-sm">{isRejected ? "نأسف، تم رفض طلبك. تواصل مع الإدارة لمعرفة السبب." : "شكراً للتسجيل! سيتم مراجعة طلبك والموافقة عليه قريباً."}</p>
        <button onClick={() => { logout(); router.push("/login"); }} className="bg-gray-100 text-gray-600 px-6 py-2.5 rounded-xl font-semibold hover:bg-gray-200">تسجيل الخروج</button>
      </div>
    );
  }

  const coord = user as CoordinatorProfile;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="card p-5 bg-gradient-to-l from-violet-800 to-purple-700 text-white">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white/20 flex-shrink-0 flex items-center justify-center text-2xl font-bold">
            {coord.photo ? <img src={coord.photo} alt="" className="w-full h-full object-cover" /> : coord.name[0]}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{coord.name}</h1>
            <p className="text-purple-200 text-sm">{coord.subject} • {coord.school}</p>
          </div>
          <div className="hidden md:flex items-center gap-1 bg-white/20 rounded-xl px-3 py-1.5">
            <Briefcase className="w-4 h-4" />
            <span className="text-sm font-semibold">منسق</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === t.id ? "bg-violet-700 text-white shadow-md" : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"}`}>
              <Icon className="w-4 h-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Dashboard */}
      {tab === "dashboard" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "الخطط", key: `kc_coord_plans_${coord.id}`, icon: Calendar, color: "bg-blue-600" },
              { label: "البرامج", key: `kc_coord_programs_${coord.id}`, icon: Layers, color: "bg-violet-600" },
              { label: "المسابقات", key: `kc_coord_comps_${coord.id}`, icon: Trophy, color: "bg-amber-500" },
              { label: "الإنجازات", key: `kc_coord_achiev_${coord.id}`, icon: Star, color: "bg-green-600" },
            ].map(s => {
              const Icon = s.icon;
              const count = JSON.parse(localStorage.getItem(s.key) || "[]").length;
              return (
                <div key={s.label} className="card p-4 flex items-center gap-3">
                  <div className={`${s.color} w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0`}><Icon className="w-5 h-5" /></div>
                  <div><div className="text-2xl font-bold text-gray-800">{count}</div><div className="text-xs text-gray-500">{s.label}</div></div>
                </div>
              );
            })}
          </div>
          <div className="card p-5">
            <h3 className="font-bold text-gray-700 mb-3">مرحباً بك {coord.name} 👋</h3>
            <p className="text-gray-500 text-sm leading-relaxed">هذه بوابتك المهنية الخاصة. رفع خططك، توثيق برامجك، مسابقاتك، إنجازاتك، وصورك الأرشيفية. كل ما ترفعه يُحفظ في ملفك المهني.</p>
          </div>
          {coord.cv && (
            <div className="card p-4 flex items-center gap-3 bg-blue-50 border border-blue-200">
              <FileText className="w-8 h-8 text-blue-600 flex-shrink-0" />
              <div className="flex-1"><p className="font-semibold text-blue-800 text-sm">سيرتك الذاتية مرفوعة</p><p className="text-xs text-blue-500">{coord.cvName}</p></div>
              <button onClick={() => { const a = document.createElement("a"); a.href = coord.cv; a.download = coord.cvName || "cv"; a.click(); }} className="bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-600 flex items-center gap-2">
                <Download className="w-4 h-4" /> تحميل
              </button>
            </div>
          )}
        </div>
      )}

      {tab === "plans" && <PlansSection />}
      {tab === "programs" && <ProgramsSection />}
      {tab === "competitions" && <CompetitionsSection />}
      {tab === "achievements" && <AchievementsSection />}
      {tab === "archive" && <ArchiveSection />}
      {tab === "profdev" && <ProfDevSection />}
      {tab === "profile" && <ProfileEditor coord={coord} />}
    </div>
  );
}

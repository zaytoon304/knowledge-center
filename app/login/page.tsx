"use client";
import { useState, useRef, useEffect } from "react";
import { useAuth, DEPARTMENTS, DEPARTMENT_COORDINATOR } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Camera, LogIn, UserPlus, Briefcase, FileText, Globe, GraduationCap, ShoppingBag, Rss, CheckCircle, Copy, KeyRound } from "lucide-react";
import CenterLogo from "@/components/icons/CenterLogo";
import { cloudPush } from "@/lib/cloud";
import { getDeviceId } from "@/lib/deviceCode";
import { whatsappLink } from "@/lib/whatsapp";
import { GRADES as grades } from "@/lib/grades";

type Mode = "login" | "student" | "coordinator" | "visitor";

interface VisitorRequest {
  id: string; name: string; phone: string; email: string;
  purpose: "courses" | "shop" | "activities";
  purposeLabel: string;
  notes: string; status: "pending" | "approved" | "rejected";
  submittedAt: string;
}

const PURPOSE_OPTIONS = [
  { id: "courses" as const, label: "الالتحاق بالدورات التدريبية", emoji: "🎓", desc: "حضور دورات وبرامج تدريبية" },
  { id: "shop" as const, label: "تصفح المتجر والشراء", emoji: "🛍️", desc: "الاطلاع على المنتجات والمستلزمات" },
  { id: "activities" as const, label: "متابعة أنشطة المركز", emoji: "📰", desc: "الاطلاع على الفعاليات واليوميات" },
];

function saveVisitorRequest(req: VisitorRequest) {
  try {
    const existing = JSON.parse(localStorage.getItem("kc_visitor_requests") || "[]");
    localStorage.setItem("kc_visitor_requests", JSON.stringify([req, ...existing]));
    cloudPush("kc_visitor_requests", req); // يرسل الطلب لـ Firebase حتى يصل للأدمن
  } catch {}
}

function loginVisitor(phone: string): VisitorRequest | null {
  try {
    const approved = JSON.parse(localStorage.getItem("kc_visitor_requests") || "[]");
    return approved.find((v: VisitorRequest) => v.phone === phone && v.status === "approved") || null;
  } catch { return null; }
}

export default function LoginPage() {
  const { login, loginWithAccessCode, loginCoordinator, register, registerCoordinator } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const photoRef = useRef<HTMLInputElement>(null);
  const cvRef = useRef<HTMLInputElement>(null);

  const [loginData, setLoginData] = useState({ identifier: "", password: "", accessCode: "", type: "student" as "student" | "coordinator" | "visitor" });
  // حسابات طلاب قديمة (قبل نظام رمز الجهاز) لسه تدخل برقم الهوية وكلمة المرور — كان هذا الخيار
  // مفقوداً تماماً من الواجهة (لا يوجد أي زر يوصله)، فأي حساب قديم كان محظوراً من الدخول نهائياً
  const [useOldStudentLogin, setUseOldStudentLogin] = useState(false);
  const [regData, setRegData] = useState({ name: "", nationalId: "", school: "", grade: grades[0], department: DEPARTMENTS[0] as string, classroom: "", phone: "", email: "", parentPhone: "", birthDate: "", photo: "", password: "", confirmPassword: "", teams: [] as string[] });
  const [copiedDeviceId, setCopiedDeviceId] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [deviceId, setDeviceId] = useState(""); // يُملأ بعد التركيب لتفادي مشاكل SSR/hydration
  useEffect(() => { setDeviceId(getDeviceId()); }, []);
  const [coordData, setCoordData] = useState({ name: "", email: "", phone: "", school: "", subject: "", photo: "", cv: "", cvName: "", password: "", confirmPassword: "", regCode: "" });
  const [visitorData, setVisitorData] = useState({ name: "", phone: "", email: "", purpose: "" as "courses" | "shop" | "activities" | "", notes: "" });
  const [visitorDone, setVisitorDone] = useState(false);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>, setter: (v: string) => void) => {
    const f = e.target.files?.[0]; if (!f) return;
    if (f.size > 3 * 1024 * 1024) { setError("حجم الصورة أقل من 3 ميجا"); return; }
    const r = new FileReader(); r.onload = ev => setter(ev.target?.result as string); r.readAsDataURL(f);
  };

  const handleCV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    if (f.size > 10 * 1024 * 1024) { setError("حجم الملف أقل من 10 ميجا"); return; }
    const r = new FileReader(); r.onload = ev => setCoordData(p => ({ ...p, cv: ev.target?.result as string, cvName: f.name })); r.readAsDataURL(f); e.target.value = "";
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    if (loginData.type === "visitor") {
      const v = loginVisitor(loginData.identifier);
      if (!v) { setError("لم يُعثر على حساب زائر معتمد بهذا الرقم. تأكد من رقم الجوال أو تواصل مع الإدارة."); return; }
      localStorage.setItem("kc_visitor_session", JSON.stringify(v));
      router.push("/visitor-portal");
      return;
    }
    if (submitting) return;
    setSubmitting(true);
    const result = loginData.type === "coordinator"
      ? await loginCoordinator(loginData.identifier, loginData.password)
      : loginData.type === "student"
        ? (useOldStudentLogin ? await login(loginData.identifier, loginData.password) : await loginWithAccessCode(loginData.accessCode))
        : await login(loginData.identifier, loginData.password);
    setSubmitting(false);
    if (result.success) { router.push(loginData.type === "coordinator" ? "/coordinator-portal" : "/student-portal"); }
    else { setError(result.message); }
  };

  const handleStudentRegister = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setSuccess("");
    if (!regData.name || !regData.nationalId || !regData.school || !regData.phone) { setError("يرجى تعبئة الحقول المطلوبة"); return; }
    if (submitting) return;
    setSubmitting(true);
    const { confirmPassword, ...data } = regData;
    const result = await register({ ...data, coordinatorName: DEPARTMENT_COORDINATOR[data.department] || "" });
    setSubmitting(false);
    if (result.success) { setSuccess("تم إرسال بياناتك! أرسل رمز جهازك للإدارة عشان يعطونك رمز الدخول."); }
    else { setError(result.message); }
  };

  const handleCoordRegister = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setSuccess("");
    if (!coordData.name || !coordData.email || !coordData.phone || !coordData.school || !coordData.subject) { setError("يرجى تعبئة الحقول المطلوبة"); return; }
    if (coordData.password.length < 6) { setError("كلمة المرور 6 أحرف على الأقل"); return; }
    if (coordData.password !== coordData.confirmPassword) { setError("كلمة المرور غير متطابقة"); return; }
    if (submitting) return;
    setSubmitting(true);
    const { confirmPassword, regCode, ...data } = coordData;
    const result = await registerCoordinator(data, regCode);
    setSubmitting(false);
    if (result.success) { setSuccess("تم إرسال طلبك! بلّغ الإدارة عبر واتساب وانتظر الموافقة."); }
    else { setError(result.message); }
  };

  const handleVisitorRegister = (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    if (!visitorData.name || !visitorData.phone || !visitorData.purpose) { setError("يرجى تعبئة الاسم والجوال وتحديد الغرض"); return; }
    const purposeInfo = PURPOSE_OPTIONS.find(p => p.id === visitorData.purpose);
    const req: VisitorRequest = {
      id: Date.now().toString(),
      name: visitorData.name, phone: visitorData.phone, email: visitorData.email,
      purpose: visitorData.purpose, purposeLabel: purposeInfo?.label || "",
      notes: visitorData.notes, status: "pending",
      submittedAt: new Date().toISOString(),
    };
    saveVisitorRequest(req);
    setVisitorDone(true);
  };

  const clear = (m: Mode) => { setMode(m); setError(""); setSuccess(""); setVisitorDone(false); };

  const tabs = [
    { id: "login" as Mode, label: "دخول", icon: LogIn, color: "bg-blue-800" },
    { id: "visitor" as Mode, label: "زائر", icon: Globe, color: "bg-teal-700" },
    { id: "student" as Mode, label: "طالب جديد", icon: UserPlus, color: "bg-emerald-700" },
    { id: "coordinator" as Mode, label: "منسق جديد", icon: Briefcase, color: "bg-violet-700" },
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <CenterLogo className="w-20 h-20 drop-shadow-xl" />
          </div>
          <h1 className="text-2xl font-bold text-white">مركز المعرفة والابتكار STEAM</h1>
          <p className="text-blue-200 mt-1">بمدارس الأرقم</p>
        </div>

        <button onClick={() => setShowGuide(!showGuide)}
          className="w-full mb-3 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold py-2.5 rounded-xl border border-white/20">
          📖 كيف أسجّل؟ اضغط هنا
        </button>

        {showGuide && (
          <div className="bg-white rounded-2xl shadow-xl p-5 mb-3 space-y-3 text-sm">
            <div>
              <p className="font-bold text-emerald-700 mb-1">👨‍🎓 للطالب:</p>
              <ol className="list-decimal pr-4 space-y-1 text-gray-600">
                <li>اضغط "طالب جديد" وعبّي بياناتك كاملة</li>
                <li>بعد الإرسال يظهر لك "رمز الجهاز" — اضغط زر واتساب وأرسله للإدارة</li>
                <li>الإدارة ترسل لك "رمز الدخول" بعد المراجعة</li>
                <li>ادخل الرمز من تبويب "دخول" وخلاص</li>
              </ol>
            </div>
            <div>
              <p className="font-bold text-violet-700 mb-1">👨‍🏫 للمنسّق:</p>
              <ol className="list-decimal pr-4 space-y-1 text-gray-600">
                <li>اضغط "منسق جديد" وعبّي بياناتك واختر كلمة مرور</li>
                <li>اضغط زر واتساب لتبليغ الإدارة بطلبك</li>
                <li>بعد موافقة الإدارة، ادخل من تبويب "دخول" بنفس الإيميل وكلمة المرور</li>
              </ol>
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-2xl p-6">
          {/* Tabs */}
          <div className="grid grid-cols-4 gap-1 mb-5 bg-gray-100 rounded-2xl p-1">
            {tabs.map(t => {
              const Icon = t.icon;
              return (
                <button key={t.id} onClick={() => clear(t.id)}
                  className={`flex flex-col items-center gap-0.5 py-2 px-1 rounded-xl text-xs font-semibold transition-all ${mode === t.id ? `${t.color} text-white shadow` : "text-gray-500"}`}>
                  <Icon className="w-3.5 h-3.5" />
                  <span className="text-[10px] leading-tight text-center">{t.label}</span>
                </button>
              );
            })}
          </div>

          {error && <div className="mb-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}
          {success && <div className="mb-3 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">{success}</div>}
          {success && mode === "student" && (
            <a href={whatsappLink(`مرحباً، أنا ${regData.name} - ${regData.grade} - رمز جهازي: ${deviceId} - بانتظار رمز الدخول 🙏`)}
              target="_blank" rel="noopener noreferrer"
              className="mb-3 flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-green-500">
              📱 أرسل الرمز للإدارة عبر واتساب
            </a>
          )}
          {success && mode === "coordinator" && (
            <a href={whatsappLink(`مرحباً، أنا ${coordData.name} - منسّق ${coordData.subject} - سجّلت بالمنصة وبانتظار الموافقة 🙏`)}
              target="_blank" rel="noopener noreferrer"
              className="mb-3 flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-green-500">
              📱 بلّغ الإدارة عبر واتساب
            </a>
          )}

          {/* ===== دخول ===== */}
          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="flex gap-1.5">
                {(["student", "coordinator", "visitor"] as const).map(t => (
                  <button key={t} type="button" onClick={() => setLoginData(p => ({ ...p, type: t }))}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${loginData.type === t ? "bg-blue-800 text-white border-blue-800" : "text-gray-500 border-gray-200"}`}>
                    {t === "student" ? "طالب" : t === "coordinator" ? "منسق" : "زائر"}
                  </button>
                ))}
              </div>
              {loginData.type === "student" && (
                <div className="flex gap-1.5 bg-gray-100 p-1 rounded-xl">
                  <button type="button" onClick={() => setUseOldStudentLogin(false)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${!useOldStudentLogin ? "bg-white text-blue-800 shadow" : "text-gray-500"}`}>
                    🔑 رمز الدخول
                  </button>
                  <button type="button" onClick={() => setUseOldStudentLogin(true)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${useOldStudentLogin ? "bg-white text-blue-800 shadow" : "text-gray-500"}`}>
                    🆔 رقم الهوية وكلمة المرور
                  </button>
                </div>
              )}
              {loginData.type === "student" && !useOldStudentLogin && (
                <>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                    <p className="text-xs text-blue-700 mb-1">رمز جهازك</p>
                    <span dir="ltr" className="font-mono font-bold text-blue-900 text-lg tracking-wider">{deviceId || "..."}</span>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">رمز الدخول</label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                      <input dir="ltr" value={loginData.accessCode} onChange={e => setLoginData(p => ({ ...p, accessCode: e.target.value }))}
                        placeholder="ARQAM-XXXXXXX-XXXXXX"
                        className="w-full border border-gray-200 rounded-xl pr-9 pl-4 py-3 text-sm bg-gray-50 outline-none focus:border-blue-500 font-mono" required />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">ما عندك رمز؟ سجّل بياناتك من تبويب "طالب جديد" وأرسل رمز جهازك للإدارة</p>
                  </div>
                </>
              )}
              {loginData.type === "student" && useOldStudentLogin && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">رقم الهوية</label>
                    <input value={loginData.identifier} onChange={e => setLoginData(p => ({ ...p, identifier: e.target.value }))}
                      placeholder="رقم الهوية"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 outline-none focus:border-blue-500" required />
                  </div>
                  <div className="relative">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">كلمة المرور</label>
                    <input type={showPass ? "text" : "password"} value={loginData.password} onChange={e => setLoginData(p => ({ ...p, password: e.target.value }))}
                      placeholder="أدخل كلمة المرور"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 outline-none focus:border-blue-500" required />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute left-3 bottom-3 text-gray-400">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </>
              )}
              {loginData.type === "coordinator" && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">البريد الإلكتروني</label>
                    <input value={loginData.identifier} onChange={e => setLoginData(p => ({ ...p, identifier: e.target.value }))}
                      placeholder="البريد الإلكتروني"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 outline-none focus:border-blue-500" required />
                  </div>
                  <div className="relative">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">كلمة المرور</label>
                    <input type={showPass ? "text" : "password"} value={loginData.password} onChange={e => setLoginData(p => ({ ...p, password: e.target.value }))}
                      placeholder="أدخل كلمة المرور"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 outline-none focus:border-blue-500" required />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute left-3 bottom-3 text-gray-400">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </>
              )}
              {loginData.type === "visitor" && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">رقم الجوال / الهوية</label>
                    <input value={loginData.identifier} onChange={e => setLoginData(p => ({ ...p, identifier: e.target.value }))}
                      placeholder="رقم الجوال المسجل"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 outline-none focus:border-blue-500" required />
                  </div>
                  <p className="text-xs text-teal-700 bg-teal-50 p-3 rounded-xl">بعد موافقة الإدارة على طلبك ستتمكن من الدخول برقم جوالك</p>
                </>
              )}
              <button type="submit" disabled={submitting} className="w-full bg-blue-800 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50">{submitting ? "جارٍ التحقق..." : "دخول"}</button>
            </form>
          )}

          {/* ===== تسجيل زائر ===== */}
          {mode === "visitor" && !visitorDone && (
            <form onSubmit={handleVisitorRegister} className="space-y-4">
              <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 text-sm text-teal-800 mb-2">
                <p className="font-semibold mb-0.5">👋 مرحباً بك</p>
                <p className="text-xs text-teal-700">أكمل بياناتك وسيتواصل معك المركز بعد مراجعة طلبك</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">الاسم الكامل *</label>
                  <input value={visitorData.name} onChange={e => setVisitorData(p => ({ ...p, name: e.target.value }))}
                    placeholder="اسمك الكامل" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-teal-500" required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">رقم الجوال *</label>
                  <input value={visitorData.phone} onChange={e => setVisitorData(p => ({ ...p, phone: e.target.value }))}
                    placeholder="05XXXXXXXX" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-teal-500" required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">البريد الإلكتروني</label>
                  <input type="email" value={visitorData.email} onChange={e => setVisitorData(p => ({ ...p, email: e.target.value }))}
                    placeholder="اختياري" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none" />
                </div>
              </div>

              {/* Purpose Selection */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-2 block">ما الغرض من تسجيلك؟ *</label>
                <div className="space-y-2">
                  {PURPOSE_OPTIONS.map(opt => (
                    <button key={opt.id} type="button" onClick={() => setVisitorData(p => ({ ...p, purpose: opt.id }))}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-right ${visitorData.purpose === opt.id ? "border-teal-500 bg-teal-50" : "border-gray-100 hover:border-gray-300 bg-white"}`}>
                      <span className="text-2xl flex-shrink-0">{opt.emoji}</span>
                      <div>
                        <div className="text-sm font-semibold text-gray-800">{opt.label}</div>
                        <div className="text-xs text-gray-500">{opt.desc}</div>
                      </div>
                      {visitorData.purpose === opt.id && <CheckCircle className="w-5 h-5 text-teal-600 mr-auto flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">ملاحظات إضافية <span className="font-normal text-gray-400">(اختياري)</span></label>
                <textarea value={visitorData.notes} onChange={e => setVisitorData(p => ({ ...p, notes: e.target.value }))}
                  rows={2} placeholder="أي تفاصيل تودّ إضافتها..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none resize-none" />
              </div>
              <button type="submit" className="w-full bg-teal-700 text-white py-3 rounded-xl font-bold hover:bg-teal-600 flex items-center justify-center gap-2">
                <Globe className="w-4 h-4" /> إرسال طلب التسجيل
              </button>
            </form>
          )}

          {/* نجاح التسجيل */}
          {mode === "visitor" && visitorDone && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-9 h-9 text-teal-600" />
              </div>
              <h3 className="font-bold text-gray-800 text-lg">تم إرسال طلبك!</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                استلمنا طلبك وسنراجعه قريباً.<br />
                بعد الموافقة ستتمكن من الدخول برقم جوالك من تبويب <strong>"دخول → زائر"</strong>
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-xs text-yellow-800">
                📞 احتفظ برقم جوالك: <strong dir="ltr">{visitorData.phone}</strong>
              </div>
              <button onClick={() => { setVisitorDone(false); setVisitorData({ name: "", phone: "", email: "", purpose: "", notes: "" }); setMode("login"); setLoginData(p => ({ ...p, type: "visitor" })); }}
                className="text-teal-700 text-sm underline">العودة للدخول</button>
            </div>
          )}

          {/* ===== طالب جديد ===== */}
          {mode === "student" && (
            <form onSubmit={handleStudentRegister} className="space-y-3">
              <div className="flex flex-col items-center mb-2">
                <div onClick={() => photoRef.current?.click()} className="w-20 h-20 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-blue-400 overflow-hidden">
                  {regData.photo ? <img src={regData.photo} alt="" className="w-full h-full object-cover" /> : <div className="text-center"><Camera className="w-5 h-5 text-gray-400 mx-auto mb-0.5" /><span className="text-xs text-gray-400">صورة</span></div>}
                </div>
                <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={e => handlePhoto(e, v => setRegData(p => ({ ...p, photo: v })))} />
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
                <p className="text-xs text-emerald-700 mb-1">رمز جهازك (بعد التسجيل أرسله للإدارة ليعطوك رمز الدخول)</p>
                <div className="flex items-center justify-center gap-2">
                  <span dir="ltr" className="font-mono font-bold text-emerald-900 text-lg tracking-wider">{deviceId || "..."}</span>
                  <button type="button" onClick={() => { navigator.clipboard.writeText(deviceId); setCopiedDeviceId(true); setTimeout(() => setCopiedDeviceId(false), 1500); }}
                    className="text-emerald-600 hover:text-emerald-800">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                {copiedDeviceId && <p className="text-[10px] text-emerald-600 mt-1">✓ تم النسخ</p>}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-2"><label className="text-xs font-semibold text-gray-600 mb-0.5 block">الاسم الكامل *</label><input value={regData.name} onChange={e => setRegData(p => ({ ...p, name: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 outline-none" required /></div>
                <div><label className="text-xs font-semibold text-gray-600 mb-0.5 block">رقم الهوية *</label><input value={regData.nationalId} onChange={e => setRegData(p => ({ ...p, nationalId: e.target.value }))} maxLength={10} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 outline-none" required /></div>
                <div><label className="text-xs font-semibold text-gray-600 mb-0.5 block">تاريخ الميلاد</label><input type="date" value={regData.birthDate} onChange={e => setRegData(p => ({ ...p, birthDate: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 outline-none" /></div>
                <div className="col-span-2"><label className="text-xs font-semibold text-gray-600 mb-0.5 block">المدرسة *</label><input value={regData.school} onChange={e => setRegData(p => ({ ...p, school: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 outline-none" required /></div>
                <div className="col-span-2"><label className="text-xs font-semibold text-gray-600 mb-0.5 block">الصف الدراسي</label><select value={regData.grade} onChange={e => setRegData(p => ({ ...p, grade: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 outline-none">{grades.map(g => <option key={g}>{g}</option>)}</select></div>
                <div><label className="text-xs font-semibold text-gray-600 mb-0.5 block">القسم *</label><select value={regData.department} onChange={e => setRegData(p => ({ ...p, department: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 outline-none">{DEPARTMENTS.map(d => <option key={d}>{d}</option>)}</select></div>
                <div><label className="text-xs font-semibold text-gray-600 mb-0.5 block">الفصل</label><input value={regData.classroom} onChange={e => setRegData(p => ({ ...p, classroom: e.target.value }))} placeholder="مثال: 4/2" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 outline-none" /></div>
                <div className="col-span-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 text-xs text-blue-700">👤 المنسق المسؤول عن قسمك: <strong>{DEPARTMENT_COORDINATOR[regData.department] || "—"}</strong></div>
                <div><label className="text-xs font-semibold text-gray-600 mb-0.5 block">الجوال *</label><input value={regData.phone} onChange={e => setRegData(p => ({ ...p, phone: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 outline-none" required /></div>
                <div><label className="text-xs font-semibold text-gray-600 mb-0.5 block">جوال ولي الأمر</label><input value={regData.parentPhone} onChange={e => setRegData(p => ({ ...p, parentPhone: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 outline-none" /></div>
                <div className="col-span-2"><label className="text-xs font-semibold text-gray-600 mb-0.5 block">البريد الإلكتروني</label><input type="email" value={regData.email} onChange={e => setRegData(p => ({ ...p, email: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 outline-none" /></div>
              </div>
              <button type="submit" disabled={submitting} className="w-full bg-emerald-700 text-white py-3 rounded-xl font-bold hover:bg-emerald-600 disabled:opacity-50">{submitting ? "جارٍ الإرسال..." : "إرسال بياناتي للإدارة"}</button>
            </form>
          )}

          {/* ===== منسق جديد ===== */}
          {mode === "coordinator" && (
            <form onSubmit={handleCoordRegister} className="space-y-3">
              <div className="flex flex-col items-center mb-2">
                <div onClick={() => photoRef.current?.click()} className="w-20 h-20 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-violet-400 overflow-hidden">
                  {coordData.photo ? <img src={coordData.photo} alt="" className="w-full h-full object-cover" /> : <div className="text-center"><Camera className="w-5 h-5 text-gray-400 mx-auto mb-0.5" /><span className="text-xs text-gray-400">صورة</span></div>}
                </div>
                <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={e => handlePhoto(e, v => setCoordData(p => ({ ...p, photo: v })))} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-2"><label className="text-xs font-semibold text-gray-600 mb-0.5 block">الاسم الكامل *</label><input value={coordData.name} onChange={e => setCoordData(p => ({ ...p, name: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 outline-none" required /></div>
                <div className="col-span-2"><label className="text-xs font-semibold text-gray-600 mb-0.5 block">البريد الإلكتروني *</label><input type="email" value={coordData.email} onChange={e => setCoordData(p => ({ ...p, email: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 outline-none" required /></div>
                <div><label className="text-xs font-semibold text-gray-600 mb-0.5 block">الجوال *</label><input value={coordData.phone} onChange={e => setCoordData(p => ({ ...p, phone: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 outline-none" required /></div>
                <div><label className="text-xs font-semibold text-gray-600 mb-0.5 block">المدرسة *</label><input value={coordData.school} onChange={e => setCoordData(p => ({ ...p, school: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 outline-none" required /></div>
                <div className="col-span-2"><label className="text-xs font-semibold text-gray-600 mb-0.5 block">التخصص / المادة *</label><input value={coordData.subject} onChange={e => setCoordData(p => ({ ...p, subject: e.target.value }))} placeholder="مثال: علوم الحاسب، روبوتيك" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 outline-none" required /></div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-600 mb-0.5 block">السيرة الذاتية (PDF) <span className="text-gray-400 font-normal">— اختياري</span></label>
                  <div onClick={() => cvRef.current?.click()} className={`w-full border-2 border-dashed rounded-xl px-3 py-3 cursor-pointer flex items-center gap-2 ${coordData.cv ? "border-violet-400 bg-violet-50" : "border-gray-300 bg-gray-50"}`}>
                    <FileText className={`w-5 h-5 flex-shrink-0 ${coordData.cv ? "text-violet-600" : "text-gray-400"}`} />
                    <span className={`text-sm truncate ${coordData.cv ? "text-violet-700 font-medium" : "text-gray-400"}`}>{coordData.cvName || "اضغط لرفع السيرة الذاتية (اختياري)"}</span>
                  </div>
                  <input ref={cvRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleCV} />
                </div>
                <div><label className="text-xs font-semibold text-gray-600 mb-0.5 block">كلمة المرور *</label><input type="password" value={coordData.password} onChange={e => setCoordData(p => ({ ...p, password: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 outline-none" required /></div>
                <div><label className="text-xs font-semibold text-gray-600 mb-0.5 block">تأكيد المرور *</label><input type="password" value={coordData.confirmPassword} onChange={e => setCoordData(p => ({ ...p, confirmPassword: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 outline-none" required /></div>
              </div>
              <div><label className="text-xs font-semibold text-gray-600 mb-0.5 block">رمز التسجيل <span className="text-gray-400 font-normal">(مطلوب)</span></label><input value={coordData.regCode} onChange={e => setCoordData(p => ({ ...p, regCode: e.target.value }))} placeholder="أدخل رمز التسجيل" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 outline-none" /></div>
              <button type="submit" disabled={submitting} className="w-full bg-violet-700 text-white py-3 rounded-xl font-bold hover:bg-violet-600 disabled:opacity-50">{submitting ? "جارٍ الإرسال..." : "إنشاء حساب منسق"}</button>
            </form>
          )}

          <p className="mt-4 text-center text-xs text-gray-400">مركز المعرفة والابتكار STEAM بمدارس الأرقم • 2025</p>
        </div>
      </div>
    </div>
  );
}

"use client";
import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Camera, Sparkles, LogIn, UserPlus, Briefcase, FileText } from "lucide-react";

const grades = [
  "الصف الأول الابتدائي", "الصف الثاني الابتدائي", "الصف الثالث الابتدائي",
  "الصف الرابع الابتدائي", "الصف الخامس الابتدائي", "الصف السادس الابتدائي",
  "الصف الأول المتوسط", "الصف الثاني المتوسط", "الصف الثالث المتوسط",
  "الصف الأول الثانوي", "الصف الثاني الثانوي", "الصف الثالث الثانوي",
];

type Mode = "login" | "student" | "coordinator";

export default function LoginPage() {
  const { login, loginCoordinator, register, registerCoordinator } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const photoRef = useRef<HTMLInputElement>(null);
  const cvRef = useRef<HTMLInputElement>(null);

  const [loginData, setLoginData] = useState({ identifier: "", password: "", type: "student" as "student" | "coordinator" });

  const [regData, setRegData] = useState({
    name: "", nationalId: "", school: "", grade: grades[0],
    phone: "", email: "", parentPhone: "", birthDate: "",
    photo: "", password: "", confirmPassword: "", teams: [] as string[],
    regCode: "",
  });

  const [coordData, setCoordData] = useState({
    name: "", email: "", phone: "", school: "", subject: "",
    photo: "", cv: "", cvName: "", password: "", confirmPassword: "",
    regCode: "",
  });

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>, setter: (v: string) => void) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 3 * 1024 * 1024) { setError("حجم الصورة يجب أن يكون أقل من 3 ميجا"); return; }
    const r = new FileReader();
    r.onload = ev => setter(ev.target?.result as string);
    r.readAsDataURL(f);
  };

  const handleCV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) { setError("حجم الملف يجب أن يكون أقل من 10 ميجا"); return; }
    const r = new FileReader();
    r.onload = ev => setCoordData(p => ({ ...p, cv: ev.target?.result as string, cvName: f.name }));
    r.readAsDataURL(f);
    e.target.value = "";
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    const result = loginData.type === "coordinator"
      ? loginCoordinator(loginData.identifier, loginData.password)
      : login(loginData.identifier, loginData.password);
    if (result.success) {
      router.push(loginData.type === "coordinator" ? "/coordinator-portal" : "/student-portal");
    } else { setError(result.message); }
  };

  const handleStudentRegister = (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    if (!regData.name || !regData.nationalId || !regData.school || !regData.phone) { setError("يرجى تعبئة الحقول المطلوبة"); return; }
    if (regData.password.length < 6) { setError("كلمة المرور 6 أحرف على الأقل"); return; }
    if (regData.password !== regData.confirmPassword) { setError("كلمة المرور غير متطابقة"); return; }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, regCode, ...data } = regData;
    const result = register(data, regCode);
    if (result.success) { setSuccess("تم إنشاء حسابك! جارٍ التوجيه..."); setTimeout(() => router.push("/student-portal"), 1200); }
    else { setError(result.message); }
  };

  const handleCoordRegister = (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    if (!coordData.name || !coordData.email || !coordData.phone || !coordData.school || !coordData.subject) { setError("يرجى تعبئة الحقول المطلوبة"); return; }
    if (!coordData.cv) { setError("يرجى رفع السيرة الذاتية"); return; }
    if (coordData.password.length < 6) { setError("كلمة المرور 6 أحرف على الأقل"); return; }
    if (coordData.password !== coordData.confirmPassword) { setError("كلمة المرور غير متطابقة"); return; }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, regCode, ...data } = coordData;
    const result = registerCoordinator(data, regCode);
    if (result.success) { setSuccess("تم إرسال طلبك! جارٍ التوجيه..."); setTimeout(() => router.push("/coordinator-portal"), 1200); }
    else { setError(result.message); }
  };

  const clear = (m: Mode) => { setMode(m); setError(""); setSuccess(""); };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-10 h-10 text-yellow-300" />
          </div>
          <h1 className="text-2xl font-bold text-white">مركز المعرفة والابتكار STEAM</h1>
          <p className="text-blue-200 mt-1">بمدارس الأرقم</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-6">
          {/* Mode tabs */}
          <div className="flex gap-1.5 mb-5 bg-gray-100 rounded-2xl p-1">
            {([
              { id: "login", label: "دخول", icon: LogIn, color: "bg-blue-800" },
              { id: "student", label: "طالب جديد", icon: UserPlus, color: "bg-emerald-700" },
              { id: "coordinator", label: "منسق جديد", icon: Briefcase, color: "bg-violet-700" },
            ] as const).map(t => {
              const Icon = t.icon;
              return (
                <button key={t.id} onClick={() => clear(t.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all ${mode === t.id ? `${t.color} text-white shadow` : "text-gray-500"}`}>
                  <Icon className="w-3.5 h-3.5" /> {t.label}
                </button>
              );
            })}
          </div>

          {error && <div className="mb-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}
          {success && <div className="mb-3 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">{success}</div>}

          {/* Login */}
          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="flex gap-2 mb-1">
                {(["student", "coordinator"] as const).map(t => (
                  <button key={t} type="button" onClick={() => setLoginData(p => ({ ...p, type: t }))}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all ${loginData.type === t ? "bg-blue-800 text-white border-blue-800" : "text-gray-500 border-gray-200"}`}>
                    {t === "student" ? "طالب" : "منسق"}
                  </button>
                ))}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  {loginData.type === "student" ? "رقم الهوية الوطنية" : "البريد الإلكتروني"}
                </label>
                <input value={loginData.identifier} onChange={e => setLoginData(p => ({ ...p, identifier: e.target.value }))}
                  placeholder={loginData.type === "student" ? "أدخل رقم الهوية" : "أدخل البريد الإلكتروني"}
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
              <button type="submit" className="w-full bg-blue-800 text-white py-3 rounded-xl font-bold hover:bg-blue-700">دخول</button>
            </form>
          )}

          {/* Student Register */}
          {mode === "student" && (
            <form onSubmit={handleStudentRegister} className="space-y-3">
              <div className="flex flex-col items-center mb-2">
                <div onClick={() => photoRef.current?.click()} className="w-20 h-20 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-blue-400 overflow-hidden">
                  {regData.photo ? <img src={regData.photo} alt="" className="w-full h-full object-cover" /> : <div className="text-center"><Camera className="w-5 h-5 text-gray-400 mx-auto mb-0.5" /><span className="text-xs text-gray-400">صورة</span></div>}
                </div>
                <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={e => handlePhoto(e, v => setRegData(p => ({ ...p, photo: v })))} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-2"><label className="text-xs font-semibold text-gray-600 mb-0.5 block">الاسم الكامل *</label><input value={regData.name} onChange={e => setRegData(p => ({ ...p, name: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 outline-none" required /></div>
                <div><label className="text-xs font-semibold text-gray-600 mb-0.5 block">رقم الهوية *</label><input value={regData.nationalId} onChange={e => setRegData(p => ({ ...p, nationalId: e.target.value }))} maxLength={10} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 outline-none" required /></div>
                <div><label className="text-xs font-semibold text-gray-600 mb-0.5 block">تاريخ الميلاد</label><input type="date" value={regData.birthDate} onChange={e => setRegData(p => ({ ...p, birthDate: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 outline-none" /></div>
                <div className="col-span-2"><label className="text-xs font-semibold text-gray-600 mb-0.5 block">المدرسة *</label><input value={regData.school} onChange={e => setRegData(p => ({ ...p, school: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 outline-none" required /></div>
                <div className="col-span-2"><label className="text-xs font-semibold text-gray-600 mb-0.5 block">الصف الدراسي</label><select value={regData.grade} onChange={e => setRegData(p => ({ ...p, grade: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 outline-none">{grades.map(g => <option key={g}>{g}</option>)}</select></div>
                <div><label className="text-xs font-semibold text-gray-600 mb-0.5 block">الجوال *</label><input value={regData.phone} onChange={e => setRegData(p => ({ ...p, phone: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 outline-none" required /></div>
                <div><label className="text-xs font-semibold text-gray-600 mb-0.5 block">جوال ولي الأمر</label><input value={regData.parentPhone} onChange={e => setRegData(p => ({ ...p, parentPhone: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 outline-none" /></div>
                <div className="col-span-2"><label className="text-xs font-semibold text-gray-600 mb-0.5 block">البريد الإلكتروني</label><input type="email" value={regData.email} onChange={e => setRegData(p => ({ ...p, email: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 outline-none" /></div>
                <div><label className="text-xs font-semibold text-gray-600 mb-0.5 block">كلمة المرور *</label><input type="password" value={regData.password} onChange={e => setRegData(p => ({ ...p, password: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 outline-none" required /></div>
                <div><label className="text-xs font-semibold text-gray-600 mb-0.5 block">تأكيد المرور *</label><input type="password" value={regData.confirmPassword} onChange={e => setRegData(p => ({ ...p, confirmPassword: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 outline-none" required /></div>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-semibold text-gray-600 mb-0.5 block">رمز التسجيل <span className="text-gray-400 font-normal">(إن وجد)</span></label>
                <input value={regData.regCode} onChange={e => setRegData(p => ({ ...p, regCode: e.target.value }))} placeholder="أدخل الرمز إن طُلب منك" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 outline-none" />
              </div>
              <button type="submit" className="w-full bg-emerald-700 text-white py-3 rounded-xl font-bold hover:bg-emerald-600 mt-1">إنشاء حساب طالب</button>
            </form>
          )}

          {/* Coordinator Register */}
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
                <div className="col-span-2"><label className="text-xs font-semibold text-gray-600 mb-0.5 block">التخصص / المادة *</label><input value={coordData.subject} onChange={e => setCoordData(p => ({ ...p, subject: e.target.value }))} placeholder="مثال: علوم الحاسب، روبوتيك، رياضيات" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 outline-none" required /></div>
                {/* CV Upload */}
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-600 mb-0.5 block">السيرة الذاتية (PDF) *</label>
                  <div onClick={() => cvRef.current?.click()} className={`w-full border-2 border-dashed rounded-xl px-3 py-3 cursor-pointer transition-all flex items-center gap-2 ${coordData.cv ? "border-violet-400 bg-violet-50" : "border-gray-300 hover:border-violet-400 bg-gray-50"}`}>
                    <FileText className={`w-5 h-5 flex-shrink-0 ${coordData.cv ? "text-violet-600" : "text-gray-400"}`} />
                    <span className={`text-sm truncate ${coordData.cv ? "text-violet-700 font-medium" : "text-gray-400"}`}>{coordData.cvName || "اضغط لرفع السيرة الذاتية"}</span>
                  </div>
                  <input ref={cvRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleCV} />
                </div>
                <div><label className="text-xs font-semibold text-gray-600 mb-0.5 block">كلمة المرور *</label><input type="password" value={coordData.password} onChange={e => setCoordData(p => ({ ...p, password: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 outline-none" required /></div>
                <div><label className="text-xs font-semibold text-gray-600 mb-0.5 block">تأكيد المرور *</label><input type="password" value={coordData.confirmPassword} onChange={e => setCoordData(p => ({ ...p, confirmPassword: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 outline-none" required /></div>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-semibold text-gray-600 mb-0.5 block">رمز التسجيل <span className="text-gray-400 font-normal">(مطلوب)</span></label>
                <input value={coordData.regCode} onChange={e => setCoordData(p => ({ ...p, regCode: e.target.value }))} placeholder="أدخل رمز التسجيل" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 outline-none" />
              </div>
              <button type="submit" className="w-full bg-violet-700 text-white py-3 rounded-xl font-bold hover:bg-violet-600 mt-1">إنشاء حساب منسق</button>
            </form>
          )}

          <p className="mt-4 text-center text-xs text-gray-400">مركز المعرفة والابتكار STEAM بمدارس الأرقم • 2025</p>
        </div>
      </div>
    </div>
  );
}

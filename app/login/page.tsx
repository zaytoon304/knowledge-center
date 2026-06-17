"use client";
import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Camera, Sparkles, LogIn, UserPlus } from "lucide-react";

const grades = [
  "الصف الأول المتوسط", "الصف الثاني المتوسط", "الصف الثالث المتوسط",
  "الصف الأول الثانوي", "الصف الثاني الثانوي", "الصف الثالث الثانوي",
];

export default function LoginPage() {
  const { login, register } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const photoRef = useRef<HTMLInputElement>(null);

  // Login form
  const [loginData, setLoginData] = useState({ nationalId: "", password: "" });

  // Register form
  const [regData, setRegData] = useState({
    name: "", nationalId: "", school: "", grade: grades[0],
    phone: "", email: "", parentPhone: "", birthDate: "",
    photo: "", password: "", confirmPassword: "",
    teams: [] as string[],
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { setError("حجم الصورة يجب أن يكون أقل من 3 ميجا"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setRegData(p => ({ ...p, photo: ev.target?.result as string }));
    reader.readAsDataURL(file);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const result = login(loginData.nationalId, loginData.password);
    if (result.success) {
      router.push("/student-portal");
    } else {
      setError(result.message);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!regData.name || !regData.nationalId || !regData.school || !regData.phone) {
      setError("يرجى تعبئة جميع الحقول المطلوبة");
      return;
    }
    if (regData.password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }
    if (regData.password !== regData.confirmPassword) {
      setError("كلمة المرور وتأكيدها غير متطابقتين");
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...data } = regData;
    const result = register(data);
    if (result.success) {
      setSuccess("تم إنشاء حسابك بنجاح! جارٍ التوجيه...");
      setTimeout(() => router.push("/student-portal"), 1500);
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-10 h-10 text-yellow-300" />
          </div>
          <h1 className="text-2xl font-bold text-white">مركز المعرفة والابتكار STEAM</h1>
          <p className="text-blue-200 mt-1">بمدارس الأرقم</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {/* Mode Switch */}
          <div className="flex gap-2 mb-6 bg-gray-100 rounded-2xl p-1">
            <button
              onClick={() => { setMode("login"); setError(""); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${mode === "login" ? "bg-blue-800 text-white shadow-md" : "text-gray-600"}`}
            >
              <LogIn className="w-4 h-4" /> دخول
            </button>
            <button
              onClick={() => { setMode("register"); setError(""); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${mode === "register" ? "bg-emerald-700 text-white shadow-md" : "text-gray-600"}`}
            >
              <UserPlus className="w-4 h-4" /> تسجيل جديد
            </button>
          </div>

          {/* Error / Success */}
          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}
          {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">{success}</div>}

          {/* Login Form */}
          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">رقم الهوية الوطنية</label>
                <input
                  type="text"
                  value={loginData.nationalId}
                  onChange={e => setLoginData(p => ({ ...p, nationalId: e.target.value }))}
                  placeholder="أدخل رقم الهوية"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 outline-none focus:border-blue-500 focus:bg-white transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">كلمة المرور</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={loginData.password}
                    onChange={e => setLoginData(p => ({ ...p, password: e.target.value }))}
                    placeholder="أدخل كلمة المرور"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 outline-none focus:border-blue-500 focus:bg-white transition-colors"
                    required
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute left-3 top-3.5 text-gray-400">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button type="submit" className="w-full bg-blue-800 text-white py-3.5 rounded-xl font-bold text-base hover:bg-blue-700 transition-colors mt-2">
                دخول إلى بوابتي
              </button>
            </form>
          )}

          {/* Register Form */}
          {mode === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Photo Upload */}
              <div className="flex flex-col items-center mb-2">
                <div
                  onClick={() => photoRef.current?.click()}
                  className="w-24 h-24 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all overflow-hidden"
                >
                  {regData.photo ? (
                    <img src={regData.photo} alt="صورة" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <Camera className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                      <span className="text-xs text-gray-400">صورة شخصية</span>
                    </div>
                  )}
                </div>
                <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                <p className="text-xs text-gray-400 mt-1">اضغط لإضافة صورة شخصية</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">الاسم الكامل *</label>
                  <input type="text" value={regData.name} onChange={e => setRegData(p => ({ ...p, name: e.target.value }))}
                    placeholder="اسمك الرباعي" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-blue-500" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">رقم الهوية *</label>
                  <input type="text" value={regData.nationalId} onChange={e => setRegData(p => ({ ...p, nationalId: e.target.value }))}
                    placeholder="10 أرقام" maxLength={10} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-blue-500" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">تاريخ الميلاد</label>
                  <input type="date" value={regData.birthDate} onChange={e => setRegData(p => ({ ...p, birthDate: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-blue-500" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">المدرسة *</label>
                  <input type="text" value={regData.school} onChange={e => setRegData(p => ({ ...p, school: e.target.value }))}
                    placeholder="اسم المدرسة" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-blue-500" required />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">الصف الدراسي *</label>
                  <select value={regData.grade} onChange={e => setRegData(p => ({ ...p, grade: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-blue-500">
                    {grades.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">جوال الطالب *</label>
                  <input type="tel" value={regData.phone} onChange={e => setRegData(p => ({ ...p, phone: e.target.value }))}
                    placeholder="05xxxxxxxx" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-blue-500" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">جوال ولي الأمر</label>
                  <input type="tel" value={regData.parentPhone} onChange={e => setRegData(p => ({ ...p, parentPhone: e.target.value }))}
                    placeholder="05xxxxxxxx" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-blue-500" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">البريد الإلكتروني</label>
                  <input type="email" value={regData.email} onChange={e => setRegData(p => ({ ...p, email: e.target.value }))}
                    placeholder="example@email.com" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">كلمة المرور *</label>
                  <input type="password" value={regData.password} onChange={e => setRegData(p => ({ ...p, password: e.target.value }))}
                    placeholder="6 أحرف أو أكثر" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-blue-500" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">تأكيد المرور *</label>
                  <input type="password" value={regData.confirmPassword} onChange={e => setRegData(p => ({ ...p, confirmPassword: e.target.value }))}
                    placeholder="أعد كتابة المرور" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-blue-500" required />
                </div>
              </div>

              <button type="submit" className="w-full bg-emerald-700 text-white py-3.5 rounded-xl font-bold text-base hover:bg-emerald-600 transition-colors mt-2">
                إنشاء الحساب
              </button>
            </form>
          )}

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-400">مركز المعرفة والابتكار STEAM بمدارس الأرقم • 2025</p>
          </div>
        </div>
      </div>
    </div>
  );
}

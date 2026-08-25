"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heart, CheckCircle } from "lucide-react";
import { cloudPush } from "@/lib/cloud";
import { GRADES } from "@/lib/grades";
import { InterestSurveyResponse, PROGRAM_CATEGORIES, OPEN_COMPETITIONS, TRAINING_COMPETITIONS } from "@/lib/interestSurvey";
import CenterLogo from "@/components/icons/CenterLogo";

const emptyForm = { parentName: "", parentPhone: "", childName: "", grade: "", section: "" as "" | "عام" | "تحفيظ", notes: "" };

export default function InterestSurveyPage() {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [interests, setInterests] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const toggleInterest = (item: string) => {
    setInterests(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  const reset = () => { setForm(emptyForm); setInterests([]); setDone(false); };

  // بعد الشكر، ننقله تلقائياً للصفحة الرئيسية للمنصة عشان يستكشفها ويتشجع ينضم
  useEffect(() => {
    if (!done) return;
    const timer = setTimeout(() => router.push("/"), 2500);
    return () => clearTimeout(timer);
  }, [done, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.parentName.trim() || !form.parentPhone.trim() || !form.childName.trim() || !form.grade || !form.section) {
      setError("يُرجى تعبئة جميع الحقول المطلوبة (المشار إليها بعلامة *)");
      return;
    }
    if (interests.length === 0) {
      setError("يُرجى اختيار اهتمام واحد على الأقل");
      return;
    }
    setBusy(true);
    const response: InterestSurveyResponse = {
      id: Date.now().toString(),
      parentName: form.parentName.trim(),
      parentPhone: form.parentPhone.trim(),
      childName: form.childName.trim(),
      grade: form.grade,
      section: form.section,
      interests,
      notes: form.notes.trim(),
      submittedAt: new Date().toISOString(),
    };
    const ok = await cloudPush("kc_interest_survey", response);
    setBusy(false);
    if (!ok) { setError("تعذّر إرسال الاستبانة — يُرجى التأكد من الاتصال بالإنترنت والمحاولة مجدداً"); return; }
    setDone(true);
  };

  if (done) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 to-teal-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md text-center space-y-5">
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="bg-white rounded-2xl px-2.5 py-1.5 shadow border border-gray-100">
              <img src="/arqam-logo.png" alt="شعار مدارس الأرقم" className="w-24 object-contain" />
            </div>
            <CenterLogo className="w-10 h-10 drop-shadow-lg" />
          </div>
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto">
            <CheckCircle className="w-9 h-9 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">شكراً لكم، تم إرسال إجابتكم بنجاح 🎉</h1>
            <p className="text-sm text-gray-500 mt-2">نُقدّر مشاركتكم، وستُؤخذ إجاباتكم بعين الاعتبار عند تصميم برامجنا القادمة.</p>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-right space-y-1.5">
            <p className="text-sm text-emerald-800 font-semibold">تفضّلوا بزيارة منصتنا الكاملة 🌱</p>
            <p className="text-xs text-emerald-700">مركز المعرفة والابتكار STEAM بمدارس الأرقم — دورات ومسابقات وأنشطة حقيقية على مدار العام.</p>
          </div>
          <p className="text-xs text-gray-400">سيتم تحويلكم تلقائياً إلى المنصة خلال لحظات...</p>
          <button onClick={() => router.push("/")}
            className="w-full bg-emerald-700 text-white py-3 rounded-xl font-bold hover:bg-emerald-600">
            تصفّح المنصة الآن
          </button>
          <button onClick={reset} className="w-full text-gray-400 text-xs hover:underline">
            تعبئة الاستبانة لطفل آخر
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 to-teal-800 flex items-center justify-center p-4 py-10">
      <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="bg-white rounded-2xl px-3 py-2 shadow border border-gray-100">
              <img src="/arqam-logo.png" alt="شعار مدارس الأرقم" className="w-28 object-contain" />
            </div>
            <CenterLogo className="w-12 h-12 drop-shadow-lg" />
          </div>
          <h1 className="text-xl font-bold text-gray-800 flex items-center justify-center gap-2">
            <Heart className="w-5 h-5 text-emerald-600" /> استبانة اهتمامات الطلاب
          </h1>
          <p className="text-sm text-gray-500">مركز المعرفة والابتكار STEAM بمدارس الأرقم</p>
          <p className="text-sm text-gray-600 leading-relaxed">ساعدونا في التعرّف على ما يحبّه طفلكم لنُعِدَّ له أنسب البرامج — تعبئة الاستبانة لا تُلزمكم بالتسجيل، لكنّ رأيكم يهمّنا 🌱</p>
        </div>

        <form onSubmit={submit} className="space-y-5">
          {error && <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm text-center">{error}</div>}

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">اسم ولي الأمر *</label>
              <input value={form.parentName} onChange={e => setForm({ ...form, parentName: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">جوال ولي الأمر *</label>
              <input value={form.parentPhone} onChange={e => setForm({ ...form, parentPhone: e.target.value })} type="tel" dir="ltr"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 outline-none focus:border-emerald-500" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">اسم الطالب/ة *</label>
              <input value={form.childName} onChange={e => setForm({ ...form, childName: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">الصف الدراسي *</label>
              <select value={form.grade} onChange={e => setForm({ ...form, grade: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 outline-none focus:border-emerald-500">
                <option value="">اختر الصف الدراسي</option>
                {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">القسم *</label>
            <div className="grid grid-cols-2 gap-2">
              {(["عام", "تحفيظ"] as const).map(s => (
                <label key={s}
                  className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-semibold cursor-pointer transition-all ${form.section === s ? "bg-emerald-700 text-white border-emerald-700" : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"}`}>
                  <input type="radio" name="section" checked={form.section === s} onChange={() => setForm({ ...form, section: s })} className="hidden" />
                  {s}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-700">برامج الوحدة</h3>
            <p className="text-xs text-gray-400 -mt-2">اختر المجال، ثم حدّد ما يناسب طفلكم من الخيارات التي تظهر تحته</p>
            {PROGRAM_CATEGORIES.map(cat => {
              const catChecked = interests.includes(cat.id);
              return (
                <div key={cat.id} className={`rounded-xl border transition-all ${catChecked ? "border-emerald-300 bg-emerald-50/40" : "border-gray-200"}`}>
                  <label className="flex items-center gap-2 px-3 py-2.5 cursor-pointer">
                    <input type="checkbox" checked={catChecked} onChange={() => toggleInterest(cat.id)}
                      className="w-4 h-4 accent-emerald-700" />
                    <span className={`text-sm font-bold ${catChecked ? "text-emerald-800" : "text-gray-700"}`}>{cat.id}</span>
                  </label>
                  {catChecked && cat.subItems.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 px-3 pb-3">
                      {cat.subItems.map(item => {
                        const checked = interests.includes(item);
                        return (
                          <label key={item}
                            className={`flex items-center justify-center text-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${checked ? "bg-emerald-700 text-white border-emerald-700" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}>
                            <input type="checkbox" checked={checked} onChange={() => toggleInterest(item)} className="hidden" />
                            {item}
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-700">الاشتراك بالمسابقات</h3>

            <div>
              <p className="text-xs text-gray-500 mb-2">مسابقات عامة</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {OPEN_COMPETITIONS.map(item => {
                  const checked = interests.includes(item);
                  return (
                    <label key={item}
                      className={`flex items-center justify-center text-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${checked ? "bg-emerald-700 text-white border-emerald-700" : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"}`}>
                      <input type="checkbox" checked={checked} onChange={() => toggleInterest(item)} className="hidden" />
                      {item}
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-2">مسابقات تتطلّب تدريباً مسبقاً واجتياز شروط معيّنة للاشتراك</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {TRAINING_COMPETITIONS.map(item => {
                  const checked = interests.includes(item);
                  return (
                    <label key={item}
                      className={`flex items-center justify-center text-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${checked ? "bg-emerald-700 text-white border-emerald-700" : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"}`}>
                      <input type="checkbox" checked={checked} onChange={() => toggleInterest(item)} className="hidden" />
                      {item}
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">ملاحظات إضافية (اختياري)</label>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 outline-none focus:border-emerald-500 resize-none" />
          </div>

          <button type="submit" disabled={busy}
            className="w-full bg-emerald-700 text-white py-3 rounded-xl font-bold hover:bg-emerald-600 disabled:opacity-60">
            {busy ? "جاري الإرسال..." : "إرسال الاستبانة"}
          </button>
        </form>
      </div>
    </div>
  );
}

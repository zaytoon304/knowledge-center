"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, ArrowRight, Layers } from "lucide-react";
import { cloudPush } from "@/lib/cloud";
import { GRADES } from "@/lib/grades";

export interface ProgramRegistration {
  id: string;
  programId: string;
  programTitle: string;
  name: string;
  gradeOrRole: string;
  phone: string;
  notes: string;
  submittedAt: string;
}

const emptyForm = { name: "", gradeOrRole: "", phone: "", notes: "" };

function RegisterForm() {
  const params = useSearchParams();
  const router = useRouter();
  const programId = params.get("id") || "";
  const programTitle = params.get("title") || "البرنامج";

  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!done) return;
    const timer = setTimeout(() => router.push("/programs"), 2500);
    return () => clearTimeout(timer);
  }, [done, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.phone.trim()) {
      setError("يُرجى تعبئة الاسم والجوال على الأقل");
      return;
    }
    setBusy(true);
    const reg: ProgramRegistration = {
      id: Date.now().toString(),
      programId,
      programTitle,
      name: form.name.trim(),
      gradeOrRole: form.gradeOrRole.trim(),
      phone: form.phone.trim(),
      notes: form.notes.trim(),
      submittedAt: new Date().toISOString(),
    };
    const ok = await cloudPush("kc_program_registrations", reg);
    setBusy(false);
    if (!ok) { setError("تعذّر إرسال طلبك — يُرجى التأكد من الاتصال بالإنترنت والمحاولة مجدداً"); return; }
    setDone(true);
  };

  if (done) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="card p-8 w-full max-w-md text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto">
            <CheckCircle className="w-9 h-9 text-emerald-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-800">تم إرسال طلب التسجيل بنجاح 🎉</h1>
          <p className="text-gray-500 text-sm">سجّلنا طلبك ببرنامج "{programTitle}"، وراح تتواصل معك الإدارة بالتفاصيل قريباً.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in max-w-lg mx-auto">
      <div className="card p-5 bg-gradient-to-l from-purple-800 to-violet-600 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0"><Layers className="w-6 h-6" /></div>
          <div>
            <p className="text-white/80 text-xs">التسجيل ببرنامج</p>
            <h1 className="text-xl font-bold">{programTitle}</h1>
          </div>
        </div>
      </div>

      <form onSubmit={submit} className="card p-6 space-y-4">
        {error && <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">{error}</div>}
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-1 block">الاسم الكامل *</label>
          <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none" required />
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-1 block">الصف الدراسي (للطلاب) — اختياري</label>
          <select value={form.gradeOrRole} onChange={e => setForm(p => ({ ...p, gradeOrRole: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none">
            <option value="">— غير محدد / لست طالباً —</option>
            {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-1 block">جوال للتواصل *</label>
          <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} type="tel" dir="ltr"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none" required />
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-1 block">ملاحظات (اختياري)</label>
          <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={3}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none resize-none" />
        </div>
        <button type="submit" disabled={busy}
          className="w-full bg-gradient-to-l from-purple-700 to-violet-500 text-white py-3 rounded-xl font-bold hover:opacity-90 disabled:opacity-50">
          {busy ? "جارٍ الإرسال..." : "إرسال طلب التسجيل"}
        </button>
      </form>

      <button onClick={() => router.push("/programs")} className="flex items-center gap-1.5 text-gray-500 text-sm hover:text-gray-700">
        <ArrowRight className="w-4 h-4" /> رجوع لمركز البرامج
      </button>
    </div>
  );
}

export default function ProgramRegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}

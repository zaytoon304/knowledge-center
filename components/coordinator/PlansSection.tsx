"use client";
import { useState, useEffect } from "react";
import { Plus, Trash2, FileText, Download, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface PlanItem {
  id: string; type: "annual" | "monthly" | "weekly";
  title: string; period: string; content: string;
  file?: string; fileName?: string; createdAt: string;
}

const TYPE_LABELS = { annual: "سنوية", monthly: "شهرية", weekly: "أسبوعية" };
const TYPE_COLORS = { annual: "from-blue-700 to-blue-500", monthly: "from-violet-700 to-purple-500", weekly: "from-teal-700 to-green-500" };

export default function PlansSection() {
  const { user } = useAuth();
  const key = `kc_coord_plans_${user!.id}`;
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [activeType, setActiveType] = useState<"annual" | "monthly" | "weekly">("annual");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", period: "", content: "", file: "", fileName: "" });
  useEffect(() => {
    const s = localStorage.getItem(key);
    setPlans(s ? JSON.parse(s) : []);
  }, []);

  const save = (updated: PlanItem[]) => { setPlans(updated); localStorage.setItem(key, JSON.stringify(updated)); };

  const add = () => {
    if (!form.title.trim() || !form.period.trim()) return;
    const item: PlanItem = { ...form, id: Date.now().toString(), type: activeType, createdAt: new Date().toISOString() };
    save([...plans, item]);
    setForm({ title: "", period: "", content: "", file: "", fileName: "" });
    setShowForm(false);
  };

  const remove = (id: string) => save(plans.filter(p => p.id !== id));

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = ev => setForm(p => ({ ...p, file: ev.target?.result as string, fileName: f.name }));
    r.readAsDataURL(f);
    e.target.value = "";
  };

  const filtered = plans.filter(p => p.type === activeType);

  return (
    <div className="space-y-4">
      {/* Type tabs */}
      <div className="flex gap-2">
        {(["annual", "monthly", "weekly"] as const).map(t => (
          <button key={t} onClick={() => { setActiveType(t); setShowForm(false); }}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeType === t ? `bg-gradient-to-r ${TYPE_COLORS[t]} text-white shadow` : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"}`}>
            {TYPE_LABELS[t]}
          </button>
        ))}
        <button onClick={() => setShowForm(!showForm)} className="mr-auto flex items-center gap-2 bg-blue-800 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700">
          <Plus className="w-4 h-4" /> إضافة خطة
        </button>
      </div>

      {showForm && (
        <div className="card p-5 space-y-3">
          <h3 className="font-bold text-gray-700">خطة {TYPE_LABELS[activeType]} جديدة</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><label className="text-xs font-semibold text-gray-600 mb-1 block">عنوان الخطة *</label><input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-blue-500" /></div>
            <div><label className="text-xs font-semibold text-gray-600 mb-1 block">الفترة * <span className="font-normal text-gray-400">(مثال: 2025، أبريل 2025)</span></label><input value={form.period} onChange={e => setForm(p => ({ ...p, period: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-blue-500" /></div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">رفع ملف (PDF/Word)</label>
              <label
                className={`border-2 border-dashed rounded-xl px-3 py-2.5 cursor-pointer text-sm flex items-center gap-2 ${form.file ? "border-blue-400 bg-blue-50 text-blue-700" : "border-gray-300 text-gray-400 hover:border-blue-400"}`}>
                <FileText className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{form.fileName || "رفع ملف"}</span>
                <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFile} />
              </label>
            </div>
            <div className="col-span-2"><label className="text-xs font-semibold text-gray-600 mb-1 block">محتوى الخطة</label><textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} rows={4} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-blue-500 resize-none" /></div>
          </div>
          <div className="flex gap-2">
            <button onClick={add} className="bg-blue-800 text-white px-6 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700">حفظ</button>
            <button onClick={() => setShowForm(false)} className="bg-gray-100 text-gray-600 px-6 py-2 rounded-xl text-sm">إلغاء</button>
          </div>
        </div>
      )}

      {filtered.length === 0
        ? <div className="card p-12 text-center text-gray-400"><Calendar className="w-14 h-14 mx-auto mb-3 opacity-30" /><p className="font-medium">لا توجد خطط {TYPE_LABELS[activeType]} بعد</p><p className="text-sm mt-1">اضغط على إضافة خطة لإنشاء خطتك الأولى</p></div>
        : <div className="space-y-3">
            {filtered.map(p => (
              <div key={p.id} className="card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`bg-gradient-to-r ${TYPE_COLORS[p.type]} text-white text-xs px-2.5 py-0.5 rounded-full font-semibold`}>{TYPE_LABELS[p.type]}</span>
                      <span className="text-sm text-gray-500">{p.period}</span>
                    </div>
                    <h3 className="font-bold text-gray-800 text-base">{p.title}</h3>
                    {p.content && <p className="text-sm text-gray-600 mt-2 leading-relaxed whitespace-pre-wrap">{p.content}</p>}
                    {p.file && (
                      <button onClick={() => { const a = document.createElement("a"); a.href = p.file!; a.download = p.fileName!; a.click(); }}
                        className="mt-3 flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm">
                        <Download className="w-4 h-4" /> {p.fileName}
                      </button>
                    )}
                  </div>
                  <button onClick={() => remove(p.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-xl flex-shrink-0"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
      }
    </div>
  );
}

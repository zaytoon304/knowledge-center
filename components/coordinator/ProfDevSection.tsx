"use client";
import { useState, useEffect } from "react";
import { Plus, Trash2, GraduationCap, Download } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface ProfDevItem {
  id: string; title: string; provider: string; date: string;
  hours: string; type: string;
  certificate?: string; certificateName?: string; createdAt: string;
}

const TYPES = ["دورة تدريبية", "ورشة عمل", "مؤتمر", "ندوة", "برنامج إثرائي", "تدريب ميداني", "أخرى"];

export default function ProfDevSection() {
  const { user } = useAuth();
  const key = `kc_coord_profdev_${user!.id}`;
  const [items, setItems] = useState<ProfDevItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", provider: "", date: "", hours: "", type: "دورة تدريبية", certificate: "", certificateName: "" });

  useEffect(() => { const s = localStorage.getItem(key); setItems(s ? JSON.parse(s) : []); }, []);
  const save = (u: ProfDevItem[]) => { setItems(u); localStorage.setItem(key, JSON.stringify(u)); };

  const add = () => {
    if (!form.title.trim()) return;
    save([...items, { ...form, id: Date.now().toString(), createdAt: new Date().toISOString() }]);
    setForm({ title: "", provider: "", date: "", hours: "", type: "دورة تدريبية", certificate: "", certificateName: "" });
    setShowForm(false);
  };

  const handleCert = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = ev => setForm(p => ({ ...p, certificate: ev.target?.result as string, certificateName: f.name }));
    r.readAsDataURL(f);
    e.target.value = "";
  };

  const totalHours = items.reduce((s, i) => s + (parseFloat(i.hours) || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-gray-800">التطوير المهني ({items.length})</h2>
          {items.length > 0 && <p className="text-xs text-gray-500 mt-0.5">إجمالي ساعات التدريب: <span className="font-bold text-blue-700">{totalHours}</span> ساعة</p>}
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-blue-800 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700"><Plus className="w-4 h-4" /> إضافة</button>
      </div>

      {showForm && (
        <div className="card p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><label className="text-xs font-semibold text-gray-600 mb-1 block">اسم البرنامج / الدورة *</label><input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none" /></div>
            <div><label className="text-xs font-semibold text-gray-600 mb-1 block">الجهة المنظمة</label><input value={form.provider} onChange={e => setForm(p => ({ ...p, provider: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none" /></div>
            <div><label className="text-xs font-semibold text-gray-600 mb-1 block">النوع</label><select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none">{TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
            <div><label className="text-xs font-semibold text-gray-600 mb-1 block">التاريخ</label><input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none" /></div>
            <div><label className="text-xs font-semibold text-gray-600 mb-1 block">عدد الساعات</label><input type="number" value={form.hours} onChange={e => setForm(p => ({ ...p, hours: e.target.value }))} placeholder="0" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none" /></div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-600 mb-1 block">الشهادة (اختياري)</label>
              <label className={`flex items-center gap-2 border-2 border-dashed rounded-xl px-3 py-2.5 cursor-pointer text-sm ${form.certificate ? "border-green-400 bg-green-50 text-green-700" : "border-gray-300 text-gray-400 hover:border-green-400"}`}>
                <GraduationCap className="w-4 h-4" /> {form.certificate ? `✓ ${form.certificateName}` : "رفع الشهادة"}
                <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleCert} />
              </label>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={add} className="bg-blue-800 text-white px-6 py-2 rounded-xl text-sm font-semibold">حفظ</button>
            <button onClick={() => setShowForm(false)} className="bg-gray-100 text-gray-600 px-6 py-2 rounded-xl text-sm">إلغاء</button>
          </div>
        </div>
      )}

      {items.length === 0
        ? <div className="card p-12 text-center text-gray-400"><GraduationCap className="w-14 h-14 mx-auto mb-3 opacity-30" /><p>لا توجد برامج تطوير مهني بعد</p></div>
        : <div className="space-y-3">
            {items.map(item => (
              <div key={item.id} className="card p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl">
                  {item.type === "دورة تدريبية" ? "📚" : item.type === "ورشة عمل" ? "🔧" : item.type === "مؤتمر" ? "🎤" : "🎓"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800">{item.title}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5 flex-wrap">
                    {item.provider && <span>{item.provider}</span>}
                    {item.date && <span>{new Date(item.date).toLocaleDateString("ar-SA")}</span>}
                    {item.hours && <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">{item.hours} ساعة</span>}
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{item.type}</span>
                  </div>
                  {item.certificate && (
                    <button onClick={() => { const a = document.createElement("a"); a.href = item.certificate!; a.download = item.certificateName || "شهادة"; a.click(); }}
                      className="mt-1.5 flex items-center gap-1.5 text-xs text-green-600 hover:text-green-700">
                      <Download className="w-3.5 h-3.5" /> تحميل الشهادة
                    </button>
                  )}
                </div>
                <button onClick={() => save(items.filter(x => x.id !== item.id))} className="p-2 text-red-400 hover:bg-red-50 rounded-xl flex-shrink-0"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
      }
    </div>
  );
}

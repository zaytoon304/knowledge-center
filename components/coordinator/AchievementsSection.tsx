"use client";
import { useState, useEffect } from "react";
import { Plus, Trash2, Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface AchievItem {
  id: string; title: string; description: string; date: string;
  type: string; photo?: string; photoName?: string; createdAt: string;
}

const TYPES = ["جائزة", "شهادة تقدير", "إنجاز أكاديمي", "مشاركة مجتمعية", "إبداع وابتكار", "قيادة", "أخرى"];
const TYPE_EMOJIS: Record<string, string> = { "جائزة": "🏆", "شهادة تقدير": "🎖️", "إنجاز أكاديمي": "🎓", "مشاركة مجتمعية": "🤝", "إبداع وابتكار": "💡", "قيادة": "⭐", "أخرى": "📌" };

export default function AchievementsSection() {
  const { user } = useAuth();
  const key = `kc_coord_achiev_${user!.id}`;
  const [items, setItems] = useState<AchievItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", date: "", type: "جائزة", photo: "", photoName: "" });

  useEffect(() => { const s = localStorage.getItem(key); setItems(s ? JSON.parse(s) : []); }, []);
  const save = (u: AchievItem[]) => { setItems(u); localStorage.setItem(key, JSON.stringify(u)); };

  const add = () => {
    if (!form.title.trim()) return;
    save([...items, { ...form, id: Date.now().toString(), createdAt: new Date().toISOString() }]);
    setForm({ title: "", description: "", date: "", type: "جائزة", photo: "", photoName: "" });
    setShowForm(false);
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = ev => setForm(p => ({ ...p, photo: ev.target?.result as string, photoName: f.name }));
    r.readAsDataURL(f);
    e.target.value = "";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-gray-800">إنجازاتي ({items.length})</h2>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-blue-800 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700"><Plus className="w-4 h-4" /> إضافة إنجاز</button>
      </div>

      {showForm && (
        <div className="card p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><label className="text-xs font-semibold text-gray-600 mb-1 block">عنوان الإنجاز *</label><input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none" /></div>
            <div><label className="text-xs font-semibold text-gray-600 mb-1 block">النوع</label><select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none">{TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
            <div><label className="text-xs font-semibold text-gray-600 mb-1 block">التاريخ</label><input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none" /></div>
            <div className="col-span-2"><label className="text-xs font-semibold text-gray-600 mb-1 block">الوصف</label><textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none resize-none" /></div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-600 mb-1 block">صورة الإنجاز (اختياري)</label>
              <label className={`flex items-center gap-2 border-2 border-dashed rounded-xl px-3 py-2.5 cursor-pointer text-sm ${form.photo ? "border-amber-400 bg-amber-50 text-amber-700" : "border-gray-300 text-gray-400 hover:border-amber-400"}`}>
                {form.photo ? `✓ ${form.photoName}` : "رفع صورة"}
                <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
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
        ? <div className="card p-12 text-center text-gray-400"><Star className="w-14 h-14 mx-auto mb-3 opacity-30" /><p>لا توجد إنجازات بعد</p></div>
        : <div className="grid md:grid-cols-2 gap-4">
            {items.map(item => (
              <div key={item.id} className="card p-4 flex gap-4">
                {item.photo
                  ? <img src={item.photo} alt="" className="w-16 h-16 rounded-2xl object-cover flex-shrink-0" />
                  : <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center flex-shrink-0 text-3xl">{TYPE_EMOJIS[item.type] || "📌"}</div>
                }
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-gray-800 leading-tight">{item.title}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{item.type}</span>
                        {item.date && <span className="text-xs text-gray-400">{new Date(item.date).toLocaleDateString("ar-SA")}</span>}
                      </div>
                    </div>
                    <button onClick={() => save(items.filter(x => x.id !== item.id))} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg flex-shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                  {item.description && <p className="text-xs text-gray-500 mt-2 leading-relaxed line-clamp-3">{item.description}</p>}
                </div>
              </div>
            ))}
          </div>
      }
    </div>
  );
}

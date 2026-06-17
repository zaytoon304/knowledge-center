"use client";
import { useState, useEffect } from "react";
import { Plus, Trash2, Archive, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface ArchiveItem {
  id: string; title: string; date: string; event: string;
  photos: Array<{ data: string; name: string }>; createdAt: string;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise(r => { const fr = new FileReader(); fr.onload = e => r(e.target?.result as string); fr.readAsDataURL(file); });
}

export default function ArchiveSection() {
  const { user } = useAuth();
  const key = `kc_coord_archive_${user!.id}`;
  const [items, setItems] = useState<ArchiveItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", date: "", event: "", photos: [] as Array<{ data: string; name: string }> });

  useEffect(() => { const s = localStorage.getItem(key); setItems(s ? JSON.parse(s) : []); }, []);
  const save = (u: ArchiveItem[]) => { setItems(u); localStorage.setItem(key, JSON.stringify(u)); };

  const add = () => {
    if (!form.title.trim() || form.photos.length === 0) return;
    save([...items, { ...form, id: Date.now().toString(), createdAt: new Date().toISOString() }]);
    setForm({ title: "", date: "", event: "", photos: [] });
    setShowForm(false);
  };

  const addPhotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const loaded = await Promise.all(files.map(async f => ({ data: await fileToBase64(f), name: f.name })));
    setForm(p => ({ ...p, photos: [...p.photos, ...loaded] }));
    e.target.value = "";
  };

  return (
    <div className="space-y-4">
      {lightbox && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button className="absolute top-4 left-4 text-white" onClick={() => setLightbox(null)}><X className="w-8 h-8" /></button>
          <img src={lightbox} alt="" className="max-w-full max-h-full rounded-xl object-contain" onClick={e => e.stopPropagation()} />
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="font-bold text-gray-800">الأرشيف ({items.length} ألبوم)</h2>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-blue-800 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700"><Plus className="w-4 h-4" /> ألبوم جديد</button>
      </div>

      {showForm && (
        <div className="card p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><label className="text-xs font-semibold text-gray-600 mb-1 block">عنوان الألبوم *</label><input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none" /></div>
            <div><label className="text-xs font-semibold text-gray-600 mb-1 block">التاريخ</label><input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none" /></div>
            <div><label className="text-xs font-semibold text-gray-600 mb-1 block">المناسبة / الفعالية</label><input value={form.event} onChange={e => setForm(p => ({ ...p, event: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none" /></div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-600 mb-1 block">الصور ({form.photos.length}) *</label>
              <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-xl p-4 cursor-pointer hover:border-blue-400 text-sm text-gray-400">
                <Archive className="w-5 h-5" /> اضغط لرفع الصور (متعددة)
                <input type="file" accept="image/*" multiple className="hidden" onChange={addPhotos} />
              </label>
              {form.photos.length > 0 && (
                <div className="grid grid-cols-5 gap-1.5 mt-2">
                  {form.photos.map((p, i) => (
                    <div key={i} className="relative group">
                      <img src={p.data} alt="" className="w-full h-14 object-cover rounded-lg" />
                      <button onClick={() => setForm(pr => ({ ...pr, photos: pr.photos.filter((_, j) => j !== i) }))} className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100">×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={add} className="bg-blue-800 text-white px-6 py-2 rounded-xl text-sm font-semibold">حفظ</button>
            <button onClick={() => setShowForm(false)} className="bg-gray-100 text-gray-600 px-6 py-2 rounded-xl text-sm">إلغاء</button>
          </div>
        </div>
      )}

      {items.length === 0
        ? <div className="card p-12 text-center text-gray-400"><Archive className="w-14 h-14 mx-auto mb-3 opacity-30" /><p>لا توجد صور أرشيفية بعد</p></div>
        : <div className="space-y-4">
            {items.map(item => (
              <div key={item.id} className="card p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">{item.title}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                      {item.date && <span>{new Date(item.date).toLocaleDateString("ar-SA")}</span>}
                      {item.event && <span>📍 {item.event}</span>}
                      <span>{item.photos.length} صورة</span>
                    </div>
                  </div>
                  <button onClick={() => save(items.filter(x => x.id !== item.id))} className="p-2 text-red-400 hover:bg-red-50 rounded-xl"><Trash2 className="w-4 h-4" /></button>
                </div>
                <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                  {item.photos.map((ph, i) => (
                    <img key={i} src={ph.data} alt="" onClick={() => setLightbox(ph.data)}
                      className="w-full h-20 object-cover rounded-xl cursor-pointer hover:opacity-90 hover:scale-105 transition-all" />
                  ))}
                </div>
              </div>
            ))}
          </div>
      }
    </div>
  );
}

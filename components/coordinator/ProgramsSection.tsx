"use client";
import { useState, useEffect } from "react";
import { Plus, Trash2, Layers, Download, Image as Img } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface ProgramItem {
  id: string; name: string; date: string; description: string;
  certificates: Array<{ data: string; name: string }>;
  photos: Array<{ data: string; name: string }>;
  createdAt: string;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise(r => { const fr = new FileReader(); fr.onload = e => r(e.target?.result as string); fr.readAsDataURL(file); });
}

export default function ProgramsSection() {
  const { user } = useAuth();
  const key = `kc_coord_programs_${user!.id}`;
  const [programs, setPrograms] = useState<ProgramItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", date: "", description: "", certificates: [] as Array<{ data: string; name: string }>, photos: [] as Array<{ data: string; name: string }> });

  useEffect(() => { const s = localStorage.getItem(key); setPrograms(s ? JSON.parse(s) : []); }, []);
  const save = (u: ProgramItem[]) => { setPrograms(u); localStorage.setItem(key, JSON.stringify(u)); };

  const add = () => {
    if (!form.name.trim() || !form.date) return;
    save([...programs, { ...form, id: Date.now().toString(), createdAt: new Date().toISOString() }]);
    setForm({ name: "", date: "", description: "", certificates: [], photos: [] });
    setShowForm(false);
  };

  const addCerts = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const loaded = await Promise.all(files.map(async f => ({ data: await fileToBase64(f), name: f.name })));
    setForm(p => ({ ...p, certificates: [...p.certificates, ...loaded] }));
    e.target.value = "";
  };

  const addPhotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const loaded = await Promise.all(files.map(async f => ({ data: await fileToBase64(f), name: f.name })));
    setForm(p => ({ ...p, photos: [...p.photos, ...loaded] }));
    e.target.value = "";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-gray-800">البرامج ({programs.length})</h2>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-blue-800 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700"><Plus className="w-4 h-4" /> برنامج جديد</button>
      </div>

      {showForm && (
        <div className="card p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><label className="text-xs font-semibold text-gray-600 mb-1 block">اسم البرنامج *</label><input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none" /></div>
            <div><label className="text-xs font-semibold text-gray-600 mb-1 block">التاريخ *</label><input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none" /></div>
            <div className="col-span-2"><label className="text-xs font-semibold text-gray-600 mb-1 block">الوصف</label><textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none resize-none" /></div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">الشهادات ({form.certificates.length})</label>
              <label className="flex items-center gap-2 border-2 border-dashed border-gray-300 rounded-xl px-3 py-2.5 cursor-pointer hover:border-blue-400 text-sm text-gray-400">
                <Img className="w-4 h-4" /> رفع شهادات
                <input type="file" accept="image/*,.pdf" multiple className="hidden" onChange={addCerts} />
              </label>
              {form.certificates.map((c, i) => <p key={i} className="text-xs text-blue-600 mt-1 truncate">✓ {c.name}</p>)}
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">صور البرنامج ({form.photos.length})</label>
              <label className="flex items-center gap-2 border-2 border-dashed border-gray-300 rounded-xl px-3 py-2.5 cursor-pointer hover:border-blue-400 text-sm text-gray-400">
                <Img className="w-4 h-4" /> رفع صور
                <input type="file" accept="image/*" multiple className="hidden" onChange={addPhotos} />
              </label>
              {form.photos.map((p, i) => <p key={i} className="text-xs text-blue-600 mt-1 truncate">✓ {p.name}</p>)}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={add} className="bg-blue-800 text-white px-6 py-2 rounded-xl text-sm font-semibold">حفظ</button>
            <button onClick={() => setShowForm(false)} className="bg-gray-100 text-gray-600 px-6 py-2 rounded-xl text-sm">إلغاء</button>
          </div>
        </div>
      )}

      {programs.length === 0
        ? <div className="card p-12 text-center text-gray-400"><Layers className="w-14 h-14 mx-auto mb-3 opacity-30" /><p>لا توجد برامج بعد</p></div>
        : <div className="space-y-3">
            {programs.map(p => (
              <div key={p.id} className="card overflow-hidden">
                <div className="p-4 flex items-center gap-3 cursor-pointer" onClick={() => setExpanded(expanded === p.id ? null : p.id)}>
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0"><Layers className="w-5 h-5 text-blue-700" /></div>
                  <div className="flex-1"><p className="font-bold text-gray-800">{p.name}</p><p className="text-xs text-gray-400">{new Date(p.date).toLocaleDateString("ar-SA")} • {p.certificates.length} شهادة • {p.photos.length} صورة</p></div>
                  <button onClick={e => { e.stopPropagation(); save(programs.filter(x => x.id !== p.id)); }} className="p-2 text-red-400 hover:bg-red-50 rounded-xl"><Trash2 className="w-4 h-4" /></button>
                </div>
                {expanded === p.id && (
                  <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
                    {p.description && <p className="text-sm text-gray-600">{p.description}</p>}
                    {p.certificates.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-2">الشهادات</p>
                        <div className="grid grid-cols-3 gap-2">
                          {p.certificates.map((c, i) => (
                            <div key={i} className="relative group">
                              {c.data.includes("image") ? <img src={c.data} alt="" className="w-full h-20 object-cover rounded-lg" /> : <div className="w-full h-20 bg-red-50 rounded-lg flex items-center justify-center text-red-600 text-xs text-center px-2">{c.name}</div>}
                              <button onClick={() => { const a = document.createElement("a"); a.href = c.data; a.download = c.name; a.click(); }} className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center"><Download className="w-5 h-5 text-white" /></button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {p.photos.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-2">صور البرنامج</p>
                        <div className="grid grid-cols-4 gap-2">
                          {p.photos.map((ph, i) => <img key={i} src={ph.data} alt="" className="w-full h-16 object-cover rounded-lg" />)}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
      }
    </div>
  );
}

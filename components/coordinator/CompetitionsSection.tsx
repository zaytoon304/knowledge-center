"use client";
import { useState, useEffect } from "react";
import { Plus, Trash2, Trophy, Play, ExternalLink } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface CompItem {
  id: string; name: string; date: string; level: string;
  result: string; participants: string;
  videos: Array<{ url: string; title: string }>;
  photos: Array<{ data: string; name: string }>;
  createdAt: string;
}

const LEVELS = ["محلي", "إقليمي", "وطني", "عربي", "دولي"];

function fileToBase64(file: File): Promise<string> {
  return new Promise(r => { const fr = new FileReader(); fr.onload = e => r(e.target?.result as string); fr.readAsDataURL(file); });
}

export default function CompetitionsSection() {
  const { user } = useAuth();
  const key = `kc_coord_comps_${user!.id}`;
  const [items, setItems] = useState<CompItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", date: "", level: "وطني", result: "", participants: "", videos: [] as Array<{ url: string; title: string }>, photos: [] as Array<{ data: string; name: string }> });
  const [videoInput, setVideoInput] = useState({ url: "", title: "" });

  useEffect(() => { const s = localStorage.getItem(key); setItems(s ? JSON.parse(s) : []); }, []);
  const save = (u: CompItem[]) => { setItems(u); localStorage.setItem(key, JSON.stringify(u)); };

  const add = () => {
    if (!form.name.trim()) return;
    save([...items, { ...form, id: Date.now().toString(), createdAt: new Date().toISOString() }]);
    setForm({ name: "", date: "", level: "وطني", result: "", participants: "", videos: [], photos: [] });
    setShowForm(false);
  };

  const addPhotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const loaded = await Promise.all(files.map(async f => ({ data: await fileToBase64(f), name: f.name })));
    setForm(p => ({ ...p, photos: [...p.photos, ...loaded] }));
    e.target.value = "";
  };

  const addVideo = () => {
    if (!videoInput.url.trim()) return;
    setForm(p => ({ ...p, videos: [...p.videos, { ...videoInput }] }));
    setVideoInput({ url: "", title: "" });
  };

  const LEVEL_COLORS: Record<string, string> = {
    "محلي": "bg-gray-100 text-gray-600", "إقليمي": "bg-blue-100 text-blue-700",
    "وطني": "bg-green-100 text-green-700", "عربي": "bg-orange-100 text-orange-700",
    "دولي": "bg-red-100 text-red-700"
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-gray-800">المسابقات ({items.length})</h2>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-blue-800 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700"><Plus className="w-4 h-4" /> مسابقة جديدة</button>
      </div>

      {showForm && (
        <div className="card p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><label className="text-xs font-semibold text-gray-600 mb-1 block">اسم المسابقة *</label><input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none" /></div>
            <div><label className="text-xs font-semibold text-gray-600 mb-1 block">التاريخ</label><input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none" /></div>
            <div><label className="text-xs font-semibold text-gray-600 mb-1 block">المستوى</label><select value={form.level} onChange={e => setForm(p => ({ ...p, level: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none">{LEVELS.map(l => <option key={l}>{l}</option>)}</select></div>
            <div><label className="text-xs font-semibold text-gray-600 mb-1 block">النتيجة / الترتيب</label><input value={form.result} onChange={e => setForm(p => ({ ...p, result: e.target.value }))} placeholder="مثال: المركز الأول" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none" /></div>
            <div><label className="text-xs font-semibold text-gray-600 mb-1 block">الطلاب المشاركون</label><input value={form.participants} onChange={e => setForm(p => ({ ...p, participants: e.target.value }))} placeholder="أسماء الطلاب" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none" /></div>
            {/* Videos */}
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-600 mb-1 block">روابط الفيديوهات ({form.videos.length})</label>
              <div className="flex gap-2">
                <input value={videoInput.title} onChange={e => setVideoInput(p => ({ ...p, title: e.target.value }))} placeholder="عنوان الفيديو" className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 outline-none" />
                <input value={videoInput.url} onChange={e => setVideoInput(p => ({ ...p, url: e.target.value }))} placeholder="https://youtube.com/..." className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 outline-none" />
                <button onClick={addVideo} className="bg-blue-100 text-blue-700 px-3 py-2 rounded-xl text-sm font-semibold hover:bg-blue-200">+</button>
              </div>
              {form.videos.map((v, i) => <p key={i} className="text-xs text-blue-600 mt-1 truncate">🎬 {v.title || v.url}</p>)}
            </div>
            {/* Photos */}
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-600 mb-1 block">صور المسابقة ({form.photos.length})</label>
              <label className="flex items-center gap-2 border-2 border-dashed border-gray-300 rounded-xl px-3 py-2.5 cursor-pointer hover:border-blue-400 text-sm text-gray-400">
                رفع صور <input type="file" accept="image/*" multiple className="hidden" onChange={addPhotos} />
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
        ? <div className="card p-12 text-center text-gray-400"><Trophy className="w-14 h-14 mx-auto mb-3 opacity-30" /><p>لا توجد مسابقات بعد</p></div>
        : <div className="space-y-3">
            {items.map(item => (
              <div key={item.id} className="card overflow-hidden">
                <div className="p-4 flex items-center gap-3 cursor-pointer" onClick={() => setExpanded(expanded === item.id ? null : item.id)}>
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0"><Trophy className="w-5 h-5 text-amber-600" /></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-gray-800">{item.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${LEVEL_COLORS[item.level] || "bg-gray-100 text-gray-600"}`}>{item.level}</span>
                      {item.result && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">🥇 {item.result}</span>}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{item.date && new Date(item.date).toLocaleDateString("ar-SA")} • {item.videos.length} فيديو • {item.photos.length} صورة</p>
                  </div>
                  <button onClick={e => { e.stopPropagation(); save(items.filter(x => x.id !== item.id)); }} className="p-2 text-red-400 hover:bg-red-50 rounded-xl"><Trash2 className="w-4 h-4" /></button>
                </div>
                {expanded === item.id && (
                  <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
                    {item.participants && <p className="text-sm text-gray-600">👥 {item.participants}</p>}
                    {item.videos.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-gray-500">الفيديوهات</p>
                        {item.videos.map((v, i) => (
                          <a key={i} href={v.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-red-50 hover:bg-red-100 rounded-xl px-4 py-2.5 text-sm text-red-700">
                            <Play className="w-4 h-4" /> {v.title || v.url} <ExternalLink className="w-3 h-3 mr-auto" />
                          </a>
                        ))}
                      </div>
                    )}
                    {item.photos.length > 0 && (
                      <div className="grid grid-cols-4 gap-2">
                        {item.photos.map((ph, i) => <img key={i} src={ph.data} alt="" className="w-full h-16 object-cover rounded-lg" />)}
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

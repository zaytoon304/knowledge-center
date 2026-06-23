"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight, Phone, Mail, Calendar, Briefcase, Video, FileText, Plus, Trash2, Star, Image as ImageIcon, Film, X } from "lucide-react";
import type { CoordinatorProfile, ProjectItem, DailyLogEntry } from "@/contexts/AuthContext";
import { cloudGet } from "@/lib/cloud";

interface Meeting { id: string; title: string; date: string; participants: string[]; status: string; }
interface PhotoItem { id: string; title: string; date: string; data: string; description: string; }
interface VideoItem { id: string; title: string; date: string; url: string; description: string; }

function load<T>(key: string, fb: T): T {
  try { const d = localStorage.getItem(key); return d ? JSON.parse(d) : fb; } catch { return fb; }
}
function save(key: string, val: unknown) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

export default function CoordinatorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [coord, setCoord] = useState<CoordinatorProfile | null>(null);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [dailyLog, setDailyLog] = useState<DailyLogEntry[]>([]);
  const [notes, setNotes] = useState<string[]>([]);
  const [noteInput, setNoteInput] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  // أرشيف الصور
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [photoForm, setPhotoForm] = useState({ title: "", date: "", description: "", data: "" });
  const [showPhotoForm, setShowPhotoForm] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const photoRef = useRef<HTMLInputElement>(null);

  // أرشيف الفيديوهات
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [videoForm, setVideoForm] = useState({ title: "", date: "", url: "", description: "" });
  const [showVideoForm, setShowVideoForm] = useState(false);

  useEffect(() => {
    async function loadData() {
      let all = load<CoordinatorProfile[]>("kc_coordinators", []);
      let found = all.find(c => c.id === id);
      if (!found) {
        const cloudCoords = await cloudGet<CoordinatorProfile[]>("kc_coordinators");
        if (Array.isArray(cloudCoords)) {
          localStorage.setItem("kc_coordinators", JSON.stringify(cloudCoords));
          found = cloudCoords.find(c => c.id === id);
        }
      }
      if (!found) { router.push("/admin"); return; }
      setCoord(found);

      const allProjects = load<ProjectItem[]>("kc_projects", []);
      setProjects(allProjects.filter(p => (p as any).coordinator === found!.name || (p as any).coordinatorId === id));

      const allMeetings = load<Meeting[]>("kc_meetings", []);
      setMeetings(allMeetings.filter(m => m.participants?.includes(found!.name) || m.participants?.includes(found!.email)));

      setDailyLog(load<DailyLogEntry[]>("kc_daily_log", []));
      setNotes(load<string[]>("kc_cnotes_" + id, []));
      setPhotos(load<PhotoItem[]>("kc_coord_photos_" + id, []));
      setVideos(load<VideoItem[]>("kc_coord_videos_" + id, []));
    }
    loadData();
  }, [id]);

  const addNote = () => {
    const txt = noteInput.trim(); if (!txt) return;
    const updated = [...notes, `${new Date().toLocaleDateString("ar-SA")} — ${txt}`];
    save("kc_cnotes_" + id, updated);
    setNotes(updated); setNoteInput("");
  };
  const deleteNote = (i: number) => {
    const updated = notes.filter((_, idx) => idx !== i);
    save("kc_cnotes_" + id, updated); setNotes(updated);
  };

  const handlePhotoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    if (f.size > 5 * 1024 * 1024) { alert("حجم الصورة أقل من 5 ميجا"); return; }
    const r = new FileReader();
    r.onload = ev => setPhotoForm(p => ({ ...p, data: ev.target?.result as string }));
    r.readAsDataURL(f);
    e.target.value = "";
  };

  const addPhoto = () => {
    if (!photoForm.data || !photoForm.title) { alert("أضف عنواناً وصورة"); return; }
    const item: PhotoItem = { ...photoForm, id: Date.now().toString(), date: photoForm.date || new Date().toLocaleDateString("ar-SA") };
    const updated = [item, ...photos];
    save("kc_coord_photos_" + id, updated); setPhotos(updated);
    setPhotoForm({ title: "", date: "", description: "", data: "" }); setShowPhotoForm(false);
  };
  const deletePhoto = (pid: string) => {
    const updated = photos.filter(p => p.id !== pid);
    save("kc_coord_photos_" + id, updated); setPhotos(updated);
  };

  const addVideo = () => {
    if (!videoForm.url || !videoForm.title) { alert("أضف عنواناً ورابط الفيديو"); return; }
    const item: VideoItem = { ...videoForm, id: Date.now().toString(), date: videoForm.date || new Date().toLocaleDateString("ar-SA") };
    const updated = [item, ...videos];
    save("kc_coord_videos_" + id, updated); setVideos(updated);
    setVideoForm({ title: "", date: "", url: "", description: "" }); setShowVideoForm(false);
  };
  const deleteVideo = (vid: string) => {
    const updated = videos.filter(v => v.id !== vid);
    save("kc_coord_videos_" + id, updated); setVideos(updated);
  };

  const getEmbedUrl = (url: string) => {
    const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
    return url;
  };

  if (!coord) return <div className="p-8 text-center text-gray-400">جاري التحميل...</div>;

  const tabs = [
    { id: "overview",  label: "نظرة عامة",           icon: Star },
    { id: "photos",    label: `الصور (${photos.length})`,    icon: ImageIcon },
    { id: "videos",    label: `الفيديوهات (${videos.length})`, icon: Film },
    { id: "projects",  label: `المشاريع (${projects.length})`,  icon: Briefcase },
    { id: "meetings",  label: `الاجتماعات (${meetings.length})`, icon: Video },
    { id: "log",       label: `اليوميات (${dailyLog.length})`,   icon: Calendar },
    { id: "notes",     label: `ملاحظاتي (${notes.length})`,      icon: FileText },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* lightbox */}
      {lightbox && (
        <div onClick={() => setLightbox(null)} className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-pointer">
          <button className="absolute top-4 left-4 text-white"><X className="w-7 h-7" /></button>
          <img src={lightbox} className="max-w-full max-h-[90vh] rounded-2xl object-contain" alt="" />
        </div>
      )}

      <button onClick={() => router.push("/admin")} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
        <ArrowRight className="w-4 h-4" /> العودة للوحة الإدارة
      </button>

      {/* بطاقة المنسق */}
      <div className="card p-6 bg-gradient-to-l from-blue-700 to-indigo-600 text-white">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-bold flex-shrink-0">
            {coord.name[0]}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{coord.name}</h1>
            <p className="text-blue-100 mt-1">{coord.school} • {coord.subject}</p>
            <div className="flex flex-wrap gap-3 mt-3">
              {coord.phone && (
                <a href={`tel:${coord.phone}`} className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-xl text-sm transition-colors">
                  <Phone className="w-3.5 h-3.5" /> {coord.phone}
                </a>
              )}
              {coord.email && (
                <a href={`mailto:${coord.email}`} className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-xl text-sm transition-colors">
                  <Mail className="w-3.5 h-3.5" /> {coord.email}
                </a>
              )}
            </div>
          </div>
          <div className="text-right">
            <span className={`px-3 py-1 rounded-xl text-sm font-bold ${coord.status === "approved" ? "bg-green-400/20 text-green-200" : coord.status === "pending" ? "bg-yellow-400/20 text-yellow-200" : "bg-red-400/20 text-red-200"}`}>
              {coord.status === "approved" ? "✓ معتمد" : coord.status === "pending" ? "⏳ انتظار" : "✗ مرفوض"}
            </span>
            <p className="text-blue-200 text-xs mt-2">منذ {new Date(coord.registeredAt).toLocaleDateString("ar-SA")}</p>
          </div>
        </div>
      </div>

      {/* التبويبات */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === t.id ? "bg-blue-700 text-white shadow" : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"}`}>
              <Icon className="w-4 h-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {/* نظرة عامة */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "الصور",       value: photos.length,   color: "from-pink-600 to-rose-400",     icon: "🖼️" },
            { label: "الفيديوهات",  value: videos.length,   color: "from-red-600 to-orange-400",    icon: "🎬" },
            { label: "المشاريع",    value: projects.length, color: "from-blue-600 to-blue-400",     icon: "💡" },
            { label: "الملاحظات",   value: notes.length,    color: "from-amber-500 to-amber-400",   icon: "📝" },
          ].map(s => (
            <div key={s.label} className={`card p-5 bg-gradient-to-br ${s.color} text-white text-center`}>
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="text-3xl font-bold">{s.value}</div>
              <div className="text-white/80 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* أرشيف الصور */}
      {activeTab === "photos" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-800 text-lg">أرشيف الصور ({photos.length})</h2>
            <button onClick={() => setShowPhotoForm(v => !v)} className="flex items-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-pink-500">
              <Plus className="w-4 h-4" /> إضافة صورة
            </button>
          </div>

          {showPhotoForm && (
            <div className="card p-5 border-2 border-pink-200 space-y-3">
              <h3 className="font-semibold text-gray-700">صورة جديدة</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">العنوان *</label>
                  <input value={photoForm.title} onChange={e => setPhotoForm(p => ({ ...p, title: e.target.value }))}
                    placeholder="مثال: فعالية روبوتيك - الفصل الأول" className="input w-full" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">التاريخ</label>
                  <input type="date" value={photoForm.date} onChange={e => setPhotoForm(p => ({ ...p, date: e.target.value }))} className="input w-full" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">الوصف</label>
                  <input value={photoForm.description} onChange={e => setPhotoForm(p => ({ ...p, description: e.target.value }))}
                    placeholder="وصف مختصر..." className="input w-full" />
                </div>
              </div>
              <div onClick={() => photoRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-4 cursor-pointer text-center transition-colors ${photoForm.data ? "border-pink-400 bg-pink-50" : "border-gray-300 hover:border-pink-400"}`}>
                {photoForm.data
                  ? <img src={photoForm.data} className="h-32 mx-auto rounded-xl object-cover" alt="" />
                  : <><ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" /><p className="text-sm text-gray-500">اضغط لاختيار صورة</p></>
                }
              </div>
              <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoFile} />
              <div className="flex gap-2">
                <button onClick={addPhoto} className="flex-1 bg-pink-600 text-white py-2 rounded-xl font-semibold hover:bg-pink-500">حفظ</button>
                <button onClick={() => { setShowPhotoForm(false); setPhotoForm({ title: "", date: "", description: "", data: "" }); }}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50">إلغاء</button>
              </div>
            </div>
          )}

          {photos.length === 0
            ? <div className="card p-10 text-center text-gray-400"><ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>لا توجد صور في الأرشيف بعد</p></div>
            : <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {photos.map(ph => (
                  <div key={ph.id} className="card overflow-hidden group relative">
                    <img src={ph.data} onClick={() => setLightbox(ph.data)}
                      className="w-full h-44 object-cover cursor-pointer hover:opacity-90 transition-opacity" alt={ph.title} />
                    <button onClick={() => deletePhoto(ph.id)}
                      className="absolute top-2 left-2 bg-red-600 text-white rounded-lg p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="p-3">
                      <p className="font-semibold text-gray-800 text-sm">{ph.title}</p>
                      {ph.description && <p className="text-xs text-gray-500 mt-0.5">{ph.description}</p>}
                      <p className="text-xs text-gray-400 mt-1">{ph.date}</p>
                    </div>
                  </div>
                ))}
              </div>
          }
        </div>
      )}

      {/* أرشيف الفيديوهات */}
      {activeTab === "videos" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-800 text-lg">أرشيف الفيديوهات ({videos.length})</h2>
            <button onClick={() => setShowVideoForm(v => !v)} className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-500">
              <Plus className="w-4 h-4" /> إضافة فيديو
            </button>
          </div>

          {showVideoForm && (
            <div className="card p-5 border-2 border-red-200 space-y-3">
              <h3 className="font-semibold text-gray-700">فيديو جديد</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">العنوان *</label>
                  <input value={videoForm.title} onChange={e => setVideoForm(p => ({ ...p, title: e.target.value }))}
                    placeholder="مثال: عرض مشروع الروبوت" className="input w-full" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">رابط الفيديو * (YouTube أو أي رابط)</label>
                  <input value={videoForm.url} onChange={e => setVideoForm(p => ({ ...p, url: e.target.value }))}
                    placeholder="https://youtube.com/watch?v=..." className="input w-full" dir="ltr" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">التاريخ</label>
                  <input type="date" value={videoForm.date} onChange={e => setVideoForm(p => ({ ...p, date: e.target.value }))} className="input w-full" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">الوصف</label>
                  <input value={videoForm.description} onChange={e => setVideoForm(p => ({ ...p, description: e.target.value }))}
                    placeholder="وصف مختصر..." className="input w-full" />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={addVideo} className="flex-1 bg-red-600 text-white py-2 rounded-xl font-semibold hover:bg-red-500">حفظ</button>
                <button onClick={() => { setShowVideoForm(false); setVideoForm({ title: "", date: "", url: "", description: "" }); }}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50">إلغاء</button>
              </div>
            </div>
          )}

          {videos.length === 0
            ? <div className="card p-10 text-center text-gray-400"><Film className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>لا توجد فيديوهات في الأرشيف بعد</p></div>
            : <div className="space-y-4">
                {videos.map(v => (
                  <div key={v.id} className="card overflow-hidden">
                    <div className="relative">
                      <iframe src={getEmbedUrl(v.url)} className="w-full h-52" allowFullScreen
                        title={v.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
                    </div>
                    <div className="p-4 flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-800">{v.title}</p>
                        {v.description && <p className="text-sm text-gray-500 mt-0.5">{v.description}</p>}
                        <p className="text-xs text-gray-400 mt-1">{v.date}</p>
                      </div>
                      <button onClick={() => deleteVideo(v.id)} className="text-red-400 hover:text-red-600 p-1 flex-shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
          }
        </div>
      )}

      {/* المشاريع */}
      {activeTab === "projects" && (
        <div className="space-y-3">
          {projects.length === 0
            ? <div className="card p-10 text-center text-gray-400"><Briefcase className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>لا توجد مشاريع مرتبطة بهذا المنسق</p></div>
            : projects.map(p => (
              <div key={p.id} className="card p-4">
                <div className="flex items-start gap-3">
                  {p.image
                    ? <img src={p.image} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" alt="" />
                    : <div className="w-16 h-16 rounded-xl bg-blue-100 flex items-center justify-center text-2xl flex-shrink-0">{p.emoji || "💡"}</div>
                  }
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">{p.title}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{p.description}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-lg">{p.field}</span>
                      <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-lg">{p.level}</span>
                      {(p as any).students && <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-lg">👥 {(p as any).students}</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      )}

      {/* الاجتماعات */}
      {activeTab === "meetings" && (
        <div className="space-y-3">
          {meetings.length === 0
            ? <div className="card p-10 text-center text-gray-400"><Video className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>لم يشارك في أي اجتماع مسجّل</p></div>
            : meetings.map(m => (
              <div key={m.id} className="card p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center"><Video className="w-5 h-5 text-purple-600" /></div>
                <div className="flex-1">
                  <p className="font-bold text-gray-800">{m.title}</p>
                  <p className="text-sm text-gray-500">{m.date}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-lg font-medium ${m.status === "completed" ? "bg-green-100 text-green-700" : m.status === "active" ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700"}`}>
                  {m.status === "completed" ? "مكتمل" : m.status === "active" ? "نشط" : "قادم"}
                </span>
              </div>
            ))
          }
        </div>
      )}

      {/* اليوميات */}
      {activeTab === "log" && (
        <div className="space-y-3">
          {dailyLog.length === 0
            ? <div className="card p-10 text-center text-gray-400"><Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>لا توجد يوميات</p></div>
            : dailyLog.map(e => (
              <div key={e.id} className="card p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0"><Calendar className="w-5 h-5 text-emerald-600" /></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-gray-800">{e.title}</p>
                      <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-lg">{e.category}</span>
                    </div>
                    <p className="text-sm text-gray-500">{e.description}</p>
                    <p className="text-xs text-gray-400 mt-1">{e.date}</p>
                    {e.images && e.images.length > 0 && (
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {e.images.map((img, i) => (
                          <img key={i} src={img.data} className="w-16 h-16 rounded-lg object-cover cursor-pointer" onClick={() => setLightbox(img.data)} alt={img.name} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      )}

      {/* ملاحظاتي */}
      {activeTab === "notes" && (
        <div className="space-y-3">
          <div className="card p-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">إضافة ملاحظة جديدة</p>
            <div className="flex gap-2">
              <input value={noteInput} onChange={e => setNoteInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addNote()}
                placeholder="اكتب ملاحظتك هنا..." className="input flex-1" />
              <button onClick={addNote} className="bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-500 flex items-center gap-1">
                <Plus className="w-4 h-4" /> إضافة
              </button>
            </div>
          </div>
          {notes.length === 0
            ? <div className="card p-10 text-center text-gray-400"><FileText className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>لا توجد ملاحظات بعد</p></div>
            : notes.map((n, i) => (
              <div key={i} className="card p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0 text-sm">📝</div>
                <p className="flex-1 text-sm text-gray-700">{n}</p>
                <button onClick={() => deleteNote(i)} className="text-red-400 hover:text-red-600 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
}

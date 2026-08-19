"use client";
import { useState, useEffect } from "react";
import { Archive, Video, Link2, X, Calendar, MapPin, User } from "lucide-react";
import { cloudGet } from "@/lib/cloud";

interface ArchiveItem {
  id: string; title: string; date: string; event: string; year: string;
  photos: Array<{ data: string; name: string }>;
  videos: Array<{ url: string; title: string }>;
  createdAt: string;
}

interface CoordinatorProfile { id: string; name: string; status: string }

interface AlbumWithOwner extends ArchiveItem {
  coordinatorName: string;
}

const CURRENT_YEAR = new Date().getFullYear().toString();

export default function GalleryPage() {
  const [albums, setAlbums] = useState<AlbumWithOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [yearFilter, setYearFilter] = useState("");
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const coords = await cloudGet<CoordinatorProfile[]>("kc_coordinators");
      const approved = (Array.isArray(coords) ? coords : []).filter(c => c.status === "approved");
      const lists = await Promise.all(approved.map(async c => {
        const items = await cloudGet<ArchiveItem[]>(`kc_coord_archive_${c.id}`);
        return (Array.isArray(items) ? items : []).map(i => ({ ...i, coordinatorName: c.name }));
      }));
      if (cancelled) return;
      const all = lists.flat().sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
      setAlbums(all);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const YEARS = Array.from(new Set(albums.map(a => a.year || CURRENT_YEAR))).sort((a, b) => b.localeCompare(a));
  const filtered = albums.filter(a => !yearFilter || a.year === yearFilter);
  const totalPhotos = albums.reduce((s, a) => s + (a.photos?.length || 0), 0);
  const totalVideos = albums.reduce((s, a) => s + (a.videos?.length || 0), 0);

  return (
    <div className="space-y-5 animate-fade-in">
      {lightbox && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button className="absolute top-4 left-4 text-white" onClick={() => setLightbox(null)}><X className="w-8 h-8" /></button>
          <img src={lightbox} alt="" className="max-w-full max-h-full rounded-xl object-contain" onClick={e => e.stopPropagation()} />
        </div>
      )}

      {/* Header */}
      <div className="card p-6 bg-gradient-to-l from-blue-900 to-indigo-800 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <Archive className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">أرشيف المركز</h1>
            <p className="text-white font-semibold text-base">صور وفيديوهات فعاليات وبرامج مركز المعرفة والابتكار عبر السنوات</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4">
          {[
            { n: albums.length, l: "ألبوم", emoji: "📁" },
            { n: totalPhotos, l: "صورة", emoji: "🖼️" },
            { n: totalVideos, l: "فيديو", emoji: "🎬" },
          ].map(s => (
            <div key={s.l} className="bg-black/15 rounded-xl p-2 text-center">
              <div className="text-lg">{s.emoji}</div>
              <div className="text-xl font-bold">{s.n}</div>
              <div className="text-blue-200 text-[10px]">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* فلتر السنوات */}
      {YEARS.length > 1 && (
        <div className="card p-3 flex flex-wrap gap-2">
          <button onClick={() => setYearFilter("")}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${!yearFilter ? "bg-blue-800 text-white" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}>
            كل السنوات
          </button>
          {YEARS.map(y => (
            <button key={y} onClick={() => setYearFilter(y)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${yearFilter === y ? "bg-blue-800 text-white" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}>
              📅 {y}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="card p-16 text-center text-gray-400">
          <Archive className="w-12 h-12 mx-auto mb-3 opacity-30 animate-pulse" />
          <p>جارٍ تحميل الأرشيف...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-16 text-center text-gray-400">
          <Archive className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="font-bold text-lg mb-1">لا يوجد أرشيف بعد</p>
          <p className="text-sm">سيُضاف هنا كل ما يرفعه منسّقو المركز من صور وفيديوهات الفعاليات</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(item => (
            <div key={item.id} className="card p-5">
              <div className="flex items-start justify-between mb-3 gap-3">
                <div>
                  <p className="font-bold text-gray-800 text-lg">{item.title}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mt-1 flex-wrap">
                    <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {item.coordinatorName}</span>
                    {item.date && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(item.date).toLocaleDateString("ar-SA")}</span>}
                    {item.event && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {item.event}</span>}
                  </div>
                </div>
                {item.year && <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-full flex-shrink-0">📅 {item.year}</span>}
              </div>

              {item.videos?.length > 0 && (
                <div className="space-y-1.5 mb-3">
                  {item.videos.map((v, i) => (
                    <a key={i} href={v.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5 text-sm text-blue-700 hover:bg-blue-100 transition-colors">
                      <Video className="w-4 h-4 flex-shrink-0" /> <span className="flex-1 font-medium">{v.title}</span> <Link2 className="w-3.5 h-3.5 flex-shrink-0" />
                    </a>
                  ))}
                </div>
              )}

              {item.photos?.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {item.photos.map((ph, i) => (
                    <img key={i} src={ph.data} alt="" onClick={() => setLightbox(ph.data)}
                      className="w-full h-24 object-cover rounded-xl cursor-pointer hover:opacity-90 hover:scale-105 transition-all" />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

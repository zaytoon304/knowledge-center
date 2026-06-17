"use client";
import { useState, useEffect } from "react";
import { CalendarDays, Play, ExternalLink } from "lucide-react";
import { DailyLogEntry } from "@/contexts/AuthContext";

function load<T>(key: string, fallback: T): T {
  try { const d = localStorage.getItem(key); return d ? JSON.parse(d) : fallback; } catch { return fallback; }
}

const CAT_COLORS: Record<string, string> = {
  نشاط: "bg-blue-100 text-blue-700 border-blue-200",
  مسابقة: "bg-yellow-100 text-yellow-700 border-yellow-200",
  زيارة: "bg-teal-100 text-teal-700 border-teal-200",
  إنجاز: "bg-green-100 text-green-700 border-green-200",
  تدريب: "bg-purple-100 text-purple-700 border-purple-200",
  "ورشة عمل": "bg-orange-100 text-orange-700 border-orange-200",
  أخرى: "bg-gray-100 text-gray-600 border-gray-200",
};

const ALL_CATS = ["الكل", "نشاط", "مسابقة", "زيارة", "إنجاز", "تدريب", "ورشة عمل", "أخرى"];

export default function DailyLogPage() {
  const [entries, setEntries] = useState<DailyLogEntry[]>([]);
  const [filter, setFilter] = useState("الكل");
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    setEntries(load<DailyLogEntry[]>("kc_daily_log", []));
  }, []);

  const filtered = filter === "الكل"
    ? [...entries].reverse()
    : [...entries].reverse().filter(e => e.category === filter);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="card p-6 bg-gradient-to-l from-indigo-800 to-blue-700 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
            <CalendarDays className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">يوميات مركز الابتكار</h1>
            <p className="text-blue-200 text-sm">أنشطتنا وفعالياتنا وإنجازاتنا</p>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {ALL_CATS.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${filter === cat ? "bg-indigo-700 text-white border-indigo-700 shadow" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Entries */}
      {filtered.length === 0 ? (
        <div className="card p-14 text-center text-gray-400">
          <CalendarDays className="w-14 h-14 mx-auto mb-3 opacity-30" />
          <p>لا توجد تسجيلات بعد</p>
        </div>
      ) : (
        <div className="space-y-5">
          {filtered.map(entry => (
            <div key={entry.id} className="card overflow-hidden">
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">{entry.title}</h2>
                    <div className="flex gap-2 mt-1.5 flex-wrap">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${CAT_COLORS[entry.category] || CAT_COLORS["أخرى"]}`}>
                        {entry.category}
                      </span>
                      {entry.date && (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          📅 {new Date(entry.date).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {entry.description && (
                  <p className="text-gray-600 text-sm leading-relaxed mb-4 whitespace-pre-wrap">{entry.description}</p>
                )}

                {/* صور */}
                {entry.images.length > 0 && (
                  <div className={`grid gap-2 mb-4 ${entry.images.length === 1 ? "grid-cols-1" : entry.images.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
                    {entry.images.map((img, i) => (
                      <img key={i} src={img.data} alt="" onClick={() => setLightbox(img.data)}
                        className="w-full rounded-xl object-cover cursor-pointer hover:opacity-90 transition-opacity"
                        style={{ maxHeight: entry.images.length === 1 ? "300px" : "160px" }} />
                    ))}
                  </div>
                )}

                {/* فيديوهات */}
                {entry.videoLinks.length > 0 && (
                  <div className="space-y-2">
                    {entry.videoLinks.map((link, i) => (
                      <a key={i} href={link} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-red-100">
                        <Play className="w-4 h-4" /> مشاهدة الفيديو <ExternalLink className="w-3.5 h-3.5 mr-auto" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="" className="max-w-full max-h-[90vh] rounded-2xl object-contain" />
        </div>
      )}
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
import { Trophy, Calendar, Search, Globe, MapPin, ChevronLeft, ExternalLink } from "lucide-react";

interface Competition {
  id: string; title: string; description: string; type: string;
  subject: string; date: string; status: string;
  registrationLink?: string; tags?: string[]; image?: string;
}

function load(): Competition[] {
  try { const d = localStorage.getItem("kc_competitions"); return d ? JSON.parse(d) : []; } catch { return []; }
}

const statusColor = (s: string) =>
  s === "مفتوح" ? "bg-green-100 text-green-700" :
  s === "قادم" ? "bg-yellow-100 text-yellow-700" :
  "bg-gray-100 text-gray-500";

const typeColor = (t: string) =>
  t === "دولية" ? "bg-blue-100 text-blue-700" :
  t === "وطنية" ? "bg-purple-100 text-purple-700" :
  t === "محلية" ? "bg-green-100 text-green-700" :
  "bg-gray-100 text-gray-500";

export default function CompetitionsPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("الكل");

  useEffect(() => { setCompetitions(load()); }, []);

  const types = ["الكل", ...Array.from(new Set(competitions.map(c => c.type).filter(Boolean)))];

  const filtered = competitions.filter(c => {
    const matchSearch = !search || c.title.includes(search) || c.description?.includes(search);
    const matchFilter = filter === "الكل" || c.type === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="card p-6 bg-gradient-to-l from-yellow-700 to-amber-500 text-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <Trophy className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">المسابقات والجوائز</h1>
            <p className="text-yellow-100 text-sm">المسابقات المحلية والوطنية والدولية</p>
          </div>
        </div>
        <div className="flex gap-3">
          {[
            { n: competitions.filter(c => c.status === "مفتوح").length, l: "مفتوح للتسجيل" },
            { n: competitions.filter(c => c.status === "قادم").length, l: "قادم" },
            { n: competitions.length, l: "إجمالي" },
          ].map(s => (
            <div key={s.l} className="bg-white/10 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-white">{s.n}</div>
              <div className="text-yellow-100 text-xs mt-0.5">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2">
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="ابحث في المسابقات..."
            className="bg-transparent outline-none text-sm flex-1 text-right" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {types.map(t => (
            <button key={t} onClick={() => setFilter(t)}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${filter === t ? "bg-yellow-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium text-gray-500">{search ? "لا نتائج مطابقة" : "لا توجد مسابقات بعد"}</p>
          {!search && <p className="text-sm mt-1">يمكن للأدمن إضافة المسابقات من لوحة الإدارة ← المسابقات</p>}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map(comp => (
            <div key={comp.id} className="card overflow-hidden hover:shadow-md transition-shadow">
              {comp.image && <img src={comp.image} alt={comp.title} className="w-full h-40 object-cover" />}
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="font-bold text-gray-800 text-sm leading-tight">{comp.title}</h3>
                  <div className="flex flex-col gap-1">
                    {comp.status && <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(comp.status)}`}>{comp.status}</span>}
                    {comp.type && <span className={`text-xs px-2 py-0.5 rounded-full ${typeColor(comp.type)}`}>{comp.type}</span>}
                  </div>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed mb-3">{comp.description}</p>
                <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-4">
                  {comp.date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {comp.date}</span>}
                  {comp.subject && <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {comp.subject}</span>}
                </div>
                {comp.tags && comp.tags.length > 0 && (
                  <div className="flex gap-1 flex-wrap mb-3">
                    {comp.tags.map((t, i) => <span key={i} className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">{t}</span>)}
                  </div>
                )}
                {comp.registrationLink && (
                  <a href={comp.registrationLink} target="_blank" rel="noopener noreferrer"
                    className="w-full py-2.5 rounded-xl text-white text-sm font-medium bg-yellow-600 hover:bg-yellow-500 flex items-center justify-center gap-2 transition-colors">
                    <ExternalLink className="w-4 h-4" /> سجّل الآن
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

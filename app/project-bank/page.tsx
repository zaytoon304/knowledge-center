"use client";
import { useState, useEffect } from "react";
import { Archive, Search, Clock, Wrench, ChevronLeft } from "lucide-react";

interface BankProject {
  id: string; title: string; description: string; category: string;
  difficulty: string; duration: string; materials: string;
  status: string; image?: string;
}

function load(): BankProject[] {
  try { const d = localStorage.getItem("kc_project_bank"); return d ? JSON.parse(d) : []; } catch { return []; }
}

const diffColor = (d: string) =>
  d === "سهل" ? "bg-green-100 text-green-700" :
  d === "متوسط" ? "bg-yellow-100 text-yellow-700" :
  d === "صعب" ? "bg-orange-100 text-orange-700" :
  "bg-red-100 text-red-700";

const catEmoji: Record<string, string> = {
  "روبوت": "🤖", "ذكاء اصطناعي": "🧠", "إلكترونيات": "⚡",
  "IoT": "📡", "برمجة": "💻", "بيئة": "🌱", "ابتكار": "💡", "أخرى": "🔬",
};

export default function ProjectBankPage() {
  const [projects, setProjects] = useState<BankProject[]>([]);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("الكل");
  const [diffFilter, setDiffFilter] = useState("الكل");

  useEffect(() => { setProjects(load()); }, []);

  const categories = ["الكل", ...Array.from(new Set(projects.map(p => p.category).filter(Boolean)))];
  const difficulties = ["الكل", "سهل", "متوسط", "صعب", "متقدم"];

  const filtered = projects.filter(p => {
    const matchS = !search || p.title.includes(search) || p.description?.includes(search);
    const matchC = catFilter === "الكل" || p.category === catFilter;
    const matchD = diffFilter === "الكل" || p.difficulty === diffFilter;
    return matchS && matchC && matchD;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="card p-6 bg-gradient-to-l from-slate-700 to-gray-600 text-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <Archive className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">بنك المشاريع</h1>
            <p className="text-gray-300 text-sm">أفكار مشاريع جاهزة ومصنّفة</p>
          </div>
        </div>
        <div className="flex gap-3 flex-wrap">
          {categories.filter(c => c !== "الكل").map(c => (
            <div key={c} className="bg-white/10 rounded-xl px-3 py-2 text-center">
              <span className="text-sm">{catEmoji[c] || "📁"} {c}</span>
              <span className="text-white/60 text-xs mr-1">({projects.filter(p => p.category === c).length})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 space-y-3">
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5">
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="ابحث في بنك المشاريع..."
            className="bg-transparent outline-none text-sm flex-1 text-right" />
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-gray-500 self-center">التصنيف:</span>
          {categories.map(c => (
            <button key={c} onClick={() => setCatFilter(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${catFilter === c ? "bg-slate-700 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {c !== "الكل" ? (catEmoji[c] || "") + " " : ""}{c}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-gray-500 self-center">الصعوبة:</span>
          {difficulties.map(d => (
            <button key={d} onClick={() => setDiffFilter(d)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${diffFilter === d ? "bg-slate-700 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Projects */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Archive className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium text-gray-500">{search ? "لا نتائج مطابقة" : "لا توجد مشاريع بعد"}</p>
          {!search && <p className="text-sm mt-1">يمكن للأدمن إضافة مشاريع من لوحة الإدارة ← بنك المشاريع</p>}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(project => (
            <div key={project.id} className="card overflow-hidden hover:shadow-md transition-shadow">
              {project.image ? (
                <img src={project.image} alt={project.title} className="w-full h-36 object-cover" />
              ) : (
                <div className="w-full h-36 bg-gradient-to-br from-slate-700 to-gray-500 flex items-center justify-center text-5xl">
                  {catEmoji[project.category] || "💡"}
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-gray-800 text-sm">{project.title}</h3>
                  {project.difficulty && (
                    <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${diffColor(project.difficulty)}`}>{project.difficulty}</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 leading-relaxed mb-3">{project.description}</p>
                <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-3">
                  {project.duration && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {project.duration}</span>}
                  {project.category && <span className="flex items-center gap-1"><Wrench className="w-3 h-3" /> {project.category}</span>}
                </div>
                {project.materials && (
                  <div className="bg-gray-50 rounded-xl p-3 mb-3">
                    <p className="text-xs font-semibold text-gray-500 mb-1">المكونات:</p>
                    <p className="text-xs text-gray-600 leading-relaxed">{project.materials}</p>
                  </div>
                )}
                <button className="w-full py-2 rounded-xl text-white text-sm font-medium bg-slate-700 hover:bg-slate-600 flex items-center justify-center gap-2 transition-colors">
                  عرض التفاصيل <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

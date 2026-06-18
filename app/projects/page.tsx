"use client";
import { useState, useEffect } from "react";
import { FolderOpen, Search, Trophy, Users, School, ChevronRight, Code, Package, Cpu } from "lucide-react";

interface Project {
  id: string; title: string; description: string; field: string; level: string; emoji: string;
  image: string; students: string; division: string; components: string; code: string;
}

const FIELD_COLORS: Record<string, string> = {
  "الذكاء الاصطناعي": "bg-indigo-100 text-indigo-700 border-indigo-200",
  "إنترنت الأشياء": "bg-cyan-100 text-cyan-700 border-cyan-200",
  "الروبوت": "bg-sky-100 text-sky-700 border-sky-200",
  "STEAM": "bg-green-100 text-green-700 border-green-200",
  "برمجة": "bg-violet-100 text-violet-700 border-violet-200",
  "إلكترونيات": "bg-orange-100 text-orange-700 border-orange-200",
  "بيئة": "bg-emerald-100 text-emerald-700 border-emerald-200",
  "ابتكار": "bg-pink-100 text-pink-700 border-pink-200",
};

const LEVEL_COLORS: Record<string, string> = {
  "ابتدائي": "bg-green-100 text-green-700",
  "متوسط": "bg-blue-100 text-blue-700",
  "ثانوي": "bg-purple-100 text-purple-700",
  "متقدم": "bg-red-100 text-red-700",
};

function loadProjects(): Project[] {
  try {
    const d = localStorage.getItem("kc_projects");
    return d ? JSON.parse(d) : [];
  } catch { return []; }
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [fieldFilter, setFieldFilter] = useState("الكل");
  const [levelFilter, setLevelFilter] = useState("الكل");
  const [selected, setSelected] = useState<Project | null>(null);

  useEffect(() => { setProjects(loadProjects()); }, []);

  const fields = ["الكل", ...Array.from(new Set(projects.map(p => p.field).filter(Boolean)))];
  const levels = ["الكل", ...Array.from(new Set(projects.map(p => p.level).filter(Boolean)))];

  const filtered = projects.filter(p => {
    const matchSearch = !search || p.title?.includes(search) || p.students?.includes(search) || p.description?.includes(search);
    const matchField = fieldFilter === "الكل" || p.field === fieldFilter;
    const matchLevel = levelFilter === "الكل" || p.level === levelFilter;
    return matchSearch && matchField && matchLevel;
  });

  if (selected) {
    return (
      <div className="max-w-3xl mx-auto space-y-5 animate-fade-in">
        <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium">
          <ChevronRight className="w-4 h-4" /> العودة للمشاريع
        </button>

        <div className="card p-6">
          <div className="flex items-start gap-4 mb-6">
            {selected.image
              ? <img src={selected.image} alt={selected.title} className="w-24 h-24 rounded-2xl object-cover border border-gray-100 flex-shrink-0" />
              : <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-800 to-indigo-700 flex items-center justify-center text-4xl flex-shrink-0">{selected.emoji || "💡"}</div>
            }
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">{selected.title}</h1>
              <div className="flex flex-wrap gap-2">
                {selected.field && <span className={`px-3 py-1 rounded-xl text-xs font-semibold border ${FIELD_COLORS[selected.field] ?? "bg-gray-100 text-gray-600"}`}>{selected.field}</span>}
                {selected.level && <span className={`px-3 py-1 rounded-xl text-xs font-semibold ${LEVEL_COLORS[selected.level] ?? "bg-gray-100 text-gray-600"}`}>{selected.level}</span>}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {selected.description && (
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-bold text-gray-700 mb-2 text-sm flex items-center gap-2"><FolderOpen className="w-4 h-4" /> وصف المشروع</h3>
                <p className="text-gray-700 text-sm leading-relaxed">{selected.description}</p>
              </div>
            )}

            {selected.students && (
              <div className="bg-blue-50 rounded-xl p-4">
                <h3 className="font-bold text-gray-700 mb-2 text-sm flex items-center gap-2"><Users className="w-4 h-4 text-blue-600" /> الطلاب المشاركون</h3>
                <p className="text-gray-700 text-sm">{selected.students}</p>
              </div>
            )}

            {selected.division && (
              <div className="bg-indigo-50 rounded-xl p-4">
                <h3 className="font-bold text-gray-700 mb-2 text-sm flex items-center gap-2"><School className="w-4 h-4 text-indigo-600" /> الشعبة / الفصل</h3>
                <p className="text-gray-700 text-sm">{selected.division}</p>
              </div>
            )}

            {selected.components && (
              <div className="bg-orange-50 rounded-xl p-4">
                <h3 className="font-bold text-gray-700 mb-2 text-sm flex items-center gap-2"><Package className="w-4 h-4 text-orange-600" /> المكونات والأدوات</h3>
                <p className="text-gray-700 text-sm leading-relaxed">{selected.components}</p>
              </div>
            )}

            {selected.code && (
              <div className="bg-gray-900 rounded-xl p-4">
                <h3 className="font-bold text-gray-300 mb-2 text-sm flex items-center gap-2"><Code className="w-4 h-4 text-green-400" /> الكود البرمجي</h3>
                <pre className="text-green-400 text-xs overflow-x-auto leading-relaxed whitespace-pre-wrap">{selected.code}</pre>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="card p-6 bg-gradient-to-l from-indigo-800 to-blue-700 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <FolderOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">مركز المشاريع</h1>
            <p className="text-blue-200 text-sm">مشاريع الطلاب والابتكارات</p>
          </div>
          <div className="mr-auto text-right">
            <div className="text-3xl font-bold">{projects.length}</div>
            <div className="text-blue-200 text-xs">مشروع مسجّل</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 space-y-3">
        <div className="relative">
          <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="ابحث بالاسم أو الطالب..."
            className="w-full border border-gray-200 rounded-xl pr-10 pl-4 py-2.5 text-sm outline-none focus:border-blue-400 bg-gray-50" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {fields.map(f => (
            <button key={f} onClick={() => setFieldFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${fieldFilter === f ? "bg-blue-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {f}
            </button>
          ))}
        </div>
        {levels.length > 1 && (
          <div className="flex gap-2 flex-wrap">
            {levels.map(l => (
              <button key={l} onClick={() => setLevelFilter(l)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${levelFilter === l ? "bg-indigo-700 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                {l}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Projects Grid */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">
          <FolderOpen className="w-14 h-14 mx-auto mb-4 opacity-20" />
          <p className="font-semibold">{projects.length === 0 ? "لا توجد مشاريع بعد" : "لا توجد نتائج مطابقة"}</p>
          {projects.length === 0 && <p className="text-sm mt-1 text-gray-300">أضف مشاريع من لوحة الإدارة ← المشاريع</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => (
            <div key={p.id} onClick={() => setSelected(p)}
              className="card p-5 cursor-pointer hover:shadow-lg transition-all group hover:border-blue-200 border border-transparent">
              <div className="flex items-start gap-3 mb-3">
                {p.image
                  ? <img src={p.image} alt={p.title} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                  : <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-600 flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-105 transition-transform">{p.emoji || "💡"}</div>
                }
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 text-sm leading-tight mb-1 line-clamp-2">{p.title}</h3>
                  <div className="flex flex-wrap gap-1">
                    {p.field && <span className={`text-xs px-2 py-0.5 rounded-lg border ${FIELD_COLORS[p.field] ?? "bg-gray-100 text-gray-600"}`}>{p.field}</span>}
                    {p.level && <span className={`text-xs px-2 py-0.5 rounded-lg ${LEVEL_COLORS[p.level] ?? "bg-gray-100 text-gray-600"}`}>{p.level}</span>}
                  </div>
                </div>
              </div>
              {p.description && <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-3">{p.description}</p>}
              {p.students && (
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Users className="w-3.5 h-3.5" />
                  <span className="truncate">{p.students}</span>
                </div>
              )}
              <div className="mt-3 flex items-center justify-end">
                <span className="text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity font-medium flex items-center gap-1">
                  عرض التفاصيل <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

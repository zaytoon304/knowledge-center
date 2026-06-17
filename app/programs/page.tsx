"use client";
import { useState, useEffect } from "react";
import { Layers, Search, ChevronLeft, Users, Target, Clock } from "lucide-react";

interface Program {
  id: string; title: string; description: string; emoji: string;
  gradient: string; targetAudience: string; duration: string;
  status: string; image?: string;
}

function load(): Program[] {
  try { const d = localStorage.getItem("kc_programs"); return d ? JSON.parse(d) : []; } catch { return []; }
}

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => { setPrograms(load()); }, []);

  const filtered = programs.filter(p =>
    !search || p.title.includes(search) || p.description?.includes(search)
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="card p-6 bg-gradient-to-l from-purple-800 to-violet-600 text-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <Layers className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">مركز البرامج</h1>
            <p className="text-purple-200 text-sm">برامج الموهبة والابتكار وSTEAM</p>
          </div>
        </div>
        <div className="bg-white/10 rounded-xl p-3 text-center w-32">
          <div className="text-2xl font-bold text-yellow-300">{programs.length}</div>
          <div className="text-purple-100 text-sm">برنامج نشط</div>
        </div>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5">
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="ابحث في البرامج..."
            className="bg-transparent outline-none text-sm flex-1 text-right" />
        </div>
      </div>

      {/* Programs */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Layers className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium text-gray-500">{search ? "لا نتائج مطابقة" : "لا توجد برامج بعد"}</p>
          {!search && <p className="text-sm mt-1">يمكن للأدمن إضافة البرامج من لوحة الإدارة ← البرامج</p>}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(program => (
            <div key={program.id} className="card overflow-hidden group cursor-pointer hover:shadow-lg transition-all">
              {program.image ? (
                <img src={program.image} alt={program.title} className="w-full h-36 object-cover" />
              ) : (
                <div className={`w-full h-36 bg-gradient-to-br ${program.gradient || "from-purple-700 to-violet-500"} flex items-center justify-center`}>
                  <span className="text-5xl">{program.emoji || "🎯"}</span>
                </div>
              )}
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-gray-800 text-sm leading-tight">{program.title}</h3>
                  {program.status && (
                    <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                      program.status === "نشط" ? "bg-green-100 text-green-700" :
                      program.status === "قادم" ? "bg-yellow-100 text-yellow-700" :
                      "bg-gray-100 text-gray-500"
                    }`}>{program.status}</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 leading-relaxed mb-3">{program.description}</p>
                <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-4">
                  {program.targetAudience && (
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {program.targetAudience}</span>
                  )}
                  {program.duration && (
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {program.duration}</span>
                  )}
                </div>
                <button className={`w-full py-2 rounded-xl text-white text-sm font-medium bg-gradient-to-l ${program.gradient || "from-purple-700 to-violet-500"} flex items-center justify-center gap-2 group-hover:opacity-90 transition-opacity`}>
                  <span>التفاصيل والتسجيل</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

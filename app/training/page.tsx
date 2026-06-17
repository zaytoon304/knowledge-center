"use client";
import { useState, useEffect } from "react";
import { GraduationCap, Clock, Users, ExternalLink, Search, Filter } from "lucide-react";

interface Course {
  id: string; title: string; description: string;
  type: "free" | "paid"; link: string; emoji: string; createdAt: string;
}

function load(): Course[] {
  try { const d = localStorage.getItem("kc_courses"); return d ? JSON.parse(d) : []; } catch { return []; }
}

export default function TrainingPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "free" | "paid">("all");

  useEffect(() => { setCourses(load()); }, []);

  const filtered = courses.filter(c => {
    const matchS = !search || c.title.includes(search) || c.description?.includes(search);
    const matchF = filter === "all" || c.type === filter;
    return matchS && matchF;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="card p-6 bg-gradient-to-l from-green-800 to-teal-600 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">مركز التدريب</h1>
            <p className="text-green-100 text-sm">الدورات والشهادات التدريبية</p>
          </div>
        </div>
        <div className="flex gap-3">
          {[
            { n: courses.length, l: "دورة" },
            { n: courses.filter(c => c.type === "free").length, l: "مجانية" },
            { n: courses.filter(c => c.type === "paid").length, l: "مدفوعة" },
          ].map(s => (
            <div key={s.l} className="bg-white/10 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-yellow-300">{s.n}</div>
              <div className="text-green-100 text-xs mt-0.5">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2">
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="ابحث في الدورات..."
            className="bg-transparent outline-none text-sm flex-1 text-right" />
        </div>
        <div className="flex gap-2">
          {[{ v: "all", l: "الكل" }, { v: "free", l: "مجانية" }, { v: "paid", l: "مدفوعة" }].map(f => (
            <button key={f.v} onClick={() => setFilter(f.v as "all" | "free" | "paid")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filter === f.v ? "bg-green-700 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {f.l}
            </button>
          ))}
        </div>
      </div>

      {/* Courses */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium text-gray-500">{search ? "لا نتائج مطابقة" : "لا توجد دورات بعد"}</p>
          {!search && <p className="text-sm mt-1">يمكن للأدمن إضافة الدورات من لوحة الإدارة ← الدورات</p>}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(course => (
            <div key={course.id} className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
                  {course.emoji || "📚"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-gray-800 text-sm leading-tight">{course.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${course.type === "free" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                      {course.type === "free" ? "مجاني" : "مدفوع"}
                    </span>
                  </div>
                  {course.createdAt && <p className="text-xs text-gray-400 mt-0.5">{course.createdAt}</p>}
                </div>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">{course.description}</p>
              {course.link && (
                <a href={course.link} target="_blank" rel="noopener noreferrer"
                  className="w-full py-2.5 rounded-xl text-white text-sm font-medium bg-green-700 hover:bg-green-600 flex items-center justify-center gap-2 transition-colors">
                  <ExternalLink className="w-4 h-4" />
                  {course.type === "free" ? "ابدأ الدورة مجاناً" : "التسجيل في الدورة"}
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

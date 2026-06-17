"use client";
import { useState } from "react";
import { FolderOpen, Search, Filter, Eye, Plus, Trophy, Users, School } from "lucide-react";
import { projects } from "@/data/projects";
import Badge from "@/components/ui/Badge";

const fieldColors: Record<string, string> = {
  "الذكاء الاصطناعي": "bg-indigo-100 text-indigo-700",
  "إنترنت الأشياء": "bg-cyan-100 text-cyan-700",
  "الروبوت": "bg-sky-100 text-sky-700",
  "STEAM": "bg-green-100 text-green-700",
};

export default function ProjectsPage() {
  const [search, setSearch] = useState("");
  const [fieldFilter, setFieldFilter] = useState("الكل");
  const [statusFilter, setStatusFilter] = useState("الكل");
  const [levelFilter, setLevelFilter] = useState("الكل");
  const [selected, setSelected] = useState<number | null>(null);

  const filtered = projects.filter(p => {
    const matchSearch = !search || p.name.includes(search) || p.students.some(s => s.includes(search));
    const matchField = fieldFilter === "الكل" || p.field === fieldFilter;
    const matchStatus = statusFilter === "الكل" || p.status === statusFilter;
    const matchLevel = levelFilter === "الكل" || p.level === levelFilter;
    return matchSearch && matchField && matchStatus && matchLevel;
  });

  const project = projects.find(p => p.id === selected);

  if (selected && project) {
    return (
      <div className="space-y-5 animate-fade-in">
        <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium">
          ← العودة للمشاريع
        </button>

        <div className="card p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{project.name}</h1>
              <div className="flex gap-2 flex-wrap">
                <Badge>{project.status}</Badge>
                <span className={`badge text-xs ${fieldColors[project.field] ?? "bg-gray-100 text-gray-600"}`}>{project.field}</span>
                <Badge variant="blue">{project.level}</Badge>
              </div>
            </div>
            {project.competition && (
              <div className="flex items-center gap-2 bg-yellow-50 text-yellow-700 px-4 py-2 rounded-xl">
                <Trophy className="w-4 h-4" />
                <span className="text-sm font-medium">{project.competition}</span>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-gray-700 mb-2">المشكلة</h3>
              <p className="text-gray-600 text-sm leading-relaxed bg-red-50 p-4 rounded-xl">{project.problem}</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-700 mb-2">الفكرة / الحل</h3>
              <p className="text-gray-600 text-sm leading-relaxed bg-green-50 p-4 rounded-xl">{project.idea}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="font-semibold text-sm text-blue-800">الفريق</span>
              </div>
              {project.students.map(s => (
                <div key={s} className="text-sm text-blue-700 py-1 border-b border-blue-100 last:border-0">{s}</div>
              ))}
              <div className="mt-2 text-xs text-blue-500">المشرف: {project.supervisor}</div>
            </div>
            <div className="bg-purple-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <School className="w-4 h-4 text-purple-600" />
                <span className="font-semibold text-sm text-purple-800">بيانات المشروع</span>
              </div>
              <div className="space-y-1 text-sm text-purple-700">
                <div>المدرسة: {project.school}</div>
                <div>المرحلة: {project.level}</div>
                <div>تاريخ البدء: {project.date}</div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="font-semibold text-sm text-gray-700 mb-2">الأدوات المستخدمة</div>
              <div className="flex flex-wrap gap-1">
                {project.tools.map(t => (
                  <span key={t} className="text-xs bg-white border border-gray-200 text-gray-600 px-2 py-1 rounded-lg">{t}</span>
                ))}
              </div>
            </div>
          </div>

          {project.achievements && project.achievements.length > 0 && (
            <div className="mt-6 bg-yellow-50 rounded-xl p-4 border border-yellow-200">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-4 h-4 text-yellow-600" />
                <span className="font-bold text-yellow-800">الإنجازات</span>
              </div>
              {project.achievements.map(a => (
                <div key={a} className="text-sm text-yellow-700 flex items-center gap-2">
                  <span className="text-yellow-500">🏆</span> {a}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="card p-6 bg-gradient-to-l from-indigo-800 to-blue-700 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <FolderOpen className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">مركز المشاريع</h1>
              <p className="text-blue-200 text-sm">إدارة وتوثيق مشاريع الطلاب والمعلمين</p>
            </div>
          </div>
          <button className="flex items-center gap-2 bg-white text-blue-800 px-4 py-2 rounded-xl font-semibold text-sm hover:bg-yellow-50 transition-colors">
            <Plus className="w-4 h-4" /> إضافة مشروع
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-48 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5">
            <Search className="w-4 h-4 text-gray-400" />
            <input type="text" placeholder="ابحث عن مشروع..." value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent outline-none text-sm flex-1 text-right" />
          </div>
          {[
            { label: "المجال", options: ["الكل", "الذكاء الاصطناعي", "إنترنت الأشياء", "الروبوت", "STEAM"], value: fieldFilter, set: setFieldFilter },
            { label: "الحالة", options: ["الكل", "فائز", "مكتمل", "قيد التنفيذ", "مشارك في مسابقة", "فكرة"], value: statusFilter, set: setStatusFilter },
            { label: "المرحلة", options: ["الكل", "ابتدائي", "متوسط", "ثانوي"], value: levelFilter, set: setLevelFilter },
          ].map(f => (
            <div key={f.label} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <select value={f.value} onChange={e => f.set(e.target.value)} className="bg-transparent text-sm outline-none text-gray-600">
                {f.options.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "إجمالي المشاريع", value: projects.length, color: "text-blue-700 bg-blue-50" },
          { label: "قيد التنفيذ", value: projects.filter(p => p.status === "قيد التنفيذ").length, color: "text-blue-600 bg-blue-50" },
          { label: "مكتملة", value: projects.filter(p => p.status === "مكتمل").length, color: "text-green-700 bg-green-50" },
          { label: "فائزة", value: projects.filter(p => p.status === "فائز").length, color: "text-yellow-700 bg-yellow-50" },
        ].map(s => (
          <div key={s.label} className={`card p-4 text-center ${s.color}`}>
            <div className="text-3xl font-bold">{s.value}</div>
            <div className="text-xs font-medium mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Project Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(project => (
          <div key={project.id} className="card p-5 group cursor-pointer" onClick={() => setSelected(project.id)}>
            {/* Color top bar */}
            <div className={`h-2 rounded-full mb-4 ${project.status === "فائز" ? "bg-yellow-400" : project.status === "مكتمل" ? "bg-green-400" : project.status === "قيد التنفيذ" ? "bg-blue-400" : "bg-gray-200"}`} />

            <div className="flex items-start justify-between mb-3">
              <h3 className="font-bold text-gray-800 group-hover:text-blue-700 transition-colors">{project.name}</h3>
              <Badge>{project.status}</Badge>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-2">{project.idea}</p>

            <div className="space-y-2 text-xs text-gray-500">
              <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{project.students.join("، ")}</div>
              <div className="flex items-center gap-1.5"><School className="w-3.5 h-3.5" />{project.school} • {project.level}</div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
              <div className="flex flex-wrap gap-1">
                <span className={`text-xs px-2 py-0.5 rounded-full ${fieldColors[project.field] ?? "bg-gray-100 text-gray-600"}`}>{project.field}</span>
              </div>
              <button className="flex items-center gap-1 text-blue-600 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                <Eye className="w-3.5 h-3.5" /> عرض
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-3 text-center py-16 text-gray-400">
            <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>لا توجد مشاريع تطابق البحث</p>
          </div>
        )}
      </div>
    </div>
  );
}

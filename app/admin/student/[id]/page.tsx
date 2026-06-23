"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight, Phone, Mail, Calendar, Briefcase, Video, FileText, Plus, Trash2, Star, Trophy, BookOpen } from "lucide-react";
import type { StudentProfile, ProjectItem } from "@/contexts/AuthContext";
import { cloudGet } from "@/lib/cloud";

interface Meeting { id: string; title: string; date: string; participants: string[]; status: string; }
interface DailyLogEntry { id: string; title: string; date: string; description: string; category: string; images: Array<{ data: string; name: string }>; }

function load<T>(key: string, fb: T): T {
  try { const d = localStorage.getItem(key); return d ? JSON.parse(d) : fb; } catch { return fb; }
}

export default function StudentProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [notes, setNotes] = useState<string[]>([]);
  const [noteInput, setNoteInput] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    async function loadData() {
      let all = load<StudentProfile[]>("kc_students", []);
      let found = all.find(s => s.id === id);

      // إذا لم يوجد محلياً، نجلب من Firebase مباشرة
      if (!found) {
        const cloudStudents = await cloudGet<StudentProfile[]>("kc_students");
        if (Array.isArray(cloudStudents)) {
          localStorage.setItem("kc_students", JSON.stringify(cloudStudents));
          found = cloudStudents.find(s => s.id === id);
        }
      }

      if (!found) { router.push("/admin"); return; }
      setStudent(found);

      const allProjects = load<ProjectItem[]>("kc_projects", []);
      setProjects(allProjects.filter(p => (p as any).students?.includes(found!.name) || (p as any).studentId === id));

      const allMeetings = load<Meeting[]>("kc_meetings", []);
      setMeetings(allMeetings.filter(m => m.participants?.includes(found!.name)));

      setNotes(load<string[]>("kc_snotes_" + id, []));
    }
    loadData();
  }, [id]);

  const addNote = () => {
    const txt = noteInput.trim(); if (!txt) return;
    const updated = [...notes, `${new Date().toLocaleDateString("ar-SA")} — ${txt}`];
    localStorage.setItem("kc_snotes_" + id, JSON.stringify(updated));
    setNotes(updated); setNoteInput("");
  };

  const deleteNote = (i: number) => {
    const updated = notes.filter((_, idx) => idx !== i);
    localStorage.setItem("kc_snotes_" + id, JSON.stringify(updated));
    setNotes(updated);
  };

  if (!student) return <div className="p-8 text-center text-gray-400">جاري التحميل...</div>;

  const tabs = [
    { id: "overview", label: "نظرة عامة", icon: Star },
    { id: "projects", label: `المشاريع (${projects.length})`, icon: Briefcase },
    { id: "meetings", label: `الاجتماعات (${meetings.length})`, icon: Video },
    { id: "notes", label: `ملاحظاتي (${notes.length})`, icon: FileText },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <button onClick={() => router.push("/admin")} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
        <ArrowRight className="w-4 h-4" /> العودة للوحة الإدارة
      </button>

      {/* بطاقة الطالب */}
      <div className="card p-6 bg-gradient-to-l from-emerald-700 to-teal-600 text-white">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-bold flex-shrink-0 overflow-hidden">
            {student.photo ? <img src={student.photo} className="w-full h-full object-cover" alt="" /> : student.name[0]}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{student.name}</h1>
            <p className="text-emerald-100 mt-1">{student.school} • {student.grade}</p>
            <div className="flex flex-wrap gap-3 mt-3">
              {student.phone && (
                <a href={`tel:${student.phone}`} className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-xl text-sm transition-colors">
                  <Phone className="w-3.5 h-3.5" /> {student.phone}
                </a>
              )}
              {student.parentPhone && (
                <a href={`tel:${student.parentPhone}`} className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-xl text-sm transition-colors">
                  <Phone className="w-3.5 h-3.5" /> ولي الأمر: {student.parentPhone}
                </a>
              )}
              {student.email && (
                <a href={`mailto:${student.email}`} className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-xl text-sm transition-colors">
                  <Mail className="w-3.5 h-3.5" /> {student.email}
                </a>
              )}
            </div>
          </div>
          <div className="text-right">
            <span className={`px-3 py-1 rounded-xl text-sm font-bold ${student.status === "approved" ? "bg-green-400/20 text-green-200" : student.status === "pending" ? "bg-yellow-400/20 text-yellow-200" : "bg-red-400/20 text-red-200"}`}>
              {student.status === "approved" ? "✓ معتمد" : student.status === "pending" ? "⏳ انتظار" : "✗ مرفوض"}
            </span>
            <p className="text-emerald-200 text-xs mt-2">{new Date(student.registeredAt).toLocaleDateString("ar-SA")}</p>
            {student.birthDate && <p className="text-emerald-200 text-xs mt-1">🎂 {student.birthDate}</p>}
          </div>
        </div>
      </div>

      {/* التبويبات */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === t.id ? "bg-emerald-700 text-white shadow" : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"}`}>
              <Icon className="w-4 h-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {/* نظرة عامة */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "المشاريع", value: projects.length, color: "from-blue-600 to-blue-400", icon: "💡" },
            { label: "الاجتماعات", value: meetings.length, color: "from-purple-600 to-purple-400", icon: "📅" },
            { label: "الفرق", value: student.teams?.length || 0, color: "from-amber-500 to-amber-400", icon: "👥" },
            { label: "الملاحظات", value: notes.length, color: "from-rose-500 to-rose-400", icon: "📝" },
          ].map(s => (
            <div key={s.label} className={`card p-5 bg-gradient-to-br ${s.color} text-white text-center`}>
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="text-3xl font-bold">{s.value}</div>
              <div className="text-white/80 text-sm mt-1">{s.label}</div>
            </div>
          ))}
          {student.teams && student.teams.length > 0 && (
            <div className="col-span-2 md:col-span-4 card p-4">
              <p className="font-bold text-gray-700 mb-2">الفرق والأندية</p>
              <div className="flex flex-wrap gap-2">
                {student.teams.map((t, i) => <span key={i} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-xl text-sm font-medium">{t}</span>)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* المشاريع */}
      {activeTab === "projects" && (
        <div className="space-y-3">
          {projects.length === 0
            ? <div className="card p-10 text-center text-gray-400"><Briefcase className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>لا توجد مشاريع مرتبطة بهذا الطالب</p></div>
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
                <span className={`text-xs px-2 py-1 rounded-lg font-medium ${m.status === "completed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                  {m.status === "completed" ? "مكتمل" : "قادم"}
                </span>
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
              <button onClick={addNote} className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-emerald-500 flex items-center gap-1">
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
                <button onClick={() => deleteNote(i)} className="text-red-400 hover:text-red-600 p-1"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
}

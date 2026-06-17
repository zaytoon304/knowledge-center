"use client";
import { useState, useEffect } from "react";
import { Plus, Trash2, Users, ChevronDown, ChevronUp, UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface CoordStudent {
  id: string;
  name: string;
  grade: string;
  nationalId: string;
  phone: string;
  parentPhone: string;
  notes: string;
  status: "معلق" | "مقبول" | "مرفوض";
}

interface CoordTeam {
  id: string;
  name: string;
  category: string;
  students: CoordStudent[];
  createdAt: string;
}

const QUICK_TEAMS = [
  { label: "أولمبياد الرياضيات", category: "مسابقات" },
  { label: "أولمبياد العلوم", category: "مسابقات" },
  { label: "نسمو", category: "مسابقات" },
  { label: "كنجارو", category: "مسابقات" },
  { label: "بيبيراس", category: "مسابقات" },
  { label: "موهوب", category: "مسابقات" },
  { label: "مهارات التفكير", category: "برامج الموهبة" },
  { label: "الحساب الذهني", category: "برامج الموهبة" },
  { label: "فن الفك والتركيب", category: "برامج الموهبة" },
  { label: "نادي الموهبة", category: "برامج الموهبة" },
  { label: "نادي الروبوت", category: "روبوت" },
];

const GRADES = [
  "الصف الأول الابتدائي", "الصف الثاني الابتدائي", "الصف الثالث الابتدائي",
  "الصف الرابع الابتدائي", "الصف الخامس الابتدائي", "الصف السادس الابتدائي",
  "الصف الأول المتوسط", "الصف الثاني المتوسط", "الصف الثالث المتوسط",
  "الصف الأول الثانوي", "الصف الثاني الثانوي", "الصف الثالث الثانوي",
];

const CATEGORY_COLORS: Record<string, string> = {
  "مسابقات": "from-blue-700 to-blue-500",
  "برامج الموهبة": "from-violet-700 to-purple-500",
  "روبوت": "from-orange-600 to-amber-500",
  "عام": "from-teal-700 to-green-500",
};

const EMPTY_STUDENT = { name: "", grade: GRADES[0], nationalId: "", phone: "", parentPhone: "", notes: "", status: "معلق" as const };

export default function StudentsSection() {
  const { user } = useAuth();
  const key = `kc_coord_teams_${user!.id}`;
  const [teams, setTeams] = useState<CoordTeam[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [teamCategory, setTeamCategory] = useState("عام");
  const [addingStudent, setAddingStudent] = useState<string | null>(null);
  const [sForm, setSForm] = useState(EMPTY_STUDENT);

  useEffect(() => {
    const s = localStorage.getItem(key);
    setTeams(s ? JSON.parse(s) : []);
  }, [key]);

  const persist = (updated: CoordTeam[]) => {
    setTeams(updated);
    localStorage.setItem(key, JSON.stringify(updated));
  };

  const addTeam = (name: string, category: string) => {
    if (!name.trim()) return;
    const team: CoordTeam = { id: Date.now().toString(), name, category, students: [], createdAt: new Date().toISOString() };
    persist([...teams, team]);
    setShowTeamForm(false);
    setTeamName("");
    setExpanded(team.id);
  };

  const deleteTeam = (id: string) => persist(teams.filter(t => t.id !== id));

  const addStudent = (teamId: string) => {
    if (!sForm.name.trim()) return;
    const student: CoordStudent = { ...sForm, id: Date.now().toString() };
    persist(teams.map(t => t.id === teamId ? { ...t, students: [...t.students, student] } : t));
    setSForm(EMPTY_STUDENT);
    setAddingStudent(null);
  };

  const deleteStudent = (teamId: string, studentId: string) =>
    persist(teams.map(t => t.id === teamId ? { ...t, students: t.students.filter(s => s.id !== studentId) } : t));

  const cycleStatus = (teamId: string, studentId: string) => {
    const cycle: Record<string, "معلق" | "مقبول" | "مرفوض"> = { "معلق": "مقبول", "مقبول": "مرفوض", "مرفوض": "معلق" };
    persist(teams.map(t => t.id === teamId
      ? { ...t, students: t.students.map(s => s.id === studentId ? { ...s, status: cycle[s.status] } : s) }
      : t));
  };

  const totalStudents = teams.reduce((sum, t) => sum + t.students.length, 0);

  return (
    <div className="space-y-4">
      {/* إحصاء سريع */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card p-3 flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white flex-shrink-0"><Users className="w-5 h-5" /></div>
          <div><div className="text-xl font-bold text-gray-800">{totalStudents}</div><div className="text-xs text-gray-500">إجمالي الطلاب</div></div>
        </div>
        <div className="card p-3 flex items-center gap-3">
          <div className="w-9 h-9 bg-violet-600 rounded-xl flex items-center justify-center text-white flex-shrink-0"><Users className="w-5 h-5" /></div>
          <div><div className="text-xl font-bold text-gray-800">{teams.length}</div><div className="text-xs text-gray-500">الفرق والمجموعات</div></div>
        </div>
        <div className="card p-3 flex items-center gap-3">
          <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center text-white flex-shrink-0"><Users className="w-5 h-5" /></div>
          <div><div className="text-xl font-bold text-gray-800">{teams.filter(t => t.category === "مسابقات").reduce((s, t) => s + t.students.length, 0)}</div><div className="text-xs text-gray-500">طلاب المسابقات</div></div>
        </div>
        <div className="card p-3 flex items-center gap-3">
          <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center text-white flex-shrink-0"><Users className="w-5 h-5" /></div>
          <div><div className="text-xl font-bold text-gray-800">{teams.filter(t => t.category === "برامج الموهبة").reduce((s, t) => s + t.students.length, 0)}</div><div className="text-xs text-gray-500">طلاب الموهبة</div></div>
        </div>
      </div>

      {/* إضافة سريعة */}
      <div className="card p-4">
        <p className="text-xs font-semibold text-gray-500 mb-3">إضافة سريعة:</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_TEAMS.map(q => (
            <button key={q.label}
              disabled={teams.some(t => t.name === q.label)}
              onClick={() => addTeam(q.label, q.category)}
              className="text-xs px-3 py-1.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
              + {q.label}
            </button>
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-gray-800">الفرق والمجموعات ({teams.length})</h2>
        <button onClick={() => setShowTeamForm(!showTeamForm)}
          className="flex items-center gap-2 bg-blue-800 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700">
          <Plus className="w-4 h-4" /> فريق مخصص
        </button>
      </div>

      {showTeamForm && (
        <div className="card p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-600 mb-1 block">اسم الفريق / المجموعة *</label>
              <input value={teamName} onChange={e => setTeamName(e.target.value)}
                placeholder="مثال: فريق WRO 2025"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-blue-500" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-600 mb-1 block">التصنيف</label>
              <select value={teamCategory} onChange={e => setTeamCategory(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none">
                <option>عام</option>
                <option>مسابقات</option>
                <option>برامج الموهبة</option>
                <option>روبوت</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => addTeam(teamName, teamCategory)} className="bg-blue-800 text-white px-6 py-2 rounded-xl text-sm font-semibold">إنشاء</button>
            <button onClick={() => setShowTeamForm(false)} className="bg-gray-100 text-gray-600 px-6 py-2 rounded-xl text-sm">إلغاء</button>
          </div>
        </div>
      )}

      {teams.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">
          <Users className="w-14 h-14 mx-auto mb-3 opacity-30" />
          <p className="font-medium">لا توجد فرق بعد</p>
          <p className="text-sm mt-1">استخدم الإضافة السريعة أو أنشئ فريقاً مخصصاً</p>
        </div>
      ) : (
        <div className="space-y-3">
          {teams.map(team => (
            <div key={team.id} className="card overflow-hidden">
              {/* رأس الفريق */}
              <div className={`bg-gradient-to-l ${CATEGORY_COLORS[team.category] || CATEGORY_COLORS["عام"]} p-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setExpanded(expanded === team.id ? null : team.id)} className="text-white">
                      {expanded === team.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                    <div>
                      <p className="font-bold text-white">{team.name}</p>
                      <p className="text-white/70 text-xs">{team.category} • {team.students.length} طالب</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setAddingStudent(team.id); setExpanded(team.id); }}
                      className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-xl text-xs font-semibold">
                      <UserPlus className="w-3.5 h-3.5" /> إضافة طالب
                    </button>
                    <button onClick={() => { if (confirm(`حذف "${team.name}"؟`)) deleteTeam(team.id); }}
                      className="p-2 bg-white/20 hover:bg-red-400/40 text-white rounded-xl">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* المحتوى المنسدل */}
              {expanded === team.id && (
                <div className="p-4 space-y-3">
                  {/* نموذج إضافة طالب */}
                  {addingStudent === team.id && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
                      <h4 className="text-sm font-bold text-blue-800">إضافة طالب جديد لـ {team.name}</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="col-span-2">
                          <label className="text-xs font-semibold text-gray-600 mb-0.5 block">الاسم الكامل *</label>
                          <input value={sForm.name} onChange={e => setSForm(p => ({ ...p, name: e.target.value }))}
                            className="w-full border border-blue-200 rounded-xl px-3 py-2 text-sm bg-white outline-none focus:border-blue-500" />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-600 mb-0.5 block">الصف الدراسي</label>
                          <select value={sForm.grade} onChange={e => setSForm(p => ({ ...p, grade: e.target.value }))}
                            className="w-full border border-blue-200 rounded-xl px-3 py-2 text-sm bg-white outline-none">
                            {GRADES.map(g => <option key={g}>{g}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-600 mb-0.5 block">رقم الهوية</label>
                          <input value={sForm.nationalId} onChange={e => setSForm(p => ({ ...p, nationalId: e.target.value }))}
                            maxLength={10} className="w-full border border-blue-200 rounded-xl px-3 py-2 text-sm bg-white outline-none" />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-600 mb-0.5 block">جوال الطالب</label>
                          <input value={sForm.phone} onChange={e => setSForm(p => ({ ...p, phone: e.target.value }))}
                            className="w-full border border-blue-200 rounded-xl px-3 py-2 text-sm bg-white outline-none" />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-600 mb-0.5 block">جوال ولي الأمر</label>
                          <input value={sForm.parentPhone} onChange={e => setSForm(p => ({ ...p, parentPhone: e.target.value }))}
                            className="w-full border border-blue-200 rounded-xl px-3 py-2 text-sm bg-white outline-none" />
                        </div>
                        <div className="col-span-2">
                          <label className="text-xs font-semibold text-gray-600 mb-0.5 block">ملاحظات</label>
                          <input value={sForm.notes} onChange={e => setSForm(p => ({ ...p, notes: e.target.value }))}
                            placeholder="مثال: بطل المرحلة، مشارك سابق..." className="w-full border border-blue-200 rounded-xl px-3 py-2 text-sm bg-white outline-none" />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => addStudent(team.id)} className="bg-blue-800 text-white px-5 py-2 rounded-xl text-sm font-semibold">إضافة</button>
                        <button onClick={() => setAddingStudent(null)} className="bg-gray-100 text-gray-600 px-5 py-2 rounded-xl text-sm">إلغاء</button>
                      </div>
                    </div>
                  )}

                  {team.students.length === 0 ? (
                    <div className="text-center py-6 text-gray-400">
                      <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">لا يوجد طلاب بعد — اضغط إضافة طالب</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            {["#", "الاسم", "الصف", "الهوية", "الجوال", "ولي الأمر", "الحالة", "ملاحظات", ""].map(h => (
                              <th key={h} className="px-3 py-2 text-xs font-semibold text-gray-500 text-right whitespace-nowrap">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {team.students.map((s, i) => {
                            const statusColors = { "مقبول": "bg-green-100 text-green-700", "مرفوض": "bg-red-100 text-red-600", "معلق": "bg-yellow-100 text-yellow-700" };
                            return (
                              <tr key={s.id} className="hover:bg-gray-50/50">
                                <td className="px-3 py-2.5 text-gray-400 text-xs">{i + 1}</td>
                                <td className="px-3 py-2.5 font-medium text-gray-800 whitespace-nowrap">{s.name}</td>
                                <td className="px-3 py-2.5 text-gray-500 text-xs whitespace-nowrap">{s.grade}</td>
                                <td className="px-3 py-2.5 text-gray-500 font-mono text-xs">{s.nationalId}</td>
                                <td className="px-3 py-2.5 text-gray-500 text-xs">{s.phone}</td>
                                <td className="px-3 py-2.5 text-gray-500 text-xs">{s.parentPhone}</td>
                                <td className="px-3 py-2.5">
                                  <button onClick={() => cycleStatus(team.id, s.id)}
                                    className={`text-xs px-2.5 py-1 rounded-full font-semibold transition-all ${statusColors[s.status]}`}>
                                    {s.status === "مقبول" ? "✓ مقبول" : s.status === "مرفوض" ? "✗ مرفوض" : "⏳ معلق"}
                                  </button>
                                </td>
                                <td className="px-3 py-2.5 text-gray-400 text-xs max-w-[120px] truncate">{s.notes}</td>
                                <td className="px-3 py-2.5">
                                  <button onClick={() => deleteStudent(team.id, s.id)}
                                    className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

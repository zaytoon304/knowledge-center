"use client";
import { useState } from "react";
import { Baby, Search, User, Award, Star, Kanban, BookOpen, Shield } from "lucide-react";

interface StudentProfile {
  id: string; name: string; nationalId: string; school: string; grade: string;
  phone: string; email: string; photo: string; status: string; registeredAt: string;
}

function loadStudents(): StudentProfile[] {
  try { const d = localStorage.getItem("kc_students"); return d ? JSON.parse(d) : []; } catch { return []; }
}
function loadCertificates(sid: string) {
  try { const d = localStorage.getItem("kc_certificates"); const all = d ? JSON.parse(d) : []; return all.filter((c: { studentId: string }) => c.studentId === sid); } catch { return []; }
}
function loadPoints(sid: string): number {
  try { const d = localStorage.getItem("kc_points"); const all = d ? JSON.parse(d) : []; return all.filter((p: { studentId: string }) => p.studentId === sid).reduce((s: number, p: { points: number }) => s + p.points, 0); } catch { return 0; }
}
function loadBadges(sid: string): string[] {
  try { const d = localStorage.getItem("kc_badges"); const all = d ? JSON.parse(d) : {}; return all[sid] || []; } catch { return []; }
}
function loadProjects(sid: string) {
  try { const d = localStorage.getItem("kc_kanban"); const all = d ? JSON.parse(d) : []; return all.filter((p: { studentId: string }) => p.studentId === sid); } catch { return []; }
}

const STAGE_LABELS: { [k: string]: string } = { idea: "💡 فكرة", design: "✏️ تصميم", prototype: "🔧 نموذج", testing: "🧪 اختبار", final: "🏆 مكتمل" };
const BADGE_EMOJIS: { [k: string]: string } = { star: "⭐", rocket: "🚀", robot: "🤖", brain: "🧠", trophy: "🏆", book: "📚", fire: "🔥", diamond: "💎" };

export default function ParentPortalPage() {
  const [nationalId, setNationalId] = useState("");
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const handleSearch = () => {
    if (!nationalId.trim()) return;
    const students = loadStudents();
    const found = students.find(s => s.nationalId === nationalId.trim() && s.status === "approved");
    if (found) { setStudent(found); setError(""); }
    else { setStudent(null); setError("لم يُعثر على طالب معتمد بهذا الرقم. تأكد من رقم الهوية أو تواصل مع إدارة المركز."); }
    setSearched(true);
  };

  const certs = student ? loadCertificates(student.id) : [];
  const points = student ? loadPoints(student.id) : 0;
  const badges = student ? loadBadges(student.id) : [];
  const projects = student ? loadProjects(student.id) : [];

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      {/* Header */}
      <div className="card p-5 bg-gradient-to-l from-teal-800 to-cyan-700 text-white">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center">
            <Baby className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">بوابة أولياء الأمور</h1>
            <p className="text-teal-200 text-xs">تابع مسيرة ابنك/ابنتك في المركز</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="card p-6 space-y-4">
        <div className="text-center mb-2">
          <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Shield className="w-8 h-8 text-teal-700" />
          </div>
          <h2 className="font-bold text-gray-800 text-lg">أدخل رقم هوية ابنك/ابنتك</h2>
          <p className="text-sm text-gray-500 mt-1">رقم الهوية الوطنية للطالب المسجل في المنصة</p>
        </div>
        <div className="flex gap-2">
          <input
            value={nationalId}
            onChange={e => setNationalId(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            placeholder="1XXXXXXXXX"
            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm text-center tracking-widest outline-none focus:border-teal-500 bg-gray-50 font-mono"
            maxLength={10}
          />
          <button onClick={handleSearch}
            className="bg-teal-700 text-white px-5 py-3 rounded-xl hover:bg-teal-600 transition-colors flex items-center gap-2 text-sm font-medium">
            <Search className="w-4 h-4" /> بحث
          </button>
        </div>
        {error && searched && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 text-center">{error}</div>
        )}
      </div>

      {/* Student Profile */}
      {student && (
        <div className="space-y-4">
          {/* Profile Card */}
          <div className="card p-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-700 to-cyan-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 overflow-hidden">
                {student.photo ? <img src={student.photo} alt="" className="w-full h-full object-cover" /> : student.name[0]}
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-gray-800 text-xl">{student.name}</h2>
                <p className="text-gray-500 text-sm">{student.grade} — {student.school}</p>
                <div className="mt-1">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">✅ طالب معتمد</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "النقاط", value: points, icon: Star, color: "bg-yellow-100 text-yellow-700" },
              { label: "الشهادات", value: certs.length, icon: Award, color: "bg-purple-100 text-purple-700" },
              { label: "المشاريع", value: projects.length, icon: Kanban, color: "bg-blue-100 text-blue-700" },
            ].map(s => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="card p-4 text-center">
                  <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-2xl font-bold text-gray-800">{s.value}</div>
                  <div className="text-xs text-gray-500">{s.label}</div>
                </div>
              );
            })}
          </div>

          {/* Badges */}
          {badges.length > 0 && (
            <div className="card p-4">
              <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><Star className="w-4 h-4 text-yellow-500" /> الشارات المحققة</h3>
              <div className="flex flex-wrap gap-3">
                {badges.map((b, i) => (
                  <div key={i} className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-xl px-3 py-2">
                    <span className="text-2xl">{BADGE_EMOJIS[b] || "🏅"}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certificates */}
          {certs.length > 0 && (
            <div className="card p-4">
              <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><Award className="w-4 h-4 text-purple-500" /> الشهادات ({certs.length})</h3>
              <div className="space-y-2">
                {certs.map((c: { id: string; title: string; date: string; type: string }) => (
                  <div key={c.id} className="flex items-center justify-between bg-purple-50 rounded-xl p-3">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{c.title}</p>
                      <p className="text-xs text-gray-400">{c.date}</p>
                    </div>
                    <span className="text-lg">{{ program: "📚", competition: "🏆", achievement: "⭐", participation: "🌟" }[c.type as "program"|"competition"|"achievement"|"participation"] ?? "🎓"}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <div className="card p-4">
              <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><Kanban className="w-4 h-4 text-blue-500" /> المشاريع ({projects.length})</h3>
              <div className="space-y-2">
                {projects.map((p: { id: string; title: string; stage: string; field: string }) => (
                  <div key={p.id} className="flex items-center justify-between bg-blue-50 rounded-xl p-3">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{p.title}</p>
                      {p.field && <p className="text-xs text-gray-400">{p.field}</p>}
                    </div>
                    <span className="text-xs bg-white border border-gray-200 px-2 py-1 rounded-lg font-medium text-gray-600">
                      {STAGE_LABELS[p.stage] || p.stage}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No activity */}
          {certs.length === 0 && projects.length === 0 && points === 0 && (
            <div className="card p-6 text-center text-gray-400">
              <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">الطالب مسجل ولم تُسجَّل له أنشطة بعد في المنصة</p>
            </div>
          )}

          {/* Privacy note */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-400">🔒 هذه البيانات خاصة — لا تشارك رقم هوية ابنك مع أحد</p>
          </div>
        </div>
      )}
    </div>
  );
}

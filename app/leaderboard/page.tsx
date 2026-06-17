"use client";
import { useState, useEffect } from "react";
import { Medal, Star, Trophy, Crown, Plus, Trash2, Gift } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface PointRecord { id: string; studentId: string; studentName: string; points: number; reason: string; date: string; }
interface Badge { id: string; emoji: string; label: string; }

const BADGES: Badge[] = [
  { id: "star", emoji: "⭐", label: "نجم المركز" },
  { id: "rocket", emoji: "🚀", label: "مبتكر متميز" },
  { id: "robot", emoji: "🤖", label: "خبير الروبوت" },
  { id: "brain", emoji: "🧠", label: "عبقري AI" },
  { id: "trophy", emoji: "🏆", label: "بطل المسابقات" },
  { id: "book", emoji: "📚", label: "القارئ النشط" },
  { id: "fire", emoji: "🔥", label: "الأكثر إنجازاً" },
  { id: "diamond", emoji: "💎", label: "موهبة نادرة" },
];

const QUICK_REASONS = ["حضور برنامج تدريبي", "تقديم مشروع", "الفوز بمسابقة", "إنجاز دورة", "مشاركة فعّالة", "ابتكار فكرة مميزة", "مساعدة زميل", "تميز في العرض"];

function loadPoints(): PointRecord[] { try { const d = localStorage.getItem("kc_points"); return d ? JSON.parse(d) : []; } catch { return []; } }
function savePoints(p: PointRecord[]) { localStorage.setItem("kc_points", JSON.stringify(p)); }
function loadBadges(): { [sid: string]: string[] } { try { const d = localStorage.getItem("kc_badges"); return d ? JSON.parse(d) : {}; } catch { return {}; } }
function saveBadges(b: { [sid: string]: string[] }) { localStorage.setItem("kc_badges", JSON.stringify(b)); }
function isAdmin() { try { return typeof window !== "undefined" && localStorage.getItem("kc_admin_auth") === "1"; } catch { return false; } }

export default function LeaderboardPage() {
  const { user, getAllStudents, isStudent } = useAuth();
  const [admin] = useState(isAdmin);
  const [points, setPoints] = useState<PointRecord[]>([]);
  const [badges, setBadges] = useState<{ [sid: string]: string[] }>({});
  const [showAward, setShowAward] = useState(false);
  const [form, setForm] = useState({ studentId: "", studentName: "", points: "10", reason: "" });
  const [selectedBadge, setSelectedBadge] = useState("");
  const [awardTab, setAwardTab] = useState<"points" | "badges">("points");

  useEffect(() => { setPoints(loadPoints()); setBadges(loadBadges()); }, []);

  const students = getAllStudents().filter(s => s.status === "approved");

  const totals = students.map(s => ({
    ...s,
    total: points.filter(p => p.studentId === s.id).reduce((sum, p) => sum + p.points, 0),
    badges: badges[s.id] || [],
    history: points.filter(p => p.studentId === s.id),
  })).sort((a, b) => b.total - a.total);

  const myRecord = isStudent && user ? totals.find(t => t.id === user.id) : null;

  const awardPoints = () => {
    if (!form.studentId || !form.points || !form.reason) return;
    const record: PointRecord = {
      id: Date.now().toString(), studentId: form.studentId, studentName: form.studentName,
      points: parseInt(form.points), reason: form.reason, date: new Date().toISOString(),
    };
    const updated = [record, ...points];
    savePoints(updated); setPoints(updated);
    setForm({ studentId: "", studentName: "", points: "10", reason: "" });
  };

  const awardBadge = () => {
    if (!form.studentId || !selectedBadge) return;
    const updated = { ...badges, [form.studentId]: [...(badges[form.studentId] || []), selectedBadge] };
    saveBadges(updated); setBadges(updated);
    setSelectedBadge("");
  };

  const removePoint = (id: string) => {
    const updated = points.filter(p => p.id !== id);
    savePoints(updated); setPoints(updated);
  };

  const rankIcon = (i: number) => i === 0 ? "👑" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`;
  const rankBg = (i: number) => i === 0 ? "bg-gradient-to-l from-yellow-50 to-amber-50 border-yellow-300" : i === 1 ? "bg-gradient-to-l from-gray-50 to-slate-50 border-gray-300" : i === 2 ? "bg-gradient-to-l from-orange-50 to-amber-50 border-orange-200" : "bg-white border-gray-100";

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="card p-5 bg-gradient-to-l from-yellow-600 to-amber-500 text-white">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center">
              <Medal className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">لوحة المتصدرين</h1>
              <p className="text-yellow-100 text-xs">{students.length} طالب — {points.reduce((s, p) => s + p.points, 0)} نقطة موزَّعة</p>
            </div>
          </div>
          {admin && (
            <button onClick={() => setShowAward(!showAward)}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
              <Gift className="w-4 h-4" /> منح نقاط / شارات
            </button>
          )}
        </div>
      </div>

      {/* My stats (student view) */}
      {myRecord && (
        <div className="card p-5 bg-gradient-to-l from-blue-700 to-indigo-600 text-white">
          <p className="text-blue-200 text-xs mb-1">نقاطي</p>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-4xl font-bold">{myRecord.total}</div>
              <p className="text-blue-200 text-sm">المرتبة {totals.findIndex(t => t.id === user?.id) + 1} من {students.length}</p>
            </div>
            <div className="flex flex-wrap gap-1 max-w-[200px]">
              {myRecord.badges.map((b, i) => {
                const badge = BADGES.find(bg => bg.id === b);
                return badge ? <span key={i} title={badge.label} className="text-2xl">{badge.emoji}</span> : null;
              })}
            </div>
          </div>
        </div>
      )}

      {/* Award Panel (admin) */}
      {showAward && admin && (
        <div className="card p-5 space-y-4">
          <div className="flex gap-2">
            {[{ id: "points" as const, label: "منح نقاط" }, { id: "badges" as const, label: "منح شارة" }].map(t => (
              <button key={t.id} onClick={() => setAwardTab(t.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${awardTab === t.id ? "bg-yellow-600 text-white" : "bg-gray-100 text-gray-600"}`}>
                {t.label}
              </button>
            ))}
          </div>

          {awardTab === "points" && (
            <div className="space-y-3">
              <div className="grid md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">الطالب</label>
                  <select value={form.studentId} onChange={e => {
                    const s = students.find(st => st.id === e.target.value);
                    setForm(p => ({ ...p, studentId: e.target.value, studentName: s?.name || "" }));
                  }} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none">
                    <option value="">اختر طالباً</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">النقاط</label>
                  <input type="number" value={form.points} onChange={e => setForm(p => ({ ...p, points: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">السبب</label>
                  <select value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none">
                    <option value="">اختر السبب</option>
                    {QUICK_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <button onClick={awardPoints} className="bg-yellow-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-yellow-500 flex items-center gap-2">
                <Star className="w-4 h-4" /> منح النقاط
              </button>
            </div>
          )}

          {awardTab === "badges" && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">الطالب</label>
                <select value={form.studentId} onChange={e => {
                  const s = students.find(st => st.id === e.target.value);
                  setForm(p => ({ ...p, studentId: e.target.value, studentName: s?.name || "" }));
                }} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none">
                  <option value="">اختر طالباً</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {BADGES.map(b => (
                  <button key={b.id} onClick={() => setSelectedBadge(b.id)}
                    className={`p-3 rounded-xl text-center transition-all border-2 ${selectedBadge === b.id ? "border-yellow-500 bg-yellow-50" : "border-gray-100 hover:border-gray-300"}`}>
                    <div className="text-2xl mb-1">{b.emoji}</div>
                    <div className="text-xs text-gray-600">{b.label}</div>
                  </button>
                ))}
              </div>
              <button onClick={awardBadge} className="bg-yellow-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-yellow-500 flex items-center gap-2">
                <Trophy className="w-4 h-4" /> منح الشارة
              </button>
            </div>
          )}
        </div>
      )}

      {/* Leaderboard */}
      {totals.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Medal className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium text-gray-500">لا يوجد طلاب معتمدون بعد</p>
        </div>
      ) : (
        <div className="space-y-3">
          {totals.map((s, i) => (
            <div key={s.id} className={`card border p-4 ${rankBg(i)} transition-all hover:shadow-md`}>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0 ${i === 0 ? "bg-yellow-100" : i === 1 ? "bg-gray-100" : i === 2 ? "bg-orange-100" : "bg-blue-50 text-blue-700 text-sm"}`}>
                  {rankIcon(i)}
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-700 to-indigo-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {s.photo ? <img src={s.photo} alt="" className="w-full h-full rounded-full object-cover" /> : s.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-800">{s.name}</span>
                    {s.badges.slice(0, 4).map((b, bi) => {
                      const badge = BADGES.find(bg => bg.id === b);
                      return badge ? <span key={bi} title={badge.label} className="text-lg">{badge.emoji}</span> : null;
                    })}
                    {s.badges.length > 4 && <span className="text-xs text-gray-400">+{s.badges.length - 4}</span>}
                  </div>
                  <p className="text-xs text-gray-400">{s.grade} — {s.school}</p>
                </div>
                <div className="text-left flex-shrink-0">
                  <div className={`text-2xl font-bold ${i === 0 ? "text-yellow-600" : i === 1 ? "text-gray-600" : i === 2 ? "text-orange-600" : "text-blue-700"}`}>{s.total}</div>
                  <div className="text-xs text-gray-400">نقطة</div>
                </div>
              </div>
              {/* History (admin only) */}
              {admin && s.history.length > 0 && (
                <div className="mt-3 border-t pt-3 space-y-1">
                  {s.history.slice(0, 3).map(h => (
                    <div key={h.id} className="flex items-center justify-between text-xs text-gray-500">
                      <span>+{h.points} — {h.reason}</span>
                      <div className="flex items-center gap-2">
                        <span>{new Date(h.date).toLocaleDateString("ar-SA")}</span>
                        <button onClick={() => removePoint(h.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    </div>
                  ))}
                  {s.history.length > 3 && <p className="text-xs text-gray-400">+{s.history.length - 3} سجلات أخرى</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

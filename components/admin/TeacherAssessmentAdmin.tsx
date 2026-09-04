"use client";
import { useState, useEffect, useMemo } from "react";
import { Dices, Save, Printer, Trash2, TrendingUp, CalendarDays, ClipboardCheck, UserPlus } from "lucide-react";
import { DEPARTMENTS, DEPARTMENT_COORDINATOR } from "@/contexts/AuthContext";
import {
  ROBOTICS_TRACK_ID, ROBOTICS_TRAINING_WEEKS, ASSESSMENT_CRITERIA, CRITERION_MAX,
  getRoster, getSessions, saveSession, deleteSession, pickRandomStudents,
  addRosterName, removeRosterName,
  sessionPercentage, cumulativePercentage, suggestedCurrentWeek,
  type RosterEntry, type AssessmentSession, type StudentScore,
} from "@/lib/teacherAssessment";
import TeacherAssessmentReport from "./TeacherAssessmentReport";

const ASSESSOR_QUICK_NAMES = ["محمد زيتون", "محمد شيبة"];

function pctColor(pct: number) {
  if (pct >= 85) return "text-emerald-600 bg-emerald-100";
  if (pct >= 70) return "text-amber-600 bg-amber-100";
  return "text-red-500 bg-red-100";
}

export default function TeacherAssessmentAdmin() {
  const [department, setDepartment] = useState<string>(DEPARTMENTS[0]);
  const [roster, setRoster] = useState<RosterEntry[]>([]);
  const [sessions, setSessions] = useState<AssessmentSession[]>([]);
  const [week, setWeek] = useState(suggestedCurrentWeek());
  const [selected, setSelected] = useState<string[]>([]);
  const [scores, setScores] = useState<Record<string, Record<string, number>>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [assessorName, setAssessorName] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [newRosterName, setNewRosterName] = useState("");
  const [rosterSaving, setRosterSaving] = useState(false);

  const refresh = () => {
    getRoster().then(setRoster);
    getSessions().then(setSessions);
  };
  useEffect(() => { refresh(); }, []);

  const deptRoster = useMemo(
    () => roster.filter(r => r.trackId === ROBOTICS_TRACK_ID && r.department === department),
    [roster, department]
  );
  const deptSessions = useMemo(
    () => sessions.filter(s => s.trackId === ROBOTICS_TRACK_ID && s.department === department).sort((a, b) => a.week - b.week),
    [sessions, department]
  );
  const currentWeekInfo = ROBOTICS_TRAINING_WEEKS.find(w => w.week === week);
  const alreadyDoneThisWeek = deptSessions.some(s => s.week === week);

  const pickFive = () => {
    const picked = pickRandomStudents(deptRoster.map(r => r.studentName), 5);
    setSelected(picked);
    const initScores: Record<string, Record<string, number>> = {};
    picked.forEach(name => { initScores[name] = Object.fromEntries(ASSESSMENT_CRITERIA.map(c => [c, 3] as [string, number])); });
    setScores(initScores);
    setNotes({});
  };

  const setScore = (student: string, criterion: string, value: number) => {
    setScores(p => ({ ...p, [student]: { ...p[student], [criterion]: value } }));
  };

  const canSubmit = selected.length > 0 && assessorName.trim().length > 0;

  const submit = async () => {
    if (!canSubmit || saving) return;
    setSaving(true);
    const studentScores: StudentScore[] = selected.map(name => ({ studentName: name, scores: scores[name], note: notes[name] || "" }));
    await saveSession({ trackId: ROBOTICS_TRACK_ID, department, week, date, assessorName: assessorName.trim(), studentScores });
    setSelected([]); setScores({}); setNotes({});
    setSaving(false);
    refresh();
  };

  const removeSession = async (id: string) => {
    if (!confirm("حذف هذا القياس نهائياً؟")) return;
    await deleteSession(id);
    refresh();
  };

  const addName = async () => {
    if (!newRosterName.trim() || rosterSaving) return;
    setRosterSaving(true);
    await addRosterName(ROBOTICS_TRACK_ID, department, newRosterName, "لوحة الإدارة");
    setNewRosterName("");
    setRosterSaving(false);
    refresh();
  };

  const removeName = async (id: string) => {
    await removeRosterName(id);
    refresh();
  };

  const comparison = DEPARTMENTS.map(d => {
    const s = sessions.filter(x => x.trackId === ROBOTICS_TRACK_ID && x.department === d);
    return { department: d, coordinator: DEPARTMENT_COORDINATOR[d], sessionsCount: s.length, pct: cumulativePercentage(s) };
  }).sort((a, b) => b.pct - a.pct);

  return (
    <div className="space-y-5">
      <div className="card p-5 bg-gradient-to-l from-indigo-800 to-violet-700 text-white">
        <h2 className="font-bold text-lg flex items-center gap-2"><ClipboardCheck className="w-5 h-5" /> قياس مستوى معلّمي الروبوت</h2>
        <p className="text-white/80 text-sm mt-1">اختبار عيّنة عشوائية (٥ من {deptRoster.length || 30}) أسبوعياً على ناتج التعلم القابل للقياس بخطة التدريب الرسمية — استيعاب الطلاب هو مقياس أداء المعلّم.</p>
      </div>

      {/* مقارنة المعلمين */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-800 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-violet-600" /> مقارنة نسبة الإتقان بين المعلمين</h3>
          <button onClick={() => setShowReport(true)} className="flex items-center gap-1.5 bg-gray-800 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-700">
            <Printer className="w-3.5 h-3.5" /> التقرير التفصيلي للإدارة
          </button>
        </div>
        <div className="space-y-2">
          {comparison.map((c, i) => (
            <div key={c.department} className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2.5">
              <span className="w-6 text-center font-bold text-gray-400 text-sm">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-700">{c.coordinator}</p>
                <p className="text-xs text-gray-400">{c.department} — {c.sessionsCount} قياس من 17</p>
              </div>
              <span className={`text-sm font-bold px-2.5 py-1 rounded-full ${pctColor(c.pct)}`}>{c.pct}٪</span>
            </div>
          ))}
        </div>
      </div>

      {/* اختيار القسم والأسبوع */}
      <div className="card p-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          {DEPARTMENTS.map(d => (
            <button key={d} onClick={() => setDepartment(d)}
              className={`px-3 py-2 rounded-xl text-sm font-semibold ${department === d ? "bg-violet-600 text-white" : "bg-gray-100 text-gray-600"}`}>
              {d} — {DEPARTMENT_COORDINATOR[d]}
            </button>
          ))}
        </div>
        <div className="bg-gray-50 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-600">قائمة طلاب {department} ({deptRoster.length} / 30)</p>
          </div>
          <div className="flex gap-2">
            <input value={newRosterName} onChange={e => setNewRosterName(e.target.value)} onKeyDown={e => e.key === "Enter" && addName()}
              placeholder="اسم طالب جديد" className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-violet-400" />
            <button disabled={!newRosterName.trim() || rosterSaving} onClick={addName}
              className="flex items-center gap-1.5 bg-violet-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-violet-500 disabled:opacity-40">
              <UserPlus className="w-3.5 h-3.5" /> إضافة
            </button>
          </div>
          {deptRoster.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto">
              {deptRoster.map((r, i) => (
                <div key={r.id} className="flex items-center justify-between bg-white rounded-lg px-2.5 py-1.5 text-xs border border-gray-100">
                  <span className="text-gray-600">{i + 1}. {r.studentName}</span>
                  <button onClick={() => removeName(r.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-3 h-3" /></button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <label className="text-xs font-semibold text-gray-500 flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" /> الأسبوع:</label>
          <select value={week} onChange={e => setWeek(Number(e.target.value))} className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm">
            {ROBOTICS_TRAINING_WEEKS.map(w => (
              <option key={w.week} value={w.week}>أسبوع {w.week} — {w.topic} ({w.dateRange}){deptSessions.some(s => s.week === w.week) ? " ✓" : ""}</option>
            ))}
          </select>
        </div>
        {currentWeekInfo && (
          <div className="bg-violet-50 border border-violet-100 rounded-xl p-3 text-sm">
            <p className="font-bold text-violet-800">🎯 الهدف المقاس هذا الأسبوع:</p>
            <p className="text-violet-700 mt-1">{currentWeekInfo.measurableOutcome}</p>
          </div>
        )}
        {alreadyDoneThisWeek && <p className="text-xs text-amber-600">⚠️ فيه قياس مسجَّل مسبقاً لهذا الأسبوع لنفس القسم — تقدر تسجّل قياس إضافي عادي.</p>}

        <button onClick={pickFive} disabled={deptRoster.length === 0}
          className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-violet-500 disabled:opacity-40">
          <Dices className="w-4 h-4" /> اختر ٥ طلاب عشوائياً
        </button>
        {deptRoster.length === 0 && <p className="text-xs text-red-400">أضف أسماء الطلاب فوق أولاً (أو يضيفها المنسّق بنفسه من بوابته).</p>}
      </div>

      {/* استمارة التقييم */}
      {selected.length > 0 && (
        <div className="card p-4 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <label className="text-xs font-semibold text-gray-500">اسم من يجري القياس:</label>
            {ASSESSOR_QUICK_NAMES.map(n => (
              <button key={n} onClick={() => setAssessorName(n)} className={`text-xs px-2.5 py-1 rounded-full border ${assessorName === n ? "bg-violet-600 text-white border-violet-600" : "bg-white text-gray-500 border-gray-200"}`}>{n}</button>
            ))}
            <input value={assessorName} onChange={e => setAssessorName(e.target.value)} placeholder="أو اكتب اسماً آخر"
              className="border border-gray-200 rounded-lg px-2 py-1 text-xs flex-1 min-w-[140px]" />
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="border border-gray-200 rounded-lg px-2 py-1 text-xs" />
          </div>

          {selected.map(name => (
            <div key={name} className="bg-gray-50 rounded-xl p-3 space-y-2">
              <p className="font-bold text-gray-800 text-sm">{name}</p>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                {ASSESSMENT_CRITERIA.map(c => (
                  <div key={c} className="bg-white rounded-lg p-2 text-center border border-gray-100">
                    <p className="text-[11px] text-gray-500 mb-1">{c}</p>
                    <div className="flex justify-center gap-0.5">
                      {Array.from({ length: CRITERION_MAX }, (_, i) => i + 1).map(v => (
                        <button key={v} onClick={() => setScore(name, c, v)}
                          className={`w-5 h-5 rounded text-[10px] font-bold ${(scores[name]?.[c] || 0) >= v ? "bg-violet-600 text-white" : "bg-gray-100 text-gray-400"}`}>
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <input value={notes[name] || ""} onChange={e => setNotes(p => ({ ...p, [name]: e.target.value }))}
                placeholder="ملاحظة (اختياري)" className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs" />
            </div>
          ))}

          <button disabled={!canSubmit || saving} onClick={submit}
            className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-500 disabled:opacity-40">
            <Save className="w-4 h-4" /> {saving ? "جارٍ الحفظ..." : "حفظ القياس"}
          </button>
        </div>
      )}

      {/* سجل القياسات */}
      {deptSessions.length > 0 && (
        <div className="card p-4 space-y-2">
          <h3 className="font-bold text-gray-700 text-sm">سجل قياسات {department} ({deptSessions.length}) — تراكمي: <span className={`px-2 py-0.5 rounded-full ${pctColor(cumulativePercentage(deptSessions))}`}>{cumulativePercentage(deptSessions)}٪</span></h3>
          {deptSessions.map(s => (
            <div key={s.id} className="flex items-center justify-between text-xs bg-gray-50 rounded-lg px-3 py-2">
              <span className="text-gray-600">أسبوع {s.week} — {new Date(s.date).toLocaleDateString("ar-SA")} — بواسطة {s.assessorName}</span>
              <div className="flex items-center gap-2">
                <span className={`font-bold px-2 py-0.5 rounded-full ${pctColor(sessionPercentage(s))}`}>{sessionPercentage(s)}٪</span>
                <button onClick={() => removeSession(s.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showReport && <TeacherAssessmentReport sessions={sessions} onClose={() => setShowReport(false)} />}
    </div>
  );
}

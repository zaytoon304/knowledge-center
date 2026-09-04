"use client";
import { useState, useEffect } from "react";
import { Trash2, UserPlus, ClipboardCheck } from "lucide-react";
import { useAuth, CoordinatorProfile, DEPARTMENT_COORDINATOR } from "@/contexts/AuthContext";
import { getRoster, addRosterName, removeRosterName, ROBOTICS_TRACK_ID, type RosterEntry } from "@/lib/teacherAssessment";

const TARGET_COUNT = 30;

function departmentOfCoordinator(name: string): string | null {
  const entry = Object.entries(DEPARTMENT_COORDINATOR).find(([, coordName]) => coordName.trim() === name.trim());
  return entry ? entry[0] : null;
}

export default function AssessmentRoster() {
  const { user } = useAuth();
  const coord = user as CoordinatorProfile;
  const department = departmentOfCoordinator(coord.name);
  const [roster, setRoster] = useState<RosterEntry[]>([]);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);

  const refresh = () => { getRoster().then(setRoster); };
  useEffect(() => { refresh(); }, []);

  if (!department) {
    return (
      <div className="card p-10 text-center text-gray-400">
        <ClipboardCheck className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>هذي القائمة مخصّصة حالياً لمعلمي الروبوت الأربعة (منسّق كل قسم) — قسمك غير مرتبط ببرنامج قياس المعلمين بعد.</p>
      </div>
    );
  }

  const mine = roster.filter(r => r.trackId === ROBOTICS_TRACK_ID && r.department === department);

  const add = async () => {
    if (!newName.trim() || saving) return;
    setSaving(true);
    await addRosterName(ROBOTICS_TRACK_ID, department, newName, coord.name);
    setNewName("");
    setSaving(false);
    refresh();
  };

  const remove = async (id: string) => {
    await removeRosterName(id);
    refresh();
  };

  return (
    <div className="space-y-4">
      <div className="card p-5 bg-gradient-to-l from-indigo-800 to-violet-700 text-white">
        <h2 className="font-bold text-lg flex items-center gap-2"><ClipboardCheck className="w-5 h-5" /> قائمة طلاب قياس مستوى المعلّم — {department}</h2>
        <p className="text-white/80 text-sm mt-1">
          سجّل هنا أسماء الـ{TARGET_COUNT} طالب اللي راح يُختار منهم عشوائياً (٥ كل قياس) لاختبار مدى استيعابهم من خطة تدريب الروبوت الأسبوعية.
        </p>
      </div>

      <div className="card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="font-bold text-gray-700">القائمة الحالية</p>
          <span className={`text-sm font-bold px-2.5 py-1 rounded-full ${mine.length >= TARGET_COUNT ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
            {mine.length} / {TARGET_COUNT}
          </span>
        </div>
        <div className="flex gap-2">
          <input value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === "Enter" && add()}
            placeholder="اسم الطالب" className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-violet-400" />
          <button disabled={!newName.trim() || saving} onClick={add}
            className="flex items-center gap-1.5 bg-violet-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-violet-500 disabled:opacity-40">
            <UserPlus className="w-4 h-4" /> إضافة
          </button>
        </div>
        {mine.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">ما فيه أسماء مضافة بعد</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {mine.map((r, i) => (
              <div key={r.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm">
                <span className="text-gray-700">{i + 1}. {r.studentName}</span>
                <button onClick={() => remove(r.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

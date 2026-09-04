"use client";
import { useState, useEffect } from "react";
import { Lock, Clock, CheckCircle2, XCircle, Send } from "lucide-react";
import { StudentProfile, CoordinatorProfile } from "@/contexts/AuthContext";
import { cloudListen } from "@/lib/cloud";
import { DEFAULT_ROBOTICS_SKILLS, prerequisitesMet, requestSkillMastery, findSkill, type SkillMastery, type Skill } from "@/lib/skillMap";

// آخر طلب فعلي لكل مهارة (لو أُعيد الطلب بعد رفض، الأحدث هو المعتمد بالعرض — القديم يبقى بالسجل التاريخي بس)
function latestFor(masteries: SkillMastery[], studentId: string, skillId: string): SkillMastery | undefined {
  return masteries
    .filter(m => m.studentId === studentId && m.skillId === skillId)
    .sort((a, b) => b.requestedAt.localeCompare(a.requestedAt))[0];
}

export default function SkillMasteryPanel({
  student, coordinator, masteries,
}: {
  student: StudentProfile; coordinator: CoordinatorProfile; masteries: SkillMastery[];
}) {
  const [reasonDrafts, setReasonDrafts] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [skills, setSkills] = useState<Skill[]>(DEFAULT_ROBOTICS_SKILLS);

  useEffect(() => {
    const unsub = cloudListen<Skill[]>("kc_robotics_skills", data => {
      if (Array.isArray(data) && data.length > 0) setSkills(data);
    });
    return unsub;
  }, []);

  const approvedIds = new Set(
    masteries.filter(m => m.studentId === student.id && m.status === "approved").map(m => m.skillId)
  );

  const submit = async (skillId: string) => {
    const reason = (reasonDrafts[skillId] || "").trim();
    if (!reason) return;
    setSubmitting(skillId);
    await requestSkillMastery({
      studentId: student.id, studentName: student.name, skillId,
      coordinatorId: coordinator.id, coordinatorName: coordinator.name, reason,
    });
    setReasonDrafts(p => ({ ...p, [skillId]: "" }));
    setSubmitting(null);
  };

  return (
    <div className="space-y-2.5 bg-violet-50/50 rounded-xl p-3 border border-violet-100">
      {skills.map(skill => {
        const approved = approvedIds.has(skill.id);
        const latest = latestFor(masteries, student.id, skill.id);
        const unlocked = approved || prerequisitesMet(skill, approvedIds);
        const isPending = latest?.status === "pending";
        const isRejected = latest?.status === "rejected" && !approved;

        return (
          <div key={skill.id} className="bg-white rounded-lg p-3 border border-gray-100">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{skill.emoji}</span>
                <p className="text-sm font-bold text-gray-700">{skill.title}</p>
              </div>
              {approved && <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600"><CheckCircle2 className="w-3.5 h-3.5" /> معتمدة</span>}
              {!approved && isPending && <span className="flex items-center gap-1 text-xs font-semibold text-amber-600"><Clock className="w-3.5 h-3.5" /> بانتظار مراجعة المشرف</span>}
              {!approved && !isPending && !unlocked && <span className="flex items-center gap-1 text-xs font-semibold text-gray-400"><Lock className="w-3.5 h-3.5" /> مقفلة</span>}
            </div>

            {!approved && !isPending && unlocked && (
              <div className="mt-2 space-y-1.5">
                {isRejected && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" /> آخر طلب رُفض{latest?.reviewerNote ? `: ${latest.reviewerNote}` : ""} — تقدر تطلب من جديد
                  </p>
                )}
                <textarea
                  value={reasonDrafts[skill.id] || ""}
                  onChange={e => setReasonDrafts(p => ({ ...p, [skill.id]: e.target.value }))}
                  placeholder="اكتب دليل/سبب إتقان الطالب لهذي المهارة (مثال: نفّذ مشروعاً حياً يقرأ حساس المسافة ويطبع النتيجة بدقة)"
                  className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-violet-400 bg-gray-50 resize-none"
                  rows={2}
                />
                <button
                  disabled={!reasonDrafts[skill.id]?.trim() || submitting === skill.id}
                  onClick={() => submit(skill.id)}
                  className="flex items-center gap-1.5 bg-violet-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-violet-500 disabled:opacity-40"
                >
                  <Send className="w-3.5 h-3.5" /> {submitting === skill.id ? "جارٍ الإرسال..." : "أرسل للمشرف للاعتماد"}
                </button>
              </div>
            )}

            {!approved && !isPending && !unlocked && (
              <p className="text-[11px] text-gray-400 mt-1">
                يحتاج إتقان: {skill.prerequisites.map(id => findSkill(skills, id)?.title).join(" و ")}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

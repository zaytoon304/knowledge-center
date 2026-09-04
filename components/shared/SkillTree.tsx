"use client";
import { Lock, CheckCircle2, Circle } from "lucide-react";
import { ROBOTICS_SKILLS, prerequisitesMet, type Skill } from "@/lib/skillMap";

// شجرة المهارات مرسومة كمستويات (tiers) بدل شجرة حقيقية متفرعة بصرياً — أبسط وأثبت بالطباعة
// والجوال (نفس فلسفة الخريطة الذهنية بأدوات الذكاء الاصطناعي: بطاقات لا رسم شجري حقيقي).
const TIERS: string[][] = [
  ["basics"],
  ["sensors", "motors", "logic"],
  ["integration"],
  ["advanced"],
];

function SkillNode({ skill, approved, unlocked }: { skill: Skill; approved: boolean; unlocked: boolean }) {
  return (
    <div
      className={`rounded-2xl p-4 border-2 transition-all ${
        approved
          ? "bg-gradient-to-br from-emerald-600 to-teal-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/20"
          : unlocked
          ? "bg-white border-orange-300 text-gray-800"
          : "bg-gray-50 border-gray-200 text-gray-400"
      }`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-2xl">{skill.emoji}</span>
        {approved ? (
          <CheckCircle2 className="w-5 h-5" />
        ) : unlocked ? (
          <Circle className="w-5 h-5 text-orange-400" />
        ) : (
          <Lock className="w-4 h-4" />
        )}
      </div>
      <p className={`font-bold text-sm leading-tight ${approved ? "" : unlocked ? "text-gray-800" : "text-gray-400"}`}>{skill.title}</p>
      <p className={`text-xs mt-1 leading-relaxed ${approved ? "text-white/80" : unlocked ? "text-gray-500" : "text-gray-350"}`}>{skill.description}</p>
      {!approved && !unlocked && <p className="text-[11px] mt-2 text-gray-400">🔒 يحتاج إتقان المهارة السابقة أولاً</p>}
      {!approved && unlocked && <p className="text-[11px] mt-2 text-orange-500 font-semibold">جاهزة — لسه ما اعتُمدت</p>}
    </div>
  );
}

export default function SkillTree({ approvedSkillIds }: { approvedSkillIds: string[] }) {
  const approvedSet = new Set(approvedSkillIds);
  const masteredCount = ROBOTICS_SKILLS.filter(s => approvedSet.has(s.id)).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-800">🤖 شجرة مهارات الروبوتات</h3>
        <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full">
          {masteredCount} / {ROBOTICS_SKILLS.length} مهارة
        </span>
      </div>
      <div className="space-y-3">
        {TIERS.map((tierIds, tierIdx) => (
          <div key={tierIdx} className={`grid gap-3 ${tierIds.length === 1 ? "grid-cols-1 max-w-xs mx-auto" : "grid-cols-1 sm:grid-cols-3"}`}>
            {tierIds.map(id => {
              const skill = ROBOTICS_SKILLS.find(s => s.id === id)!;
              const approved = approvedSet.has(id);
              const unlocked = approved || prerequisitesMet(skill, approvedSet);
              return <SkillNode key={id} skill={skill} approved={approved} unlocked={unlocked} />;
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

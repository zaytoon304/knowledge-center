"use client";
import { useState, useEffect } from "react";
import { Lock, CheckCircle2, Circle } from "lucide-react";
import { cloudListen } from "@/lib/cloud";
import { DEFAULT_ROBOTICS_SKILLS, prerequisitesMet, skillTiers, type Skill } from "@/lib/skillMap";

// شجرة المهارات مرسومة كمستويات (tiers) بدل شجرة حقيقية متفرعة بصرياً — أبسط وأثبت بالطباعة
// والجوال (نفس فلسفة الخريطة الذهنية بأدوات الذكاء الاصطناعي: بطاقات لا رسم شجري حقيقي).
// المستويات تُحسب ديناميكياً (skillTiers) من قائمة المهارات الفعلية المخزّنة بالسحابة —
// تتكيّف تلقائياً لو الأدمن أضاف/عدّل/حذف مهارة من لوحة الإدارة.
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
  const [skills, setSkills] = useState<Skill[]>(DEFAULT_ROBOTICS_SKILLS);

  useEffect(() => {
    const unsub = cloudListen<Skill[]>("kc_robotics_skills", data => {
      if (Array.isArray(data) && data.length > 0) setSkills(data);
    });
    return unsub;
  }, []);

  const approvedSet = new Set(approvedSkillIds);
  const masteredCount = skills.filter(s => approvedSet.has(s.id)).length;
  const tiers = skillTiers(skills);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-800">🤖 شجرة مهارات الروبوتات</h3>
        <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full">
          {masteredCount} / {skills.length} مهارة
        </span>
      </div>
      <div className="space-y-3">
        {tiers.map((tierSkills, tierIdx) => (
          <div key={tierIdx} className={`grid gap-3 ${tierSkills.length === 1 ? "grid-cols-1 max-w-xs mx-auto" : "grid-cols-1 sm:grid-cols-3"}`}>
            {tierSkills.map(skill => {
              const approved = approvedSet.has(skill.id);
              const unlocked = approved || prerequisitesMet(skill, approvedSet);
              return <SkillNode key={skill.id} skill={skill} approved={approved} unlocked={unlocked} />;
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

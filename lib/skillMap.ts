"use client";
import { cloudGet, cloudSet, cloudPush, cloudTransact } from "./cloud";

// شجرة مهارات الروبوتات — ثابتة بالكود حالياً (لا تُعدَّل من لوحة الإدارة)، تربط كل مهارة
// بالمهارة/المهارات اللي لازم تُتقَن قبلها أولاً (prerequisites) — هذا اللي يرسم "الشجرة"
// بصرياً ببوابة الطالب: أساسيات ← 3 فروع ← دمج مشروع ← برمجة متقدمة.
export interface Skill {
  id: string;
  title: string;
  description: string;
  emoji: string;
  prerequisites: string[];
}

export const ROBOTICS_SKILLS: Skill[] = [
  { id: "basics", title: "أساسيات الأردوينو", description: "توصيل اللوحة بالحاسب، رفع أول كود، فهم منافذ GPIO", emoji: "🔌", prerequisites: [] },
  { id: "sensors", title: "القراءة من الحساسات", description: "توصيل حساس حقيقي (مسافة، حرارة...) وقراءة بياناته بالكود", emoji: "📡", prerequisites: ["basics"] },
  { id: "motors", title: "التحكم بالمحركات", description: "تحريك سيرفو أو محرك DC بالكود بدقة وأمان", emoji: "⚙️", prerequisites: ["basics"] },
  { id: "logic", title: "البرمجة الشرطية والحلقات", description: "استخدام الشروط (if) والحلقات (for/while) لحل مشكلة برمجية حقيقية", emoji: "🧠", prerequisites: ["basics"] },
  { id: "integration", title: "دمج المشروع", description: "ربط حساس ومحرك معاً بمشروع واحد يتفاعل فعلياً مع بيئته", emoji: "🤖", prerequisites: ["sensors", "motors"] },
  { id: "advanced", title: "البرمجة المتقدمة", description: "مشروع متكامل بمستوى مسابقة، أو اتصال لاسلكي بين لوحتين", emoji: "🚀", prerequisites: ["integration", "logic"] },
];

export function getSkill(id: string): Skill | undefined {
  return ROBOTICS_SKILLS.find(s => s.id === id);
}

// هل المهارات اللي لازم تُتقَن قبل هذي المهارة كلها معتمدة (approved) فعلاً؟ — يمنع المنسّق من
// طلب مهارة متقدمة قبل الأساسية، ويحافظ على شكل الشجرة منطقياً دائماً.
export function prerequisitesMet(skill: Skill, approvedSkillIds: Set<string>): boolean {
  return skill.prerequisites.every(p => approvedSkillIds.has(p));
}

export type MasteryStatus = "pending" | "approved" | "rejected";

export interface SkillMastery {
  id: string;
  studentId: string;
  studentName: string;
  skillId: string;
  coordinatorId: string;
  coordinatorName: string;
  reason: string; // دليل/سبب الإتقان يكتبه المنسّق — يراجعه المشرف قبل الاعتماد
  status: MasteryStatus;
  requestedAt: string;
  reviewedAt?: string;
  reviewerNote?: string;
}

const KEY = "kc_skill_mastery";

export async function getSkillMasteries(): Promise<SkillMastery[]> {
  const data = await cloudGet<SkillMastery[]>(KEY);
  return Array.isArray(data) ? data : [];
}

// المنسّق يطلب اعتماد مهارة لطالب بقسمه — تبقى "بانتظار المراجعة" لين المشرف يوافق عليها،
// ما تظهر ببوابة الطالب/ولي الأمر ولا حائط الشرف إلا بعد الاعتماد.
export async function requestSkillMastery(
  data: Omit<SkillMastery, "id" | "status" | "requestedAt">
): Promise<boolean> {
  const item: SkillMastery = { ...data, id: Date.now().toString(), status: "pending", requestedAt: new Date().toISOString() };
  return cloudPush(KEY, item);
}

export async function reviewSkillMastery(id: string, approve: boolean, reviewerNote?: string): Promise<boolean> {
  return cloudTransact<SkillMastery[]>(KEY, current => {
    const list = Array.isArray(current) ? current : [];
    return list.map(m => m.id === id
      ? { ...m, status: (approve ? "approved" : "rejected") as MasteryStatus, reviewedAt: new Date().toISOString(), reviewerNote: reviewerNote || "" }
      : m);
  });
}

export async function deleteSkillMastery(id: string): Promise<boolean> {
  return cloudTransact<SkillMastery[]>(KEY, current => {
    const list = Array.isArray(current) ? current : [];
    return list.filter(m => m.id !== id);
  });
}

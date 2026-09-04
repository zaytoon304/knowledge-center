"use client";
import { cloudGet, cloudSet, cloudPush, cloudTransact } from "./cloud";

// شجرة مهارات الروبوتات — تُدار الآن من لوحة الإدارة (تبويب "إتقان المهارات") وتُخزَّن بالسحابة
// (kc_robotics_skills)، تربط كل مهارة بالمهارة/المهارات اللي لازم تُتقَن قبلها أولاً
// (prerequisites) — هذا اللي يرسم "الشجرة" بصرياً ببوابة الطالب. لو ما فيه أي تخصيص محفوظ
// بالسحابة بعد (أول استخدام)، تُستخدم القائمة الافتراضية DEFAULT_ROBOTICS_SKILLS تلقائياً.
export interface Skill {
  id: string;
  title: string;
  description: string;
  emoji: string;
  prerequisites: string[];
}

export const DEFAULT_ROBOTICS_SKILLS: Skill[] = [
  { id: "basics", title: "أساسيات الأردوينو", description: "توصيل اللوحة بالحاسب، رفع أول كود، فهم منافذ GPIO", emoji: "🔌", prerequisites: [] },
  { id: "sensors", title: "القراءة من الحساسات", description: "توصيل حساس حقيقي (مسافة، حرارة...) وقراءة بياناته بالكود", emoji: "📡", prerequisites: ["basics"] },
  { id: "motors", title: "التحكم بالمحركات", description: "تحريك سيرفو أو محرك DC بالكود بدقة وأمان", emoji: "⚙️", prerequisites: ["basics"] },
  { id: "logic", title: "البرمجة الشرطية والحلقات", description: "استخدام الشروط (if) والحلقات (for/while) لحل مشكلة برمجية حقيقية", emoji: "🧠", prerequisites: ["basics"] },
  { id: "integration", title: "دمج المشروع", description: "ربط حساس ومحرك معاً بمشروع واحد يتفاعل فعلياً مع بيئته", emoji: "🤖", prerequisites: ["sensors", "motors"] },
  { id: "advanced", title: "البرمجة المتقدمة", description: "مشروع متكامل بمستوى مسابقة، أو اتصال لاسلكي بين لوحتين", emoji: "🚀", prerequisites: ["integration", "logic"] },
];

const SKILLS_KEY = "kc_robotics_skills";

export async function getSkillDefs(): Promise<Skill[]> {
  const data = await cloudGet<Skill[]>(SKILLS_KEY);
  return Array.isArray(data) && data.length > 0 ? data : DEFAULT_ROBOTICS_SKILLS;
}

export async function saveSkillDefs(skills: Skill[]): Promise<boolean> {
  await cloudSet(SKILLS_KEY, skills);
  return true;
}

export function findSkill(skills: Skill[], id: string): Skill | undefined {
  return skills.find(s => s.id === id);
}

// هل المهارات اللي لازم تُتقَن قبل هذي المهارة كلها معتمدة (approved) فعلاً؟ — يمنع المنسّق من
// طلب مهارة متقدمة قبل الأساسية، ويحافظ على شكل الشجرة منطقياً دائماً.
export function prerequisitesMet(skill: Skill, approvedSkillIds: Set<string>): boolean {
  return skill.prerequisites.every(p => approvedSkillIds.has(p));
}

// يرتّب المهارات لمستويات (طبقات) حسب أعمق مسار متطلبات — يستخدمها عرض الشجرة (SkillTree)
// ليرسم صفوفاً منطقية حتى لو الأدمن أضاف/عدّل مهارات وما عاد الشكل ثابتاً بالكود.
export function skillTiers(skills: Skill[]): Skill[][] {
  const tierOf = new Map<string, number>();
  const byId = new Map(skills.map(s => [s.id, s]));
  function resolve(id: string, seen: Set<string>): number {
    if (tierOf.has(id)) return tierOf.get(id)!;
    if (seen.has(id)) return 0; // حماية من حلقة متطلبات دائرية بالغلط
    const skill = byId.get(id);
    if (!skill || skill.prerequisites.length === 0) { tierOf.set(id, 0); return 0; }
    const t = 1 + Math.max(0, ...skill.prerequisites.map(p => byId.has(p) ? resolve(p, new Set(seen).add(id)) : -1));
    tierOf.set(id, t);
    return t;
  }
  skills.forEach(s => resolve(s.id, new Set()));
  const maxTier = Math.max(0, ...Array.from(tierOf.values()));
  const tiers: Skill[][] = Array.from({ length: maxTier + 1 }, () => []);
  skills.forEach(s => tiers[tierOf.get(s.id) || 0].push(s));
  return tiers.filter(t => t.length > 0);
}

// إدارة قائمة المهارات من لوحة الإدارة — تعمل دائماً على النسخة الكاملة الحالية (افتراضية أو
// مخصَّصة) عشان أول تعديل ما "يمسح" باقي المهارات الافتراضية بالغلط.
export async function addSkillDef(skill: Omit<Skill, "id">): Promise<boolean> {
  const current = await getSkillDefs();
  const item: Skill = { ...skill, id: Date.now().toString() };
  return saveSkillDefs([...current, item]);
}

export async function updateSkillDef(id: string, patch: Omit<Skill, "id">): Promise<boolean> {
  const current = await getSkillDefs();
  return saveSkillDefs(current.map(s => s.id === id ? { ...patch, id } : s));
}

// حذف مهارة يشيلها أيضاً من قائمة متطلبات أي مهارة ثانية تعتمد عليها (تحرير آمن، بدون سلاسل معطوبة)
export async function deleteSkillDef(id: string): Promise<boolean> {
  const current = await getSkillDefs();
  const next = current.filter(s => s.id !== id).map(s => ({ ...s, prerequisites: s.prerequisites.filter(p => p !== id) }));
  return saveSkillDefs(next);
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

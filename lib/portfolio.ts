"use client";
import { cloudGet } from "./cloud";

// "رحلتي" — بورتفوليو نمو الطالب: يجمع كل إنجازاته المتفرقة بالمنصة (شهادات، مهارات
// مُتقنة، مشاريع) بترتيب زمني واحد، بدل ما تكون متبعثرة بأقسام منفصلة. لا يحتاج نظام رفع
// جديد — يستخدم نفس البيانات الموجودة أصلاً بالمنصة (نفس فلسفة حائط الشرف الحي).
export interface PortfolioEvent {
  id: string;
  date: string; // ISO
  kind: "certificate" | "skill" | "project" | "video";
  title: string;
  description: string;
  emoji: string;
  image?: string; // اختياري — لو فيه صورة/لقطة مرتبطة بالحدث
}

interface CertRecord { id: string; studentId: string; title: string; description: string; date: string; type: string; createdAt: string }
interface SkillMasteryRecord { id: string; studentId: string; skillId: string; status: string; reviewedAt?: string }
interface KanbanRecord { id: string; studentId: string; title: string; description: string; stage: string; createdAt: string }
interface VideoResponseRecord { id: string; studentId: string; promptTitle: string; createdAt: string; thumbnail?: string }

const CERT_EMOJI: Record<string, string> = { program: "📚", competition: "🏆", achievement: "⭐", participation: "🌟" };
const STAGE_LABEL: Record<string, string> = { idea: "فكرة", design: "تصميم", prototype: "نموذج أولي", testing: "اختبار", final: "عرض نهائي" };

export async function buildStudentTimeline(studentId: string): Promise<PortfolioEvent[]> {
  const [certs, skillMasteries, skillDefsData, kanban, videos] = await Promise.all([
    cloudGet<CertRecord[]>("kc_certificates"),
    cloudGet<SkillMasteryRecord[]>("kc_skill_mastery"),
    cloudGet<{ id: string; title: string; emoji: string }[]>("kc_robotics_skills"),
    cloudGet<KanbanRecord[]>("kc_kanban"),
    cloudGet<VideoResponseRecord[]>("kc_video_responses"),
  ]);

  const events: PortfolioEvent[] = [];

  (Array.isArray(certs) ? certs : []).filter(c => c.studentId === studentId).forEach(c => {
    events.push({ id: `cert-${c.id}`, date: c.date || c.createdAt, kind: "certificate", title: c.title, description: c.description || "", emoji: CERT_EMOJI[c.type] || "🎓" });
  });

  const skillTitle = (id: string) => skillDefsData?.find(s => s.id === id)?.title || id;
  const skillEmoji = (id: string) => skillDefsData?.find(s => s.id === id)?.emoji || "🤖";
  (Array.isArray(skillMasteries) ? skillMasteries : [])
    .filter(m => m.studentId === studentId && m.status === "approved" && m.reviewedAt)
    .forEach(m => {
      events.push({ id: `skill-${m.id}`, date: m.reviewedAt!, kind: "skill", title: `أتقن مهارة: ${skillTitle(m.skillId)}`, description: "معتمدة من المشرف", emoji: skillEmoji(m.skillId) });
    });

  (Array.isArray(kanban) ? kanban : []).filter(k => k.studentId === studentId).forEach(k => {
    events.push({ id: `project-${k.id}`, date: k.createdAt, kind: "project", title: k.title, description: `مرحلة المشروع: ${STAGE_LABEL[k.stage] || k.stage}`, emoji: "💡" });
  });

  (Array.isArray(videos) ? videos : []).filter(v => v.studentId === studentId).forEach(v => {
    events.push({ id: `video-${v.id}`, date: v.createdAt, kind: "video", title: v.promptTitle, description: "شرح فيديو من الطالب", emoji: "🎬", image: v.thumbnail });
  });

  return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

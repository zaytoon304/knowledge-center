"use client";
import { cloudGet, cloudSet, cloudPush, cloudTransact } from "./cloud";

// نظام "قياس مستوى المعلمين" — بدل تقييم المعلّم مباشرة، نختبر عيّنة عشوائية من طلابه (٥ من
// أصل ٣٠) أسبوعياً على "ناتج التعلم القابل للقياس" المحدد بخطة التدريب الرسمية (١٧ أسبوع)،
// واستيعاب الطلاب الفعلي هو مقياس أداء المعلّم. مبني ليدعم أكثر من مسار تدريبي (روبوت، موهبة...)
// لاحقاً — المسار الوحيد الجاهز الآن "robotics" منقول حرفياً من "خطة المسار التدريبي العملي
// للروبوت" الرسمية (17 أسبوعاً، 31 أغسطس – 27 ديسمبر 2026).

export interface CurriculumWeek {
  week: number;
  dateRange: string;
  topic: string;
  practical: string;
  measurableOutcome: string; // "ناتج التعلم القابل للقياس" — الأساس اللي يُختبر فيه الطلاب
}

export const ROBOTICS_TRACK_ID = "robotics";

export const ROBOTICS_TRAINING_WEEKS: CurriculumWeek[] = [
  { week: 1, dateRange: "31 أغسطس – 6 سبتمبر", topic: "التعريف بـ Arduino وTinkercad", practical: "التعرف على Arduino Uno والمنافذ وBreadboard وتنفيذ أول دائرة", measurableOutcome: "أن يتمكن الطالب من إنشاء دائرة بسيطة على Tinkercad وتوصيلها بصورة صحيحة" },
  { week: 2, dateRange: "7 – 13 سبتمبر", topic: "LED والبرمجة الأساسية", practical: "تشغيل LED وتنفيذ Blink", measurableOutcome: "أن يكتب الطالب برنامج تشغيل وإطفاء LED ويعدل زمن الوميض" },
  { week: 3, dateRange: "14 – 20 سبتمبر", topic: "التحكم في عدة مخارج", practical: "تنفيذ إشارة مرور باستخدام 3 LEDs", measurableOutcome: "أن ينفذ الطالب تسلسلًا صحيحًا للأحمر والأصفر والأخضر" },
  { week: 4, dateRange: "21 – 27 سبتمبر", topic: "Push Button", practical: "التحكم في LED باستخدام زر", measurableOutcome: "أن يقرأ الطالب حالة الزر ويستخدمها للتحكم في مخرج" },
  { week: 5, dateRange: "28 سبتمبر – 4 أكتوبر", topic: "دمج Button + LEDs", practical: "إشارة مرور يتم التحكم فيها بالزر", measurableOutcome: "أن يدمج الطالب أكثر من مكوّن في دائرة واحدة" },
  { week: 6, dateRange: "5 – 11 أكتوبر", topic: "Buzzer", practical: "إصدار تنبيهات صوتية باستخدام البازر", measurableOutcome: "أن يشغل الطالب البازر ويتحكم في توقيت ونمط الصوت" },
  { week: 7, dateRange: "12 – 18 أكتوبر", topic: "دمج المكونات الأساسية", practical: "نظام إنذار باستخدام Button + LED + Buzzer", measurableOutcome: "أن ينفذ الطالب نظامًا يستجيب لمدخل ويصدر تنبيهًا ضوئيًا وصوتيًا" },
  { week: 8, dateRange: "19 – 25 أكتوبر", topic: "حساس الضوء LDR", practical: "تشغيل LED تلقائيًا عند انخفاض الإضاءة", measurableOutcome: "أن يقرأ الطالب قيمة Analog ويستخدمها لاتخاذ قرار" },
  { week: 9, dateRange: "26 أكتوبر – 1 نوفمبر", topic: "Potentiometer", practical: "التحكم في شدة إضاءة LED وقراءة القيم", measurableOutcome: "أن يقرأ الطالب قيمة متغيرة ويستخدمها للتحكم في المخرج" },
  { week: 10, dateRange: "2 – 8 نوفمبر", topic: "حساس الحرارة", practical: "قراءة درجة الحرارة وربطها بمؤشر ضوئي أو صوتي", measurableOutcome: "أن يقرأ الطالب درجة الحرارة ويحدد حالة بناءً على قيمة محددة" },
  { week: 11, dateRange: "9 – 15 نوفمبر", topic: "حساس رطوبة التربة", practical: "نظام تنبيه عند جفاف التربة", measurableOutcome: "أن ينفذ الطالب نظامًا يميز بين التربة الجافة والرطبة باستخدام LED/Buzzer" },
  { week: 12, dateRange: "16 – 22 نوفمبر", topic: "Ultrasonic Sensor", practical: "قياس المسافة باستخدام HC-SR04", measurableOutcome: "أن يقرأ الطالب المسافة ويعرض القيم عبر Serial Monitor" },
  { week: 13, dateRange: "23 – 29 نوفمبر", topic: "دمج الحساسات والمخرجات", practical: "نظام إنذار عند اقتراب جسم", measurableOutcome: "أن يربط الطالب قراءة الحساس بالـLED والبازر باستخدام شروط برمجية" },
  { week: 14, dateRange: "30 نوفمبر – 6 ديسمبر", topic: "Servo Motor", practical: "التحكم في زاوية السيرفو", measurableOutcome: "أن يتحكم الطالب في السيرفو بزوايا مختلفة" },
  { week: 15, dateRange: "7 – 13 ديسمبر", topic: "Sensor + Servo", practical: "بوابة تفتح تلقائيًا عند اقتراب شخص", measurableOutcome: "أن ينفذ الطالب نظامًا يجمع بين الحساس والسيرفو" },
  { week: 16, dateRange: "14 – 20 ديسمبر", topic: "التكامل بين المكونات", practical: "تنفيذ مشروع تطبيقي مصغر", measurableOutcome: "أن يصمم الطالب دائرة تجمع عدة مكونات وتعمل بصورة مستقلة" },
  { week: 17, dateRange: "21 – 27 ديسمبر", topic: "المشروع النهائي والتقييم", practical: "تنفيذ وعرض مشروع روبوت/نظام ذكي", measurableOutcome: "أن ينفذ الطالب مشروعًا مستقلًا ويشرح الدائرة والكود وآلية العمل" },
];

// نفس معيار الإتقان المذكور بالخطة الرسمية حرفياً (القسم سادسًا) — أساس كل استمارة تقييم
export const ASSESSMENT_CRITERIA = ["الفهم", "المحاكاة", "التنفيذ العملي", "البرمجة", "حل المشكلات"] as const;
export type AssessmentCriterion = typeof ASSESSMENT_CRITERIA[number];
export const CRITERION_MAX = 5;

export interface StudentScore {
  studentName: string;
  scores: Record<string, number>; // AssessmentCriterion -> 1..5
  note?: string;
}

export interface AssessmentSession {
  id: string;
  trackId: string; // "robotics"
  department: string; // نفس DEPARTMENTS بـ AuthContext.tsx
  week: number;
  date: string; // تاريخ إجراء القياس فعلياً
  assessorName: string; // من أجرى القياس (المشرف العام أو المساعد)
  studentScores: StudentScore[];
  createdAt: string;
}

const ROSTER_KEY = "kc_assessment_roster";
const SESSIONS_KEY = "kc_assessment_sessions";

export interface RosterEntry {
  id: string;
  trackId: string;
  department: string;
  studentName: string;
  addedBy: string;
  createdAt: string;
}

export async function getRoster(): Promise<RosterEntry[]> {
  const data = await cloudGet<RosterEntry[]>(ROSTER_KEY);
  return Array.isArray(data) ? data : [];
}

export async function addRosterName(trackId: string, department: string, studentName: string, addedBy: string): Promise<boolean> {
  const item: RosterEntry = { id: Date.now().toString(), trackId, department, studentName: studentName.trim(), addedBy, createdAt: new Date().toISOString() };
  return cloudPush(ROSTER_KEY, item);
}

export async function removeRosterName(id: string): Promise<boolean> {
  return cloudTransact<RosterEntry[]>(ROSTER_KEY, current => {
    const list = Array.isArray(current) ? current : [];
    return list.filter(r => r.id !== id);
  });
}

export async function getSessions(): Promise<AssessmentSession[]> {
  const data = await cloudGet<AssessmentSession[]>(SESSIONS_KEY);
  return Array.isArray(data) ? data : [];
}

export async function saveSession(session: Omit<AssessmentSession, "id" | "createdAt">): Promise<boolean> {
  const item: AssessmentSession = { ...session, id: Date.now().toString(), createdAt: new Date().toISOString() };
  return cloudPush(SESSIONS_KEY, item);
}

export async function deleteSession(id: string): Promise<boolean> {
  return cloudTransact<AssessmentSession[]>(SESSIONS_KEY, current => {
    const list = Array.isArray(current) ? current : [];
    return list.filter(s => s.id !== id);
  });
}

// يختار عدداً عشوائياً من أسماء القائمة (بدون تكرار بنفس الاختيار) — نفس روح "خمسة من ثلاثين" بالخطة
export function pickRandomStudents(names: string[], count = 5): string[] {
  const pool = [...names];
  const picked: string[] = [];
  while (pool.length > 0 && picked.length < count) {
    const i = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(i, 1)[0]);
  }
  return picked;
}

// نسبة إتقان جلسة واحدة (٪) — متوسط كل درجات المعايير لكل الطلاب المختبَرين بهذي الجلسة
export function sessionPercentage(session: AssessmentSession): number {
  const all = session.studentScores.flatMap(s => Object.values(s.scores));
  if (all.length === 0) return 0;
  const avg = all.reduce((a, b) => a + b, 0) / all.length;
  return Math.round((avg / CRITERION_MAX) * 100);
}

// نسبة الإتقان التراكمية لمعلّم/قسم معيّن عبر كل الجلسات المسجّلة له حتى الآن
export function cumulativePercentage(sessions: AssessmentSession[]): number {
  if (sessions.length === 0) return 0;
  const avg = sessions.reduce((a, s) => a + sessionPercentage(s), 0) / sessions.length;
  return Math.round(avg);
}

// تاريخ بداية المسار الرسمي (من الخطة) — يُستخدم لاقتراح "الأسبوع الحالي" تلقائياً بدون إدخال يدوي
export const TRACK_START_DATE = "2026-08-31";

export function suggestedCurrentWeek(): number {
  const start = new Date(TRACK_START_DATE);
  const diffDays = Math.floor((Date.now() - start.getTime()) / (1000 * 60 * 60 * 24));
  const week = Math.floor(diffDays / 7) + 1;
  return Math.min(ROBOTICS_TRAINING_WEEKS.length, Math.max(1, week));
}

export interface InterestSurveyResponse {
  id: string;
  parentName: string;
  parentPhone: string;
  childName: string;
  grade: string;
  section: "عام" | "تحفيظ";
  classroom: string;
  interests: string[];
  notes: string;
  submittedAt: string;
}

// كل صف (من الأول الابتدائي للثالث الثانوي) مقسّم لـ6 شعب بالمدرسة
export const CLASSROOMS = ["1", "2", "3", "4", "5", "6"];

// برامج الوحدة — كل تصنيف رئيسي يكشف عن خيارات فرعية أدق عند اختياره
export interface ProgramCategory {
  id: string;
  subItems: string[];
}

export const PROGRAM_CATEGORIES: ProgramCategory[] = [
  {
    id: "الروبوت والذكاء الاصطناعي وSTEAM",
    subItems: ["تركيب ليجو", "سكراتش", "البرمجة", "صناعة الألعاب", "صناعة التطبيقات", "تعلم الروبوت", "STEAM"],
  },
  {
    id: "الموهبة والابتكار",
    subItems: ["مسرح", "إنشاد", "شعر", "الحساب الذهني", "مهارات التفكير", "الرسم والتصميم", "الإلقاء وفن الخطابة", "الكتابة الإبداعية", "التصوير"],
  },
  {
    id: "المناشط الطلابية",
    subItems: ["سباحة", "كرة قدم", "لغة إنجليزية", "حاسب آلي", "كشافة", "تصوير فوتوغرافي", "الخط العربي", "التثقيف الصحي", "بادر التطوعي", "مركز التدريب", "التوجيه والسلوك", "النادي العلمي", "الإذاعة المدرسية"],
  },
];

// يُسمح باختيار نشاطين اثنين فقط من "المناشط الطلابية" — بقية الأقسام بلا حد أقصى
export const ACTIVITIES_CATEGORY_ID = "المناشط الطلابية";
export const MAX_ACTIVITY_PICKS = 2;

// مسابقات مفتوحة للجميع دون اشتراطات مسبقة
export const OPEN_COMPETITIONS = [
  "مسابقة بيبراس الدولية للمعلوماتية",
  "مسابقة كانجارو في الرياضيات",
  "مسابقة نسمو",
];

// مسابقات تحتاج تدريباً مسبقاً واجتياز شروط معيّنة للاشتراك فيها
export const TRAINING_COMPETITIONS = [
  "مسابقة الأولمبياد العالمي للروبوت WRO",
  "مسابقة الأفرو آسيوي للروبوت والذكاء الاصطناعي",
  "مسابقة RoboRAVE",
];

export const ALL_INTEREST_ITEMS = [
  ...PROGRAM_CATEGORIES.flatMap(c => [c.id, ...c.subItems]),
  ...OPEN_COMPETITIONS,
  ...TRAINING_COMPETITIONS,
];

// تصنيف الردود لتقرير مطبوع — المرحلة الابتدائية تُفصل عام/تحفيظ، والمتوسطة والثانوية كل واحدة تُجمع سوا
export type SurveyGroupKey = "ابتدائي-عام" | "ابتدائي-تحفيظ" | "متوسط" | "ثانوي" | "غير محدد";

export function gradeTier(grade: string): "ابتدائي" | "متوسط" | "ثانوي" | "غير محدد" {
  if (grade.includes("الابتدائي")) return "ابتدائي";
  if (grade.includes("المتوسط")) return "متوسط";
  if (grade.includes("الثانوي")) return "ثانوي";
  return "غير محدد";
}

export function surveyGroupKey(r: Pick<InterestSurveyResponse, "grade" | "section">): SurveyGroupKey {
  const tier = gradeTier(r.grade);
  if (tier === "ابتدائي") return r.section === "تحفيظ" ? "ابتدائي-تحفيظ" : "ابتدائي-عام";
  if (tier === "متوسط") return "متوسط";
  if (tier === "ثانوي") return "ثانوي";
  return "غير محدد";
}

export const SURVEY_GROUPS: { key: SurveyGroupKey; label: string }[] = [
  { key: "ابتدائي-عام", label: "الابتدائي - عام" },
  { key: "ابتدائي-تحفيظ", label: "الابتدائي - تحفيظ" },
  { key: "متوسط", label: "المتوسط" },
  { key: "ثانوي", label: "الثانوي" },
];

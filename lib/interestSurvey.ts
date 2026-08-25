export interface InterestSurveyResponse {
  id: string;
  parentName: string;
  parentPhone: string;
  childName: string;
  grade: string;
  section: "عام" | "تحفيظ";
  interests: string[];
  notes: string;
  submittedAt: string;
}

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
    subItems: ["مسرح", "إنشاد", "شعر", "الحساب الذهني", "مهارات التفكير", "الرسم والتصميم", "الخط العربي", "الإلقاء وفن الخطابة", "الكتابة الإبداعية", "التصوير"],
  },
];

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

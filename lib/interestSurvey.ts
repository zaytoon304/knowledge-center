export interface InterestSurveyResponse {
  id: string;
  parentName: string;
  parentPhone: string;
  childName: string;
  grade: string;
  interests: string[];
  notes: string;
  submittedAt: string;
}

export const COMPETITION_INTERESTS = [
  "مسابقة الأولمبياد العالمي للروبوت WRO",
  "مسابقة بيبراس الدولية للمعلوماتية",
  "مسابقة كانجارو في الرياضيات",
  "مسابقة نسمو",
  "مسابقة الأفرو آسيوي للروبوت والذكاء الاصطناعي",
  "مسابقة RoboRAVE",
];

export const PROGRAM_INTERESTS = [
  "الحساب الذهني",
  "الروبوت والليجو",
  "البرمجة",
  "الموهبة والابتكار",
  "صناعة الألعاب",
  "صناعة التطبيقات",
  "تعلم الذكاء الاصطناعي",
  "تحفيظ",
];

export const TALENT_INTERESTS = ["مسرح", "إنشاد", "تمثيل", "شعر"];

export const MAX_INTERESTS = 3;

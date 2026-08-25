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
  "مسابقات الروبوت",
  "الأولمبياد العالمي للروبوت (WRO)",
  "الحساب الذهني",
  "ليجو",
  "بيبراس (Bebras)",
  "كانجارو (Kangaroo)",
  "نسمو",
  "أولمبياد العلوم",
  "أولمبياد الرياضيات",
  "الأفرو آسيوي",
  "الروبوريف",
];

export const TALENT_INTERESTS = ["مسرح", "إنشاد", "تمثيل", "شعر"];

export const MAX_INTERESTS = 3;

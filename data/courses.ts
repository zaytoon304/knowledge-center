export interface Course {
  id: number;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  targetAudience: string;
  level: string;
  field: string;
  modules: string[];
  registrations: number;
  completions: number;
  startDate: string;
  status: "قادمة" | "جارية" | "منتهية";
}

export const courses: Course[] = [
  {
    id: 1,
    title: "مقدمة في الذكاء الاصطناعي",
    description: "دورة تمهيدية شاملة تغطي مفاهيم الذكاء الاصطناعي وتطبيقاته في التعليم والحياة اليومية",
    instructor: "م. خالد الشمري",
    duration: "20 ساعة تدريبية",
    targetAudience: "طلاب المرحلة الثانوية والمعلمون",
    level: "مبتدئ",
    field: "الذكاء الاصطناعي",
    modules: ["ما هو الذكاء الاصطناعي؟", "تعلم الآلة", "الشبكات العصبية", "تطبيقات AI", "أخلاقيات AI"],
    registrations: 45,
    completions: 38,
    startDate: "2024-10-01",
    status: "منتهية",
  },
  {
    id: 2,
    title: "Arduino للمبتدئين",
    description: "تعلم برمجة وتوصيل لوحة Arduino من الصفر إلى مشاريع متكاملة",
    instructor: "م. سعد العتيبي",
    duration: "16 ساعة تدريبية",
    targetAudience: "طلاب المرحلة المتوسطة والثانوية",
    level: "مبتدئ",
    field: "الروبوت",
    modules: ["مكونات Arduino", "البرمجة الأساسية", "الحساسات", "التحكم بالمحركات", "مشروع نهائي"],
    registrations: 32,
    completions: 28,
    startDate: "2024-11-15",
    status: "منتهية",
  },
  {
    id: 3,
    title: "أساسيات الروبوت",
    description: "مدخل تعليمي شامل لعالم الروبوتات من التصميم إلى البرمجة",
    instructor: "م. عبدالله الحربي",
    duration: "24 ساعة تدريبية",
    targetAudience: "جميع المراحل",
    level: "مبتدئ",
    field: "الروبوت",
    modules: ["مكونات الروبوت", "حساسات الحركة", "المحركات", "البرمجة بـmBlock", "تحديات الروبوت"],
    registrations: 28,
    completions: 22,
    startDate: "2025-01-10",
    status: "جارية",
  },
  {
    id: 4,
    title: "STEAM في التعليم",
    description: "كيف تدمج العلوم والتقنية والهندسة والفنون والرياضيات في بيئة مدرسية متكاملة",
    instructor: "أ. نورة المطيري",
    duration: "12 ساعة تدريبية",
    targetAudience: "المعلمون والمنسقون",
    level: "متوسط",
    field: "STEAM",
    modules: ["مفهوم STEAM", "التصميم التعليمي", "الأنشطة التكاملية", "التقييم", "مشاريع نموذجية"],
    registrations: 20,
    completions: 18,
    startDate: "2024-12-05",
    status: "منتهية",
  },
  {
    id: 5,
    title: "إعداد مشروع للمسابقة",
    description: "كيف تبني مشروعاً احترافياً يفوز في المسابقات من اختيار الفكرة حتى العرض النهائي",
    instructor: "م. ياسر البشري",
    duration: "8 ساعات تدريبية",
    targetAudience: "الطلاب المتقدمون",
    level: "متقدم",
    field: "عام",
    modules: ["اختيار الفكرة", "توثيق المشروع", "النموذج الأولي", "العرض التقديمي", "الإجابة على الأسئلة"],
    registrations: 15,
    completions: 15,
    startDate: "2025-02-20",
    status: "قادمة",
  },
];

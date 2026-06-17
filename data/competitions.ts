export interface Competition {
  id: number;
  name: string;
  type: "محلية" | "وطنية" | "دولية" | "داخلية";
  description: string;
  targetAge: string;
  deadline: string;
  eventDate: string;
  coach: string;
  teams: number;
  status: "مفتوح" | "مغلق" | "قادم" | "منتهي";
  achievements: string[];
  requirements: string[];
  field: string;
}

export const competitions: Competition[] = [
  {
    id: 1,
    name: "WRO - أولمبياد الروبوت العالمي",
    type: "دولية",
    description: "مسابقة روبوت عالمية تتحدى الطلاب لبناء وبرمجة روبوتات تحل مشكلات حقيقية",
    targetAge: "8-19 سنة",
    deadline: "2025-03-15",
    eventDate: "2025-05-20",
    coach: "منسق الروبوت",
    teams: 4,
    status: "مفتوح",
    achievements: ["المركز الأول وطنياً 2024", "التأهل للعالمية 2024"],
    requirements: ["فريق من 2-3 طلاب", "روبوت LEGO أو مفتوح المصدر", "التسجيل المسبق"],
    field: "الروبوت",
  },
  {
    id: 2,
    name: "RoboRave International",
    type: "دولية",
    description: "مسابقة روبوتات تشجع على الإبداع والابتكار في بناء الروبوتات التلقائية",
    targetAge: "5-18 سنة",
    deadline: "2025-04-01",
    eventDate: "2025-06-10",
    coach: "منسق الروبوت",
    teams: 3,
    status: "مفتوح",
    achievements: ["المركز الثالث إقليمياً 2023"],
    requirements: ["روبوت ذاتي التشغيل", "الالتزام بالمواصفات", "وثائق المشروع"],
    field: "الروبوت",
  },
  {
    id: 3,
    name: "الأولمبياد الوطني للإبداع والابتكار",
    type: "وطنية",
    description: "مسابقة وطنية لأفضل مشاريع الابتكار في مجالات التقنية والعلوم",
    targetAge: "12-18 سنة",
    deadline: "2025-02-28",
    eventDate: "2025-04-15",
    coach: "منسق الابتكار",
    teams: 6,
    status: "مغلق",
    achievements: ["المركز الأول 2024", "المركز الثاني 2023"],
    requirements: ["مشروع مبتكر", "ورقة بحثية", "نموذج أولي"],
    field: "الابتكار",
  },
  {
    id: 4,
    name: "بيبراس - تحدي المعلوماتية",
    type: "دولية",
    description: "مسابقة دولية في التفكير المنطقي والمعلوماتية للطلاب",
    targetAge: "8-18 سنة",
    deadline: "2025-10-01",
    eventDate: "2025-11-15",
    coach: "منسق التقنية",
    teams: 0,
    status: "قادم",
    achievements: ["مشاركة 45 طالب 2024", "3 جوائز تميز"],
    requirements: ["اختبار إلكتروني", "التسجيل الفردي"],
    field: "المعلوماتية",
  },
  {
    id: 5,
    name: "هاكاثون الذكاء الاصطناعي المدرسي",
    type: "داخلية",
    description: "هاكاثون داخلي لتحفيز الطلاب على بناء حلول AI لمشكلات مدرسية حقيقية",
    targetAge: "14-18 سنة",
    deadline: "2025-03-01",
    eventDate: "2025-03-15",
    coach: "منسق الذكاء الاصطناعي",
    teams: 8,
    status: "قادم",
    achievements: [],
    requirements: ["فريق 3-5 طلاب", "فكرة مبتكرة", "نموذج تجريبي"],
    field: "الذكاء الاصطناعي",
  },
];

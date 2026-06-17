export type ProjectStatus = "فكرة" | "قيد التنفيذ" | "مكتمل" | "مشارك في مسابقة" | "فائز";
export type ProjectLevel = "ابتدائي" | "متوسط" | "ثانوي";

export interface Project {
  id: number;
  name: string;
  students: string[];
  school: string;
  level: ProjectLevel;
  supervisor: string;
  idea: string;
  problem: string;
  tools: string[];
  field: string;
  status: ProjectStatus;
  competition?: string;
  image: string;
  date: string;
  achievements?: string[];
}

export const projects: Project[] = [
  {
    id: 1,
    name: "النفق الذكي",
    students: ["أحمد محمد العتيبي", "خالد عبدالله السالم"],
    school: "ثانوية الملك فهد",
    level: "ثانوي",
    supervisor: "م. سعد الحربي",
    idea: "نظام إضاءة ذكي للأنفاق يتحكم بالإضاءة بناءً على الحركة والوقت",
    problem: "هدر الطاقة في إضاءة الأنفاق على مدار الساعة",
    tools: ["Arduino", "حساسات الحركة", "LED Strip", "C++"],
    field: "الذكاء الاصطناعي",
    status: "فائز",
    competition: "الأولمبياد الوطني للإبداع",
    image: "/images/projects/tunnel.jpg",
    date: "2024-11-15",
    achievements: ["المركز الأول - الأولمبياد الوطني"],
  },
  {
    id: 2,
    name: "المزرعة الذكية",
    students: ["نورة سعد القحطاني", "ريم علي الشهري"],
    school: "متوسطة الأميرة نورة",
    level: "متوسط",
    supervisor: "أ. فاطمة المطيري",
    idea: "نظام ري ذكي يستخدم حساسات رطوبة التربة لري النباتات تلقائياً",
    problem: "استنزاف المياه في الزراعة التقليدية",
    tools: ["ESP32", "حساس رطوبة", "مضخة مياه", "Python"],
    field: "إنترنت الأشياء",
    status: "مشارك في مسابقة",
    competition: "WRO",
    image: "/images/projects/farm.jpg",
    date: "2024-12-01",
    achievements: ["المركز الثاني - مسابقة WRO"],
  },
  {
    id: 3,
    name: "الملعب الذكي",
    students: ["محمد عبدالرحمن الدوسري"],
    school: "ابتدائية الفلاح",
    level: "ابتدائي",
    supervisor: "أ. عمر الزهراني",
    idea: "ملعب مجهز بحساسات لمراقبة الحركة وتسجيل النقاط بشكل تلقائي",
    problem: "صعوبة تحكيم المباريات وتسجيل النقاط بدقة",
    tools: ["Arduino", "حساسات", "شاشة LCD", "Scratch"],
    field: "الروبوت",
    status: "مكتمل",
    image: "/images/projects/playground.jpg",
    date: "2024-10-20",
  },
  {
    id: 4,
    name: "حمام السباحة الذكي",
    students: ["عبدالله فهد الحربي", "يوسف سلمان العمري"],
    school: "ثانوية الفيصل",
    level: "ثانوي",
    supervisor: "م. خالد الغامدي",
    idea: "نظام مراقبة جودة المياه في حمامات السباحة باستخدام حساسات ذكية",
    problem: "صعوبة مراقبة جودة المياه يدوياً وخطورتها على الصحة",
    tools: ["ESP32", "حساس PH", "حساس كلور", "Blynk App"],
    field: "إنترنت الأشياء",
    status: "قيد التنفيذ",
    image: "/images/projects/pool.jpg",
    date: "2025-01-10",
  },
  {
    id: 5,
    name: "الشجرة الذكية",
    students: ["سارة محمد الأحمدي", "لمى عبدالله القرني"],
    school: "ثانوية الإشراق",
    level: "ثانوي",
    supervisor: "أ. نجلاء الفيفي",
    idea: "شجرة اصطناعية تولد طاقة شمسية وتعرض معلومات بيئية عبر شاشات",
    problem: "الحاجة لمصادر طاقة نظيفة ومبتكرة في البيئة المدرسية",
    tools: ["Raspberry Pi", "ألواح شمسية", "Python", "TFT Display"],
    field: "STEAM",
    status: "فائز",
    competition: "تحدي STEAM",
    image: "/images/projects/tree.jpg",
    date: "2024-11-05",
    achievements: ["المركز الأول - تحدي STEAM الإقليمي"],
  },
  {
    id: 6,
    name: "المساعد الذكي المدرسي",
    students: ["عبدالرحمن أحمد السعيد", "تركي محمد الشمري"],
    school: "ثانوية الملك عبدالعزيز",
    level: "ثانوي",
    supervisor: "م. ياسر البشري",
    idea: "روبوت مساعد يجيب على أسئلة الطلاب ويرشدهم داخل المدرسة",
    problem: "ضياع الطلاب الجدد وصعوبة الوصول للمعلومات",
    tools: ["Raspberry Pi", "Python", "OpenAI API", "Camera Module"],
    field: "الذكاء الاصطناعي",
    status: "قيد التنفيذ",
    image: "/images/projects/assistant.jpg",
    date: "2025-02-01",
  },
];

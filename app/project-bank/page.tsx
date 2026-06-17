"use client";
import { useState } from "react";
import { Archive, Search, Filter, Download, ChevronLeft, Clock, Wrench } from "lucide-react";

const bankProjects = [
  {
    id: 1, name: "كاشف النفايات الذكي", field: "الذكاء الاصطناعي", level: "ثانوي",
    difficulty: "متوسط", time: "4 أسابيع",
    idea: "كاميرا مدعومة بالذكاء الاصطناعي تصنف النفايات تلقائياً لفرزها بشكل صحيح",
    problem: "الفرز الخاطئ للنفايات يعيق إعادة التدوير ويلوث البيئة",
    tools: ["Teachable Machine", "Raspberry Pi", "Python", "Camera Module"],
    steps: ["تجميع صور النفايات", "تدريب النموذج", "برمجة الكشف", "بناء النموذج", "الاختبار"],
    criteria: ["دقة التصنيف", "سرعة الاستجابة", "جودة البناء", "التوثيق"],
    ideas: ["إضافة ذراع ميكانيكي للفرز التلقائي", "ربطه بتطبيق للإحصاء"],
    color: "from-green-600 to-emerald-400",
  },
  {
    id: 2, name: "المساعد الذكي المدرسي", field: "الذكاء الاصطناعي", level: "ثانوي",
    difficulty: "متقدم", time: "6 أسابيع",
    idea: "روبوت يجيب على أسئلة الطلاب ويرشدهم داخل المدرسة باستخدام نموذج لغوي",
    problem: "الطلاب الجدد يحتاجون توجيهاً مستمراً داخل الحرم المدرسي",
    tools: ["Raspberry Pi", "Python", "OpenAI API", "Microphone", "Speaker"],
    steps: ["تصميم واجهة المحادثة", "برمجة التعرف على الصوت", "الربط مع API", "التجريب", "العرض"],
    criteria: ["دقة الإجابات", "سهولة الاستخدام", "الابتكار", "جودة العرض"],
    ideas: ["إضافة خريطة للمدرسة", "التحدث بالعربية والإنجليزية"],
    color: "from-indigo-600 to-purple-500",
  },
  {
    id: 3, name: "روبوت تجنب العوائق", field: "الروبوت", level: "متوسط",
    difficulty: "مبتدئ", time: "2 أسابيع",
    idea: "روبوت يتحرك بشكل مستقل ويتجنب العوائق باستخدام حساسات الموجات فوق الصوتية",
    problem: "تعليم الطلاب مبادئ الروبوت بطريقة عملية ومشوقة",
    tools: ["Arduino", "Ultrasonic Sensor", "DC Motors", "L298N Driver", "C++"],
    steps: ["توصيل الحساسات", "برمجة منطق التجنب", "اختبار الحركة", "التعديل والتطوير"],
    criteria: ["دقة التجنب", "سرعة الاستجابة", "ثبات الحركة"],
    ideas: ["إضافة كاميرا للتحكم عن بعد", "تتبع الخط مع التجنب"],
    color: "from-sky-600 to-blue-500",
  },
  {
    id: 4, name: "نظام الري الذكي", field: "إنترنت الأشياء", level: "متوسط",
    difficulty: "متوسط", time: "3 أسابيع",
    idea: "نظام يرصد رطوبة التربة تلقائياً ويشغل مضخة الري عند الحاجة",
    problem: "هدر المياه في الزراعة التقليدية وتلف المحاصيل من الإفراط في الري",
    tools: ["ESP32", "Soil Moisture Sensor", "Water Pump", "Relay", "Blynk App"],
    steps: ["توصيل الحساسات والمضخة", "برمجة ESP32", "إعداد Blynk", "الاختبار الفعلي", "التوثيق"],
    criteria: ["دقة قياس الرطوبة", "انتظام الري", "سهولة التحكم"],
    ideas: ["إضافة حساس ضوء وحرارة", "ربط بتطبيق تنبيه"],
    color: "from-teal-600 to-cyan-500",
  },
  {
    id: 5, name: "جسر المقاومة STEAM", field: "STEAM", level: "ابتدائي",
    difficulty: "مبتدئ", time: "1 أسبوع",
    idea: "بناء جسر من الخشب بأدنى مواد يتحمل أعلى وزن ممكن - تحدي هندسي",
    problem: "فهم مبادئ الهندسة الإنشائية بطريقة تطبيقية مبسطة",
    tools: ["عيدان الخشب", "الغراء", "ميزان", "نموذج ورق"],
    steps: ["تصميم الجسر على ورق", "بناء النموذج", "الاختبار بالأوزان", "توثيق النتائج"],
    criteria: ["الوزن المتحمل", "الكفاءة (وزن الجسر/الحمولة)", "الابتكار في التصميم"],
    ideas: ["استخدام مواد مختلفة والمقارنة", "بناء نموذج رقمي بـ Tinkercad"],
    color: "from-orange-500 to-yellow-400",
  },
  {
    id: 6, name: "مشروع بحثي: تأثير الضوء على النبات", field: "البحث العلمي", level: "متوسط",
    difficulty: "متوسط", time: "4 أسابيع",
    idea: "دراسة تأثير ألوان الضوء المختلفة على معدل نمو النباتات",
    problem: "لا توجد دراسة تجريبية واضحة عن تأثير لون الضوء على النمو في بيئتنا المحلية",
    tools: ["نباتات بذور", "مصابيح ملونة", "مسطرة", "جدول البيانات"],
    steps: ["صياغة الفرضية", "إعداد التجربة", "القياس اليومي", "تحليل البيانات", "كتابة التقرير", "إعداد العرض"],
    criteria: ["صحة المنهج العلمي", "دقة البيانات", "تحليل النتائج", "جودة العرض"],
    ideas: ["دراسة تأثير الحرارة أيضاً", "المقارنة مع نباتات مختلفة"],
    color: "from-rose-500 to-pink-400",
  },
  {
    id: 7, name: "إنذار الحريق الذكي", field: "Arduino", level: "ابتدائي",
    difficulty: "مبتدئ", time: "1 أسبوع",
    idea: "نظام يكشف ارتفاع الحرارة والدخان ويصدر صوت إنذار تنبيه",
    problem: "الكشف المبكر عن الحرائق في المباني لحماية الأرواح",
    tools: ["Arduino Uno", "Temperature Sensor", "MQ-2 Smoke Sensor", "Buzzer", "LED"],
    steps: ["توصيل الحساسات", "برمجة الإنذار", "ضبط الحد الحراري", "الاختبار"],
    criteria: ["سرعة الكشف", "دقة الحساسات", "وضوح الإنذار"],
    ideas: ["إرسال رسالة SMS عند الخطر", "ربطه بنظام إطفاء آلي"],
    color: "from-red-600 to-orange-500",
  },
  {
    id: 8, name: "واقع معزز للتشريح", field: "الذكاء الاصطناعي", level: "ثانوي",
    difficulty: "متقدم", time: "5 أسابيع",
    idea: "تطبيق AR يعرض نماذج ثلاثية الأبعاد لجسم الإنسان عند توجيه الكاميرا لبطاقة",
    problem: "صعوبة فهم الطلاب للتشريح من الكتب المدرسية ذات البُعدين",
    tools: ["Unity", "Vuforia AR SDK", "3D Models", "Android/iOS"],
    steps: ["تصميم بطاقات الهدف", "بناء النماذج ثلاثية الأبعاد", "برمجة AR", "الاختبار", "النشر"],
    criteria: ["دقة التتبع", "جودة النماذج", "سهولة الاستخدام", "القيمة التعليمية"],
    ideas: ["إضافة صوت شرح للأجهزة", "تغطية جميع أجهزة الجسم"],
    color: "from-violet-600 to-purple-500",
  },
];

const difficultyColors: Record<string, string> = {
  "مبتدئ": "bg-green-100 text-green-700",
  "متوسط": "bg-yellow-100 text-yellow-700",
  "متقدم": "bg-red-100 text-red-700",
};

export default function ProjectBankPage() {
  const [search, setSearch] = useState("");
  const [fieldFilter, setFieldFilter] = useState("الكل");
  const [levelFilter, setLevelFilter] = useState("الكل");
  const [difficultyFilter, setDifficultyFilter] = useState("الكل");
  const [selected, setSelected] = useState<number | null>(null);

  const filtered = bankProjects.filter(p => {
    const matchSearch = !search || p.name.includes(search) || p.idea.includes(search);
    const matchField = fieldFilter === "الكل" || p.field === fieldFilter;
    const matchLevel = levelFilter === "الكل" || p.level === levelFilter;
    const matchDiff = difficultyFilter === "الكل" || p.difficulty === difficultyFilter;
    return matchSearch && matchField && matchLevel && matchDiff;
  });

  const project = bankProjects.find(p => p.id === selected);

  if (selected && project) {
    return (
      <div className="space-y-5 animate-fade-in">
        <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-blue-600 text-sm font-medium">
          ← العودة لبنك المشاريع
        </button>
        <div className={`card p-8 bg-gradient-to-br ${project.color} text-white`}>
          <h2 className="text-3xl font-bold mb-2">{project.name}</h2>
          <div className="flex gap-2 mb-4">
            <span className="bg-white/20 text-white text-sm px-3 py-1 rounded-full">{project.field}</span>
            <span className="bg-white/20 text-white text-sm px-3 py-1 rounded-full">{project.level}</span>
            <span className="bg-white/20 text-white text-sm px-3 py-1 rounded-full">{project.difficulty}</span>
            <span className="bg-white/20 text-white text-sm px-3 py-1 rounded-full flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />{project.time}
            </span>
          </div>
          <p className="text-white/90 text-lg">{project.idea}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div className="card p-5">
            <h3 className="font-bold text-gray-800 mb-3">المشكلة التي يحلها</h3>
            <p className="text-gray-600 text-sm leading-relaxed bg-red-50 p-4 rounded-xl">{project.problem}</p>
          </div>
          <div className="card p-5">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-blue-600" /> الأدوات المطلوبة
            </h3>
            <div className="flex flex-wrap gap-2">
              {project.tools.map(t => (
                <span key={t} className="text-sm bg-blue-50 text-blue-700 px-3 py-1.5 rounded-xl">{t}</span>
              ))}
            </div>
          </div>
          <div className="card p-5">
            <h3 className="font-bold text-gray-800 mb-3">خطوات التنفيذ</h3>
            <div className="space-y-2">
              {project.steps.map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-blue-800 text-white text-xs rounded-full flex items-center justify-center font-bold flex-shrink-0">{i + 1}</div>
                  <span className="text-sm text-gray-700">{step}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card p-5">
            <h3 className="font-bold text-gray-800 mb-3">معايير التقييم</h3>
            <div className="space-y-2">
              {project.criteria.map((c, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-green-500">✓</span> {c}
                </div>
              ))}
            </div>
            <div className="mt-4">
              <h4 className="font-semibold text-gray-700 mb-2 text-sm">أفكار للتطوير</h4>
              {project.ideas.map((idea, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-purple-500">💡</span> {idea}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="card p-4 flex gap-3">
          <button className="flex-1 bg-blue-800 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
            ابدأ هذا المشروع
          </button>
          <button className="flex items-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-colors">
            <Download className="w-4 h-4" /> تحميل الملف
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="card p-6 bg-gradient-to-l from-slate-800 to-gray-700 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <Archive className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">بنك المشاريع</h1>
            <p className="text-gray-300 text-sm">أفكار مشاريع جاهزة ومصنفة للتنفيذ الفوري</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-48 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5">
            <Search className="w-4 h-4 text-gray-400" />
            <input type="text" placeholder="ابحث عن مشروع..." value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent outline-none text-sm flex-1 text-right" />
          </div>
          {[
            { opts: ["الكل", "الذكاء الاصطناعي", "الروبوت", "إنترنت الأشياء", "STEAM", "Arduino", "البحث العلمي"], v: fieldFilter, set: setFieldFilter },
            { opts: ["الكل", "ابتدائي", "متوسط", "ثانوي"], v: levelFilter, set: setLevelFilter },
            { opts: ["الكل", "مبتدئ", "متوسط", "متقدم"], v: difficultyFilter, set: setDifficultyFilter },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <select value={f.v} onChange={e => f.set(e.target.value)} className="bg-transparent text-sm outline-none text-gray-600">
                {f.opts.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(p => (
          <div key={p.id} onClick={() => setSelected(p.id)} className="card overflow-hidden cursor-pointer group">
            <div className={`bg-gradient-to-br ${p.color} p-4`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`badge text-xs ${difficultyColors[p.difficulty] ?? "bg-gray-100"}`}>{p.difficulty}</span>
                <span className="text-white text-xs bg-white/20 px-2 py-0.5 rounded-full">{p.field}</span>
              </div>
              <h3 className="font-bold text-white text-lg">{p.name}</h3>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-2">{p.idea}</p>
              <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{p.time}</span>
                <span className="flex items-center gap-1">📚 {p.level}</span>
                <span>{p.tools.length} أدوات</span>
              </div>
              <div className="flex items-center gap-1 text-blue-600 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                عرض التفاصيل <ChevronLeft className="w-3 h-3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

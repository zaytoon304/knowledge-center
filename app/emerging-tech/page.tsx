"use client";
import { useState } from "react";
import { Cpu, Brain, Wifi, Bot, Glasses, Printer, ChevronLeft, BookOpen, Play, Link2 } from "lucide-react";

const technologies = [
  {
    id: "ai",
    title: "الذكاء الاصطناعي",
    subtitle: "Artificial Intelligence",
    icon: Brain,
    color: "from-indigo-600 to-purple-500",
    bg: "bg-indigo-50",
    textColor: "text-indigo-700",
    levels: ["ابتدائي", "متوسط", "ثانوي"],
    description: "الذكاء الاصطناعي هو قدرة الحاسوب على تنفيذ مهام تتطلب ذكاءً بشرياً مثل التعلم، التفكير، والتعرف على الأنماط.",
    tools: ["ChatGPT", "Teachable Machine", "Scratch AI", "ML4Kids", "AutoML"],
    applications: ["التعرف على الصور", "الترجمة الآلية", "التوصيات الذكية", "السيارات ذاتية القيادة"],
    projects: ["كاشف النفايات بالكاميرا", "مساعد ذكي للمدرسة", "تصنيف النباتات", "كاشف المشاعر"],
    ethics: ["الخصوصية", "التحيز في البيانات", "المسؤولية الأخلاقية", "الاستخدام الإيجابي"],
  },
  {
    id: "iot",
    title: "إنترنت الأشياء",
    subtitle: "Internet of Things",
    icon: Wifi,
    color: "from-cyan-600 to-sky-400",
    bg: "bg-cyan-50",
    textColor: "text-cyan-700",
    levels: ["متوسط", "ثانوي"],
    description: "إنترنت الأشياء هو شبكة من الأجهزة المادية المتصلة بالإنترنت التي تجمع وتتبادل البيانات.",
    tools: ["ESP32", "Arduino", "Raspberry Pi", "Blynk", "MQTT"],
    applications: ["البيوت الذكية", "المدن الذكية", "الزراعة الذكية", "الرعاية الصحية"],
    projects: ["نظام ري ذكي", "مراقبة درجة الحرارة", "إنذار الحريق", "باب ذكي"],
    ethics: [],
  },
  {
    id: "robotics",
    title: "الروبوتات",
    subtitle: "Robotics",
    icon: Bot,
    color: "from-sky-600 to-blue-500",
    bg: "bg-sky-50",
    textColor: "text-sky-700",
    levels: ["ابتدائي", "متوسط", "ثانوي"],
    description: "الروبوتيكس علم تصميم وبناء وبرمجة الروبوتات لأداء مهام محددة بشكل آلي أو نصف آلي.",
    tools: ["LEGO Mindstorms", "Arduino", "ESP32", "mBlock", "ROS"],
    applications: ["التصنيع", "الجراحة الدقيقة", "استكشاف الفضاء", "التعليم"],
    projects: ["روبوت تجنب العوائق", "روبوت تتبع الخط", "ذراع روبوتية", "روبوت خدمة"],
    ethics: [],
  },
  {
    id: "ar",
    title: "الواقع المعزز",
    subtitle: "Augmented Reality",
    icon: Glasses,
    color: "from-pink-600 to-rose-400",
    bg: "bg-pink-50",
    textColor: "text-pink-700",
    levels: ["متوسط", "ثانوي"],
    description: "الواقع المعزز تقنية تضيف عناصر رقمية (صور، نصوص، أشكال) فوق الواقع الحقيقي عبر الكاميرا.",
    tools: ["Merge Cube", "CoSpaces Edu", "Zappar", "Adobe Aero", "Unity AR"],
    applications: ["التعليم التفاعلي", "الطب والجراحة", "التصميم المعماري", "الترفيه"],
    projects: ["كتاب AR تفاعلي", "خريطة جغرافية AR", "تشريح افتراضي", "متحف AR"],
    ethics: [],
  },
  {
    id: "3d",
    title: "الطباعة ثلاثية الأبعاد",
    subtitle: "3D Printing",
    icon: Printer,
    color: "from-emerald-600 to-green-400",
    bg: "bg-emerald-50",
    textColor: "text-emerald-700",
    levels: ["ابتدائي", "متوسط", "ثانوي"],
    description: "الطباعة ثلاثية الأبعاد تقنية تحويل النماذج الرقمية إلى أشياء فيزيائية طبقة فوق طبقة.",
    tools: ["Tinkercad", "Fusion 360", "Cura", "Ultimaker", "Creality"],
    applications: ["النماذج الأولية", "الأعضاء الاصطناعية", "الهندسة المعمارية", "الفن والتصميم"],
    projects: ["نموذج مبنى", "قطعة تعليمية", "أداة مساعدة", "قالب مخصص"],
    ethics: [],
  },
];

export default function EmergingTechPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const tech = technologies.find(t => t.id === selected);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="card p-6 bg-gradient-to-l from-cyan-800 to-blue-700 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <Cpu className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">مركز التقنيات الناشئة</h1>
            <p className="text-blue-200 text-sm">تعلم واستكشف أحدث التقنيات في عالم اليوم</p>
          </div>
        </div>
      </div>

      {!selected ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {technologies.map(t => {
            const Icon = t.icon;
            return (
              <div key={t.id} onClick={() => setSelected(t.id)} className="card p-6 cursor-pointer group">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${t.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {t.levels.map(l => (
                    <span key={l} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{l}</span>
                  ))}
                </div>
                <h3 className="font-bold text-gray-800 text-lg mb-1">{t.title}</h3>
                <p className="text-xs text-gray-400 mb-3">{t.subtitle}</p>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">{t.description.slice(0, 100)}...</p>
                <div className="flex items-center gap-1 text-blue-600 text-sm font-medium group-hover:gap-2 transition-all">
                  اكتشف المزيد <ChevronLeft className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      ) : tech && (
        <div className="space-y-5">
          <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium">
            ← العودة للتقنيات
          </button>

          <div className={`card p-8 bg-gradient-to-br ${tech.color} text-white`}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <tech.icon className="w-8 h-8" />
              </div>
              <div>
                <p className="text-white/70 text-sm">{tech.subtitle}</p>
                <h2 className="text-3xl font-bold">{tech.title}</h2>
              </div>
            </div>
            <p className="text-white/90 text-lg leading-relaxed">{tech.description}</p>
            <div className="flex gap-2 mt-4">
              {tech.levels.map(l => (
                <span key={l} className="bg-white/20 text-white text-sm px-3 py-1 rounded-full">{l}</span>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div className="card p-5">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" /> الأدوات والبرامج
              </h3>
              <div className="flex flex-wrap gap-2">
                {tech.tools.map(tool => (
                  <span key={tool} className={`text-sm px-3 py-1.5 rounded-xl font-medium ${tech.bg} ${tech.textColor}`}>{tool}</span>
                ))}
              </div>
            </div>

            <div className="card p-5">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Link2 className="w-4 h-4 text-green-600" /> التطبيقات في الحياة
              </h3>
              <div className="space-y-2">
                {tech.applications.map(app => (
                  <div key={app} className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0" />
                    {app}
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-5">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Play className="w-4 h-4 text-purple-600" /> مشاريع مقترحة
              </h3>
              <div className="space-y-2">
                {tech.projects.map((proj, i) => (
                  <div key={proj} className="flex items-center gap-3 text-sm">
                    <div className="w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {i + 1}
                    </div>
                    <span className="text-gray-700">{proj}</span>
                  </div>
                ))}
              </div>
            </div>

            {tech.ethics.length > 0 && (
              <div className="card p-5">
                <h3 className="font-bold text-gray-800 mb-3">الأخلاقيات والمسؤولية</h3>
                <div className="space-y-2">
                  {tech.ethics.map(e => (
                    <div key={e} className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 bg-red-400 rounded-full flex-shrink-0" />
                      {e}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

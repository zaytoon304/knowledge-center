"use client";
import { useState, useEffect } from "react";
import { Cpu, Brain, Wifi, Bot, Glasses, Printer, ChevronLeft, BookOpen, Play, Link2 } from "lucide-react";

/* التقنيات الافتراضية (تظهر دائماً) */
const DEFAULT_TECHS = [
  {
    id: "ai", title: "الذكاء الاصطناعي", subtitle: "Artificial Intelligence",
    emoji: "🧠", color: "from-indigo-600 to-purple-500",
    description: "الذكاء الاصطناعي هو قدرة الحاسوب على تنفيذ مهام تتطلب ذكاءً بشرياً مثل التعلم، التفكير، والتعرف على الأنماط.",
    tools: ["ChatGPT", "Teachable Machine", "Scratch AI", "ML4Kids", "AutoML"],
    applications: ["التعرف على الصور", "الترجمة الآلية", "التوصيات الذكية", "السيارات ذاتية القيادة"],
    projects: ["كاشف النفايات بالكاميرا", "مساعد ذكي للمدرسة", "تصنيف النباتات", "كاشف المشاعر"],
    levels: ["ابتدائي", "متوسط", "ثانوي"],
  },
  {
    id: "iot", title: "إنترنت الأشياء", subtitle: "Internet of Things",
    emoji: "📡", color: "from-cyan-600 to-sky-400",
    description: "إنترنت الأشياء هو شبكة من الأجهزة المادية المتصلة بالإنترنت التي تجمع وتتبادل البيانات.",
    tools: ["ESP32", "Arduino", "Raspberry Pi", "Blynk", "MQTT"],
    applications: ["البيوت الذكية", "المدن الذكية", "الزراعة الذكية", "الرعاية الصحية"],
    projects: ["نظام ري ذكي", "مراقبة درجة الحرارة", "إنذار الحريق", "باب ذكي"],
    levels: ["متوسط", "ثانوي"],
  },
  {
    id: "robotics", title: "الروبوتات", subtitle: "Robotics",
    emoji: "🤖", color: "from-sky-600 to-blue-500",
    description: "الروبوتيكس علم تصميم وبناء وبرمجة الروبوتات لأداء مهام محددة بشكل آلي أو نصف آلي.",
    tools: ["LEGO Mindstorms", "Arduino", "ESP32", "mBlock", "ROS"],
    applications: ["التصنيع", "الجراحة الدقيقة", "استكشاف الفضاء", "التعليم"],
    projects: ["روبوت تجنب العوائق", "روبوت تتبع الخط", "ذراع روبوتية", "روبوت خدمة"],
    levels: ["ابتدائي", "متوسط", "ثانوي"],
  },
  {
    id: "ar", title: "الواقع المعزز", subtitle: "Augmented Reality",
    emoji: "🥽", color: "from-pink-600 to-rose-400",
    description: "الواقع المعزز تقنية تضيف عناصر رقمية (صور، نصوص، أشكال) فوق الواقع الحقيقي عبر الكاميرا.",
    tools: ["Merge Cube", "CoSpaces Edu", "Zappar", "Adobe Aero", "Unity AR"],
    applications: ["التعليم التفاعلي", "الطب والجراحة", "التصميم المعماري", "الترفيه"],
    projects: ["كتاب AR تفاعلي", "خريطة جغرافية AR", "تشريح افتراضي", "متحف AR"],
    levels: ["متوسط", "ثانوي"],
  },
  {
    id: "3d", title: "الطباعة ثلاثية الأبعاد", subtitle: "3D Printing",
    emoji: "🖨️", color: "from-emerald-600 to-green-400",
    description: "الطباعة ثلاثية الأبعاد تقنية تحويل النماذج الرقمية إلى أشياء فيزيائية طبقة فوق طبقة.",
    tools: ["Tinkercad", "Fusion 360", "Cura", "Ultimaker", "Creality"],
    applications: ["النماذج الأولية", "الأعضاء الاصطناعية", "الهندسة المعمارية", "الفن والتصميم"],
    projects: ["نموذج مبنى", "قطعة تعليمية", "أداة مساعدة", "قالب مخصص"],
    levels: ["ابتدائي", "متوسط", "ثانوي"],
  },
];

interface Tech {
  id: string; title: string; subtitle?: string; emoji?: string; color?: string;
  description?: string; tools?: string[] | string; applications?: string[] | string;
  projects?: string[] | string; levels?: string[];
  image?: string;
}

function splitList(val: string[] | string | undefined): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  return val.split(/[,،\n]/).map(s => s.trim()).filter(Boolean);
}

function loadCustom(): Tech[] {
  try { const d = localStorage.getItem("kc_emerging_tech"); return d ? JSON.parse(d) : []; } catch { return []; }
}

export default function EmergingTechPage() {
  const [custom, setCustom] = useState<Tech[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => { setCustom(loadCustom()); }, []);

  const allTechs: Tech[] = [...DEFAULT_TECHS, ...custom];
  const tech = allTechs.find(t => t.id === selected);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="card p-6 bg-gradient-to-l from-cyan-800 to-blue-700 text-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <Cpu className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">مركز التقنيات الناشئة</h1>
            <p className="text-blue-200 text-sm">تعلم واستكشف أحدث التقنيات في عالم اليوم</p>
          </div>
        </div>
        <div className="bg-white/10 rounded-xl p-3 text-center w-28">
          <div className="text-2xl font-bold text-yellow-300">{allTechs.length}</div>
          <div className="text-blue-100 text-sm">تقنية</div>
        </div>
      </div>

      {!selected ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {allTechs.map(t => (
            <div key={t.id} onClick={() => setSelected(t.id)}
              className="card p-6 cursor-pointer group hover:shadow-lg transition-all">
              {t.image ? (
                <img src={t.image} alt={t.title} className="w-14 h-14 rounded-2xl object-cover mb-4" />
              ) : (
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${t.color || "from-blue-600 to-cyan-500"} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform text-2xl`}>
                  {t.emoji || "💡"}
                </div>
              )}
              <div className="flex flex-wrap gap-1 mb-2">
                {(t.levels || []).map(l => (
                  <span key={l} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{l}</span>
                ))}
              </div>
              <h3 className="font-bold text-gray-800 text-lg mb-1">{t.title}</h3>
              <p className="text-xs text-gray-400 mb-3">{t.subtitle}</p>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">{(t.description || "").slice(0, 100)}{(t.description || "").length > 100 ? "..." : ""}</p>
              <div className="flex items-center gap-1 text-blue-600 text-sm font-medium group-hover:gap-2 transition-all">
                اكتشف المزيد <ChevronLeft className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      ) : tech && (
        <div className="space-y-5">
          <button onClick={() => setSelected(null)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium">
            ← العودة للتقنيات
          </button>

          <div className={`card p-8 bg-gradient-to-br ${tech.color || "from-blue-700 to-cyan-500"} text-white`}>
            <div className="flex items-center gap-4 mb-4">
              {tech.image ? (
                <img src={tech.image} alt={tech.title} className="w-16 h-16 rounded-2xl object-cover" />
              ) : (
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-4xl">
                  {tech.emoji || "💡"}
                </div>
              )}
              <div>
                <p className="text-white/70 text-sm">{tech.subtitle}</p>
                <h2 className="text-3xl font-bold">{tech.title}</h2>
              </div>
            </div>
            <p className="text-white/90 text-lg leading-relaxed">{tech.description}</p>
            <div className="flex gap-2 mt-4 flex-wrap">
              {(tech.levels || []).map(l => (
                <span key={l} className="bg-white/20 text-white text-sm px-3 py-1 rounded-full">{l}</span>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {splitList(tech.tools).length > 0 && (
              <div className="card p-5">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" /> الأدوات والبرامج
                </h3>
                <div className="flex flex-wrap gap-2">
                  {splitList(tech.tools).map(tool => (
                    <span key={tool} className="text-sm px-3 py-1.5 rounded-xl font-medium bg-blue-50 text-blue-700">{tool}</span>
                  ))}
                </div>
              </div>
            )}

            {splitList(tech.applications).length > 0 && (
              <div className="card p-5">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-green-600" /> التطبيقات في الحياة
                </h3>
                <div className="space-y-2">
                  {splitList(tech.applications).map(app => (
                    <div key={app} className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0" />
                      {app}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {splitList(tech.projects).length > 0 && (
              <div className="card p-5">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Play className="w-4 h-4 text-purple-600" /> مشاريع مقترحة
                </h3>
                <div className="space-y-2">
                  {splitList(tech.projects).map((proj, i) => (
                    <div key={proj} className="flex items-center gap-3 text-sm">
                      <div className="w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {i + 1}
                      </div>
                      <span className="text-gray-700">{proj}</span>
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

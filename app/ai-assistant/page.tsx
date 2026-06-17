"use client";
import { useState } from "react";
import { Bot, Send, Sparkles, ChevronLeft, Copy, RotateCcw } from "lucide-react";

type Category = {
  id: string;
  label: string;
  icon: string;
  questions: string[];
};

const categories: Category[] = [
  {
    id: "programs",
    label: "أسئلة البرامج",
    icon: "📚",
    questions: [
      "كيف أبدأ برنامج الذكاء الاصطناعي في المدرسة؟",
      "ما هي مكونات برنامج STEAM؟",
      "كيف أختار الطلاب للبرامج الإثرائية؟",
      "ما الفرق بين برنامج الموهبة وبرنامج الابتكار؟",
    ],
  },
  {
    id: "competitions",
    label: "أسئلة المسابقات",
    icon: "🏆",
    questions: [
      "كيف أجهز فريق WRO؟",
      "ما متطلبات مسابقة RoboRave؟",
      "ما الفرق بين مسابقة بيبراس وكانجارو؟",
      "كيف أسجل في الأولمبياد الوطني للإبداع؟",
    ],
  },
  {
    id: "tech",
    label: "الدعم الفني",
    icon: "⚙️",
    questions: [
      "ما مكونات مشروع إنترنت أشياء بسيط؟",
      "ما الفرق بين Arduino و ESP32؟",
      "كيف أوصل حساس الحرارة بـ Arduino؟",
      "ما أفضل برنامج لتعليم الروبوت للمبتدئين؟",
    ],
  },
  {
    id: "documents",
    label: "توليد النماذج",
    icon: "📝",
    questions: [
      "اكتب خطاب تكليف لمنسق روبوت",
      "أنشئ نموذج تقرير إنجاز للوحدة",
      "اكتب محضر اجتماع لفريق الوحدة",
      "أنشئ خطة تدريبية لدورة Arduino",
    ],
  },
  {
    id: "projects",
    label: "اقتراح المشاريع",
    icon: "💡",
    questions: [
      "أريد فكرة مشروع ذكاء اصطناعي للمرحلة المتوسطة",
      "اقترح مشروع STEAM للصف الرابع",
      "ما مشاريع الروبوت المناسبة لمسابقة WRO؟",
      "فكرة مشروع بحث علمي في بيئة المدرسة",
    ],
  },
  {
    id: "achievements",
    label: "توثيق الإنجازات",
    icon: "🌟",
    questions: [
      "كيف أوثق إنجازاً بشكل رسمي؟",
      "ما خطوات إصدار شهادة مشاركة؟",
      "كيف أُعد ملف إنجاز للطالب؟",
      "ما معايير تقييم المشروع؟",
    ],
  },
];

const aiResponses: Record<string, string> = {
  "كيف أجهز فريق WRO؟": `**تجهيز فريق WRO - دليل شامل**

**الخطوة 1: تشكيل الفريق**
• اختر 2-3 طلاب متحمسين وموهوبين
• تنوع المهارات: برمجة + ميكانيكا + إبداع
• التزام الفريق بالتدريب الأسبوعي

**الخطوة 2: اختيار الفئة**
• WRO Regular: لعب آلي بـ LEGO
• WRO Advanced Robotics: روبوت مفتوح المصدر
• WRO Future Innovators: مشروع إبداعي

**الخطوة 3: التدريب**
• ابدأ بتعليم LEGO Mindstorms أو الفئة المختارة
• 3-4 جلسات أسبوعياً لمدة 3 أشهر قبل المسابقة
• التدرب على حل التحديات وتوثيق الحلول

**الخطوة 4: التسجيل**
• سجل عبر الموقع الرسمي WRO Arabia
• ادفع رسوم التسجيل ضمن الموعد المحدد
• رفع وثائق الفريق

**نصيحة ذهبية:** ابدأ التجهيز مبكراً 6 أشهر قبل الموعد!`,

  "أريد فكرة مشروع ذكاء اصطناعي للمرحلة المتوسطة": `**أفكار مشاريع AI للمرحلة المتوسطة** 🤖

**1. كاشف النفايات الذكي**
• الفكرة: كاميرا تصنف النفايات (بلاستيك/ورق/عضوي)
• الأدوات: Teachable Machine + كاميرا + Raspberry Pi
• المشكلة المحلولة: الفرز الصحيح للنفايات
• الصعوبة: متوسطة ✅

**2. مساعد المذاكرة الذكي**
• الفكرة: تطبيق يجيب على أسئلة الطلاب
• الأدوات: Python + ChatGPT API
• المشكلة المحلولة: دعم الطلاب خارج أوقات المدرسة
• الصعوبة: متوسطة ✅

**3. كاشف التعب عبر الكاميرا**
• الفكرة: يراقب وجه الطالب ويكشف علامات التعب
• الأدوات: OpenCV + Python + Webcam
• المشكلة المحلولة: تنبيه المعلم بمستوى تركيز الطلاب
• الصعوبة: متقدمة ⭐

**الأنسب للبدء:** ابدأ بمشروع **كاشف النفايات** - بسيط وله أثر بيئي واضح!`,
};

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "مرحباً! أنا المساعد الذكي لوحدة الموهبة والابتكار. يمكنني مساعدتك في:\n\n• اقتراح أفكار مشاريع مبتكرة\n• الإجابة على أسئلة البرامج والمسابقات\n• توليد نماذج وخطابات رسمية\n• الدعم الفني للأدوات والمكونات\n\nاختر تصنيفاً أو اكتب سؤالك مباشرة!",
    },
  ]);
  const [input, setInput] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    setTimeout(() => {
      const response = aiResponses[text] ||
        `شكراً على سؤالك: **"${text}"**\n\nهذا جواب تجريبي من المساعد الذكي. في النسخة الكاملة، سيتم الربط مع نموذج لغوي متقدم للإجابة بدقة.\n\nيمكنك:\n• اختيار أسئلة جاهزة من التصنيفات أدناه\n• الاتصال بمنسق الوحدة للاستفسارات الحرجة`;
      setMessages(prev => [...prev, { role: "assistant", content: response }]);
      setLoading(false);
    }, 1200);
  };

  const formatMessage = (text: string) => {
    return text.split("\n").map((line, i) => {
      if (line.startsWith("**") && line.endsWith("**")) {
        return <p key={i} className="font-bold text-gray-800 mt-2">{line.replace(/\*\*/g, "")}</p>;
      }
      if (line.startsWith("•")) {
        return <p key={i} className="flex items-start gap-2 text-sm text-gray-700"><span className="text-blue-500 mt-0.5">•</span><span>{line.substring(1).trim()}</span></p>;
      }
      return line ? <p key={i} className="text-sm text-gray-700">{line}</p> : <br key={i} />;
    });
  };

  return (
    <div className="space-y-4 animate-fade-in h-full">
      {/* Header */}
      <div className="card p-5 bg-gradient-to-l from-violet-800 to-purple-700 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <Bot className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">المساعد الذكي</h1>
            <p className="text-purple-200 text-sm">مساعدك الذكي لوحدة الموهبة والابتكار والذكاء الاصطناعي</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Categories */}
        <div className="space-y-2">
          <h3 className="font-bold text-gray-700 text-sm mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
            أسئلة جاهزة حسب التصنيف
          </h3>
          {categories.map(cat => (
            <div key={cat.id} className="card overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-3 text-right hover:bg-gray-50 transition-colors"
                onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{cat.icon}</span>
                  <span className="text-sm font-semibold text-gray-700">{cat.label}</span>
                </div>
                <ChevronLeft className={`w-4 h-4 text-gray-400 transition-transform ${activeCategory === cat.id ? "rotate-90" : ""}`} />
              </button>
              {activeCategory === cat.id && (
                <div className="border-t border-gray-100 divide-y divide-gray-50">
                  {cat.questions.map(q => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="w-full text-right text-xs text-gray-600 px-4 py-2.5 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Chat */}
        <div className="lg:col-span-2 card flex flex-col" style={{ height: "600px" }}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"}`}>
                <div className={`max-w-[80%] rounded-2xl p-4 ${
                  msg.role === "user"
                    ? "bg-blue-800 text-white rounded-tr-none"
                    : "bg-gray-50 border border-gray-100 rounded-tl-none"
                }`}>
                  {msg.role === "user" ? (
                    <p className="text-sm">{msg.content}</p>
                  ) : (
                    <div className="space-y-1">{formatMessage(msg.content)}</div>
                  )}
                  {msg.role === "assistant" && (
                    <button
                      onClick={() => navigator.clipboard.writeText(msg.content)}
                      className="mt-2 flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
                    >
                      <Copy className="w-3 h-3" /> نسخ
                    </button>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-end">
                <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-tl-none p-4">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-gray-100 p-4">
            <div className="flex gap-2">
              <button
                onClick={() => { setMessages([{ role: "assistant", content: "تم مسح المحادثة. كيف يمكنني مساعدتك؟" }]); }}
                className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors flex-shrink-0"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMessage(input)}
                placeholder="اكتب سؤالك هنا..."
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-purple-400 text-right"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading}
                className="bg-purple-700 text-white p-2.5 rounded-xl hover:bg-purple-600 transition-colors disabled:opacity-50 flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

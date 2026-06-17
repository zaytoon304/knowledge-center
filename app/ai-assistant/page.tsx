"use client";
import { useState, useEffect, useRef } from "react";
import { Bot, Send, Sparkles, Copy, RotateCcw, Key } from "lucide-react";
import Link from "next/link";

const SYSTEM_PROMPT = `أنت مساعد ذكي متخصص في مركز المعرفة والابتكار STEAM بمدارس الأرقم.
تساعد الطلاب والمعلمين والمنسقين في:
- كتابة أكواد Arduino وPython وC++ وMicroPython وشرحها
- أفكار مشاريع الروبوت والذكاء الاصطناعي والإلكترونيات وIoT
- شرح المفاهيم العلمية والرياضية بأسلوب مبسط ومشجع
- المسابقات: WRO، أولمبياد الرياضيات، أولمبياد العلوم، بيبراس، كانجارو، موهوب، نسمو
- توصيل المكونات الإلكترونية (Arduino, ESP32, Raspberry Pi, حسّاسات، محركات)
- STEAM والابتكار والبحث العلمي للطلاب
- إجابة أسئلة المواد الدراسية (رياضيات، علوم، فيزياء، كيمياء...)

قواعد:
- أجب دائماً بالعربية الفصحى البسيطة
- الأكواد: ضعها داخل \`\`\` مع ذكر اللغة
- كن مشجعاً وإيجابياً، خاصة مع الطلاب الصغار
- إذا طُلبت توصيلات إلكترونية فصفها بوضوح`;

const QUICK_QUESTIONS = [
  { label: "💡 فكرة مشروع AI", q: "أريد فكرة مشروع ذكاء اصطناعي مناسب للمرحلة المتوسطة" },
  { label: "🤖 كود Arduino", q: "كيف أوصل حساس الحرارة DHT11 بـ Arduino وأقرأ قيمته؟" },
  { label: "🏆 مسابقة WRO", q: "كيف أجهز فريق مسابقة WRO من الصفر؟" },
  { label: "⚡ ESP32 vs Arduino", q: "ما الفرق بين Arduino و ESP32 وأيهما أختار لمشروعي؟" },
  { label: "🔬 فكرة بحث علمي", q: "اقترح لي فكرة بحث علمي مناسبة للمرحلة الابتدائية" },
  { label: "📐 مسألة رياضيات", q: "اشرح لي قانون الاحتمالات بأسلوب بسيط مع مثال" },
  { label: "🌱 مشروع بيئي", q: "أريد مشروع روبوت له علاقة بالبيئة والاستدامة" },
  { label: "📋 خطة درس STEAM", q: "ساعدني في كتابة خطة درس STEAM لطلاب الصف الخامس" },
];

interface Message {
  role: "user" | "assistant";
  content: string;
}

async function callGemini(history: Message[], apiKey: string): Promise<string> {
  const contents = history.map(m => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        generationConfig: { temperature: 0.7, maxOutputTokens: 1500 },
      }),
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `خطأ ${res.status}`);
  }
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "لم أتلقَّ ردًّا، حاول مجدداً.";
}

function formatContent(text: string) {
  const parts = text.split(/(```[\s\S]*?```)/g);
  return parts.map((part, i) => {
    if (part.startsWith("```")) {
      const lines = part.split("\n");
      const lang = lines[0].replace("```", "").trim();
      const code = lines.slice(1, -1).join("\n");
      return (
        <div key={i} className="my-2 rounded-xl overflow-hidden border border-gray-700">
          {lang && <div className="bg-gray-800 text-gray-300 text-xs px-3 py-1">{lang}</div>}
          <pre className="bg-gray-900 text-green-300 p-3 text-xs overflow-x-auto leading-relaxed">{code}</pre>
        </div>
      );
    }
    return (
      <span key={i}>
        {part.split("\n").map((line, j) => {
          const bold = line.replace(/\*\*(.*?)\*\*/g, (_, m) => `<strong>${m}</strong>`);
          return (
            <span key={j}>
              {j > 0 && <br />}
              <span dangerouslySetInnerHTML={{ __html: bold }} />
            </span>
          );
        })}
      </span>
    );
  });
}

const WELCOME: Message = {
  role: "assistant",
  content: "مرحباً! أنا مساعدك الذكي في مركز الابتكار STEAM 🤖\n\nأستطيع مساعدتك في:\n• **الأكواد:** Arduino، Python، C++\n• **المشاريع:** روبوت، ذكاء اصطناعي، إلكترونيات\n• **المسابقات:** WRO، أولمبياد، بيبراس، كانجارو\n• **المواد العلمية:** رياضيات، علوم، فيزياء\n\nاكتب سؤالك أو اختر من الأسئلة السريعة 👇",
};

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [apiKey, setApiKey] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const k = localStorage.getItem("kc_gemini_key") || "";
    setApiKey(k);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", content: text };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput("");
    setError("");
    setLoading(true);

    if (!apiKey) {
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ لم يتم إعداد مفتاح المساعد الذكي بعد.\n\nيرجى مراجعة الأدمن لإدخال مفتاح Gemini في لوحة الإدارة ← رموز التسجيل." }]);
      setLoading(false);
      return;
    }

    try {
      const reply = await callGemini(newHistory, apiKey);
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "خطأ غير معروف";
      setError(msg);
      setMessages(prev => [...prev, { role: "assistant", content: `❌ حدث خطأ: ${msg}\n\nتأكد من صحة مفتاح API في لوحة الإدارة.` }]);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setMessages([WELCOME]); setError(""); };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="card p-5 bg-gradient-to-l from-violet-800 to-purple-700 text-white">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <Bot className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">المساعد الذكي</h1>
              <p className="text-purple-200 text-sm">مدعوم بـ Google Gemini — مجاني ويدعم العربية</p>
            </div>
          </div>
          {!apiKey && (
            <Link href="/admin" className="flex items-center gap-2 bg-yellow-400 text-gray-900 px-3 py-2 rounded-xl text-xs font-bold hover:bg-yellow-300 flex-shrink-0">
              <Key className="w-4 h-4" /> إعداد المفتاح
            </Link>
          )}
          {apiKey && (
            <div className="flex items-center gap-2 bg-green-400/20 border border-green-400/40 text-green-200 px-3 py-1.5 rounded-xl text-xs flex-shrink-0">
              ✓ متصل
            </div>
          )}
        </div>
      </div>

      {/* Quick questions */}
      <div>
        <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-purple-500" /> أسئلة سريعة:</p>
        <div className="flex gap-2 flex-wrap">
          {QUICK_QUESTIONS.map(q => (
            <button key={q.q} onClick={() => send(q.q)} disabled={loading}
              className="text-xs px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 transition-all disabled:opacity-50">
              {q.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat */}
      <div className="card flex flex-col" style={{ height: "520px" }}>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"}`}>
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-sm flex-shrink-0 ml-2 mt-1">🤖</div>
              )}
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                msg.role === "user"
                  ? "bg-blue-700 text-white rounded-tr-sm"
                  : "bg-gray-50 border border-gray-100 rounded-tl-sm text-gray-800"
              }`}>
                <div className="leading-relaxed">{msg.role === "assistant" ? formatContent(msg.content) : msg.content}</div>
                {msg.role === "assistant" && (
                  <button onClick={() => navigator.clipboard.writeText(msg.content)}
                    className="mt-2 flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600">
                    <Copy className="w-3 h-3" /> نسخ
                  </button>
                )}
              </div>
              {msg.role === "user" && (
                <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-sm flex-shrink-0 mr-2 mt-1">👤</div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex justify-end">
              <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-sm flex-shrink-0 ml-2">🤖</div>
              <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1 items-center">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }} />
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
                  <span className="text-xs text-gray-400 mr-1">يفكر...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-100 p-3">
          {error && <p className="text-xs text-red-500 mb-2 px-1">{error}</p>}
          <div className="flex gap-2">
            <button onClick={reset} title="محادثة جديدة"
              className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors flex-shrink-0">
              <RotateCcw className="w-4 h-4" />
            </button>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && send(input)}
              placeholder={apiKey ? "اكتب سؤالك هنا..." : "⚠️ يحتاج إعداد مفتاح API من الأدمن"}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-purple-400 text-right"
            />
            <button onClick={() => send(input)} disabled={!input.trim() || loading}
              className="bg-purple-700 text-white p-2.5 rounded-xl hover:bg-purple-600 transition-colors disabled:opacity-40 flex-shrink-0">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

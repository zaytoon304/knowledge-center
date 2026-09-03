"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { CircuitBoard, Sparkles, Printer, Copy, RotateCcw, Key, ChevronRight, AlertTriangle, Code2, Wrench, Trophy, BookmarkPlus, BookmarkCheck } from "lucide-react";
import { getGroqKey, callGroqText, extractJson, ROBOTICS_EXPERT_SYSTEM_PROMPT } from "@/lib/groq";
import { GRADES } from "@/lib/grades";
import { useAiOwner, saveAiHistoryItem } from "@/lib/aiHistory";

const PLATFORMS = ["Arduino Uno/Mega", "ESP32", "micro:bit", "برمجة بصرية (Scratch/mBlock بدون كود نصي)"];

interface TeachingStep { phase: string; time: string; activity: string; }

interface RoboticsLessonPlan {
  title: string;
  grade: string;
  platform: string;
  duration: string;
  objectives: string[];
  requiredComponents: string[];
  safetyNotes: string[];
  wiringSteps: string[];
  codeSnippet: string;
  codeExplanation: string;
  teachingSteps: TeachingStep[];
  commonMistakes: string[];
  extensionChallenge: string;
}

function buildPrompt(grade: string, platform: string, topic: string, duration: string, notes: string): string {
  return `أعدّ خطة حصة روبوتات/ذكاء اصطناعي كاملة واحترافية بصيغة JSON فقط (بدون أي شرح خارج الـJSON، بدون markdown، بدون علامات \`\`\`)، بهذا الشكل بالضبط:
{
  "title": "عنوان الحصة",
  "grade": "${grade}",
  "platform": "${platform}",
  "duration": "${duration} دقيقة",
  "objectives": ["هدف تعليمي/تقني 1", "هدف 2", "هدف 3"],
  "requiredComponents": ["اسم القطعة بالضبط وكميتها، مثال: مقاومة 220 أوم × 1"],
  "safetyNotes": ["تنبيه سلامة محدد يخص هذه الحصة تحديداً"],
  "wiringSteps": ["خطوة توصيل محددة برقم منفذ فعلي، مثال: وصّل طرف Trig من HC-SR04 بمنفذ GPIO 5"],
  "codeSnippet": "كود Arduino/C++ كامل قابل للرفع مباشرة بدون أخطاء، مع تعليقات عربية قصيرة توضح كل جزء",
  "codeExplanation": "شرح مبسّط جداً للكود بلغة يفهمها طالب بهذا الصف، سطر أو فقرة لكل جزء منطقي",
  "teachingSteps": [
    {"phase": "التمهيد", "time": "دقائق", "activity": "نشاط تمهيدي محدد"},
    {"phase": "الشرح والتوصيل", "time": "دقائق", "activity": "خطوات الشرح والتركيب الفعلي"},
    {"phase": "البرمجة والتجربة", "time": "دقائق", "activity": "ماذا يفعل الطلاب بالضبط بالكود/اللوحة"},
    {"phase": "التقويم والغلق", "time": "دقائق", "activity": "كيف نتأكد الطلاب فهموا"}
  ],
  "commonMistakes": ["خطأ شائع يقع فيه الطلاب بهذا الموضوع تحديداً + كيف يُحل"],
  "extensionChallenge": "تحدي إضافي حقيقي للطلاب السريعين يبني على نفس الدرس"
}

المنصة/العتاد المستخدم: ${platform}
الموضوع/المفهوم التقني: "${topic}"
الصف الدراسي: ${grade}
مدة الحصة: ${duration} دقيقة
${notes ? `ملاحظات إضافية من المعلم: ${notes}` : ""}

لو المنصة "برمجة بصرية" بدون كود نصي: اجعل "codeSnippet" فارغاً "" ووصف الكتل البرمجية المطلوبة داخل "codeExplanation" بدلاً من ذلك.
لو الموضوع نظري بحت بدون توصيل عتاد: اجعل "wiringSteps" مصفوفة فارغة.
اجعل خطوات "teachingSteps" تغطي مدة الحصة كاملة (${duration} دقيقة) بمجموع أوقات منطقي.`;
}

export default function RoboticsLessonPlanPage() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [grade, setGrade] = useState(GRADES[3]);
  const [platform, setPlatform] = useState(PLATFORMS[0]);
  const [topic, setTopic] = useState("");
  const [duration, setDuration] = useState("45");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [plan, setPlan] = useState<RoboticsLessonPlan | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const { ownerId } = useAiOwner();
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (plan) resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [plan]);

  useEffect(() => { getGroqKey().then(setApiKey); }, []);

  const generate = async () => {
    if (!topic.trim() || loading) return;
    setLoading(true);
    setError("");
    setPlan(null);
    setSaved(false);
    try {
      const raw = await callGroqText(
        [
          { role: "system", content: ROBOTICS_EXPERT_SYSTEM_PROMPT },
          { role: "user", content: buildPrompt(grade, platform, topic.trim(), duration, notes.trim()) },
        ],
        apiKey || "",
        4000,
        0.4
      );
      const parsed = extractJson<RoboticsLessonPlan>(raw);
      if (!parsed || !Array.isArray(parsed.teachingSteps) || parsed.teachingSteps.length === 0) {
        throw new Error("تعذّر فهم رد الذكاء الاصطناعي، حاول مرة أخرى");
      }
      setPlan(parsed);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  const buildTextExport = (p: RoboticsLessonPlan): string => {
    const lines: string[] = [p.title, `${p.grade} • ${p.platform} • ${p.duration}`, ""];
    lines.push("الأهداف:"); p.objectives.forEach(o => lines.push(`- ${o}`));
    if (p.requiredComponents.length) { lines.push("", "القطع المطلوبة:"); p.requiredComponents.forEach(c => lines.push(`- ${c}`)); }
    if (p.safetyNotes.length) { lines.push("", "تنبيهات السلامة:"); p.safetyNotes.forEach(s => lines.push(`⚠ ${s}`)); }
    if (p.wiringSteps.length) { lines.push("", "خطوات التوصيل:"); p.wiringSteps.forEach((w, i) => lines.push(`${i + 1}. ${w}`)); }
    if (p.codeSnippet) { lines.push("", "الكود:", p.codeSnippet); }
    lines.push("", "شرح الكود/الفكرة:", p.codeExplanation);
    lines.push("", "خطوات التنفيذ:"); p.teachingSteps.forEach(s => lines.push(`[${s.phase} - ${s.time}] ${s.activity}`));
    if (p.commonMistakes.length) { lines.push("", "أخطاء شائعة:"); p.commonMistakes.forEach(m => lines.push(`- ${m}`)); }
    lines.push("", `تحدي إضافي: ${p.extensionChallenge}`);
    return lines.join("\n");
  };

  const copyPlan = () => {
    if (!plan) return;
    navigator.clipboard.writeText(buildTextExport(plan));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const saveToHistory = async () => {
    if (!plan || !ownerId) return;
    await saveAiHistoryItem(ownerId, {
      tool: "robotics-lesson-plan", toolLabel: "خطة درس روبوتات",
      title: plan.title, subject: "الروبوتات والذكاء الاصطناعي", grade: plan.grade,
      textExport: buildTextExport(plan),
    });
    setSaved(true);
  };

  const printPlan = () => {
    document.body.classList.add("printing-only");
    window.print();
    setTimeout(() => document.body.classList.remove("printing-only"), 500);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="no-print flex items-center gap-2 text-xs text-gray-400">
        <Link href="/ai-tools" className="hover:text-orange-600 flex items-center gap-1">
          <ChevronRight className="w-3.5 h-3.5" /> أدوات الذكاء الاصطناعي
        </Link>
        <span>/</span>
        <span className="text-gray-600">مولّد خطة درس الروبوتات</span>
      </div>

      <div className="no-print card p-5 bg-gradient-to-l from-orange-800 to-red-600 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <CircuitBoard className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">مولّد خطة درس الروبوتات والذكاء الاصطناعي</h1>
            <p className="text-white/90 text-sm">خطة حصة كاملة بالعتاد والكود والتوصيلات وخطوات التنفيذ — جاهزة للفصل مباشرة</p>
          </div>
        </div>
      </div>

      {apiKey === "" && (
        <div className="no-print card p-4 bg-yellow-50 border border-yellow-200 flex items-center justify-between gap-3">
          <p className="text-sm text-yellow-800">⚠️ لم يتم إعداد مفتاح الذكاء الاصطناعي بعد.</p>
          <Link href="/admin" className="flex items-center gap-1 bg-yellow-400 text-gray-900 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-yellow-300 flex-shrink-0">
            <Key className="w-3.5 h-3.5" /> إعداد المفتاح
          </Link>
        </div>
      )}

      <div className="no-print card p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">الصف الدراسي</label>
            <select value={grade} onChange={e => setGrade(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-orange-500">
              {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">المنصة/العتاد</label>
            <select value={platform} onChange={e => setPlatform(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-orange-500">
              {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block">الموضوع/المفهوم التقني *</label>
          <input value={topic} onChange={e => setTopic(e.target.value)}
            placeholder="مثال: حساس المسافة HC-SR04، التحكم بمحرك سيرفو، المتغيرات بالبرمجة..."
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-orange-500" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block">مدة الحصة (دقيقة)</label>
          <input type="number" min={15} max={120} value={duration} onChange={e => setDuration(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-orange-500" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block">ملاحظات إضافية (اختياري)</label>
          <input value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="مثال: عندي 15 طالب بس 5 لوحات ESP32 متاحة"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-orange-500" />
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <button onClick={generate} disabled={!topic.trim() || loading || apiKey === ""}
          className="w-full flex items-center justify-center gap-2 bg-orange-700 text-white py-3 rounded-xl text-sm font-bold hover:bg-orange-600 transition-colors disabled:opacity-40">
          {loading ? <>جارٍ إعداد خطة الحصة...</> : <><Sparkles className="w-4 h-4" /> توليد خطة الحصة</>}
        </button>
      </div>

      {plan && (
        <div ref={resultRef} className="print-area card p-6 space-y-5">
          <div className="flex items-center gap-2 flex-wrap no-print">
            {ownerId && (
              <button onClick={saveToHistory} disabled={saved} className="flex items-center gap-1.5 text-xs bg-orange-100 text-orange-700 px-3 py-2 rounded-lg hover:bg-orange-200 disabled:opacity-60">
                {saved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <BookmarkPlus className="w-3.5 h-3.5" />} {saved ? "محفوظة بسجلي" : "حفظ بسجلي"}
              </button>
            )}
            <button onClick={copyPlan} className="flex items-center gap-1.5 text-xs bg-gray-100 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-200">
              <Copy className="w-3.5 h-3.5" /> {copied ? "تم النسخ ✓" : "نسخ الخطة"}
            </button>
            <button onClick={printPlan} className="flex items-center gap-1.5 text-xs bg-gray-100 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-200">
              <Printer className="w-3.5 h-3.5" /> طباعة
            </button>
            <button onClick={() => { setPlan(null); setTopic(""); }} className="flex items-center gap-1.5 text-xs bg-gray-100 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-200">
              <RotateCcw className="w-3.5 h-3.5" /> خطة جديدة
            </button>
          </div>

          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-xl font-bold text-gray-800">{plan.title}</h2>
            <p className="text-sm text-gray-500 mt-1">{plan.grade} • {plan.platform} • {plan.duration}</p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-orange-600" /> الأهداف</h3>
            <ul className="space-y-1">{plan.objectives.map((o, i) => <li key={i} className="text-sm text-gray-700 flex items-start gap-2"><span className="text-orange-500 mt-0.5">•</span>{o}</li>)}</ul>
          </div>

          {plan.requiredComponents.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5"><Wrench className="w-4 h-4 text-orange-600" /> القطع المطلوبة</h3>
              <div className="flex flex-wrap gap-2">{plan.requiredComponents.map((c, i) => <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">{c}</span>)}</div>
            </div>
          )}

          {plan.safetyNotes.length > 0 && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4">
              <h3 className="text-sm font-bold text-red-700 mb-2 flex items-center gap-1.5"><AlertTriangle className="w-4 h-4" /> تنبيهات سلامة</h3>
              <ul className="space-y-1">{plan.safetyNotes.map((s, i) => <li key={i} className="text-sm text-red-700">⚠ {s}</li>)}</ul>
            </div>
          )}

          {plan.wiringSteps.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-2">خطوات التوصيل</h3>
              <ol className="space-y-1.5">{plan.wiringSteps.map((w, i) => (
                <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-orange-700 text-white text-[10px] font-bold flex items-center justify-center">{i + 1}</span>{w}
                </li>
              ))}</ol>
            </div>
          )}

          {plan.codeSnippet && (
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5"><Code2 className="w-4 h-4 text-orange-600" /> الكود</h3>
              <pre dir="ltr" className="bg-gray-900 text-green-300 text-xs rounded-xl p-4 overflow-x-auto whitespace-pre-wrap leading-relaxed">{plan.codeSnippet}</pre>
            </div>
          )}

          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-2">شرح مبسّط للطلاب</h3>
            <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3 leading-relaxed whitespace-pre-wrap">{plan.codeExplanation}</p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-2">خطوات التنفيذ داخل الحصة</h3>
            <div className="space-y-3">{plan.teachingSteps.map((s, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex-shrink-0 w-24 text-xs">
                  <span className="block font-bold text-orange-700">{s.phase}</span>
                  <span className="text-gray-400">{s.time}</span>
                </div>
                <p className="text-sm text-gray-700 flex-1">{s.activity}</p>
              </div>
            ))}</div>
          </div>

          {plan.commonMistakes.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-2">أخطاء شائعة وحلولها</h3>
              <ul className="space-y-1">{plan.commonMistakes.map((m, i) => <li key={i} className="text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-1.5">⚡ {m}</li>)}</ul>
            </div>
          )}

          <div className="bg-violet-50 border border-violet-100 rounded-xl p-4">
            <h3 className="text-sm font-bold text-violet-700 mb-1 flex items-center gap-1.5"><Trophy className="w-4 h-4" /> تحدي إضافي للمتفوقين</h3>
            <p className="text-sm text-violet-700">{plan.extensionChallenge}</p>
          </div>
        </div>
      )}
    </div>
  );
}

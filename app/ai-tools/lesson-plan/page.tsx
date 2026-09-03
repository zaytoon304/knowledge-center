"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ClipboardList, Sparkles, Printer, Copy, RotateCcw, Key, ChevronRight, Target, Boxes, ListChecks, HelpCircle, PenLine, BookmarkPlus, BookmarkCheck } from "lucide-react";
import { getGroqKey, callGroqText, extractJson } from "@/lib/groq";
import { SUBJECTS } from "@/lib/subjects";
import { GRADES } from "@/lib/grades";
import { useAiOwner, saveAiHistoryItem } from "@/lib/aiHistory";

interface LessonPlanStep {
  phase: string;
  time: string;
  activity: string;
}

interface LessonPlan {
  title: string;
  subject: string;
  grade: string;
  duration: string;
  objectives: string[];
  materials: string[];
  previousKnowledge: string;
  steps: LessonPlanStep[];
  evaluationQuestions: string[];
  homework: string;
}

function buildPrompt(subject: string, grade: string, topic: string, duration: string, notes: string): string {
  return `أنت معلّم خبير بإعداد خطط الدروس وفق المعايير التربوية السعودية. أعدّ خطة درس كاملة واحترافية بصيغة JSON فقط (بدون أي شرح خارج الـJSON، بدون markdown)، بهذا الشكل بالضبط:
{
  "title": "عنوان الدرس",
  "subject": "${subject}",
  "grade": "${grade}",
  "duration": "${duration} دقيقة",
  "objectives": ["هدف تعليمي 1", "هدف تعليمي 2", "هدف تعليمي 3"],
  "materials": ["وسيلة 1", "وسيلة 2"],
  "previousKnowledge": "فقرة تمهيد قصيرة تربط بالخبرة السابقة للطلاب وتثير دافعيتهم",
  "steps": [
    {"phase": "التمهيد", "time": "5 دقائق", "activity": "وصف نشاط التمهيد"},
    {"phase": "العرض", "time": "20 دقيقة", "activity": "وصف تفصيلي لعرض المحتوى بخطوات واضحة"},
    {"phase": "التطبيق", "time": "15 دقيقة", "activity": "نشاط تطبيقي للطلاب"},
    {"phase": "التقويم والغلق", "time": "5 دقائق", "activity": "كيفية إغلاق الحصة وتلخيصها"}
  ],
  "evaluationQuestions": ["سؤال تقويمي 1", "سؤال تقويمي 2", "سؤال تقويمي 3"],
  "homework": "وصف الواجب المنزلي"
}

الموضوع: "${topic}"
الصف الدراسي: ${grade}
المادة: ${subject}
مدة الحصة: ${duration} دقيقة
${notes ? `ملاحظات إضافية من المعلم: ${notes}` : ""}

اجعل خطوات "steps" تغطي مدة الحصة كاملة (${duration} دقيقة) بمجموع أوقات منطقي، والمحتوى مناسباً تماماً للمرحلة العمرية.`;
}

export default function LessonPlanPage() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [grade, setGrade] = useState(GRADES[0]);
  const [topic, setTopic] = useState("");
  const [duration, setDuration] = useState("45");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [plan, setPlan] = useState<LessonPlan | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const { ownerId } = useAiOwner();

  useEffect(() => {
    getGroqKey().then(setApiKey);
  }, []);

  const generate = async () => {
    if (!topic.trim() || loading) return;
    setLoading(true);
    setError("");
    setPlan(null);
    setSaved(false);
    try {
      const raw = await callGroqText(
        [{ role: "user", content: buildPrompt(subject, grade, topic.trim(), duration, notes.trim()) }],
        apiKey || "",
        3000
      );
      const parsed = extractJson<LessonPlan>(raw);
      if (!parsed || !parsed.steps) throw new Error("تعذّر فهم رد الذكاء الاصطناعي، حاول مرة أخرى");
      setPlan(parsed);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  const buildTextExport = (p: LessonPlan): string => [
    `خطة درس: ${p.title}`,
    `المادة: ${p.subject} | الصف: ${p.grade} | المدة: ${p.duration}`,
    ``,
    `الأهداف التعليمية:`,
    ...p.objectives.map(o => `- ${o}`),
    ``,
    `الوسائل التعليمية: ${p.materials.join("، ")}`,
    ``,
    `التمهيد: ${p.previousKnowledge}`,
    ``,
    `خطوات الدرس:`,
    ...p.steps.map(s => `- ${s.phase} (${s.time}): ${s.activity}`),
    ``,
    `أسئلة التقويم:`,
    ...p.evaluationQuestions.map(q => `- ${q}`),
    ``,
    `الواجب المنزلي: ${p.homework}`,
  ].join("\n");

  const copyPlan = () => {
    if (!plan) return;
    navigator.clipboard.writeText(buildTextExport(plan));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const saveToHistory = async () => {
    if (!plan || !ownerId) return;
    await saveAiHistoryItem(ownerId, {
      tool: "lesson-plan",
      toolLabel: "خطة درس",
      title: plan.title,
      subject: plan.subject,
      grade: plan.grade,
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
        <Link href="/ai-tools" className="hover:text-violet-600 flex items-center gap-1">
          <ChevronRight className="w-3.5 h-3.5" /> أدوات الذكاء الاصطناعي
        </Link>
        <span>/</span>
        <span className="text-gray-600">مولّد خطة الدرس</span>
      </div>

      <div className="no-print card p-5 bg-gradient-to-l from-violet-800 to-purple-700 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <ClipboardList className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">مولّد خطة الدرس</h1>
            <p className="text-white/90 text-sm">اكتب موضوع الدرس، والذكاء الاصطناعي يجهّز لك خطة كاملة خلال ثوانٍ</p>
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

      {/* Form */}
      <div className="no-print card p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">المادة</label>
            <select value={subject} onChange={e => setSubject(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-violet-500">
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">الصف الدراسي</label>
            <select value={grade} onChange={e => setGrade(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-violet-500">
              {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block">موضوع الدرس *</label>
          <input value={topic} onChange={e => setTopic(e.target.value)}
            placeholder="مثال: الكسور العشرية، دورة الماء في الطبيعة..."
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-violet-500" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">مدة الحصة (بالدقائق)</label>
            <input type="number" min={10} max={120} value={duration} onChange={e => setDuration(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-violet-500" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">ملاحظات إضافية (اختياري)</label>
            <input value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="مثال: التركيز على التعلم التعاوني"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-violet-500" />
          </div>
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <button onClick={generate} disabled={!topic.trim() || loading || apiKey === ""}
          className="w-full flex items-center justify-center gap-2 bg-violet-700 text-white py-3 rounded-xl text-sm font-bold hover:bg-violet-600 transition-colors disabled:opacity-40">
          {loading ? (
            <>جارٍ إعداد الخطة...</>
          ) : (
            <><Sparkles className="w-4 h-4" /> توليد خطة الدرس</>
          )}
        </button>
      </div>

      {/* Result */}
      {plan && (
        <div className="print-area card p-6 space-y-5">
          <div className="flex items-center justify-between gap-3 flex-wrap no-print">
            <div className="flex gap-2">
              {ownerId && (
                <button onClick={saveToHistory} disabled={saved} className="flex items-center gap-1.5 text-xs bg-violet-100 text-violet-700 px-3 py-2 rounded-lg hover:bg-violet-200 disabled:opacity-60">
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
          </div>

          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-xl font-bold text-gray-800">{plan.title}</h2>
            <p className="text-sm text-gray-500 mt-1">{plan.subject} • {plan.grade} • {plan.duration}</p>
          </div>

          <div>
            <h3 className="flex items-center gap-2 font-bold text-gray-700 mb-2 text-sm">
              <Target className="w-4 h-4 text-violet-600" /> الأهداف التعليمية
            </h3>
            <ul className="list-disc pr-5 text-sm text-gray-600 space-y-1">
              {plan.objectives?.map((o, i) => <li key={i}>{o}</li>)}
            </ul>
          </div>

          <div>
            <h3 className="flex items-center gap-2 font-bold text-gray-700 mb-2 text-sm">
              <Boxes className="w-4 h-4 text-violet-600" /> الوسائل التعليمية
            </h3>
            <p className="text-sm text-gray-600">{plan.materials?.join("، ")}</p>
          </div>

          <div>
            <h3 className="flex items-center gap-2 font-bold text-gray-700 mb-2 text-sm">
              <PenLine className="w-4 h-4 text-violet-600" /> التمهيد
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">{plan.previousKnowledge}</p>
          </div>

          <div>
            <h3 className="flex items-center gap-2 font-bold text-gray-700 mb-3 text-sm">
              <ListChecks className="w-4 h-4 text-violet-600" /> خطوات الدرس
            </h3>
            <div className="space-y-2">
              {plan.steps?.map((s, i) => (
                <div key={i} className="flex gap-3 bg-gray-50 rounded-xl p-3">
                  <div className="flex-shrink-0 w-24 text-xs font-bold text-violet-700">
                    {s.phase}
                    <div className="text-[10px] font-normal text-gray-400">{s.time}</div>
                  </div>
                  <p className="text-sm text-gray-600 flex-1">{s.activity}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="flex items-center gap-2 font-bold text-gray-700 mb-2 text-sm">
              <HelpCircle className="w-4 h-4 text-violet-600" /> أسئلة التقويم
            </h3>
            <ul className="list-disc pr-5 text-sm text-gray-600 space-y-1">
              {plan.evaluationQuestions?.map((q, i) => <li key={i}>{q}</li>)}
            </ul>
          </div>

          {plan.homework && (
            <div className="bg-violet-50 border border-violet-100 rounded-xl p-3">
              <h3 className="font-bold text-violet-800 text-sm mb-1">الواجب المنزلي</h3>
              <p className="text-sm text-violet-700">{plan.homework}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

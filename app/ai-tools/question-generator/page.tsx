"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { FileQuestion, Sparkles, Printer, Copy, RotateCcw, Key, ChevronRight, Eye, EyeOff, CheckCircle2, BookmarkPlus, BookmarkCheck } from "lucide-react";
import { getGroqKey, callGroqText, extractJson } from "@/lib/groq";
import { SUBJECTS } from "@/lib/subjects";
import { GRADES } from "@/lib/grades";
import { useAiOwner, saveAiHistoryItem } from "@/lib/aiHistory";

type QType = "mcq" | "tf" | "essay";

interface Question {
  type: QType;
  text: string;
  options?: string[];
  answer: string;
}

interface QuestionSet {
  title: string;
  subject: string;
  grade: string;
  questions: Question[];
}

const TYPE_LABEL: Record<QType, string> = { mcq: "اختيار من متعدد", tf: "صح / خطأ", essay: "سؤال مقالي" };
const DIFFICULTIES = ["سهل", "متوسط", "صعب", "متدرج (سهل ثم متوسط ثم صعب)"];

function buildPrompt(subject: string, grade: string, topic: string, mcqCount: number, tfCount: number, essayCount: number, difficulty: string, notes: string): string {
  return `أنت معلّم خبير بإعداد الاختبارات. أعدّ بنك أسئلة بصيغة JSON فقط (بدون أي شرح خارج الـJSON، بدون markdown)، بهذا الشكل بالضبط:
{
  "title": "عنوان بنك الأسئلة",
  "subject": "${subject}",
  "grade": "${grade}",
  "questions": [
    {"type": "mcq", "text": "نص السؤال", "options": ["أ", "ب", "ج", "د"], "answer": "الخيار الصحيح كما ورد بالضبط في options"},
    {"type": "tf", "text": "نص العبارة", "answer": "صح" },
    {"type": "essay", "text": "نص السؤال المقالي", "answer": "إجابة نموذجية مختصرة"}
  ]
}

المطلوب بالضبط: ${mcqCount} سؤال اختيار من متعدد (كل سؤال 4 خيارات)، ${tfCount} سؤال صح/خطأ (answer تكون "صح" أو "خطأ" فقط)، ${essayCount} سؤال مقالي.
الموضوع: "${topic}"
الصف الدراسي: ${grade}
المادة: ${subject}
مستوى الصعوبة: ${difficulty}
${notes ? `ملاحظات إضافية من المعلم: ${notes}` : ""}

اجعل الأسئلة مناسبة تماماً للمرحلة العمرية ومرتبطة مباشرة بالموضوع، وتأكد أن answer بأسئلة الاختيار من متعدد مطابق حرفياً لأحد عناصر options.`;
}

export default function QuestionGeneratorPage() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [grade, setGrade] = useState(GRADES[0]);
  const [topic, setTopic] = useState("");
  const [mcqCount, setMcqCount] = useState(5);
  const [tfCount, setTfCount] = useState(3);
  const [essayCount, setEssayCount] = useState(2);
  const [difficulty, setDifficulty] = useState(DIFFICULTIES[1]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [set, setSet] = useState<QuestionSet | null>(null);
  const [showAnswers, setShowAnswers] = useState(true);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const { ownerId } = useAiOwner();
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (set) resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [set]);

  useEffect(() => {
    getGroqKey().then(setApiKey);
  }, []);

  const generate = async () => {
    if (!topic.trim() || loading) return;
    if (mcqCount + tfCount + essayCount < 1) { setError("لازم سؤال واحد على الأقل"); return; }
    setLoading(true);
    setError("");
    setSet(null);
    setSaved(false);
    try {
      const raw = await callGroqText(
        [{ role: "user", content: buildPrompt(subject, grade, topic.trim(), mcqCount, tfCount, essayCount, difficulty, notes.trim()) }],
        apiKey || "",
        3500
      );
      const parsed = extractJson<QuestionSet>(raw);
      if (!parsed || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
        throw new Error("تعذّر فهم رد الذكاء الاصطناعي، حاول مرة أخرى");
      }
      setSet(parsed);
      setShowAnswers(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  const buildTextExport = (s: QuestionSet, withAnswers: boolean): string => {
    const lines: string[] = [`${s.title}`, `${s.subject} | ${s.grade}`, ""];
    s.questions.forEach((q, i) => {
      lines.push(`${i + 1}. (${TYPE_LABEL[q.type]}) ${q.text}`);
      if (q.type === "mcq" && q.options) q.options.forEach((o, j) => lines.push(`   ${"أبجد"[j] || j + 1}) ${o}`));
      if (withAnswers) lines.push(`   ✓ الإجابة: ${q.answer}`);
      lines.push("");
    });
    return lines.join("\n");
  };

  const copySet = () => {
    if (!set) return;
    navigator.clipboard.writeText(buildTextExport(set, showAnswers));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const saveToHistory = async () => {
    if (!set || !ownerId) return;
    await saveAiHistoryItem(ownerId, {
      tool: "question-generator",
      toolLabel: "بنك أسئلة",
      title: set.title,
      subject: set.subject,
      grade: set.grade,
      textExport: buildTextExport(set, true),
    });
    setSaved(true);
  };

  const printSet = () => {
    document.body.classList.add("printing-only");
    window.print();
    setTimeout(() => document.body.classList.remove("printing-only"), 500);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="no-print flex items-center gap-2 text-xs text-gray-400">
        <Link href="/ai-tools" className="hover:text-blue-600 flex items-center gap-1">
          <ChevronRight className="w-3.5 h-3.5" /> أدوات الذكاء الاصطناعي
        </Link>
        <span>/</span>
        <span className="text-gray-600">مولّد الأسئلة</span>
      </div>

      <div className="no-print card p-5 bg-gradient-to-l from-blue-800 to-cyan-600 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <FileQuestion className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">مولّد الأسئلة</h1>
            <p className="text-white/90 text-sm">حدّد الموضوع وعدد الأسئلة، والذكاء الاصطناعي يجهّز لك بنك أسئلة كامل بإجاباته</p>
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
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-blue-500">
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">الصف الدراسي</label>
            <select value={grade} onChange={e => setGrade(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-blue-500">
              {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block">الموضوع *</label>
          <input value={topic} onChange={e => setTopic(e.target.value)}
            placeholder="مثال: الكسور العشرية، دورة الماء في الطبيعة..."
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-blue-500" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">اختيار من متعدد</label>
            <input type="number" min={0} max={20} value={mcqCount} onChange={e => setMcqCount(Number(e.target.value))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">صح / خطأ</label>
            <input type="number" min={0} max={20} value={tfCount} onChange={e => setTfCount(Number(e.target.value))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">مقالية</label>
            <input type="number" min={0} max={10} value={essayCount} onChange={e => setEssayCount(Number(e.target.value))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-blue-500" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">مستوى الصعوبة</label>
            <select value={difficulty} onChange={e => setDifficulty(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-blue-500">
              {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">ملاحظات إضافية (اختياري)</label>
            <input value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="مثال: التركيز على التطبيق العملي"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-blue-500" />
          </div>
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <button onClick={generate} disabled={!topic.trim() || loading || apiKey === ""}
          className="w-full flex items-center justify-center gap-2 bg-blue-700 text-white py-3 rounded-xl text-sm font-bold hover:bg-blue-600 transition-colors disabled:opacity-40">
          {loading ? (
            <>جارٍ إعداد الأسئلة...</>
          ) : (
            <><Sparkles className="w-4 h-4" /> توليد الأسئلة</>
          )}
        </button>
      </div>

      {/* Result */}
      {set && (
        <div ref={resultRef} className="print-area card p-6 space-y-5">
          <div className="flex items-center justify-between gap-3 flex-wrap no-print">
            <div className="flex gap-2">
              {ownerId && (
                <button onClick={saveToHistory} disabled={saved} className="flex items-center gap-1.5 text-xs bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 disabled:opacity-60">
                  {saved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <BookmarkPlus className="w-3.5 h-3.5" />} {saved ? "محفوظ بسجلي" : "حفظ بسجلي"}
                </button>
              )}
              <button onClick={() => setShowAnswers(s => !s)} className="flex items-center gap-1.5 text-xs bg-gray-100 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-200">
                {showAnswers ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />} {showAnswers ? "إخفاء الإجابات" : "إظهار الإجابات"}
              </button>
              <button onClick={copySet} className="flex items-center gap-1.5 text-xs bg-gray-100 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-200">
                <Copy className="w-3.5 h-3.5" /> {copied ? "تم النسخ ✓" : "نسخ الأسئلة"}
              </button>
              <button onClick={printSet} className="flex items-center gap-1.5 text-xs bg-gray-100 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-200">
                <Printer className="w-3.5 h-3.5" /> طباعة
              </button>
              <button onClick={() => { setSet(null); setTopic(""); }} className="flex items-center gap-1.5 text-xs bg-gray-100 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-200">
                <RotateCcw className="w-3.5 h-3.5" /> بنك جديد
              </button>
            </div>
          </div>

          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-xl font-bold text-gray-800">{set.title}</h2>
            <p className="text-sm text-gray-500 mt-1">{set.subject} • {set.grade} • {set.questions.length} سؤال</p>
          </div>

          <div className="space-y-4">
            {set.questions.map((q, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-700 text-white text-xs font-bold flex items-center justify-center">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-gray-800">{q.text}</p>
                      <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full flex-shrink-0">{TYPE_LABEL[q.type]}</span>
                    </div>
                    {q.type === "mcq" && q.options && (
                      <ul className="mt-2 space-y-1">
                        {q.options.map((o, j) => (
                          <li key={j} className={`text-sm px-3 py-1.5 rounded-lg ${showAnswers && o === q.answer ? "bg-green-100 text-green-800 font-semibold" : "bg-white text-gray-600"}`}>
                            {"أبجد"[j] || j + 1}) {o} {showAnswers && o === q.answer && <CheckCircle2 className="inline w-3.5 h-3.5 mr-1" />}
                          </li>
                        ))}
                      </ul>
                    )}
                    {showAnswers && q.type !== "mcq" && (
                      <p className="mt-2 text-sm text-green-700 bg-green-50 px-3 py-1.5 rounded-lg">
                        <CheckCircle2 className="inline w-3.5 h-3.5 ml-1" /> الإجابة: {q.answer}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

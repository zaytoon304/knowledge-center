"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { FileText, Sparkles, Printer, Copy, RotateCcw, Key, ChevronRight, Eye, EyeOff, CheckCircle2, BookmarkPlus, BookmarkCheck } from "lucide-react";
import { getGroqKey, callGroqText, extractJson, TEACHER_EXPERT_SYSTEM_PROMPT } from "@/lib/groq";
import { SUBJECTS } from "@/lib/subjects";
import { GRADES } from "@/lib/grades";
import { useAiOwner, saveAiHistoryItem } from "@/lib/aiHistory";

interface Exercise {
  text: string;
  answer: string;
}

interface Worksheet {
  title: string;
  subject: string;
  grade: string;
  instructions: string;
  exercises: Exercise[];
}

const DIFFICULTIES = ["سهل", "متوسط", "صعب", "متدرج (يبدأ سهل وينتهي صعب)"];

function buildPrompt(subject: string, grade: string, topic: string, count: number, difficulty: string, notes: string): string {
  return `أنت معلّم خبير بإعداد أوراق العمل. أعدّ ورقة عمل بصيغة JSON فقط (بدون أي شرح خارج الـJSON، بدون markdown)، بهذا الشكل بالضبط:
{
  "title": "عنوان ورقة العمل",
  "subject": "${subject}",
  "grade": "${grade}",
  "instructions": "تعليمات قصيرة وواضحة للطالب عن كيفية حل الورقة",
  "exercises": [
    {"text": "نص التمرين (سؤال، إكمال فراغ، مسألة كلامية...)", "answer": "الإجابة الصحيحة"}
  ]
}

المطلوب: ${count} تمريناً متنوعاً (إكمال فراغات، أسئلة قصيرة، مسائل تطبيقية) حول الموضوع.
الموضوع: "${topic}"
الصف الدراسي: ${grade}
المادة: ${subject}
مستوى الصعوبة: ${difficulty}
${notes ? `ملاحظات إضافية من المعلم: ${notes}` : ""}

اجعل التمارين مناسبة تماماً للمرحلة العمرية ومتدرجة منطقياً.
اجعل نصف التمارين تقريباً مرتبطة بمواقف حياتية واقعية يعرفها الطالب (مثال بمادة الرياضيات: حساب فكة مشترى من البقالة، لا مجرد "5+3=؟" مجردة) بدل التمارين المجردة البحتة.`;
}

export default function WorksheetPage() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [grade, setGrade] = useState(GRADES[0]);
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(8);
  const [difficulty, setDifficulty] = useState(DIFFICULTIES[3]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sheet, setSheet] = useState<Worksheet | null>(null);
  const [showAnswers, setShowAnswers] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const { ownerId } = useAiOwner();
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sheet) resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [sheet]);

  useEffect(() => {
    getGroqKey().then(setApiKey);
  }, []);

  const generate = async () => {
    if (!topic.trim() || loading) return;
    setLoading(true);
    setError("");
    setSheet(null);
    setSaved(false);
    try {
      const raw = await callGroqText(
        [
          { role: "system", content: TEACHER_EXPERT_SYSTEM_PROMPT },
          { role: "user", content: buildPrompt(subject, grade, topic.trim(), count, difficulty, notes.trim()) },
        ],
        apiKey || "",
        4000
      );
      const parsed = extractJson<Worksheet>(raw);
      if (!parsed || !Array.isArray(parsed.exercises) || parsed.exercises.length === 0) {
        throw new Error("تعذّر فهم رد الذكاء الاصطناعي، حاول مرة أخرى");
      }
      setSheet(parsed);
      setShowAnswers(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  const buildTextExport = (s: Worksheet, withAnswers: boolean): string => {
    const lines: string[] = [s.title, `${s.subject} | ${s.grade}`, "", s.instructions, ""];
    s.exercises.forEach((ex, i) => {
      lines.push(`${i + 1}. ${ex.text}`);
      if (withAnswers) lines.push(`   ✓ الإجابة: ${ex.answer}`);
    });
    return lines.join("\n");
  };

  const copySheet = () => {
    if (!sheet) return;
    navigator.clipboard.writeText(buildTextExport(sheet, showAnswers));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const saveToHistory = async () => {
    if (!sheet || !ownerId) return;
    await saveAiHistoryItem(ownerId, {
      tool: "worksheet",
      toolLabel: "ورقة عمل",
      title: sheet.title,
      subject: sheet.subject,
      grade: sheet.grade,
      textExport: buildTextExport(sheet, true),
    });
    setSaved(true);
  };

  const printSheet = () => {
    document.body.classList.add("printing-only");
    window.print();
    setTimeout(() => document.body.classList.remove("printing-only"), 500);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="no-print flex items-center gap-2 text-xs text-gray-400">
        <Link href="/ai-tools" className="hover:text-emerald-600 flex items-center gap-1">
          <ChevronRight className="w-3.5 h-3.5" /> أدوات الذكاء الاصطناعي
        </Link>
        <span>/</span>
        <span className="text-gray-600">مولّد ورقة العمل</span>
      </div>

      <div className="no-print card p-5 bg-gradient-to-l from-emerald-800 to-teal-600 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <FileText className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">مولّد ورقة العمل</h1>
            <p className="text-white/90 text-sm">ورقة عمل جاهزة للطباعة مباشرة بتمارين متدرجة، ومفتاح إجابة عند الحاجة</p>
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
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-emerald-500">
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">الصف الدراسي</label>
            <select value={grade} onChange={e => setGrade(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-emerald-500">
              {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block">الموضوع *</label>
          <input value={topic} onChange={e => setTopic(e.target.value)}
            placeholder="مثال: الكسور العشرية، دورة الماء في الطبيعة..."
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-emerald-500" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">عدد التمارين</label>
            <input type="number" min={3} max={20} value={count} onChange={e => setCount(Number(e.target.value))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-emerald-500" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-gray-600 mb-1 block">مستوى الصعوبة</label>
            <select value={difficulty} onChange={e => setDifficulty(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-emerald-500">
              {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block">ملاحظات إضافية (اختياري)</label>
          <input value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="مثال: تمارين تطبيقية من واقع الحياة"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-emerald-500" />
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <button onClick={generate} disabled={!topic.trim() || loading || apiKey === ""}
          className="w-full flex items-center justify-center gap-2 bg-emerald-700 text-white py-3 rounded-xl text-sm font-bold hover:bg-emerald-600 transition-colors disabled:opacity-40">
          {loading ? (
            <>جارٍ إعداد ورقة العمل...</>
          ) : (
            <><Sparkles className="w-4 h-4" /> توليد ورقة العمل</>
          )}
        </button>
      </div>

      {/* Result */}
      {sheet && (
        <div ref={resultRef} className="print-area card p-6 space-y-5">
          <div className="flex items-center justify-between gap-3 flex-wrap no-print">
            <div className="flex gap-2">
              {ownerId && (
                <button onClick={saveToHistory} disabled={saved} className="flex items-center gap-1.5 text-xs bg-emerald-100 text-emerald-700 px-3 py-2 rounded-lg hover:bg-emerald-200 disabled:opacity-60">
                  {saved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <BookmarkPlus className="w-3.5 h-3.5" />} {saved ? "محفوظة بسجلي" : "حفظ بسجلي"}
                </button>
              )}
              <button onClick={() => setShowAnswers(s => !s)} className="flex items-center gap-1.5 text-xs bg-gray-100 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-200">
                {showAnswers ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />} {showAnswers ? "إخفاء مفتاح الإجابة" : "إظهار مفتاح الإجابة"}
              </button>
              <button onClick={copySheet} className="flex items-center gap-1.5 text-xs bg-gray-100 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-200">
                <Copy className="w-3.5 h-3.5" /> {copied ? "تم النسخ ✓" : "نسخ الورقة"}
              </button>
              <button onClick={printSheet} className="flex items-center gap-1.5 text-xs bg-gray-100 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-200">
                <Printer className="w-3.5 h-3.5" /> طباعة
              </button>
              <button onClick={() => { setSheet(null); setTopic(""); }} className="flex items-center gap-1.5 text-xs bg-gray-100 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-200">
                <RotateCcw className="w-3.5 h-3.5" /> ورقة جديدة
              </button>
            </div>
          </div>

          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-xl font-bold text-gray-800">{sheet.title}</h2>
            <p className="text-sm text-gray-500 mt-1">{sheet.subject} • {sheet.grade}</p>
            <div className="flex gap-6 mt-3 text-xs text-gray-400">
              <span>الاسم: ....................................</span>
              <span>التاريخ: ....................</span>
            </div>
          </div>

          <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3">{sheet.instructions}</p>

          <div className="space-y-4">
            {sheet.exercises.map((ex, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-700 text-white text-xs font-bold flex items-center justify-center">{i + 1}</span>
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{ex.text}</p>
                  {showAnswers ? (
                    <p className="mt-1 text-sm text-green-700 bg-green-50 px-3 py-1.5 rounded-lg inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {ex.answer}
                    </p>
                  ) : (
                    <div className="mt-2 border-b border-dashed border-gray-300 h-6" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

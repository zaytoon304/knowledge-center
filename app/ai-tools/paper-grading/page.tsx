"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ScanText, Sparkles, Printer, Copy, RotateCcw, Key, ChevronRight, ImagePlus, CheckCircle2, XCircle, Award, BookmarkPlus, BookmarkCheck } from "lucide-react";
import { getGroqKey, callGroqVision, extractJson } from "@/lib/groq";
import { SUBJECTS } from "@/lib/subjects";
import { GRADES } from "@/lib/grades";
import { useAiOwner, saveAiHistoryItem } from "@/lib/aiHistory";

interface GradedAnswer {
  question: string;
  studentAnswer: string;
  correct: boolean;
  correctAnswer: string;
}

interface GradingResult {
  studentName: string;
  answers: GradedAnswer[];
  score: string;
  overallFeedback: string;
}

function buildPrompt(subject: string, grade: string, answerKey: string): string {
  return `أنت معلّم خبير بتصحيح أوراق الاختبارات. اقرأ صورة ورقة إجابة الطالب بدقة (حتى لو الخط بخط اليد)، ثم صحّحها وأعد النتيجة بصيغة JSON فقط (بدون أي شرح خارج الـJSON، بدون markdown)، بهذا الشكل بالضبط:
{
  "studentName": "اسم الطالب إن وُجد بالورقة، وإلا اكتب: غير مذكور",
  "answers": [
    {"question": "نص أو رقم السؤال كما يظهر بالورقة", "studentAnswer": "إجابة الطالب كما قرأتها من الصورة", "correct": true/false, "correctAnswer": "الإجابة الصحيحة"}
  ],
  "score": "عدد الإجابات الصحيحة من إجمالي عدد الأسئلة، مثال: 7 من 10",
  "overallFeedback": "ملاحظة تشجيعية قصيرة ومفيدة للطالب عن أدائه"
}

المادة: ${subject}
الصف الدراسي: ${grade}
${answerKey ? `معيار التصحيح/الإجابة النموذجية الذي وضعه المعلم:\n${answerKey}\n\nاعتمد على هذا المعيار حصراً بالتصحيح.` : "لا يوجد معيار تصحيح محدد من المعلم — اعتمد على معرفتك الصحيحة بالمادة لتقييم كل إجابة."}

اقرأ كل سؤال وإجابة موجودة بالصورة بدقة تامة، ولا تخترع أسئلة غير موجودة بالورقة.`;
}

export default function PaperGradingPage() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [grade, setGrade] = useState(GRADES[0]);
  const [answerKey, setAnswerKey] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [imageName, setImageName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<GradingResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { ownerId } = useAiOwner();

  useEffect(() => {
    getGroqKey().then(setApiKey);
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) { setError("⚠️ حجم الصورة كبير جداً (أكثر من 8 ميجا) — التقط صورة أوضح وأصغر"); return; }
    setError("");
    setImageName(file.name);
    const reader = new FileReader();
    reader.onload = () => setImageDataUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const generate = async () => {
    if (!imageDataUrl || loading) return;
    setLoading(true);
    setError("");
    setResult(null);
    setSaved(false);
    try {
      const raw = await callGroqVision(buildPrompt(subject, grade, answerKey.trim()), imageDataUrl, apiKey || "", 2000);
      const parsed = extractJson<GradingResult>(raw);
      if (!parsed || !Array.isArray(parsed.answers)) throw new Error("تعذّر قراءة الورقة، جرّب صورة أوضح أو حاول مرة أخرى");
      setResult(parsed);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  const buildTextExport = (r: GradingResult): string => [
    `تصحيح ورقة: ${r.studentName}`,
    `${subject} | ${grade} | النتيجة: ${r.score}`,
    "",
    ...r.answers.map((a, i) => `${i + 1}. ${a.question} — إجابة الطالب: ${a.studentAnswer} ${a.correct ? "✓" : `✗ (الصحيح: ${a.correctAnswer})`}`),
    "",
    `ملاحظة عامة: ${r.overallFeedback}`,
  ].join("\n");

  const copyResult = () => {
    if (!result) return;
    navigator.clipboard.writeText(buildTextExport(result));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const saveToHistory = async () => {
    if (!result || !ownerId) return;
    await saveAiHistoryItem(ownerId, {
      tool: "paper-grading",
      toolLabel: "تصحيح ورقة",
      title: `ورقة ${result.studentName}`,
      subject,
      grade,
      textExport: buildTextExport(result),
    });
    setSaved(true);
  };

  const printResult = () => {
    document.body.classList.add("printing-only");
    window.print();
    setTimeout(() => document.body.classList.remove("printing-only"), 500);
  };

  const reset = () => {
    setResult(null);
    setImageDataUrl(null);
    setImageName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="no-print flex items-center gap-2 text-xs text-gray-400">
        <Link href="/ai-tools" className="hover:text-indigo-600 flex items-center gap-1">
          <ChevronRight className="w-3.5 h-3.5" /> أدوات الذكاء الاصطناعي
        </Link>
        <span>/</span>
        <span className="text-gray-600">تصحيح الأوراق بالذكاء الاصطناعي</span>
      </div>

      <div className="no-print card p-5 bg-gradient-to-l from-indigo-800 to-blue-600 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <ScanText className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">تصحيح الأوراق بالذكاء الاصطناعي</h1>
            <p className="text-white/90 text-sm">ارفع صورة ورقة إجابة الطالب، والذكاء الاصطناعي يقرأها ويصححها خلال ثوانٍ</p>
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
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-indigo-500">
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">الصف الدراسي</label>
            <select value={grade} onChange={e => setGrade(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-indigo-500">
              {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block">معيار التصحيح / الإجابة النموذجية (اختياري)</label>
          <textarea value={answerKey} onChange={e => setAnswerKey(e.target.value)} rows={3}
            placeholder="مثال: 1) 5  2) 10  3) 12 — لو تركته فاضياً، الذكاء الاصطناعي يصحح بمعرفته العامة بالمادة"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-indigo-500 resize-none" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block">صورة ورقة الطالب *</label>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={onFileChange}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-indigo-500 file:ml-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-indigo-100 file:text-indigo-700 file:text-xs file:font-semibold" />
          {imageDataUrl && (
            <div className="mt-3 flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageDataUrl} alt={imageName} className="w-24 h-24 object-cover rounded-xl border border-gray-200" />
              <p className="text-xs text-gray-500">{imageName}</p>
            </div>
          )}
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <button onClick={generate} disabled={!imageDataUrl || loading || apiKey === ""}
          className="w-full flex items-center justify-center gap-2 bg-indigo-700 text-white py-3 rounded-xl text-sm font-bold hover:bg-indigo-600 transition-colors disabled:opacity-40">
          {loading ? (
            <>جارٍ قراءة الورقة وتصحيحها...</>
          ) : (
            <><Sparkles className="w-4 h-4" /> تصحيح الورقة</>
          )}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="print-area card p-6 space-y-5">
          <div className="flex items-center justify-between gap-3 flex-wrap no-print">
            <div className="flex gap-2">
              {ownerId && (
                <button onClick={saveToHistory} disabled={saved} className="flex items-center gap-1.5 text-xs bg-indigo-100 text-indigo-700 px-3 py-2 rounded-lg hover:bg-indigo-200 disabled:opacity-60">
                  {saved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <BookmarkPlus className="w-3.5 h-3.5" />} {saved ? "محفوظة بسجلي" : "حفظ بسجلي"}
                </button>
              )}
              <button onClick={copyResult} className="flex items-center gap-1.5 text-xs bg-gray-100 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-200">
                <Copy className="w-3.5 h-3.5" /> {copied ? "تم النسخ ✓" : "نسخ النتيجة"}
              </button>
              <button onClick={printResult} className="flex items-center gap-1.5 text-xs bg-gray-100 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-200">
                <Printer className="w-3.5 h-3.5" /> طباعة
              </button>
              <button onClick={reset} className="flex items-center gap-1.5 text-xs bg-gray-100 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-200">
                <RotateCcw className="w-3.5 h-3.5" /> ورقة جديدة
              </button>
            </div>
          </div>

          <div className="border-b border-gray-100 pb-4 flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-xl font-bold text-gray-800">ورقة: {result.studentName}</h2>
              <p className="text-sm text-gray-500 mt-1">{subject} • {grade}</p>
            </div>
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2 flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" />
              <span className="font-bold text-indigo-800">{result.score}</span>
            </div>
          </div>

          <div className="space-y-2">
            {result.answers.map((a, i) => (
              <div key={i} className={`flex items-start gap-3 rounded-xl p-3 ${a.correct ? "bg-green-50" : "bg-red-50"}`}>
                {a.correct ? <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" /> : <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />}
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">{a.question}</p>
                  <p className="text-xs text-gray-600 mt-1">إجابة الطالب: {a.studentAnswer}</p>
                  {!a.correct && <p className="text-xs text-red-600 mt-1">الإجابة الصحيحة: {a.correctAnswer}</p>}
                </div>
              </div>
            ))}
          </div>

          {result.overallFeedback && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3">
              <h3 className="font-bold text-indigo-800 text-sm mb-1">ملاحظة للطالب</h3>
              <p className="text-sm text-indigo-700">{result.overallFeedback}</p>
            </div>
          )}

          <p className="no-print text-[11px] text-gray-400 flex items-center gap-1">
            <ImagePlus className="w-3.5 h-3.5" /> راجع دائماً تصحيح الذكاء الاصطناعي بنفسك قبل اعتماد الدرجة النهائية.
          </p>
        </div>
      )}
    </div>
  );
}

"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Bug, Sparkles, Copy, RotateCcw, Key, ChevronRight, CheckCircle2, XCircle, Lightbulb, BookmarkPlus, BookmarkCheck, Code2 } from "lucide-react";
import { getGroqKey, callGroqText, extractJson, ROBOTICS_EXPERT_SYSTEM_PROMPT } from "@/lib/groq";
import { GRADES } from "@/lib/grades";
import { useAiOwner, saveAiHistoryItem } from "@/lib/aiHistory";

const MODES = [
  { id: "explain", label: "اشرح لي هذا الكود" },
  { id: "debug", label: "فيه خطأ، ما يشتغل صح" },
  { id: "improve", label: "حسّنه لي" },
];

interface CodeSection { lines: string; explanation: string; }
interface CodeIssue { issue: string; location: string; fix: string; }

interface CodeHelperResult {
  summary: string;
  sections: CodeSection[];
  issuesFound: CodeIssue[];
  correctedCode: string;
  simplifiedForStudents: string;
  suggestions: string[];
}

function buildPrompt(mode: string, code: string, problem: string, grade: string): string {
  const modeInstruction =
    mode === "debug"
      ? `المعلم يقول إن الكود فيه مشكلة: "${problem || "لم يحدد المعلم وصف المشكلة"}". افحص الكود بدقة، اكتشف كل خطأ حقيقي (صياغي أو منطقي)، واملأ "issuesFound" بكل خطأ وجدته مع "correctedCode" يحتوي النسخة الكاملة المصححة.`
      : mode === "improve"
      ? `حسّن الكود: أعد كتابته بشكل أنظف وأكثر كفاءة واحترافية (تسمية متغيرات أوضح، تعليقات مفيدة، بدون تكرار) مع الحفاظ على نفس الوظيفة تماماً. ضع النسخة المحسّنة كاملة في "correctedCode"، واشرح كل تحسين بـ"suggestions".`
      : `اشرح هذا الكود فقط دون تعديله. اجعل "correctedCode" مطابقاً تماماً للكود الأصلي بدون أي تغيير، و"issuesFound" مصفوفة فارغة إلا لو لاحظت خطأ حقيقي واضح.`;

  return `أعدّ تحليلاً كاملاً لكود Arduino/C++ التالي بصيغة JSON فقط (بدون أي شرح خارج الـJSON، بدون markdown، بدون علامات \`\`\`)، بهذا الشكل بالضبط:
{
  "summary": "ملخص بسيط جداً لوظيفة الكود بجملة أو جملتين",
  "sections": [
    {"lines": "وصف الجزء، مثال: دالة setup()", "explanation": "شرح وظيفة هذا الجزء بلغة مبسطة"}
  ],
  "issuesFound": [
    {"issue": "وصف الخطأ بدقة", "location": "أين بالضبط بالكود (اسم الدالة/المتغير/رقم تقريبي للسطر)", "fix": "كيف تحديداً يُصلح"}
  ],
  "correctedCode": "الكود الكامل (مصحح أو محسّن أو نفسه حسب الطلب) قابل للرفع مباشرة بدون أخطاء",
  "simplifiedForStudents": "شرح مبسّط جداً بلغة يفهمها طالب بهذا الصف، كأنك تشرح شفهياً أمام الفصل",
  "suggestions": ["اقتراح تحسين اختياري (تسمية أوضح، تعليق، كفاءة...)"]
}

${modeInstruction}

الصف الدراسي (لضبط مستوى الشرح): ${grade}

الكود المطلوب تحليله:
\`\`\`
${code}
\`\`\`

قسّم "sections" لأجزاء منطقية (كل دالة أو كتلة مهمة)، لا سطراً سطراً حرفياً. لو الكود سليم 100% بدون أي خطأ حقيقي، اجعل "issuesFound" مصفوفة فارغة ولا تخترع أخطاء وهمية.`;
}

export default function CodeHelperPage() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [mode, setMode] = useState(MODES[0].id);
  const [code, setCode] = useState("");
  const [problem, setProblem] = useState("");
  const [grade, setGrade] = useState(GRADES[6]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<CodeHelperResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const { ownerId } = useAiOwner();
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result) resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [result]);

  useEffect(() => { getGroqKey().then(setApiKey); }, []);

  const generate = async () => {
    if (!code.trim() || loading) return;
    setLoading(true);
    setError("");
    setResult(null);
    setSaved(false);
    try {
      const raw = await callGroqText(
        [
          { role: "system", content: ROBOTICS_EXPERT_SYSTEM_PROMPT },
          { role: "user", content: buildPrompt(mode, code.trim(), problem.trim(), grade) },
        ],
        apiKey || "",
        4000,
        0.3
      );
      const parsed = extractJson<CodeHelperResult>(raw);
      if (!parsed || !parsed.summary) {
        throw new Error("تعذّر فهم رد الذكاء الاصطناعي، حاول مرة أخرى");
      }
      setResult(parsed);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  const buildTextExport = (r: CodeHelperResult): string => {
    const lines: string[] = [r.summary, ""];
    if (r.issuesFound.length) { lines.push("الأخطاء الموجودة:"); r.issuesFound.forEach(i => lines.push(`- ${i.issue} (${i.location}) → ${i.fix}`)); lines.push(""); }
    lines.push("الكود:", r.correctedCode, "", "شرح مبسّط:", r.simplifiedForStudents);
    return lines.join("\n");
  };

  const copyResult = () => {
    if (!result) return;
    navigator.clipboard.writeText(buildTextExport(result));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyCode = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.correctedCode);
  };

  const saveToHistory = async () => {
    if (!result || !ownerId) return;
    await saveAiHistoryItem(ownerId, {
      tool: "code-helper", toolLabel: "مساعد الكود",
      title: result.summary.slice(0, 60), subject: "الروبوتات والذكاء الاصطناعي", grade,
      textExport: buildTextExport(result),
    });
    setSaved(true);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <Link href="/ai-tools" className="hover:text-slate-700 flex items-center gap-1">
          <ChevronRight className="w-3.5 h-3.5" /> أدوات الذكاء الاصطناعي
        </Link>
        <span>/</span>
        <span className="text-gray-600">مساعد كود الروبوتات</span>
      </div>

      <div className="card p-5 bg-gradient-to-l from-slate-800 to-slate-600 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <Bug className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">مساعد شرح وتصحيح كود الروبوتات</h1>
            <p className="text-white/90 text-sm">الصق كود Arduino/ESP32 — يشرحه أو يكتشف الخطأ ويصححه أو يحسّنه لك فوراً</p>
          </div>
        </div>
      </div>

      {apiKey === "" && (
        <div className="card p-4 bg-yellow-50 border border-yellow-200 flex items-center justify-between gap-3">
          <p className="text-sm text-yellow-800">⚠️ لم يتم إعداد مفتاح الذكاء الاصطناعي بعد.</p>
          <Link href="/admin" className="flex items-center gap-1 bg-yellow-400 text-gray-900 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-yellow-300 flex-shrink-0">
            <Key className="w-3.5 h-3.5" /> إعداد المفتاح
          </Link>
        </div>
      )}

      <div className="card p-5 space-y-4">
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1.5 block">وش تحتاج؟</label>
          <div className="grid grid-cols-3 gap-2">
            {MODES.map(m => (
              <button key={m.id} onClick={() => setMode(m.id)}
                className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${mode === m.id ? "bg-slate-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {mode === "debug" && (
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">وش المشكلة اللي تلاحظها؟</label>
            <input value={problem} onChange={e => setProblem(e.target.value)}
              placeholder="مثال: السيرفو ما يتحرك، الشاشة تطلع فاضية، القيم اللي تطلع غلط..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-slate-500" />
          </div>
        )}

        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block">الصف الدراسي (لضبط مستوى الشرح)</label>
          <select value={grade} onChange={e => setGrade(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-slate-500">
            {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block">الكود *</label>
          <textarea value={code} onChange={e => setCode(e.target.value)} rows={10} dir="ltr"
            placeholder="الصق كود الأردوينو هنا..."
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-mono bg-gray-50 outline-none focus:border-slate-500" />
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}
        <button onClick={generate} disabled={!code.trim() || loading || apiKey === ""}
          className="w-full flex items-center justify-center gap-2 bg-slate-800 text-white py-3 rounded-xl text-sm font-bold hover:bg-slate-700 transition-colors disabled:opacity-40">
          {loading ? <>جارٍ تحليل الكود...</> : <><Sparkles className="w-4 h-4" /> تحليل الكود</>}
        </button>
      </div>

      {result && (
        <div ref={resultRef} className="card p-6 space-y-5">
          <div className="flex items-center gap-2 flex-wrap">
            {ownerId && (
              <button onClick={saveToHistory} disabled={saved} className="flex items-center gap-1.5 text-xs bg-slate-100 text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-200 disabled:opacity-60">
                {saved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <BookmarkPlus className="w-3.5 h-3.5" />} {saved ? "محفوظ بسجلي" : "حفظ بسجلي"}
              </button>
            )}
            <button onClick={copyResult} className="flex items-center gap-1.5 text-xs bg-gray-100 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-200">
              <Copy className="w-3.5 h-3.5" /> {copied ? "تم النسخ ✓" : "نسخ التحليل"}
            </button>
            <button onClick={() => { setResult(null); setCode(""); setProblem(""); }} className="flex items-center gap-1.5 text-xs bg-gray-100 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-200">
              <RotateCcw className="w-3.5 h-3.5" /> تحليل جديد
            </button>
          </div>

          <div className="border-b border-gray-100 pb-4">
            <p className="text-gray-800 font-semibold">{result.summary}</p>
          </div>

          {result.issuesFound.length > 0 ? (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-bold text-red-700 flex items-center gap-1.5"><XCircle className="w-4 h-4" /> أخطاء موجودة ({result.issuesFound.length})</h3>
              {result.issuesFound.map((iss, i) => (
                <div key={i} className="text-sm border-r-2 border-red-300 pr-3">
                  <p className="font-semibold text-red-800">{iss.issue}</p>
                  <p className="text-red-600 text-xs mt-0.5">📍 {iss.location}</p>
                  <p className="text-green-700 text-xs mt-1">✓ الحل: {iss.fix}</p>
                </div>
              ))}
            </div>
          ) : (
            mode === "debug" && (
              <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <p className="text-sm text-green-700 font-semibold">ما لقيت أي خطأ واضح بالكود — جرّب تتأكد من التوصيلات الفيزيائية.</p>
              </div>
            )
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-gray-700 flex items-center gap-1.5"><Code2 className="w-4 h-4 text-slate-600" /> الكود {mode !== "explain" ? "(بعد التعديل)" : ""}</h3>
              <button onClick={copyCode} className="text-xs text-slate-600 hover:text-slate-800 flex items-center gap-1"><Copy className="w-3 h-3" /> نسخ الكود فقط</button>
            </div>
            <pre dir="ltr" className="bg-gray-900 text-green-300 text-xs rounded-xl p-4 overflow-x-auto whitespace-pre-wrap leading-relaxed">{result.correctedCode}</pre>
          </div>

          {result.sections.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-2">شرح أجزاء الكود</h3>
              <div className="space-y-2">{result.sections.map((s, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs font-mono text-slate-600 mb-1" dir="ltr">{s.lines}</p>
                  <p className="text-sm text-gray-700">{s.explanation}</p>
                </div>
              ))}</div>
            </div>
          )}

          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-2">شرح مبسّط للطلاب</h3>
            <p className="text-sm text-gray-600 bg-blue-50 rounded-xl p-3 leading-relaxed whitespace-pre-wrap">{result.simplifiedForStudents}</p>
          </div>

          {result.suggestions.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5"><Lightbulb className="w-4 h-4 text-amber-500" /> اقتراحات إضافية</h3>
              <ul className="space-y-1">{result.suggestions.map((s, i) => <li key={i} className="text-sm text-gray-700 flex items-start gap-2"><span className="text-amber-500 mt-0.5">•</span>{s}</li>)}</ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

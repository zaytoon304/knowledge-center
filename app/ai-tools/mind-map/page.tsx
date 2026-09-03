"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Network, Sparkles, Printer, Copy, RotateCcw, Key, ChevronRight, BookmarkPlus, BookmarkCheck } from "lucide-react";
import { getGroqKey, callGroqText, extractJson } from "@/lib/groq";
import { SUBJECTS } from "@/lib/subjects";
import { GRADES } from "@/lib/grades";
import { useAiOwner, saveAiHistoryItem } from "@/lib/aiHistory";

interface Branch {
  title: string;
  points: string[];
}

interface MindMap {
  topic: string;
  branches: Branch[];
}

const BRANCH_COLORS = [
  { bar: "bg-violet-600", chip: "bg-violet-100 text-violet-800", ring: "border-violet-200" },
  { bar: "bg-blue-600", chip: "bg-blue-100 text-blue-800", ring: "border-blue-200" },
  { bar: "bg-emerald-600", chip: "bg-emerald-100 text-emerald-800", ring: "border-emerald-200" },
  { bar: "bg-amber-600", chip: "bg-amber-100 text-amber-800", ring: "border-amber-200" },
  { bar: "bg-rose-600", chip: "bg-rose-100 text-rose-800", ring: "border-rose-200" },
  { bar: "bg-cyan-600", chip: "bg-cyan-100 text-cyan-800", ring: "border-cyan-200" },
];

function buildPrompt(subject: string, grade: string, topic: string, branchCount: number, notes: string): string {
  return `أنت معلّم خبير بتلخيص الدروس بصرياً. حوّل الموضوع التالي إلى خريطة ذهنية بصيغة JSON فقط (بدون أي شرح خارج الـJSON، بدون markdown)، بهذا الشكل بالضبط:
{
  "topic": "العنوان المركزي للخريطة",
  "branches": [
    {"title": "عنوان الفرع الرئيسي", "points": ["نقطة فرعية 1", "نقطة فرعية 2", "نقطة فرعية 3"]}
  ]
}

المطلوب: ${branchCount} فروع رئيسية بالضبط، كل فرع فيه من 2 إلى 4 نقاط فرعية مختصرة (كلمات أو جمل قصيرة جداً، لا فقرات).
الموضوع: "${topic}"
الصف الدراسي: ${grade}
المادة: ${subject}
${notes ? `ملاحظات إضافية من المعلم: ${notes}` : ""}

اجعل الفروع تغطي أهم جوانب الموضوع (تعريف، أنواع، أمثلة، أهمية...) بما يناسب المرحلة العمرية.`;
}

export default function MindMapPage() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [grade, setGrade] = useState(GRADES[0]);
  const [topic, setTopic] = useState("");
  const [branchCount, setBranchCount] = useState(5);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [map, setMap] = useState<MindMap | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const { ownerId } = useAiOwner();
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (map) resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [map]);

  useEffect(() => {
    getGroqKey().then(setApiKey);
  }, []);

  const generate = async () => {
    if (!topic.trim() || loading) return;
    setLoading(true);
    setError("");
    setMap(null);
    setSaved(false);
    try {
      const raw = await callGroqText(
        [{ role: "user", content: buildPrompt(subject, grade, topic.trim(), branchCount, notes.trim()) }],
        apiKey || "",
        2500
      );
      const parsed = extractJson<MindMap>(raw);
      if (!parsed || !Array.isArray(parsed.branches) || parsed.branches.length === 0) {
        throw new Error("تعذّر فهم رد الذكاء الاصطناعي، حاول مرة أخرى");
      }
      setMap(parsed);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  const buildTextExport = (m: MindMap): string => {
    const lines: string[] = [m.topic, ""];
    m.branches.forEach(b => {
      lines.push(`• ${b.title}`);
      b.points.forEach(p => lines.push(`   - ${p}`));
    });
    return lines.join("\n");
  };

  const copyMap = () => {
    if (!map) return;
    navigator.clipboard.writeText(buildTextExport(map));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const saveToHistory = async () => {
    if (!map || !ownerId) return;
    await saveAiHistoryItem(ownerId, {
      tool: "mind-map",
      toolLabel: "خريطة ذهنية",
      title: map.topic,
      subject,
      grade,
      textExport: buildTextExport(map),
    });
    setSaved(true);
  };

  const printMap = () => {
    document.body.classList.add("printing-only");
    window.print();
    setTimeout(() => document.body.classList.remove("printing-only"), 500);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="no-print flex items-center gap-2 text-xs text-gray-400">
        <Link href="/ai-tools" className="hover:text-amber-600 flex items-center gap-1">
          <ChevronRight className="w-3.5 h-3.5" /> أدوات الذكاء الاصطناعي
        </Link>
        <span>/</span>
        <span className="text-gray-600">مولّد الخريطة الذهنية</span>
      </div>

      <div className="no-print card p-5 bg-gradient-to-l from-amber-700 to-orange-500 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <Network className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">مولّد الخريطة الذهنية</h1>
            <p className="text-white/90 text-sm">حوّل أي موضوع درس إلى خريطة ذهنية بصرية واضحة خلال ثوانٍ</p>
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
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-amber-500">
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">الصف الدراسي</label>
            <select value={grade} onChange={e => setGrade(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-amber-500">
              {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block">الموضوع *</label>
          <input value={topic} onChange={e => setTopic(e.target.value)}
            placeholder="مثال: دورة الماء في الطبيعة، أركان الإسلام..."
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-amber-500" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">عدد الفروع الرئيسية</label>
            <input type="number" min={3} max={6} value={branchCount} onChange={e => setBranchCount(Number(e.target.value))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-amber-500" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">ملاحظات إضافية (اختياري)</label>
            <input value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="مثال: ركّز على الأمثلة الواقعية"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-amber-500" />
          </div>
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <button onClick={generate} disabled={!topic.trim() || loading || apiKey === ""}
          className="w-full flex items-center justify-center gap-2 bg-amber-700 text-white py-3 rounded-xl text-sm font-bold hover:bg-amber-600 transition-colors disabled:opacity-40">
          {loading ? (
            <>جارٍ رسم الخريطة...</>
          ) : (
            <><Sparkles className="w-4 h-4" /> توليد الخريطة الذهنية</>
          )}
        </button>
      </div>

      {/* Result */}
      {map && (
        <div ref={resultRef} className="print-area card p-6 space-y-6">
          <div className="flex items-center justify-between gap-3 flex-wrap no-print">
            <div className="flex gap-2">
              {ownerId && (
                <button onClick={saveToHistory} disabled={saved} className="flex items-center gap-1.5 text-xs bg-amber-100 text-amber-700 px-3 py-2 rounded-lg hover:bg-amber-200 disabled:opacity-60">
                  {saved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <BookmarkPlus className="w-3.5 h-3.5" />} {saved ? "محفوظة بسجلي" : "حفظ بسجلي"}
                </button>
              )}
              <button onClick={copyMap} className="flex items-center gap-1.5 text-xs bg-gray-100 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-200">
                <Copy className="w-3.5 h-3.5" /> {copied ? "تم النسخ ✓" : "نسخ كنص"}
              </button>
              <button onClick={printMap} className="flex items-center gap-1.5 text-xs bg-gray-100 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-200">
                <Printer className="w-3.5 h-3.5" /> طباعة
              </button>
              <button onClick={() => { setMap(null); setTopic(""); }} className="flex items-center gap-1.5 text-xs bg-gray-100 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-200">
                <RotateCcw className="w-3.5 h-3.5" /> خريطة جديدة
              </button>
            </div>
          </div>

          {/* Central topic */}
          <div className="flex justify-center">
            <div className="bg-gradient-to-l from-amber-700 to-orange-500 text-white font-bold text-lg px-8 py-4 rounded-2xl shadow-md text-center max-w-md">
              {map.topic}
            </div>
          </div>

          {/* Connector */}
          <div className="flex justify-center">
            <div className="w-0.5 h-6 bg-gray-200" />
          </div>

          {/* Branches */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {map.branches.map((b, i) => {
              const c = BRANCH_COLORS[i % BRANCH_COLORS.length];
              return (
                <div key={i} className={`rounded-2xl border ${c.ring} overflow-hidden`}>
                  <div className={`${c.bar} text-white font-bold text-sm px-4 py-2.5`}>{b.title}</div>
                  <ul className="p-4 space-y-2">
                    {b.points.map((p, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className={`flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full ${c.bar}`} />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

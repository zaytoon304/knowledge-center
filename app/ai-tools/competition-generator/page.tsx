"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Trophy, Sparkles, Printer, Copy, RotateCcw, Key, ChevronRight, Clock, Users, ListChecks, Award, Lightbulb } from "lucide-react";
import { getGroqKey, callGroqText, extractJson } from "@/lib/groq";
import { SUBJECTS } from "@/lib/subjects";
import { GRADES } from "@/lib/grades";

interface Competition {
  title: string;
  goal: string;
  duration: string;
  teams: string;
  materials: string[];
  rules: string[];
  scoring: string;
  variation: string;
}

const FORMATS = ["مسابقة بين فرق", "مسابقة فردية (بطولة صفية)", "مسابقة سريعة (Quiz خاطف)", "مسابقة محطات (Stations)"];

function buildPrompt(subject: string, grade: string, topic: string, format: string, duration: string, notes: string): string {
  return `أنت خبير بتصميم المسابقات الصفية المشوّقة. صمّم مسابقة صفية بصيغة JSON فقط (بدون أي شرح خارج الـJSON، بدون markdown)، بهذا الشكل بالضبط:
{
  "title": "اسم جذاب للمسابقة",
  "goal": "الهدف التعليمي من المسابقة بجملة واحدة",
  "duration": "${duration} دقيقة",
  "teams": "وصف تقسيم الفرق أو المشاركين",
  "materials": ["مادة/أداة 1", "مادة/أداة 2"],
  "rules": ["قاعدة/خطوة تنفيذ 1", "قاعدة/خطوة تنفيذ 2", "قاعدة/خطوة تنفيذ 3"],
  "scoring": "وصف واضح لنظام احتساب النقاط وتحديد الفائز",
  "variation": "فكرة لتبسيط المسابقة أو تصعيبها"
}

نمط المسابقة المطلوب: ${format}
الموضوع: "${topic}"
الصف الدراسي: ${grade}
المادة: ${subject}
مدة المسابقة: ${duration} دقيقة
${notes ? `ملاحظات إضافية من المعلم: ${notes}` : ""}

اجعل المسابقة مشوّقة وعادلة وقابلة للتنفيذ فعلياً داخل الفصل بأدوات بسيطة متاحة عادة، ومناسبة تماماً للمرحلة العمرية.`;
}

export default function CompetitionGeneratorPage() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [grade, setGrade] = useState(GRADES[0]);
  const [topic, setTopic] = useState("");
  const [format, setFormat] = useState(FORMATS[0]);
  const [duration, setDuration] = useState("20");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [comp, setComp] = useState<Competition | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getGroqKey().then(setApiKey);
  }, []);

  const generate = async () => {
    if (!topic.trim() || loading) return;
    setLoading(true);
    setError("");
    setComp(null);
    try {
      const raw = await callGroqText(
        [{ role: "user", content: buildPrompt(subject, grade, topic.trim(), format, duration, notes.trim()) }],
        apiKey || "",
        2000
      );
      const parsed = extractJson<Competition>(raw);
      if (!parsed || !Array.isArray(parsed.rules)) throw new Error("تعذّر فهم رد الذكاء الاصطناعي، حاول مرة أخرى");
      setComp(parsed);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  const copyComp = () => {
    if (!comp) return;
    const lines = [
      comp.title, "",
      `الهدف: ${comp.goal}`,
      `المدة: ${comp.duration} | الفرق: ${comp.teams}`,
      "", `الأدوات: ${comp.materials.join("، ")}`, "",
      "قواعد المسابقة:", ...comp.rules.map((r, i) => `${i + 1}. ${r}`),
      "", `احتساب النقاط: ${comp.scoring}`,
      "", `فكرة للتعديل: ${comp.variation}`,
    ];
    navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const printComp = () => {
    document.body.classList.add("printing-only");
    window.print();
    setTimeout(() => document.body.classList.remove("printing-only"), 500);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="no-print flex items-center gap-2 text-xs text-gray-400">
        <Link href="/ai-tools" className="hover:text-red-600 flex items-center gap-1">
          <ChevronRight className="w-3.5 h-3.5" /> أدوات الذكاء الاصطناعي
        </Link>
        <span>/</span>
        <span className="text-gray-600">مولّد المسابقات الصفية</span>
      </div>

      <div className="no-print card p-5 bg-gradient-to-l from-red-700 to-orange-500 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <Trophy className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">مولّد المسابقات الصفية</h1>
            <p className="text-white/90 text-sm">مسابقة جاهزة بقواعدها ونظام نقاطها، تُشعل حماس الصف خلال ثوانٍ</p>
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
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-red-500">
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">الصف الدراسي</label>
            <select value={grade} onChange={e => setGrade(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-red-500">
              {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block">الموضوع أو المهارة *</label>
          <input value={topic} onChange={e => setTopic(e.target.value)}
            placeholder="مثال: مراجعة الوحدة الثالثة، جدول الضرب..."
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-red-500" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">نمط المسابقة</label>
            <select value={format} onChange={e => setFormat(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-red-500">
              {FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">المدة (بالدقائق)</label>
            <input type="number" min={5} max={60} value={duration} onChange={e => setDuration(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-red-500" />
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block">ملاحظات إضافية (اختياري)</label>
          <input value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="مثال: فصل كبير 30 طالب، بدون أدوات إلكترونية"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-red-500" />
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <button onClick={generate} disabled={!topic.trim() || loading || apiKey === ""}
          className="w-full flex items-center justify-center gap-2 bg-red-700 text-white py-3 rounded-xl text-sm font-bold hover:bg-red-600 transition-colors disabled:opacity-40">
          {loading ? (
            <>جارٍ تصميم المسابقة...</>
          ) : (
            <><Sparkles className="w-4 h-4" /> توليد مسابقة صفية</>
          )}
        </button>
      </div>

      {/* Result */}
      {comp && (
        <div className="print-area card p-6 space-y-5">
          <div className="flex items-center justify-between gap-3 flex-wrap no-print">
            <div className="flex gap-2">
              <button onClick={copyComp} className="flex items-center gap-1.5 text-xs bg-gray-100 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-200">
                <Copy className="w-3.5 h-3.5" /> {copied ? "تم النسخ ✓" : "نسخ المسابقة"}
              </button>
              <button onClick={printComp} className="flex items-center gap-1.5 text-xs bg-gray-100 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-200">
                <Printer className="w-3.5 h-3.5" /> طباعة
              </button>
              <button onClick={() => { setComp(null); setTopic(""); }} className="flex items-center gap-1.5 text-xs bg-gray-100 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-200">
                <RotateCcw className="w-3.5 h-3.5" /> مسابقة جديدة
              </button>
            </div>
          </div>

          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-xl font-bold text-gray-800">{comp.title}</h2>
            <p className="text-sm text-gray-500 mt-1">{comp.goal}</p>
            <div className="flex gap-4 mt-3 text-xs text-gray-500">
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-red-600" /> {comp.duration}</span>
              <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-red-600" /> {comp.teams}</span>
            </div>
          </div>

          <div>
            <h3 className="flex items-center gap-2 font-bold text-gray-700 mb-2 text-sm">أدوات المسابقة</h3>
            <p className="text-sm text-gray-600">{comp.materials?.join("، ")}</p>
          </div>

          <div>
            <h3 className="flex items-center gap-2 font-bold text-gray-700 mb-3 text-sm">
              <ListChecks className="w-4 h-4 text-red-600" /> قواعد المسابقة
            </h3>
            <div className="space-y-2">
              {comp.rules?.map((r, i) => (
                <div key={i} className="flex items-start gap-3 bg-gray-50 rounded-xl p-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-700 text-white text-xs font-bold flex items-center justify-center">{i + 1}</span>
                  <p className="text-sm text-gray-700 flex-1">{r}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
            <h3 className="flex items-center gap-2 font-bold text-amber-800 text-sm mb-1">
              <Award className="w-4 h-4" /> احتساب النقاط وتحديد الفائز
            </h3>
            <p className="text-sm text-amber-700">{comp.scoring}</p>
          </div>

          {comp.variation && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3">
              <h3 className="flex items-center gap-2 font-bold text-red-800 text-sm mb-1">
                <Lightbulb className="w-4 h-4" /> فكرة للتعديل
              </h3>
              <p className="text-sm text-red-700">{comp.variation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

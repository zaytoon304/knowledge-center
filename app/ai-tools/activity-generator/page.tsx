"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Puzzle, Sparkles, Printer, Copy, RotateCcw, Key, ChevronRight, Clock, Users, Boxes, ListChecks, Lightbulb } from "lucide-react";
import { getGroqKey, callGroqText, extractJson } from "@/lib/groq";
import { SUBJECTS } from "@/lib/subjects";
import { GRADES } from "@/lib/grades";

interface Activity {
  title: string;
  goal: string;
  duration: string;
  groupSize: string;
  materials: string[];
  steps: string[];
  variation: string;
}

const ACTIVITY_STYLES = ["نشاط جماعي تعاوني", "نشاط تنافسي (مسابقة صفية)", "نشاط فردي", "لعبة حركية"];

function buildPrompt(subject: string, grade: string, topic: string, style: string, duration: string, notes: string): string {
  return `أنت خبير بتصميم الأنشطة الصفية التفاعلية الممتعة. صمّم نشاطاً صفياً بصيغة JSON فقط (بدون أي شرح خارج الـJSON، بدون markdown)، بهذا الشكل بالضبط:
{
  "title": "اسم جذاب للنشاط",
  "goal": "الهدف التعليمي من النشاط بجملة واحدة",
  "duration": "${duration} دقيقة",
  "groupSize": "وصف حجم المجموعات (مثال: مجموعات من 4-5 طلاب)",
  "materials": ["مادة/أداة 1", "مادة/أداة 2"],
  "steps": ["خطوة تنفيذ 1", "خطوة تنفيذ 2", "خطوة تنفيذ 3"],
  "variation": "فكرة لتعديل النشاط أو تبسيطه لفئة مختلفة"
}

نوع النشاط المطلوب: ${style}
الموضوع: "${topic}"
الصف الدراسي: ${grade}
المادة: ${subject}
مدة النشاط: ${duration} دقيقة
${notes ? `ملاحظات إضافية من المعلم: ${notes}` : ""}

اجعل النشاط ممتعاً وعملياً وقابلاً للتنفيذ فعلياً داخل الفصل بأدوات بسيطة متاحة عادة، ومناسباً تماماً للمرحلة العمرية.`;
}

export default function ActivityGeneratorPage() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [grade, setGrade] = useState(GRADES[0]);
  const [topic, setTopic] = useState("");
  const [style, setStyle] = useState(ACTIVITY_STYLES[0]);
  const [duration, setDuration] = useState("15");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activity, setActivity] = useState<Activity | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getGroqKey().then(setApiKey);
  }, []);

  const generate = async () => {
    if (!topic.trim() || loading) return;
    setLoading(true);
    setError("");
    setActivity(null);
    try {
      const raw = await callGroqText(
        [{ role: "user", content: buildPrompt(subject, grade, topic.trim(), style, duration, notes.trim()) }],
        apiKey || "",
        2000
      );
      const parsed = extractJson<Activity>(raw);
      if (!parsed || !Array.isArray(parsed.steps)) throw new Error("تعذّر فهم رد الذكاء الاصطناعي، حاول مرة أخرى");
      setActivity(parsed);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  const copyActivity = () => {
    if (!activity) return;
    const lines = [
      activity.title, "",
      `الهدف: ${activity.goal}`,
      `المدة: ${activity.duration} | حجم المجموعة: ${activity.groupSize}`,
      "", `الأدوات: ${activity.materials.join("، ")}`, "",
      "خطوات التنفيذ:", ...activity.steps.map((s, i) => `${i + 1}. ${s}`),
      "", `فكرة للتعديل: ${activity.variation}`,
    ];
    navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const printActivity = () => {
    document.body.classList.add("printing-only");
    window.print();
    setTimeout(() => document.body.classList.remove("printing-only"), 500);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="no-print flex items-center gap-2 text-xs text-gray-400">
        <Link href="/ai-tools" className="hover:text-pink-600 flex items-center gap-1">
          <ChevronRight className="w-3.5 h-3.5" /> أدوات الذكاء الاصطناعي
        </Link>
        <span>/</span>
        <span className="text-gray-600">مولّد الأنشطة الصفية</span>
      </div>

      <div className="no-print card p-5 bg-gradient-to-l from-pink-700 to-rose-500 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <Puzzle className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">مولّد الأنشطة الصفية</h1>
            <p className="text-white/90 text-sm">نشاط ممتع وجاهز للتنفيذ فوراً يثري حصتك خلال ثوانٍ</p>
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
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-pink-500">
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">الصف الدراسي</label>
            <select value={grade} onChange={e => setGrade(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-pink-500">
              {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block">الموضوع أو المهارة *</label>
          <input value={topic} onChange={e => setTopic(e.target.value)}
            placeholder="مثال: جدول الضرب، المفردات الجديدة بالوحدة الثالثة..."
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-pink-500" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">نوع النشاط</label>
            <select value={style} onChange={e => setStyle(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-pink-500">
              {ACTIVITY_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">المدة (بالدقائق)</label>
            <input type="number" min={5} max={60} value={duration} onChange={e => setDuration(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-pink-500" />
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block">ملاحظات إضافية (اختياري)</label>
          <input value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="مثال: بدون أدوات، الفصل صغير المساحة"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-pink-500" />
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <button onClick={generate} disabled={!topic.trim() || loading || apiKey === ""}
          className="w-full flex items-center justify-center gap-2 bg-pink-700 text-white py-3 rounded-xl text-sm font-bold hover:bg-pink-600 transition-colors disabled:opacity-40">
          {loading ? (
            <>جارٍ تصميم النشاط...</>
          ) : (
            <><Sparkles className="w-4 h-4" /> توليد نشاط صفي</>
          )}
        </button>
      </div>

      {/* Result */}
      {activity && (
        <div className="print-area card p-6 space-y-5">
          <div className="flex items-center justify-between gap-3 flex-wrap no-print">
            <div className="flex gap-2">
              <button onClick={copyActivity} className="flex items-center gap-1.5 text-xs bg-gray-100 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-200">
                <Copy className="w-3.5 h-3.5" /> {copied ? "تم النسخ ✓" : "نسخ النشاط"}
              </button>
              <button onClick={printActivity} className="flex items-center gap-1.5 text-xs bg-gray-100 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-200">
                <Printer className="w-3.5 h-3.5" /> طباعة
              </button>
              <button onClick={() => { setActivity(null); setTopic(""); }} className="flex items-center gap-1.5 text-xs bg-gray-100 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-200">
                <RotateCcw className="w-3.5 h-3.5" /> نشاط جديد
              </button>
            </div>
          </div>

          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-xl font-bold text-gray-800">{activity.title}</h2>
            <p className="text-sm text-gray-500 mt-1">{activity.goal}</p>
            <div className="flex gap-4 mt-3 text-xs text-gray-500">
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-pink-600" /> {activity.duration}</span>
              <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-pink-600" /> {activity.groupSize}</span>
            </div>
          </div>

          <div>
            <h3 className="flex items-center gap-2 font-bold text-gray-700 mb-2 text-sm">
              <Boxes className="w-4 h-4 text-pink-600" /> الأدوات المطلوبة
            </h3>
            <p className="text-sm text-gray-600">{activity.materials?.join("، ")}</p>
          </div>

          <div>
            <h3 className="flex items-center gap-2 font-bold text-gray-700 mb-3 text-sm">
              <ListChecks className="w-4 h-4 text-pink-600" /> خطوات التنفيذ
            </h3>
            <div className="space-y-2">
              {activity.steps?.map((s, i) => (
                <div key={i} className="flex items-start gap-3 bg-gray-50 rounded-xl p-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-pink-700 text-white text-xs font-bold flex items-center justify-center">{i + 1}</span>
                  <p className="text-sm text-gray-700 flex-1">{s}</p>
                </div>
              ))}
            </div>
          </div>

          {activity.variation && (
            <div className="bg-pink-50 border border-pink-100 rounded-xl p-3">
              <h3 className="flex items-center gap-2 font-bold text-pink-800 text-sm mb-1">
                <Lightbulb className="w-4 h-4" /> فكرة للتعديل
              </h3>
              <p className="text-sm text-pink-700">{activity.variation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

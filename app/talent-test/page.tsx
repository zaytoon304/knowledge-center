"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Clock, CheckCircle, LogIn, Lock, Loader2 } from "lucide-react";
import { useAuth, StudentProfile } from "@/contexts/AuthContext";
import { cloudGet, cloudSet } from "@/lib/cloud";

/* ====================== الجدول (تاريخ + صف) — يُدار من لوحة الإدارة ====================== */
interface ScheduleEntry { date: string; grade: string }

function todayLocalStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/* ====================== أنواع الأسئلة ====================== */
type QType = "analysis" | "inference" | "synthesis" | "evaluation" | "spatial";
interface Question { q: string; opts: string[]; ans: number; type: QType; visual?: string }

const TYPE_LABELS: Record<QType, string> = {
  analysis: "🔍 تحليل",
  inference: "🔢 استنتاج",
  synthesis: "🔗 تركيب",
  evaluation: "🧠 تقييم",
  spatial: "🔺 تفكير مكاني",
};
const TYPE_BG: Record<QType, string> = {
  analysis: "bg-emerald-50 border-emerald-100",
  inference: "bg-indigo-50 border-indigo-100",
  synthesis: "bg-rose-50 border-rose-100",
  evaluation: "bg-blue-50 border-blue-100",
  spatial: "bg-cyan-50 border-cyan-100",
};

function VisualDisplay({ type, visual }: { type: QType; visual?: string }) {
  if (!visual) return null;
  if (type === "inference") {
    const items = visual.split(" ");
    return (
      <div className="bg-white border border-indigo-100 rounded-2xl p-4 my-3">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {items.map((item, i) => (
            <div key={i} className={`min-w-[44px] px-3 py-2.5 rounded-xl font-bold text-center text-lg ${item === "❓" ? "bg-indigo-100 border-2 border-dashed border-indigo-400 text-indigo-500" : "bg-gray-50 border border-gray-200 text-gray-800 shadow-sm"}`}>
              {item}
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (type === "analysis") {
    const items = visual.split(" | ");
    const colors = ["bg-blue-50 border-blue-200 text-blue-800", "bg-green-50 border-green-200 text-green-800", "bg-amber-50 border-amber-200 text-amber-800", "bg-rose-50 border-rose-200 text-rose-800", "bg-purple-50 border-purple-200 text-purple-800"];
    return (
      <div className="bg-white border border-emerald-100 rounded-2xl p-4 my-3">
        <div className="flex flex-wrap justify-center gap-2">
          {items.map((item, i) => <span key={i} className={`px-4 py-2 rounded-xl border-2 font-bold text-sm ${colors[i % colors.length]}`}>{item}</span>)}
        </div>
      </div>
    );
  }
  if (type === "synthesis") {
    const parts = visual.split("::");
    return (
      <div className="bg-white border border-rose-100 rounded-2xl p-4 my-3">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {parts[0] && parts[0].split(":").map((p, i) => (
            <span key={i}>{i > 0 && <span className="text-rose-400 font-bold mx-1">:</span>}<span className="bg-rose-50 border border-rose-200 text-rose-800 px-3 py-1.5 rounded-xl font-bold">{p.trim()}</span></span>
          ))}
          <span className="text-gray-400 font-bold mx-2">::</span>
          {parts[1] && parts[1].split(":").map((p, i) => (
            <span key={i}>{i > 0 && <span className="text-rose-400 font-bold mx-1">:</span>}<span className={`px-3 py-1.5 rounded-xl font-bold border-2 ${p.trim() === "❓" ? "bg-rose-100 border-dashed border-rose-400 text-rose-500 text-xl" : "bg-rose-50 border-rose-200 text-rose-800"}`}>{p.trim()}</span></span>
          ))}
        </div>
      </div>
    );
  }
  if (type === "spatial") {
    return (
      <div className="bg-white border border-cyan-100 rounded-2xl p-4 my-3 text-center">
        <p className="font-mono text-2xl tracking-widest text-gray-700">{visual}</p>
      </div>
    );
  }
  return null;
}

/* ====================== بنوك أسئلة مهارات التفكير العليا (حصرية لهذا الاختبار) ====================== */
/* الفئة 1: الصف الرابع والخامس الابتدائي */
const TIER_1: Question[] = [
  { type: "analysis", q: "أيّ عنصر لا ينتمي للمجموعة من حيث الوظيفة؟", opts: ["مطرقة", "مفك", "منشار", "كتاب"], ans: 3, visual: "مطرقة | مفك | منشار | كتاب" },
  { type: "inference", q: "ما العدد الذي يكمل النمط؟", opts: ["18", "20", "22", "16"], ans: 0, visual: "2 6 10 14 ❓" },
  { type: "synthesis", q: "أكمل العلاقة", opts: ["يطبخ", "يقرأ", "ينام", "يلعب"], ans: 0, visual: "طبيب : يعالج :: طباخ : ❓" },
  { type: "evaluation", q: "كل الطيور تطير، والبطريق طائر. فهل يطير البطريق؟", opts: ["نعم لأنه طائر", "لا، فالبطريق لا يطير فعلياً رغم كونه طائراً", "لا يمكن معرفة ذلك", "نعم دائماً"], ans: 1 },
  { type: "spatial", q: "إذا دار المربع 90 درجة، بماذا يتحول شكله الخارجي؟", opts: ["يتغير لمثلث", "يبقى مربعاً بنفس الشكل", "يصبح دائرة", "يختفي"], ans: 1, visual: "□ → ⟳90° → ؟" },
  { type: "analysis", q: "أيّ عنصر مختلف عن البقية؟", opts: ["أسد", "نمر", "قطة منزلية", "فهد"], ans: 2, visual: "أسد | نمر | قطة منزلية | فهد" },
  { type: "inference", q: "ما الشكل التالي في التسلسل؟", opts: ["🔺", "🔵", "🔺", "⬛"], ans: 0, visual: "🔵 🔺 🔵 🔺 🔵 ❓" },
  { type: "evaluation", q: "قال أحمد: 'كل من يذاكر ينجح، وسالم نجح، إذن سالم ذاكر'. هل هذا الاستنتاج صحيح دائماً؟", opts: ["نعم صحيح دائماً", "لا، قد ينجح لسبب آخر غير المذاكرة", "لا علاقة بين الجملتين", "لا يمكن الإجابة"], ans: 1 },
  { type: "synthesis", q: "أكمل العلاقة", opts: ["الحرارة", "البرودة", "الضوء", "الصوت"], ans: 0, visual: "شمس : ضوء :: نار : ❓" },
  { type: "inference", q: "أيّ عدد يكمل السلسلة؟", opts: ["25", "20", "30", "24"], ans: 0, visual: "1 4 9 16 ❓" },
  { type: "analysis", q: "أيّ كلمة مختلفة عن البقية من حيث المعنى؟", opts: ["سعيد", "فرحان", "مبتهج", "حزين"], ans: 3, visual: "سعيد | فرحان | مبتهج | حزين" },
  { type: "evaluation", q: "إذا كان اليوم الثلاثاء، فبعد 10 أيام سيكون أي يوم؟", opts: ["الجمعة", "السبت", "الأحد", "الاثنين"], ans: 1 },
  { type: "spatial", q: "كم عدد المكعبات الظاهرة في الشكل؟", opts: ["4", "5", "6", "7"], ans: 1, visual: "■■\n■■\n■" },
  { type: "synthesis", q: "أكمل العلاقة", opts: ["القراءة", "الكتابة", "السمع", "اللمس"], ans: 2, visual: "عين : رؤية :: أذن : ❓" },
  { type: "analysis", q: "أيّ فصل من فصول السنة مختلف عن البقية (الحرارة)؟", opts: ["الصيف", "الشتاء", "الربيع", "الخريف"], ans: 0, visual: "الصيف | الشتاء | الربيع | الخريف" },
];

/* الفئة 2: السادس الابتدائي + المتوسط */
const TIER_2: Question[] = [
  { type: "analysis", q: "أيّ عنصر لا ينتمي علمياً للمجموعة؟", opts: ["أكسجين", "هيدروجين", "ملح الطعام", "كربون"], ans: 2, visual: "أكسجين | هيدروجين | ملح الطعام | كربون" },
  { type: "inference", q: "ما العدد التالي في متتالية فيبوناتشي؟", opts: ["13", "12", "14", "15"], ans: 0, visual: "1 1 2 3 5 8 ❓" },
  { type: "synthesis", q: "أكمل العلاقة", opts: ["البرهان", "الفرضية", "التجربة", "الملاحظة"], ans: 0, visual: "رياضيات : برهان :: علوم : ❓" },
  { type: "evaluation", q: "شركة قالت: 'منتجنا الأفضل لأن 90% من الذين جربوه أعجبوا به'. ما الثغرة المحتملة في هذا الادعاء؟", opts: ["لا توجد ثغرة", "لم يُذكر عدد من جرّبوا المنتج أصلاً ولا كيف اختيروا", "الرقم 90% مرتفع جداً", "المنتج مضمون الجودة"], ans: 1 },
  { type: "spatial", q: "لو طُوي هذا الشكل المسطح، أي مجسم ينتج؟", opts: ["مكعب", "هرم رباعي", "أسطوانة", "كرة"], ans: 0, visual: "□□□□\n□" },
  { type: "analysis", q: "أيّ من هذه المصطلحات لا ينتمي لبقية المجموعة؟", opts: ["الاستقراء", "الاستنباط", "التحليل", "الحديقة"], ans: 3, visual: "الاستقراء | الاستنباط | التحليل | الحديقة" },
  { type: "inference", q: "ما العدد الناقص؟ (كل رقم = مجموع الرقمين قبله × وضع خاص)", opts: ["21", "20", "19", "22"], ans: 0, visual: "2 3 5 8 13 ❓" },
  { type: "evaluation", q: "إذا زاد راتب موظف 10% ثم نقص 10% من الراتب الجديد، فهل يعود لراتبه الأصلي؟", opts: ["نعم يعود بالضبط", "لا، يكون أقل من الأصلي بقليل", "لا، يكون أعلى من الأصلي", "لا يمكن معرفة ذلك"], ans: 1 },
  { type: "synthesis", q: "أكمل العلاقة", opts: ["مساحة", "محيط", "حجم", "زاوية"], ans: 0, visual: "تكامل : مساحة :: تفاضل : ❓" },
  { type: "inference", q: "أيّ عدد يكمل النمط؟ (تربيع الأعداد الفردية)", opts: ["49", "36", "64", "81"], ans: 0, visual: "1 9 25 ❓" },
  { type: "analysis", q: "أيّ من هذه الدول لا تقع في نفس القارة مع البقية؟", opts: ["مصر", "السعودية", "فرنسا", "الإمارات"], ans: 2, visual: "مصر | السعودية | فرنسا | الإمارات" },
  { type: "evaluation", q: "إذا كان أحمد أطول من خالد، وخالد أطول من سعيد، فمن الأقصر بينهم؟", opts: ["أحمد", "خالد", "سعيد", "لا يمكن التحديد"], ans: 2 },
  { type: "spatial", q: "كم محور تماثل (تناظر) يملكه المربع؟", opts: ["2", "4", "1", "0"], ans: 1, visual: "◻ تماثل" },
  { type: "synthesis", q: "أكمل العلاقة", opts: ["كلمات", "أحداث", "مدينة", "طريق"], ans: 0, visual: "قاموس : كلمات :: أطلس : خرائط :: موسوعة : ❓" },
  { type: "analysis", q: "أيّ مفهوم لا ينتمي للمجموعة (أدوات قياس)؟", opts: ["مسطرة", "ميزان", "ساعة", "قلم رصاص"], ans: 3, visual: "مسطرة | ميزان | ساعة | قلم رصاص" },
  { type: "inference", q: "لاحظ النمط، ما العدد التالي؟", opts: ["55", "50", "45", "60"], ans: 0, visual: "1 3 6 10 15 21 28 36 45 ❓" },
  { type: "evaluation", q: "طالب حصل على أعلى درجة في اختبار سهل جداً، وطالب آخر حصل على درجة متوسطة في اختبار صعب جداً. أيّهما أظهر فهماً أعمق للمادة؟", opts: ["الأول دائماً لأن درجته أعلى", "لا يمكن الحكم فقط بالدرجة دون معرفة صعوبة الاختبار", "الثاني دائماً", "كلاهما متساويان بالضرورة"], ans: 1 },
];

/* الفئة 3: الأول الثانوي */
const TIER_3: Question[] = [
  { type: "analysis", q: "أيّ من هذه المفاهيم الفيزيائية لا ينتمي لبقية المجموعة؟", opts: ["السرعة", "التسارع", "الكتلة", "قافية الشعر"], ans: 3, visual: "السرعة | التسارع | الكتلة | قافية الشعر" },
  { type: "inference", q: "متتالية هندسية، ما الحد التالي؟", opts: ["162", "150", "170", "144"], ans: 0, visual: "2 6 18 54 ❓" },
  { type: "synthesis", q: "أكمل العلاقة", opts: ["الفرضية", "النظرية", "القانون", "الملاحظة"], ans: 1, visual: "الفرضية المدعومة بالأدلة تصبح : ❓" },
  { type: "evaluation", q: "باحث وجد ارتباطاً بين زيادة مبيعات المثلجات وزيادة حالات الغرق في نفس الأشهر. هل هذا يعني أن المثلجات تسبب الغرق؟", opts: ["نعم، الارتباط دليل كافٍ على السببية", "لا، كلاهما مرتبط بعامل ثالث هو ارتفاع الحرارة صيفاً", "لا علاقة بينهما إطلاقاً", "نعم لأن الأرقام متطابقة"], ans: 1 },
  { type: "spatial", q: "مكعب صُبغت جميع أوجهه ثم قُطّع لـ27 مكعباً صغيراً متساوياً (3×3×3). كم مكعباً صغيراً لا يحمل أي لون على أي وجه؟", opts: ["1", "0", "8", "6"], ans: 0, visual: "3×3×3 مكعب" },
  { type: "analysis", q: "أيّ من هذه المصطلحات المنطقية لا ينتمي للمجموعة؟", opts: ["الاستنباط", "الاستقراء", "المغالطة", "الوزن"], ans: 3, visual: "الاستنباط | الاستقراء | المغالطة | الوزن" },
  { type: "inference", q: "ما الحد التالي في متتالية لوكاس؟", opts: ["29", "28", "30", "27"], ans: 0, visual: "2 1 3 4 7 11 18 ❓" },
  { type: "evaluation", q: "إعلان يقول: 'استخدم 9 من كل 10 خبراء هذا المنتج'. ما السؤال الأهم لتقييم مصداقية هذا الادعاء؟", opts: ["من هم هؤلاء الخبراء وكيف اختيروا وممولون من الشركة أم لا؟", "لا داعي لأي سؤال، الرقم مقنع", "هل المنتج غالي الثمن؟", "كم لون للمنتج؟"], ans: 0 },
  { type: "synthesis", q: "أكمل العلاقة", opts: ["الطاقة", "الكتلة", "السرعة", "الزمن"], ans: 0, visual: "أينشتاين : النسبية :: نيوتن : الحركة :: E=mc² : ❓" },
  { type: "inference", q: "دالة f(x) = 2x + 3، ما قيمة f(f(2))؟", opts: ["17", "14", "13", "19"], ans: 0 },
  { type: "analysis", q: "أيّ من هذه التوزيعات الإحصائية غير حقيقي؟", opts: ["التوزيع الطبيعي", "التوزيع الثنائي", "توزيع بواسون", "توزيع سبيكمان"], ans: 3, visual: "طبيعي | ثنائي | بواسون | سبيكمان" },
  { type: "evaluation", q: "طالبان قدّما نفس الإجابة الصحيحة في مسألة رياضية، لكن أحدهما كتب خطوات الحل والآخر لم يكتب أي خطوات. أيّ الأمرين أكثر دلالة على الفهم الحقيقي؟", opts: ["الإجابة الصحيحة وحدها كافية دائماً", "كتابة الخطوات الصحيحة تدل على فهم أعمق للطريقة وليس الحظ", "لا فرق بينهما أبداً", "من لم يكتب خطوات أذكى"], ans: 1 },
  { type: "spatial", q: "كرة موضوعة داخل مكعب بحيث تلامس جميع الأوجه من الداخل. كم وجهاً من أوجه المكعب تلامسه الكرة نظرياً؟", opts: ["6", "4", "8", "0"], ans: 0, visual: "⬜ ● ⬜" },
  { type: "inference", q: "احسب مجموع أول 20 عدداً طبيعياً باستخدام القانون n(n+1)/2", opts: ["210", "200", "190", "220"], ans: 0 },
  { type: "evaluation", q: "إذا كانت كل النتائج التجريبية تدعم فرضية معينة حتى الآن، فهل هذا يعني أن الفرضية أصبحت 'حقيقة مطلقة' لا يمكن نقضها مستقبلاً؟", opts: ["نعم، الفرضية المدعومة تصبح حقيقة مطلقة للأبد", "لا، تبقى الفرضية عرضة للمراجعة إذا ظهر دليل جديد يناقضها", "لا علاقة بين الدعم التجريبي وصحة الفرضية", "لا يمكن دعم أي فرضية تجريبياً أصلاً"], ans: 1 },
];

/* خريطة الصف → الفئة العمرية للأسئلة */
function tierForGrade(grade: string): Question[] {
  if (grade.includes("الرابع") || grade.includes("الخامس")) {
    if (grade.includes("الابتدائي")) return TIER_1;
  }
  if (grade.includes("السادس") || grade.includes("المتوسط")) return TIER_2;
  if (grade.includes("الأول الثانوي")) return TIER_3;
  return TIER_2; // احتياطي
}

const QUESTION_SECONDS = 45;

type Screen = "loading" | "need-login" | "not-student" | "pending" | "already-done" | "not-scheduled" | "intro" | "test" | "submitted";

export default function TalentTestPage() {
  const { isLoggedIn, isStudent, isApproved, user } = useAuth();
  const router = useRouter();

  const [screen, setScreen] = useState<Screen>("loading");
  const [myScheduledDate, setMyScheduledDate] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(QUESTION_SECONDS);
  const startRef = useRef<number>(0);

  useEffect(() => {
    if (!isLoggedIn || !user) { setScreen("need-login"); return; }
    if (!isStudent) { setScreen("not-student"); return; }
    if (!isApproved) { setScreen("pending"); return; }

    const student = user as StudentProfile;
    let cancelled = false;
    (async () => {
      const [schedule, existingResult] = await Promise.all([
        cloudGet<ScheduleEntry[]>("kc_hots_schedule"),
        cloudGet<unknown>(`kc_hots_results/${student.id}`),
      ]);
      if (cancelled) return;
      if (existingResult) { setScreen("already-done"); return; }

      const list = Array.isArray(schedule) ? schedule : [];
      const mine = list.filter(e => e.grade === student.grade).sort((a, b) => a.date.localeCompare(b.date));
      const todayMatch = mine.find(e => e.date === todayLocalStr());
      if (mine[0]) setMyScheduledDate(mine[0].date);

      if (!todayMatch) { setScreen("not-scheduled"); return; }
      setQuestions(tierForGrade(student.grade));
      setScreen("intro");
    })();
    return () => { cancelled = true; };
  }, [isLoggedIn, isStudent, isApproved, user]);

  useEffect(() => {
    if (screen !== "test" || confirmed) return;
    if (timeLeft <= 0) { handleAnswer(-1); return; }
    const t = setTimeout(() => setTimeLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, screen, confirmed]);

  const submitResult = useCallback(async (finalAnswers: number[]) => {
    if (!user) return;
    const student = user as StudentProfile;
    const correct = finalAnswers.filter((a, i) => a === questions[i]?.ans).length;
    await cloudSet(`kc_hots_results/${student.id}`, {
      studentId: student.id,
      studentName: student.name,
      grade: student.grade,
      school: student.school,
      date: todayLocalStr(),
      correct,
      total: questions.length,
      elapsedSeconds: Math.round((Date.now() - startRef.current) / 1000),
      submittedAt: new Date().toISOString(),
    });
    setScreen("submitted");
  }, [user, questions]);

  const handleAnswer = useCallback((opt: number) => {
    if (confirmed) return;
    setSelectedOpt(opt);
    setConfirmed(true);
    setTimeout(() => {
      const na = [...answers, opt];
      setAnswers(na);
      if (current + 1 >= questions.length) {
        submitResult(na);
      } else {
        setCurrent(c => c + 1);
        setSelectedOpt(null);
        setConfirmed(false);
        setTimeLeft(QUESTION_SECONDS);
      }
    }, 700);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirmed, answers, current, questions, submitResult]);

  const startTest = () => {
    setAnswers([]); setCurrent(0); setSelectedOpt(null); setConfirmed(false); setTimeLeft(QUESTION_SECONDS);
    startRef.current = Date.now();
    setScreen("test");
  };

  /* =================== شاشات الحالة =================== */
  if (screen === "loading") {
    return <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 text-violet-600 animate-spin" /></div>;
  }

  if (screen === "need-login") {
    return (
      <div className="max-w-md mx-auto card p-8 text-center space-y-5 animate-fade-in">
        <Sparkles className="w-14 h-14 text-violet-500 mx-auto" />
        <h1 className="text-xl font-bold text-gray-800">اختبار مهارات التفكير العليا</h1>
        <p className="text-gray-500 text-sm">سجّل دخولك بحسابك كطالب للوصول للاختبار</p>
        <button onClick={() => router.push("/login")} className="inline-flex items-center gap-2 bg-violet-700 text-white px-8 py-3 rounded-2xl font-bold hover:bg-violet-600">
          <LogIn className="w-5 h-5" /> تسجيل الدخول
        </button>
      </div>
    );
  }

  if (screen === "not-student") {
    return (
      <div className="max-w-md mx-auto card p-8 text-center space-y-3 animate-fade-in">
        <Lock className="w-14 h-14 text-gray-300 mx-auto" />
        <h1 className="text-xl font-bold text-gray-700">هذا الاختبار مخصص للطلاب فقط</h1>
      </div>
    );
  }

  if (screen === "pending") {
    return (
      <div className="max-w-md mx-auto card p-8 text-center space-y-3 animate-fade-in">
        <Clock className="w-14 h-14 text-amber-400 mx-auto" />
        <h1 className="text-xl font-bold text-gray-700">طلبك قيد المراجعة</h1>
        <p className="text-gray-500 text-sm">لازم تفعيل حسابك من الإدارة أولاً قبل دخول الاختبار</p>
      </div>
    );
  }

  if (screen === "already-done") {
    return (
      <div className="max-w-md mx-auto card p-8 text-center space-y-3 animate-fade-in">
        <CheckCircle className="w-14 h-14 text-green-500 mx-auto" />
        <h1 className="text-xl font-bold text-gray-700">تم تسليم اختبارك مسبقاً</h1>
        <p className="text-gray-500 text-sm">إجاباتك مسجّلة، ولا يمكن إعادة الاختبار. ستُعلمكم الإدارة بالنتيجة.</p>
      </div>
    );
  }

  if (screen === "not-scheduled") {
    return (
      <div className="max-w-md mx-auto card p-8 text-center space-y-3 animate-fade-in">
        <Clock className="w-14 h-14 text-gray-300 mx-auto" />
        <h1 className="text-xl font-bold text-gray-700">الاختبار غير متاح اليوم لصفك</h1>
        {myScheduledDate
          ? <p className="text-gray-500 text-sm">موعد اختبارك: <span className="font-bold text-violet-700">{myScheduledDate}</span></p>
          : <p className="text-gray-500 text-sm">لم يُحدد بعد موعد اختبار لصفك — تابع مع الإدارة</p>}
      </div>
    );
  }

  if (screen === "intro") {
    return (
      <div className="max-w-lg mx-auto animate-fade-in space-y-5">
        <div className="card p-8 bg-gradient-to-br from-violet-800 via-indigo-700 to-blue-700 text-white text-center">
          <Sparkles className="w-14 h-14 mx-auto mb-3" />
          <h1 className="text-2xl font-bold mb-1">اختبار مهارات التفكير العليا</h1>
          <p className="text-indigo-200 text-sm">{(user as StudentProfile).grade}</p>
        </div>
        <div className="card p-6 space-y-3 text-sm text-gray-600">
          <p>⏱️ {QUESTION_SECONDS} ثانية لكل سؤال، و{questions.length} سؤالاً بالمجموع.</p>
          <p>🔒 هذا الاختبار مرة واحدة فقط — لا يمكن إعادته بعد التسليم.</p>
          <p>📵 لا يمكن الرجوع لسؤال بعد الإجابة عليه.</p>
          <p>✅ نتيجتك تُرسل مباشرة للإدارة، ولن تظهر لك هنا.</p>
        </div>
        <button onClick={startTest} className="w-full bg-violet-700 text-white py-4 rounded-2xl font-bold text-lg hover:bg-violet-600">
          🚀 ابدأ الاختبار الآن
        </button>
      </div>
    );
  }

  if (screen === "submitted") {
    return (
      <div className="max-w-md mx-auto card p-8 text-center space-y-3 animate-fade-in">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
        <h1 className="text-xl font-bold text-gray-800">تم تسليم إجاباتك بنجاح ✅</h1>
        <p className="text-gray-500 text-sm">شكراً لك، وصلت النتيجة للإدارة. لن تحتاج الدخول للاختبار مرة أخرى.</p>
      </div>
    );
  }

  /* =================== شاشة الاختبار =================== */
  const q = questions[current];
  if (!q) return null;
  const pct = (current / questions.length) * 100;
  const timerPct = (timeLeft / QUESTION_SECONDS) * 100;

  return (
    <div className="max-w-lg mx-auto animate-fade-in space-y-4">
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-gray-400">السؤال</p>
            <p className="font-bold text-lg">{current + 1} / {questions.length}</p>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-xl font-bold border ${TYPE_BG[q.type]}`}>{TYPE_LABELS[q.type]}</span>
          <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold ${timeLeft <= 10 ? "bg-red-50 text-red-600" : "bg-violet-50 text-violet-700"}`}>
            <Clock className="w-3.5 h-3.5" /> {timeLeft}s
          </div>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-1">
          <div className="h-full bg-violet-600 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-1000 ${timeLeft <= 10 ? "bg-red-500" : "bg-green-500"}`} style={{ width: `${timerPct}%` }} />
        </div>
      </div>

      <div className={`card p-5 border ${TYPE_BG[q.type]}`}>
        <p className="text-gray-800 font-bold text-base leading-relaxed mb-1">{q.q}</p>
        <VisualDisplay type={q.type} visual={q.visual} />
        <div className="grid grid-cols-2 gap-2 mt-3">
          {q.opts.map((opt, i) => {
            let cls = "border-2 border-gray-200 bg-white text-gray-700 p-3 rounded-xl font-medium text-sm text-right cursor-pointer hover:border-violet-400 hover:bg-violet-50 transition-all flex items-center gap-2";
            if (confirmed) {
              cls = i === selectedOpt
                ? "border-2 border-violet-500 bg-violet-50 text-violet-800 p-3 rounded-xl font-medium text-sm text-right flex items-center gap-2"
                : "border-2 border-gray-100 bg-gray-50 text-gray-300 p-3 rounded-xl font-medium text-sm text-right flex items-center gap-2";
            } else if (selectedOpt === i) {
              cls = "border-2 border-violet-500 bg-violet-50 text-violet-800 p-3 rounded-xl font-medium text-sm text-right flex items-center gap-2";
            }
            return (
              <button key={i} onClick={() => !confirmed && setSelectedOpt(i)} className={cls} disabled={confirmed}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${selectedOpt === i ? "bg-violet-700 text-white" : "bg-gray-200 text-gray-500"}`}>
                  {["أ", "ب", "ج", "د"][i]}
                </span>
                {opt}
              </button>
            );
          })}
        </div>
        {!confirmed && selectedOpt !== null && (
          <button onClick={() => handleAnswer(selectedOpt)} className="mt-3 w-full bg-violet-700 text-white py-3 rounded-xl font-bold text-sm hover:bg-violet-600">✅ تأكيد الإجابة</button>
        )}
        {!confirmed && selectedOpt === null && (
          <button onClick={() => handleAnswer(-1)} className="mt-3 w-full border border-gray-200 text-gray-400 py-2.5 rounded-xl text-sm hover:bg-gray-50">تخطي</button>
        )}
      </div>
    </div>
  );
}

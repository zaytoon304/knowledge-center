"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { Brain, ChevronLeft, RotateCcw, Trophy, Clock, CheckCircle, XCircle } from "lucide-react";

/* ====================== أنواع البيانات ====================== */
interface Question {
  q: string;
  opts: string[];
  ans: number;
}

/* ====================== بنوك الأسئلة ====================== */
const Q_A: Question[] = [ // 6-9 سنوات
  { q: "ما العدد الذي يكمل: 2، 4، 6، 8، ___؟", opts: ["9","10","12","7"], ans: 1 },
  { q: "5 + 3 = ___؟", opts: ["7","8","9","6"], ans: 1 },
  { q: "الشجرة لها أوراق، السمكة لها ___؟", opts: ["ريش","فراء","حراشف","جناح"], ans: 2 },
  { q: "أي الكلمات لا ينتمي للمجموعة: مثلث، مربع، دائرة، كتاب؟", opts: ["مثلث","مربع","دائرة","كتاب"], ans: 3 },
  { q: "10 - 4 = ___؟", opts: ["5","6","7","4"], ans: 1 },
  { q: "ما اليوم الذي يأتي بعد الاثنين؟", opts: ["الأحد","الثلاثاء","الأربعاء","السبت"], ans: 1 },
  { q: "ما عدد أيام الأسبوع؟", opts: ["5","6","7","8"], ans: 2 },
  { q: "القطة تمشي بـ___ أرجل؟", opts: ["2","4","6","8"], ans: 1 },
  { q: "أكبر عدد: 15، 20، 13، 18؟", opts: ["15","13","20","18"], ans: 2 },
  { q: "3 × 2 = ___؟", opts: ["5","6","7","8"], ans: 1 },
  { q: "1، 3، 5، 7، ___؟", opts: ["8","9","10","11"], ans: 1 },
  { q: "أي الحيوانات يطير؟", opts: ["الأسد","الفيل","النسر","الحصان"], ans: 2 },
  { q: "4 + 4 + 4 = ___؟", opts: ["10","12","14","8"], ans: 1 },
  { q: "أي رقم يأتي بين 7 و 9؟", opts: ["6","10","8","11"], ans: 2 },
  { q: "5 × 2 = ___؟", opts: ["8","10","12","7"], ans: 1 },
  { q: "الأكبر: الفيل أم القطة؟", opts: ["القطة","الفيل","متساويان","لا أعرف"], ans: 1 },
  { q: "كم عدد الأصابع في يدٍ واحدة؟", opts: ["4","5","6","7"], ans: 1 },
  { q: "ما لون الشمس عادةً؟", opts: ["أزرق","أخضر","أصفر","أحمر"], ans: 2 },
  { q: "15 - 7 = ___؟", opts: ["6","7","8","9"], ans: 2 },
  { q: "أيٌّ من هذه حيوان بحري؟", opts: ["الأسد","الدب","السمكة","الحصان"], ans: 2 },
];

const Q_B: Question[] = [ // 10-12 سنوات
  { q: "2، 4، 8، 16، ___؟", opts: ["24","30","32","28"], ans: 2 },
  { q: "15% من 200 = ___؟", opts: ["30","25","35","20"], ans: 0 },
  { q: "أكمل: القلم بالورقة كالفأس بـ___؟", opts: ["البناء","الشجرة","المطرقة","الحديد"], ans: 1 },
  { q: "7² = ___؟", opts: ["14","42","49","56"], ans: 2 },
  { q: "مجموع زوايا المثلث = ___؟", opts: ["90°","180°","270°","360°"], ans: 1 },
  { q: "أي كلمة تختلف: أسد، نمر، دب، عصفور، ذئب؟", opts: ["أسد","دب","عصفور","ذئب"], ans: 2 },
  { q: "½ + ¼ = ___؟", opts: ["⅙","¾","⅔","⅓"], ans: 1 },
  { q: "إذا كان أحمد أكبر من محمد ومحمد أكبر من علي، فمن الأصغر؟", opts: ["أحمد","محمد","علي","لا يمكن التحديد"], ans: 2 },
  { q: "120 ÷ 8 = ___؟", opts: ["12","14","15","16"], ans: 2 },
  { q: "الكرة الأرضية تدور حول نفسها في ___؟", opts: ["ساعة","شهر","سنة","يوم"], ans: 3 },
  { q: "أكمل: 3، 6، 12، 24، ___؟", opts: ["36","48","42","32"], ans: 1 },
  { q: "أي الأعداد أوّلي: 9، 11، 15، 21؟", opts: ["9","11","15","21"], ans: 1 },
  { q: "مجموع الزوايا في الشكل الرباعي = ___؟", opts: ["180°","270°","360°","450°"], ans: 2 },
  { q: "الساعة 3:30، بعد ساعة ونصف تصبح؟", opts: ["4:30","5:00","5:30","4:00"], ans: 1 },
  { q: "إذا أضأت ضوءاً في غرفة مظلمة، الظلام ___؟", opts: ["يزداد","لا يتغير","يختفي","يقل قليلاً"], ans: 2 },
  { q: "كاتب—قلم، نجار—___؟", opts: ["مسمار","خشب","منشار","مطرقة"], ans: 2 },
  { q: "إذا باعت منى 3/5 من التفاحات وبقي 10، كم كان لديها؟", opts: ["20","25","30","15"], ans: 1 },
  { q: "A، C، E، G، ___؟", opts: ["H","I","J","K"], ans: 1 },
  { q: "ثلاثة أضعاف عدد مع إضافة 6 يساوي 21. العدد؟", opts: ["5","6","7","4"], ans: 0 },
  { q: "إذا كان اليوم الثلاثاء، ما اليوم بعد 5 أيام؟", opts: ["الأحد","السبت","الجمعة","الاثنين"], ans: 0 },
];

const Q_C: Question[] = [ // 13-16 سنوات
  { q: "2، 3، 5، 8، 13، 21، ___؟ (متتالية فيبوناتشي)", opts: ["29","34","31","28"], ans: 1 },
  { q: "إذا كانت x+y=10 و x-y=4، فما قيمة x؟", opts: ["7","6","8","5"], ans: 0 },
  { q: "40% من X = 60، إذن X = ___؟", opts: ["120","150","100","130"], ans: 1 },
  { q: "سرعة القطار 80 كم/ساعة. كم ساعة يقطع 360 كم؟", opts: ["4","4.5","5","3.5"], ans: 1 },
  { q: "1، 4، 9، 16، 25، ___؟ (أعداد مربعة)", opts: ["30","36","35","32"], ans: 1 },
  { q: "2^10 = ___؟", opts: ["512","1024","256","2048"], ans: 1 },
  { q: "3x - 7 = 2x + 5، إذن x = ___؟", opts: ["10","12","8","6"], ans: 1 },
  { q: "√144 = ___؟", opts: ["11","14","12","13"], ans: 2 },
  { q: "إذا نجح 75% وعدد الناجحين 90، كم مجموع الطلاب؟", opts: ["110","120","130","100"], ans: 1 },
  { q: "3/4 × 4/5 = ___؟", opts: ["7/9","3/5","1/2","7/20"], ans: 1 },
  { q: "كتاب←فصل←فقرة←جملة←___؟", opts: ["حرف","نقطة","كلمة","مقطع"], ans: 2 },
  { q: "الكيمياء للجزيء كالرياضيات لـ___؟", opts: ["الحاسوب","المعادلة","العدد","النظرية"], ans: 2 },
  { q: "مدينة تضاعف سكانها كل 10 سنوات. عام 2000: 1000 شخص. عام 2030؟", opts: ["4000","6000","8000","3000"], ans: 2 },
  { q: "كل الطلاب يدرسون، أحمد طالب، إذن أحمد ___؟", opts: ["لا يدرس","يدرس","لا يمكن التحديد","قد يدرس"], ans: 1 },
  { q: "إذا كان A=B وB=C، ماذا نستنتج؟", opts: ["A≠C","A>C","A=C","A<C"], ans: 2 },
  { q: "ABBA، BCCB، CDDC، ___؟", opts: ["DEED","DEEF","DFFE","EDDE"], ans: 0 },
  { q: "ثلاثة أضعاف X زائد 6 يساوي 21، X = ___؟", opts: ["5","6","7","4"], ans: 0 },
  { q: "من حيث المنطق: إذا كانت القاعدة صحيحة، النتيجة ___؟", opts: ["صحيحة دائماً","خاطئة","مشكوك فيها","قد تكون"], ans: 0 },
  { q: "احتمال المطر 60%، احتمال عدم المطر ___؟", opts: ["60%","40%","30%","50%"], ans: 1 },
  { q: "5² + 12² = ___²؟ (نظرية فيثاغورث)", opts: ["13","14","15","16"], ans: 0 },
];

const Q_D: Question[] = [ // 17+ سنة
  { q: "إذا كان (x+2)² = 25، ما قيم x؟", opts: ["3","−7","3 أو −7","5"], ans: 2 },
  { q: "مصنع ينتج 500 وحدة/يوم مع زيادة 20%، كم ينتج؟", opts: ["560","580","600","620"], ans: 2 },
  { q: "A أسرع من B بـ25%، وB يقطع مسافة في 40 دقيقة. كم يحتاج A؟", opts: ["30","32","34","35"], ans: 1 },
  { q: "الدالة f(x)=2x+3، قيمة f(4)=___؟", opts: ["10","11","12","9"], ans: 1 },
  { q: "P(A)=0.3 وP(B)=0.4 مستقلان. P(A∩B)=___؟", opts: ["0.12","0.7","0.58","0.1"], ans: 0 },
  { q: "أي الكلمات لا تنتمي: أكسجين، هيدروجين، ملح، كربون؟", opts: ["أكسجين","كربون","ملح","هيدروجين"], ans: 2 },
  { q: "عرض مستطيل ضعف طوله ومحيطه 60سم، مساحته؟", opts: ["150 cm²","200 cm²","180 cm²","100 cm²"], ans: 1 },
  { q: "الراتب زاد 10% ثم نقص 10%، النتيجة مقارنة بالأصل؟", opts: ["يساويه","أقل بـ1%","أكثر بـ1%","أقل بـ5%"], ans: 1 },
  { q: "تجمع أ وب = 100 وأ = 4×ب، إذن أ = ___؟", opts: ["75","80","70","85"], ans: 1 },
  { q: "√(3²+4²) = ___؟", opts: ["7","5","6","12"], ans: 1 },
  { q: "عدد مقلوبه يساوي نفسه، هو ___؟", opts: ["0","1","-1","1 أو -1"], ans: 3 },
  { q: "1، 1، 2، 3، 5، 8، 13، ___؟ (فيبوناتشي)", opts: ["18","21","24","20"], ans: 1 },
  { q: "المصطلح 'لازم وكافٍ' يعني؟", opts: ["السبب فقط","النتيجة فقط","الشرط يكفي ويُلزم","الاستنتاج فقط"], ans: 2 },
  { q: "إذا كان N يقسم على 6 و 9، أصغر قيمة له؟", opts: ["15","18","24","36"], ans: 1 },
  { q: "f(x)=x²−4x+4=0، قيمة x؟", opts: ["1","2","3","4"], ans: 1 },
  { q: "مثال على التفكير الاستقرائي؟", opts: ["قانون عام→حالة خاصة","حالة خاصة→قانون عام","فرضية→دليل","استنتاج رياضي"], ans: 1 },
  { q: "لوغاريتم 100 في الأساس 10؟", opts: ["1","2","10","100"], ans: 1 },
  { q: "S = n(n+1)/2 لـn=10، S = ___؟", opts: ["45","50","55","60"], ans: 2 },
  { q: "إذا كان P(A|B)=P(A)، ماذا يعني ذلك؟", opts: ["A محتمل","A وB متنافيان","A وB مستقلان","B ضروري لـA"], ans: 2 },
  { q: "حد دالة: lim(x→2) (x²-4)/(x-2) = ___؟", opts: ["0","2","4","غير معرّف"], ans: 2 },
];

/* ====================== حساب IQ ====================== */
function calcIQ(correct: number, total: number, age: number): number {
  const ratio = correct / total;
  let iq: number;
  if (ratio >= 0.95) iq = 145;
  else if (ratio >= 0.90) iq = 135;
  else if (ratio >= 0.80) iq = 125;
  else if (ratio >= 0.70) iq = 115;
  else if (ratio >= 0.60) iq = 107;
  else if (ratio >= 0.50) iq = 100;
  else if (ratio >= 0.40) iq = 90;
  else if (ratio >= 0.30) iq = 80;
  else if (ratio >= 0.20) iq = 72;
  else iq = 65;
  // تعديل بسيط حسب العمر (الصغار أصعب قليلاً)
  if (age < 10) iq += 3;
  else if (age < 13) iq += 1;
  return Math.min(iq, 160);
}

interface IQLevel { label: string; color: string; bg: string; emoji: string; desc: string }
function getIQLevel(iq: number): IQLevel {
  if (iq >= 145) return { label: "عبقري استثنائي", color: "text-violet-700", bg: "from-violet-600 to-purple-500", emoji: "🌟", desc: "ذكاء فائق الاستثنائية — أنت بين 0.1% الأذكى في العالم!" };
  if (iq >= 130) return { label: "موهوب جداً", color: "text-blue-700", bg: "from-blue-600 to-indigo-500", emoji: "🏆", desc: "ذكاء متقدم جداً — أنت بين 2% الأذكى!" };
  if (iq >= 120) return { label: "فوق المتوسط", color: "text-green-700", bg: "from-green-600 to-emerald-500", emoji: "⭐", desc: "ذكاء عالٍ — تتفوق على معظم الناس." };
  if (iq >= 110) return { label: "ذكاء عالٍ", color: "text-lime-700", bg: "from-lime-600 to-green-500", emoji: "💡", desc: "أعلى من المتوسط — تفكير منطقي ممتاز." };
  if (iq >= 90)  return { label: "متوسط", color: "text-amber-700", bg: "from-amber-500 to-yellow-400", emoji: "👍", desc: "ذكاء متوسط — هذا هو معدل معظم البشر." };
  if (iq >= 80)  return { label: "أقل من المتوسط", color: "text-orange-700", bg: "from-orange-500 to-amber-400", emoji: "📘", desc: "التدريب والتعلم يُحسّنان الذكاء!" };
  return { label: "يحتاج تطوير", color: "text-red-700", bg: "from-red-500 to-rose-400", emoji: "📚", desc: "الممارسة والقراءة ترفع مستوى الذكاء." };
}

function getQuestions(age: number): Question[] {
  let pool: Question[];
  if (age <= 9) pool = Q_A;
  else if (age <= 12) pool = Q_B;
  else if (age <= 16) pool = Q_C;
  else pool = Q_D;
  // اختيار عشوائي لـ 20 سؤال
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 20);
}

type Screen = "welcome" | "test" | "result";

/* ====================== المكوّن الرئيسي ====================== */
export default function IQTestPage() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const startTimeRef = useRef<number>(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  // مؤقت للسؤال
  useEffect(() => {
    if (screen !== "test" || confirmed) return;
    if (timeLeft <= 0) {
      handleAnswer(-1);
      return;
    }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, screen, confirmed]);

  const startTest = () => {
    if (!name.trim() || !age || parseInt(age) < 6 || parseInt(age) > 80) return;
    const qs = getQuestions(parseInt(age));
    setQuestions(qs);
    setAnswers([]);
    setCurrent(0);
    setSelected(null);
    setConfirmed(false);
    setTimeLeft(30);
    startTimeRef.current = Date.now();
    setScreen("test");
  };

  const handleAnswer = useCallback((opt: number) => {
    if (confirmed) return;
    setSelected(opt);
    setConfirmed(true);
    setTimeout(() => {
      const newAnswers = [...answers, opt];
      setAnswers(newAnswers);
      if (current + 1 >= questions.length) {
        setElapsedTime(Math.round((Date.now() - startTimeRef.current) / 1000));
        setScreen("result");
      } else {
        setCurrent(c => c + 1);
        setSelected(null);
        setConfirmed(false);
        setTimeLeft(30);
      }
    }, 800);
  }, [confirmed, answers, current, questions.length]);

  const selectOption = (i: number) => { if (!confirmed) setSelected(i); };
  const confirmAnswer = () => { if (selected !== null) handleAnswer(selected); };
  const restart = () => { setScreen("welcome"); setName(""); setAge(""); };

  const correct = answers.filter((a, i) => a === questions[i]?.ans).length;
  const iq = screen === "result" ? calcIQ(correct, 20, parseInt(age)) : 0;
  const level = getIQLevel(iq);

  const progress = questions.length > 0 ? ((current) / questions.length) * 100 : 0;
  const timerPct = (timeLeft / 30) * 100;

  /* =================== شاشة الترحيب =================== */
  if (screen === "welcome") return (
    <div className="max-w-lg mx-auto animate-fade-in space-y-5">
      <div className="card p-8 bg-gradient-to-br from-violet-800 via-indigo-700 to-blue-700 text-white text-center">
        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Brain className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold mb-2">اختبار نسبة الذكاء</h1>
        <p className="text-indigo-200 text-sm">IQ Test — 20 سؤالاً مخصصاً حسب عمرك</p>
        <div className="grid grid-cols-3 gap-3 mt-5">
          {[{n:"20",l:"سؤال"},{n:"30",l:"ثانية/سؤال"},{n:"4",l:"فئات عمرية"}].map(s=>(
            <div key={s.l} className="bg-white/10 rounded-xl p-3">
              <div className="text-2xl font-bold">{s.n}</div>
              <div className="text-xs text-indigo-200">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <h2 className="font-bold text-gray-800 text-lg">أدخل بياناتك</h2>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">اسمك</label>
          <input value={name} onChange={e => setName(e.target.value)}
            placeholder="اكتب اسمك هنا..."
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 outline-none focus:border-violet-500 focus:bg-white transition" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">عمرك (بالسنوات)</label>
          <input type="number" value={age} onChange={e => setAge(e.target.value)}
            placeholder="مثال: 14"
            min={6} max={80}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 outline-none focus:border-violet-500 focus:bg-white transition" />
        </div>
        {age && parseInt(age) >= 6 && (
          <div className="bg-violet-50 border border-violet-100 rounded-xl p-3 text-sm">
            <span className="text-violet-700 font-medium">
              {parseInt(age) <= 9 ? "📚 فئة الأطفال (6-9 سنة)" :
               parseInt(age) <= 12 ? "🎒 فئة الابتدائية العليا (10-12 سنة)" :
               parseInt(age) <= 16 ? "📐 فئة المتوسطة والثانوية (13-16 سنة)" :
               "🎓 فئة الكبار (17+ سنة)"}
            </span>
          </div>
        )}
        <button onClick={startTest}
          disabled={!name.trim() || !age || parseInt(age) < 6}
          className="w-full bg-violet-700 text-white py-4 rounded-2xl font-bold text-lg hover:bg-violet-600 disabled:opacity-40 disabled:cursor-not-allowed transition">
          🚀 ابدأ الاختبار
        </button>
      </div>

      <div className="card p-5 bg-amber-50 border border-amber-100">
        <p className="font-bold text-amber-800 mb-2">💡 تعليمات الاختبار</p>
        <ul className="space-y-1 text-amber-700 text-sm">
          <li>• 20 سؤالاً متعدد الخيارات</li>
          <li>• 30 ثانية لكل سؤال</li>
          <li>• اقرأ السؤال بتمعّن قبل الإجابة</li>
          <li>• لا يوجد إجابة صحيحة بدون تفكير!</li>
        </ul>
      </div>
    </div>
  );

  /* =================== شاشة الاختبار =================== */
  if (screen === "test" && questions.length > 0) {
    const q = questions[current];
    return (
      <div className="max-w-lg mx-auto animate-fade-in space-y-4">
        {/* رأس الاختبار */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-gray-500">السؤال</p>
              <p className="font-bold text-lg text-gray-800">{current + 1} / {questions.length}</p>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-lg ${
              timeLeft <= 10 ? "bg-red-50 text-red-600" : "bg-violet-50 text-violet-700"
            }`}>
              <Clock className="w-4 h-4" />
              {timeLeft}s
            </div>
          </div>
          {/* شريط التقدم */}
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-1">
            <div className="h-full bg-violet-600 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          {/* مؤقت السؤال */}
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-1000 ${timeLeft <= 10 ? "bg-red-500" : "bg-green-500"}`}
              style={{ width: `${timerPct}%` }} />
          </div>
        </div>

        {/* بطاقة السؤال */}
        <div className="card p-6">
          <div className="flex items-start gap-3 mb-6">
            <div className="w-8 h-8 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5">
              {current + 1}
            </div>
            <p className="text-gray-800 font-bold text-base leading-relaxed">{q.q}</p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {q.opts.map((opt, i) => {
              let cls = "border border-gray-200 bg-gray-50 text-gray-700 hover:border-violet-400 hover:bg-violet-50";
              if (confirmed) {
                if (i === q.ans) cls = "border-green-500 bg-green-50 text-green-800";
                else if (i === selected && i !== q.ans) cls = "border-red-400 bg-red-50 text-red-700";
                else cls = "border-gray-100 bg-gray-50 text-gray-400";
              } else if (selected === i) {
                cls = "border-violet-500 bg-violet-50 text-violet-800";
              }
              return (
                <button key={i} onClick={() => selectOption(i)}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 text-right transition-all ${cls} ${confirmed ? "cursor-default" : "cursor-pointer hover:scale-[1.01]"}`}>
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                    confirmed && i === q.ans ? "bg-green-500 text-white" :
                    confirmed && i === selected && i !== q.ans ? "bg-red-400 text-white" :
                    selected === i ? "bg-violet-700 text-white" : "bg-gray-200 text-gray-500"
                  }`}>
                    {confirmed && i === q.ans ? <CheckCircle className="w-4 h-4" /> :
                     confirmed && i === selected && i !== q.ans ? <XCircle className="w-4 h-4" /> :
                     ["أ","ب","ج","د"][i]}
                  </span>
                  <span className="flex-1 text-sm font-medium">{opt}</span>
                </button>
              );
            })}
          </div>

          {!confirmed && selected !== null && (
            <button onClick={confirmAnswer}
              className="mt-4 w-full bg-violet-700 text-white py-3 rounded-xl font-bold text-sm hover:bg-violet-600 transition">
              ✅ تأكيد الإجابة
            </button>
          )}
          {!confirmed && selected === null && (
            <button onClick={() => handleAnswer(-1)}
              className="mt-4 w-full border border-gray-200 text-gray-400 py-3 rounded-xl text-sm hover:bg-gray-50">
              تخطي هذا السؤال
            </button>
          )}
        </div>
      </div>
    );
  }

  /* =================== شاشة النتائج =================== */
  if (screen === "result") {
    const mins = Math.floor(elapsedTime / 60);
    const secs = elapsedTime % 60;
    return (
      <div className="max-w-lg mx-auto animate-fade-in space-y-5">
        {/* بطاقة النتيجة الرئيسية */}
        <div className={`card p-8 bg-gradient-to-br ${level.bg} text-white text-center`}>
          <div className="text-6xl mb-3">{level.emoji}</div>
          <h2 className="text-4xl font-black mb-1">IQ {iq}</h2>
          <p className="text-xl font-bold mb-1">{level.label}</p>
          <p className="text-white/80 text-sm max-w-xs mx-auto">{level.desc}</p>
          <div className="mt-4 text-sm text-white/70">👤 {name} • 🎂 {age} سنة</div>
        </div>

        {/* إحصائيات */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { n: correct, t: questions.length, l: "إجابات صحيحة", emoji: "✅" },
            { n: questions.length - correct, t: questions.length, l: "إجابات خاطئة", emoji: "❌" },
            { n: mins > 0 ? `${mins}د ${secs}ث` : `${secs}ث`, t: null, l: "وقت الاختبار", emoji: "⏱️" },
          ].map(s => (
            <div key={s.l} className="card p-4 text-center">
              <div className="text-2xl mb-1">{s.emoji}</div>
              <div className="text-xl font-black text-gray-800">{s.n}{s.t ? `/${s.t}` : ""}</div>
              <div className="text-xs text-gray-400">{s.l}</div>
            </div>
          ))}
        </div>

        {/* مقياس IQ */}
        <div className="card p-5">
          <p className="font-bold text-gray-700 mb-4 text-sm">موقعك على مقياس الذكاء</p>
          <div className="relative h-6 rounded-full overflow-hidden bg-gradient-to-l from-violet-600 via-blue-500 via-green-500 via-amber-400 to-red-400">
            <div className="absolute top-0 h-full w-1 bg-white shadow-xl rounded-full transition-all"
              style={{ right: `${Math.min(Math.max((iq - 60) / 100 * 100, 0), 98)}%` }} />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1.5">
            <span>60</span><span>80</span><span>100</span><span>120</span><span>140+</span>
          </div>
          <div className="mt-4 space-y-2">
            {[
              { range: "130+", label: "موهوب / عبقري", color: "bg-violet-100 text-violet-700", active: iq >= 130 },
              { range: "120-129", label: "فوق المتوسط العالي", color: "bg-blue-100 text-blue-700", active: iq >= 120 && iq < 130 },
              { range: "110-119", label: "ذكاء عالٍ", color: "bg-green-100 text-green-700", active: iq >= 110 && iq < 120 },
              { range: "90-109", label: "متوسط", color: "bg-amber-100 text-amber-700", active: iq >= 90 && iq < 110 },
              { range: "أقل من 90", label: "أقل من المتوسط", color: "bg-red-100 text-red-700", active: iq < 90 },
            ].map(lvl => (
              <div key={lvl.range} className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs ${lvl.active ? lvl.color + " font-bold ring-2 ring-offset-1 ring-violet-400" : "bg-gray-50 text-gray-400"}`}>
                <span>{lvl.label}</span>
                <span className="font-mono">{lvl.range}</span>
              </div>
            ))}
          </div>
        </div>

        {/* مراجعة الإجابات */}
        <div className="card p-5">
          <p className="font-bold text-gray-700 mb-3 text-sm">مراجعة إجاباتك</p>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {questions.map((q, i) => {
              const userAns = answers[i];
              const isCorrect = userAns === q.ans;
              return (
                <div key={i} className={`flex items-start gap-2 p-2.5 rounded-xl text-xs ${isCorrect ? "bg-green-50" : "bg-red-50"}`}>
                  <span className={`flex-shrink-0 mt-0.5 ${isCorrect ? "text-green-600" : "text-red-500"}`}>
                    {isCorrect ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-700">{q.q}</p>
                    {!isCorrect && (
                      <p className="text-green-700 mt-0.5">✓ الإجابة الصحيحة: {q.opts[q.ans]}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* أزرار */}
        <div className="grid grid-cols-2 gap-3">
          <button onClick={restart}
            className="flex items-center justify-center gap-2 bg-violet-700 text-white py-3.5 rounded-xl font-bold hover:bg-violet-600 transition">
            <RotateCcw className="w-4 h-4" /> إعادة الاختبار
          </button>
          <button onClick={() => {
            const text = `اختبار الذكاء\n${name} - عمر ${age}\nنسبة الذكاء: ${iq} (${level.label})\n${correct}/20 إجابة صحيحة`;
            if (navigator.share) navigator.share({ title: "نتيجة اختبار الذكاء", text });
            else navigator.clipboard.writeText(text);
          }} className="flex items-center justify-center gap-2 border border-gray-200 text-gray-700 py-3.5 rounded-xl font-bold hover:bg-gray-50">
            <Trophy className="w-4 h-4 text-amber-500" /> مشاركة النتيجة
          </button>
        </div>
      </div>
    );
  }

  return null;
}

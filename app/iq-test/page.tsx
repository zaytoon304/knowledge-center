"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { Brain, RotateCcw, Trophy, Clock, CheckCircle, XCircle } from "lucide-react";

/* ====================== أنواع ====================== */
type QType = "odd"|"matrix"|"sequence"|"analogy"|"logic"|"spatial";
interface Question {
  q: string;
  opts: string[];
  ans: number;
  type: QType;
  visual?: string; // للمصفوفة والتسلسل وغيرها
}

/* ====================== مكوّن العرض المرئي ====================== */
function VisualDisplay({ type, visual }: { type: QType; visual?: string }) {
  if (!visual) return null;
  if (type === "matrix") {
    const rows = visual.split("\n");
    return (
      <div className="bg-white border border-violet-100 rounded-2xl p-4 my-3">
        <p className="text-xs text-violet-400 text-center mb-3">🧩 أكمل المصفوفة — أيٌّ يحلّ محل ❓</p>
        <div className="flex flex-col items-center gap-1.5">
          {rows.map((row, ri) => (
            <div key={ri} className="flex gap-1.5">
              {row.split(" ").map((cell, ci) => (
                <div key={ci} className={`w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold shadow-sm ${cell === "❓" ? "bg-violet-100 border-2 border-dashed border-violet-400 text-violet-500 text-2xl" : "bg-gray-50 border border-gray-200 text-gray-800"}`}>
                  {cell}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (type === "sequence") {
    const items = visual.split(" ");
    return (
      <div className="bg-white border border-indigo-100 rounded-2xl p-4 my-3">
        <p className="text-xs text-indigo-400 text-center mb-3">🔢 أكمل التسلسل</p>
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
  if (type === "odd") {
    const items = visual.split(" | ");
    const colors = ["bg-blue-50 border-blue-200 text-blue-800","bg-green-50 border-green-200 text-green-800","bg-amber-50 border-amber-200 text-amber-800","bg-rose-50 border-rose-200 text-rose-800","bg-purple-50 border-purple-200 text-purple-800"];
    return (
      <div className="bg-white border border-emerald-100 rounded-2xl p-4 my-3">
        <p className="text-xs text-emerald-500 text-center mb-3">🔍 أيٌّ لا ينتمي للمجموعة؟</p>
        <div className="flex flex-wrap justify-center gap-2">
          {items.map((item, i) => (
            <span key={i} className={`px-4 py-2 rounded-xl border-2 font-bold text-sm ${colors[i % colors.length]}`}>{item}</span>
          ))}
        </div>
      </div>
    );
  }
  if (type === "analogy") {
    const parts = visual.split("::"); // "A:B :: C:?"
    return (
      <div className="bg-white border border-rose-100 rounded-2xl p-4 my-3">
        <p className="text-xs text-rose-400 text-center mb-3">🔗 أكمل التناظر</p>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {parts[0] && parts[0].split(":").map((p, i) => (
            <span key={i}>
              {i > 0 && <span className="text-rose-400 font-bold mx-1">:</span>}
              <span className="bg-rose-50 border border-rose-200 text-rose-800 px-3 py-1.5 rounded-xl font-bold">{p.trim()}</span>
            </span>
          ))}
          <span className="text-gray-400 font-bold mx-2">::</span>
          {parts[1] && parts[1].split(":").map((p, i) => (
            <span key={i}>
              {i > 0 && <span className="text-rose-400 font-bold mx-1">:</span>}
              <span className={`px-3 py-1.5 rounded-xl font-bold border-2 ${p.trim() === "❓" ? "bg-rose-100 border-dashed border-rose-400 text-rose-500 text-xl" : "bg-rose-50 border-rose-200 text-rose-800"}`}>{p.trim()}</span>
            </span>
          ))}
        </div>
      </div>
    );
  }
  if (type === "spatial") {
    return (
      <div className="bg-white border border-cyan-100 rounded-2xl p-4 my-3 text-center">
        <p className="text-xs text-cyan-400 mb-2">🔺 تفكير مكاني</p>
        <p className="font-mono text-2xl tracking-widest text-gray-700">{visual}</p>
      </div>
    );
  }
  return null;
}

/* ====================== بنوك الأسئلة ====================== */

/* فئة A: 6-9 سنوات */
const Q_A: Question[] = [
  { type:"odd", q:"أيٌّ لا ينتمي للمجموعة؟", opts:["قطة","كلب","أسد","طاولة"], ans:3, visual:"قطة | كلب | أسد | طاولة" },
  { type:"sequence", q:"ما العدد التالي في التسلسل؟", opts:["9","10","12","7"], ans:1, visual:"2 4 6 8 ❓" },
  { type:"analogy", q:"الطائر له ريش، السمكة لها؟", opts:["ريش","فراء","حراشف","جناح"], ans:2, visual:"طائر : ريش :: سمكة : ❓" },
  { type:"matrix", q:"أيٌّ يكمل المصفوفة؟", opts:["🔴","🔵","🟡","🟢"], ans:1, visual:"🔴 🔵 🔴\n🔵 🔴 🔵\n🔴 🔵 ❓" },
  { type:"odd", q:"أيٌّ لا ينتمي؟", opts:["تفاحة","موزة","بطاطا","برتقالة"], ans:2, visual:"تفاحة | موزة | بطاطا | برتقالة" },
  { type:"logic", q:"5 + 3 = ___؟", opts:["7","8","9","6"], ans:1 },
  { type:"sequence", q:"التالي في السلسلة؟", opts:["8","9","10","11"], ans:1, visual:"1 3 5 7 ❓" },
  { type:"odd", q:"أيٌّ لا ينتمي؟", opts:["أحمر","أزرق","أصفر","مربع"], ans:3, visual:"أحمر | أزرق | أصفر | مربع" },
  { type:"matrix", q:"أيٌّ يكمل المصفوفة؟", opts:["A","B","C","D"], ans:2, visual:"A B C\nD E F\nG H ❓" },
  { type:"analogy", q:"اليوم ← شمس، الليل ← ؟", opts:["نجوم","نهار","قمر","ظلام"], ans:2, visual:"نهار : شمس :: ليل : ❓" },
  { type:"logic", q:"أكبر عدد: 15، 20، 13، 18؟", opts:["15","13","20","18"], ans:2 },
  { type:"sequence", q:"ما الذي يكمل النمط؟", opts:["🔴","🔵","🟡","🟢"], ans:0, visual:"🔴 🔵 🔴 🔵 🔴 ❓" },
  { type:"odd", q:"أيٌّ لا ينتمي؟", opts:["ربيع","صيف","ليل","خريف"], ans:2, visual:"ربيع | صيف | ليل | خريف" },
  { type:"logic", q:"3 × 2 = ___؟", opts:["5","6","7","8"], ans:1 },
  { type:"matrix", q:"أيٌّ يكمل المصفوفة؟", opts:["1","2","3","4"], ans:2, visual:"1 2 3\n4 5 6\n7 8 ❓" },
  { type:"analogy", q:"القلم للكتابة، المقص لـ؟", opts:["الورق","القطع","الرسم","اللصق"], ans:1, visual:"قلم : كتابة :: مقص : ❓" },
  { type:"odd", q:"أيٌّ لا ينتمي؟", opts:["سيارة","طائرة","كتاب","قطار"], ans:2, visual:"سيارة | طائرة | كتاب | قطار" },
  { type:"logic", q:"10 - 4 = ___؟", opts:["5","6","7","4"], ans:1 },
  { type:"sequence", q:"التالي؟", opts:["48","50","52","54"], ans:1, visual:"2 4 8 16 32 ❓" },
  { type:"logic", q:"كم أصبع في كلتا اليدين؟", opts:["8","10","12","9"], ans:1 },
];

/* فئة B: 10-12 سنوات */
const Q_B: Question[] = [
  { type:"matrix", q:"أيٌّ يكمل المصفوفة؟", opts:["32","36","24","40"], ans:1, visual:"2 4 6\n8 12 16\n18 24 ❓" },
  { type:"odd", q:"أيٌّ لا ينتمي؟", opts:["أسد","نمر","دب","عصفور","ذئب"], ans:3, visual:"أسد | نمر | دب | عصفور | ذئب" },
  { type:"analogy", q:"أكمل التناظر", opts:["المنشار","الخشب","المطرقة","المسمار"], ans:0, visual:"كاتب : قلم :: نجار : ❓" },
  { type:"sequence", q:"التالي في فيبوناتشي؟", opts:["21","18","20","24"], ans:0, visual:"1 1 2 3 5 8 13 ❓" },
  { type:"logic", q:"7² = ___؟", opts:["14","42","49","56"], ans:2 },
  { type:"matrix", q:"أيٌّ يكمل المصفوفة؟", opts:["🟥","🟦","🟨","🟩"], ans:0, visual:"🟥 🟦 🟥\n🟦 🟥 🟦\n🟥 🟦 ❓" },
  { type:"odd", q:"أيٌّ لا ينتمي؟", opts:["رياضيات","علوم","فيزياء","كرة قدم"], ans:3, visual:"رياضيات | علوم | فيزياء | كرة قدم" },
  { type:"analogy", q:"أكمل التناظر", opts:["سماع","وجه","تنفس","شم"], ans:3, visual:"أذن : سماع :: أنف : ❓" },
  { type:"sequence", q:"التالي؟", opts:["36","30","32","40"], ans:0, visual:"1 4 9 16 25 ❓" },
  { type:"spatial", q:"كيف يبدو المربع بعد دورانه 90°؟", opts:["مثلث","مربع","مستطيل","دائرة"], ans:1, visual:"□ → ⟳ → ؟" },
  { type:"logic", q:"½ + ¼ = ___؟", opts:["⅙","¾","⅔","⅓"], ans:1 },
  { type:"matrix", q:"أيٌّ يكمل المصفوفة؟", opts:["9","12","6","15"], ans:1, visual:"2 4 6\n3 6 9\n4 8 ❓" },
  { type:"odd", q:"أيٌّ لا ينتمي؟", opts:["مصر","السعودية","باريس","الإمارات"], ans:2, visual:"مصر | السعودية | باريس | الإمارات" },
  { type:"analogy", q:"أكمل التناظر", opts:["مدينة","رواية","كلمات","ورق"], ans:2, visual:"قاموس : كلمات :: أطلس : ❓" },
  { type:"sequence", q:"التالي؟", opts:["60","50","55","65"], ans:0, visual:"100 90 80 70 ❓" },
  { type:"logic", q:"إذا كان أحمد أكبر من محمد ومحمد أكبر من علي، من الأصغر؟", opts:["أحمد","محمد","علي","لا يمكن التحديد"], ans:2 },
  { type:"matrix", q:"أيٌّ يكمل المصفوفة؟", opts:["I","J","K","H"], ans:0, visual:"A B C\nD E F\nG H ❓" },
  { type:"odd", q:"أيٌّ لا ينتمي؟", opts:["معلم","طبيب","مستشفى","مهندس"], ans:2, visual:"معلم | طبيب | مستشفى | مهندس" },
  { type:"logic", q:"15% من 200 = ___؟", opts:["30","25","35","20"], ans:0 },
  { type:"sequence", q:"التالي؟", opts:["48","56","64","72"], ans:0, visual:"3 6 12 24 ❓" },
];

/* فئة C: 13-16 سنوات */
const Q_C: Question[] = [
  { type:"matrix", q:"أيٌّ يكمل المصفوفة؟", opts:["27","24","30","18"], ans:0, visual:"1 2 3\n3 6 9\n9 18 ❓" },
  { type:"odd", q:"أيٌّ لا ينتمي (من حيث المفهوم)؟", opts:["أكسجين","هيدروجين","ملح","كربون"], ans:2, visual:"أكسجين | هيدروجين | ملح | كربون" },
  { type:"analogy", q:"أكمل التناظر", opts:["العدد","الدالة","المتغير","النظرية"], ans:0, visual:"كيمياء : جزيء :: رياضيات : ❓" },
  { type:"sequence", q:"التالي في متتالية فيبوناتشي؟", opts:["34","32","36","38"], ans:0, visual:"2 3 5 8 13 21 ❓" },
  { type:"matrix", q:"أيٌّ يكمل المصفوفة؟", opts:["16","12","8","20"], ans:0, visual:"1 2 4\n2 4 8\n4 8 ❓" },
  { type:"spatial", q:"إذا طُوي الشكل، أي مكعب ينتج؟", opts:["مكعب 1×1×1","مكعب 2×2×2","هرم","أسطوانة"], ans:0, visual:"□□□\n□\n□" },
  { type:"odd", q:"أيٌّ لا ينتمي (نوع مختلف)؟", opts:["شمس","قمر","نجم","أرض","بحر"], ans:4, visual:"شمس | قمر | نجم | أرض | بحر" },
  { type:"analogy", q:"أكمل التناظر", opts:["العلوم","التجربة","الدليل","الفرضية"], ans:3, visual:"رياضيات : برهان :: علوم : ❓" },
  { type:"sequence", q:"التالي؟ (1²، 2²، 3²...)", opts:["36","32","40","25"], ans:0, visual:"1 4 9 16 25 ❓" },
  { type:"logic", q:"إذا كان x+y=10 وx-y=4، فما قيمة x؟", opts:["7","6","8","5"], ans:0 },
  { type:"matrix", q:"أيٌّ يكمل؟ (الأقطار متساوية)", opts:["5","8","10","6"], ans:2, visual:"2 6 4\n8 3 7\n4 9 ❓" },
  { type:"odd", q:"أيٌّ لا ينتمي (جذوره مختلفة)؟", opts:["التلفاز","الراديو","الكمبيوتر","كتاب"], ans:3, visual:"تلفاز | راديو | كمبيوتر | كتاب" },
  { type:"analogy", q:"أكمل التناظر", opts:["الحكاية","الأحداث","الشخصيات","الخاتمة"], ans:2, visual:"مسرحية : ممثلون :: رواية : ❓" },
  { type:"sequence", q:"التالي (الفرق يزيد 1)؟", opts:["16","15","17","14"], ans:0, visual:"1 2 4 7 11 ❓" },
  { type:"logic", q:"3x - 7 = 2x + 5، إذن x = ___؟", opts:["10","12","8","6"], ans:1 },
  { type:"spatial", q:"كم مكعباً في الشكل ثلاثي الأبعاد؟", opts:["6","7","8","9"], ans:1, visual:"■■\n■■\n■■■" },
  { type:"matrix", q:"أيٌّ يكمل؟ (نمط الأعداد الأولية)", opts:["13","11","17","19"], ans:0, visual:"2 3 5\n7 11 ❓\n17 19 23" },
  { type:"odd", q:"أيٌّ لا ينتمي (بيولوجياً)؟", opts:["خفاش","طائر","حشرة","ضفدع"], ans:3, visual:"خفاش | طائر | حشرة | ضفدع" },
  { type:"analogy", q:"أكمل التناظر", opts:["الميزان","الحاكم","القضاء","العدالة"], ans:2, visual:"طبيب : مشرط :: قاضٍ : ❓" },
  { type:"logic", q:"√144 = ___؟", opts:["11","14","12","13"], ans:2 },
];

/* فئة D: 17+ سنة */
const Q_D: Question[] = [
  { type:"matrix", q:"أيٌّ يكمل المصفوفة؟ (ضرب صف × عمود)", opts:["36","42","48","30"], ans:0, visual:"2 3 6\n3 4 12\n4 5 ❓" },
  { type:"odd", q:"أيٌّ المصطلح لا ينتمي فلسفياً؟", opts:["الوجودية","البراغماتية","الرياضيات","المثالية"], ans:2, visual:"وجودية | براغماتية | رياضيات | مثالية" },
  { type:"analogy", q:"أكمل التناظر", opts:["الحالة الخاصة","القانون العام","الفرضية","الاستنتاج"], ans:1, visual:"استنتاج : قانون عام :: استقراء : ❓" },
  { type:"sequence", q:"التالي في متتالية المثلثية؟", opts:["55","45","50","60"], ans:0, visual:"1 3 6 10 15 21 28 36 ❓" },
  { type:"logic", q:"إذا كان P(A)=0.3 وP(B)=0.4 مستقلان، P(A∩B)=___؟", opts:["0.12","0.7","0.58","0.1"], ans:0 },
  { type:"matrix", q:"أيٌّ يكمل؟ (أعداد أولية مربعة)", opts:["49","25","36","121"], ans:0, visual:"4 9 25\n49 121 ❓\n169 289 361" },
  { type:"odd", q:"أيٌّ لا ينتمي (رياضياً)؟", opts:["√2","π","√3","4"], ans:3, visual:"√2 | π | √3 | 4" },
  { type:"analogy", q:"أكمل التناظر", opts:["التركيب","التحليل","التطبيق","التقييم"], ans:1, visual:"تجميع : تركيب :: تفكيك : ❓" },
  { type:"sequence", q:"التالي؟ (متتالية لوكاس)", opts:["18","76","29","47"], ans:3, visual:"2 1 3 4 7 11 18 29 ❓" },
  { type:"logic", q:"f(x)=2x+3، قيمة f(4)=___؟", opts:["10","11","12","9"], ans:1 },
  { type:"matrix", q:"أيٌّ يكمل؟ (مجموع كل صف=15)", opts:["6","7","8","5"], ans:2, visual:"4 9 2\n3 5 7\n8 1 ❓" },
  { type:"odd", q:"أيٌّ لا ينتمي (نظرياً)؟", opts:["نظرية فيثاغورث","قانون نيوتن","مفردة النحو","نسبية أينشتاين"], ans:2, visual:"فيثاغورث | نيوتن | مفردة النحو | أينشتاين" },
  { type:"analogy", q:"أكمل التناظر", opts:["0.5","0.25","0.125","1"], ans:0, visual:"50% : 0.5 :: 25% : ❓" },
  { type:"sequence", q:"التالي؟ (تقليل تربيعي)", opts:["64","36","16","49"], ans:0, visual:"256 128 64 32 ❓" },
  { type:"logic", q:"الراتب زاد 10% ثم نقص 10%، النتيجة مقارنة بالأصل؟", opts:["يساويه","أقل بـ1%","أكثر بـ1%","أقل بـ10%"], ans:1 },
  { type:"spatial", q:"كرة داخل مكعب — كم وجه للمكعب يلامس الكرة (نظرياً)؟", opts:["0","6","8","4"], ans:1, visual:"⬜ ● ⬜" },
  { type:"matrix", q:"أيٌّ يكمل؟ (نمط XOR ثنائي)", opts:["0","1","2","3"], ans:1, visual:"0 1 0\n1 0 1\n0 1 ❓" },
  { type:"odd", q:"أيٌّ لا ينتمي (توزيعاً احتمالياً)؟", opts:["طبيعي","ثنائي","بواسون","سبيكمان"], ans:3, visual:"طبيعي | ثنائي | بواسون | سبيكمان" },
  { type:"analogy", q:"أكمل التناظر", opts:["المشتق","الجذر","اللوغاريتم","الطاقة"], ans:0, visual:"تكامل : مساحة :: تفاضل : ❓" },
  { type:"logic", q:"S = n(n+1)/2 لـn=10، S=___؟", opts:["45","50","55","60"], ans:2 },
];

/* ====================== دوال مساعدة ====================== */
function calcIQ(correct: number, age: number): number {
  const ratio = correct / 20;
  let iq: number;
  if (ratio >= 0.95) iq = 145;
  else if (ratio >= 0.90) iq = 135;
  else if (ratio >= 0.80) iq = 125;
  else if (ratio >= 0.70) iq = 115;
  else if (ratio >= 0.60) iq = 107;
  else if (ratio >= 0.50) iq = 100;
  else if (ratio >= 0.40) iq = 90;
  else if (ratio >= 0.30) iq = 80;
  else iq = 70;
  if (age < 10) iq += 3;
  else if (age < 13) iq += 1;
  return Math.min(iq, 160);
}

interface IQLvl { label: string; bg: string; emoji: string; desc: string }
function getLevel(iq: number): IQLvl {
  if (iq >= 145) return { label:"عبقري استثنائي", bg:"from-violet-600 to-purple-500", emoji:"🌟", desc:"أنت بين 0.1% الأذكى في العالم!" };
  if (iq >= 130) return { label:"موهوب جداً", bg:"from-blue-600 to-indigo-500", emoji:"🏆", desc:"ذكاء متقدم — أنت بين 2% الأذكى!" };
  if (iq >= 120) return { label:"فوق المتوسط", bg:"from-green-600 to-emerald-500", emoji:"⭐", desc:"ذكاء عالٍ — تتفوق على معظم الناس." };
  if (iq >= 110) return { label:"ذكاء عالٍ", bg:"from-lime-600 to-green-500", emoji:"💡", desc:"أعلى من المتوسط — تفكير منطقي ممتاز." };
  if (iq >= 90)  return { label:"متوسط", bg:"from-amber-500 to-yellow-400", emoji:"👍", desc:"معدل معظم البشر." };
  if (iq >= 80)  return { label:"أقل من المتوسط", bg:"from-orange-500 to-amber-400", emoji:"📘", desc:"التدريب والتعلم يُحسّنان الذكاء!" };
  return { label:"يحتاج تطوير", bg:"from-red-500 to-rose-400", emoji:"📚", desc:"الممارسة والقراءة ترفعان المستوى." };
}

function getQuestions(age: number): Question[] {
  let pool: Question[];
  if (age <= 9) pool = Q_A;
  else if (age <= 12) pool = Q_B;
  else if (age <= 16) pool = Q_C;
  else pool = Q_D;
  return [...pool].sort(() => Math.random() - 0.5).slice(0, 20);
}

const TYPE_LABELS: Record<QType, string> = {
  odd: "🔍 الكلمة المختلفة",
  matrix: "🧩 مصفوفة بصرية",
  sequence: "🔢 تسلسل",
  analogy: "🔗 تناظر",
  logic: "🧠 منطق",
  spatial: "🔺 مكاني",
};
const TYPE_BG: Record<QType, string> = {
  odd: "bg-emerald-50 border-emerald-100",
  matrix: "bg-violet-50 border-violet-100",
  sequence: "bg-indigo-50 border-indigo-100",
  analogy: "bg-rose-50 border-rose-100",
  logic: "bg-blue-50 border-blue-100",
  spatial: "bg-cyan-50 border-cyan-100",
};

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
  const [timeLeft, setTimeLeft] = useState(40);
  const startTimeRef = useRef<number>(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (screen !== "test" || confirmed) return;
    if (timeLeft <= 0) { handleAnswer(-1); return; }
    const t = setTimeout(() => setTimeLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, screen, confirmed]);

  const handleAnswer = useCallback((opt: number) => {
    if (confirmed) return;
    setSelected(opt);
    setConfirmed(true);
    setTimeout(() => {
      const na = [...answers, opt];
      setAnswers(na);
      if (current + 1 >= questions.length) {
        setElapsed(Math.round((Date.now() - startTimeRef.current) / 1000));
        setScreen("result");
      } else {
        setCurrent(c => c + 1);
        setSelected(null);
        setConfirmed(false);
        setTimeLeft(40);
      }
    }, 900);
  }, [confirmed, answers, current, questions.length]);

  const startTest = () => {
    if (!name.trim() || !age || parseInt(age) < 6) return;
    const qs = getQuestions(parseInt(age));
    setQuestions(qs); setAnswers([]); setCurrent(0);
    setSelected(null); setConfirmed(false); setTimeLeft(40);
    startTimeRef.current = Date.now();
    setScreen("test");
  };

  const restart = () => { setScreen("welcome"); setName(""); setAge(""); };
  const correct = answers.filter((a, i) => a === questions[i]?.ans).length;
  const iq = screen === "result" ? calcIQ(correct, parseInt(age)) : 0;
  const level = getLevel(iq);

  /* =================== شاشة الترحيب =================== */
  if (screen === "welcome") return (
    <div className="max-w-lg mx-auto animate-fade-in space-y-5">
      <div className="card p-8 bg-gradient-to-br from-violet-800 via-indigo-700 to-blue-700 text-white text-center">
        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"><Brain className="w-10 h-10"/></div>
        <h1 className="text-2xl font-bold mb-2">اختبار نسبة الذكاء</h1>
        <p className="text-indigo-200 text-sm">IQ Test — 20 سؤالاً بأنواع متعددة</p>
        <div className="grid grid-cols-3 gap-3 mt-5">
          {[{n:"6",l:"أنواع أسئلة"},{n:"20",l:"سؤالاً"},{n:"40",l:"ث/سؤال"}].map(s=>(
            <div key={s.l} className="bg-white/10 rounded-xl p-3"><div className="text-2xl font-bold">{s.n}</div><div className="text-xs text-indigo-200">{s.l}</div></div>
          ))}
        </div>
      </div>

      {/* أنواع الأسئلة */}
      <div className="card p-5">
        <p className="font-bold text-gray-700 mb-3 text-sm">أنواع الأسئلة في الاختبار</p>
        <div className="grid grid-cols-2 gap-2">
          {(Object.entries(TYPE_LABELS) as [QType,string][]).map(([k,v])=>(
            <div key={k} className={`p-2.5 rounded-xl border text-xs font-medium ${TYPE_BG[k]}`}>{v}</div>
          ))}
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <h2 className="font-bold text-gray-800">أدخل بياناتك</h2>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">اسمك</label>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="اكتب اسمك هنا..."
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 outline-none focus:border-violet-500 transition"/>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">عمرك بالسنوات</label>
          <input type="number" value={age} onChange={e=>setAge(e.target.value)} placeholder="مثال: 14" min={6} max={80}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 outline-none focus:border-violet-500 transition"/>
        </div>
        {age&&parseInt(age)>=6&&(
          <div className="bg-violet-50 border border-violet-100 rounded-xl p-3 text-sm text-violet-700 font-medium">
            {parseInt(age)<=9?"📚 فئة الأطفال (6-9 سنة)":parseInt(age)<=12?"🎒 الابتدائية العليا (10-12 سنة)":parseInt(age)<=16?"📐 المتوسطة والثانوية (13-16 سنة)":"🎓 فئة الكبار (17+ سنة)"}
          </div>
        )}
        <button onClick={startTest} disabled={!name.trim()||!age||parseInt(age)<6}
          className="w-full bg-violet-700 text-white py-4 rounded-2xl font-bold text-lg hover:bg-violet-600 disabled:opacity-40 disabled:cursor-not-allowed transition">
          🚀 ابدأ الاختبار
        </button>
      </div>
    </div>
  );

  /* =================== شاشة الاختبار =================== */
  if (screen === "test" && questions.length > 0) {
    const q = questions[current];
    const pct = (current / questions.length) * 100;
    const timerPct = (timeLeft / 40) * 100;
    return (
      <div className="max-w-lg mx-auto animate-fade-in space-y-4">
        {/* رأس */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-gray-400">السؤال</p>
              <p className="font-bold text-lg">{current+1} / {questions.length}</p>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-xl font-bold border ${TYPE_BG[q.type]}`}>{TYPE_LABELS[q.type]}</span>
            <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold ${timeLeft<=10?"bg-red-50 text-red-600":"bg-violet-50 text-violet-700"}`}>
              <Clock className="w-3.5 h-3.5"/> {timeLeft}s
            </div>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-1">
            <div className="h-full bg-violet-600 rounded-full transition-all" style={{width:`${pct}%`}}/>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-1000 ${timeLeft<=10?"bg-red-500":"bg-green-500"}`} style={{width:`${timerPct}%`}}/>
          </div>
        </div>

        {/* بطاقة السؤال */}
        <div className={`card p-5 border ${TYPE_BG[q.type]}`}>
          <p className="text-gray-800 font-bold text-base leading-relaxed mb-1">{q.q}</p>
          <VisualDisplay type={q.type} visual={q.visual}/>
          <div className="grid grid-cols-2 gap-2 mt-3">
            {q.opts.map((opt, i) => {
              let cls = "border-2 border-gray-200 bg-white text-gray-700 p-3 rounded-xl font-medium text-sm text-right cursor-pointer hover:border-violet-400 hover:bg-violet-50 transition-all flex items-center gap-2";
              if (confirmed) {
                if (i===q.ans) cls="border-2 border-green-500 bg-green-50 text-green-800 p-3 rounded-xl font-medium text-sm text-right flex items-center gap-2";
                else if (i===selected&&i!==q.ans) cls="border-2 border-red-400 bg-red-50 text-red-700 p-3 rounded-xl font-medium text-sm text-right flex items-center gap-2";
                else cls="border-2 border-gray-100 bg-gray-50 text-gray-300 p-3 rounded-xl font-medium text-sm text-right flex items-center gap-2";
              } else if (selected===i) cls="border-2 border-violet-500 bg-violet-50 text-violet-800 p-3 rounded-xl font-medium text-sm text-right flex items-center gap-2";
              return (
                <button key={i} onClick={()=>!confirmed&&setSelected(i)} className={cls}>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${confirmed&&i===q.ans?"bg-green-500 text-white":confirmed&&i===selected&&i!==q.ans?"bg-red-400 text-white":selected===i?"bg-violet-700 text-white":"bg-gray-200 text-gray-500"}`}>
                    {confirmed&&i===q.ans?<CheckCircle className="w-3.5 h-3.5"/>:confirmed&&i===selected&&i!==q.ans?<XCircle className="w-3.5 h-3.5"/>:["أ","ب","ج","د"][i]}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>
          {!confirmed&&selected!==null&&(
            <button onClick={()=>handleAnswer(selected)} className="mt-3 w-full bg-violet-700 text-white py-3 rounded-xl font-bold text-sm hover:bg-violet-600">✅ تأكيد الإجابة</button>
          )}
          {!confirmed&&selected===null&&(
            <button onClick={()=>handleAnswer(-1)} className="mt-3 w-full border border-gray-200 text-gray-400 py-2.5 rounded-xl text-sm hover:bg-gray-50">تخطي</button>
          )}
        </div>
      </div>
    );
  }

  /* =================== النتائج =================== */
  if (screen === "result") {
    const typeStats = (Object.keys(TYPE_LABELS) as QType[]).map(t=>{
      const qs = questions.filter(q=>q.type===t);
      const ok = qs.filter((q,_i)=>answers[questions.indexOf(q)]===q.ans).length;
      return {type:t,label:TYPE_LABELS[t],total:qs.length,ok};
    }).filter(x=>x.total>0);
    return (
      <div className="max-w-lg mx-auto animate-fade-in space-y-5">
        <div className={`card p-8 bg-gradient-to-br ${level.bg} text-white text-center`}>
          <div className="text-6xl mb-3">{level.emoji}</div>
          <h2 className="text-4xl font-black mb-1">IQ {iq}</h2>
          <p className="text-xl font-bold mb-1">{level.label}</p>
          <p className="text-white/80 text-sm">{level.desc}</p>
          <p className="mt-3 text-white/60 text-sm">👤 {name} • 🎂 {age} سنة</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[{n:correct,t:20,l:"صحيح",e:"✅"},{n:20-correct,t:20,l:"خطأ",e:"❌"},{n:Math.floor(elapsed/60)>0?`${Math.floor(elapsed/60)}د`:elapsed+"ث",t:null,l:"وقت",e:"⏱️"}].map(s=>(
            <div key={s.l} className="card p-4 text-center"><div className="text-2xl mb-1">{s.e}</div><div className="text-xl font-black text-gray-800">{s.n}{s.t?`/${s.t}`:""}</div><div className="text-xs text-gray-400">{s.l}</div></div>
          ))}
        </div>

        {/* أداء حسب النوع */}
        <div className="card p-5">
          <p className="font-bold text-gray-700 mb-3 text-sm">أداؤك حسب نوع السؤال</p>
          <div className="space-y-2">
            {typeStats.map(s=>(
              <div key={s.type} className={`flex items-center gap-3 p-2.5 rounded-xl ${TYPE_BG[s.type as QType]}`}>
                <span className="text-sm font-medium flex-1">{s.label}</span>
                <span className="text-xs font-bold">{s.ok}/{s.total}</span>
                <div className="w-24 h-2 bg-white/60 rounded-full overflow-hidden">
                  <div className="h-full bg-current rounded-full" style={{width:`${s.total>0?s.ok/s.total*100:0}%`}}/>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* مقياس IQ */}
        <div className="card p-5">
          <p className="font-bold text-gray-700 mb-3 text-sm">موقعك على مقياس الذكاء</p>
          <div className="h-5 rounded-full bg-gradient-to-l from-violet-600 via-green-500 via-amber-400 to-red-400 relative">
            <div className="absolute top-0 h-full w-1 bg-white shadow-lg rounded-full" style={{right:`${Math.min(Math.max((iq-60)/100*100,0),97)}%`}}/>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1"><span>60</span><span>80</span><span>100</span><span>120</span><span>140+</span></div>
          <div className="mt-3 space-y-1.5">
            {[
              {r:"130+",l:"موهوب / عبقري",c:"bg-violet-100 text-violet-700",a:iq>=130},
              {r:"120-129",l:"فوق المتوسط العالي",c:"bg-blue-100 text-blue-700",a:iq>=120&&iq<130},
              {r:"110-119",l:"ذكاء عالٍ",c:"bg-green-100 text-green-700",a:iq>=110&&iq<120},
              {r:"90-109",l:"متوسط",c:"bg-amber-100 text-amber-700",a:iq>=90&&iq<110},
              {r:"أقل من 90",l:"أقل من المتوسط",c:"bg-red-100 text-red-700",a:iq<90},
            ].map(lv=>(
              <div key={lv.r} className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs ${lv.a?lv.c+" font-bold ring-2 ring-offset-1 ring-violet-300":"bg-gray-50 text-gray-400"}`}>
                <span>{lv.l}</span><span className="font-mono">{lv.r}</span>
              </div>
            ))}
          </div>
        </div>

        {/* مراجعة */}
        <div className="card p-5">
          <p className="font-bold text-gray-700 mb-3 text-sm">مراجعة الإجابات</p>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {questions.map((q,i)=>{
              const ok=answers[i]===q.ans;
              return(
                <div key={i} className={`flex items-start gap-2 p-2.5 rounded-xl text-xs ${ok?"bg-green-50":"bg-red-50"}`}>
                  <span className={`flex-shrink-0 mt-0.5 ${ok?"text-green-600":"text-red-500"}`}>{ok?<CheckCircle className="w-4 h-4"/>:<XCircle className="w-4 h-4"/>}</span>
                  <div>
                    <span className={`text-xs font-bold mr-1 ${TYPE_BG[q.type]} px-1.5 py-0.5 rounded-lg`}>{TYPE_LABELS[q.type]}</span>
                    <p className="font-medium text-gray-700 mt-0.5">{q.q}</p>
                    {!ok&&<p className="text-green-700 mt-0.5">✓ الصواب: {q.opts[q.ans]}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={restart} className="flex items-center justify-center gap-2 bg-violet-700 text-white py-3.5 rounded-xl font-bold hover:bg-violet-600">
            <RotateCcw className="w-4 h-4"/> إعادة الاختبار
          </button>
          <button onClick={()=>{ const t=`اختبار الذكاء\n${name} (${age} سنة)\nIQ: ${iq} — ${level.label}\n${correct}/20 إجابة صحيحة`; if(navigator.share)navigator.share({title:"نتيجة اختبار الذكاء",text:t});else navigator.clipboard.writeText(t); }}
            className="flex items-center justify-center gap-2 border border-gray-200 text-gray-700 py-3.5 rounded-xl font-bold hover:bg-gray-50">
            <Trophy className="w-4 h-4 text-amber-500"/> مشاركة النتيجة
          </button>
        </div>
      </div>
    );
  }

  return null;
}

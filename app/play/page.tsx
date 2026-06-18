"use client";
import { useState, useEffect, useRef } from "react";
import { Gamepad2, Plus, Trash2, ExternalLink, RotateCcw } from "lucide-react";
import Link from "next/link";

/* ====================== types ====================== */
interface GameCard { id: string; title: string; description: string; emoji: string; url: string; difficulty: "سهل"|"متوسط"|"صعب"; category: string; }
function loadGames(): GameCard[] { try { const d = localStorage.getItem("kc_play_games"); return d ? JSON.parse(d) : []; } catch { return []; } }
function saveGames(g: GameCard[]) { localStorage.setItem("kc_play_games", JSON.stringify(g)); }
function isAdmin() { try { return typeof window !== "undefined" && localStorage.getItem("kc_admin_auth") === "1"; } catch { return false; } }

/* ============================================================
   لعبة 1: بطاقات الذاكرة
   ============================================================ */
const MEM_EMOJIS = ["🚀","🌟","🎯","🤖","💡","🔬","🎮","🏆","🌍","🐬","🦁","🌺"];
function buildMemCards() {
  const pairs = [...MEM_EMOJIS].sort(()=>Math.random()-0.5).slice(0,8);
  return [...pairs,...pairs].sort(()=>Math.random()-0.5).map((e,i)=>({id:i,emoji:e,flipped:false,matched:false}));
}
function MemoryGame() {
  const [cards,setCards] = useState(buildMemCards());
  const [picks,setPicks] = useState<number[]>([]);
  const [moves,setMoves] = useState(0);
  const [matches,setMatches] = useState(0);
  const [done,setDone] = useState(false);
  const [time,setTime] = useState(0);
  const [running,setRunning] = useState(false);
  useEffect(()=>{ if(!running||done) return; const t=setInterval(()=>setTime(s=>s+1),1000); return ()=>clearInterval(t); },[running,done]);
  const flip=(id:number)=>{
    if(picks.length>=2) return;
    const c=cards[id]; if(c.flipped||c.matched) return;
    if(!running) setRunning(true);
    const nc=cards.map((x,i)=>i===id?{...x,flipped:true}:x);
    setCards(nc);
    const np=[...picks,id];
    if(np.length===2){
      setMoves(m=>m+1);
      const[a,b]=np;
      if(nc[a].emoji===nc[b].emoji){
        const m2=nc.map((x,i)=>[a,b].includes(i)?{...x,matched:true}:x);
        setCards(m2); const nm=matches+1; setMatches(nm);
        if(nm===8) setDone(true); setPicks([]);
      } else { setTimeout(()=>{ setCards(p=>p.map((x,i)=>np.includes(i)?{...x,flipped:false}:x)); setPicks([]); },700); setPicks(np); }
    } else setPicks(np);
  };
  const reset=()=>{ setCards(buildMemCards()); setPicks([]); setMoves(0); setMatches(0); setDone(false); setTime(0); setRunning(false); };
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-2">
          <span className="bg-violet-50 text-violet-700 px-3 py-1.5 rounded-xl text-sm font-bold">👁️ {moves}</span>
          <span className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-xl text-sm font-bold">✅ {matches}/8</span>
          <span className="bg-amber-50 text-amber-700 px-3 py-1.5 rounded-xl text-sm font-bold">⏱️ {Math.floor(time/60)}:{(time%60).toString().padStart(2,"0")}</span>
        </div>
        <button onClick={reset} className="flex items-center gap-1.5 bg-gray-100 text-gray-600 px-3 py-1.5 rounded-xl text-sm hover:bg-gray-200"><RotateCcw className="w-3.5 h-3.5"/>إعادة</button>
      </div>
      {done&&<div className="bg-gradient-to-l from-violet-700 to-indigo-600 text-white rounded-2xl p-5 text-center"><div className="text-5xl mb-2">🏆</div><p className="text-xl font-black">أحسنت! فزت!</p><p className="text-indigo-200 text-sm">{moves} حركة في {time} ثانية</p><button onClick={reset} className="mt-3 bg-white text-violet-700 px-6 py-2 rounded-xl font-bold text-sm">العب مجدداً</button></div>}
      <div className="grid grid-cols-4 gap-2">
        {cards.map((c,i)=>(
          <button key={c.id} onClick={()=>flip(i)} className={`aspect-square rounded-2xl text-3xl transition-all duration-200 flex items-center justify-center border-2 ${c.matched?"bg-green-50 border-green-300 scale-95 opacity-60":c.flipped?"bg-violet-50 border-violet-400 scale-105 shadow-md":"bg-gray-100 border-gray-200 hover:bg-gray-200 hover:scale-105 text-transparent"}`}>
            {(c.flipped||c.matched)?c.emoji:"?"}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   لعبة 2: تحدي الرياضيات
   ============================================================ */
function MathGame() {
  const [score,setScore] = useState(0);
  const [lives,setLives] = useState(3);
  const [q,setQ] = useState<{text:string;ans:number}>({text:"",ans:0});
  const [input,setInput] = useState("");
  const [fb,setFb] = useState<"correct"|"wrong"|null>(null);
  const [tl,setTl] = useState(15);
  const [started,setStarted] = useState(false);
  const [over,setOver] = useState(false);
  const iRef = useRef<HTMLInputElement>(null);
  const genQ = ()=>{
    const ops=["+","-","×"]; const op=ops[Math.floor(Math.random()*ops.length)];
    let a=Math.floor(Math.random()*(score<10?12:20))+1, b=Math.floor(Math.random()*(score<10?10:15))+1;
    if(op==="-"&&b>a)[a,b]=[b,a];
    const ans=op==="+"?a+b:op==="-"?a-b:a*b;
    setQ({text:`${a} ${op} ${b} = ?`,ans}); setTl(15); setInput(""); setFb(null);
    setTimeout(()=>iRef.current?.focus(),100);
  };
  useEffect(()=>{ if(started) genQ(); },[started]);
  useEffect(()=>{
    if(!started||over||fb) return;
    if(tl<=0){ wrong(); return; }
    const t=setTimeout(()=>setTl(s=>s-1),1000); return ()=>clearTimeout(t);
  },[tl,started,over,fb]);
  const wrong=()=>{ setFb("wrong"); const nl=lives-1; setLives(nl); if(nl<=0){setOver(true);return;} setTimeout(genQ,900); };
  const check=()=>{ if(parseInt(input)===q.ans){setFb("correct");setScore(s=>s+1);setTimeout(genQ,500);}else wrong(); };
  const reset=()=>{ setScore(0);setLives(3);setFb(null);setOver(false);setStarted(false);setInput(""); };
  if(!started) return(<div className="text-center py-8"><div className="text-6xl mb-4">🧮</div><h3 className="text-xl font-bold text-gray-800 mb-2">تحدي الرياضيات</h3><p className="text-gray-500 text-sm mb-6">أجب على أكبر عدد ممكن قبل نفاد أرواحك!</p><button onClick={()=>setStarted(true)} className="bg-blue-700 text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-600">ابدأ!</button></div>);
  if(over) return(<div className="text-center py-8"><div className="text-6xl mb-3">🎯</div><p className="text-2xl font-black text-gray-800">انتهت اللعبة!</p><p className="text-5xl font-black text-blue-700 my-4">{score}</p><button onClick={reset} className="bg-blue-700 text-white px-8 py-3 rounded-2xl font-bold">العب مجدداً</button></div>);
  return(
    <div className="space-y-4">
      <div className="flex items-center justify-between"><div className="flex gap-2">{[...Array(3)].map((_,i)=><span key={i} className={`text-2xl ${i<lives?"opacity-100":"opacity-20"}`}>❤️</span>)}</div><span className="bg-blue-50 text-blue-700 px-4 py-1.5 rounded-xl font-bold">نقاط: {score}</span></div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full transition-all duration-1000 ${tl<=5?"bg-red-500":"bg-green-500"}`} style={{width:`${(tl/15)*100}%`}}/></div>
      <div className={`text-center py-6 rounded-2xl ${fb==="correct"?"bg-green-50":fb==="wrong"?"bg-red-50":"bg-violet-50"}`}><p className="text-4xl font-black text-gray-800">{q.text}</p>{fb==="correct"&&<p className="text-green-600 font-bold mt-2">✅ صحيح!</p>}{fb==="wrong"&&<p className="text-red-600 font-bold mt-2">❌ الإجابة: {q.ans}</p>}</div>
      <div className="flex gap-2"><input ref={iRef} type="number" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&input&&check()} className="flex-1 text-center text-2xl font-bold border-2 border-gray-200 rounded-2xl py-4 outline-none focus:border-blue-500 bg-gray-50"/><button onClick={check} disabled={!input} className="bg-blue-700 text-white px-8 rounded-2xl font-bold text-xl hover:bg-blue-600 disabled:opacity-40">✓</button></div>
    </div>
  );
}

/* ============================================================
   لعبة 3: الكلمة المختلفة
   ============================================================ */
const ODD_ROUNDS = [
  {items:["قطة","كلب","أسد","طاولة"],odd:3,cat:"الحيوانات"},
  {items:["تفاحة","موزة","بطاطا","برتقالة"],odd:2,cat:"الفواكه"},
  {items:["أحمر","أزرق","أصفر","مربع"],odd:3,cat:"الألوان"},
  {items:["سيارة","طائرة","كتاب","قطار"],odd:2,cat:"وسائل النقل"},
  {items:["ربيع","صيف","ليل","خريف"],odd:2,cat:"الفصول"},
  {items:["مصر","السعودية","باريس","الإمارات"],odd:2,cat:"الدول"},
  {items:["شمس","قمر","نجم","بحر"],odd:3,cat:"أجسام الفضاء"},
  {items:["معلم","طبيب","مستشفى","مهندس"],odd:2,cat:"المهن"},
  {items:["رياضيات","كرة قدم","علوم","تاريخ"],odd:1,cat:"المواد الدراسية"},
  {items:["نهر","بحر","جبل","بحيرة"],odd:2,cat:"المسطحات المائية"},
  {items:["كرسي","سرير","تلفاز","طاولة"],odd:2,cat:"الأثاث"},
  {items:["مطر","ثلج","عاصفة","صحراء"],odd:3,cat:"الطقس"},
  {items:["أسد","نمر","فهد","حمامة"],odd:3,cat:"الحيوانات المفترسة"},
  {items:["قلم","دفتر","مسطرة","لاعب"],odd:3,cat:"أدوات الكتابة"},
  {items:["شوكولاتة","بيتزا","بقدونس","آيس كريم"],odd:2,cat:"الحلويات"},
];
function OddWordGame() {
  const [idx,setIdx] = useState(0);
  const [score,setScore] = useState(0);
  const [wrong,setWrong] = useState(0);
  const [chosen,setChosen] = useState<number|null>(null);
  const [done,setDone] = useState(false);
  const rounds = ODD_ROUNDS;
  const r = rounds[idx % rounds.length];
  const pick=(i:number)=>{
    if(chosen!==null) return;
    setChosen(i);
    if(i===r.odd) setScore(s=>s+1); else setWrong(w=>w+1);
    setTimeout(()=>{
      if(idx+1>=rounds.length){setDone(true);return;}
      setIdx(x=>x+1); setChosen(null);
    },800);
  };
  const reset=()=>{setIdx(0);setScore(0);setWrong(0);setChosen(null);setDone(false);};
  const COLORS=["bg-blue-50 border-blue-200 text-blue-800","bg-green-50 border-green-200 text-green-800","bg-amber-50 border-amber-200 text-amber-800","bg-rose-50 border-rose-200 text-rose-800"];
  if(done) return(<div className="text-center py-8"><div className="text-5xl mb-3">🎉</div><p className="text-2xl font-black text-gray-800">انتهيت!</p><div className="flex gap-4 justify-center my-4"><span className="text-green-600 text-3xl font-black">{score}✅</span><span className="text-red-500 text-3xl font-black">{wrong}❌</span></div><button onClick={reset} className="bg-emerald-700 text-white px-8 py-3 rounded-2xl font-bold">العب مجدداً</button></div>);
  return(
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">السؤال {idx+1}/{rounds.length}</span>
        <div className="flex gap-2"><span className="bg-green-50 text-green-700 px-3 py-1 rounded-xl text-sm font-bold">✅ {score}</span><span className="bg-red-50 text-red-500 px-3 py-1 rounded-xl text-sm font-bold">❌ {wrong}</span></div>
      </div>
      <div className="text-center py-4 bg-gradient-to-l from-emerald-700 to-teal-600 text-white rounded-2xl">
        <p className="text-sm text-emerald-200 mb-1">أيٌّ من هذه الكلمات لا ينتمي للمجموعة؟</p>
        <p className="text-lg font-bold">🔍 {r.cat}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {r.items.map((item,i)=>{
          let cls = `${COLORS[i]} border-2 p-4 rounded-2xl font-bold text-center text-base cursor-pointer transition-all hover:scale-105`;
          if(chosen!==null){
            if(i===r.odd) cls=`border-2 p-4 rounded-2xl font-bold text-center text-base bg-green-500 text-white border-green-500 scale-105`;
            else if(i===chosen) cls=`border-2 p-4 rounded-2xl font-bold text-center text-base bg-red-400 text-white border-red-400`;
            else cls=`border-2 p-4 rounded-2xl font-bold text-center text-base border-gray-100 bg-gray-50 text-gray-400`;
          }
          return <button key={i} onClick={()=>pick(i)} className={cls}>{item}</button>;
        })}
      </div>
    </div>
  );
}

/* ============================================================
   لعبة 4: إكمال التسلسل
   ============================================================ */
const SEQ_ROUNDS = [
  {seq:"2  4  6  8  ___",ans:"10",distractors:["9","11","12"],hint:"أعداد زوجية"},
  {seq:"1  3  5  7  ___",ans:"9",distractors:["8","10","11"],hint:"أعداد فردية"},
  {seq:"5  10  15  20  ___",ans:"25",distractors:["22","24","30"],hint:"مضاعفات 5"},
  {seq:"1  4  9  16  ___",ans:"25",distractors:["20","24","36"],hint:"أعداد مربعة"},
  {seq:"2  4  8  16  ___",ans:"32",distractors:["24","28","36"],hint:"تضاعف"},
  {seq:"100  90  80  70  ___",ans:"60",distractors:["65","55","50"],hint:"تنقص 10"},
  {seq:"1  1  2  3  5  8  ___",ans:"13",distractors:["11","12","14"],hint:"فيبوناتشي"},
  {seq:"3  6  12  24  ___",ans:"48",distractors:["36","42","50"],hint:"تضاعف"},
  {seq:"50  45  40  35  ___",ans:"30",distractors:["28","32","25"],hint:"تنقص 5"},
  {seq:"0  1  4  9  16  ___",ans:"25",distractors:["20","24","36"],hint:"مربعات: 0²، 1²، 2²..."},
  {seq:"🔴 🔵 🔴 🔵 🔴 ___",ans:"🔵",distractors:["🟡","🔴","🟢"],hint:"تناوب لوني"},
  {seq:"⭐ ⭐⭐ ⭐⭐⭐ ⭐⭐⭐⭐ ___",ans:"⭐⭐⭐⭐⭐",distractors:["⭐","⭐⭐⭐","⭐⭐⭐⭐⭐⭐"],hint:"يزيد نجمة كل مرة"},
  {seq:"أ  ج  هـ  ز  ___",ans:"ط",distractors:["ح","ي","ب"],hint:"حروف متناوبة"},
  {seq:"1  2  4  7  11  ___",ans:"16",distractors:["14","15","17"],hint:"الفرق يزيد بمقدار 1"},
  {seq:"64  32  16  8  ___",ans:"4",distractors:["2","6","5"],hint:"يُقسَّم على 2"},
];
function SequenceGame() {
  const [idx,setIdx] = useState(0);
  const [score,setScore] = useState(0);
  const [chosen,setChosen] = useState<number|null>(null);
  const [done,setDone] = useState(false);
  const rounds = SEQ_ROUNDS;
  const r = rounds[idx % rounds.length];
  const opts = [r.ans,...r.distractors].sort(()=>Math.random()-0.5);
  const [shuffled] = useState(()=>[...SEQ_ROUNDS].sort(()=>Math.random()-0.5).slice(0,10));
  const cur = shuffled[idx];
  const curOpts = useState(()=>shuffled.map(r=>[r.ans,...r.distractors].sort(()=>Math.random()-0.5)))[0];

  const pick=(val:string)=>{
    if(chosen!==null) return;
    const ci = curOpts[idx].indexOf(val);
    setChosen(ci);
    if(val===cur.ans) setScore(s=>s+1);
    setTimeout(()=>{ if(idx+1>=shuffled.length){setDone(true);return;} setIdx(x=>x+1); setChosen(null); },900);
  };
  const reset=()=>{setIdx(0);setScore(0);setChosen(null);setDone(false);};

  if(done) return(<div className="text-center py-8"><div className="text-5xl mb-3">🎊</div><p className="text-2xl font-black text-gray-800">رائع!</p><p className="text-5xl font-black text-indigo-700 my-4">{score}/{shuffled.length}</p><button onClick={reset} className="bg-indigo-700 text-white px-8 py-3 rounded-2xl font-bold">العب مجدداً</button></div>);

  return(
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">السؤال {idx+1}/{shuffled.length}</span>
        <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-xl text-sm font-bold">✅ {score}</span>
      </div>
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 text-center">
        <p className="text-xs text-indigo-400 mb-2">أكمل التسلسل</p>
        <p className="text-2xl font-black text-indigo-900 tracking-wide">{cur.seq}</p>
        <p className="text-xs text-indigo-400 mt-2">💡 {cur.hint}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {curOpts[idx].map((val,i)=>{
          const isCorrect = val===cur.ans;
          let cls = "border-2 border-gray-200 bg-gray-50 text-gray-800 p-4 rounded-2xl font-bold text-center text-lg cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all";
          if(chosen!==null){
            if(isCorrect) cls="border-2 border-green-500 bg-green-500 text-white p-4 rounded-2xl font-bold text-center text-lg";
            else if(i===chosen) cls="border-2 border-red-400 bg-red-400 text-white p-4 rounded-2xl font-bold text-center text-lg";
            else cls="border-2 border-gray-100 bg-gray-50 text-gray-300 p-4 rounded-2xl font-bold text-center text-lg";
          }
          return <button key={i} onClick={()=>pick(val)} className={cls}>{val}</button>;
        })}
      </div>
    </div>
  );
}

/* ============================================================
   لعبة 5: مصفوفة بصرية (أيٌّ يكمل الشكل؟)
   ============================================================ */
const MATRIX_ROUNDS = [
  {
    grid:["🔴","🔵","🔴","🔵","🔴","🔵","🔴","🔵","?"],
    ans:"🔴", distractors:["🔵","🟡","🟢"],
    hint:"تناوب أحمر وأزرق"
  },
  {
    grid:["⭐","⭐⭐","⭐⭐⭐","⭐⭐","⭐⭐⭐","⭐⭐⭐⭐","⭐⭐⭐","⭐⭐⭐⭐","?"],
    ans:"⭐⭐⭐⭐⭐", distractors:["⭐","⭐⭐","⭐⭐⭐⭐⭐⭐"],
    hint:"كل صف يزيد نجمة"
  },
  {
    grid:["1","2","3","4","5","6","7","8","?"],
    ans:"9", distractors:["10","6","8"],
    hint:"أعداد متسلسلة"
  },
  {
    grid:["🟥","🟦","🟥","🟦","🟥","🟦","🟦","🟥","?"],
    ans:"🟦", distractors:["🟥","🟨","🟩"],
    hint:"انظر للأنماط في كل صف"
  },
  {
    grid:["A","B","C","D","E","F","G","H","?"],
    ans:"I", distractors:["J","K","Z"],
    hint:"الحروف الأبجدية"
  },
  {
    grid:["2","4","6","3","6","9","4","8","?"],
    ans:"12", distractors:["10","11","16"],
    hint:"كل صف: عدد × 2 ثم × 3"
  },
  {
    grid:["🌑","🌒","🌓","🌔","🌕","🌖","🌗","🌘","?"],
    ans:"🌑", distractors:["🌕","🌓","🌘"],
    hint:"دورة القمر تعود للبداية"
  },
  {
    grid:["1","3","9","2","6","18","3","9","?"],
    ans:"27", distractors:["24","21","30"],
    hint:"كل صف: العدد × 3"
  },
];

function MatrixGame() {
  const [shuffled] = useState(()=>[...MATRIX_ROUNDS].sort(()=>Math.random()-0.5));
  const [idx,setIdx] = useState(0);
  const [score,setScore] = useState(0);
  const [chosen,setChosen] = useState<number|null>(null);
  const [done,setDone] = useState(false);
  const [opts] = useState(()=>shuffled.map(r=>[r.ans,...r.distractors].sort(()=>Math.random()-0.5)));
  const cur = shuffled[idx];

  const pick=(val:string)=>{
    if(chosen!==null) return;
    setChosen(opts[idx].indexOf(val));
    if(val===cur.ans) setScore(s=>s+1);
    setTimeout(()=>{ if(idx+1>=shuffled.length){setDone(true);return;} setIdx(x=>x+1); setChosen(null); },900);
  };
  const reset=()=>{setIdx(0);setScore(0);setChosen(null);setDone(false);};
  if(done) return(<div className="text-center py-8"><div className="text-5xl mb-3">🧩</div><p className="text-2xl font-black text-gray-800">ممتاز!</p><p className="text-5xl font-black text-purple-700 my-4">{score}/{shuffled.length}</p><button onClick={reset} className="bg-purple-700 text-white px-8 py-3 rounded-2xl font-bold">العب مجدداً</button></div>);

  return(
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">السؤال {idx+1}/{shuffled.length}</span>
        <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-xl text-sm font-bold">✅ {score}</span>
      </div>
      <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 text-center">
        <p className="text-xs text-purple-400 mb-3">أيٌّ من الخيارات يكمل المصفوفة؟</p>
        <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
          {cur.grid.map((cell,i)=>(
            <div key={i} className={`aspect-square rounded-xl flex items-center justify-center font-bold text-base ${cell==="?"?"bg-white border-2 border-dashed border-purple-400 text-purple-400 text-2xl":"bg-white border border-purple-100 shadow-sm text-gray-800"}`}>
              {cell==="?"?"?":cell}
            </div>
          ))}
        </div>
        <p className="text-xs text-purple-400 mt-3">💡 {cur.hint}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {opts[idx].map((val,i)=>{
          const isCorrect=val===cur.ans;
          let cls="border-2 border-gray-200 bg-gray-50 text-gray-800 p-4 rounded-2xl font-bold text-center text-lg cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all";
          if(chosen!==null){
            if(isCorrect) cls="border-2 border-green-500 bg-green-500 text-white p-4 rounded-2xl font-bold text-center text-lg";
            else if(i===chosen) cls="border-2 border-red-400 bg-red-400 text-white p-4 rounded-2xl font-bold text-center text-lg";
            else cls="border-2 border-gray-100 bg-gray-50 text-gray-300 p-4 rounded-2xl font-bold text-center text-lg";
          }
          return <button key={i} onClick={()=>pick(val)} className={cls}>{val}</button>;
        })}
      </div>
    </div>
  );
}

/* ============================================================
   لعبة 6: التناظر اللفظي
   ============================================================ */
const ANALOGY_ROUNDS = [
  {a:"معلم",b:"مدرسة",c:"طبيب",ans:"مستشفى",distractors:["دواء","مريض","عيادة حكم"]},
  {a:"طائر",b:"ريش",c:"سمكة",ans:"حراشف",distractors:["زعانف","ذيل","بحر"]},
  {a:"قلم",b:"كتابة",c:"مقص",ans:"قطع",distractors:["ورق","جرح","رسم"]},
  {a:"نهار",b:"شمس",c:"ليل",ans:"قمر",distractors:["نجوم","ظلام","نوم"]},
  {a:"ساق",b:"إنسان",c:"جذع",ans:"شجرة",distractors:["ورق","غابة","نبات"]},
  {a:"مفتاح",b:"باب",c:"كلمة مرور",ans:"جهاز",distractors:["إنترنت","هاتف","برنامج"]},
  {a:"مطبخ",b:"طعام",c:"مختبر",ans:"تجارب",distractors:["علوم","مواد","دراسة"]},
  {a:"أذن",b:"سماع",c:"أنف",ans:"شم",distractors:["تنفس","وجه","تذوق"]},
  {a:"ملك",b:"قصر",c:"بدوي",ans:"خيمة",distractors:["صحراء","حصان","ناقة"]},
  {a:"قاموس",b:"كلمات",c:"أطلس",ans:"خرائط",distractors:["مدن","دول","جغرافيا"]},
];
function AnalogyGame() {
  const [shuffled] = useState(()=>[...ANALOGY_ROUNDS].sort(()=>Math.random()-0.5));
  const [idx,setIdx] = useState(0);
  const [score,setScore] = useState(0);
  const [chosen,setChosen] = useState<number|null>(null);
  const [done,setDone] = useState(false);
  const [opts] = useState(()=>shuffled.map(r=>[r.ans,...r.distractors.slice(0,3)].sort(()=>Math.random()-0.5)));
  const cur = shuffled[idx];
  const pick=(val:string)=>{
    if(chosen!==null) return;
    setChosen(opts[idx].indexOf(val));
    if(val===cur.ans) setScore(s=>s+1);
    setTimeout(()=>{ if(idx+1>=shuffled.length){setDone(true);return;} setIdx(x=>x+1); setChosen(null); },900);
  };
  const reset=()=>{setIdx(0);setScore(0);setChosen(null);setDone(false);};
  if(done) return(<div className="text-center py-8"><div className="text-5xl mb-3">🔗</div><p className="text-2xl font-black text-gray-800">رائع!</p><p className="text-5xl font-black text-rose-700 my-4">{score}/{shuffled.length}</p><button onClick={reset} className="bg-rose-700 text-white px-8 py-3 rounded-2xl font-bold">العب مجدداً</button></div>);
  return(
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">السؤال {idx+1}/{shuffled.length}</span>
        <span className="bg-rose-50 text-rose-700 px-3 py-1 rounded-xl text-sm font-bold">✅ {score}</span>
      </div>
      <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5">
        <p className="text-xs text-rose-400 text-center mb-4">أكمل التناظر</p>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {[{label:cur.a,sub:""},{label:":",sub:""},{label:cur.b,sub:""},{label:"::","sub":""},{label:cur.c,sub:""},{label:":",sub:""},{label:"؟",sub:""}].map((x,i)=>(
            <span key={i} className={`${x.label==="؟"?"text-2xl font-black text-rose-500 bg-white px-3 py-1 rounded-xl border-2 border-dashed border-rose-300":x.label===":"||x.label==="::"?"text-rose-400 text-xl font-bold":"text-lg font-bold text-gray-800 bg-white px-3 py-1 rounded-xl border border-rose-100"}`}>{x.label}</span>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {opts[idx].map((val,i)=>{
          const isCorrect=val===cur.ans;
          let cls="border-2 border-gray-200 bg-gray-50 text-gray-800 p-4 rounded-2xl font-bold text-center cursor-pointer hover:border-rose-400 hover:bg-rose-50 transition-all";
          if(chosen!==null){
            if(isCorrect) cls="border-2 border-green-500 bg-green-500 text-white p-4 rounded-2xl font-bold text-center";
            else if(i===chosen) cls="border-2 border-red-400 bg-red-400 text-white p-4 rounded-2xl font-bold text-center";
            else cls="border-2 border-gray-100 bg-gray-50 text-gray-300 p-4 rounded-2xl font-bold text-center";
          }
          return <button key={i} onClick={()=>pick(val)} className={cls}>{val}</button>;
        })}
      </div>
    </div>
  );
}

/* ============================================================
   المكوّن الرئيسي
   ============================================================ */
type ActiveGame = "none"|"memory"|"math"|"odd"|"sequence"|"matrix"|"analogy";

const BUILT_IN_GAMES = [
  {id:"memory",emoji:"🧠",title:"بطاقات الذاكرة",desc:"طابق الأزواج في أقل عدد من الحركات",diff:"سهل",cat:"ذاكرة",color:"from-violet-700 to-indigo-600"},
  {id:"math",emoji:"🧮",title:"تحدي الرياضيات",desc:"حل عمليات حسابية بسرعة قبل نفاد الأرواح!",diff:"متوسط",cat:"رياضيات",color:"from-blue-700 to-cyan-600"},
  {id:"odd",emoji:"🔍",title:"الكلمة المختلفة",desc:"اكتشف الكلمة التي لا تنتمي للمجموعة",diff:"سهل",cat:"منطق",color:"from-emerald-700 to-teal-600"},
  {id:"sequence",emoji:"🔢",title:"إكمال التسلسل",desc:"أكمل السلسلة الرقمية أو النمطية الصحيحة",diff:"متوسط",cat:"منطق",color:"from-indigo-700 to-purple-600"},
  {id:"matrix",emoji:"🧩",title:"المصفوفة البصرية",desc:"أيٌّ من الخيارات يكمل نمط المصفوفة؟",diff:"صعب",cat:"ذكاء",color:"from-purple-700 to-pink-600"},
  {id:"analogy",emoji:"🔗",title:"التناظر اللفظي",desc:"أ : ب :: ج : ؟ — اكتشف العلاقة المنطقية",diff:"صعب",cat:"لغة",color:"from-rose-700 to-orange-600"},
];

const DIFF_COLOR: Record<string,string> = {
  "سهل":"bg-green-100 text-green-700",
  "متوسط":"bg-amber-100 text-amber-700",
  "صعب":"bg-red-100 text-red-700",
};

export default function PlayPage() {
  const [admin] = useState(isAdmin);
  const [games,setGames] = useState<GameCard[]>([]);
  const [activeGame,setActiveGame] = useState<ActiveGame>("none");
  const [showAdd,setShowAdd] = useState(false);
  const [newGame,setNewGame] = useState<Omit<GameCard,"id">>({title:"",description:"",emoji:"🎮",url:"",difficulty:"متوسط",category:"تعليمية"});
  useEffect(()=>{ setGames(loadGames()); },[]);

  const addGame=()=>{
    if(!newGame.title.trim()||!newGame.url.trim()) return;
    const g:GameCard={...newGame,id:Date.now().toString()};
    const updated=[g,...games]; saveGames(updated); setGames(updated);
    setShowAdd(false); setNewGame({title:"",description:"",emoji:"🎮",url:"",difficulty:"متوسط",category:"تعليمية"});
  };
  const deleteGame=(id:string)=>{ const u=games.filter(g=>g.id!==id); saveGames(u); setGames(u); };

  if(activeGame!=="none") return(
    <div className="max-w-lg mx-auto space-y-4 animate-fade-in">
      <button onClick={()=>setActiveGame("none")} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm">← العودة للألعاب</button>
      <div className="card p-6">
        <h2 className="font-bold text-gray-800 text-lg mb-5">
          {activeGame==="memory"&&"🧠 بطاقات الذاكرة"}
          {activeGame==="math"&&"🧮 تحدي الرياضيات"}
          {activeGame==="odd"&&"🔍 الكلمة المختلفة"}
          {activeGame==="sequence"&&"🔢 إكمال التسلسل"}
          {activeGame==="matrix"&&"🧩 المصفوفة البصرية"}
          {activeGame==="analogy"&&"🔗 التناظر اللفظي"}
        </h2>
        {activeGame==="memory"&&<MemoryGame/>}
        {activeGame==="math"&&<MathGame/>}
        {activeGame==="odd"&&<OddWordGame/>}
        {activeGame==="sequence"&&<SequenceGame/>}
        {activeGame==="matrix"&&<MatrixGame/>}
        {activeGame==="analogy"&&<AnalogyGame/>}
      </div>
    </div>
  );

  return(
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="card p-6 bg-gradient-to-l from-purple-800 to-indigo-700 text-white">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center"><Gamepad2 className="w-6 h-6"/></div>
            <div><h1 className="text-2xl font-bold">نلعب ونتعلم</h1><p className="text-indigo-200 text-sm">6 ألعاب تعليمية تفاعلية ممتعة</p></div>
          </div>
          {admin&&<button onClick={()=>setShowAdd(true)} className="flex items-center gap-2 bg-white text-purple-800 px-4 py-2 rounded-xl text-sm font-bold hover:bg-purple-50 flex-shrink-0"><Plus className="w-4 h-4"/>أضف لعبة</button>}
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4">
          {[{n:"6",l:"ألعاب مدمجة",e:"🎮"},{n:games.length,l:"ألعاب مضافة",e:"🔗"},{n:"∞",l:"متعة لا تنتهي",e:"⭐"}].map(s=>(
            <div key={s.l} className="bg-white/10 rounded-xl p-2 text-center"><div className="text-lg">{s.e}</div><div className="text-lg font-bold">{s.n}</div><div className="text-indigo-200 text-[10px]">{s.l}</div></div>
          ))}
        </div>
      </div>

      {/* فورم الإضافة */}
      {showAdd&&admin&&(
        <div className="card p-5 space-y-4 border-2 border-purple-100">
          <h3 className="font-bold text-gray-800 flex items-center gap-2"><Plus className="w-4 h-4 text-purple-600"/>إضافة لعبة جديدة</h3>
          <div className="grid md:grid-cols-2 gap-3">
            <div><label className="text-xs font-semibold text-gray-500 mb-1 block">رمز</label><input value={newGame.emoji} onChange={e=>setNewGame(p=>({...p,emoji:e.target.value}))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-2xl text-center bg-gray-50 outline-none"/></div>
            <div><label className="text-xs font-semibold text-gray-500 mb-1 block">الاسم *</label><input value={newGame.title} onChange={e=>setNewGame(p=>({...p,title:e.target.value}))} placeholder="اسم اللعبة" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-purple-500"/></div>
            <div className="md:col-span-2"><label className="text-xs font-semibold text-gray-500 mb-1 block">الرابط *</label><input value={newGame.url} onChange={e=>setNewGame(p=>({...p,url:e.target.value}))} placeholder="https://..." dir="ltr" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none font-mono"/></div>
            <div><label className="text-xs font-semibold text-gray-500 mb-1 block">الصعوبة</label><select value={newGame.difficulty} onChange={e=>setNewGame(p=>({...p,difficulty:e.target.value as GameCard["difficulty"]}))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none"><option>سهل</option><option>متوسط</option><option>صعب</option></select></div>
            <div><label className="text-xs font-semibold text-gray-500 mb-1 block">التصنيف</label><select value={newGame.category} onChange={e=>setNewGame(p=>({...p,category:e.target.value}))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none">{["تعليمية","رياضيات","علوم","لغة عربية","ذاكرة","منطق"].map(c=><option key={c}>{c}</option>)}</select></div>
          </div>
          <div className="flex gap-3">
            <button onClick={addGame} className="bg-purple-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-purple-600">✅ إضافة</button>
            <button onClick={()=>setShowAdd(false)} className="bg-gray-100 text-gray-600 px-5 py-2.5 rounded-xl text-sm">إلغاء</button>
          </div>
        </div>
      )}

      {/* الألعاب المدمجة */}
      <div>
        <h2 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><Gamepad2 className="w-4 h-4 text-purple-600"/>الألعاب المدمجة ({BUILT_IN_GAMES.length})</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {BUILT_IN_GAMES.map(g=>(
            <div key={g.id} className="card overflow-hidden group hover:shadow-lg transition-all">
              <div className={`bg-gradient-to-l ${g.color} p-5 text-white`}>
                <div className="text-4xl mb-2">{g.emoji}</div>
                <h3 className="font-bold text-lg group-hover:text-yellow-300 transition-colors">{g.title}</h3>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-500 mb-3">{g.desc}</p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${DIFF_COLOR[g.diff]}`}>{g.diff}</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">{g.cat}</span>
                  </div>
                  <button onClick={()=>setActiveGame(g.id as ActiveGame)} className="bg-purple-700 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-purple-600 transition">▶ العب</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* اختبار الذكاء */}
      <div className="card overflow-hidden">
        <div className="bg-gradient-to-l from-violet-800 to-indigo-700 p-5 text-white flex items-center gap-4">
          <div className="text-4xl">🧬</div>
          <div className="flex-1"><h3 className="font-bold text-lg">اختبار نسبة الذكاء IQ</h3><p className="text-indigo-200 text-sm">20 سؤالاً بأنواع متعددة حسب عمرك</p></div>
          <Link href="/iq-test" className="bg-white text-violet-800 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-violet-50 flex-shrink-0">ابدأ الاختبار →</Link>
        </div>
      </div>

      {/* الألعاب المضافة */}
      {games.length>0&&(
        <div>
          <h2 className="font-bold text-gray-700 mb-3">🔗 ألعاب مضافة</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {games.map(g=>(
              <div key={g.id} className="card p-4 hover:shadow-lg transition-all">
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-3xl flex-shrink-0">{g.emoji}</span>
                  <div className="flex-1"><h3 className="font-bold text-gray-800">{g.title}</h3>{g.description&&<p className="text-xs text-gray-500 mt-0.5">{g.description}</p>}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${DIFF_COLOR[g.difficulty]}`}>{g.difficulty}</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">{g.category}</span>
                  </div>
                  <div className="flex gap-2">
                    {admin&&<button onClick={()=>deleteGame(g.id)} className="p-1.5 text-red-300 hover:text-red-500 rounded-lg"><Trash2 className="w-3.5 h-3.5"/></button>}
                    <a href={g.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-purple-700 text-white px-3 py-2 rounded-xl text-sm font-bold hover:bg-purple-600"><ExternalLink className="w-3.5 h-3.5"/>العب</a>
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

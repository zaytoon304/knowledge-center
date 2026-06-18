"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Gamepad2, Plus, Trash2, ExternalLink, Star, Trophy, RotateCcw, Timer, Brain } from "lucide-react";
import Link from "next/link";

/* ====================== أنواع ====================== */
interface GameCard {
  id: string; title: string; description: string; emoji: string;
  url: string; difficulty: "سهل" | "متوسط" | "صعب"; category: string;
}

function loadGames(): GameCard[] {
  try { const d = localStorage.getItem("kc_play_games"); return d ? JSON.parse(d) : []; } catch { return []; }
}
function saveGames(g: GameCard[]) { localStorage.setItem("kc_play_games", JSON.stringify(g)); }
function isAdmin() { try { return typeof window !== "undefined" && localStorage.getItem("kc_admin_auth") === "1"; } catch { return false; } }

/* ====================== لعبة المطابقة ====================== */
const EMOJIS = ["🚀","🌟","🎯","🤖","💡","🔬","🎮","🏆","🌍","🐬","🦁","🌺"];
function buildCards() {
  const pairs = [...EMOJIS].sort(() => Math.random() - 0.5).slice(0, 8);
  return [...pairs, ...pairs].sort(() => Math.random() - 0.5)
    .map((e, i) => ({ id: i, emoji: e, flipped: false, matched: false }));
}

function MemoryGame() {
  const [cards, setCards] = useState(buildCards());
  const [picks, setPicks] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [done, setDone] = useState(false);
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running || done) return;
    const t = setInterval(() => setTime(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [running, done]);

  const flip = (id: number) => {
    if (picks.length >= 2) return;
    const c = cards[id];
    if (c.flipped || c.matched) return;
    if (!running) setRunning(true);
    const newCards = cards.map((x, i) => i === id ? { ...x, flipped: true } : x);
    setCards(newCards);
    const newPicks = [...picks, id];
    if (newPicks.length === 2) {
      setMoves(m => m + 1);
      const [a, b] = newPicks;
      if (newCards[a].emoji === newCards[b].emoji) {
        const matched = newCards.map((x, i) => [a, b].includes(i) ? { ...x, matched: true } : x);
        setCards(matched);
        const newMatches = matches + 1;
        setMatches(newMatches);
        if (newMatches === 8) setDone(true);
        setPicks([]);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map((x, i) => newPicks.includes(i) ? { ...x, flipped: false } : x));
          setPicks([]);
        }, 700);
      }
      setPicks(newPicks);
    } else {
      setPicks(newPicks);
    }
  };

  const reset = () => { setCards(buildCards()); setPicks([]); setMoves(0); setMatches(0); setDone(false); setTime(0); setRunning(false); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-3">
          <span className="bg-violet-50 text-violet-700 px-3 py-1.5 rounded-xl text-sm font-bold">👁️ {moves} حركة</span>
          <span className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-xl text-sm font-bold">✅ {matches}/8</span>
          <span className="bg-amber-50 text-amber-700 px-3 py-1.5 rounded-xl text-sm font-bold">⏱️ {Math.floor(time/60)}:{(time%60).toString().padStart(2,"0")}</span>
        </div>
        <button onClick={reset} className="flex items-center gap-1.5 bg-gray-100 text-gray-600 px-3 py-1.5 rounded-xl text-sm hover:bg-gray-200">
          <RotateCcw className="w-3.5 h-3.5" /> إعادة
        </button>
      </div>

      {done && (
        <div className="bg-gradient-to-l from-violet-700 to-indigo-600 text-white rounded-2xl p-5 text-center">
          <div className="text-5xl mb-2">🏆</div>
          <p className="text-xl font-black">أحسنت! فزت!</p>
          <p className="text-indigo-200 text-sm">{moves} حركة في {time} ثانية</p>
          <button onClick={reset} className="mt-3 bg-white text-violet-700 px-6 py-2 rounded-xl font-bold text-sm hover:bg-violet-50">
            العب مجدداً
          </button>
        </div>
      )}

      <div className="grid grid-cols-4 gap-2">
        {cards.map((c, i) => (
          <button key={c.id} onClick={() => flip(i)}
            className={`aspect-square rounded-2xl text-3xl transition-all duration-200 flex items-center justify-center font-bold border-2 ${
              c.matched ? "bg-green-50 border-green-300 scale-95 opacity-60" :
              c.flipped ? "bg-violet-50 border-violet-400 scale-105 shadow-md" :
              "bg-gray-100 border-gray-200 hover:bg-gray-200 hover:scale-105 text-transparent"
            }`}>
            {(c.flipped || c.matched) ? c.emoji : "?"}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ====================== لعبة الرياضيات ====================== */
function MathGame() {
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [q, setQ] = useState<{text:string;ans:number}>({text:"",ans:0});
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<"correct"|"wrong"|null>(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [started, setStarted] = useState(false);
  const [over, setOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const genQ = useCallback(() => {
    const ops = ["+","-","×"];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a = Math.floor(Math.random() * (score < 10 ? 10 : 20)) + 1;
    let b = Math.floor(Math.random() * (score < 10 ? 10 : 15)) + 1;
    if (op === "-" && b > a) [a, b] = [b, a];
    const ans = op === "+" ? a + b : op === "-" ? a - b : a * b;
    setQ({ text: `${a} ${op} ${b} = ?`, ans });
    setTimeLeft(15);
    setInput("");
    setFeedback(null);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [score]);

  useEffect(() => {
    if (!started || over) return;
    genQ();
  }, [started]);

  useEffect(() => {
    if (!started || over || feedback) return;
    if (timeLeft <= 0) { wrongAnswer(); return; }
    const t = setTimeout(() => setTimeLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, started, over, feedback]);

  const wrongAnswer = () => {
    setFeedback("wrong");
    const newLives = lives - 1;
    setLives(newLives);
    if (newLives <= 0) { setOver(true); return; }
    setTimeout(genQ, 1000);
  };

  const checkAnswer = () => {
    if (parseInt(input) === q.ans) {
      setFeedback("correct");
      setScore(s => s + 1);
      setTimeout(genQ, 600);
    } else {
      wrongAnswer();
    }
  };

  const reset = () => { setScore(0); setLives(3); setFeedback(null); setOver(false); setStarted(false); setInput(""); };

  if (!started) return (
    <div className="text-center py-8">
      <div className="text-6xl mb-4">🧮</div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">تحدي الرياضيات</h3>
      <p className="text-gray-500 text-sm mb-6">أجب على أكبر عدد ممكن من العمليات الحسابية قبل انتهاء أرواحك!</p>
      <button onClick={() => setStarted(true)} className="bg-blue-700 text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-600">
        ابدأ الآن!
      </button>
    </div>
  );

  if (over) return (
    <div className="text-center py-8">
      <div className="text-6xl mb-3">🎯</div>
      <p className="text-2xl font-black text-gray-800">انتهت اللعبة!</p>
      <p className="text-gray-500 mb-1">نتيجتك النهائية</p>
      <p className="text-5xl font-black text-blue-700 mb-6">{score}</p>
      <button onClick={reset} className="bg-blue-700 text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-600">
        العب مجدداً
      </button>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => (
            <span key={i} className={`text-2xl transition-all ${i < lives ? "opacity-100" : "opacity-20"}`}>❤️</span>
          ))}
        </div>
        <span className="bg-blue-50 text-blue-700 px-4 py-1.5 rounded-xl font-bold">نقاط: {score}</span>
      </div>

      <div className={`h-2 rounded-full bg-gray-100 overflow-hidden`}>
        <div className={`h-full rounded-full transition-all duration-1000 ${timeLeft <= 5 ? "bg-red-500" : "bg-green-500"}`}
          style={{ width: `${(timeLeft / 15) * 100}%` }} />
      </div>

      <div className={`text-center py-6 rounded-2xl ${
        feedback === "correct" ? "bg-green-50" :
        feedback === "wrong" ? "bg-red-50" : "bg-violet-50"
      }`}>
        <p className="text-4xl font-black text-gray-800">{q.text}</p>
        {feedback === "correct" && <p className="text-green-600 font-bold mt-2">✅ صحيح!</p>}
        {feedback === "wrong" && <p className="text-red-600 font-bold mt-2">❌ خطأ! الإجابة: {q.ans}</p>}
      </div>

      <div className="flex gap-2">
        <input ref={inputRef} type="number" value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && input && checkAnswer()}
          placeholder="الإجابة..."
          className="flex-1 text-center text-2xl font-bold border-2 border-gray-200 rounded-2xl py-4 outline-none focus:border-blue-500 bg-gray-50" />
        <button onClick={checkAnswer} disabled={!input}
          className="bg-blue-700 text-white px-8 rounded-2xl font-bold text-xl hover:bg-blue-600 disabled:opacity-40">
          ✓
        </button>
      </div>
    </div>
  );
}

/* ====================== المكوّن الرئيسي ====================== */
type ActiveGame = "none" | "memory" | "math";

export default function PlayPage() {
  const [admin] = useState(isAdmin);
  const [games, setGames] = useState<GameCard[]>([]);
  const [activeGame, setActiveGame] = useState<ActiveGame>("none");
  const [showAdd, setShowAdd] = useState(false);
  const [newGame, setNewGame] = useState<Omit<GameCard,"id">>({
    title: "", description: "", emoji: "🎮", url: "", difficulty: "متوسط", category: "تعليمية",
  });

  useEffect(() => { setGames(loadGames()); }, []);

  const addGame = () => {
    if (!newGame.title.trim() || !newGame.url.trim()) return;
    const g: GameCard = { ...newGame, id: Date.now().toString() };
    const updated = [g, ...games];
    saveGames(updated);
    setGames(updated);
    setShowAdd(false);
    setNewGame({ title: "", description: "", emoji: "🎮", url: "", difficulty: "متوسط", category: "تعليمية" });
  };

  const deleteGame = (id: string) => {
    const updated = games.filter(g => g.id !== id);
    saveGames(updated);
    setGames(updated);
  };

  const DIFF_COLOR = {
    "سهل": "bg-green-100 text-green-700",
    "متوسط": "bg-amber-100 text-amber-700",
    "صعب": "bg-red-100 text-red-700",
  };

  if (activeGame !== "none") return (
    <div className="max-w-lg mx-auto space-y-4 animate-fade-in">
      <button onClick={() => setActiveGame("none")}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm">
        ← العودة للألعاب
      </button>
      <div className="card p-6">
        <h2 className="font-bold text-gray-800 text-lg mb-5 flex items-center gap-2">
          {activeGame === "memory" ? "🧠 بطاقات الذاكرة" : "🧮 تحدي الرياضيات"}
        </h2>
        {activeGame === "memory" ? <MemoryGame /> : <MathGame />}
      </div>
    </div>
  );

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="card p-6 bg-gradient-to-l from-purple-800 to-indigo-700 text-white">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">نلعب ونتعلم</h1>
              <p className="text-indigo-200 text-sm">ألعاب تعليمية تفاعلية ممتعة</p>
            </div>
          </div>
          {admin && (
            <button onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 bg-white text-purple-800 px-4 py-2 rounded-xl text-sm font-bold hover:bg-purple-50 flex-shrink-0">
              <Plus className="w-4 h-4" /> أضف لعبة
            </button>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4">
          {[{n:"2",l:"ألعاب مدمجة",e:"🎮"},{n:games.length,l:"ألعاب مضافة",e:"🔗"},{n:"∞",l:"متعة لا تنتهي",e:"⭐"}].map(s=>(
            <div key={s.l} className="bg-white/10 rounded-xl p-2 text-center">
              <div className="text-lg">{s.e}</div>
              <div className="text-lg font-bold">{s.n}</div>
              <div className="text-indigo-200 text-[10px]">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* إضافة لعبة */}
      {showAdd && admin && (
        <div className="card p-6 space-y-4 border-2 border-purple-100">
          <h3 className="font-bold text-gray-800 flex items-center gap-2"><Plus className="w-4 h-4 text-purple-600" /> إضافة لعبة جديدة</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">رمز اللعبة</label>
              <input value={newGame.emoji} onChange={e => setNewGame(p=>({...p,emoji:e.target.value}))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-2xl text-center bg-gray-50 outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">اسم اللعبة *</label>
              <input value={newGame.title} onChange={e => setNewGame(p=>({...p,title:e.target.value}))}
                placeholder="مثال: لعبة الذاكرة"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-purple-500" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-gray-500 mb-1 block">رابط اللعبة *</label>
              <input value={newGame.url} onChange={e => setNewGame(p=>({...p,url:e.target.value}))}
                placeholder="https://..."
                dir="ltr"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none font-mono" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">الصعوبة</label>
              <select value={newGame.difficulty} onChange={e => setNewGame(p=>({...p,difficulty:e.target.value as GameCard["difficulty"]}))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none">
                <option>سهل</option><option>متوسط</option><option>صعب</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">التصنيف</label>
              <select value={newGame.category} onChange={e => setNewGame(p=>({...p,category:e.target.value}))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none">
                {["تعليمية","رياضيات","علوم","لغة عربية","ترميز","ذاكرة","منطق"].map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-gray-500 mb-1 block">وصف قصير</label>
              <input value={newGame.description} onChange={e => setNewGame(p=>({...p,description:e.target.value}))}
                placeholder="وصف اللعبة..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={addGame} className="bg-purple-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-purple-600">✅ إضافة</button>
            <button onClick={() => setShowAdd(false)} className="bg-gray-100 text-gray-600 px-6 py-2.5 rounded-xl text-sm hover:bg-gray-200">إلغاء</button>
          </div>
        </div>
      )}

      {/* الألعاب المدمجة */}
      <div>
        <h2 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
          <Gamepad2 className="w-4 h-4 text-purple-600" /> الألعاب المدمجة
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            {
              id: "memory", emoji: "🧠", title: "بطاقات الذاكرة",
              desc: "طابق البطاقات المتشابهة في أقل عدد من الحركات",
              diff: "سهل", cat: "ذاكرة",
            },
            {
              id: "math", emoji: "🧮", title: "تحدي الرياضيات",
              desc: "أجب على العمليات الحسابية بأسرع ما يمكن قبل انتهاء الوقت!",
              diff: "متوسط", cat: "رياضيات",
            },
          ].map(g => (
            <div key={g.id} className="card overflow-hidden group hover:shadow-lg transition-all">
              <div className="bg-gradient-to-l from-purple-700 to-indigo-600 p-5 text-white">
                <div className="text-4xl mb-2">{g.emoji}</div>
                <h3 className="font-bold text-lg group-hover:text-yellow-300 transition-colors">{g.title}</h3>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-500 mb-3">{g.desc}</p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${DIFF_COLOR[g.diff as keyof typeof DIFF_COLOR]}`}>{g.diff}</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">{g.cat}</span>
                  </div>
                  <button onClick={() => setActiveGame(g.id as ActiveGame)}
                    className="bg-purple-700 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-purple-600 transition">
                    ▶ العب الآن
                  </button>
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
          <div className="flex-1">
            <h3 className="font-bold text-lg">اختبار نسبة الذكاء IQ</h3>
            <p className="text-indigo-200 text-sm">20 سؤالاً مخصصاً حسب عمرك</p>
          </div>
          <Link href="/iq-test" className="bg-white text-violet-800 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-violet-50 flex-shrink-0">
            ابدأ الاختبار →
          </Link>
        </div>
      </div>

      {/* الألعاب المضافة */}
      {games.length > 0 && (
        <div>
          <h2 className="font-bold text-gray-700 mb-3">🔗 ألعاب مضافة</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {games.map(g => (
              <div key={g.id} className="card overflow-hidden group hover:shadow-lg transition-all">
                <div className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-3xl flex-shrink-0">{g.emoji}</span>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 group-hover:text-purple-700 transition-colors">{g.title}</h3>
                      {g.description && <p className="text-xs text-gray-500 mt-0.5">{g.description}</p>}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${DIFF_COLOR[g.difficulty]}`}>{g.difficulty}</span>
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">{g.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {admin && (
                        <button onClick={() => deleteGame(g.id)} className="p-1.5 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <a href={g.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 bg-purple-700 text-white px-3 py-2 rounded-xl text-sm font-bold hover:bg-purple-600">
                        <ExternalLink className="w-3.5 h-3.5" /> العب
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {games.length === 0 && !admin && (
        <div className="card p-8 text-center text-gray-400">
          <Gamepad2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="font-medium">لا توجد ألعاب مضافة بعد</p>
        </div>
      )}
    </div>
  );
}

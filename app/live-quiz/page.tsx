"use client";
import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Play, Eye, Trophy, Users, ArrowLeft, Lock, Gamepad2 } from "lucide-react";
import { useAiOwner } from "@/lib/aiHistory";
import {
  createSession, listenSession, listenPlayers, startQuestion, revealAnswer, showLeaderboard, endQuiz,
  sortedPlayers, type QuizQuestion, type QuizSession, type QuizPlayer,
} from "@/lib/liveQuiz";

const EMPTY_QUESTION: QuizQuestion = { text: "", options: ["", "", "", ""], correctIndex: 0, timeLimitSeconds: 20 };
const OPTION_COLORS = ["bg-red-500", "bg-blue-500", "bg-amber-500", "bg-emerald-500"];
const MEDALS = ["🥇", "🥈", "🥉"];

export default function LiveQuizHostPage() {
  const { ownerId, ownerLabel } = useAiOwner();
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<QuizQuestion[]>([{ ...EMPTY_QUESTION }]);
  const [creating, setCreating] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [session, setSession] = useState<QuizSession | null>(null);
  const [players, setPlayers] = useState<Record<string, QuizPlayer> | null>(null);
  const [remaining, setRemaining] = useState(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    const unsubS = listenSession(sessionId, setSession);
    const unsubP = listenPlayers(sessionId, setPlayers);
    return () => { unsubS(); unsubP(); };
  }, [sessionId]);

  useEffect(() => {
    if (tickRef.current) clearInterval(tickRef.current);
    if (session?.status === "question" && session.questionStartedAt) {
      const q = session.questions[session.currentIndex];
      const tick = () => {
        const elapsed = (Date.now() - new Date(session.questionStartedAt!).getTime()) / 1000;
        setRemaining(Math.max(0, Math.ceil(q.timeLimitSeconds - elapsed)));
      };
      tick();
      tickRef.current = setInterval(tick, 500);
    }
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [session?.status, session?.currentIndex, session?.questionStartedAt]);

  if (!ownerId) {
    return (
      <div className="max-w-md mx-auto mt-16 card p-8 text-center text-gray-400">
        <Lock className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="font-semibold text-gray-600">هذي الأداة للمعلمين/المنسقين والإدارة فقط</p>
        <p className="text-sm mt-1">سجّل دخولك أولاً كمنسّق أو أدمن</p>
      </div>
    );
  }

  const addQuestion = () => setQuestions(p => [...p, { ...EMPTY_QUESTION, options: [...EMPTY_QUESTION.options] }]);
  const removeQuestion = (i: number) => setQuestions(p => p.filter((_, idx) => idx !== i));
  const updateQuestion = (i: number, patch: Partial<QuizQuestion>) => setQuestions(p => p.map((q, idx) => idx === i ? { ...q, ...patch } : q));
  const updateOption = (qi: number, oi: number, value: string) => setQuestions(p => p.map((q, idx) => idx === qi ? { ...q, options: q.options.map((o, x) => x === oi ? value : o) } : q));

  const canStart = title.trim() && questions.length > 0 && questions.every(q => q.text.trim() && q.options.filter(o => o.trim()).length >= 2);

  const start = async () => {
    if (!canStart || creating) return;
    setCreating(true);
    const cleaned = questions.map(q => ({ ...q, options: q.options.filter(o => o.trim()) }));
    const id = await createSession(title.trim(), ownerLabel, cleaned);
    setSessionId(id);
    setCreating(false);
  };

  const answeredCount = (idx: number) => Object.values(players || {}).filter(p => p.lastAnsweredIndex >= idx).length;
  const totalPlayers = Object.keys(players || {}).length;
  const isLastQuestion = session ? session.currentIndex === session.questions.length - 1 : false;

  // --- شاشة الاستضافة (بعد إنشاء الجلسة) ---
  if (sessionId && session) {
    const q = session.currentIndex >= 0 ? session.questions[session.currentIndex] : null;
    return (
      <div className="max-w-3xl mx-auto space-y-5">
        <div className="card p-6 bg-gradient-to-l from-indigo-800 to-violet-700 text-white text-center">
          <p className="text-sm text-white/80">رمز الانضمام (PIN)</p>
          <p className="text-6xl font-black tracking-widest mt-1">{sessionId}</p>
          <p className="text-sm text-white/80 mt-2">الطلاب يفتحون <span className="font-bold">/live-quiz/play</span> ويكتبون هذا الرمز</p>
        </div>

        {session.status === "lobby" && (
          <div className="card p-6 space-y-4 text-center">
            <p className="font-bold text-gray-700 flex items-center justify-center gap-2"><Users className="w-5 h-5 text-violet-600" /> انضم {totalPlayers} طالب</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {Object.values(players || {}).map(p => (
                <span key={p.id} className="bg-violet-50 text-violet-700 px-3 py-1.5 rounded-full text-sm font-semibold">{p.name}</span>
              ))}
            </div>
            <button onClick={() => startQuestion(sessionId, 0)} disabled={totalPlayers === 0}
              className="flex items-center gap-2 bg-violet-600 text-white px-6 py-3 rounded-xl font-bold mx-auto hover:bg-violet-500 disabled:opacity-40">
              <Play className="w-5 h-5" /> ابدأ المسابقة
            </button>
          </div>
        )}

        {session.status === "question" && q && (
          <div className="card p-6 space-y-4 text-center">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>سؤال {session.currentIndex + 1} / {session.questions.length}</span>
              <span className="font-bold text-2xl text-violet-700">{remaining}</span>
              <span>أجاب {answeredCount(session.currentIndex)} / {totalPlayers}</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">{q.text}</h2>
            <div className="grid grid-cols-2 gap-3">
              {q.options.map((opt, i) => (
                <div key={i} className={`${OPTION_COLORS[i]} text-white rounded-2xl p-4 font-bold text-lg`}>{opt}</div>
              ))}
            </div>
            <button onClick={() => revealAnswer(sessionId)} className="flex items-center gap-2 bg-gray-800 text-white px-5 py-2.5 rounded-xl font-semibold mx-auto hover:bg-gray-700">
              <Eye className="w-4 h-4" /> كشف الإجابة
            </button>
          </div>
        )}

        {session.status === "reveal" && q && (
          <div className="card p-6 space-y-4 text-center">
            <h2 className="text-xl font-bold text-gray-800">{q.text}</h2>
            <div className="grid grid-cols-2 gap-3">
              {q.options.map((opt, i) => (
                <div key={i} className={`${i === q.correctIndex ? "bg-emerald-600 ring-4 ring-emerald-300" : OPTION_COLORS[i] + " opacity-40"} text-white rounded-2xl p-4 font-bold text-lg`}>
                  {opt} {i === q.correctIndex && "✓"}
                </div>
              ))}
            </div>
            <button onClick={() => showLeaderboard(sessionId)} className="flex items-center gap-2 bg-violet-600 text-white px-5 py-2.5 rounded-xl font-semibold mx-auto hover:bg-violet-500">
              <Trophy className="w-4 h-4" /> لوحة الصدارة
            </button>
          </div>
        )}

        {session.status === "leaderboard" && (
          <div className="card p-6 space-y-3">
            <h2 className="text-xl font-bold text-gray-800 text-center flex items-center justify-center gap-2"><Trophy className="w-5 h-5 text-amber-500" /> لوحة الصدارة</h2>
            {sortedPlayers(players).slice(0, 10).map((p, i) => (
              <div key={p.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2.5">
                <span className="font-bold text-gray-700">{MEDALS[i] || `${i + 1}.`} {p.name}</span>
                <span className="font-bold text-violet-700">{p.score}</span>
              </div>
            ))}
            {isLastQuestion ? (
              <button onClick={() => endQuiz(sessionId)} className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-500">إنهاء المسابقة</button>
            ) : (
              <button onClick={() => startQuestion(sessionId, session.currentIndex + 1)} className="w-full bg-violet-600 text-white py-3 rounded-xl font-bold hover:bg-violet-500">السؤال التالي</button>
            )}
          </div>
        )}

        {session.status === "ended" && (
          <div className="card p-8 space-y-4 text-center">
            <p className="text-4xl">🎉</p>
            <h2 className="text-2xl font-bold text-gray-800">انتهت المسابقة!</h2>
            {sortedPlayers(players).slice(0, 3).map((p, i) => (
              <div key={p.id} className="flex items-center justify-center gap-2 text-lg">
                <span>{MEDALS[i]}</span><span className="font-bold">{p.name}</span><span className="text-violet-700 font-bold">{p.score}</span>
              </div>
            ))}
            <button onClick={() => { setSessionId(null); setSession(null); setPlayers(null); }} className="flex items-center gap-2 bg-gray-800 text-white px-5 py-2.5 rounded-xl font-semibold mx-auto hover:bg-gray-700">
              <ArrowLeft className="w-4 h-4" /> مسابقة جديدة
            </button>
          </div>
        )}
      </div>
    );
  }

  // --- شاشة إنشاء المسابقة ---
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="card p-5 bg-gradient-to-l from-indigo-800 to-violet-700 text-white">
        <h1 className="text-xl font-bold flex items-center gap-2"><Gamepad2 className="w-6 h-6" /> مسابقة صفية حية</h1>
        <p className="text-white/80 text-sm mt-1">اعرض الشاشة على البروجكتر، الطلاب يجاوبون من جوالاتهم لحظياً.</p>
      </div>

      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="اسم المسابقة"
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold" />

      {questions.map((q, qi) => (
        <div key={qi} className="card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-gray-500">سؤال {qi + 1}</p>
            {questions.length > 1 && <button onClick={() => removeQuestion(qi)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>}
          </div>
          <input value={q.text} onChange={e => updateQuestion(qi, { text: e.target.value })} placeholder="نص السؤال"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          <div className="grid grid-cols-2 gap-2">
            {q.options.map((opt, oi) => (
              <div key={oi} className="flex items-center gap-1.5">
                <button onClick={() => updateQuestion(qi, { correctIndex: oi })}
                  className={`w-6 h-6 rounded-full flex-shrink-0 ${OPTION_COLORS[oi]} ${q.correctIndex === oi ? "ring-2 ring-offset-1 ring-gray-800" : "opacity-40"}`} title="اختر كإجابة صحيحة" />
                <input value={opt} onChange={e => updateOption(qi, oi, e.target.value)} placeholder={`خيار ${oi + 1}`}
                  className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-xs" />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">مدة الإجابة (ثانية):</label>
            <input type="number" min={5} max={60} value={q.timeLimitSeconds} onChange={e => updateQuestion(qi, { timeLimitSeconds: Number(e.target.value) })}
              className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-xs" />
          </div>
        </div>
      ))}

      <button onClick={addQuestion} className="flex items-center gap-1.5 text-violet-600 font-semibold text-sm hover:text-violet-700">
        <Plus className="w-4 h-4" /> إضافة سؤال
      </button>

      <button disabled={!canStart || creating} onClick={start}
        className="w-full bg-violet-600 text-white py-3.5 rounded-xl font-bold hover:bg-violet-500 disabled:opacity-40">
        {creating ? "جارٍ الإنشاء..." : "🚀 ابدأ المسابقة الحية"}
      </button>
    </div>
  );
}

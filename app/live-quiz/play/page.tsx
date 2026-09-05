"use client";
import { useState, useEffect } from "react";
import { LogIn, Clock, CheckCircle2, XCircle, Trophy } from "lucide-react";
import {
  getSession, joinSession, listenSession, listenPlayers, submitAnswer, sortedPlayers,
  type QuizSession, type QuizPlayer,
} from "@/lib/liveQuiz";

const OPTION_COLORS = ["bg-red-500 active:bg-red-600", "bg-blue-500 active:bg-blue-600", "bg-amber-500 active:bg-amber-600", "bg-emerald-500 active:bg-emerald-600"];
const MEDALS = ["🥇", "🥈", "🥉"];

function getPlayerId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("kc_quiz_player_id");
  if (!id) { id = "p" + Date.now().toString() + Math.random().toString(36).slice(2, 6); localStorage.setItem("kc_quiz_player_id", id); }
  return id;
}

export default function LiveQuizPlayPage() {
  const [pin, setPin] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [joining, setJoining] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [session, setSession] = useState<QuizSession | null>(null);
  const [players, setPlayers] = useState<Record<string, QuizPlayer> | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const playerId = getPlayerId();

  useEffect(() => {
    if (!sessionId) return;
    const unsubS = listenSession(sessionId, setSession);
    const unsubP = listenPlayers(sessionId, setPlayers);
    return () => { unsubS(); unsubP(); };
  }, [sessionId]);

  useEffect(() => { setSelected(null); }, [session?.currentIndex]);

  const join = async () => {
    if (!pin.trim() || !name.trim() || joining) return;
    setJoining(true);
    setError("");
    const s = await getSession(pin.trim());
    if (!s) { setError("الرمز غير صحيح — تأكد من المعلم"); setJoining(false); return; }
    await joinSession(pin.trim(), playerId, name.trim());
    setSessionId(pin.trim());
    setJoining(false);
  };

  const answer = async (idx: number) => {
    if (!session || selected !== null || session.currentIndex < 0) return;
    setSelected(idx);
    const q = session.questions[session.currentIndex];
    await submitAnswer(sessionId!, playerId, session.currentIndex, idx, q, session.questionStartedAt!);
  };

  const me = players?.[playerId];
  const myRank = sortedPlayers(players).findIndex(p => p.id === playerId);

  if (!sessionId || !session) {
    return (
      <div className="max-w-sm mx-auto mt-10 card p-6 space-y-4">
        <h1 className="text-xl font-bold text-gray-800 text-center">🎮 انضم للمسابقة</h1>
        <input value={pin} onChange={e => setPin(e.target.value)} onKeyDown={e => e.key === "Enter" && join()}
          placeholder="رمز الانضمام (PIN)" inputMode="numeric" maxLength={6}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-center text-2xl tracking-widest font-bold" />
        <input value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === "Enter" && join()}
          placeholder="اسمك" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-center" />
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <button disabled={!pin.trim() || !name.trim() || joining} onClick={join}
          className="w-full flex items-center justify-center gap-2 bg-violet-600 text-white py-3 rounded-xl font-bold hover:bg-violet-500 disabled:opacity-40">
          <LogIn className="w-4 h-4" /> {joining ? "جارٍ الانضمام..." : "انضم"}
        </button>
      </div>
    );
  }

  const q = session.currentIndex >= 0 ? session.questions[session.currentIndex] : null;

  return (
    <div className="max-w-sm mx-auto mt-6 space-y-4">
      {session.status === "lobby" && (
        <div className="card p-8 text-center space-y-2">
          <p className="text-lg font-bold text-gray-700">أهلاً {name} 👋</p>
          <p className="text-sm text-gray-400">بانتظار المعلم يبدأ المسابقة...</p>
        </div>
      )}

      {session.status === "question" && q && (
        selected === null ? (
          <div className="space-y-3">
            <p className="text-center font-bold text-gray-800">{q.text}</p>
            <div className="grid grid-cols-2 gap-3">
              {q.options.map((opt, i) => (
                <button key={i} onClick={() => answer(i)} className={`${OPTION_COLORS[i]} text-white rounded-2xl p-5 font-bold text-sm min-h-[80px]`}>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="card p-8 text-center space-y-2">
            <Clock className="w-10 h-10 mx-auto text-violet-400" />
            <p className="font-bold text-gray-700">تم إرسال إجابتك ✓</p>
            <p className="text-sm text-gray-400">بانتظار بقية الطلاب...</p>
          </div>
        )
      )}

      {session.status === "reveal" && q && me && (
        <div className="card p-8 text-center space-y-2">
          {me.lastAnsweredIndex === session.currentIndex ? (
            <>
              <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500" />
              <p className="font-bold text-gray-700">إجابتك وصلت! تحقق من الشاشة الكبيرة</p>
            </>
          ) : (
            <>
              <XCircle className="w-12 h-12 mx-auto text-red-400" />
              <p className="font-bold text-gray-700">ما جاوبت هالسؤال</p>
            </>
          )}
          <p className="text-2xl font-bold text-violet-700 mt-2">مجموعك: {me.score}</p>
        </div>
      )}

      {session.status === "leaderboard" && (
        <div className="card p-6 space-y-2 text-center">
          <Trophy className="w-8 h-8 mx-auto text-amber-500" />
          <p className="font-bold text-gray-700">ترتيبك: {myRank + 1}</p>
          <p className="text-2xl font-bold text-violet-700">{me?.score ?? 0} نقطة</p>
        </div>
      )}

      {session.status === "ended" && (
        <div className="card p-8 text-center space-y-3">
          <p className="text-4xl">🎉</p>
          <p className="font-bold text-gray-800 text-lg">انتهت المسابقة!</p>
          <p className="font-bold text-violet-700">ترتيبك النهائي: {myRank + 1} {MEDALS[myRank] || ""}</p>
          <p className="text-2xl font-bold text-gray-800">{me?.score ?? 0} نقطة</p>
        </div>
      )}
    </div>
  );
}

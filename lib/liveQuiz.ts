"use client";
import { cloudGet, cloudSet, cloudListen, cloudTransact } from "./cloud";

// مسابقة صفية حية (نمط Kahoot): المعلم يعرض شاشة كبيرة بالفصل، الطلاب يجاوبون من جوالاتهم
// برمز PIN، النقاط تُحسب لحظياً حسب صحة الإجابة وسرعتها — كل هذا بالسحابة (Firebase) نفس
// آلية التزامن المستخدمة بمساحة الحديث الجماعية والمزاد.

export interface QuizQuestion {
  text: string;
  options: string[]; // 2-4 خيارات
  correctIndex: number;
  timeLimitSeconds: number;
}

export type QuizStatus = "lobby" | "question" | "reveal" | "leaderboard" | "ended";

export interface QuizSession {
  id: string; // نفس رمز PIN المعروض للطلاب
  title: string;
  hostName: string;
  questions: QuizQuestion[];
  status: QuizStatus;
  currentIndex: number;
  questionStartedAt: string | null;
  createdAt: string;
}

export interface QuizPlayer {
  id: string;
  name: string;
  score: number;
  joinedAt: string;
  lastAnsweredIndex: number; // -1 يعني ما جاوب أي سؤال بعد — يمنع إجابة مزدوجة على نفس السؤال
}

const sessionKey = (id: string) => `kc_live_quiz/${id}`;
const playersKey = (id: string) => `kc_live_quiz_players/${id}`;

export function genPin(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function createSession(title: string, hostName: string, questions: QuizQuestion[]): Promise<string> {
  const id = genPin();
  const session: QuizSession = {
    id, title, hostName, questions,
    status: "lobby", currentIndex: -1, questionStartedAt: null,
    createdAt: new Date().toISOString(),
  };
  await cloudSet(sessionKey(id), session);
  return id;
}

export async function getSession(id: string): Promise<QuizSession | null> {
  return cloudGet<QuizSession>(sessionKey(id));
}

export function listenSession(id: string, cb: (s: QuizSession | null) => void): () => void {
  return cloudListen<QuizSession>(sessionKey(id), cb);
}

export function listenPlayers(id: string, cb: (p: Record<string, QuizPlayer> | null) => void): () => void {
  return cloudListen<Record<string, QuizPlayer>>(playersKey(id), cb);
}

export async function joinSession(id: string, playerId: string, name: string): Promise<void> {
  const player: QuizPlayer = { id: playerId, name: name.trim(), score: 0, joinedAt: new Date().toISOString(), lastAnsweredIndex: -1 };
  await cloudSet(`${playersKey(id)}/${playerId}`, player);
}

export async function startQuestion(sessionId: string, index: number): Promise<void> {
  // current ما لازم يكون فاضي أبداً هنا (الجلسة أصلاً موجودة قبل ما المعلم يبدأ سؤال) — لو صار
  // (تعطّل مؤقت بالقراءة مثلاً)، نُلغي المعاملة بأمان (undefined) بدل ما نكتب null فوق الجلسة
  // الحقيقية ونمسحها بالغلط.
  await cloudTransact<QuizSession>(sessionKey(sessionId), current =>
    current ? { ...current, status: "question", currentIndex: index, questionStartedAt: new Date().toISOString() } : undefined
  );
}

export async function revealAnswer(sessionId: string): Promise<void> {
  await cloudTransact<QuizSession>(sessionKey(sessionId), current => current ? { ...current, status: "reveal" } : undefined);
}

export async function showLeaderboard(sessionId: string): Promise<void> {
  await cloudTransact<QuizSession>(sessionKey(sessionId), current => current ? { ...current, status: "leaderboard" } : undefined);
}

export async function endQuiz(sessionId: string): Promise<void> {
  await cloudTransact<QuizSession>(sessionKey(sessionId), current => current ? { ...current, status: "ended" } : undefined);
}

// النقاط: 500 ثابتة لأي إجابة صحيحة + حتى 500 إضافية حسب سرعة الإجابة (أسرع = أعلى)، صفر للخطأ.
// معاملة (transaction) حقيقية على سجل اللاعب نفسه تمنع إرسال إجابتين لنفس السؤال بالغلط.
export async function submitAnswer(
  sessionId: string, playerId: string, questionIndex: number, selectedIndex: number,
  question: QuizQuestion, questionStartedAt: string
): Promise<void> {
  const correct = selectedIndex === question.correctIndex;
  const elapsedMs = Date.now() - new Date(questionStartedAt).getTime();
  const timeLimitMs = question.timeLimitSeconds * 1000;
  const speedRatio = Math.max(0, Math.min(1, 1 - elapsedMs / timeLimitMs));
  const points = correct ? Math.round(500 + 500 * speedRatio) : 0;
  await cloudTransact<QuizPlayer>(`${playersKey(sessionId)}/${playerId}`, current => {
    // لو اللاعب مو موجود أصلاً أو جاوب هالسؤال من قبل، نُلغي المعاملة (undefined) — إرجاع current
    // نفسه هنا كان يكتب null فوق نقاط اللاعب الحقيقية لو current صار null بالغلط لحظياً (تعطّل
    // مؤقت بالقراءة)، وهذا يمسح تقدّمه فعلياً وسط مسابقة حية.
    if (!current || current.lastAnsweredIndex >= questionIndex) return undefined;
    return { ...current, score: current.score + points, lastAnsweredIndex: questionIndex };
  });
}

export function sortedPlayers(players: Record<string, QuizPlayer> | null): QuizPlayer[] {
  if (!players) return [];
  return Object.values(players).sort((a, b) => b.score - a.score);
}

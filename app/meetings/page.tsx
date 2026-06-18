"use client";
import { useState, useEffect } from "react";
import {
  Video, Plus, Trash2, ChevronRight, ChevronLeft,
  CheckCircle, FileText, Users,
  Calendar, MapPin, Clock,
  Printer, UserCheck, AlertCircle
} from "lucide-react";

/* =================== أنواع البيانات =================== */
interface AgendaItem {
  id: string; title: string; description: string;
  notes: string[]; decision: string;
  voteFor: number; voteAgainst: number; voteAbstain: number;
  status: "pending" | "discussed" | "voted" | "decided";
}

interface DiscussionEntry {
  id: string; coordinatorName: string; content: string; at: string;
  agendaId: string;
}

interface Meeting {
  id: string; title: string; date: string; time: string;
  location: string; meetingLink: string; type: "offline" | "online";
  description: string; status: "upcoming" | "active" | "completed";
  participants: string[];
  agenda: AgendaItem[];
  discussions: DiscussionEntry[];
  minutes: string;
  createdAt: string;
}

type Stage = "overview" | "agenda" | "discussion" | "voting" | "minutes";

/* =================== localStorage =================== */
function loadMeetings(): Meeting[] {
  try { const d = localStorage.getItem("kc_meetings"); return d ? JSON.parse(d) : []; } catch { return []; }
}
function saveMeetings(ms: Meeting[]) { localStorage.setItem("kc_meetings", JSON.stringify(ms)); }

function loadCoordinators(): string[] {
  try {
    const d = localStorage.getItem("kc_coordinators");
    if (!d) return [];
    const coords = JSON.parse(d);
    return coords.filter((c: { status: string }) => c.status === "approved").map((c: { name: string }) => c.name);
  } catch { return []; }
}

function isAdmin() {
  try { return typeof window !== "undefined" && localStorage.getItem("kc_admin_auth") === "1"; } catch { return false; }
}

/* =================== ثوابت =================== */
const STATUS_META = {
  upcoming: { label: "قادم", color: "bg-amber-100 text-amber-700", dot: "bg-amber-400" },
  active: { label: "جارٍ الآن", color: "bg-green-100 text-green-700", dot: "bg-green-500 animate-pulse" },
  completed: { label: "منتهي", color: "bg-gray-100 text-gray-500", dot: "bg-gray-400" },
};

const STAGES: { id: Stage; label: string; emoji: string }[] = [
  { id: "overview", label: "نظرة عامة", emoji: "📋" },
  { id: "agenda", label: "المحاور", emoji: "📌" },
  { id: "discussion", label: "النقاش", emoji: "💬" },
  { id: "voting", label: "التصويت", emoji: "🗳️" },
  { id: "minutes", label: "المحضر", emoji: "📄" },
];

const EMPTY_AGENDA: AgendaItem = {
  id: "", title: "", description: "", notes: [], decision: "",
  voteFor: 0, voteAgainst: 0, voteAbstain: 0, status: "pending"
};

/* =================== المكوّن الرئيسي =================== */
export default function MeetingsPage() {
  const [admin] = useState(isAdmin);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [coordinators, setCoordinators] = useState<string[]>([]);
  const [selected, setSelected] = useState<Meeting | null>(null);
  const [stage, setStage] = useState<Stage>("overview");
  const [showCreate, setShowCreate] = useState(false);

  // فورم إنشاء اجتماع
  const [form, setForm] = useState({
    title: "", date: "", time: "", location: "", meetingLink: "",
    type: "offline" as "offline" | "online", description: "",
    participants: [] as string[], customParticipant: "",
    agenda: [] as { title: string; description: string }[],
  });
  const [agendaInput, setAgendaInput] = useState({ title: "", description: "" });

  // نقاش
  const [discussorName, setDiscussName] = useState("");
  const [discussInputs, setDiscussInputs] = useState<Record<string, string>>({});

  // محور جديد
  const [newAgendaTitle, setNewAgendaTitle] = useState("");

  useEffect(() => {
    setMeetings(loadMeetings());
    setCoordinators(loadCoordinators());
    const n = localStorage.getItem("kc_student_name") || "";
    if (n) setDiscussName(n);
  }, []);

  const updateMeeting = (m: Meeting) => {
    const updated = meetings.map(x => x.id === m.id ? m : x);
    saveMeetings(updated);
    setMeetings(updated);
    setSelected(m);
  };

  /* --- إنشاء اجتماع --- */
  const createMeeting = () => {
    if (!form.title.trim() || !form.date) return;
    const m: Meeting = {
      id: Date.now().toString(),
      title: form.title, date: form.date, time: form.time,
      location: form.location, meetingLink: form.meetingLink,
      type: form.type, description: form.description,
      participants: form.participants,
      status: "upcoming",
      agenda: form.agenda.map((a, i) => ({
        ...EMPTY_AGENDA, id: `${Date.now()}_${i}`, title: a.title, description: a.description
      })),
      discussions: [],
      minutes: "",
      createdAt: new Date().toISOString(),
    };
    saveMeetings([m, ...meetings]);
    setMeetings([m, ...meetings]);
    setShowCreate(false);
    setForm({ title: "", date: "", time: "", location: "", meetingLink: "", type: "offline", description: "", participants: [], customParticipant: "", agenda: [] });
  };

  /* --- محاور --- */
  const addAgenda = () => {
    if (!selected || !newAgendaTitle.trim()) return;
    const item: AgendaItem = { ...EMPTY_AGENDA, id: Date.now().toString(), title: newAgendaTitle };
    updateMeeting({ ...selected, agenda: [...selected.agenda, item] });
    setNewAgendaTitle("");
  };

  const deleteAgenda = (id: string) => {
    if (!selected) return;
    updateMeeting({ ...selected, agenda: selected.agenda.filter(a => a.id !== id) });
  };

  /* --- نقاش --- */
  const addDiscussion = (agendaId: string) => {
    if (!selected || !discussorName.trim() || !discussInputs[agendaId]?.trim()) return;
    const entry: DiscussionEntry = {
      id: Date.now().toString(),
      coordinatorName: discussorName,
      content: discussInputs[agendaId],
      agendaId,
      at: new Date().toLocaleTimeString("ar"),
    };
    const updated = { ...selected, discussions: [...selected.discussions, entry] };
    // تحديث حالة المحور
    updated.agenda = updated.agenda.map(a => a.id === agendaId ? { ...a, status: "discussed" as const } : a);
    updateMeeting(updated);
    setDiscussInputs(p => ({ ...p, [agendaId]: "" }));
    localStorage.setItem("kc_student_name", discussorName);
  };

  /* --- تصويت --- */
  const vote = (itemId: string, type: "for" | "against" | "abstain") => {
    if (!selected) return;
    updateMeeting({
      ...selected,
      agenda: selected.agenda.map(a => a.id === itemId ? {
        ...a,
        voteFor: type === "for" ? a.voteFor + 1 : a.voteFor,
        voteAgainst: type === "against" ? a.voteAgainst + 1 : a.voteAgainst,
        voteAbstain: type === "abstain" ? a.voteAbstain + 1 : a.voteAbstain,
        status: "voted" as const,
      } : a)
    });
  };

  const setDecision = (itemId: string, dec: string) => {
    if (!selected) return;
    updateMeeting({
      ...selected,
      agenda: selected.agenda.map(a => a.id === itemId ? { ...a, decision: dec, status: "decided" as const } : a)
    });
  };

  /* --- توليد المحضر --- */
  const generateMinutes = () => {
    if (!selected) return;
    const d = new Date(selected.date).toLocaleDateString("ar-SA", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    const lines = [
      "════════════════════════════════",
      `      محضر اجتماع رسمي`,
      "════════════════════════════════",
      "",
      `📋 عنوان الاجتماع: ${selected.title}`,
      `📅 التاريخ: ${d}`,
      selected.time ? `🕐 الوقت: ${selected.time}` : "",
      selected.location ? `📍 المكان: ${selected.location}` : "",
      selected.participants.length ? `👥 الحضور: ${selected.participants.join(" | ")}` : "",
      selected.description ? `\n📝 الوصف: ${selected.description}` : "",
      "",
      "────────────────────────────────",
      "📌 محاور الاجتماع والقرارات:",
      "────────────────────────────────",
      "",
      ...selected.agenda.map((a, i) => {
        const discForItem = selected.discussions.filter(d => d.agendaId === a.id);
        const total = a.voteFor + a.voteAgainst + a.voteAbstain;
        return [
          `${i + 1}. ${a.title}`,
          a.description ? `   التفاصيل: ${a.description}` : "",
          discForItem.length ? `   النقاش:` : "",
          ...discForItem.map(d => `     • ${d.coordinatorName}: ${d.content}`),
          total > 0 ? `   التصويت: مع (${a.voteFor}) | ضد (${a.voteAgainst}) | امتناع (${a.voteAbstain})` : "",
          a.decision ? `   ✅ القرار: ${a.decision}` : "   ⏳ القرار: لم يُحدد بعد",
          "",
        ].filter(Boolean).join("\n");
      }),
      "────────────────────────────────",
      `\nتاريخ الإصدار: ${new Date().toLocaleDateString("ar-SA")}`,
    ].filter(l => l !== "").join("\n");
    updateMeeting({ ...selected, minutes: lines, status: "completed" });
  };

  /* =================== واجهة تفاصيل الاجتماع =================== */
  if (selected) {
    const sm = STATUS_META[selected.status];
    const totalDecided = selected.agenda.filter(a => a.status === "decided").length;
    const totalVoted = selected.agenda.filter(a => a.voteFor + a.voteAgainst + a.voteAbstain > 0).length;
    const totalDiscussed = selected.discussions.length;

    return (
      <div className="space-y-4 animate-fade-in max-w-3xl mx-auto">
        {/* رأس الصفحة */}
        <div className="card p-5 bg-gradient-to-l from-violet-800 to-indigo-700 text-white">
          <div className="flex items-start gap-3">
            <button onClick={() => { setSelected(null); setStage("overview"); }}
              className="mt-0.5 text-white/70 hover:text-white flex-shrink-0">
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-lg leading-tight">{selected.title}</h2>
              <div className="flex flex-wrap gap-3 text-xs text-white/80 mt-1.5">
                {selected.date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{selected.date}</span>}
                {selected.time && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{selected.time}</span>}
                {selected.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{selected.location}</span>}
              </div>
            </div>
            {admin ? (
              <select value={selected.status} onChange={e => updateMeeting({ ...selected, status: e.target.value as Meeting["status"] })}
                className="text-xs px-3 py-1.5 rounded-xl font-medium bg-white/20 text-white border-0 outline-none flex-shrink-0">
                <option value="upcoming">⏳ قادم</option>
                <option value="active">🟢 جارٍ الآن</option>
                <option value="completed">✅ منتهي</option>
              </select>
            ) : (
              <span className={`text-xs px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5 ${sm.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${sm.dot}`} />{sm.label}
              </span>
            )}
          </div>

          {/* إحصائيات سريعة */}
          <div className="grid grid-cols-4 gap-2 mt-4">
            {[
              { n: selected.agenda.length, l: "محور", emoji: "📌" },
              { n: totalDiscussed, l: "مداخلة", emoji: "💬" },
              { n: totalVoted, l: "تصويت", emoji: "🗳️" },
              { n: totalDecided, l: "قرار", emoji: "✅" },
            ].map(s => (
              <div key={s.l} className="bg-white/10 rounded-xl p-2 text-center">
                <div className="text-lg">{s.emoji}</div>
                <div className="text-lg font-bold">{s.n}</div>
                <div className="text-white/70 text-[10px]">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* تبويبات المراحل */}
        <div className="card p-1.5 flex gap-1 overflow-x-auto">
          {STAGES.map(s => (
            <button key={s.id} onClick={() => setStage(s.id)}
              className={`flex-1 min-w-fit flex items-center justify-center gap-1 py-2.5 px-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${stage === s.id ? "bg-violet-700 text-white shadow" : "text-gray-500 hover:bg-gray-100"}`}>
              <span>{s.emoji}</span> {s.label}
            </button>
          ))}
        </div>

        {/* ===== نظرة عامة ===== */}
        {stage === "overview" && (
          <div className="space-y-4">
            {selected.description && (
              <div className="card p-5">
                <p className="text-xs font-semibold text-gray-500 mb-2">وصف الاجتماع</p>
                <p className="text-sm text-gray-700 leading-relaxed">{selected.description}</p>
              </div>
            )}

            {/* الحضور */}
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-violet-600" />
                <p className="font-bold text-gray-700 text-sm">المعنيون بالاجتماع ({selected.participants.length})</p>
              </div>
              {selected.participants.length === 0
                ? <p className="text-gray-400 text-xs text-center py-3">لم يُحدد الحضور</p>
                : <div className="flex flex-wrap gap-2">
                    {selected.participants.map(p => (
                      <span key={p} className="flex items-center gap-1.5 bg-violet-50 text-violet-700 border border-violet-100 px-3 py-1.5 rounded-full text-sm font-medium">
                        <UserCheck className="w-3.5 h-3.5" /> {p}
                      </span>
                    ))}
                  </div>
              }
              {selected.meetingLink && (
                <a href={selected.meetingLink} target="_blank" rel="noopener noreferrer"
                  className="mt-3 flex items-center gap-2 text-blue-600 text-sm hover:underline">
                  <Video className="w-4 h-4" /> رابط الاجتماع الإلكتروني
                </a>
              )}
            </div>

            {/* إجراءات الأدمن */}
            {admin && (
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setStage("agenda")}
                  className="card p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
                  <div className="text-3xl mb-2">📌</div>
                  <p className="font-bold text-gray-700 text-sm">المحاور</p>
                  <p className="text-xs text-gray-400">{selected.agenda.length} محور</p>
                </button>
                <button onClick={() => setStage("discussion")}
                  className="card p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
                  <div className="text-3xl mb-2">💬</div>
                  <p className="font-bold text-gray-700 text-sm">النقاش</p>
                  <p className="text-xs text-gray-400">{totalDiscussed} مداخلة</p>
                </button>
                <button onClick={() => setStage("voting")}
                  className="card p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
                  <div className="text-3xl mb-2">🗳️</div>
                  <p className="font-bold text-gray-700 text-sm">التصويت</p>
                  <p className="text-xs text-gray-400">{totalVoted} من {selected.agenda.length}</p>
                </button>
                <button onClick={() => setStage("minutes")}
                  className="card p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
                  <div className="text-3xl mb-2">📄</div>
                  <p className="font-bold text-gray-700 text-sm">المحضر</p>
                  <p className="text-xs text-gray-400">{selected.minutes ? "مكتوب" : "لم يُكتب"}</p>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ===== المحاور ===== */}
        {stage === "agenda" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">📌 محاور الاجتماع</h3>
              <span className="text-xs text-gray-400">{selected.agenda.length} محور</span>
            </div>

            {selected.agenda.length === 0 ? (
              <div className="card p-10 text-center text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="font-medium">لا توجد محاور بعد</p>
                {admin && <p className="text-sm mt-1">أضف أول محور أدناه</p>}
              </div>
            ) : (
              selected.agenda.map((item, i) => {
                const statusColors = {
                  decided: "border-green-400 bg-green-50/30",
                  voted: "border-blue-400 bg-blue-50/30",
                  discussed: "border-yellow-400 bg-yellow-50/30",
                  pending: "border-gray-200",
                };
                const statusLabels = { decided: "✅ مُقرَّر", voted: "🗳️ مُصوَّت", discussed: "💬 نوقش", pending: "⏳ قيد النقاش" };
                return (
                  <div key={item.id} className={`card p-4 border-r-4 ${statusColors[item.status]}`}>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center font-bold flex-shrink-0 text-sm">{i + 1}</div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-800">{item.title}</p>
                        {item.description && <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>}
                        {item.decision && (
                          <div className="mt-2 bg-green-50 border border-green-100 rounded-xl p-2.5 text-sm text-green-800">
                            ✅ <strong>القرار:</strong> {item.decision}
                          </div>
                        )}
                        {item.voteFor + item.voteAgainst + item.voteAbstain > 0 && (
                          <div className="mt-2 flex gap-3 text-xs">
                            <span className="text-green-600">👍 {item.voteFor}</span>
                            <span className="text-red-500">👎 {item.voteAgainst}</span>
                            <span className="text-gray-400">➖ {item.voteAbstain}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-400">{statusLabels[item.status]}</span>
                        {admin && (
                          <button onClick={() => deleteAgenda(item.id)} className="p-1 text-red-300 hover:text-red-500 ml-1">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {admin && (
              <div className="card p-4 flex gap-2">
                <input value={newAgendaTitle} onChange={e => setNewAgendaTitle(e.target.value)}
                  placeholder="أضف محوراً جديداً... (مثال: مناقشة نتائج WRO)"
                  onKeyDown={e => e.key === "Enter" && addAgenda()}
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-violet-500" />
                <button onClick={addAgenda} className="bg-violet-700 text-white px-4 py-2 rounded-xl text-sm flex items-center gap-1 hover:bg-violet-600">
                  <Plus className="w-4 h-4" /> إضافة
                </button>
              </div>
            )}

            <div className="flex justify-end">
              <button onClick={() => setStage("discussion")}
                className="flex items-center gap-2 bg-violet-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-violet-600">
                التالي: النقاش <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ===== النقاش ===== */}
        {stage === "discussion" && (
          <div className="space-y-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">💬 باب النقاش المفتوح</h3>

            {/* اسم المشارك */}
            <div className="card p-4 flex items-center gap-3 bg-violet-50 border border-violet-100">
              <UserCheck className="w-4 h-4 text-violet-600" />
              <span className="text-sm text-gray-600">تتحدث باسم:</span>
              <input value={discussorName} onChange={e => setDiscussName(e.target.value)}
                placeholder="اسمك / اسم المنسق"
                className="flex-1 border border-violet-200 rounded-xl px-3 py-1.5 text-sm bg-white outline-none focus:border-violet-500" />
            </div>

            {selected.agenda.length === 0 ? (
              <div className="card p-8 text-center text-gray-400">
                <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>أضف محاور الاجتماع أولاً</p>
              </div>
            ) : (
              selected.agenda.map((item, i) => {
                const itemDiscussions = selected.discussions.filter(d => d.agendaId === item.id);
                return (
                  <div key={item.id} className="card overflow-hidden">
                    <div className="bg-violet-50 border-b border-violet-100 px-4 py-3 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-violet-700 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">{i + 1}</div>
                      <p className="font-bold text-gray-800 text-sm">{item.title}</p>
                      <span className="mr-auto text-xs text-violet-500">{itemDiscussions.length} مداخلة</span>
                    </div>
                    <div className="p-4 space-y-3">
                      {itemDiscussions.length > 0 && (
                        <div className="space-y-2">
                          {itemDiscussions.map(d => (
                            <div key={d.id} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-700 text-xs flex items-center justify-center font-bold flex-shrink-0">
                                  {d.coordinatorName[0]}
                                </span>
                                <span className="font-semibold text-gray-700 text-xs">{d.coordinatorName}</span>
                                <span className="text-gray-300 text-xs mr-auto">{d.at}</span>
                              </div>
                              <p className="text-sm text-gray-700 leading-relaxed">{d.content}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <input
                          value={discussInputs[item.id] || ""}
                          onChange={e => setDiscussInputs(p => ({ ...p, [item.id]: e.target.value }))}
                          placeholder={`رأيك حول "${item.title}"...`}
                          className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 outline-none focus:border-violet-400"
                        />
                        <button onClick={() => addDiscussion(item.id)}
                          disabled={!discussorName.trim() || !discussInputs[item.id]?.trim()}
                          className="bg-violet-700 text-white px-4 py-2 rounded-xl text-sm hover:bg-violet-600 disabled:opacity-40 transition-colors">
                          إضافة
                        </button>
                      </div>
                      {!discussorName.trim() && (
                        <p className="text-xs text-amber-600">⚠️ أدخل اسمك أولاً لإضافة مداخلة</p>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            <div className="flex justify-between">
              <button onClick={() => setStage("agenda")} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm">
                <ChevronRight className="w-4 h-4" /> السابق
              </button>
              <button onClick={() => setStage("voting")}
                className="flex items-center gap-2 bg-violet-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-violet-600">
                التالي: التصويت <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ===== التصويت ===== */}
        {stage === "voting" && (
          <div className="space-y-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">🗳️ التصويت على القرارات</h3>

            {selected.agenda.map((item, i) => {
              const total = item.voteFor + item.voteAgainst + item.voteAbstain;
              const pct = (n: number) => total > 0 ? Math.round(n / total * 100) : 0;
              return (
                <div key={item.id} className="card p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold flex-shrink-0">{i + 1}</div>
                    <p className="font-bold text-gray-800">{item.title}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      { type: "for" as const, label: "مع", emoji: "👍", color: "bg-green-50 border-green-200 text-green-700 hover:bg-green-100", count: item.voteFor },
                      { type: "against" as const, label: "ضد", emoji: "👎", color: "bg-red-50 border-red-200 text-red-700 hover:bg-red-100", count: item.voteAgainst },
                      { type: "abstain" as const, label: "امتناع", emoji: "➖", color: "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100", count: item.voteAbstain },
                    ].map(v => (
                      <button key={v.type} onClick={() => vote(item.id, v.type)}
                        className={`${v.color} p-3 rounded-xl border flex flex-col items-center gap-1 transition-all hover:scale-105`}>
                        <span className="text-2xl">{v.emoji}</span>
                        <span className="text-sm font-bold">{v.label}</span>
                        <span className="text-2xl font-bold">{v.count}</span>
                        {total > 0 && <span className="text-xs opacity-70">{pct(v.count)}%</span>}
                      </button>
                    ))}
                  </div>

                  {total > 0 && (
                    <div className="mb-3">
                      <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
                        {item.voteFor > 0 && <div className="bg-green-500 transition-all" style={{ width: `${pct(item.voteFor)}%` }} />}
                        {item.voteAgainst > 0 && <div className="bg-red-400 transition-all" style={{ width: `${pct(item.voteAgainst)}%` }} />}
                        {item.voteAbstain > 0 && <div className="bg-gray-300 transition-all" style={{ width: `${pct(item.voteAbstain)}%` }} />}
                      </div>
                      <p className="text-xs text-gray-400 mt-1 text-center">{total} صوت إجمالي</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <input value={item.decision}
                      onChange={e => setDecision(item.id, e.target.value)}
                      placeholder="اكتب القرار النهائي هنا..."
                      className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-green-500" />
                    {item.decision && <CheckCircle className="w-5 h-5 text-green-500 self-center flex-shrink-0" />}
                  </div>
                </div>
              );
            })}

            <div className="flex justify-between">
              <button onClick={() => setStage("discussion")} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm">
                <ChevronRight className="w-4 h-4" /> السابق
              </button>
              <button onClick={() => setStage("minutes")}
                className="flex items-center gap-2 bg-violet-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-violet-600">
                التالي: المحضر <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ===== المحضر ===== */}
        {stage === "minutes" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">📄 محضر الاجتماع الرسمي</h3>
              {admin && (
                <div className="flex gap-2">
                  <button onClick={generateMinutes}
                    className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-600">
                    ⚡ توليد تلقائي
                  </button>
                  {selected.minutes && (
                    <button onClick={() => window.print()}
                      className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-600">
                      <Printer className="w-4 h-4" /> طباعة
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="card p-5">
              {admin ? (
                <textarea value={selected.minutes}
                  onChange={e => updateMeeting({ ...selected, minutes: e.target.value })}
                  rows={20} placeholder="اكتب محضر الاجتماع، أو اضغط 'توليد تلقائي' لإنشائه من المحاور والنقاشات والقرارات..."
                  className="w-full text-sm text-gray-800 outline-none resize-none leading-relaxed bg-transparent font-mono" />
              ) : (
                <pre className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed font-mono">
                  {selected.minutes || "لم يُكتب المحضر بعد — تواصل مع المشرف."}
                </pre>
              )}
            </div>
            <div className="flex justify-start">
              <button onClick={() => setStage("voting")} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm">
                <ChevronRight className="w-4 h-4" /> السابق
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* =================== قائمة الاجتماعات =================== */
  const upcoming = meetings.filter(m => m.status === "upcoming").length;
  const active = meetings.filter(m => m.status === "active").length;
  const completed = meetings.filter(m => m.status === "completed").length;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="card p-6 bg-gradient-to-l from-violet-800 to-indigo-700 text-white">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <Video className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">الاجتماعات</h1>
              <p className="text-indigo-200 text-sm">إدارة اجتماعات المنسقين</p>
            </div>
          </div>
          {admin && (
            <button onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 bg-white text-violet-800 px-4 py-2 rounded-xl text-sm font-bold hover:bg-violet-50 transition-colors flex-shrink-0">
              <Plus className="w-4 h-4" /> اجتماع جديد
            </button>
          )}
        </div>

        {/* إحصائيات */}
        <div className="grid grid-cols-4 gap-2 mt-4">
          {[
            { n: meetings.length, l: "إجمالي", emoji: "📊" },
            { n: active, l: "جارٍ الآن", emoji: "🟢" },
            { n: upcoming, l: "قادم", emoji: "⏳" },
            { n: completed, l: "منتهي", emoji: "✅" },
          ].map(s => (
            <div key={s.l} className="bg-white/10 rounded-xl p-2 text-center">
              <div className="text-lg">{s.emoji}</div>
              <div className="text-xl font-bold">{s.n}</div>
              <div className="text-indigo-200 text-[10px]">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* فورم إنشاء اجتماع */}
      {showCreate && admin && (
        <div className="card p-6 space-y-5 border-2 border-violet-100">
          <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
            <Plus className="w-5 h-5 text-violet-600" /> إنشاء اجتماع جديد
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-gray-600 mb-1 block">عنوان الاجتماع *</label>
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="مثال: اجتماع متابعة مشاريع WRO الربع الأول"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-violet-500" />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">التاريخ *</label>
              <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">الوقت</label>
              <input type="time" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none" />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">نوع الاجتماع</label>
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as "offline" | "online" }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none">
                <option value="offline">🏢 حضوري</option>
                <option value="online">💻 عبر الإنترنت</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">
                {form.type === "offline" ? "المكان" : "رابط الاجتماع"}
              </label>
              {form.type === "offline"
                ? <input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                    placeholder="مثال: قاعة الاجتماعات"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none" />
                : <input value={form.meetingLink} onChange={e => setForm(p => ({ ...p, meetingLink: e.target.value }))}
                    placeholder="https://meet.google.com/..."
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none font-mono" dir="ltr" />
              }
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-gray-600 mb-1 block">وصف مختصر</label>
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                rows={2} placeholder="موضوع الاجتماع الرئيسي..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none resize-none" />
            </div>
          </div>

          {/* الحضور - اختيار من المنسقين */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-2 block">المعنيون بالاجتماع</label>
            {coordinators.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {coordinators.map(c => (
                  <button key={c} onClick={() => setForm(p => ({
                    ...p,
                    participants: p.participants.includes(c) ? p.participants.filter(x => x !== c) : [...p.participants, c]
                  }))}
                    className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all border ${form.participants.includes(c) ? "bg-violet-700 text-white border-violet-700" : "bg-gray-50 text-gray-600 border-gray-200 hover:border-violet-300"}`}>
                    {form.participants.includes(c) ? "✓" : "+"} {c}
                  </button>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input value={form.customParticipant}
                onChange={e => setForm(p => ({ ...p, customParticipant: e.target.value }))}
                placeholder="أضف اسماً يدوياً..."
                onKeyDown={e => {
                  if (e.key === "Enter" && form.customParticipant.trim()) {
                    setForm(p => ({ ...p, participants: [...p.participants, p.customParticipant.trim()], customParticipant: "" }));
                  }
                }}
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 outline-none" />
              <button onClick={() => {
                if (form.customParticipant.trim()) {
                  setForm(p => ({ ...p, participants: [...p.participants, p.customParticipant.trim()], customParticipant: "" }));
                }
              }} className="bg-violet-100 text-violet-700 px-3 py-2 rounded-xl text-sm hover:bg-violet-200">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {form.participants.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.participants.map(p => (
                  <span key={p} className="flex items-center gap-1 bg-violet-50 text-violet-700 border border-violet-100 px-2.5 py-1 rounded-full text-xs">
                    {p}
                    <button onClick={() => setForm(prev => ({ ...prev, participants: prev.participants.filter(x => x !== p) }))}
                      className="text-violet-400 hover:text-red-500 ml-0.5">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* محاور الاجتماع */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-2 block">محاور الاجتماع الأولية</label>
            {form.agenda.length > 0 && (
              <div className="space-y-1.5 mb-2">
                {form.agenda.map((a, i) => (
                  <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
                    <span className="w-5 h-5 rounded-full bg-violet-100 text-violet-700 text-xs flex items-center justify-center font-bold flex-shrink-0">{i + 1}</span>
                    <span className="text-sm text-gray-700 flex-1">{a.title}</span>
                    <button onClick={() => setForm(p => ({ ...p, agenda: p.agenda.filter((_, j) => j !== i) }))}
                      className="text-red-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input value={agendaInput.title}
                onChange={e => setAgendaInput(p => ({ ...p, title: e.target.value }))}
                placeholder="مثال: مناقشة نتائج مسابقة WRO..."
                onKeyDown={e => {
                  if (e.key === "Enter" && agendaInput.title.trim()) {
                    setForm(p => ({ ...p, agenda: [...p.agenda, agendaInput] }));
                    setAgendaInput({ title: "", description: "" });
                  }
                }}
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none" />
              <button onClick={() => {
                if (agendaInput.title.trim()) {
                  setForm(p => ({ ...p, agenda: [...p.agenda, agendaInput] }));
                  setAgendaInput({ title: "", description: "" });
                }
              }} className="bg-violet-700 text-white px-3 py-2 rounded-xl hover:bg-violet-600">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <button onClick={createMeeting}
              className="bg-violet-700 text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-violet-600 transition-colors">
              ✅ إنشاء الاجتماع
            </button>
            <button onClick={() => setShowCreate(false)}
              className="bg-gray-100 text-gray-600 px-6 py-3 rounded-xl text-sm hover:bg-gray-200">
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* قائمة الاجتماعات */}
      {meetings.length === 0 ? (
        <div className="card p-16 text-center">
          <Video className="w-16 h-16 mx-auto mb-4 text-gray-200" />
          <p className="font-bold text-gray-500 text-lg mb-1">لا توجد اجتماعات مسجلة</p>
          {admin
            ? <button onClick={() => setShowCreate(true)} className="mt-4 flex items-center gap-2 bg-violet-700 text-white px-6 py-3 rounded-2xl font-bold mx-auto hover:bg-violet-600">
                <Plus className="w-5 h-5" /> إنشاء أول اجتماع
              </button>
            : <p className="text-gray-400 text-sm">لا توجد اجتماعات مجدولة حالياً</p>
          }
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {meetings.map(m => {
            const sm = STATUS_META[m.status];
            const totalDecisions = m.agenda.filter(a => a.status === "decided").length;
            return (
              <div key={m.id} className="card overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => { setSelected(m); setStage("overview"); }}>
                <div className={`p-4 ${m.status === "active" ? "bg-gradient-to-l from-green-700 to-emerald-600" : m.status === "upcoming" ? "bg-gradient-to-l from-indigo-700 to-violet-700" : "bg-gradient-to-l from-gray-600 to-gray-500"} text-white`}>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-base leading-tight group-hover:text-yellow-300 transition-colors">{m.title}</h3>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 flex items-center gap-1 ${sm.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sm.dot}`} /> {sm.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-white/80 mt-2">
                    {m.date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{m.date}</span>}
                    {m.time && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{m.time}</span>}
                    {(m.location || m.meetingLink) && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{m.location || "إلكتروني"}</span>}
                  </div>
                </div>
                <div className="p-4">
                  {m.participants.length > 0 && (
                    <div className="flex items-center gap-1 mb-3 flex-wrap">
                      <Users className="w-3.5 h-3.5 text-gray-400" />
                      {m.participants.slice(0, 3).map(p => (
                        <span key={p} className="text-xs bg-violet-50 text-violet-600 px-2 py-0.5 rounded-full">{p}</span>
                      ))}
                      {m.participants.length > 3 && <span className="text-xs text-gray-400">+{m.participants.length - 3}</span>}
                    </div>
                  )}
                  {m.description && <p className="text-xs text-gray-500 mb-3 line-clamp-2">{m.description}</p>}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-3 text-xs text-gray-400">
                      <span>📌 {m.agenda.length} محور</span>
                      <span>💬 {m.discussions.length} مداخلة</span>
                      <span>✅ {totalDecisions} قرار</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {admin && (
                        <button onClick={e => { e.stopPropagation(); if (confirm("حذف هذا الاجتماع؟")) { const updated = meetings.filter(x => x.id !== m.id); saveMeetings(updated); setMeetings(updated); } }}
                          className="p-1.5 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <ChevronLeft className="w-4 h-4 text-violet-500" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

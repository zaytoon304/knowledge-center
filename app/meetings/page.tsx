"use client";
import { useState, useEffect } from "react";
import {
  Video, Plus, Trash2, ChevronLeft, ChevronRight,
  MessageSquare, CheckCircle, FileText, Users,
  ThumbsUp, ThumbsDown, Minus, ArrowRight, Calendar, MapPin, Clock
} from "lucide-react";

interface AgendaItem {
  id: string;
  title: string;
  description: string;
  notes: string;
  decision: string;
  voteFor: number;
  voteAgainst: number;
  voteAbstain: number;
  status: "pending" | "discussed" | "voted" | "decided";
}

interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  status: "upcoming" | "active" | "completed";
  agenda: AgendaItem[];
  attendees: string;
  minutes: string;
  createdAt: string;
}

type Stage = "agenda" | "discussion" | "voting" | "minutes";

const STAGES: { id: Stage; label: string; icon: typeof MessageSquare }[] = [
  { id: "agenda", label: "محاور الاجتماع", icon: FileText },
  { id: "discussion", label: "النقاش", icon: MessageSquare },
  { id: "voting", label: "التصويت", icon: CheckCircle },
  { id: "minutes", label: "المحضر", icon: FileText },
];

function load(): Meeting[] {
  try { const d = localStorage.getItem("kc_meetings"); return d ? JSON.parse(d) : []; } catch { return []; }
}
function save(ms: Meeting[]) { localStorage.setItem("kc_meetings", JSON.stringify(ms)); }

function isAdmin() {
  try { return typeof window !== "undefined" && localStorage.getItem("kc_admin_auth") === "1"; } catch { return false; }
}

const EMPTY_AGENDA: AgendaItem = { id: "", title: "", description: "", notes: "", decision: "", voteFor: 0, voteAgainst: 0, voteAbstain: 0, status: "pending" };

export default function MeetingsPage() {
  const [admin] = useState(isAdmin);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selected, setSelected] = useState<Meeting | null>(null);
  const [stage, setStage] = useState<Stage>("agenda");
  const [showCreate, setShowCreate] = useState(false);
  const [newAgendaTitle, setNewAgendaTitle] = useState("");
  const [discussionNote, setDiscussionNote] = useState<{ [id: string]: string }>({});

  const [form, setForm] = useState({
    title: "", date: "", time: "", location: "", description: "", attendees: "",
    agenda: [] as { title: string; description: string }[],
  });
  const [agendaInput, setAgendaInput] = useState({ title: "", description: "" });

  useEffect(() => { setMeetings(load()); }, []);

  const refresh = () => {
    const ms = load();
    setMeetings(ms);
    if (selected) setSelected(ms.find(m => m.id === selected.id) || null);
  };

  const createMeeting = () => {
    if (!form.title.trim() || !form.date) return;
    const m: Meeting = {
      id: Date.now().toString(),
      title: form.title, date: form.date, time: form.time,
      location: form.location, description: form.description,
      attendees: form.attendees,
      status: "upcoming",
      agenda: form.agenda.map((a, i) => ({ ...EMPTY_AGENDA, id: `${Date.now()}_${i}`, title: a.title, description: a.description })),
      minutes: "",
      createdAt: new Date().toISOString(),
    };
    const updated = [m, ...meetings];
    save(updated);
    setMeetings(updated);
    setShowCreate(false);
    setForm({ title: "", date: "", time: "", location: "", description: "", attendees: "", agenda: [] });
  };

  const deleteMeeting = (id: string) => {
    const updated = meetings.filter(m => m.id !== id);
    save(updated);
    setMeetings(updated);
    if (selected?.id === id) setSelected(null);
  };

  const updateMeeting = (m: Meeting) => {
    const updated = meetings.map(x => x.id === m.id ? m : x);
    save(updated);
    setMeetings(updated);
    setSelected(m);
  };

  const addAgendaToActive = () => {
    if (!selected || !newAgendaTitle.trim()) return;
    const item: AgendaItem = { ...EMPTY_AGENDA, id: Date.now().toString(), title: newAgendaTitle };
    updateMeeting({ ...selected, agenda: [...selected.agenda, item] });
    setNewAgendaTitle("");
  };

  const saveNotes = (itemId: string) => {
    if (!selected) return;
    const note = discussionNote[itemId] || "";
    const updated = selected.agenda.map(a =>
      a.id === itemId ? { ...a, notes: (a.notes ? a.notes + "\n" : "") + note, status: "discussed" as const } : a
    );
    updateMeeting({ ...selected, agenda: updated });
    setDiscussionNote(p => ({ ...p, [itemId]: "" }));
  };

  const vote = (itemId: string, type: "for" | "against" | "abstain") => {
    if (!selected) return;
    const updated = selected.agenda.map(a =>
      a.id === itemId ? {
        ...a,
        voteFor: type === "for" ? a.voteFor + 1 : a.voteFor,
        voteAgainst: type === "against" ? a.voteAgainst + 1 : a.voteAgainst,
        voteAbstain: type === "abstain" ? a.voteAbstain + 1 : a.voteAbstain,
        status: "voted" as const,
      } : a
    );
    updateMeeting({ ...selected, agenda: updated });
  };

  const setDecision = (itemId: string, dec: string) => {
    if (!selected) return;
    const updated = selected.agenda.map(a =>
      a.id === itemId ? { ...a, decision: dec, status: "decided" as const } : a
    );
    updateMeeting({ ...selected, agenda: updated });
  };

  const generateMinutes = () => {
    if (!selected) return;
    const lines = [
      `محضر اجتماع: ${selected.title}`,
      `التاريخ: ${selected.date} - الساعة: ${selected.time}`,
      `المكان: ${selected.location}`,
      `الحضور: ${selected.attendees}`,
      "",
      "محاور الاجتماع:",
      ...selected.agenda.map((a, i) => [
        `${i + 1}. ${a.title}`,
        a.description ? `   الوصف: ${a.description}` : "",
        a.notes ? `   النقاش: ${a.notes}` : "",
        a.voteFor + a.voteAgainst + a.voteAbstain > 0
          ? `   التصويت: مع (${a.voteFor}) | ضد (${a.voteAgainst}) | امتناع (${a.voteAbstain})`
          : "",
        a.decision ? `   القرار: ${a.decision}` : "",
      ]).flat().filter(Boolean),
    ].join("\n");
    updateMeeting({ ...selected, minutes: lines, status: "completed" });
  };

  const statusLabel = (s: Meeting["status"]) =>
    s === "upcoming" ? "قادم" : s === "active" ? "جارٍ" : "منتهي";
  const statusColor = (s: Meeting["status"]) =>
    s === "upcoming" ? "bg-yellow-100 text-yellow-700" : s === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500";

  const stageIdx = STAGES.findIndex(s => s.id === stage);

  /* --- Main Render --- */
  if (selected) {
    return (
      <div className="space-y-4 animate-fade-in">
        {/* Top bar */}
        <div className="flex items-center gap-3 card p-4">
          <button onClick={() => setSelected(null)} className="text-blue-600 hover:text-blue-800">
            <ArrowRight className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h2 className="font-bold text-gray-800">{selected.title}</h2>
            <div className="flex gap-3 text-xs text-gray-400 mt-0.5">
              {selected.date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{selected.date}</span>}
              {selected.time && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{selected.time}</span>}
              {selected.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{selected.location}</span>}
            </div>
          </div>
          {admin && (
            <select value={selected.status} onChange={e => updateMeeting({ ...selected, status: e.target.value as Meeting["status"] })}
              className={`text-xs px-3 py-1.5 rounded-xl font-medium border-0 outline-none ${statusColor(selected.status)}`}>
              <option value="upcoming">قادم</option>
              <option value="active">جارٍ الآن</option>
              <option value="completed">منتهي</option>
            </select>
          )}
        </div>

        {/* Stage tabs */}
        <div className="card p-1.5 flex gap-1">
          {STAGES.map((s, i) => {
            const Icon = s.icon;
            return (
              <button key={s.id} onClick={() => setStage(s.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium transition-all ${stage === s.id ? "bg-blue-700 text-white shadow" : "text-gray-500 hover:bg-gray-100"}`}>
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:block">{s.label}</span>
                <span className="sm:hidden">{i + 1}</span>
              </button>
            );
          })}
        </div>

        {/* Stage 1: Agenda */}
        {stage === "agenda" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-800 text-lg">محاور الاجتماع</h3>
              {selected.attendees && (
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Users className="w-4 h-4" />{selected.attendees}
                </div>
              )}
            </div>
            {selected.agenda.length === 0 ? (
              <div className="card p-8 text-center text-gray-400">
                <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>لا توجد محاور بعد</p>
              </div>
            ) : (
              selected.agenda.map((item, i) => (
                <div key={item.id} className={`card p-5 border-r-4 ${item.status === "decided" ? "border-green-500" : item.status === "voted" ? "border-blue-500" : item.status === "discussed" ? "border-yellow-500" : "border-gray-300"}`}>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold flex-shrink-0">{i + 1}</div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-800">{item.title}</p>
                      {item.description && <p className="text-sm text-gray-500 mt-0.5">{item.description}</p>}
                      {item.decision && <div className="mt-2 bg-green-50 rounded-xl p-2.5 text-sm text-green-800 font-medium">✅ القرار: {item.decision}</div>}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${item.status === "decided" ? "bg-green-100 text-green-700" : item.status === "voted" ? "bg-blue-100 text-blue-700" : item.status === "discussed" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-500"}`}>
                      {item.status === "decided" ? "مُقرَّر" : item.status === "voted" ? "مُصوَّت" : item.status === "discussed" ? "نوقش" : "قيد النقاش"}
                    </span>
                  </div>
                </div>
              ))
            )}
            {admin && (
              <div className="card p-4 flex gap-2">
                <input value={newAgendaTitle} onChange={e => setNewAgendaTitle(e.target.value)}
                  placeholder="أضف محوراً جديداً..."
                  onKeyDown={e => e.key === "Enter" && addAgendaToActive()}
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 outline-none focus:border-blue-500" />
                <button onClick={addAgendaToActive} className="bg-blue-700 text-white px-4 py-2 rounded-xl text-sm hover:bg-blue-600 flex items-center gap-1">
                  <Plus className="w-4 h-4" /> إضافة
                </button>
              </div>
            )}
            <div className="flex justify-end">
              <button onClick={() => setStage("discussion")}
                className="flex items-center gap-2 bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors">
                التالي: النقاش <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Stage 2: Discussion */}
        {stage === "discussion" && (
          <div className="space-y-4">
            <h3 className="font-bold text-gray-800 text-lg">النقاش حول المحاور</h3>
            {selected.agenda.map((item, i) => (
              <div key={item.id} className="card p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-yellow-100 text-yellow-700 flex items-center justify-center font-bold">{i + 1}</div>
                  <div>
                    <p className="font-bold text-gray-800">{item.title}</p>
                    {item.description && <p className="text-xs text-gray-500">{item.description}</p>}
                  </div>
                </div>
                {item.notes && (
                  <div className="bg-gray-50 rounded-xl p-3 mb-3 text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                    <p className="text-xs font-semibold text-gray-500 mb-1">ملاحظات النقاش:</p>
                    {item.notes}
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    value={discussionNote[item.id] || ""}
                    onChange={e => setDiscussionNote(p => ({ ...p, [item.id]: e.target.value }))}
                    placeholder="أضف ملاحظة أو رأي المنسق..."
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 outline-none focus:border-yellow-500"
                  />
                  <button onClick={() => saveNotes(item.id)}
                    disabled={!discussionNote[item.id]?.trim()}
                    className="bg-yellow-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-yellow-500 disabled:opacity-40 transition-colors">
                    حفظ
                  </button>
                </div>
              </div>
            ))}
            <div className="flex justify-between">
              <button onClick={() => setStage("agenda")} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm">
                <ChevronRight className="w-4 h-4" /> السابق
              </button>
              <button onClick={() => setStage("voting")}
                className="flex items-center gap-2 bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors">
                التالي: التصويت <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Stage 3: Voting */}
        {stage === "voting" && (
          <div className="space-y-4">
            <h3 className="font-bold text-gray-800 text-lg">التصويت على القرارات</h3>
            {selected.agenda.map((item, i) => (
              <div key={item.id} className="card p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">{i + 1}</div>
                  <p className="font-bold text-gray-800">{item.title}</p>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { type: "for" as const, label: "مع", icon: ThumbsUp, color: "bg-green-100 text-green-700 hover:bg-green-200", count: item.voteFor },
                    { type: "against" as const, label: "ضد", icon: ThumbsDown, color: "bg-red-100 text-red-700 hover:bg-red-200", count: item.voteAgainst },
                    { type: "abstain" as const, label: "امتناع", icon: Minus, color: "bg-gray-100 text-gray-600 hover:bg-gray-200", count: item.voteAbstain },
                  ].map(v => {
                    const Icon = v.icon;
                    return (
                      <button key={v.type} onClick={() => vote(item.id, v.type)}
                        className={`${v.color} p-3 rounded-xl flex flex-col items-center gap-1 transition-colors`}>
                        <Icon className="w-5 h-5" />
                        <span className="text-sm font-medium">{v.label}</span>
                        <span className="text-xl font-bold">{v.count}</span>
                      </button>
                    );
                  })}
                </div>
                {item.voteFor + item.voteAgainst + item.voteAbstain > 0 && (
                  <div className="bg-blue-50 rounded-xl p-3 mb-3">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full transition-all"
                        style={{ width: `${item.voteFor + item.voteAgainst + item.voteAbstain > 0 ? (item.voteFor / (item.voteFor + item.voteAgainst + item.voteAbstain)) * 100 : 0}%` }} />
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-center">
                      إجمالي التصويت: {item.voteFor + item.voteAgainst + item.voteAbstain} صوت
                    </p>
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    value={item.decision}
                    onChange={e => setDecision(item.id, e.target.value)}
                    placeholder="اكتب القرار النهائي..."
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 outline-none focus:border-green-500"
                  />
                  {item.decision && <div className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500" /></div>}
                </div>
              </div>
            ))}
            <div className="flex justify-between">
              <button onClick={() => setStage("discussion")} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm">
                <ChevronRight className="w-4 h-4" /> السابق
              </button>
              <button onClick={() => setStage("minutes")}
                className="flex items-center gap-2 bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors">
                التالي: المحضر <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Stage 4: Minutes */}
        {stage === "minutes" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-800 text-lg">محضر الاجتماع الرسمي</h3>
              {admin && (
                <button onClick={generateMinutes}
                  className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-600 transition-colors">
                  ⚡ توليد تلقائي
                </button>
              )}
            </div>
            <div className="card p-5">
              {admin ? (
                <textarea
                  value={selected.minutes}
                  onChange={e => updateMeeting({ ...selected, minutes: e.target.value, status: "completed" })}
                  rows={18}
                  placeholder="اكتب محضر الاجتماع هنا، أو اضغط 'توليد تلقائي' ليُنشأ تلقائياً من محاور النقاش والقرارات..."
                  className="w-full text-sm text-gray-800 outline-none resize-none leading-relaxed bg-transparent font-mono"
                />
              ) : (
                <pre className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed font-mono">{selected.minutes || "لم يُكتب المحضر بعد."}</pre>
              )}
            </div>
            {admin && (
              <div className="flex justify-between">
                <button onClick={() => setStage("voting")} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm">
                  <ChevronRight className="w-4 h-4" /> السابق
                </button>
                <button onClick={() => window.print()}
                  className="flex items-center gap-2 bg-gray-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-600 transition-colors">
                  🖨️ طباعة المحضر
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  /* --- Meetings List --- */
  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="card p-5 bg-gradient-to-l from-violet-800 to-indigo-700 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center">
              <Video className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">الاجتماعات</h1>
              <p className="text-indigo-200 text-xs">{meetings.length} اجتماع مسجل</p>
            </div>
          </div>
          {admin && (
            <button onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" /> اجتماع جديد
            </button>
          )}
        </div>
      </div>

      {/* Create Form */}
      {showCreate && admin && (
        <div className="card p-6 space-y-4">
          <h3 className="font-bold text-gray-800 text-lg">إنشاء اجتماع جديد</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-gray-600 mb-1 block">عنوان الاجتماع *</label>
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="مثال: اجتماع متابعة مشاريع WRO" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-violet-500" />
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
              <label className="text-xs font-semibold text-gray-600 mb-1 block">المكان</label>
              <input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                placeholder="مثال: قاعة الاجتماعات" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">الحضور</label>
              <input value={form.attendees} onChange={e => setForm(p => ({ ...p, attendees: e.target.value }))}
                placeholder="مثال: المنسقون، رئيس القسم" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-gray-600 mb-1 block">وصف مختصر</label>
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                rows={2} placeholder="موضوع الاجتماع..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none resize-none" />
            </div>
          </div>

          {/* Agenda builder */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-2 block">محاور الاجتماع</label>
            <div className="space-y-2 mb-2">
              {form.agenda.map((a, i) => (
                <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                  <span className="text-xs text-gray-400 font-bold">{i + 1}</span>
                  <span className="text-sm text-gray-700 flex-1">{a.title}</span>
                  <button onClick={() => setForm(p => ({ ...p, agenda: p.agenda.filter((_, j) => j !== i) }))}
                    className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={agendaInput.title} onChange={e => setAgendaInput(p => ({ ...p, title: e.target.value }))}
                placeholder="أضف محوراً..." onKeyDown={e => { if (e.key === "Enter" && agendaInput.title.trim()) { setForm(p => ({ ...p, agenda: [...p.agenda, agendaInput] })); setAgendaInput({ title: "", description: "" }); }}}
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 outline-none" />
              <button onClick={() => { if (agendaInput.title.trim()) { setForm(p => ({ ...p, agenda: [...p.agenda, agendaInput] })); setAgendaInput({ title: "", description: "" }); }}}
                className="bg-violet-700 text-white px-3 py-2 rounded-xl text-sm hover:bg-violet-600"><Plus className="w-4 h-4" /></button>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button onClick={createMeeting}
              className="bg-violet-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-violet-600 transition-colors">
              إنشاء الاجتماع
            </button>
            <button onClick={() => setShowCreate(false)} className="bg-gray-100 text-gray-600 px-6 py-2.5 rounded-xl text-sm hover:bg-gray-200">
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* Meetings list */}
      {meetings.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Video className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium text-gray-500">لا توجد اجتماعات مسجلة</p>
          {admin && <p className="text-sm mt-1">اضغط "اجتماع جديد" لإنشاء أول اجتماع</p>}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {meetings.map(m => (
            <div key={m.id} className="card overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={() => { setSelected(m); setStage("agenda"); }}>
              <div className={`p-4 ${m.status === "active" ? "bg-gradient-to-l from-green-700 to-emerald-600" : m.status === "upcoming" ? "bg-gradient-to-l from-indigo-700 to-violet-600" : "bg-gradient-to-l from-gray-600 to-gray-500"} text-white`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-base leading-tight">{m.title}</h3>
                    <div className="flex flex-wrap gap-3 text-xs text-white/80 mt-1.5">
                      {m.date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{m.date}</span>}
                      {m.time && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{m.time}</span>}
                    </div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${statusColor(m.status)}`}>
                    {statusLabel(m.status)}
                  </span>
                </div>
              </div>
              <div className="p-4">
                {m.location && <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2"><MapPin className="w-3.5 h-3.5" />{m.location}</div>}
                {m.description && <p className="text-sm text-gray-600 mb-3">{m.description}</p>}
                <div className="flex items-center justify-between">
                  <div className="flex gap-3 text-xs text-gray-400">
                    <span>{m.agenda.length} محور</span>
                    <span>{m.agenda.filter(a => a.status === "decided").length} قرار</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {admin && (
                      <button onClick={e => { e.stopPropagation(); deleteMeeting(m.id); }}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <span className="text-blue-600 text-xs font-medium flex items-center gap-1">
                      فتح <ChevronLeft className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

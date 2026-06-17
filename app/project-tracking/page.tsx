"use client";
import { useState, useEffect } from "react";
import { Plus, Trash2, ChevronRight, Kanban, User, Calendar, Flag, Edit3, Check, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type Stage = "idea" | "design" | "prototype" | "testing" | "final";

interface KanbanCard {
  id: string;
  title: string;
  description: string;
  studentId: string;
  studentName: string;
  stage: Stage;
  field: string;
  priority: "low" | "medium" | "high";
  notes: string;
  createdAt: string;
  updatedAt: string;
}

const STAGES: { id: Stage; label: string; color: string; bg: string; border: string }[] = [
  { id: "idea", label: "💡 فكرة", color: "text-sky-700", bg: "bg-sky-50", border: "border-sky-300" },
  { id: "design", label: "✏️ تصميم", color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-300" },
  { id: "prototype", label: "🔧 نموذج أولي", color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-300" },
  { id: "testing", label: "🧪 اختبار", color: "text-yellow-700", bg: "bg-yellow-50", border: "border-yellow-300" },
  { id: "final", label: "🏆 عرض نهائي", color: "text-green-700", bg: "bg-green-50", border: "border-green-300" },
];

const PRIORITY_COLORS = { low: "bg-gray-100 text-gray-600", medium: "bg-yellow-100 text-yellow-700", high: "bg-red-100 text-red-700" };
const PRIORITY_LABELS = { low: "عادي", medium: "متوسط", high: "عاجل" };

function load(): KanbanCard[] {
  try { const d = localStorage.getItem("kc_kanban"); return d ? JSON.parse(d) : []; } catch { return []; }
}
function save(cards: KanbanCard[]) { localStorage.setItem("kc_kanban", JSON.stringify(cards)); }
function isAdmin() { try { return typeof window !== "undefined" && localStorage.getItem("kc_admin_auth") === "1"; } catch { return false; } }

const EMPTY_FORM = { title: "", description: "", studentName: "", studentId: "", field: "", priority: "medium" as "low"|"medium"|"high", notes: "" };

export default function ProjectTrackingPage() {
  const { user, isLoggedIn, isStudent, getAllStudents } = useAuth();
  const [admin] = useState(isAdmin);
  const [cards, setCards] = useState<KanbanCard[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState<{ [id: string]: string }>({});
  const [filterStage, setFilterStage] = useState<Stage | "all">("all");

  useEffect(() => { setCards(load()); }, []);

  const students = getAllStudents().filter(s => s.status === "approved");

  const myCards = isStudent && user ? cards.filter(c => c.studentId === user.id) : cards;
  const displayed = filterStage === "all" ? myCards : myCards.filter(c => c.stage === filterStage);

  const addCard = () => {
    if (!form.title.trim()) return;
    const card: KanbanCard = {
      id: Date.now().toString(), ...form,
      stage: "idea",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [card, ...cards];
    save(updated); setCards(updated);
    setForm(EMPTY_FORM); setShowForm(false);
  };

  const advanceStage = (id: string) => {
    const order: Stage[] = ["idea", "design", "prototype", "testing", "final"];
    const updated = cards.map(c => {
      if (c.id !== id) return c;
      const idx = order.indexOf(c.stage);
      if (idx >= order.length - 1) return c;
      return { ...c, stage: order[idx + 1], updatedAt: new Date().toISOString() };
    });
    save(updated); setCards(updated);
  };

  const backStage = (id: string) => {
    const order: Stage[] = ["idea", "design", "prototype", "testing", "final"];
    const updated = cards.map(c => {
      if (c.id !== id) return c;
      const idx = order.indexOf(c.stage);
      if (idx <= 0) return c;
      return { ...c, stage: order[idx - 1], updatedAt: new Date().toISOString() };
    });
    save(updated); setCards(updated);
  };

  const saveNote = (id: string) => {
    const note = editNotes[id];
    if (!note?.trim()) return;
    const updated = cards.map(c => c.id !== id ? c : {
      ...c, notes: (c.notes ? c.notes + "\n" : "") + `[${new Date().toLocaleDateString("ar-SA")}] ${note}`,
      updatedAt: new Date().toISOString(),
    });
    save(updated); setCards(updated);
    setEditNotes(p => ({ ...p, [id]: "" }));
    setEditId(null);
  };

  const deleteCard = (id: string) => {
    const updated = cards.filter(c => c.id !== id);
    save(updated); setCards(updated);
  };

  const stageIdx = (s: Stage) => ["idea", "design", "prototype", "testing", "final"].indexOf(s);

  const statsByStage = STAGES.map(s => ({ ...s, count: myCards.filter(c => c.stage === s.id).length }));

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="card p-5 bg-gradient-to-l from-blue-900 to-indigo-700 text-white">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center">
              <Kanban className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">متابعة المشاريع</h1>
              <p className="text-blue-200 text-xs">{myCards.length} مشروع — {myCards.filter(c => c.stage === "final").length} مكتمل</p>
            </div>
          </div>
          {(admin || !isStudent) && (
            <button onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" /> مشروع جديد
            </button>
          )}
        </div>
        {/* Progress stats */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
          {statsByStage.map(s => (
            <div key={s.id} className="bg-white/10 rounded-xl px-3 py-2 flex-shrink-0 text-center min-w-[70px]">
              <div className="text-lg font-bold text-yellow-300">{s.count}</div>
              <div className="text-white/70 text-xs">{s.label.split(" ")[1]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Form */}
      {showForm && (admin || !isStudent) && (
        <div className="card p-5 space-y-4">
          <h3 className="font-bold text-gray-800">إضافة مشروع للمتابعة</h3>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-gray-600 mb-1 block">عنوان المشروع *</label>
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="مثال: روبوت تتبع الخط" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">الطالب</label>
              {admin ? (
                <select value={form.studentId} onChange={e => {
                  const s = students.find(st => st.id === e.target.value);
                  setForm(p => ({ ...p, studentId: e.target.value, studentName: s?.name || "" }));
                }} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none">
                  <option value="">اختر طالباً</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              ) : (
                <input value={user?.name || ""} disabled className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-100" />
              )}
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">المجال</label>
              <select value={form.field} onChange={e => setForm(p => ({ ...p, field: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none">
                <option value="">اختر المجال</option>
                {["روبوت", "ذكاء اصطناعي", "إلكترونيات", "IoT", "برمجة", "بيئة", "ابتكار"].map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">الأولوية</label>
              <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value as "low"|"medium"|"high" }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none">
                <option value="low">عادي</option>
                <option value="medium">متوسط</option>
                <option value="high">عاجل</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-gray-600 mb-1 block">الوصف</label>
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                rows={2} placeholder="وصف مختصر للمشروع..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none resize-none" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={addCard} className="bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-blue-600">إضافة</button>
            <button onClick={() => setShowForm(false)} className="bg-gray-100 text-gray-600 px-5 py-2 rounded-xl text-sm hover:bg-gray-200">إلغاء</button>
          </div>
        </div>
      )}

      {/* Stage filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button onClick={() => setFilterStage("all")}
          className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filterStage === "all" ? "bg-blue-700 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
          الكل ({myCards.length})
        </button>
        {STAGES.map(s => (
          <button key={s.id} onClick={() => setFilterStage(s.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filterStage === s.id ? "bg-blue-700 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {s.label} ({myCards.filter(c => c.stage === s.id).length})
          </button>
        ))}
      </div>

      {/* Kanban Board */}
      {displayed.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Kanban className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium text-gray-500">لا توجد مشاريع بعد</p>
          <p className="text-sm mt-1">{admin ? "اضغط 'مشروع جديد' لإضافة مشروع للمتابعة" : "لم يُضف لك مشروع بعد"}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayed.map(card => {
            const stageInfo = STAGES.find(s => s.id === card.stage)!;
            const idx = stageIdx(card.stage);
            return (
              <div key={card.id} className={`card border-r-4 ${stageInfo.border} overflow-hidden`}>
                <div className={`px-5 py-3 ${stageInfo.bg} flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${stageInfo.color}`}>{stageInfo.label}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${PRIORITY_COLORS[card.priority]}`}>{PRIORITY_LABELS[card.priority]}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {idx > 0 && (
                      <button onClick={() => backStage(card.id)} title="رجوع مرحلة"
                        className="p-1.5 bg-white/60 hover:bg-white rounded-lg text-gray-500 transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                    {idx < 4 && (
                      <button onClick={() => advanceStage(card.id)}
                        className={`px-3 py-1.5 ${stageInfo.bg} border ${stageInfo.border} ${stageInfo.color} hover:opacity-80 rounded-lg text-xs font-bold transition-colors flex items-center gap-1`}>
                        التالي ←
                      </button>
                    )}
                    {idx === 4 && <span className="text-green-700 text-xs font-bold bg-green-100 px-3 py-1.5 rounded-lg">✅ مكتمل</span>}
                    {admin && (
                      <button onClick={() => deleteCard(card.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-bold text-gray-800">{card.title}</h3>
                    {card.field && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full flex-shrink-0">{card.field}</span>}
                  </div>
                  {card.description && <p className="text-sm text-gray-500 mb-3">{card.description}</p>}
                  <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                    {card.studentName && <span className="flex items-center gap-1"><User className="w-3 h-3" />{card.studentName}</span>}
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(card.updatedAt).toLocaleDateString("ar-SA")}</span>
                  </div>
                  {/* Progress bar */}
                  <div className="h-2 bg-gray-100 rounded-full mb-3 overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${["bg-sky-400", "bg-purple-400", "bg-orange-400", "bg-yellow-400", "bg-green-500"][idx]}`}
                      style={{ width: `${(idx + 1) * 20}%` }} />
                  </div>
                  {/* Notes */}
                  {card.notes && (
                    <div className="bg-gray-50 rounded-xl p-3 mb-3">
                      <p className="text-xs font-semibold text-gray-500 mb-1">ملاحظات المتابعة:</p>
                      <p className="text-xs text-gray-600 whitespace-pre-line leading-relaxed">{card.notes}</p>
                    </div>
                  )}
                  {editId === card.id ? (
                    <div className="flex gap-2 mt-2">
                      <input value={editNotes[card.id] || ""} onChange={e => setEditNotes(p => ({ ...p, [card.id]: e.target.value }))}
                        placeholder="أضف ملاحظة متابعة..."
                        className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 outline-none focus:border-blue-500" />
                      <button onClick={() => saveNote(card.id)} className="p-2 bg-green-100 text-green-700 rounded-xl hover:bg-green-200"><Check className="w-4 h-4" /></button>
                      <button onClick={() => setEditId(null)} className="p-2 bg-gray-100 text-gray-500 rounded-xl hover:bg-gray-200"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <button onClick={() => setEditId(card.id)} className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-1">
                      <Edit3 className="w-3 h-3" /> إضافة ملاحظة
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

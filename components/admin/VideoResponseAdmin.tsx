"use client";
import { useState, useEffect } from "react";
import { Video, Plus, Trash2, Power, CheckCircle, XCircle, Clock } from "lucide-react";
import {
  getPrompts, addPrompt, togglePromptActive, deletePrompt,
  getResponses, reviewVideoResponse, deleteVideoResponse,
  type VideoPrompt, type VideoResponse,
} from "@/lib/videoResponses";

export default function VideoResponseAdmin() {
  const [prompts, setPrompts] = useState<VideoPrompt[]>([]);
  const [responses, setResponses] = useState<VideoResponse[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const refresh = () => {
    getPrompts().then(setPrompts);
    getResponses().then(setResponses);
  };
  useEffect(() => { refresh(); }, []);

  const addNewPrompt = async () => {
    if (!title.trim() || saving) return;
    setSaving(true);
    await addPrompt(title, description, "محمد زيتون");
    setTitle(""); setDescription(""); setShowForm(false); setSaving(false);
    refresh();
  };

  const pending = responses.filter(r => r.status === "pending").sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const reviewed = responses.filter(r => r.status !== "pending").sort((a, b) => (b.reviewedAt || "").localeCompare(a.reviewedAt || "")).slice(0, 15);

  const act = async (id: string, approve: boolean) => {
    const note = approve ? undefined : (prompt("سبب الرفض (اختياري):") || "");
    await reviewVideoResponse(id, approve, note);
    refresh();
  };

  return (
    <div className="space-y-5">
      <div className="card p-5 bg-gradient-to-l from-rose-800 to-pink-700 text-white">
        <h2 className="font-bold text-lg flex items-center gap-2"><Video className="w-5 h-5" /> فيديو ردود الطلاب</h2>
        <p className="text-white/80 text-sm mt-1">اطرح سؤالاً، الطالب يسجّل فيديو قصير يشرح إجابته/فكرته بدل الكتابة — راجع واعتمد قبل ما يظهر بملفه.</p>
      </div>

      {/* الأسئلة المطروحة */}
      <div className="card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-800 text-sm">الأسئلة المطروحة ({prompts.length})</h3>
          <button onClick={() => setShowForm(v => !v)} className="flex items-center gap-1.5 bg-rose-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-rose-500">
            <Plus className="w-3.5 h-3.5" /> سؤال جديد
          </button>
        </div>
        {showForm && (
          <div className="bg-gray-50 rounded-xl p-3 space-y-2">
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="السؤال (مثال: ليش اخترت هذا الحساس بمشروعك؟)"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="توضيح إضافي (اختياري)" rows={2}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none" />
            <button disabled={!title.trim() || saving} onClick={addNewPrompt}
              className="bg-rose-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-rose-500 disabled:opacity-40">
              {saving ? "جارٍ الحفظ..." : "نشر السؤال"}
            </button>
          </div>
        )}
        <div className="space-y-2">
          {prompts.map(p => (
            <div key={p.id} className="flex items-center justify-between gap-2 bg-gray-50 rounded-lg px-3 py-2">
              <div className="min-w-0">
                <p className={`text-sm font-bold truncate ${p.active ? "text-gray-700" : "text-gray-400 line-through"}`}>{p.title}</p>
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                <button onClick={() => togglePromptActive(p.id).then(refresh)} className={`p-1.5 rounded-lg ${p.active ? "text-emerald-600 hover:bg-emerald-50" : "text-gray-400 hover:bg-gray-100"}`} title={p.active ? "نشط" : "متوقف"}>
                  <Power className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => { if (confirm("حذف السؤال نهائياً؟")) deletePrompt(p.id).then(refresh); }} className="p-1.5 rounded-lg hover:bg-red-100 text-red-500">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* بانتظار المراجعة */}
      <div className="card p-4 space-y-3">
        <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2"><Clock className="w-4 h-4 text-amber-600" /> فيديوهات بانتظار المراجعة ({pending.length})</h3>
        {pending.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">ما فيه فيديوهات بانتظار المراجعة</p>
        ) : (
          pending.map(r => (
            <div key={r.id} className="border border-gray-100 rounded-xl p-3 space-y-2">
              <p className="text-sm font-bold text-gray-700">{r.studentName} — {r.promptTitle}</p>
              <video src={r.video} controls className="w-full rounded-xl max-h-64" />
              <div className="flex gap-2">
                <button onClick={() => act(r.id, true)} className="flex items-center gap-1.5 bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-green-500">
                  <CheckCircle className="w-3.5 h-3.5" /> اعتماد
                </button>
                <button onClick={() => act(r.id, false)} className="flex items-center gap-1.5 bg-red-50 text-red-500 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-100">
                  <XCircle className="w-3.5 h-3.5" /> رفض
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {reviewed.length > 0 && (
        <div className="card p-4 space-y-2">
          <h3 className="text-sm font-bold text-gray-600">آخر المراجعات</h3>
          {reviewed.map(r => (
            <div key={r.id} className="flex items-center justify-between text-xs bg-gray-50 rounded-lg px-3 py-2">
              <span className="text-gray-600">{r.studentName} — {r.promptTitle}</span>
              <div className="flex items-center gap-2">
                <span className={r.status === "approved" ? "text-emerald-600 font-semibold" : "text-red-500 font-semibold"}>
                  {r.status === "approved" ? "✅ معتمد" : "❌ مرفوض"}
                </span>
                <button onClick={() => deleteVideoResponse(r.id).then(refresh)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

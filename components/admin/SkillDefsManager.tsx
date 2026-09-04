"use client";
import { useState, useEffect } from "react";
import { Target, Plus, Trash2, Pencil, X } from "lucide-react";
import { Skill, getSkillDefs, addSkillDef, updateSkillDef, deleteSkillDef } from "@/lib/skillMap";

const EMPTY_FORM = { title: "", description: "", emoji: "🤖", prerequisites: [] as string[] };

export default function SkillDefsManager() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const refresh = () => { getSkillDefs().then(setSkills); };
  useEffect(() => { refresh(); }, []);

  const openAdd = () => { setEditingId(null); setForm(EMPTY_FORM); setShowForm(true); };
  const openEdit = (s: Skill) => { setEditingId(s.id); setForm({ title: s.title, description: s.description, emoji: s.emoji, prerequisites: s.prerequisites }); setShowForm(true); };

  const togglePrereq = (id: string) => {
    setForm(p => ({ ...p, prerequisites: p.prerequisites.includes(id) ? p.prerequisites.filter(x => x !== id) : [...p.prerequisites, id] }));
  };

  const submit = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    if (editingId) await updateSkillDef(editingId, form);
    else await addSkillDef(form);
    setSaving(false);
    setShowForm(false);
    refresh();
  };

  const remove = async (id: string) => {
    if (!confirm("حذف هذي المهارة نهائياً؟ (لو فيه طلاب معتمَدين عليها، سجلهم يبقى محفوظاً بس ما تظهر بالشجرة بعد الحذف)")) return;
    await deleteSkillDef(id);
    refresh();
  };

  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <Target className="w-5 h-5 text-violet-600" /> إدارة قائمة مهارات الروبوتات ({skills.length})
        </h3>
        <button onClick={openAdd} className="flex items-center gap-1.5 bg-violet-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-violet-500">
          <Plus className="w-3.5 h-3.5" /> مهارة جديدة
        </button>
      </div>

      <div className="space-y-2">
        {skills.map(s => (
          <div key={s.id} className="flex items-center justify-between gap-2 bg-gray-50 rounded-lg px-3 py-2">
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-700 truncate">{s.emoji} {s.title}</p>
              {s.prerequisites.length > 0 && (
                <p className="text-[11px] text-gray-400 truncate">
                  يحتاج: {s.prerequisites.map(id => skills.find(x => x.id === id)?.title || id).join("، ")}
                </p>
              )}
            </div>
            <div className="flex gap-1.5 flex-shrink-0">
              <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500"><Pencil className="w-3.5 h-3.5" /></button>
              <button onClick={() => remove(s.id)} className="p-1.5 rounded-lg hover:bg-red-100 text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center overflow-auto p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md my-6 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-gray-800">{editingId ? "تعديل مهارة" : "مهارة جديدة"}</h4>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="flex gap-2">
              <input value={form.emoji} onChange={e => setForm(p => ({ ...p, emoji: e.target.value }))}
                className="w-16 border border-gray-200 rounded-xl px-2 py-2 text-center text-xl" maxLength={4} />
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="اسم المهارة" className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm" />
            </div>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="وصف قصير للمهارة" rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none" />
            {skills.filter(s => s.id !== editingId).length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1.5">مهارات لازم تُتقَن قبل هذي (اختياري):</p>
                <div className="flex flex-wrap gap-1.5">
                  {skills.filter(s => s.id !== editingId).map(s => (
                    <button key={s.id} onClick={() => togglePrereq(s.id)}
                      className={`text-xs px-2.5 py-1 rounded-full border ${form.prerequisites.includes(s.id) ? "bg-violet-600 text-white border-violet-600" : "bg-white text-gray-500 border-gray-200"}`}>
                      {s.emoji} {s.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <button disabled={!form.title.trim() || saving} onClick={submit}
              className="w-full bg-violet-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-violet-500 disabled:opacity-40">
              {saving ? "جارٍ الحفظ..." : editingId ? "حفظ التعديل" : "إضافة المهارة"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

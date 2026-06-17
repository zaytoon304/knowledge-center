"use client";
import { useState, useRef } from "react";
import { Plus, Pencil, Trash2, X, Save, Upload, ChevronDown, ChevronUp, Search } from "lucide-react";

export interface CMSField {
  key: string;
  label: string;
  type: "text" | "textarea" | "select" | "image" | "url" | "date" | "emoji" | "tags";
  options?: string[];
  placeholder?: string;
  required?: boolean;
}

export interface CMSConfig {
  storageKey: string;
  title: string;
  icon: string;
  fields: CMSField[];
  displayField: string;
  subField?: string;
}

export type CMSItem = Record<string, string | string[]>;

function loadData(key: string): CMSItem[] {
  try { const d = localStorage.getItem(key); return d ? JSON.parse(d) : []; } catch { return []; }
}
function saveData(key: string, data: CMSItem[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

const GRADIENTS = [
  "from-blue-700 to-blue-500", "from-purple-700 to-violet-500",
  "from-green-700 to-teal-500", "from-orange-600 to-amber-500",
  "from-red-700 to-rose-500", "from-cyan-700 to-sky-500",
  "from-indigo-700 to-blue-500", "from-pink-700 to-rose-500",
];

export default function SectionCMS({ config }: { config: CMSConfig }) {
  const [items, setItems] = useState<CMSItem[]>(() => loadData(config.storageKey));
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CMSItem | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const imgRef = useRef<HTMLInputElement>(null);

  const makeEmpty = (): CMSItem => {
    const obj: CMSItem = { id: "" };
    config.fields.forEach(f => {
      if (f.type === "tags") obj[f.key] = [];
      else obj[f.key] = f.options?.[0] ?? "";
    });
    return obj;
  };

  const openAdd = () => { setEditing(makeEmpty()); setShowForm(true); };
  const openEdit = (item: CMSItem) => { setEditing({ ...item }); setShowForm(true); };

  const handleDelete = (id: string) => {
    if (!confirm("حذف هذا العنصر نهائياً؟")) return;
    const updated = items.filter(i => i.id !== id);
    saveData(config.storageKey, updated);
    setItems(updated);
  };

  const handleSave = () => {
    if (!editing) return;
    const title = editing[config.displayField] as string;
    if (!title?.trim()) return;
    const item = { ...editing, id: editing.id || Date.now().toString() };
    const isNew = !editing.id;
    const updated = isNew ? [...items, item] : items.map(i => i.id === item.id ? item : i);
    saveData(config.storageKey, updated);
    setItems(updated);
    setShowForm(false);
    setEditing(null);
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    const reader = new FileReader();
    reader.onload = () => setEditing(prev => prev ? ({ ...prev, image: reader.result as string, imageName: file.name }) : prev);
    reader.readAsDataURL(file);
  };

  const setField = (key: string, val: string) =>
    setEditing(prev => prev ? ({ ...prev, [key]: val }) : prev);

  const addTag = (key: string, val: string) => {
    if (!val.trim() || !editing) return;
    const arr = (editing[key] as string[]) ?? [];
    if (!arr.includes(val)) setEditing(prev => prev ? ({ ...prev, [key]: [...arr, val] }) : prev);
  };
  const removeTag = (key: string, idx: number) => {
    if (!editing) return;
    const arr = [...((editing[key] as string[]) ?? [])];
    arr.splice(idx, 1);
    setEditing(prev => prev ? ({ ...prev, [key]: arr }) : prev);
  };

  const filtered = items.filter(i => {
    const title = (i[config.displayField] as string ?? "").toLowerCase();
    return !search || title.includes(search.toLowerCase());
  });

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
          <Search className="w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder={`بحث في ${config.title}...`}
            className="bg-transparent outline-none text-sm flex-1 text-right" />
        </div>
        <span className="text-xs text-gray-400 bg-gray-100 px-3 py-2 rounded-xl">{items.length} عنصر</span>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors">
          <Plus className="w-4 h-4" /> إضافة
        </button>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-3">{config.icon}</p>
          <p className="text-sm">{search ? "لا نتائج" : "لا يوجد محتوى — اضغط إضافة للبدء"}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(item => (
            <div key={item.id as string} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="flex items-center gap-3 p-4">
                {item.image ? (
                  <img src={item.image as string} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-gray-200" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl flex-shrink-0">
                    {(item.emoji as string) || config.icon}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm">{item[config.displayField] as string}</p>
                  {config.subField && <p className="text-xs text-gray-400 truncate mt-0.5">{item[config.subField] as string}</p>}
                  {item.status && (
                    <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${
                      item.status === "نشط" || item.status === "مفتوح" || item.status === "معتمدة" ? "bg-green-100 text-green-700" :
                      item.status === "قادم" || item.status === "قيد التنفيذ" ? "bg-yellow-100 text-yellow-700" :
                      "bg-gray-100 text-gray-500"
                    }`}>{item.status as string}</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setExpandedId(expandedId === item.id ? null : item.id as string)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                    {expandedId === item.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  <button onClick={() => openEdit(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(item.id as string)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {expandedId === item.id && (
                <div className="border-t border-gray-100 p-4 bg-gray-50 space-y-2">
                  {config.fields.filter(f => f.type !== "image").map(f => {
                    const val = item[f.key];
                    if (!val || (Array.isArray(val) && val.length === 0)) return null;
                    return (
                      <div key={f.key}>
                        <span className="text-xs font-semibold text-gray-500">{f.label}: </span>
                        {Array.isArray(val) ? (
                          <div className="flex gap-1 flex-wrap mt-1">
                            {val.map((v, i) => <span key={i} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{v}</span>)}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-700">{val as string}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showForm && editing && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl my-4">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">
                {editing.id ? `تعديل` : `إضافة`} — {config.title}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-xl">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {config.fields.map(field => (
                <div key={field.key}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>

                  {field.type === "text" && (
                    <input value={(editing[field.key] as string) ?? ""}
                      onChange={e => setField(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 outline-none focus:border-blue-400 text-right" />
                  )}

                  {field.type === "textarea" && (
                    <textarea value={(editing[field.key] as string) ?? ""}
                      onChange={e => setField(field.key, e.target.value)}
                      rows={3} placeholder={field.placeholder}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 outline-none focus:border-blue-400 text-right resize-none" />
                  )}

                  {field.type === "select" && (
                    <select value={(editing[field.key] as string) ?? field.options?.[0]}
                      onChange={e => setField(field.key, e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-blue-400">
                      {field.options?.map(o => <option key={o}>{o}</option>)}
                    </select>
                  )}

                  {field.type === "emoji" && (
                    <div className="space-y-2">
                      <input value={(editing[field.key] as string) ?? ""}
                        onChange={e => setField(field.key, e.target.value)}
                        placeholder="🤖"
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 outline-none focus:border-blue-400 text-right" />
                      <div className="flex gap-2 flex-wrap">
                        {["🤖", "🏆", "🧠", "🔬", "💡", "🚀", "⭐", "📚", "🎯", "🌟", "🎓", "🔭", "💻", "🎮", "🌱", "⚡"].map(e => (
                          <button key={e} onClick={() => setField(field.key, e)}
                            className={`w-9 h-9 rounded-xl text-xl flex items-center justify-center hover:bg-gray-100 transition-colors ${editing[field.key] === e ? "bg-blue-100 ring-2 ring-blue-400" : ""}`}>
                            {e}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {field.type === "url" && (
                    <input type="url" value={(editing[field.key] as string) ?? ""}
                      onChange={e => setField(field.key, e.target.value)}
                      placeholder={field.placeholder ?? "https://..."}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 outline-none focus:border-blue-400" />
                  )}

                  {field.type === "date" && (
                    <input type="date" value={(editing[field.key] as string) ?? ""}
                      onChange={e => setField(field.key, e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-blue-400" />
                  )}

                  {field.type === "image" && (
                    <div className="space-y-2">
                      <button onClick={() => imgRef.current?.click()}
                        className="flex items-center gap-2 border border-dashed border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 w-full justify-center transition-colors">
                        <Upload className="w-4 h-4" />
                        {editing.imageName ? `تغيير: ${editing.imageName}` : "رفع صورة"}
                      </button>
                      {editing.image && (
                        <div className="relative inline-block">
                          <img src={editing.image as string} alt="" className="w-24 h-20 object-cover rounded-xl border border-gray-200" />
                          <button onClick={() => setEditing(prev => prev ? ({ ...prev, image: "", imageName: "" }) : prev)}
                            className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                      <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
                    </div>
                  )}

                  {field.type === "tags" && (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input id={`tag-input-${field.key}`} placeholder={field.placeholder ?? "أضف ثم Enter"}
                          className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 outline-none focus:border-blue-400 text-right"
                          onKeyDown={e => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              const inp = e.currentTarget;
                              addTag(field.key, inp.value);
                              inp.value = "";
                            }
                          }} />
                        <button onClick={() => {
                          const inp = document.getElementById(`tag-input-${field.key}`) as HTMLInputElement;
                          if (inp) { addTag(field.key, inp.value); inp.value = ""; }
                        }} className="px-3 py-2 bg-blue-700 text-white rounded-xl text-sm hover:bg-blue-600">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {((editing[field.key] as string[]) ?? []).map((tag, i) => (
                          <span key={i} className="flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded-full">
                            {tag}
                            <button onClick={() => removeTag(field.key, i)} className="hover:text-red-600"><X className="w-3 h-3" /></button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Gradient picker if needed */}
              {config.fields.some(f => f.key === "gradient") && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2">لون التدرج</label>
                  <div className="flex gap-2 flex-wrap">
                    {GRADIENTS.map(g => (
                      <button key={g} onClick={() => setField("gradient", g)}
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${g} transition-all ${editing.gradient === g ? "ring-2 ring-offset-2 ring-blue-500 scale-110" : ""}`} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 p-5 border-t border-gray-100">
              <button onClick={() => setShowForm(false)}
                className="px-5 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
                إلغاء
              </button>
              <button onClick={handleSave}
                disabled={!(editing[config.displayField] as string)?.trim()}
                className="flex items-center gap-2 bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-blue-600 disabled:opacity-50">
                <Save className="w-4 h-4" />
                {editing.id ? "حفظ التعديلات" : "إضافة"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

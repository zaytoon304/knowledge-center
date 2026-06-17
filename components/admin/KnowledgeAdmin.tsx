"use client";
import { useState, useEffect, useRef } from "react";
import {
  BookOpen, FileText, Shield, ClipboardList, Calendar,
  Plus, Pencil, Trash2, X, Save, Upload, Link, Eye,
  Search, ChevronDown, ChevronUp
} from "lucide-react";

export interface KnowledgeItem {
  id: string;
  title: string;
  description: string;
  date: string;
  department: string;
  version?: string;
  category?: string;
  steps?: string[];
  status?: string;
  pdfBase64?: string;
  pdfName?: string;
  images?: string[];
  videoUrl?: string;
  type: "guide" | "form" | "policy" | "procedure" | "plan";
}

const KEYS: Record<string, string> = {
  guide: "kc_knowledge_guides",
  form: "kc_knowledge_forms",
  policy: "kc_knowledge_policies",
  procedure: "kc_knowledge_procedures",
  plan: "kc_knowledge_plans",
};

const SUBTABS = [
  { id: "guide", label: "الأدلة", icon: BookOpen, color: "blue" },
  { id: "form", label: "النماذج", icon: FileText, color: "green" },
  { id: "policy", label: "السياسات", icon: Shield, color: "purple" },
  { id: "procedure", label: "الإجراءات", icon: ClipboardList, color: "orange" },
  { id: "plan", label: "الخطط", icon: Calendar, color: "indigo" },
];

const DEPARTMENTS = [
  "قيادة الوحدة", "الشؤون التعليمية", "قسم المسابقات",
  "قسم المشاريع", "قسم الجودة", "قسم التقنية",
  "قسم الموهبة", "قسم الابتكار", "إدارة المدرسة", "أخرى",
];

const FORM_CATEGORIES = ["التخطيط", "التقارير", "الموهبة", "اللوجستيات", "المسابقات", "التقييم", "الإدارة", "المؤشرات", "أخرى"];
const FILE_TYPES = ["PDF", "Word", "Excel", "PowerPoint", "صورة", "أخرى"];

function loadItems(type: string): KnowledgeItem[] {
  try {
    const d = localStorage.getItem(KEYS[type]);
    return d ? JSON.parse(d) : [];
  } catch { return []; }
}

function saveItems(type: string, items: KnowledgeItem[]) {
  localStorage.setItem(KEYS[type], JSON.stringify(items));
}

const emptyItem = (type: KnowledgeItem["type"]): KnowledgeItem => ({
  id: "",
  title: "",
  description: "",
  date: new Date().toISOString().split("T")[0],
  department: DEPARTMENTS[0],
  version: "1.0",
  category: type === "form" ? FORM_CATEGORIES[0] : undefined,
  steps: type === "procedure" ? [""] : undefined,
  status: type === "plan" ? "معتمدة" : undefined,
  pdfBase64: undefined,
  pdfName: undefined,
  images: [],
  videoUrl: "",
  type,
});

export default function KnowledgeAdmin() {
  const [activeType, setActiveType] = useState<KnowledgeItem["type"]>("guide");
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<KnowledgeItem | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setItems(loadItems(activeType));
    setShowForm(false);
    setEditing(null);
    setExpandedId(null);
    setSearch("");
  }, [activeType]);

  const openAdd = () => {
    setEditing(emptyItem(activeType));
    setShowForm(true);
  };

  const openEdit = (item: KnowledgeItem) => {
    setEditing({ ...item, steps: item.steps ?? [""], images: item.images ?? [] });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm("هل تريد حذف هذا العنصر نهائياً؟")) return;
    const updated = items.filter(i => i.id !== id);
    saveItems(activeType, updated);
    setItems(updated);
  };

  const handleSave = () => {
    if (!editing || !editing.title.trim()) return;
    setSaving(true);
    const isNew = !editing.id;
    const item: KnowledgeItem = {
      ...editing,
      id: editing.id || Date.now().toString(),
      steps: activeType === "procedure" ? (editing.steps ?? []).filter(s => s.trim()) : undefined,
    };
    const updated = isNew ? [...items, item] : items.map(i => i.id === item.id ? item : i);
    saveItems(activeType, updated);
    setItems(updated);
    setShowForm(false);
    setEditing(null);
    setSaving(false);
  };

  const handlePdf = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    const reader = new FileReader();
    reader.onload = () => setEditing(prev => prev ? ({ ...prev, pdfBase64: reader.result as string, pdfName: file.name }) : prev);
    reader.readAsDataURL(file);
  };

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length || !editing) return;
    const readers = files.map(file => new Promise<string>(res => {
      const r = new FileReader();
      r.onload = () => res(r.result as string);
      r.readAsDataURL(file);
    }));
    Promise.all(readers).then(newImgs => {
      setEditing(prev => prev ? ({ ...prev, images: [...(prev.images ?? []), ...newImgs] }) : prev);
    });
  };

  const removeImage = (idx: number) => {
    if (!editing) return;
    setEditing(prev => prev ? ({ ...prev, images: (prev.images ?? []).filter((_, i) => i !== idx) }) : prev);
  };

  const addStep = () => setEditing(prev => prev ? ({ ...prev, steps: [...(prev.steps ?? []), ""] }) : prev);
  const updateStep = (idx: number, val: string) => setEditing(prev => {
    if (!prev) return prev;
    const steps = [...(prev.steps ?? [])];
    steps[idx] = val;
    return { ...prev, steps };
  });
  const removeStep = (idx: number) => setEditing(prev => prev ? ({ ...prev, steps: (prev.steps ?? []).filter((_, i) => i !== idx) }) : prev);

  const filtered = items.filter(i => i.title.toLowerCase().includes(search.toLowerCase()) || i.description.toLowerCase().includes(search.toLowerCase()));

  const tab = SUBTABS.find(t => t.id === activeType)!;

  return (
    <div className="space-y-4">
      {/* Sub-tabs */}
      <div className="flex flex-wrap gap-2">
        {SUBTABS.map(t => (
          <button key={t.id} onClick={() => setActiveType(t.id as KnowledgeItem["type"])}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${activeType === t.id ? "bg-blue-700 text-white border-blue-700 shadow" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}>
            <t.icon className="w-4 h-4" />
            {t.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeType === t.id ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
              {loadItems(t.id).length}
            </span>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
          <Search className="w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder={`بحث في ${tab.label}...`}
            className="bg-transparent outline-none text-sm flex-1 text-right" />
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors">
          <Plus className="w-4 h-4" />
          إضافة {activeType === "guide" ? "دليل" : activeType === "form" ? "نموذج" : activeType === "policy" ? "سياسة" : activeType === "procedure" ? "إجراء" : "خطة"}
        </button>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <tab.icon className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">لا يوجد محتوى — اضغط "إضافة" لبدء الإضافة</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(item => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="flex items-center gap-3 p-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <tab.icon className="w-5 h-5 text-blue-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm">{item.title}</p>
                  <p className="text-xs text-gray-400 truncate">{item.description}</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {item.department && <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{item.department}</span>}
                    {item.version && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">v{item.version}</span>}
                    {item.date && <span className="text-xs text-gray-400">{item.date}</span>}
                    {item.pdfName && <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full">📄 {item.pdfName}</span>}
                    {(item.images?.length ?? 0) > 0 && <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">🖼️ {item.images!.length} صورة</span>}
                    {item.videoUrl && <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">🎬 فيديو</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    {expandedId === item.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  <button onClick={() => openEdit(item)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(item.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {expandedId === item.id && (
                <div className="border-t border-gray-100 p-4 bg-gray-50 space-y-3">
                  {item.description && <p className="text-sm text-gray-600">{item.description}</p>}
                  {item.steps && item.steps.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-1">الخطوات:</p>
                      <ol className="list-decimal list-inside space-y-1">
                        {item.steps.map((s, i) => <li key={i} className="text-sm text-gray-700">{s}</li>)}
                      </ol>
                    </div>
                  )}
                  {item.images && item.images.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {item.images.map((img, i) => (
                        <img key={i} src={img} alt="" className="w-24 h-20 object-cover rounded-lg border border-gray-200" />
                      ))}
                    </div>
                  )}
                  {item.pdfBase64 && (
                    <a href={item.pdfBase64} download={item.pdfName}
                      className="inline-flex items-center gap-2 bg-red-700 text-white px-4 py-2 rounded-xl text-sm hover:bg-red-600 transition-colors">
                      📄 تحميل {item.pdfName}
                    </a>
                  )}
                  {item.videoUrl && (
                    <a href={item.videoUrl} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-purple-700 text-white px-4 py-2 rounded-xl text-sm hover:bg-purple-600 transition-colors">
                      🎬 مشاهدة الفيديو
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && editing && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-4">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <tab.icon className="w-5 h-5 text-blue-700" />
                {editing.id ? "تعديل" : "إضافة"} {tab.label.slice(0, -1) === "الأدلة" ? "دليل" : tab.label}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-xl">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">العنوان *</label>
                <input value={editing.title} onChange={e => setEditing(prev => prev ? ({ ...prev, title: e.target.value }) : prev)}
                  placeholder="اكتب عنوان الدليل/النموذج..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 outline-none focus:border-blue-400 text-right" />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">الوصف</label>
                <textarea value={editing.description} onChange={e => setEditing(prev => prev ? ({ ...prev, description: e.target.value }) : prev)}
                  rows={3} placeholder="وصف مختصر..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 outline-none focus:border-blue-400 text-right resize-none" />
              </div>

              {/* Department + Date row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">القسم/الجهة</label>
                  <select value={editing.department} onChange={e => setEditing(prev => prev ? ({ ...prev, department: e.target.value }) : prev)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-blue-400">
                    {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">التاريخ</label>
                  <input type="date" value={editing.date} onChange={e => setEditing(prev => prev ? ({ ...prev, date: e.target.value }) : prev)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-blue-400" />
                </div>
              </div>

              {/* Guide-specific: version */}
              {(activeType === "guide" || activeType === "plan") && (
                <div className="grid grid-cols-2 gap-3">
                  {activeType === "guide" && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">رقم الإصدار</label>
                      <input value={editing.version ?? ""} onChange={e => setEditing(prev => prev ? ({ ...prev, version: e.target.value }) : prev)}
                        placeholder="مثال: 2.0"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-blue-400 text-right" />
                    </div>
                  )}
                  {activeType === "plan" && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">الحالة</label>
                      <select value={editing.status ?? "معتمدة"} onChange={e => setEditing(prev => prev ? ({ ...prev, status: e.target.value }) : prev)}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-blue-400">
                        <option>معتمدة</option>
                        <option>قيد التنفيذ</option>
                        <option>قيد المراجعة</option>
                        <option>موقوفة</option>
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Form-specific: category + file type */}
              {activeType === "form" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">التصنيف</label>
                    <select value={editing.category ?? FORM_CATEGORIES[0]} onChange={e => setEditing(prev => prev ? ({ ...prev, category: e.target.value }) : prev)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-blue-400">
                      {FORM_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">نوع الملف</label>
                    <select value={editing.version ?? "PDF"} onChange={e => setEditing(prev => prev ? ({ ...prev, version: e.target.value }) : prev)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-blue-400">
                      {FILE_TYPES.map(f => <option key={f}>{f}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {/* Procedure-specific: steps */}
              {activeType === "procedure" && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-gray-600">خطوات الإجراء</label>
                    <button onClick={addStep} className="flex items-center gap-1 text-xs text-blue-700 hover:underline">
                      <Plus className="w-3 h-3" /> إضافة خطوة
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(editing.steps ?? [""]).map((step, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full text-xs flex items-center justify-center font-bold flex-shrink-0">{idx + 1}</span>
                        <input value={step} onChange={e => updateStep(idx, e.target.value)}
                          placeholder={`الخطوة ${idx + 1}...`}
                          className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 outline-none focus:border-blue-400 text-right" />
                        <button onClick={() => removeStep(idx)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PDF Upload */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">ملف PDF أو مستند</label>
                <div className="flex items-center gap-3">
                  <button onClick={() => fileRef.current?.click()}
                    className="flex items-center gap-2 border border-dashed border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors">
                    <Upload className="w-4 h-4" /> {editing.pdfName ? "تغيير الملف" : "رفع ملف"}
                  </button>
                  {editing.pdfName && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-green-700 bg-green-50 px-3 py-1 rounded-full">📄 {editing.pdfName}</span>
                      <button onClick={() => setEditing(prev => prev ? ({ ...prev, pdfBase64: undefined, pdfName: undefined }) : prev)}
                        className="text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                  className="hidden" onChange={handlePdf} />
              </div>

              {/* Images */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">صور (يمكن إضافة أكثر من صورة)</label>
                <button onClick={() => imgRef.current?.click()}
                  className="flex items-center gap-2 border border-dashed border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors w-full justify-center">
                  <Upload className="w-4 h-4" /> رفع صور
                </button>
                <input ref={imgRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImages} />
                {(editing.images ?? []).length > 0 && (
                  <div className="flex gap-2 flex-wrap mt-2">
                    {(editing.images ?? []).map((img, i) => (
                      <div key={i} className="relative group">
                        <img src={img} alt="" className="w-20 h-16 object-cover rounded-lg border border-gray-200" />
                        <button onClick={() => removeImage(i)}
                          className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Video URL */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">رابط فيديو (YouTube أو غيره)</label>
                <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 bg-gray-50 focus-within:border-blue-400">
                  <Link className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <input value={editing.videoUrl ?? ""} onChange={e => setEditing(prev => prev ? ({ ...prev, videoUrl: e.target.value }) : prev)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="flex-1 bg-transparent py-2.5 text-sm outline-none text-right" />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100">
              <button onClick={() => setShowForm(false)}
                className="px-5 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
                إلغاء
              </button>
              <button onClick={handleSave} disabled={!editing.title.trim() || saving}
                className="flex items-center gap-2 bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50">
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

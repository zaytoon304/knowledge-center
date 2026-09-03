"use client";
import { useState, useEffect } from "react";
import { Gavel, Plus, Trash2, ImagePlus, VideoIcon, X, CheckCircle2, Phone, ExternalLink } from "lucide-react";
import { AuctionItem, AuctionState, getAuctions, saveAuctions, initAuctionState, getAuctionState, markDelivered } from "@/lib/auction";

const EMPTY_FORM = {
  title: "", studentName: "", description: "",
  image: "", video: "",
  executionCost: "", startingPrice: "", bidIncrement: "10",
  startAt: "", endAt: "",
};

const MAX_VIDEO_BYTES = 15 * 1024 * 1024;

function toLocalInputValue(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function AuctionAdmin() {
  const [auctions, setAuctions] = useState<AuctionItem[]>([]);
  const [states, setStates] = useState<Record<string, AuctionState | null>>({});
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const refresh = async () => {
    const list = await getAuctions();
    setAuctions(list);
    const entries = await Promise.all(list.map(async a => [a.id, await getAuctionState(a.id)] as const));
    setStates(Object.fromEntries(entries));
  };

  useEffect(() => { refresh(); }, []);

  const onImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = ev => setForm(prev => ({ ...prev, image: ev.target?.result as string }));
    r.readAsDataURL(f);
    e.target.value = "";
  };

  const onVideo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > MAX_VIDEO_BYTES) { alert("⚠️ حجم الفيديو أكبر من 15 ميجا — اختر فيديو أصغر"); return; }
    const r = new FileReader();
    r.onload = ev => setForm(prev => ({ ...prev, video: ev.target?.result as string }));
    r.readAsDataURL(f);
    e.target.value = "";
  };

  const createAuction = async () => {
    if (!form.title.trim() || !form.studentName.trim() || !form.image || !form.startingPrice || !form.startAt || !form.endAt) {
      alert("⚠️ عبّي الحقول الأساسية: العنوان، اسم الطالب، صورة، سعر الافتتاح، تاريخ البداية والنهاية");
      return;
    }
    setSaving(true);
    const item: AuctionItem = {
      id: Date.now().toString(),
      title: form.title.trim(),
      studentName: form.studentName.trim(),
      description: form.description.trim(),
      image: form.image,
      video: form.video,
      executionCost: Number(form.executionCost) || 0,
      startingPrice: Number(form.startingPrice),
      bidIncrement: Number(form.bidIncrement) || 10,
      startAt: new Date(form.startAt).toISOString(),
      endAt: new Date(form.endAt).toISOString(),
      createdAt: new Date().toISOString(),
    };
    await saveAuctions([...auctions, item]);
    await initAuctionState(item);
    setForm(EMPTY_FORM);
    setShowForm(false);
    setSaving(false);
    refresh();
  };

  const deleteAuction = async (id: string) => {
    if (!confirm("حذف هذا المزاد نهائياً؟ ما يُحذف تلقائياً سجل المزايدات، بس يختفي من صفحة المزاد العامة.")) return;
    await saveAuctions(auctions.filter(a => a.id !== id));
    refresh();
  };

  const toggleDelivered = async (id: string, current: boolean) => {
    await markDelivered(id, !current);
    refresh();
  };

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-gray-800 flex items-center gap-2"><Gavel className="w-5 h-5 text-amber-600" /> مزاد مشاريع الطلاب</h2>
          <p className="text-xs text-gray-400 mt-1">
            رابط المزاد العام (شاركه مع الأهالي): <code className="bg-gray-100 px-1.5 py-0.5 rounded">/auction</code>
          </p>
        </div>
        <button onClick={() => setShowForm(s => !s)} className="flex items-center gap-1.5 bg-amber-700 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-amber-600">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />} {showForm ? "إلغاء" : "مزاد جديد"}
        </button>
      </div>

      {showForm && (
        <div className="card p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">عنوان المشروع *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="مثال: جهاز اكتشاف الغاز في المطابخ"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-amber-500" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">اسم الطالب *</label>
              <input value={form.studentName} onChange={e => setForm(f => ({ ...f, studentName: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-amber-500" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">وصف المشروع</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-amber-500 resize-none" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">صورة المشروع *</label>
              <label className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 cursor-pointer hover:border-amber-500">
                <ImagePlus className="w-4 h-4 text-amber-600" />
                <span className="truncate">{form.image ? "✓ تم اختيار صورة" : "اختر صورة"}</span>
                <input type="file" accept="image/*" onChange={onImage} className="hidden" />
              </label>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">فيديو المشروع (اختياري، حتى 15 ميجا)</label>
              <label className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 cursor-pointer hover:border-amber-500">
                <VideoIcon className="w-4 h-4 text-amber-600" />
                <span className="truncate">{form.video ? "✓ تم اختيار فيديو" : "اختر فيديو"}</span>
                <input type="file" accept="video/*" onChange={onVideo} className="hidden" />
              </label>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">تكلفة التنفيذ (ريال)</label>
              <input type="number" value={form.executionCost} onChange={e => setForm(f => ({ ...f, executionCost: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-amber-500" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">سعر الافتتاح (ريال) *</label>
              <input type="number" value={form.startingPrice} onChange={e => setForm(f => ({ ...f, startingPrice: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-amber-500" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">قيمة رفع السعر (ريال)</label>
              <input type="number" value={form.bidIncrement} onChange={e => setForm(f => ({ ...f, bidIncrement: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-amber-500" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">بداية المزاد *</label>
              <input type="datetime-local" value={form.startAt} onChange={e => setForm(f => ({ ...f, startAt: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-amber-500" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">نهاية المزاد *</label>
              <input type="datetime-local" value={form.endAt} onChange={e => setForm(f => ({ ...f, endAt: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-amber-500" />
            </div>
          </div>
          <button onClick={createAuction} disabled={saving} className="w-full bg-amber-700 text-white py-3 rounded-xl text-sm font-bold hover:bg-amber-600 disabled:opacity-50">
            {saving ? "جارٍ الحفظ..." : "نشر المزاد"}
          </button>
        </div>
      )}

      <div className="space-y-3">
        {auctions.length === 0 && <p className="text-sm text-gray-400 text-center py-6">ما فيه مزادات بعد.</p>}
        {auctions.map(a => {
          const state = states[a.id];
          return (
            <div key={a.id} className="card p-4">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.image} alt={a.title} className="w-16 h-16 object-cover rounded-xl flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 truncate">{a.title}</h3>
                  <p className="text-xs text-gray-500">{a.studentName} • السعر الحالي: {state?.currentPrice ?? a.startingPrice} ريال • {(state?.bids || []).length} مزايدة</p>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <button onClick={() => setExpanded(expanded === a.id ? null : a.id)} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1.5 rounded-lg hover:bg-gray-200">التفاصيل</button>
                  <button onClick={() => deleteAuction(a.id)} className="text-xs bg-red-50 text-red-600 px-2.5 py-1.5 rounded-lg hover:bg-red-100"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              {expanded === a.id && (
                <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                  {state?.leaderName && (
                    <div className="flex items-center justify-between bg-green-50 rounded-lg p-2.5 text-xs">
                      <span className="font-semibold text-green-800">المتصدر الحالي: {state.leaderName}</span>
                      <a href={`tel:${state.leaderPhone}`} className="flex items-center gap-1 text-green-700"><Phone className="w-3.5 h-3.5" /> {state.leaderPhone}</a>
                    </div>
                  )}
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {(state?.bids || []).slice().reverse().map((b, i) => (
                      <div key={i} className="flex items-center justify-between text-xs text-gray-500 bg-gray-50 rounded px-2 py-1">
                        <span>{b.name} — {b.phone}</span>
                        <span className="font-semibold">{b.amount} ريال</span>
                      </div>
                    ))}
                    {(!state?.bids || state.bids.length === 0) && <p className="text-xs text-gray-400 text-center py-2">ما فيه مزايدات بعد</p>}
                  </div>
                  <button onClick={() => toggleDelivered(a.id, state?.delivered || false)}
                    className={`w-full flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg font-semibold ${state?.delivered ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" /> {state?.delivered ? "✓ تم تسليم المنتج" : "تعليم كـ«تم التسليم»"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <a href="/auction" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 text-xs text-amber-700 hover:underline">
        <ExternalLink className="w-3.5 h-3.5" /> فتح صفحة المزاد العامة
      </a>
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { History, ChevronRight, ChevronDown, Copy, Trash2, Printer, Inbox } from "lucide-react";
import { useAiOwner, getAiHistory, deleteAiHistoryItem, AiHistoryItem } from "@/lib/aiHistory";

const TOOL_COLOR: Record<string, string> = {
  "lesson-plan": "bg-violet-100 text-violet-700",
  "question-generator": "bg-blue-100 text-blue-700",
  "worksheet": "bg-emerald-100 text-emerald-700",
  "mind-map": "bg-amber-100 text-amber-700",
  "activity-generator": "bg-pink-100 text-pink-700",
  "competition-generator": "bg-red-100 text-red-700",
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" }) +
    " — " + d.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" });
}

export default function AiHistoryPage() {
  const { ownerId, ownerLabel } = useAiOwner();
  const [items, setItems] = useState<AiHistoryItem[] | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (ownerId) getAiHistory(ownerId).then(setItems);
  }, [ownerId]);

  const copyItem = (item: AiHistoryItem) => {
    navigator.clipboard.writeText(item.textExport);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const deleteItem = async (id: string) => {
    if (!ownerId) return;
    if (!confirm("حذف هذا العنصر من سجلك نهائياً؟")) return;
    await deleteAiHistoryItem(ownerId, id);
    setItems(prev => prev?.filter(i => i.id !== id) ?? null);
  };

  const printItem = (item: AiHistoryItem) => {
    setExpanded(item.id);
    document.body.classList.add("printing-only");
    setTimeout(() => { window.print(); setTimeout(() => document.body.classList.remove("printing-only"), 500); }, 50);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="no-print flex items-center gap-2 text-xs text-gray-400">
        <Link href="/ai-tools" className="hover:text-violet-600 flex items-center gap-1">
          <ChevronRight className="w-3.5 h-3.5" /> أدوات الذكاء الاصطناعي
        </Link>
        <span>/</span>
        <span className="text-gray-600">سجل أعمالي</span>
      </div>

      <div className="no-print card p-5 bg-gradient-to-l from-slate-800 to-slate-600 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <History className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">سجل أعمالي</h1>
            <p className="text-white/90 text-sm">
              {ownerLabel ? `كل ما حفظته من أدوات الذكاء الاصطناعي، يا ${ownerLabel}` : "كل ما تحفظه من نتائج أدوات الذكاء الاصطناعي يظهر هنا"}
            </p>
          </div>
        </div>
      </div>

      {!ownerId && (
        <div className="card p-8 text-center text-gray-500 text-sm">
          سجّل دخولك كمعلم أو منسّق (أو كأدمن) لعرض سجل أعمالك المحفوظة.
        </div>
      )}

      {ownerId && items === null && (
        <div className="card p-8 text-center text-gray-400 text-sm">جارٍ التحميل...</div>
      )}

      {ownerId && items !== null && items.length === 0 && (
        <div className="card p-10 text-center text-gray-400">
          <Inbox className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p className="text-sm">لسه ما حفظت شي. أي نتيجة تولّدها بأي أداة، اضغط "حفظ بسجلي" وتلقاها هنا.</p>
        </div>
      )}

      {ownerId && items !== null && items.length > 0 && (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className={expanded === item.id ? "print-area card p-5" : "card p-5"}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${TOOL_COLOR[item.tool] || "bg-gray-100 text-gray-600"}`}>
                      {item.toolLabel}
                    </span>
                    <span className="text-[11px] text-gray-400">{formatDate(item.createdAt)}</span>
                  </div>
                  <h3 className="font-bold text-gray-800">{item.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{item.subject} • {item.grade}</p>
                </div>
                <div className="no-print flex gap-2 flex-shrink-0">
                  <button onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                    className="flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-200">
                    {expanded === item.id ? <ChevronDown className="w-3.5 h-3.5 rotate-180" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    {expanded === item.id ? "إخفاء" : "عرض"}
                  </button>
                  <button onClick={() => copyItem(item)}
                    className="flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-200">
                    <Copy className="w-3.5 h-3.5" /> {copiedId === item.id ? "تم ✓" : "نسخ"}
                  </button>
                  <button onClick={() => printItem(item)}
                    className="flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-200">
                    <Printer className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => deleteItem(item.id)}
                    className="flex items-center gap-1 text-xs bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              {expanded === item.id && (
                <pre className="mt-4 bg-gray-50 rounded-xl p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed" style={{ fontFamily: "inherit" }}>
                  {item.textExport}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

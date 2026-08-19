"use client";
import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Users, Send } from "lucide-react";
import { cloudGet } from "@/lib/cloud";

interface Competition { id: string; title: string; mandatory?: string; deadline?: string }
interface ParticipationEntry {
  coordinatorId: string; coordinatorName: string;
  participating: "نعم" | "لا";
  projectType: string; topic: string; code: string;
  submittedAt: string;
}

function loadCompetitions(): Competition[] {
  try { const d = localStorage.getItem("kc_competitions"); return d ? JSON.parse(d) : []; } catch { return []; }
}

export default function CompetitionParticipation() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [entriesMap, setEntriesMap] = useState<Record<string, ParticipationEntry[]>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    setCompetitions(loadCompetitions());
    cloudGet<Competition[]>("kc_competitions").then(data => { if (Array.isArray(data)) setCompetitions(data); });
  }, []);

  const toggle = async (comp: Competition) => {
    if (expandedId === comp.id) { setExpandedId(null); return; }
    setExpandedId(comp.id);
    if (!entriesMap[comp.id]) {
      setLoadingId(comp.id);
      const data = await cloudGet<ParticipationEntry[]>(`kc_comp_participation_${comp.id}`);
      setEntriesMap(prev => ({ ...prev, [comp.id]: Array.isArray(data) ? data : [] }));
      setLoadingId(null);
    }
  };

  return (
    <div className="card p-5 space-y-3">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center"><Send className="w-5 h-5 text-violet-700" /></div>
        <div><h3 className="font-bold text-gray-800">مشاركات المنسقين بالمسابقات</h3><p className="text-xs text-gray-400">اضغط على أي مسابقة لعرض من أرسل مشاركته ومشروعه</p></div>
      </div>
      {competitions.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-4">لا توجد مسابقات بعد</p>
      ) : (
        <div className="space-y-2">
          {competitions.map(c => (
            <div key={c.id} className="border border-gray-100 rounded-xl overflow-hidden">
              <button onClick={() => toggle(c)} className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 text-sm">
                <span className="font-semibold text-gray-700 flex items-center gap-2">
                  {c.title}
                  {c.mandatory === "إلزامي" && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">إلزامي</span>}
                </span>
                {expandedId === c.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </button>
              {expandedId === c.id && (
                <div className="p-3 space-y-2">
                  {loadingId === c.id ? (
                    <p className="text-xs text-gray-400 text-center py-3">جارٍ التحميل...</p>
                  ) : (entriesMap[c.id] || []).length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-3 flex items-center justify-center gap-1.5"><Users className="w-3.5 h-3.5" /> لا يوجد منسّقون سجّلوا مشاركتهم بعد</p>
                  ) : (
                    (entriesMap[c.id] || []).map(e => (
                      <div key={e.coordinatorId} className="bg-white border border-gray-100 rounded-xl p-3 text-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-gray-800">{e.coordinatorName}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${e.participating === "نعم" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                            {e.participating === "نعم" ? "✓ مشارك" : "غير مشارك"}
                          </span>
                        </div>
                        {e.participating === "نعم" && (
                          <div className="text-xs text-gray-500 space-y-1 mt-2">
                            {e.projectType && <p><strong className="text-gray-600">نوع المشروع:</strong> {e.projectType}</p>}
                            {e.topic && <p><strong className="text-gray-600">عن ماذا يتحدث:</strong> {e.topic}</p>}
                            {e.code && <pre dir="ltr" className="bg-gray-900 text-green-300 text-[10px] p-2 rounded-lg overflow-x-auto mt-1">{e.code}</pre>}
                          </div>
                        )}
                        <p className="text-[10px] text-gray-300 mt-1">{new Date(e.submittedAt).toLocaleString("ar-SA")}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
import { Trophy, Calendar, Search, Globe, ChevronDown, ChevronUp, ExternalLink, ClipboardList, Users, ImageIcon, Building2, X, Send, AlertTriangle, CheckCircle } from "lucide-react";
import { cloudGet, cloudTransact } from "@/lib/cloud";
import { useAuth } from "@/contexts/AuthContext";

interface Competition {
  id: string; title: string; description: string; type: string;
  subject: string; date: string; status: string; organizer?: string;
  rules?: string; participants?: string[]; prepPhotos?: string[];
  registrationLink?: string; tags?: string[]; image?: string;
  mandatory?: string; deadline?: string;
}

interface ParticipationEntry {
  coordinatorId: string; coordinatorName: string;
  participating: "نعم" | "لا";
  projectType: string; topic: string; code: string;
  submittedAt: string;
}

function load(): Competition[] {
  try { const d = localStorage.getItem("kc_competitions"); return d ? JSON.parse(d) : []; } catch { return []; }
}

const statusColor = (s: string) =>
  s === "مفتوح" ? "bg-green-100 text-green-700" :
  s === "قادم" ? "bg-yellow-100 text-yellow-700" :
  "bg-gray-100 text-gray-500";

const typeColor = (t: string) =>
  t === "دولية" ? "bg-blue-100 text-blue-700" :
  t === "وطنية" ? "bg-purple-100 text-purple-700" :
  t === "محلية" ? "bg-green-100 text-green-700" :
  "bg-gray-100 text-gray-500";

const EMPTY_PFORM = { participating: "نعم" as "نعم" | "لا", projectType: "", topic: "", code: "" };

export default function CompetitionsPage() {
  const { user, isCoordinator } = useAuth();
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState("الكل");

  const [participateFor, setParticipateFor] = useState<Competition | null>(null);
  const [pForm, setPForm] = useState(EMPTY_PFORM);
  const [pLoading, setPLoading] = useState(false);
  const [pSaving, setPSaving] = useState(false);
  const [pSaved, setPSaved] = useState(false);

  const openParticipation = async (comp: Competition) => {
    setParticipateFor(comp);
    setPForm(EMPTY_PFORM);
    setPSaved(false);
    if (!user) return;
    setPLoading(true);
    const list = await cloudGet<ParticipationEntry[]>(`kc_comp_participation_${comp.id}`);
    const mine = Array.isArray(list) ? list.find(e => e.coordinatorId === user.id) : null;
    if (mine) setPForm({ participating: mine.participating, projectType: mine.projectType, topic: mine.topic, code: mine.code });
    setPLoading(false);
  };

  const submitParticipation = async () => {
    if (!participateFor || !user) return;
    setPSaving(true);
    const entry: ParticipationEntry = {
      coordinatorId: user.id,
      coordinatorName: user.name,
      participating: pForm.participating,
      projectType: pForm.projectType,
      topic: pForm.topic,
      code: pForm.code,
      submittedAt: new Date().toISOString(),
    };
    const key = `kc_comp_participation_${participateFor.id}`;
    await cloudTransact<ParticipationEntry[]>(key, current => {
      const list = Array.isArray(current) ? current : [];
      const others = list.filter(e => e.coordinatorId !== user.id);
      return [...others, entry];
    });
    setPSaving(false);
    setPSaved(true);
    setTimeout(() => setParticipateFor(null), 1200);
  };

  useEffect(() => {
    setCompetitions(load());
    cloudGet<Competition[]>("kc_competitions").then(data => {
      if (Array.isArray(data)) { localStorage.setItem("kc_competitions", JSON.stringify(data)); setCompetitions(data); }
    });
  }, []);

  const types = ["الكل", ...Array.from(new Set(competitions.map(c => c.type).filter(Boolean)))];

  const filtered = competitions.filter(c => {
    const matchSearch = !search || c.title.includes(search) || c.description?.includes(search);
    const matchFilter = filter === "الكل" || c.type === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="card p-6 bg-gradient-to-l from-yellow-700 to-amber-500 text-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <Trophy className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">المسابقات والجوائز</h1>
            <p className="text-yellow-100 text-sm">المسابقات المحلية والوطنية والدولية</p>
          </div>
        </div>
        <div className="flex gap-3">
          {[
            { n: competitions.filter(c => c.status === "مفتوح").length, l: "مفتوح للتسجيل" },
            { n: competitions.filter(c => c.status === "قادم").length, l: "قادم" },
            { n: competitions.length, l: "إجمالي" },
          ].map(s => (
            <div key={s.l} className="bg-black/15 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-white">{s.n}</div>
              <div className="text-white/90 text-xs mt-0.5">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2">
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="ابحث في المسابقات..."
            className="bg-transparent outline-none text-sm flex-1 text-right" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {types.map(t => (
            <button key={t} onClick={() => setFilter(t)}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${filter === t ? "bg-yellow-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium text-gray-500">{search ? "لا نتائج مطابقة" : "لا توجد مسابقات بعد"}</p>
          {!search && <p className="text-sm mt-1">يمكن للأدمن إضافة المسابقات من لوحة الإدارة ← المسابقات</p>}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map(comp => (
            <div key={comp.id} className="card overflow-hidden hover:shadow-md transition-shadow">
              {comp.image && <img src={comp.image} alt={comp.title} className="w-full h-40 object-cover" />}
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="font-bold text-gray-800 text-sm leading-tight">{comp.title}</h3>
                  <div className="flex flex-col gap-1">
                    {comp.status && <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(comp.status)}`}>{comp.status}</span>}
                    {comp.type && <span className={`text-xs px-2 py-0.5 rounded-full ${typeColor(comp.type)}`}>{comp.type}</span>}
                    {comp.mandatory === "إلزامي" && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 flex items-center gap-1 font-bold">
                        <AlertTriangle className="w-3 h-3" /> إلزامي
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed mb-3">{comp.description}</p>
                <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-3">
                  {comp.date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {comp.date}</span>}
                  {comp.subject && <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {comp.subject}</span>}
                  {comp.organizer && <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {comp.organizer}</span>}
                  {comp.participants && comp.participants.length > 0 && <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {comp.participants.length} طالب</span>}
                </div>
                {comp.mandatory === "إلزامي" && comp.deadline && (
                  <div className="bg-red-50 border border-red-100 text-red-700 text-xs rounded-xl px-3 py-2 mb-3 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" /> آخر موعد لإرسال مشاركتك: <strong>{comp.deadline}</strong>
                  </div>
                )}
                {comp.tags && comp.tags.length > 0 && (
                  <div className="flex gap-1 flex-wrap mb-3">
                    {comp.tags.map((t, i) => <span key={i} className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">{t}</span>)}
                  </div>
                )}

                {(comp.rules || (comp.participants && comp.participants.length > 0) || (comp.prepPhotos && comp.prepPhotos.length > 0)) && (
                  <button onClick={() => setExpandedId(expandedId === comp.id ? null : comp.id)}
                    className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-yellow-700 hover:text-yellow-800 py-2 mb-2 border-t border-b border-gray-100">
                    {expandedId === comp.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    {expandedId === comp.id ? "إخفاء التفاصيل" : "عرض الشروط والمشاركين والتجهيزات"}
                  </button>
                )}
                {expandedId === comp.id && (
                  <div className="space-y-3 mb-4">
                    {comp.rules && (
                      <div>
                        <p className="text-xs font-bold text-gray-600 flex items-center gap-1.5 mb-1"><ClipboardList className="w-3.5 h-3.5" /> شروط المسابقة</p>
                        <p className="text-xs text-gray-500 whitespace-pre-line leading-relaxed bg-gray-50 rounded-xl p-3">{comp.rules}</p>
                      </div>
                    )}
                    {comp.participants && comp.participants.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-gray-600 flex items-center gap-1.5 mb-1"><Users className="w-3.5 h-3.5" /> الطلاب المشاركون ({comp.participants.length})</p>
                        <div className="flex flex-wrap gap-1.5">
                          {comp.participants.map((p, i) => <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">{p}</span>)}
                        </div>
                      </div>
                    )}
                    {comp.prepPhotos && comp.prepPhotos.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-gray-600 flex items-center gap-1.5 mb-1"><ImageIcon className="w-3.5 h-3.5" /> صور التجهيزات</p>
                        <div className="grid grid-cols-3 gap-2">
                          {comp.prepPhotos.map((src, i) => <img key={i} src={src} alt="" className="w-full h-20 object-cover rounded-lg border border-gray-200" />)}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {isCoordinator && (
                  <button onClick={() => openParticipation(comp)}
                    className="w-full py-2.5 rounded-xl text-white text-sm font-bold bg-violet-700 hover:bg-violet-600 flex items-center justify-center gap-2 transition-colors mb-2">
                    <Send className="w-4 h-4" /> سجّل مشاركتك بهذه المسابقة
                  </button>
                )}
                {comp.registrationLink && (
                  <a href={comp.registrationLink} target="_blank" rel="noopener noreferrer"
                    className="w-full py-2.5 rounded-xl text-white text-sm font-medium bg-yellow-600 hover:bg-yellow-500 flex items-center justify-center gap-2 transition-colors">
                    <ExternalLink className="w-4 h-4" /> سجّل الآن
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* نافذة تسجيل المشاركة */}
      {participateFor && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setParticipateFor(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-800">تسجيل المشاركة — {participateFor.title}</h2>
              <button onClick={() => setParticipateFor(null)} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5 text-gray-400" /></button>
            </div>

            {pLoading ? (
              <div className="p-10 text-center text-gray-400 text-sm">جارٍ التحميل...</div>
            ) : pSaved ? (
              <div className="p-10 text-center space-y-2">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                <p className="font-bold text-gray-700">تم إرسال مشاركتك ✓</p>
              </div>
            ) : (
              <div className="p-5 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">هل ستشارك بهذه المسابقة؟</label>
                  <div className="flex gap-2">
                    {(["نعم", "لا"] as const).map(opt => (
                      <button key={opt} onClick={() => setPForm(p => ({ ...p, participating: opt }))}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${pForm.participating === opt ? "bg-violet-700 text-white border-violet-700" : "bg-gray-50 text-gray-600 border-gray-200"}`}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {pForm.participating === "نعم" && (
                  <>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">نوع المشروع</label>
                      <input value={pForm.projectType} onChange={e => setPForm(p => ({ ...p, projectType: e.target.value }))}
                        placeholder="مثال: نموذج روبوت بيئي"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-violet-400" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">عن ماذا يتحدث المشروع؟</label>
                      <textarea value={pForm.topic} onChange={e => setPForm(p => ({ ...p, topic: e.target.value }))}
                        rows={3} placeholder="فكرة المشروع والمشكلة التي يحلها..."
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-violet-400 resize-y" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">الكود (إن وُجد) <span className="text-gray-400 font-normal">اختياري</span></label>
                      <textarea value={pForm.code} onChange={e => setPForm(p => ({ ...p, code: e.target.value }))}
                        rows={4} dir="ltr" placeholder="// الصق الكود هنا..."
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs bg-gray-50 outline-none focus:border-violet-400 resize-y font-mono" />
                    </div>
                  </>
                )}

                <button onClick={submitParticipation} disabled={pSaving}
                  className="w-full bg-violet-700 text-white py-3 rounded-xl font-bold hover:bg-violet-600 disabled:opacity-50 flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" /> {pSaving ? "جارٍ الإرسال..." : "إرسال المشاركة"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

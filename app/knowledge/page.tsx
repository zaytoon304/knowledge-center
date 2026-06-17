"use client";
import { useState, useEffect } from "react";
import { BookOpen, Download, Eye, Search, FileText, Shield, Calendar, ClipboardList, Filter, X, Link } from "lucide-react";
import { type KnowledgeItem } from "@/components/admin/KnowledgeAdmin";

const KEYS: Record<string, string> = {
  guides: "kc_knowledge_guides",
  forms: "kc_knowledge_forms",
  policies: "kc_knowledge_policies",
  procedures: "kc_knowledge_procedures",
  plans: "kc_knowledge_plans",
};

const TABS = [
  { id: "guides", label: "الأدلة", icon: BookOpen, color: "blue" },
  { id: "forms", label: "النماذج", icon: FileText, color: "green" },
  { id: "policies", label: "السياسات", icon: Shield, color: "red" },
  { id: "procedures", label: "الإجراءات", icon: ClipboardList, color: "orange" },
  { id: "plans", label: "الخطط", icon: Calendar, color: "purple" },
];

function loadItems(key: string): KnowledgeItem[] {
  try { const d = localStorage.getItem(key); return d ? JSON.parse(d) : []; } catch { return []; }
}

function ItemCard({ item, accentColor }: { item: KnowledgeItem; accentColor: string }) {
  const [open, setOpen] = useState(false);
  const [viewImg, setViewImg] = useState<string | null>(null);

  const bgMap: Record<string, string> = {
    blue: "bg-blue-100", green: "bg-green-100", red: "bg-red-100",
    orange: "bg-orange-100", purple: "bg-purple-100",
  };
  const iconMap: Record<string, string> = {
    blue: "text-blue-700", green: "text-green-700", red: "text-red-700",
    orange: "text-orange-700", purple: "text-purple-700",
  };
  const btnMap: Record<string, string> = {
    blue: "bg-blue-800 hover:bg-blue-700", green: "bg-green-700 hover:bg-green-600",
    red: "bg-red-700 hover:bg-red-600", orange: "bg-orange-600 hover:bg-orange-500",
    purple: "bg-purple-700 hover:bg-purple-600",
  };

  const Icon = TABS.find(t => t.color === accentColor)?.icon ?? BookOpen;

  return (
    <>
      <div className="card p-5">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 ${bgMap[accentColor]} rounded-xl flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-5 h-5 ${iconMap[accentColor]}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-800 text-sm mb-1">{item.title}</h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-2">{item.description}</p>
            <div className="flex flex-wrap gap-2 mb-3 text-xs text-gray-400">
              {item.department && <span className={`${bgMap[accentColor]} ${iconMap[accentColor]} px-2 py-0.5 rounded-full font-medium`}>{item.department}</span>}
              {item.version && <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">v{item.version}</span>}
              {item.status && <span className={`px-2 py-0.5 rounded-full ${item.status === "معتمدة" ? "bg-green-100 text-green-700" : item.status === "قيد التنفيذ" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-500"}`}>{item.status}</span>}
              {item.date && <span>{item.date}</span>}
            </div>
            <div className="flex flex-wrap gap-2">
              {item.pdfBase64 && (
                <a href={item.pdfBase64} download={item.pdfName}
                  className={`flex items-center gap-1.5 ${btnMap[accentColor]} text-white text-xs px-3 py-1.5 rounded-lg transition-colors`}>
                  <Download className="w-3 h-3" /> تحميل PDF
                </a>
              )}
              {((item.images?.length ?? 0) > 0 || item.videoUrl || item.steps?.length) && (
                <button onClick={() => setOpen(!open)}
                  className="flex items-center gap-1.5 bg-gray-100 text-gray-600 text-xs px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors">
                  <Eye className="w-3 h-3" /> {open ? "إخفاء" : "عرض التفاصيل"}
                </button>
              )}
              {item.videoUrl && (
                <a href={item.videoUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-purple-700 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-purple-600 transition-colors">
                  🎬 مشاهدة
                </a>
              )}
            </div>
          </div>
        </div>

        {open && (
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
            {item.steps && item.steps.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2">خطوات الإجراء:</p>
                <ol className="space-y-1">
                  {item.steps.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className={`w-5 h-5 ${bgMap[accentColor]} ${iconMap[accentColor]} rounded-full text-xs flex items-center justify-center flex-shrink-0 font-bold mt-0.5`}>{i + 1}</span>
                      {s}
                    </li>
                  ))}
                </ol>
              </div>
            )}
            {item.images && item.images.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2">الصور ({item.images.length}):</p>
                <div className="flex gap-2 flex-wrap">
                  {item.images.map((img, i) => (
                    <img key={i} src={img} alt="" onClick={() => setViewImg(img)}
                      className="w-24 h-20 object-cover rounded-xl border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity" />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {viewImg && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setViewImg(null)}>
          <img src={viewImg} alt="" className="max-w-full max-h-full rounded-2xl object-contain" />
          <button onClick={() => setViewImg(null)} className="absolute top-4 left-4 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </>
  );
}

export default function KnowledgePage() {
  const [activeTab, setActiveTab] = useState("guides");
  const [search, setSearch] = useState("");
  const [allData, setAllData] = useState<Record<string, KnowledgeItem[]>>({});

  useEffect(() => {
    const data: Record<string, KnowledgeItem[]> = {};
    Object.entries(KEYS).forEach(([key, storageKey]) => {
      data[key] = loadItems(storageKey);
    });
    setAllData(data);
  }, []);

  const currentTab = TABS.find(t => t.id === activeTab)!;
  const items = (allData[activeTab] ?? []).filter(i =>
    !search || i.title.toLowerCase().includes(search.toLowerCase()) || i.description.toLowerCase().includes(search.toLowerCase())
  );
  const totalCount = Object.values(allData).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="card p-6 bg-gradient-to-l from-blue-800 to-blue-600 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">مركز المعرفة</h1>
            <p className="text-blue-200 text-sm">مستودع المعرفة المؤسسية لوحدة الموهبة والابتكار</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {TABS.map(t => (
            <div key={t.id} className="bg-white/10 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-yellow-300">{allData[t.id]?.length ?? 0}</div>
              <div className="text-blue-100 text-xs mt-1">{t.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5">
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input type="text" placeholder="ابحث في مركز المعرفة..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="bg-transparent outline-none text-sm flex-1 text-right" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const count = allData[tab.id]?.length ?? 0;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id ? "bg-blue-800 text-white shadow-md" : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}>
              <Icon className="w-4 h-4" />
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      {items.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <currentTab.icon className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium text-gray-500">{search ? "لا نتائج مطابقة" : "لا يوجد محتوى بعد"}</p>
          <p className="text-sm mt-1">
            {!search && "يمكن للأدمن إضافة المحتوى من لوحة الإدارة ← مركز المعرفة"}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {items.map(item => (
            <ItemCard key={item.id} item={item} accentColor={currentTab.color} />
          ))}
        </div>
      )}
    </div>
  );
}

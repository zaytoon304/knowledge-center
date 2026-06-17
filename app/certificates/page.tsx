"use client";
import { useState, useEffect, useRef } from "react";
import { Award, Plus, Trash2, Printer, Eye, Star, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Certificate {
  id: string;
  studentId: string;
  studentName: string;
  type: "program" | "competition" | "achievement" | "participation";
  title: string;
  description: string;
  date: string;
  issuedBy: string;
  createdAt: string;
}

const CERT_TYPES = [
  { id: "program", label: "إتمام برنامج", color: "from-blue-700 to-indigo-600", emoji: "📚" },
  { id: "competition", label: "الفوز بمسابقة", color: "from-yellow-600 to-amber-500", emoji: "🏆" },
  { id: "achievement", label: "إنجاز متميز", color: "from-purple-700 to-violet-600", emoji: "⭐" },
  { id: "participation", label: "المشاركة الفعّالة", color: "from-green-700 to-teal-600", emoji: "🌟" },
];

function load(): Certificate[] { try { const d = localStorage.getItem("kc_certificates"); return d ? JSON.parse(d) : []; } catch { return []; } }
function save(cs: Certificate[]) { localStorage.setItem("kc_certificates", JSON.stringify(cs)); }
function isAdmin() { try { return typeof window !== "undefined" && localStorage.getItem("kc_admin_auth") === "1"; } catch { return false; } }

export default function CertificatesPage() {
  const { user, getAllStudents, isStudent } = useAuth();
  const [admin] = useState(isAdmin);
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [preview, setPreview] = useState<Certificate | null>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ studentId: "", studentName: "", type: "program" as Certificate["type"], title: "", description: "", date: new Date().toISOString().split("T")[0], issuedBy: "إدارة مركز المعرفة والابتكار STEAM" });
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setCerts(load()); }, []);

  const students = getAllStudents().filter(s => s.status === "approved");
  const myCerts = isStudent && user ? certs.filter(c => c.studentId === user.id) : certs;
  const displayed = myCerts.filter(c => !search || c.studentName.includes(search) || c.title.includes(search));

  const issueCert = () => {
    if (!form.studentId || !form.title) return;
    const cert: Certificate = { id: Date.now().toString(), ...form, createdAt: new Date().toISOString() };
    const updated = [cert, ...certs];
    save(updated); setCerts(updated);
    setForm({ studentId: "", studentName: "", type: "program", title: "", description: "", date: new Date().toISOString().split("T")[0], issuedBy: "إدارة مركز المعرفة والابتكار STEAM" });
    setShowForm(false);
  };

  const deleteCert = (id: string) => { const u = certs.filter(c => c.id !== id); save(u); setCerts(u); };

  const printCert = (cert: Certificate) => {
    setPreview(cert);
    setTimeout(() => window.print(), 300);
  };

  const typeInfo = (type: string) => CERT_TYPES.find(t => t.id === type) || CERT_TYPES[0];

  return (
    <>
      {/* Print Certificate */}
      {preview && (
        <div className="hidden print:block fixed inset-0 bg-white z-[9999] p-0 m-0">
          <CertificatePrint cert={preview} />
        </div>
      )}

      <div className="space-y-5 animate-fade-in print:hidden">
        {/* Header */}
        <div className="card p-5 bg-gradient-to-l from-violet-800 to-purple-700 text-white">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">الشهادات الرقمية</h1>
                <p className="text-purple-200 text-xs">{myCerts.length} شهادة مُصدَرة</p>
              </div>
            </div>
            {admin && (
              <button onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                <Plus className="w-4 h-4" /> إصدار شهادة
              </button>
            )}
          </div>
        </div>

        {/* Form */}
        {showForm && admin && (
          <div className="card p-5 space-y-4">
            <h3 className="font-bold text-gray-800">إصدار شهادة جديدة</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">الطالب *</label>
                <select value={form.studentId} onChange={e => {
                  const s = students.find(st => st.id === e.target.value);
                  setForm(p => ({ ...p, studentId: e.target.value, studentName: s?.name || "" }));
                }} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none">
                  <option value="">اختر الطالب</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">نوع الشهادة</label>
                <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as Certificate["type"] }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none">
                  {CERT_TYPES.map(t => <option key={t.id} value={t.id}>{t.emoji} {t.label}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-gray-600 mb-1 block">عنوان الشهادة *</label>
                <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="مثال: إتمام برنامج الروبوتيكس المتقدم" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-purple-500" />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-gray-600 mb-1 block">نص الشهادة</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  rows={2} placeholder="مثال: أتمّ هذا البرنامج بتفوق وتميز خلال الفصل الدراسي الأول..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none resize-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">التاريخ</label>
                <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">جهة الإصدار</label>
                <input value={form.issuedBy} onChange={e => setForm(p => ({ ...p, issuedBy: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none" />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={issueCert} className="bg-purple-700 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-purple-600">إصدار الشهادة</button>
              <button onClick={() => setShowForm(false)} className="bg-gray-100 text-gray-600 px-5 py-2 rounded-xl text-sm">إلغاء</button>
            </div>
          </div>
        )}

        {/* Search */}
        {myCerts.length > 0 && (
          <div className="card p-3 flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="ابحث عن شهادة..."
              className="bg-transparent outline-none text-sm flex-1 text-right" />
          </div>
        )}

        {/* Certificates Grid */}
        {displayed.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Award className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium text-gray-500">لا توجد شهادات بعد</p>
            {admin && <p className="text-sm mt-1">اضغط "إصدار شهادة" لمنح أول شهادة</p>}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {displayed.map(cert => {
              const info = typeInfo(cert.type);
              return (
                <div key={cert.id} className="card overflow-hidden hover:shadow-md transition-shadow">
                  <div className={`bg-gradient-to-l ${info.color} p-5 text-white`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-3xl">{info.emoji}</span>
                      <span className="text-xs bg-white/20 px-2 py-1 rounded-full">{info.label}</span>
                    </div>
                    <h3 className="font-bold text-lg leading-tight">{cert.title}</h3>
                    <p className="text-white/80 text-sm mt-1">{cert.studentName}</p>
                  </div>
                  <div className="p-4">
                    {cert.description && <p className="text-sm text-gray-600 mb-3 leading-relaxed">{cert.description}</p>}
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                      <span>📅 {cert.date}</span>
                      <span>{cert.issuedBy}</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setPreview(cert); setTimeout(() => window.print(), 200); }}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-purple-700 text-white rounded-xl text-sm hover:bg-purple-600 transition-colors">
                        <Printer className="w-4 h-4" /> طباعة الشهادة
                      </button>
                      <button onClick={() => setPreview(cert)}
                        className="p-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      {admin && (
                        <button onClick={() => deleteCert(cert.id)}
                          className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Preview Modal */}
        {preview && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 print:hidden" onClick={() => setPreview(null)}>
            <div onClick={e => e.stopPropagation()} className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl">
              <CertificatePrint cert={preview} />
              <div className="p-4 flex gap-3 border-t">
                <button onClick={() => window.print()} className="flex-1 bg-purple-700 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-purple-600 flex items-center justify-center gap-2">
                  <Printer className="w-4 h-4" /> طباعة / حفظ PDF
                </button>
                <button onClick={() => setPreview(null)} className="px-5 bg-gray-100 text-gray-600 py-2.5 rounded-xl text-sm">إغلاق</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function CertificatePrint({ cert }: { cert: Certificate }) {
  const info = CERT_TYPES.find(t => t.id === cert.type) || CERT_TYPES[0];
  const gradColors = {
    "program": ["#1e3a8a", "#4338ca"],
    "competition": ["#92400e", "#d97706"],
    "achievement": ["#4c1d95", "#7c3aed"],
    "participation": ["#064e3b", "#0d9488"],
  }[cert.type] || ["#1e3a8a", "#4338ca"];

  return (
    <div style={{ fontFamily: "'Segoe UI', Tahoma, Arial, sans-serif", direction: "rtl", backgroundColor: "#fff", minHeight: "500px", position: "relative", overflow: "hidden" }}>
      {/* Top border */}
      <div style={{ height: "12px", background: `linear-gradient(to right, ${gradColors[0]}, ${gradColors[1]})` }} />
      {/* Corner decorations */}
      <div style={{ position: "absolute", top: 12, right: 0, width: 80, height: 80, background: `linear-gradient(135deg, ${gradColors[0]}22, transparent)`, borderBottomLeftRadius: "100%" }} />
      <div style={{ position: "absolute", top: 12, left: 0, width: 80, height: 80, background: `linear-gradient(225deg, ${gradColors[1]}22, transparent)`, borderBottomRightRadius: "100%" }} />

      <div style={{ padding: "40px 50px" }}>
        {/* Logo area */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ display: "inline-block", background: `linear-gradient(135deg, ${gradColors[0]}, ${gradColors[1]})`, borderRadius: 16, padding: "12px 24px", color: "#fff", marginBottom: 8 }}>
            <div style={{ fontSize: 28 }}>{info.emoji}</div>
          </div>
          <div style={{ color: gradColors[0], fontWeight: "bold", fontSize: 13, letterSpacing: 1 }}>مركز المعرفة والابتكار STEAM — مدارس الأرقم</div>
        </div>

        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 6, textTransform: "uppercase", letterSpacing: 2 }}>شـهـادة {info.label}</div>
          <div style={{ height: 2, background: `linear-gradient(to right, transparent, ${gradColors[0]}, transparent)`, marginBottom: 16 }} />
          <div style={{ fontSize: 13, color: "#374151" }}>تُقدَّم هذه الشهادة إلى</div>
        </div>

        {/* Student Name */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 34, fontWeight: "bold", color: gradColors[0], borderBottom: `3px solid ${gradColors[1]}`, display: "inline-block", paddingBottom: 6, marginBottom: 6 }}>
            {cert.studentName}
          </div>
        </div>

        {/* Certificate Title */}
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 20, fontWeight: "bold", color: "#1f2937", marginBottom: 8 }}>{cert.title}</div>
          {cert.description && <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.8, maxWidth: 480, margin: "0 auto" }}>{cert.description}</div>}
        </div>

        {/* Stars */}
        <div style={{ textAlign: "center", margin: "16px 0", color: gradColors[1], fontSize: 20, letterSpacing: 4 }}>
          ★ ★ ★ ★ ★
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 24, paddingTop: 16, borderTop: `1px solid #e5e7eb` }}>
          <div>
            <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 4 }}>التاريخ</div>
            <div style={{ fontSize: 13, fontWeight: "bold", color: "#374151" }}>{cert.date}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 80, height: 2, background: gradColors[0], margin: "0 auto 4px" }} />
            <div style={{ fontSize: 11, color: "#6b7280" }}>ختم المركز</div>
          </div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 4 }}>جهة الإصدار</div>
            <div style={{ fontSize: 12, fontWeight: "bold", color: "#374151" }}>{cert.issuedBy}</div>
          </div>
        </div>
      </div>

      {/* Bottom border */}
      <div style={{ height: 8, background: `linear-gradient(to right, ${gradColors[0]}, ${gradColors[1]})` }} />
    </div>
  );
}

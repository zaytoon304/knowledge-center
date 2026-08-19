"use client";
import { useState, useEffect } from "react";
import { Eye, Briefcase, Users, LogIn, Lock } from "lucide-react";
import { useAuth, CoordinatorProfile } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { getNotes, addNote } from "@/lib/notes";

type Tab = "coordinators" | "students";

export default function OversightPage() {
  const { user, isCoordinator, isLoggedIn, isApproved, getAllCoordinators, getAllStudents } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("coordinators");
  const [search, setSearch] = useState("");
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});
  const [notesMap, setNotesMap] = useState<Record<string, string[]>>({});

  const coordinators = getAllCoordinators().filter(c => c.status === "approved");
  const students = getAllStudents().filter(s => s.status === "approved");

  useEffect(() => {
    const ids = tab === "coordinators" ? coordinators.map(c => c.id) : students.map(s => s.id);
    const prefix = tab === "coordinators" ? "kc_cnotes_" : "kc_snotes_";
    Promise.all(ids.map(async id => [id, await getNotes(prefix + id)] as const))
      .then(entries => setNotesMap(prev => ({ ...prev, ...Object.fromEntries(entries) })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  if (!isLoggedIn || !isCoordinator) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-20 h-20 bg-violet-100 rounded-3xl flex items-center justify-center"><LogIn className="w-10 h-10 text-violet-700" /></div>
        <h2 className="text-2xl font-bold text-gray-800">متابعة المنسقين والطلاب</h2>
        <p className="text-gray-500">يجب تسجيل الدخول كمنسق للوصول لهذه الصفحة.</p>
        <button onClick={() => router.push("/login")} className="bg-violet-800 text-white px-8 py-3 rounded-2xl font-bold hover:bg-violet-700">دخول</button>
      </div>
    );
  }

  const isSupervisor = isApproved && (user as CoordinatorProfile)?.isSupervisor;
  if (!isSupervisor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center"><Lock className="w-10 h-10 text-gray-400" /></div>
        <h2 className="text-2xl font-bold text-gray-800">هذه الصفحة لمشرفي المتابعة فقط</h2>
        <p className="text-gray-500 max-w-sm">ما عندك صلاحية الوصول لهذه الصفحة. تواصل مع الإدارة لو تحتاجها.</p>
      </div>
    );
  }

  const notePrefix = tab === "coordinators" ? "kc_cnotes_" : "kc_snotes_";
  const sendNote = (id: string) => {
    const txt = (noteInputs[id] || "").trim();
    if (!txt) return;
    setNoteInputs(p => ({ ...p, [id]: "" }));
    addNote(notePrefix + id, txt).then(ns => { if (ns) setNotesMap(p => ({ ...p, [id]: ns })); });
  };

  const filteredCoords = coordinators.filter(c => !search || c.name.includes(search) || c.school.includes(search) || c.subject.includes(search));
  const filteredStudents = students.filter(s => !search || s.name.includes(search) || s.school.includes(search) || s.grade.includes(search));

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="card p-6 bg-gradient-to-l from-violet-800 to-indigo-700 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">متابعة المنسقين والطلاب</h1>
            <p className="text-indigo-200 text-sm">عرض ومتابعة وإرسال ملاحظات — بدون تعديل محتوى المنصة</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setTab("coordinators")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === "coordinators" ? "bg-violet-700 text-white shadow-md" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>
          <Briefcase className="w-4 h-4" /> المنسقون ({coordinators.length})
        </button>
        <button onClick={() => setTab("students")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === "students" ? "bg-violet-700 text-white shadow-md" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>
          <Users className="w-4 h-4" /> الطلاب ({students.length})
        </button>
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)}
        placeholder="🔍 ابحث بالاسم أو المدرسة..."
        className="w-full md:w-80 border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white outline-none focus:border-violet-500" />

      {tab === "coordinators" ? (
        filteredCoords.length === 0 ? (
          <div className="card p-10 text-center text-gray-400"><Briefcase className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>لا يوجد منسقون</p></div>
        ) : (
          <div className="space-y-3">
            {filteredCoords.map(c => (
              <div key={c.id} className="card p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg flex-shrink-0">{c.name[0]}</div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">{c.name}</p>
                    <p className="text-sm text-gray-500">{c.school} • {c.subject}</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {c.phone && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-lg">📞 {c.phone}</span>}
                      {c.email && <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-lg">✉️ {c.email}</span>}
                    </div>
                  </div>
                </div>
                {(notesMap[c.id] || []).length > 0 && (
                  <div className="bg-yellow-50 rounded-xl p-3 space-y-1">
                    <p className="text-xs font-bold text-yellow-700 mb-1">📝 الملاحظات:</p>
                    {(notesMap[c.id] || []).map((n, i) => <p key={i} className="text-xs text-yellow-800">• {n}</p>)}
                  </div>
                )}
                <div className="flex gap-2">
                  <input value={noteInputs[c.id] || ""} onChange={e => setNoteInputs(p => ({ ...p, [c.id]: e.target.value }))}
                    onKeyDown={e => e.key === "Enter" && sendNote(c.id)}
                    placeholder="أضف ملاحظة..." className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 outline-none" />
                  <button onClick={() => sendNote(c.id)} className="bg-violet-700 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-violet-600">إضافة</button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        filteredStudents.length === 0 ? (
          <div className="card p-10 text-center text-gray-400"><Users className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>لا يوجد طلاب</p></div>
        ) : (
          <div className="space-y-3">
            {filteredStudents.map(s => (
              <div key={s.id} className="card p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-lg flex-shrink-0">
                    {s.photo ? <img src={s.photo} alt="" className="w-full h-full object-cover" /> : s.name[0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">{s.name}</p>
                    <p className="text-sm text-gray-500">{s.school} • {s.grade}</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {s.phone && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-lg">📞 {s.phone}</span>}
                    </div>
                  </div>
                </div>
                {(notesMap[s.id] || []).length > 0 && (
                  <div className="bg-yellow-50 rounded-xl p-3 space-y-1">
                    <p className="text-xs font-bold text-yellow-700 mb-1">📝 الملاحظات:</p>
                    {(notesMap[s.id] || []).map((n, i) => <p key={i} className="text-xs text-yellow-800">• {n}</p>)}
                  </div>
                )}
                <div className="flex gap-2">
                  <input value={noteInputs[s.id] || ""} onChange={e => setNoteInputs(p => ({ ...p, [s.id]: e.target.value }))}
                    onKeyDown={e => e.key === "Enter" && sendNote(s.id)}
                    placeholder="أضف ملاحظة..." className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 outline-none" />
                  <button onClick={() => sendNote(s.id)} className="bg-violet-700 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-violet-600">إضافة</button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

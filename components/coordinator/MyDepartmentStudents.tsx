"use client";
import { useState, useEffect } from "react";
import { UserCheck, UserX, Users, GraduationCap, School, Phone } from "lucide-react";
import { useAuth, StudentProfile, CoordinatorProfile } from "@/contexts/AuthContext";
import { cloudListen } from "@/lib/cloud";

const STATUS_LABEL: Record<string, string> = { pending: "بانتظار الموافقة", approved: "مقبول", rejected: "مرفوض" };
const STATUS_COLOR: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-500",
};

// نفس اسم المنسّق المسجَّل بحسابه غالباً محفوظ بمسافة زائدة بالنهاية (هيك اتسجّل فعلياً بقاعدة
// البيانات الحية لكل المنسقين الأربعة)، بينما اسم "coordinatorName" المحفوظ تلقائياً مع الطالب
// وقت التسجيل بدون مسافة — لازم trim() لكل مقارنة، وإلا ما يطلع أي طالب لأي منسّق أبداً (نفس
// السبب الحقيقي وراء شكوى "طلاب قسمي ما يظهرون")
function sameCoordinator(a?: string, b?: string) {
  return !!a && !!b && a.trim() === b.trim();
}

export default function MyDepartmentStudents() {
  const { user, approveStudent, rejectStudent } = useAuth();
  const coord = user as CoordinatorProfile;
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = cloudListen<StudentProfile[]>("kc_students", data => {
      setStudents(Array.isArray(data) ? data : []);
    });
    return unsub;
  }, []);

  const mine = students
    .filter(s => sameCoordinator(s.coordinatorName, coord.name))
    .sort((a, b) => (a.status === "pending" ? 0 : 1) - (b.status === "pending" ? 0 : 1) || a.registeredAt.localeCompare(b.registeredAt));

  const pendingCount = mine.filter(s => s.status === "pending").length;
  const approvedCount = mine.filter(s => s.status === "approved").length;

  const act = (fn: (id: string) => void, id: string) => {
    setBusyId(id);
    fn(id);
    setTimeout(() => setBusyId(null), 600);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-gray-800 flex items-center gap-2">
          <Users className="w-5 h-5 text-violet-600" /> طلاب قسمي ({mine.length})
        </h2>
      </div>
      <p className="text-xs text-gray-400 -mt-2">
        كل طالب اختار قسمك عند التسجيل يظهر هنا تلقائياً — {pendingCount} بانتظار الموافقة، {approvedCount} مقبول.
      </p>

      {mine.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">
          <Users className="w-14 h-14 mx-auto mb-3 opacity-30" />
          <p className="font-medium">ما فيه طلاب مسجّلين بقسمك حتى الآن</p>
        </div>
      ) : (
        <div className="space-y-3">
          {mine.map(s => (
            <div key={s.id} className="card p-4 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl overflow-hidden bg-violet-100 flex-shrink-0 flex items-center justify-center text-violet-700 font-bold">
                {s.photo ? <img src={s.photo} alt="" className="w-full h-full object-cover" /> : s.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-gray-800">{s.name}</p>
                  <span className={`text-xs font-semibold rounded-full px-2 py-0.5 ${STATUS_COLOR[s.status]}`}>{STATUS_LABEL[s.status]}</span>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-gray-400 mt-1">
                  <span className="flex items-center gap-1"><GraduationCap className="w-3.5 h-3.5" /> {s.grade}</span>
                  <span className="flex items-center gap-1"><School className="w-3.5 h-3.5" /> {s.school}</span>
                  {s.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {s.phone}</span>}
                </div>
              </div>
              {s.status === "pending" && (
                <div className="flex gap-2 flex-shrink-0">
                  <button disabled={busyId === s.id} onClick={() => act(approveStudent, s.id)}
                    className="flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-500 disabled:opacity-40">
                    <UserCheck className="w-4 h-4" /> قبول
                  </button>
                  <button disabled={busyId === s.id} onClick={() => act(rejectStudent, s.id)}
                    className="flex items-center gap-1.5 bg-red-50 text-red-500 border border-red-200 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-100 disabled:opacity-40">
                    <UserX className="w-4 h-4" /> رفض
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

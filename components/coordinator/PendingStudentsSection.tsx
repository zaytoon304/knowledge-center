"use client";
import { useState, useEffect } from "react";
import { UserCheck, UserX, Clock, Phone, School, GraduationCap } from "lucide-react";
import { useAuth, StudentProfile } from "@/contexts/AuthContext";
import { cloudListen } from "@/lib/cloud";

export default function PendingStudentsSection() {
  const { approveStudent, rejectStudent } = useAuth();
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = cloudListen<StudentProfile[]>("kc_students", data => {
      setStudents(Array.isArray(data) ? data : []);
    });
    return unsub;
  }, []);

  const pending = students
    .filter(s => s.status === "pending")
    .sort((a, b) => a.registeredAt.localeCompare(b.registeredAt));

  const act = (fn: (id: string) => void, id: string) => {
    setBusyId(id);
    fn(id);
    setTimeout(() => setBusyId(null), 600);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-gray-800 flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-500" /> طلاب بانتظار الموافقة ({pending.length})
        </h2>
      </div>
      <p className="text-xs text-gray-400 -mt-2">أي منسّق يقدر يوافق أو يرفض أي طالب جديد من هنا — نفس صلاحية الإدارة، وما يحتاج موافقة مزدوجة.</p>

      {pending.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">
          <UserCheck className="w-14 h-14 mx-auto mb-3 opacity-30" />
          <p className="font-medium">لا يوجد طلاب بانتظار الموافقة حالياً</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pending.map(s => (
            <div key={s.id} className="card p-4 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl overflow-hidden bg-amber-100 flex-shrink-0 flex items-center justify-center text-amber-700 font-bold">
                {s.photo ? <img src={s.photo} alt="" className="w-full h-full object-cover" /> : s.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800">{s.name}</p>
                <div className="flex flex-wrap gap-3 text-xs text-gray-400 mt-1">
                  <span className="flex items-center gap-1"><GraduationCap className="w-3.5 h-3.5" /> {s.grade}</span>
                  <span className="flex items-center gap-1"><School className="w-3.5 h-3.5" /> {s.school}</span>
                  {s.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {s.phone}</span>}
                </div>
              </div>
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

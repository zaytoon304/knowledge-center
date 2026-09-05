"use client";
import { useState, useEffect } from "react";
import { Compass } from "lucide-react";
import { buildStudentTimeline, type PortfolioEvent } from "@/lib/portfolio";

const KIND_COLOR: Record<PortfolioEvent["kind"], string> = {
  certificate: "from-amber-600 to-yellow-500",
  skill: "from-emerald-600 to-teal-500",
  project: "from-sky-600 to-blue-500",
  video: "from-rose-600 to-pink-500",
};

export default function StudentPortfolio({ studentId, studentName }: { studentId: string; studentName: string }) {
  const [events, setEvents] = useState<PortfolioEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    buildStudentTimeline(studentId).then(e => { setEvents(e); setLoading(false); });
  }, [studentId]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Compass className="w-5 h-5 text-blue-600" />
        <h3 className="font-bold text-gray-800">رحلة {studentName} بالمركز</h3>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400 text-center py-8">جارٍ التحميل...</p>
      ) : events.length === 0 ? (
        <div className="card p-8 text-center text-gray-400">
          <Compass className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">لسه ما فيه إنجازات مسجَّلة — أول شهادة أو مهارة أو مشروع بيظهر هنا تلقائياً</p>
        </div>
      ) : (
        <div className="relative pr-6 space-y-4">
          <div className="absolute right-[11px] top-2 bottom-2 w-0.5 bg-gray-200" />
          {events.map(e => (
            <div key={e.id} className="relative flex gap-3">
              <div className={`absolute right-[-24px] top-0.5 w-6 h-6 rounded-full bg-gradient-to-br ${KIND_COLOR[e.kind]} flex items-center justify-center text-xs shadow`}>
                {e.emoji}
              </div>
              <div className="flex-1 bg-white border border-gray-100 rounded-xl p-3 shadow-sm mr-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-gray-800 text-sm">{e.title}</p>
                  <span className="text-[11px] text-gray-400 flex-shrink-0">{new Date(e.date).toLocaleDateString("ar-SA")}</span>
                </div>
                {e.description && <p className="text-xs text-gray-500 mt-1">{e.description}</p>}
                {e.image && <img src={e.image} alt="" className="w-full h-28 object-cover rounded-lg mt-2" />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

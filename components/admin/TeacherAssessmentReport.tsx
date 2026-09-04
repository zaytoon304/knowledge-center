"use client";
import { X, Printer } from "lucide-react";
import { DEPARTMENTS, DEPARTMENT_COORDINATOR } from "@/contexts/AuthContext";
import {
  ROBOTICS_TRACK_ID, ROBOTICS_TRAINING_WEEKS, TRACK_START_DATE,
  sessionPercentage, cumulativePercentage, type AssessmentSession,
} from "@/lib/teacherAssessment";
import CenterLogo from "@/components/icons/CenterLogo";

function performanceLabel(pct: number): { label: string; color: string } {
  if (pct >= 90) return { label: "أداء متميّز", color: "text-emerald-700" };
  if (pct >= 75) return { label: "أداء جيد جداً", color: "text-teal-700" };
  if (pct >= 60) return { label: "أداء مقبول", color: "text-amber-700" };
  return { label: "يحتاج دعم إضافي", color: "text-red-600" };
}

export default function TeacherAssessmentReport({ sessions, onClose }: { sessions: AssessmentSession[]; onClose: () => void }) {
  const rows = DEPARTMENTS.map(d => {
    const s = sessions.filter(x => x.trackId === ROBOTICS_TRACK_ID && x.department === d).sort((a, b) => a.week - b.week);
    return { department: d, coordinator: DEPARTMENT_COORDINATOR[d], sessions: s, pct: cumulativePercentage(s) };
  }).sort((a, b) => b.pct - a.pct);

  const print = () => {
    document.body.classList.add("printing-only");
    window.print();
    setTimeout(() => document.body.classList.remove("printing-only"), 500);
  };

  const today = new Date().toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center overflow-auto p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-6">
        <div className="no-print flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800">معاينة التقرير قبل الطباعة</h3>
          <div className="flex items-center gap-2">
            <button onClick={print} className="flex items-center gap-1.5 bg-gray-800 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-700">
              <Printer className="w-4 h-4" /> طباعة / حفظ PDF
            </button>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100"><X className="w-5 h-5 text-gray-400" /></button>
          </div>
        </div>

        <div className="print-area p-8 space-y-6" dir="rtl">
          {/* ترويسة رسمية */}
          <div className="text-center border-b-2 border-violet-700 pb-4">
            <CenterLogo className="w-16 h-16 mx-auto mb-2" />
            <h1 className="text-xl font-bold text-gray-900">تقرير قياس مستوى أداء معلّمي مسار الروبوت العملي</h1>
            <p className="text-sm text-gray-500 mt-1">مركز المعرفة والابتكار STEAM — مدارس الأرقم</p>
            <p className="text-sm text-gray-500">الفترة: {TRACK_START_DATE.split("-").reverse().join("/")} — 27/12/2026 (17 أسبوعاً)</p>
          </div>

          <div className="text-sm text-gray-700 space-y-1">
            <p><strong>موجّه إلى:</strong> سعادة نائب المشرف العام</p>
            <p><strong>إعداد:</strong> محمد زيتون — مشرف عام STEAM، بمساعدة محمد شيبة</p>
            <p><strong>تاريخ التقرير:</strong> {today}</p>
            <p><strong>منهجية القياس:</strong> عيّنة عشوائية من 5 طلاب من أصل 30 لكل معلّم أسبوعياً، تُختبر على "ناتج التعلم القابل للقياس" المحدد بخطة التدريب الرسمية، وفق 5 معايير (الفهم، المحاكاة، التنفيذ العملي، البرمجة، حل المشكلات).</p>
          </div>

          {/* ملخص تنفيذي — ترتيب المعلمين */}
          <div>
            <h2 className="font-bold text-gray-800 mb-2 border-r-4 border-violet-700 pr-2">أولاً: الملخص التنفيذي — ترتيب المعلمين</h2>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-violet-700 text-white">
                  <th className="p-2 text-right">الترتيب</th>
                  <th className="p-2 text-right">القسم</th>
                  <th className="p-2 text-right">المعلّم</th>
                  <th className="p-2 text-center">عدد القياسات</th>
                  <th className="p-2 text-center">نسبة الإتقان التراكمية</th>
                  <th className="p-2 text-right">التقييم</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const perf = performanceLabel(r.pct);
                  return (
                    <tr key={r.department} className="border-b border-gray-100">
                      <td className="p-2">{i + 1}</td>
                      <td className="p-2">{r.department}</td>
                      <td className="p-2 font-semibold">{r.coordinator}</td>
                      <td className="p-2 text-center">{r.sessions.length} / 17</td>
                      <td className="p-2 text-center font-bold">{r.pct}٪</td>
                      <td className={`p-2 font-semibold ${perf.color}`}>{perf.label}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* تفصيل كل معلّم */}
          <div>
            <h2 className="font-bold text-gray-800 mb-2 border-r-4 border-violet-700 pr-2">ثانياً: التفصيل الأسبوعي لكل معلّم</h2>
            <div className="space-y-4">
              {rows.map(r => (
                <div key={r.department} className="break-inside-avoid">
                  <p className="font-bold text-gray-800 text-sm mb-1">{r.coordinator} — {r.department}</p>
                  {r.sessions.length === 0 ? (
                    <p className="text-xs text-gray-400">لا يوجد قياس مسجَّل بعد</p>
                  ) : (
                    <table className="w-full text-xs border-collapse mb-1">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="p-1.5 text-right">الأسبوع</th>
                          <th className="p-1.5 text-right">الموضوع</th>
                          <th className="p-1.5 text-right">التاريخ</th>
                          <th className="p-1.5 text-right">القائم بالقياس</th>
                          <th className="p-1.5 text-center">النسبة</th>
                        </tr>
                      </thead>
                      <tbody>
                        {r.sessions.map(s => (
                          <tr key={s.id} className="border-b border-gray-50">
                            <td className="p-1.5">{s.week}</td>
                            <td className="p-1.5">{ROBOTICS_TRAINING_WEEKS.find(w => w.week === s.week)?.topic}</td>
                            <td className="p-1.5">{new Date(s.date).toLocaleDateString("ar-SA")}</td>
                            <td className="p-1.5">{s.assessorName}</td>
                            <td className="p-1.5 text-center font-bold">{sessionPercentage(s)}٪</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 text-sm text-gray-600 flex justify-between">
            <div>
              <p className="font-semibold">إعداد وتوقيع:</p>
              <p className="mt-6">محمد زيتون — مشرف عام STEAM</p>
            </div>
            <div>
              <p className="font-semibold">اعتماد:</p>
              <p className="mt-6">سعادة نائب المشرف العام</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

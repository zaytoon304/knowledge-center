"use client";
import { useState } from "react";
import { GraduationCap, Clock, Users, CheckCircle, Plus, Award, BookOpen, Filter } from "lucide-react";
import { courses } from "@/data/courses";
import Badge from "@/components/ui/Badge";

export default function TrainingPage() {
  const [activeTab, setActiveTab] = useState("courses");
  const [fieldFilter, setFieldFilter] = useState("الكل");
  const [selectedCourse, setSelectedCourse] = useState<string>("");

  const filtered = courses.filter(c => fieldFilter === "الكل" || c.field === fieldFilter);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="card p-6 bg-gradient-to-l from-green-800 to-teal-700 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">مركز التدريب</h1>
            <p className="text-green-200 text-sm">الدورات التدريبية، الحقائب التدريبية، الشهادات</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { n: courses.length, l: "دورة تدريبية" },
            { n: courses.reduce((sum, c) => sum + c.registrations, 0), l: "مسجل" },
            { n: courses.reduce((sum, c) => sum + c.completions, 0), l: "أكمل الدورة" },
            { n: "240", l: "ساعة تدريبية" },
          ].map(i => (
            <div key={i.l} className="bg-white/10 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-yellow-300">{i.n}</div>
              <div className="text-green-100 text-sm">{i.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: "courses", label: "الدورات التدريبية", icon: BookOpen },
          { id: "register", label: "التسجيل في دورة", icon: Plus },
          { id: "certificates", label: "الشهادات", icon: Award },
          { id: "records", label: "سجل التدريب", icon: CheckCircle },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-green-700 text-white shadow-md"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Courses */}
      {activeTab === "courses" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <select value={fieldFilter} onChange={e => setFieldFilter(e.target.value)} className="bg-transparent text-sm outline-none text-gray-600">
                {["الكل", "الذكاء الاصطناعي", "الروبوت", "STEAM", "عام"].map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {filtered.map(course => (
              <div key={course.id} className="card p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge>{course.status}</Badge>
                      <Badge variant="blue">{course.level}</Badge>
                    </div>
                    <h3 className="font-bold text-gray-800 text-base">{course.title}</h3>
                  </div>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed mb-4">{course.description}</p>

                <div className="grid grid-cols-2 gap-3 mb-4 text-xs text-gray-600">
                  <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg p-2">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    {course.duration}
                  </div>
                  <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg p-2">
                    <Users className="w-3.5 h-3.5 text-gray-400" />
                    {course.registrations} مسجل
                  </div>
                  <div className="col-span-2 flex items-center gap-1.5 bg-gray-50 rounded-lg p-2">
                    <GraduationCap className="w-3.5 h-3.5 text-gray-400" />
                    المدرب: {course.instructor}
                  </div>
                </div>

                {/* Modules */}
                <div className="mb-4">
                  <div className="text-xs font-semibold text-gray-500 mb-2">المحاور</div>
                  <div className="flex flex-wrap gap-1">
                    {course.modules.map(m => (
                      <span key={m} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{m}</span>
                    ))}
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">نسبة الإكمال</span>
                    <span className="font-semibold text-green-700">{Math.round((course.completions / course.registrations) * 100)}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-l from-green-600 to-teal-400 rounded-full"
                      style={{ width: `${(course.completions / course.registrations) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => { setSelectedCourse(course.title); setActiveTab("register"); }}
                    className="flex-1 bg-green-700 text-white text-sm py-2 rounded-xl hover:bg-green-600 transition-colors font-medium"
                  >
                    سجل الآن
                  </button>
                  <button className="bg-gray-100 text-gray-600 text-sm px-4 py-2 rounded-xl hover:bg-gray-200 transition-colors">
                    التفاصيل
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Registration Form */}
      {activeTab === "register" && (
        <div className="card p-6 max-w-2xl">
          <h2 className="text-xl font-bold text-gray-800 mb-6">نموذج التسجيل في دورة</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">اختر الدورة</label>
              <select
                value={selectedCourse}
                onChange={e => setSelectedCourse(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 outline-none focus:border-green-500"
              >
                <option value="">اختر الدورة...</option>
                {courses.map(c => <option key={c.id} value={c.title}>{c.title}</option>)}
              </select>
            </div>
            {[
              { label: "الاسم الكامل", placeholder: "أدخل اسمك الكامل", type: "text" },
              { label: "المدرسة", placeholder: "اسم المدرسة", type: "text" },
              { label: "البريد الإلكتروني", placeholder: "example@mail.com", type: "email" },
              { label: "رقم الجوال", placeholder: "05XXXXXXXX", type: "tel" },
            ].map(f => (
              <div key={f.label}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                <input type={f.type} placeholder={f.placeholder} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 outline-none focus:border-green-500" />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">المرحلة الدراسية</label>
              <select className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 outline-none focus:border-green-500">
                <option>ابتدائي</option>
                <option>متوسط</option>
                <option>ثانوي</option>
                <option>معلم/منسق</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">سبب الالتحاق</label>
              <textarea rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 outline-none focus:border-green-500 resize-none" placeholder="اذكر سبب رغبتك في الانضمام للدورة..." />
            </div>
            <button type="submit" className="w-full bg-green-700 text-white py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors">
              إرسال طلب التسجيل
            </button>
          </form>
        </div>
      )}

      {/* Certificates */}
      {activeTab === "certificates" && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.filter(c => c.status === "منتهية").map(course => (
            <div key={course.id} className="card p-5 text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="font-bold text-gray-800 mb-1">{course.title}</h3>
              <p className="text-sm text-gray-500 mb-1">المدرب: {course.instructor}</p>
              <p className="text-xs text-gray-400 mb-4">{course.duration}</p>
              <div className="bg-gray-50 rounded-xl p-3 mb-4 text-xs text-gray-500">
                <div>رقم الشهادة: CERT-{course.id.toString().padStart(4, "0")}</div>
                <div>تاريخ الإصدار: {course.startDate}</div>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 bg-yellow-500 text-white text-sm py-2 rounded-xl hover:bg-yellow-600 transition-colors font-medium">
                  تحميل PDF
                </button>
                <button className="bg-gray-100 text-gray-600 text-sm px-3 py-2 rounded-xl">
                  QR
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Records */}
      {activeTab === "records" && (
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-800">سجل التدريب الكامل</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full rtl-table">
              <thead className="bg-gray-50">
                <tr>
                  {["الدورة", "المدرب", "المدة", "المسجلون", "المكتملون", "نسبة الإكمال", "الحالة"].map(h => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 text-right">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {courses.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{c.title}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{c.instructor}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{c.duration}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{c.registrations}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{c.completions}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: `${(c.completions / c.registrations) * 100}%` }} />
                        </div>
                        <span className="text-xs font-medium text-green-700">{Math.round((c.completions / c.registrations) * 100)}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><Badge>{c.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

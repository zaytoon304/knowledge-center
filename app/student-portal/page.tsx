"use client";
import { useState } from "react";
import { Users, Trophy, BookOpen, Play, Image, Star, Bell, Plus, Award } from "lucide-react";

const studentTabs = [
  { id: "dashboard", label: "لوحتي", icon: Star },
  { id: "competitions", label: "المسابقات", icon: Trophy },
  { id: "academy", label: "أكاديمية الابتكار", icon: BookOpen },
  { id: "videos", label: "الفيديوهات", icon: Play },
  { id: "gallery", label: "الصور والمعارض", icon: Image },
  { id: "register", label: "طلب مشاركة", icon: Plus },
  { id: "portfolio", label: "ملف إنجازي", icon: Award },
];

const availableCompetitions = [
  { name: "مسابقة WRO للروبوت", deadline: "2025-03-15", field: "الروبوت", status: "مفتوحة", color: "bg-blue-50 border-blue-200" },
  { name: "هاكاثون الذكاء الاصطناعي", deadline: "2025-03-01", field: "AI", status: "قادمة", color: "bg-purple-50 border-purple-200" },
  { name: "تحدي STEAM المدرسي", deadline: "2025-04-10", field: "STEAM", status: "مفتوحة", color: "bg-green-50 border-green-200" },
];

const courses = [
  { name: "مدخل إلى الذكاء الاصطناعي", progress: 75, level: "مبتدئ", icon: "🤖" },
  { name: "Arduino للمبتدئين", progress: 40, level: "مبتدئ", icon: "⚡" },
  { name: "أساسيات الروبوت", progress: 0, level: "مبتدئ", icon: "🤖" },
];

const videos = [
  { title: "كيف تبني روبوت بسيط", duration: "8:42", views: 234, emoji: "🤖" },
  { title: "مقدمة في الذكاء الاصطناعي", duration: "12:15", views: 456, emoji: "🧠" },
  { title: "مشروع النفق الذكي - كيف بنيناه", duration: "15:30", views: 178, emoji: "🚇" },
  { title: "كيف تفوز في WRO؟", duration: "20:05", views: 312, emoji: "🏆" },
  { title: "برمجة Arduino بـ 10 دقائق", duration: "10:22", views: 289, emoji: "💻" },
  { title: "الطباعة ثلاثية الأبعاد للمبتدئين", duration: "14:18", views: 156, emoji: "🖨️" },
];

const gallery = [
  { title: "معرض مشاريع الروبوت 2024", count: 24, emoji: "🤖" },
  { title: "مسابقة WRO الإقليمية", count: 36, emoji: "🏆" },
  { title: "ورشة Arduino المدرسية", count: 18, emoji: "⚡" },
  { title: "يوم STEAM المفتوح", count: 42, emoji: "🔬" },
];

const studentData = {
  name: "اسم الطالب",
  school: "اسم المدرسة",
  grade: "الصف الدراسي",
  points: 850,
  badges: ["مبتكر", "مبرمج", "روبوتيكس"],
  completedCourses: 3,
  competitions: 4,
  achievements: ["اسم الإنجاز الأول", "اسم الإنجاز الثاني"],
};

export default function StudentPortalPage() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="card p-6 bg-gradient-to-l from-emerald-700 to-green-600 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">بوابة الطلاب والطالبات</h1>
            <p className="text-green-100 text-sm">عالمك التعليمي والإبداعي في مكان واحد</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {studentTabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                activeTab === tab.id
                  ? "bg-emerald-700 text-white shadow-md"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              <Icon className="w-3.5 h-3.5" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Dashboard */}
      {activeTab === "dashboard" && (
        <div className="space-y-4">
          {/* Student Card */}
          <div className="card p-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-green-400 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                <Users className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-gray-800 text-lg">{studentData.name}</h2>
                <p className="text-sm text-gray-500">{studentData.school} • {studentData.grade}</p>
                <div className="flex gap-1 mt-2">
                  {studentData.badges.map(b => (
                    <span key={b} className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">{b}</span>
                  ))}
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-500">⭐ {studentData.points}</div>
                <div className="text-xs text-gray-500">نقطة</div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "دورات مكتملة", value: studentData.completedCourses, icon: "📚", color: "bg-blue-50 text-blue-700" },
              { label: "مسابقات شاركت", value: studentData.competitions, icon: "🏆", color: "bg-yellow-50 text-yellow-700" },
              { label: "إنجازات", value: studentData.achievements.length, icon: "⭐", color: "bg-green-50 text-green-700" },
            ].map(s => (
              <div key={s.label} className={`card p-4 text-center ${s.color}`}>
                <div className="text-3xl mb-1">{s.icon}</div>
                <div className="text-2xl font-bold">{s.value}</div>
                <div className="text-xs mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Notifications */}
          <div className="card p-4">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Bell className="w-4 h-4 text-orange-500" /> إشعاراتي
            </h3>
            <div className="space-y-2">
              {[
                { text: "🏆 مسابقة WRO مفتوحة للتسجيل - آخر موعد 15 مارس", type: "warning" },
                { text: "📚 تم تسجيلك في دورة Arduino - تبدأ الأسبوع القادم", type: "info" },
                { text: "✅ مشروعك تم اعتماده من قِبل المشرف", type: "success" },
              ].map((n, i) => (
                <div key={i} className={`p-3 rounded-xl text-sm ${n.type === "warning" ? "bg-orange-50 text-orange-700" : n.type === "success" ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700"}`}>
                  {n.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Competitions */}
      {activeTab === "competitions" && (
        <div className="space-y-4">
          <h2 className="font-bold text-gray-800">المسابقات المتاحة</h2>
          {availableCompetitions.map(comp => (
            <div key={comp.name} className={`card p-5 border ${comp.color}`}>
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-gray-800">{comp.name}</h3>
                <span className={`badge text-xs ${comp.status === "مفتوحة" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                  {comp.status}
                </span>
              </div>
              <div className="flex gap-4 text-sm text-gray-500 mb-4">
                <span>🏷️ {comp.field}</span>
                <span>📅 آخر موعد: {comp.deadline}</span>
              </div>
              <button className="w-full bg-blue-800 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors">
                سجل الآن
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Academy */}
      {activeTab === "academy" && (
        <div className="space-y-4">
          <h2 className="font-bold text-gray-800">دوراتي</h2>
          {courses.map(course => (
            <div key={course.name} className="card p-5">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{course.icon}</span>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">{course.name}</h3>
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">{course.level}</span>
                </div>
                <span className="text-sm font-bold text-blue-700">{course.progress}%</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-l from-green-500 to-emerald-400 rounded-full transition-all" style={{ width: `${course.progress}%` }} />
              </div>
              <div className="mt-3">
                <button className="w-full bg-emerald-700 text-white py-2 rounded-xl text-sm font-medium hover:bg-emerald-600 transition-colors">
                  {course.progress === 0 ? "ابدأ الدورة" : course.progress === 100 ? "عرض الشهادة" : "متابعة الدورة"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Videos */}
      {activeTab === "videos" && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map(v => (
            <div key={v.title} className="card overflow-hidden cursor-pointer group">
              <div className="bg-gradient-to-br from-gray-800 to-gray-600 h-36 flex items-center justify-center text-6xl group-hover:scale-105 transition-transform">
                {v.emoji}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 text-sm mb-2">{v.title}</h3>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>⏱ {v.duration}</span>
                  <span>👁 {v.views} مشاهدة</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Gallery */}
      {activeTab === "gallery" && (
        <div className="grid md:grid-cols-2 gap-4">
          {gallery.map(g => (
            <div key={g.title} className="card p-5 cursor-pointer group hover:shadow-md transition-all">
              <div className="text-5xl mb-3 text-center group-hover:scale-110 transition-transform">{g.emoji}</div>
              <h3 className="font-bold text-gray-800 text-center mb-1">{g.title}</h3>
              <p className="text-sm text-gray-500 text-center">{g.count} صورة</p>
              <button className="w-full mt-3 bg-gray-100 text-gray-700 py-2 rounded-xl text-sm hover:bg-blue-50 hover:text-blue-700 transition-colors">
                عرض الصور
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Register Form */}
      {activeTab === "register" && (
        <div className="card p-6 max-w-2xl">
          <h2 className="text-xl font-bold text-gray-800 mb-6">طلب المشاركة في برنامج أو مسابقة</h2>
          <form className="space-y-4">
            {[
              { label: "الاسم الكامل", type: "text", placeholder: "اسمك الكامل" },
              { label: "الصف الدراسي", type: "text", placeholder: "مثال: الأول الثانوي" },
              { label: "المدرسة", type: "text", placeholder: "اسم مدرستك" },
            ].map(f => (
              <div key={f.label}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                <input type={f.type} placeholder={f.placeholder} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 outline-none focus:border-emerald-500" />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">المجال المرغوب</label>
              <select className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 outline-none focus:border-emerald-500">
                <option>الذكاء الاصطناعي</option>
                <option>الروبوت</option>
                <option>STEAM</option>
                <option>البحث العلمي</option>
                <option>الابتكار</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">هل لديك فريق؟</label>
              <div className="flex gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="team" value="yes" className="accent-emerald-600" />
                  <span className="text-sm">نعم</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="team" value="no" className="accent-emerald-600" />
                  <span className="text-sm">لا، أريد الانضمام لفريق</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">فكرة المشروع (اختياري)</label>
              <textarea rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 outline-none focus:border-emerald-500 resize-none" placeholder="اذكر فكرتك إن وجدت..." />
            </div>
            <button type="submit" className="w-full bg-emerald-700 text-white py-3 rounded-xl font-semibold hover:bg-emerald-600 transition-colors">
              إرسال الطلب
            </button>
          </form>
        </div>
      )}

      {/* Portfolio */}
      {activeTab === "portfolio" && (
        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="font-bold text-gray-800 mb-4">ملف إنجاز الطالب</h2>
            <div className="text-center py-6">
              <div className="text-6xl mb-3">🎓</div>
              <h3 className="font-bold text-gray-800 text-xl mb-1">{studentData.name}</h3>
              <p className="text-gray-500 mb-4">{studentData.school}</p>
              <div className="flex justify-center gap-2 mb-6">
                {studentData.badges.map(b => (
                  <span key={b} className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">{b}</span>
                ))}
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">الإنجازات</h4>
                {studentData.achievements.map(a => (
                  <div key={a} className="flex items-center gap-2 text-sm text-gray-600 py-1.5 border-b border-gray-50 last:border-0">
                    <span>🏆</span> {a}
                  </div>
                ))}
              </div>
              <div className="text-center">
                <div className="bg-gray-100 rounded-2xl p-6 inline-block">
                  <div className="text-4xl mb-2">📱</div>
                  <p className="text-sm text-gray-500 mb-2">QR Code الملف</p>
                  <div className="w-24 h-24 bg-white border-2 border-gray-200 rounded-xl mx-auto flex items-center justify-center text-3xl">
                    ◼️
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";
import { useState } from "react";
import { Users, Trophy, BookOpen, Play, Image, Star, Bell, Award, MessageSquare, UserCircle, LogIn } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import TeamGroupChat from "@/components/student/TeamGroupChat";

const studentTabs = [
  { id: "dashboard", label: "لوحتي", icon: Star },
  { id: "competitions", label: "المسابقات", icon: Trophy },
  { id: "academy", label: "أكاديمية الابتكار", icon: BookOpen },
  { id: "videos", label: "الفيديوهات", icon: Play },
  { id: "gallery", label: "المعارض", icon: Image },
  { id: "groups", label: "جروبات الفرق", icon: MessageSquare },
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

function GuestPrompt() {
  const router = useRouter();
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8 space-y-6">
      <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-green-400 rounded-3xl flex items-center justify-center shadow-xl">
        <Users className="w-12 h-12 text-white" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">بوابة الطلاب والطالبات</h2>
        <p className="text-gray-500 max-w-sm mx-auto">سجّل دخولك للوصول إلى بوابتك الشخصية، ومتابعة المسابقات، والانضمام لجروبات الفرق</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => router.push("/login")}
          className="flex items-center gap-2 bg-emerald-700 text-white px-8 py-3.5 rounded-2xl font-bold text-base hover:bg-emerald-600 transition-colors shadow-lg"
        >
          <LogIn className="w-5 h-5" /> دخول / تسجيل جديد
        </button>
      </div>
      <p className="text-sm text-gray-400">ليس لديك حساب؟ يمكنك التسجيل من نفس الصفحة</p>
    </div>
  );
}

export default function StudentPortalPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { isLoggedIn, user } = useAuth();

  if (!isLoggedIn || !user) {
    return (
      <div className="space-y-5 animate-fade-in">
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
        <GuestPrompt />
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="card p-6 bg-gradient-to-l from-emerald-700 to-green-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white/20 flex-shrink-0 flex items-center justify-center text-white text-xl font-bold">
              {user.photo ? <img src={user.photo} alt="" className="w-full h-full object-cover" /> : <UserCircle className="w-9 h-9" />}
            </div>
            <div>
              <h1 className="text-xl font-bold">مرحباً، {user.name}</h1>
              <p className="text-green-100 text-sm">{user.school} • {user.grade}</p>
            </div>
          </div>
          <div className="text-center hidden sm:block">
            <div className="text-2xl font-bold text-yellow-300">⭐ 850</div>
            <div className="text-green-100 text-xs">نقطة</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {studentTabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                activeTab === tab.id
                  ? "bg-emerald-700 text-white shadow-md scale-105"
                  : "bg-white text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 border border-gray-200"
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Dashboard */}
      {activeTab === "dashboard" && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "دورات مكتملة", value: 3, icon: "📚", color: "bg-blue-50 text-blue-700" },
              { label: "مسابقات", value: 4, icon: "🏆", color: "bg-yellow-50 text-yellow-700" },
              { label: "إنجازات", value: 2, icon: "⭐", color: "bg-green-50 text-green-700" },
            ].map(s => (
              <div key={s.label} className={`card p-4 text-center ${s.color}`}>
                <div className="text-3xl mb-1">{s.icon}</div>
                <div className="text-2xl font-bold">{s.value}</div>
                <div className="text-xs mt-1">{s.label}</div>
              </div>
            ))}
          </div>

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
                <div className="h-full bg-gradient-to-l from-green-500 to-emerald-400 rounded-full" style={{ width: `${course.progress}%` }} />
              </div>
              <button className="w-full mt-3 bg-emerald-700 text-white py-2 rounded-xl text-sm font-medium hover:bg-emerald-600 transition-colors">
                {course.progress === 0 ? "ابدأ الدورة" : course.progress === 100 ? "عرض الشهادة" : "متابعة الدورة"}
              </button>
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

      {/* Group Chats */}
      {activeTab === "groups" && (
        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="font-bold text-gray-800 mb-1 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" /> جروبات الفرق
            </h2>
            <p className="text-sm text-gray-500 mb-4">تواصل مع فريقك وشارك الملفات والصور والفيديوهات</p>
            <TeamGroupChat />
          </div>
        </div>
      )}

      {/* Portfolio */}
      {activeTab === "portfolio" && (
        <div className="card p-5">
          <h2 className="font-bold text-gray-800 mb-4">ملف إنجاز الطالب</h2>
          <div className="text-center py-6">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-600 to-green-400 mx-auto mb-3 flex items-center justify-center">
              {user.photo ? <img src={user.photo} alt="" className="w-full h-full object-cover" /> : <UserCircle className="w-10 h-10 text-white" />}
            </div>
            <h3 className="font-bold text-gray-800 text-xl mb-1">{user.name}</h3>
            <p className="text-gray-500 mb-1">{user.school}</p>
            <p className="text-gray-400 text-sm mb-4">{user.grade}</p>
            <div className="flex justify-center gap-2 mb-6">
              {["مبتكر", "مبرمج", "روبوتيكس"].map(b => (
                <span key={b} className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">{b}</span>
              ))}
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">بياناتي</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p>📞 {user.phone}</p>
                {user.email && <p>✉️ {user.email}</p>}
                <p>🏫 {user.school}</p>
                <p>📚 {user.grade}</p>
              </div>
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
      )}
    </div>
  );
}

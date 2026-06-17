"use client";
import { useState } from "react";
import { UserSquare, Award, BookOpen, Briefcase, Star, QrCode, Download, Edit, Plus } from "lucide-react";

const profileData = {
  name: "م. خالد عبدالله الشمري",
  school: "ثانوية الملك فهد",
  role: "قائد وحدة الموهبة والابتكار",
  specialization: "هندسة البرمجيات والذكاء الاصطناعي",
  email: "k.alshammari@edu.sa",
  phone: "0512345678",
  bio: "قائد وحدة موهبة وابتكار وذكاء اصطناعي بخبرة 8 سنوات في التعليم التقني، متخصص في تأهيل الطلاب الموهوبين وقيادة مشاريع الذكاء الاصطناعي والروبوت.",
};

const qualifications = [
  { degree: "ماجستير علوم الحاسوب", institution: "جامعة الملك عبدالعزيز", year: "2018" },
  { degree: "بكالوريوس هندسة البرمجيات", institution: "جامعة الملك فهد للبترول", year: "2015" },
  { degree: "دبلوم التعليم التقني", institution: "كلية التربية", year: "2016" },
];

const courses = [
  { title: "الذكاء الاصطناعي في التعليم", provider: "Google Educators", year: "2024", cert: true },
  { title: "قيادة المدارس المبتكرة", provider: "MIT OpenCourseWare", year: "2023", cert: true },
  { title: "تدريب المدربين التوت", provider: "وزارة التعليم", year: "2022", cert: true },
  { title: "أساسيات الروبوتيكس", provider: "Coursera", year: "2021", cert: true },
];

const achievements = [
  { title: "جائزة المعلم المتميز الوطنية", year: "2024", type: "جائزة" },
  { title: "المركز الأول - أفضل وحدة موهبة وطنياً", year: "2024", type: "مسابقة" },
  { title: "إطلاق برنامج AI في 8 مدارس", year: "2023", type: "مبادرة" },
  { title: "تأهيل 3 فرق لـ WRO العالمية", year: "2023", type: "إنجاز" },
  { title: "نشر ورقة بحثية في التعليم التقني", year: "2022", type: "بحث" },
];

const works = [
  { title: "كتيب تعليمي: الذكاء الاصطناعي للمبتدئين", type: "📚", desc: "دليل مبسط لتعليم AI في المدارس" },
  { title: "تطبيق تقييم المشاريع", type: "📱", desc: "تطبيق لتقييم مشاريع الطلاب بالـ AI" },
  { title: "فيديوهات تعليمية Arduino", type: "🎥", desc: "سلسلة 20 فيديو شرح تعليمي" },
  { title: "ورقة بحثية: AI في الفصول الدراسية", type: "📄", desc: "منشورة في مجلة دولية محكمة" },
];

const kpiGoals = [
  { label: "طلاب مشاركون", current: 120, target: 150, percent: 80 },
  { label: "مشاريع مكتملة", current: 35, target: 40, percent: 88 },
  { label: "دورات تدريبية", current: 12, target: 15, percent: 80 },
  { label: "مسابقات", current: 8, target: 10, percent: 80 },
];

const tabs = [
  { id: "profile", label: "الملف الشخصي", icon: UserSquare },
  { id: "resume", label: "السيرة الذاتية", icon: Briefcase },
  { id: "achievements", label: "الإنجازات", icon: Award },
  { id: "works", label: "معرض الأعمال", icon: Star },
  { id: "goals", label: "الخطة المهنية", icon: BookOpen },
];

export default function PortfolioPage() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="card p-6 bg-gradient-to-l from-pink-700 to-rose-600 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <UserSquare className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">الملف المهني</h1>
            <p className="text-pink-200 text-sm">ملفك المهني الرقمي الموحد</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id ? "bg-pink-700 text-white shadow-md" : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"}`}>
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Profile */}
      {activeTab === "profile" && (
        <div className="space-y-4">
          <div className="card p-6">
            <div className="flex items-start gap-5">
              <div className="w-24 h-24 bg-gradient-to-br from-pink-700 to-rose-500 rounded-2xl flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
                خ
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">{profileData.name}</h2>
                    <p className="text-pink-700 font-medium">{profileData.role}</p>
                    <p className="text-gray-500 text-sm">{profileData.school}</p>
                  </div>
                  <button className="flex items-center gap-2 bg-gray-100 text-gray-600 px-3 py-2 rounded-xl text-sm hover:bg-gray-200">
                    <Edit className="w-4 h-4" /> تعديل
                  </button>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mt-3">{profileData.bio}</p>
                <div className="flex gap-3 mt-4 text-sm text-gray-500">
                  <span>✉️ {profileData.email}</span>
                  <span>📞 {profileData.phone}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <QrCode className="w-4 h-4 text-gray-600" /> البصمة الرقمية
              </h3>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <div className="w-24 h-24 bg-white border-2 border-gray-200 rounded-xl mx-auto mb-3 flex items-center justify-center text-4xl">◼️</div>
                <p className="text-sm text-gray-500">QR Code الملف المهني</p>
                <button className="mt-2 text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-100">تحميل</button>
              </div>
              <div className="space-y-2">
                <div className="bg-blue-50 rounded-xl p-3">
                  <p className="text-xs text-blue-500 mb-1">ملف الإنجاز الرقمي</p>
                  <p className="text-sm font-medium text-blue-800 truncate">edu.sa/portfolio/khalid</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">LinkedIn</p>
                  <p className="text-sm font-medium text-gray-700">linkedin.com/in/k-alshammari</p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-red-100">
                  <Download className="w-4 h-4" /> تحميل CV (PDF)
                </button>
                <button className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-100">
                  <Download className="w-4 h-4" /> تصدير الملف كامل
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resume */}
      {activeTab === "resume" && (
        <div className="grid md:grid-cols-2 gap-5">
          <div className="card p-5">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Briefcase className="w-4 h-4 text-blue-600" /> المؤهلات العلمية</h3>
            <div className="space-y-4">
              {qualifications.map(q => (
                <div key={q.degree} className="border-r-2 border-blue-400 pr-4">
                  <div className="font-semibold text-gray-800 text-sm">{q.degree}</div>
                  <div className="text-gray-500 text-xs mt-0.5">{q.institution}</div>
                  <div className="text-blue-600 text-xs mt-1">{q.year}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="card p-5">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><BookOpen className="w-4 h-4 text-green-600" /> الدورات والشهادات</h3>
            <div className="space-y-3">
              {courses.map(c => (
                <div key={c.title} className="flex items-start justify-between">
                  <div>
                    <div className="font-medium text-gray-800 text-sm">{c.title}</div>
                    <div className="text-xs text-gray-400">{c.provider} • {c.year}</div>
                  </div>
                  {c.cert && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex-shrink-0">✓ شهادة</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Achievements */}
      {activeTab === "achievements" && (
        <div className="grid md:grid-cols-2 gap-4">
          {achievements.map(a => (
            <div key={a.title} className="card p-4 flex items-center gap-4">
              <div className="text-4xl">{a.type === "جائزة" ? "🥇" : a.type === "مسابقة" ? "🏆" : a.type === "مبادرة" ? "💡" : a.type === "بحث" ? "📄" : "⭐"}</div>
              <div>
                <div className="font-bold text-gray-800 text-sm">{a.title}</div>
                <div className="flex gap-2 mt-1">
                  <span className="text-xs text-gray-400">{a.year}</span>
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">{a.type}</span>
                </div>
              </div>
            </div>
          ))}
          <button className="card p-4 border-2 border-dashed border-gray-200 flex items-center justify-center gap-2 text-gray-400 hover:border-pink-300 hover:text-pink-500 transition-colors cursor-pointer">
            <Plus className="w-5 h-5" />
            <span className="text-sm font-medium">إضافة إنجاز جديد</span>
          </button>
        </div>
      )}

      {/* Works */}
      {activeTab === "works" && (
        <div className="grid md:grid-cols-2 gap-4">
          {works.map(w => (
            <div key={w.title} className="card p-5">
              <div className="text-4xl mb-3">{w.type}</div>
              <h3 className="font-bold text-gray-800 mb-1">{w.title}</h3>
              <p className="text-sm text-gray-500 mb-3">{w.desc}</p>
              <button className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-200">
                عرض العمل
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Goals */}
      {activeTab === "goals" && (
        <div className="space-y-5">
          <div className="card p-5">
            <h3 className="font-bold text-gray-800 mb-4">مؤشرات الأداء الشخصية</h3>
            <div className="space-y-4">
              {kpiGoals.map(g => (
                <div key={g.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{g.label}</span>
                    <span className="font-semibold text-gray-800">{g.current} / {g.target}</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-l from-pink-600 to-rose-400 rounded-full" style={{ width: `${g.percent}%` }} />
                  </div>
                  <div className="text-xs text-gray-400 mt-1 text-left">{g.percent}%</div>
                </div>
              ))}
            </div>
          </div>
          <div className="card p-5">
            <h3 className="font-bold text-gray-800 mb-3">البرامج المكلف بها</h3>
            <div className="space-y-2">
              {["برنامج الذكاء الاصطناعي", "برنامج الروبوت", "إدارة المسابقات الوطنية والدولية", "التدريب والتأهيل المهني"].map(p => (
                <div key={p} className="flex items-center gap-2 text-sm text-gray-600 py-2 border-b border-gray-50 last:border-0">
                  <span className="text-blue-500">✦</span> {p}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

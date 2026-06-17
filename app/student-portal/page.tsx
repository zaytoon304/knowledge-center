"use client";
import { useState } from "react";
import { useAuth, StudentProfile } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  Users, BookOpen, Play, Lightbulb, Radio, CreditCard,
  MessageSquare, LogIn, Clock, XCircle, ExternalLink
} from "lucide-react";
import GroupsSection from "@/components/student/GroupsSection";

const tabs = [
  { id: "dashboard", label: "رئيسيتي", icon: Users },
  { id: "groups", label: "الجروبات", icon: MessageSquare },
  { id: "courses", label: "الدورات", icon: BookOpen },
  { id: "videos", label: "الفيديوهات", icon: Play },
  { id: "projects", label: "المشاريع", icon: Lightbulb },
  { id: "live", label: "البث المباشر", icon: Radio },
  { id: "card", label: "بطاقتي", icon: CreditCard },
];

function EmptyState({ icon, text, sub }: { icon: string; text: string; sub: string }) {
  return (
    <div className="text-center py-16 text-gray-400">
      <div className="text-6xl mb-4">{icon}</div>
      <p className="text-lg font-medium text-gray-500">{text}</p>
      <p className="text-sm mt-1">{sub}</p>
    </div>
  );
}

export default function StudentPortalPage() {
  const { isLoggedIn, user, isApproved, getLiveStream, getCourses, getVideos, getProjects } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showCard, setShowCard] = useState(false);

  const courses = getCourses();
  const videos = getVideos();
  const projects = getProjects();
  const live = getLiveStream();

  // Not logged in
  if (!isLoggedIn || !user) {
    return (
      <div className="space-y-5 animate-fade-in">
        <div className="card p-8 bg-gradient-to-l from-emerald-700 to-green-600 text-white text-center">
          <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold mb-2">بوابة الطلاب والطالبات</h1>
          <p className="text-green-100 mb-6">سجّل دخولك للوصول إلى بوابتك الشخصية</p>
          <button onClick={() => router.push("/login")} className="inline-flex items-center gap-2 bg-white text-emerald-700 px-8 py-3 rounded-2xl font-bold text-base hover:bg-yellow-50 transition-colors">
            <LogIn className="w-5 h-5" /> دخول / تسجيل جديد
          </button>
        </div>
      </div>
    );
  }

  // Pending approval
  if (!isApproved) {
    if (user.status === "rejected") {
      return (
        <div className="card p-10 text-center space-y-4 animate-fade-in">
          <XCircle className="w-16 h-16 text-red-400 mx-auto" />
          <h2 className="text-xl font-bold text-red-600">تم رفض طلبك</h2>
          <p className="text-gray-500">يرجى التواصل مع إدارة المنصة لمعرفة السبب</p>
        </div>
      );
    }
    return (
      <div className="card p-10 text-center space-y-5 animate-fade-in">
        <div className="w-20 h-20 bg-yellow-100 rounded-3xl flex items-center justify-center mx-auto">
          <Clock className="w-10 h-10 text-yellow-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">طلبك قيد المراجعة</h2>
        <p className="text-gray-500 max-w-sm mx-auto">تم استلام طلب التسجيل الخاص بك. سيتم مراجعته من قِبل الإدارة وستُفعَّل بوابتك قريباً</p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 max-w-xs mx-auto">
          <p className="text-sm text-yellow-700 font-semibold">{user.name}</p>
          <p className="text-xs text-yellow-600">{(user as StudentProfile).school} • {(user as StudentProfile).grade}</p>
        </div>
        <p className="text-xs text-gray-400">في انتظار موافقة الإدارة...</p>
      </div>
    );
  }

  // Approved student — full portal
  const student = user as StudentProfile;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="card p-5 bg-gradient-to-l from-emerald-700 to-green-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white/20 flex-shrink-0 flex items-center justify-center text-white text-xl font-bold">
              {student.photo
                ? <img src={student.photo} alt="" className="w-full h-full object-cover" />
                : <span className="text-2xl">{student.name[0]}</span>}
            </div>
            <div>
              <h1 className="text-xl font-bold">مرحباً، {student.name}</h1>
              <p className="text-green-100 text-sm">{student.school} • {student.grade}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                activeTab === tab.id
                  ? "bg-emerald-700 text-white shadow-md scale-105"
                  : "bg-white text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 border border-gray-200"
              }`}>
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
              { label: "دوراتي", value: courses.length, icon: "📚", color: "bg-blue-50 text-blue-700" },
              { label: "الفيديوهات", value: videos.length, icon: "🎬", color: "bg-purple-50 text-purple-700" },
              { label: "المشاريع", value: projects.length, icon: "💡", color: "bg-yellow-50 text-yellow-700" },
            ].map(s => (
              <div key={s.label} className={`card p-4 text-center ${s.color}`}>
                <div className="text-3xl mb-1">{s.icon}</div>
                <div className="text-2xl font-bold">{s.value}</div>
                <div className="text-xs mt-1">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="card p-5">
            <h3 className="font-bold text-gray-800 mb-3">الاختصارات السريعة</h3>
            <div className="grid grid-cols-2 gap-3">
              {tabs.filter(t => t.id !== "dashboard").map(t => {
                const Icon = t.icon;
                return (
                  <button key={t.id} onClick={() => setActiveTab(t.id)}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 transition-colors text-gray-700 text-sm font-medium">
                    <Icon className="w-5 h-5" /> {t.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Groups */}
      {activeTab === "groups" && (
        <div className="card p-5">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" /> الجروبات
          </h2>
          <GroupsSection />
        </div>
      )}

      {/* Courses */}
      {activeTab === "courses" && (
        <div className="space-y-4">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" /> الدورات التدريبية
          </h2>
          {courses.length === 0
            ? <EmptyState icon="📚" text="لا توجد دورات متاحة حالياً" sub="ستُضاف الدورات قريباً من قِبل الإدارة" />
            : <div className="grid md:grid-cols-2 gap-4">
                {courses.map(c => (
                  <div key={c.id} className="card p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <span className="text-3xl">{c.emoji}</span>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800">{c.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.type === "free" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                          {c.type === "free" ? "مجاني" : "مدفوع"}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">{c.description}</p>
                    {c.link && (
                      <a href={c.link} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-blue-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors w-full justify-center">
                        <ExternalLink className="w-4 h-4" /> الدخول للدورة
                      </a>
                    )}
                  </div>
                ))}
              </div>
          }
        </div>
      )}

      {/* Videos */}
      {activeTab === "videos" && (
        <div className="space-y-4">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            <Play className="w-5 h-5 text-purple-600" /> الفيديوهات التعليمية
          </h2>
          {videos.length === 0
            ? <EmptyState icon="🎬" text="لا توجد فيديوهات بعد" sub="ستُضاف الفيديوهات التعليمية قريباً" />
            : <div className="grid md:grid-cols-2 gap-4">
                {videos.map(v => (
                  <div key={v.id} className="card overflow-hidden">
                    <div className="bg-gradient-to-br from-gray-800 to-gray-600 h-32 flex items-center justify-center text-5xl">{v.emoji}</div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-800 mb-1">{v.title}</h3>
                      <p className="text-sm text-gray-500 mb-3">{v.description}</p>
                      {v.link && (
                        <a href={v.link} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 text-purple-700 text-sm font-medium hover:underline">
                          <ExternalLink className="w-4 h-4" /> مشاهدة الفيديو
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
          }
        </div>
      )}

      {/* Projects */}
      {activeTab === "projects" && (
        <div className="space-y-4">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" /> مشاريع مقترحة
          </h2>
          {projects.length === 0
            ? <EmptyState icon="💡" text="لا توجد مشاريع مقترحة بعد" sub="ستُضاف أفكار المشاريع قريباً" />
            : <div className="grid md:grid-cols-2 gap-4">
                {projects.map(p => (
                  <div key={p.id} className="card p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <span className="text-3xl">{p.emoji}</span>
                      <div>
                        <h3 className="font-bold text-gray-800">{p.title}</h3>
                        <div className="flex gap-2 mt-1">
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{p.field}</span>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{p.level}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">{p.description}</p>
                  </div>
                ))}
              </div>
          }
        </div>
      )}

      {/* Live Stream */}
      {activeTab === "live" && (
        <div className="card p-8 text-center space-y-5">
          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto ${live.enabled ? "bg-red-100" : "bg-gray-100"}`}>
            <Radio className={`w-10 h-10 ${live.enabled ? "text-red-500 animate-pulse" : "text-gray-400"}`} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{live.title}</h2>
            <p className="text-gray-500 mt-1">{live.description}</p>
          </div>
          {live.enabled ? (
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 bg-red-100 text-red-600 px-4 py-2 rounded-full text-sm font-bold">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                البث مباشر الآن
              </div>
              {live.zoomLink && (
                <div>
                  <a href={live.zoomLink} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-blue-800 text-white px-8 py-3.5 rounded-2xl font-bold text-base hover:bg-blue-700 transition-colors">
                    <ExternalLink className="w-5 h-5" /> دخول البث المباشر
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-500 px-4 py-2 rounded-full text-sm">
              <span className="w-2 h-2 bg-gray-400 rounded-full" />
              لا يوجد بث مباشر الآن
            </div>
          )}
        </div>
      )}

      {/* Student Card */}
      {activeTab === "card" && (
        <div className="max-w-md mx-auto space-y-4">
          {!showCard ? (
            <div className="card p-8 text-center space-y-4">
              <CreditCard className="w-16 h-16 text-gray-300 mx-auto" />
              <h2 className="font-bold text-gray-800 text-xl">بطاقتي الشخصية</h2>
              <p className="text-gray-500 text-sm">بطاقتك تحتوي على بياناتك الكاملة. هي خاصة بك فقط.</p>
              <button onClick={() => setShowCard(true)}
                className="bg-emerald-700 text-white px-8 py-3 rounded-2xl font-bold hover:bg-emerald-600 transition-colors">
                عرض البطاقة
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <button onClick={() => setShowCard(false)} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
                ← إخفاء البطاقة
              </button>
              {/* Card Design */}
              <div className="rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-300 text-xs">مركز المعرفة والابتكار STEAM</p>
                    <p className="text-yellow-300 text-xs font-bold">بمدارس الأرقم</p>
                  </div>
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-yellow-300 text-xl">⭐</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white/20 flex-shrink-0 flex items-center justify-center text-3xl font-bold">
                    {student.photo ? <img src={student.photo} alt="" className="w-full h-full object-cover" /> : student.name[0]}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{student.name}</h2>
                    <p className="text-blue-200 text-sm">{student.grade}</p>
                    <p className="text-blue-300 text-xs mt-1">{student.school}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-white/10 rounded-xl p-3">
                    <p className="text-blue-300 text-xs mb-1">رقم الهوية</p>
                    <p className="font-mono font-bold">{student.nationalId}</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3">
                    <p className="text-blue-300 text-xs mb-1">تاريخ الميلاد</p>
                    <p className="font-bold">{student.birthDate || "—"}</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3">
                    <p className="text-blue-300 text-xs mb-1">الجوال</p>
                    <p className="font-bold">{student.phone}</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3">
                    <p className="text-blue-300 text-xs mb-1">جوال ولي الأمر</p>
                    <p className="font-bold">{student.parentPhone || "—"}</p>
                  </div>
                </div>
                {student.email && (
                  <div className="bg-white/10 rounded-xl p-3 text-sm">
                    <p className="text-blue-300 text-xs mb-1">البريد الإلكتروني</p>
                    <p className="font-bold">{student.email}</p>
                  </div>
                )}
                <div className="border-t border-white/20 pt-3 flex justify-between items-center text-xs text-blue-400">
                  <span>بوابة الطالب الرقمية</span>
                  <span>ID: {student.id}</span>
                </div>
              </div>
              <p className="text-center text-xs text-gray-400">⚠️ هذه البطاقة خاصة بك، لا تشاركها مع أحد</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

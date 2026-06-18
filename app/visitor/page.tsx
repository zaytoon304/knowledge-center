"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, Play, BookOpen, Star, ShoppingBag, ExternalLink, LogIn, Phone } from "lucide-react";
import { CourseItem, VideoItem, ShopItem, PlatformAchievement } from "@/contexts/AuthContext";

const KEYS = {
  courses: "kc_courses", videos: "kc_videos",
  shop: "kc_shop", achievements: "kc_platform_achievements",
};

function load<T>(key: string, fallback: T): T {
  try { const d = localStorage.getItem(key); return d ? JSON.parse(d) : fallback; } catch { return fallback; }
}

const tabs = [
  { id: "videos", label: "الفيديوهات", icon: Play },
  { id: "courses", label: "الدورات", icon: BookOpen },
  { id: "achievements", label: "الإنجازات", icon: Star },
  { id: "shop", label: "المتجر", icon: ShoppingBag },
];

export default function VisitorPage() {
  const router = useRouter();
  const [tab, setTab] = useState("videos");
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [shop, setShop] = useState<ShopItem[]>([]);
  const [achievements, setAchievements] = useState<PlatformAchievement[]>([]);

  useEffect(() => {
    setVideos(load(KEYS.videos, []));
    setCourses(load(KEYS.courses, []));
    setShop(load(KEYS.shop, []));
    setAchievements(load(KEYS.achievements, []));
  }, []);

  const Empty = ({ icon, text }: { icon: string; text: string }) => (
    <div className="card p-14 text-center text-gray-400">
      <div className="text-5xl mb-3">{icon}</div>
      <p>{text}</p>
    </div>
  );

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="card p-6 bg-gradient-to-l from-teal-700 to-cyan-600 text-white">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Eye className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold">وضع الزائر</h1>
              <p className="text-cyan-100 text-sm">تصفح المحتوى بدون تسجيل</p>
            </div>
          </div>
          <button onClick={() => router.push("/login")}
            className="flex items-center gap-2 bg-white text-teal-700 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-teal-50 flex-shrink-0">
            <LogIn className="w-4 h-4" /> سجّل الآن
          </button>
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
        <span className="text-xl flex-shrink-0">⚠️</span>
        <p className="text-sm text-amber-700">وضع الزائر للمشاهدة فقط — لتحميل الملفات والمشاركة في الجروبات والوصول للدورات يجب التسجيل.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === t.id ? "bg-teal-700 text-white shadow" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>
              <Icon className="w-4 h-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Videos */}
      {tab === "videos" && (
        <div className="space-y-4">
          <h2 className="font-bold text-gray-800">الفيديوهات التعليمية</h2>
          {videos.length === 0 ? <Empty icon="🎬" text="لا توجد فيديوهات بعد" />
            : <div className="grid md:grid-cols-2 gap-4">
                {videos.map(v => (
                  <div key={v.id} className="card overflow-hidden">
                    <div className="bg-gradient-to-br from-gray-800 to-gray-600 h-28 flex items-center justify-center text-5xl">{v.emoji}</div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-800 mb-1">{v.title}</h3>
                      <p className="text-sm text-gray-500 mb-3">{v.description}</p>
                      {v.link
                        ? <a href={v.link} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-500 justify-center">
                            <Play className="w-4 h-4" /> مشاهدة الفيديو <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        : <div className="bg-gray-100 text-gray-400 px-4 py-2 rounded-xl text-sm text-center">لا يوجد رابط</div>
                      }
                    </div>
                  </div>
                ))}
              </div>
          }
        </div>
      )}

      {/* Courses */}
      {tab === "courses" && (
        <div className="space-y-4">
          <h2 className="font-bold text-gray-800">الدورات التدريبية</h2>
          {courses.length === 0 ? <Empty icon="📚" text="لا توجد دورات متاحة حالياً" />
            : <div className="grid md:grid-cols-2 gap-4">
                {courses.map(c => (
                  <div key={c.id} className="card p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <span className="text-3xl">{c.emoji}</span>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800">{c.title}</h3>
                        {c.instructor && <p className="text-xs text-blue-600">{c.instructor}</p>}
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">{c.description}</p>
                    <button onClick={() => router.push("/login")}
                      className="w-full bg-blue-50 text-blue-700 border border-blue-200 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-100 flex items-center gap-2 justify-center">
                      <LogIn className="w-4 h-4" /> سجّل للوصول للدورة
                    </button>
                  </div>
                ))}
              </div>
          }
        </div>
      )}

      {/* Achievements */}
      {tab === "achievements" && (
        <div className="space-y-4">
          <h2 className="font-bold text-gray-800">إنجازات المنصة</h2>
          {achievements.length === 0 ? <Empty icon="🏆" text="لا توجد إنجازات بعد" />
            : <div className="grid md:grid-cols-2 gap-4">
                {achievements.map(a => (
                  <div key={a.id} className="card overflow-hidden">
                    {a.image && <img src={a.image} alt="" className="w-full h-40 object-cover" />}
                    <div className="p-4">
                      <h3 className="font-bold text-gray-800">{a.title}</h3>
                      {a.date && <p className="text-xs text-gray-400 mt-0.5">{new Date(a.date).toLocaleDateString("ar-SA")}</p>}
                      <p className="text-sm text-gray-600 mt-2">{a.description}</p>
                    </div>
                  </div>
                ))}
              </div>
          }
        </div>
      )}

      {/* Shop */}
      {tab === "shop" && (
        <div className="space-y-4">
          <h2 className="font-bold text-gray-800">متجر المنصة</h2>
          {shop.length === 0 ? <Empty icon="🛍️" text="لا توجد منتجات بعد" />
            : <div className="grid md:grid-cols-2 gap-4">
                {shop.map(s => (
                  <div key={s.id} className="card overflow-hidden">
                    {s.image
                      ? <img src={s.image} alt="" className="w-full h-44 object-cover" />
                      : <div className="w-full h-44 bg-gray-100 flex items-center justify-center text-5xl">🛒</div>
                    }
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h3 className="font-bold text-gray-800">{s.name}</h3>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{s.category}</span>
                        </div>
                        <span className="text-lg font-bold text-green-600 flex-shrink-0">{s.price} ر.س</span>
                      </div>
                      <p className="text-sm text-gray-500 mb-3">{s.description}</p>
                      {s.contact && (
                        <a href={`tel:${s.contact}`}
                          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-500 justify-center">
                          <Phone className="w-4 h-4" /> تواصل للشراء
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
          }
        </div>
      )}
    </div>
  );
}

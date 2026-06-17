"use client";
import { useState } from "react";
import { Bell, Search, Menu, Moon, Sun, X } from "lucide-react";

const notifications = [
  { id: 1, text: "مسابقة WRO مفتوحة للتسجيل", time: "منذ ساعتين", unread: true },
  { id: 2, text: "تم اعتماد مشروع النفق الذكي", time: "منذ 5 ساعات", unread: true },
  { id: 3, text: "دورة Arduino تبدأ الأسبوع القادم", time: "أمس", unread: false },
  { id: 4, text: "شهادتك جاهزة للتحميل", time: "منذ يومين", unread: false },
];

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const unreadCount = notifications.filter(n => n.unread).length;

  const toggleDark = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 md:px-6 h-16">
        {/* Right: Menu + Search */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            <Menu className="w-5 h-5" />
          </button>

          {showSearch ? (
            <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2 w-64">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                autoFocus
                type="text"
                placeholder="ابحث في المنصة..."
                className="bg-transparent text-sm outline-none flex-1 text-right"
                onBlur={() => setShowSearch(false)}
              />
              <button onClick={() => setShowSearch(false)}>
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowSearch(true)}
              className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2 text-gray-500 text-sm hover:bg-gray-200 transition-colors"
            >
              <Search className="w-4 h-4" />
              <span className="hidden md:block">بحث في المنصة...</span>
            </button>
          )}
        </div>

        {/* Left: Actions */}
        <div className="flex items-center gap-2">
          {/* Dark mode */}
          <button
            onClick={toggleDark}
            className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute left-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-bold text-gray-800">الإشعارات</h3>
                  <span className="text-xs text-blue-600 cursor-pointer hover:underline">تحديد الكل كمقروء</span>
                </div>
                <div className="divide-y divide-gray-50">
                  {notifications.map(n => (
                    <div key={n.id} className={`p-4 hover:bg-gray-50 cursor-pointer ${n.unread ? "bg-blue-50/30" : ""}`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.unread ? "bg-blue-500" : "bg-gray-200"}`} />
                        <div>
                          <p className="text-sm text-gray-800">{n.text}</p>
                          <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User */}
          <div className="flex items-center gap-2 pr-2 border-r border-gray-200 mr-1">
            <div className="text-right hidden md:block">
              <div className="text-sm font-semibold text-gray-800">أ. خالد الشمري</div>
              <div className="text-xs text-gray-400">قائد الوحدة</div>
            </div>
            <div className="w-9 h-9 bg-gradient-to-br from-blue-800 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
              خ
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

"use client";
import { useState } from "react";
import { Settings, Users, Shield, Plus, Edit, Trash2, Eye, BarChart3, CheckCircle, Bell } from "lucide-react";
import Badge from "@/components/ui/Badge";

const users = [
  { id: 1, name: "قائد الوحدة", role: "قائد الوحدة", school: "الإدارة المركزية", email: "leader@edu.sa", status: "نشط", permissions: ["كل الصلاحيات"] },
  { id: 2, name: "اسم المنسق", role: "منسق", school: "اسم المدرسة", email: "coordinator@edu.sa", status: "نشط", permissions: ["رفع مشاريع", "تقارير", "تسجيل طلاب"] },
  { id: 3, name: "اسم المعلم", role: "معلم", school: "اسم المدرسة", email: "teacher@edu.sa", status: "نشط", permissions: ["رفع مواد", "تسجيل طلاب"] },
  { id: 4, name: "اسم المعلمة", role: "معلمة", school: "اسم المدرسة", email: "teacher2@edu.sa", status: "نشط", permissions: ["رفع مواد", "تسجيل طلاب"] },
  { id: 5, name: "اسم الطالب", role: "طالب", school: "اسم المدرسة", email: "student@student.sa", status: "نشط", permissions: ["مشاهدة", "تسجيل في دورات"] },
];

const recentActivity = [
  { action: "تم رفع مشروع جديد", user: "المنسق", time: "منذ 30 دقيقة", type: "project" },
  { action: "تم اعتماد مشروع", user: "قائد الوحدة", time: "منذ ساعتين", type: "approval" },
  { action: "تسجيل طالب جديد في دورة Arduino", user: "المعلم", time: "منذ 3 ساعات", type: "enrollment" },
  { action: "رفع خطة برنامج STEAM", user: "المعلمة", time: "أمس", type: "document" },
  { action: "إصدار شهادة: مقدمة AI", user: "النظام التلقائي", time: "أمس", type: "certificate" },
];

const roleColors: Record<string, string> = {
  "قائد الوحدة": "bg-red-100 text-red-700",
  "منسق": "bg-blue-100 text-blue-700",
  "معلم": "bg-green-100 text-green-700",
  "معلمة": "bg-green-100 text-green-700",
  "طالب": "bg-purple-100 text-purple-700",
};

const sections = [
  { title: "المستخدمون", value: users.length, icon: Users, color: "bg-blue-600", action: "إدارة" },
  { title: "المشاريع المعلقة", value: 3, icon: Eye, color: "bg-orange-500", action: "مراجعة" },
  { title: "الشهادات المصدرة", value: 38, icon: CheckCircle, color: "bg-green-600", action: "عرض" },
  { title: "الإشعارات المرسلة", value: 12, icon: Bell, color: "bg-purple-600", action: "إدارة" },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddUser, setShowAddUser] = useState(false);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="card p-6 bg-gradient-to-l from-red-800 to-rose-700 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <Settings className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">لوحة الإدارة</h1>
            <p className="text-red-200 text-sm">إدارة المستخدمين والصلاحيات والمحتوى</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {sections.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.title} className="card p-4">
              <div className="flex items-center gap-3">
                <div className={`${s.color} w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-800">{s.value}</div>
                  <div className="text-xs text-gray-500">{s.title}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: "overview", label: "النظرة العامة", icon: BarChart3 },
          { id: "users", label: "المستخدمون", icon: Users },
          { id: "permissions", label: "الصلاحيات", icon: Shield },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id ? "bg-red-700 text-white shadow-md" : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"}`}>
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Overview */}
      {activeTab === "overview" && (
        <div className="grid md:grid-cols-2 gap-5">
          {/* Recent Activity */}
          <div className="card p-5">
            <h3 className="font-bold text-gray-800 mb-4">النشاط الأخير</h3>
            <div className="space-y-3">
              {recentActivity.map((act, i) => (
                <div key={i} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${act.type === "approval" ? "bg-green-500" : act.type === "project" ? "bg-blue-500" : act.type === "certificate" ? "bg-yellow-500" : "bg-gray-300"}`} />
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">{act.action}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{act.user} • {act.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div className="card p-5">
            <h3 className="font-bold text-gray-800 mb-4">حالة النظام</h3>
            <div className="space-y-3">
              {[
                { label: "الخادم الرئيسي", status: "يعمل", percent: 98 },
                { label: "قاعدة البيانات", status: "يعمل", percent: 99 },
                { label: "التخزين المستخدم", status: "14 GB / 50 GB", percent: 28 },
                { label: "وقت التشغيل", status: "30 يوم", percent: 100 },
              ].map(s => (
                <div key={s.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{s.label}</span>
                    <span className={`font-medium ${s.status === "يعمل" ? "text-green-600" : "text-blue-600"}`}>{s.status}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full">
                    <div className={`h-full rounded-full ${s.percent > 80 ? "bg-green-500" : s.percent > 50 ? "bg-blue-500" : "bg-orange-500"}`} style={{ width: `${s.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-green-50 rounded-xl">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">جميع الأنظمة تعمل بشكل طبيعي</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card p-5 md:col-span-2">
            <h3 className="font-bold text-gray-800 mb-4">الإجراءات السريعة</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "إضافة مستخدم", icon: "👤", color: "bg-blue-50 text-blue-700 hover:bg-blue-100" },
                { label: "إصدار شهادة", icon: "📜", color: "bg-green-50 text-green-700 hover:bg-green-100" },
                { label: "إرسال إشعار", icon: "🔔", color: "bg-orange-50 text-orange-700 hover:bg-orange-100" },
                { label: "تصدير تقرير", icon: "📊", color: "bg-purple-50 text-purple-700 hover:bg-purple-100" },
              ].map(a => (
                <button key={a.label} className={`${a.color} rounded-xl p-4 text-center transition-colors`}>
                  <div className="text-3xl mb-2">{a.icon}</div>
                  <div className="text-sm font-medium">{a.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Users */}
      {activeTab === "users" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-800">إدارة المستخدمين ({users.length})</h2>
            <button onClick={() => setShowAddUser(!showAddUser)} className="flex items-center gap-2 bg-blue-800 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" /> إضافة مستخدم
            </button>
          </div>

          {showAddUser && (
            <div className="card p-5">
              <h3 className="font-bold text-gray-800 mb-4">إضافة مستخدم جديد</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { label: "الاسم الكامل", placeholder: "اسم المستخدم" },
                  { label: "البريد الإلكتروني", placeholder: "example@edu.sa" },
                  { label: "المدرسة", placeholder: "اسم المدرسة" },
                ].map(f => (
                  <div key={f.label}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                    <input type="text" placeholder={f.placeholder} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 outline-none focus:border-blue-500" />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الدور</label>
                  <select className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 outline-none focus:border-blue-500">
                    <option>قائد الوحدة</option>
                    <option>منسق</option>
                    <option>معلم</option>
                    <option>طالب</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button className="bg-blue-800 text-white px-6 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700">حفظ</button>
                <button onClick={() => setShowAddUser(false)} className="bg-gray-100 text-gray-600 px-6 py-2 rounded-xl text-sm">إلغاء</button>
              </div>
            </div>
          )}

          <div className="card overflow-hidden">
            <table className="w-full rtl-table">
              <thead className="bg-gray-50">
                <tr>
                  {["المستخدم", "الدور", "المدرسة", "البريد", "الحالة", "الإجراءات"].map(h => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-800 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {user.name[0]}
                        </div>
                        <span className="text-sm font-medium text-gray-800">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge text-xs ${roleColors[user.role] ?? "bg-gray-100"}`}>{user.role}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{user.school}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{user.email}</td>
                    <td className="px-4 py-3">
                      <Badge variant="green">{user.status}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit className="w-3.5 h-3.5" /></button>
                        <button className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Permissions */}
      {activeTab === "permissions" && (
        <div className="card p-5">
          <h3 className="font-bold text-gray-800 mb-4">مصفوفة الصلاحيات</h3>
          <div className="overflow-x-auto">
            <table className="w-full rtl-table">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500">الصلاحية</th>
                  {["مدير النظام", "قائد الوحدة", "المنسق", "المعلم", "الطالب"].map(r => (
                    <th key={r} className="px-4 py-3 text-xs font-semibold text-gray-500 text-center">{r}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[
                  { perm: "إضافة مستخدمين", roles: [true, false, false, false, false] },
                  { perm: "تعديل الصلاحيات", roles: [true, false, false, false, false] },
                  { perm: "اعتماد البرامج", roles: [true, true, false, false, false] },
                  { perm: "رفع مشاريع", roles: [true, true, true, true, false] },
                  { perm: "تسجيل طلاب", roles: [true, true, true, true, false] },
                  { perm: "إصدار تقارير", roles: [true, true, true, false, false] },
                  { perm: "إصدار شهادات", roles: [true, true, false, false, false] },
                  { perm: "مشاهدة المحتوى", roles: [true, true, true, true, true] },
                  { perm: "التسجيل في دورات", roles: [true, true, true, true, true] },
                ].map(row => (
                  <tr key={row.perm} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-700">{row.perm}</td>
                    {row.roles.map((allowed, i) => (
                      <td key={i} className="px-4 py-3 text-center">
                        <span className={`text-lg ${allowed ? "text-green-500" : "text-gray-200"}`}>
                          {allowed ? "✓" : "✗"}
                        </span>
                      </td>
                    ))}
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

"use client";
import { useState } from "react";
import { BookOpen, Download, Eye, Search, FileText, Shield, Calendar, ClipboardList, Filter } from "lucide-react";
import { guides, forms, policies, procedures } from "@/data/knowledge";
import Badge from "@/components/ui/Badge";

const tabs = [
  { id: "guides", label: "الأدلة", icon: BookOpen, count: 8 },
  { id: "forms", label: "النماذج", icon: FileText, count: 8 },
  { id: "policies", label: "السياسات", icon: Shield, count: 6 },
  { id: "procedures", label: "الإجراءات", icon: ClipboardList, count: 6 },
  { id: "plans", label: "الخطط", icon: Calendar, count: 6 },
];

const plans = [
  { title: "الخطة السنوية للوحدة", date: "2024-09-01", desc: "الخطة الشاملة لجميع أنشطة وبرامج الوحدة للعام الدراسي", status: "معتمدة" },
  { title: "خطة المسابقات", date: "2024-09-15", desc: "جدول المسابقات المحلية والوطنية والدولية وخطط التجهيز لها", status: "معتمدة" },
  { title: "خطة التدريب", date: "2024-10-01", desc: "خطة الدورات والورش التدريبية للطلاب والمعلمين", status: "معتمدة" },
  { title: "خطة البرامج", date: "2024-10-10", desc: "جدول تنفيذ البرامج الستة للوحدة", status: "معتمدة" },
  { title: "خطة المشاريع", date: "2024-11-01", desc: "خطة متابعة وتوثيق مشاريع الطلاب والمعلمين", status: "قيد التنفيذ" },
  { title: "خطة التطوير المهني", date: "2024-11-15", desc: "خطة تطوير كفاءات المنسقين والمعلمين", status: "معتمدة" },
];

export default function KnowledgePage() {
  const [activeTab, setActiveTab] = useState("guides");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("الكل");

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="card p-6 bg-gradient-to-l from-blue-800 to-blue-600 text-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">مركز المعرفة</h1>
            <p className="text-blue-200 text-sm">مستودع المعرفة المؤسسية للوحدة</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {[{ n: 8, l: "دليل" }, { n: 8, l: "نموذج" }, { n: 6, l: "سياسة" }, { n: 6, l: "إجراء" }].map(i => (
            <div key={i.l} className="bg-white/10 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-yellow-300">{i.n}</div>
              <div className="text-blue-100 text-sm">{i.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="flex gap-3">
          <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5">
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="ابحث في مركز المعرفة..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent outline-none text-sm flex-1 text-right"
            />
          </div>
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="bg-transparent text-sm outline-none text-gray-600"
            >
              <option>الكل</option>
              <option>حديث</option>
              <option>معتمد</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-blue-800 text-white shadow-md"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      {activeTab === "guides" && (
        <div className="grid md:grid-cols-2 gap-4">
          {guides
            .filter(g => !search || g.title.includes(search))
            .map(guide => (
              <div key={guide.id} className="card p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-blue-700" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-sm mb-1">{guide.title}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed mb-3">{guide.description}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                      <span>{guide.department}</span>
                      <span>•</span>
                      <span>الإصدار {guide.version}</span>
                      <span>•</span>
                      <span>{guide.date}</span>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex items-center gap-1.5 bg-blue-800 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors">
                        <Download className="w-3 h-3" /> تحميل PDF
                      </button>
                      <button className="flex items-center gap-1.5 bg-gray-100 text-gray-600 text-xs px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors">
                        <Eye className="w-3 h-3" /> عرض
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {activeTab === "forms" && (
        <div className="grid md:grid-cols-2 gap-4">
          {forms.filter(f => !search || f.title.includes(search)).map(form => (
            <div key={form.id} className="card p-5 flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-green-700" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-bold text-gray-800 text-sm">{form.title}</h3>
                  <Badge variant={form.type === "Excel" ? "green" : form.type === "Word" ? "blue" : "red"}>
                    {form.type}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 mb-2">{form.description}</p>
                <Badge variant="gray">{form.category}</Badge>
                <div className="flex gap-2 mt-3">
                  <button className="flex items-center gap-1.5 bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors">
                    <Download className="w-3 h-3" /> تحميل
                  </button>
                  <button className="flex items-center gap-1.5 bg-blue-100 text-blue-700 text-xs px-3 py-1.5 rounded-lg hover:bg-blue-200 transition-colors">
                    <Eye className="w-3 h-3" /> تعبئة إلكترونية
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "policies" && (
        <div className="grid md:grid-cols-2 gap-4">
          {policies.filter(p => !search || p.title.includes(search)).map(policy => (
            <div key={policy.id} className="card p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 text-sm mb-1">{policy.title}</h3>
                  <p className="text-xs text-gray-500 mb-3">{policy.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">تاريخ الإصدار: {policy.date}</span>
                    <div className="flex gap-2">
                      <button className="flex items-center gap-1 bg-red-50 text-red-600 text-xs px-3 py-1.5 rounded-lg hover:bg-red-100">
                        <Download className="w-3 h-3" /> تحميل
                      </button>
                      <button className="flex items-center gap-1 bg-gray-100 text-gray-600 text-xs px-3 py-1.5 rounded-lg hover:bg-gray-200">
                        <Eye className="w-3 h-3" /> عرض
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "procedures" && (
        <div className="grid md:grid-cols-2 gap-4">
          {procedures.filter(p => !search || p.title.includes(search)).map(proc => (
            <div key={proc.id} className="card p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <ClipboardList className="w-4 h-4 text-purple-700" />
                </div>
                <h3 className="font-bold text-gray-800 text-sm">{proc.title}</h3>
              </div>
              <div className="space-y-2">
                {proc.steps.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-blue-800 text-white text-xs rounded-full flex items-center justify-center font-bold flex-shrink-0">
                      {idx + 1}
                    </div>
                    <span className="text-sm text-gray-700">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "plans" && (
        <div className="grid md:grid-cols-2 gap-4">
          {plans.filter(p => !search || p.title.includes(search)).map((plan, idx) => (
            <div key={idx} className="card p-5">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-orange-600" />
                  </div>
                  <h3 className="font-bold text-gray-800 text-sm">{plan.title}</h3>
                </div>
                <Badge>{plan.status}</Badge>
              </div>
              <p className="text-xs text-gray-500 mb-3 pr-10">{plan.desc}</p>
              <div className="flex items-center justify-between pr-10">
                <span className="text-xs text-gray-400">{plan.date}</span>
                <div className="flex gap-2">
                  <button className="text-xs bg-orange-50 text-orange-600 px-3 py-1.5 rounded-lg hover:bg-orange-100">
                    <Download className="w-3 h-3 inline ml-1" /> تحميل
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

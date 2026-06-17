"use client";
import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Trophy, Users, BookOpen, FolderOpen, Download } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from "recharts";
import { monthlyData, programDistribution } from "@/data/stats";

const DEFAULT_KPI = [
  { id: "d1", label: "البرامج المنفذة", value: "6", total: "6", emoji: "📚", color: "bg-purple-600", note: "" },
  { id: "d2", label: "المشاريع الكلية", value: "35", total: "40", emoji: "📁", color: "bg-blue-600", note: "" },
  { id: "d3", label: "الطلاب المشاركون", value: "120", total: "150", emoji: "👨‍🎓", color: "bg-green-600", note: "" },
  { id: "d4", label: "المسابقات", value: "8", total: "8", emoji: "🏆", color: "bg-yellow-500", note: "" },
  { id: "d5", label: "الدورات التدريبية", value: "12", total: "15", emoji: "🎓", color: "bg-teal-600", note: "" },
  { id: "d6", label: "إنجاز الخطة", value: "92%", total: "", emoji: "📈", color: "bg-orange-500", note: "" },
];

interface KPI { id: string; label: string; value: string; total?: string; emoji?: string; color?: string; note?: string; }

function loadKPIs(): KPI[] {
  try { const d = localStorage.getItem("kc_indicators"); const arr = d ? JSON.parse(d) : []; return arr.length ? arr : DEFAULT_KPI; } catch { return DEFAULT_KPI; }
}

function calcPercent(value: string, total?: string): number {
  const v = parseFloat(value);
  const t = parseFloat(total || "");
  if (!isNaN(v) && !isNaN(t) && t > 0) return Math.round((v / t) * 100);
  const pct = parseFloat(value);
  return isNaN(pct) ? 100 : Math.min(pct, 100);
}

interface TooltipProps {
  active?: boolean;
  payload?: { dataKey: string; color: string; name: string; value: number }[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-lg text-sm">
        <p className="font-semibold text-gray-700 mb-1">{label}</p>
        {payload.map((p) => (
          <p key={p.dataKey} style={{ color: p.color }}>{p.name}: {p.value}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function IndicatorsPage() {
  const [kpis, setKpis] = useState<KPI[]>(DEFAULT_KPI);
  useEffect(() => { setKpis(loadKPIs()); }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="card p-6 bg-gradient-to-l from-orange-600 to-yellow-500 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <BarChart3 className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">مركز المؤشرات</h1>
              <p className="text-orange-100 text-sm">لوحة قيادة مؤشرات الأداء الرئيسية KPI</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 bg-white text-orange-700 px-4 py-2 rounded-xl font-medium text-sm hover:bg-orange-50 transition-colors">
              <Download className="w-4 h-4" /> تصدير PDF
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div>
        <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-orange-500" />
          المؤشرات الرئيسية
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {kpis.map(kpi => {
            const pct = calcPercent(kpi.value, kpi.total);
            return (
              <div key={kpi.id} className="card p-4 text-center">
                <div className={`${kpi.color || "bg-blue-600"} w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3 text-white shadow-md text-lg`}>
                  {kpi.emoji || "📊"}
                </div>
                <div className="text-2xl font-bold text-gray-800">{kpi.value}</div>
                <div className="text-xs text-gray-500 mt-1 mb-2">{kpi.label}</div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${kpi.color || "bg-blue-600"} rounded-full`} style={{ width: `${pct}%` }} />
                </div>
                <div className="text-xs text-gray-400 mt-1">{pct}%{kpi.total ? ` من ${kpi.total}` : ""}</div>
                {kpi.note && <div className="text-xs text-gray-400 mt-1">{kpi.note}</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Monthly Bar Chart */}
        <div className="card p-5">
          <h3 className="font-bold text-gray-800 mb-4">النمو الشهري</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="projects" name="المشاريع" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="courses" name="الدورات" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="card p-5">
          <h3 className="font-bold text-gray-800 mb-4">توزيع البرامج</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={programDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                dataKey="value"
                paddingAngle={3}
              >
                {programDistribution.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, ""]} />
              <Legend
                formatter={(value) => <span className="text-xs text-gray-600">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Line Chart - Students */}
      <div className="card p-5">
        <h3 className="font-bold text-gray-800 mb-4">نمو عدد الطلاب المشاركين</h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={monthlyData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="studentsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} />
            <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="students" name="الطلاب" stroke="#6366f1" strokeWidth={2} fill="url(#studentsGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed KPI Sections */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[
          {
            title: "مؤشرات الموهبة",
            color: "border-purple-400",
            items: [
              { label: "الطلاب المرشحون", value: 45, total: 50 },
              { label: "الطلاب المسجلون", value: 120, total: 150 },
              { label: "البرامج الإثرائية", value: 8, total: 10 },
            ]
          },
          {
            title: "مؤشرات الابتكار",
            color: "border-yellow-400",
            items: [
              { label: "الأفكار المقدمة", value: 52, total: 60 },
              { label: "مشاريع محولة لنماذج", value: 18, total: 25 },
              { label: "المبادرات المنفذة", value: 6, total: 8 },
            ]
          },
          {
            title: "مؤشرات الذكاء الاصطناعي",
            color: "border-blue-400",
            items: [
              { label: "دورات AI", value: 3, total: 4 },
              { label: "مشاريع AI", value: 6, total: 8 },
              { label: "المعلمون المدربون", value: 18, total: 20 },
            ]
          },
          {
            title: "مؤشرات الروبوت",
            color: "border-cyan-400",
            items: [
              { label: "فرق الروبوت", value: 4, total: 5 },
              { label: "المشاركات في المسابقات", value: 8, total: 10 },
              { label: "الجوائز المحققة", value: 5, total: 8 },
            ]
          },
          {
            title: "مؤشرات التدريب",
            color: "border-green-400",
            items: [
              { label: "الدورات المنفذة", value: 12, total: 15 },
              { label: "الحضور الكلي", value: 140, total: 150 },
              { label: "نسبة رضا المستفيدين", value: 94, total: 100, suffix: "%" },
            ]
          },
          {
            title: "مؤشرات المسابقات",
            color: "border-orange-400",
            items: [
              { label: "المسابقات المشارك بها", value: 8, total: 8 },
              { label: "الجوائز المحققة", value: 15, total: 20 },
              { label: "الفرق المشاركة", value: 12, total: 15 },
            ]
          },
        ].map(section => (
          <div key={section.title} className={`card p-5 border-r-4 ${section.color}`}>
            <h3 className="font-bold text-gray-800 mb-4">{section.title}</h3>
            <div className="space-y-3">
              {section.items.map(item => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{item.label}</span>
                    <span className="font-semibold text-gray-800">
                      {item.value}{item.suffix ?? ""} / {item.total}{item.suffix ?? ""}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-l from-blue-600 to-blue-400 rounded-full"
                      style={{ width: `${(item.value / item.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Reports */}
      <div className="card p-5">
        <h3 className="font-bold text-gray-800 mb-4">التقارير</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {["أسبوعي", "شهري", "فصلي", "سنوي"].map(type => (
            <button key={type} className="flex items-center justify-center gap-2 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition-colors group">
              <Download className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
              <span className="text-sm font-medium text-gray-600 group-hover:text-blue-700">تقرير {type}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";
import { useState } from "react";
import { Trophy, Calendar, Users, Plus, Filter, ChevronLeft, CheckCircle, Clock, Globe, MapPin } from "lucide-react";
import { competitions } from "@/data/competitions";
import Badge from "@/components/ui/Badge";

const typeColors: Record<string, string> = {
  "دولية": "bg-blue-100 text-blue-700",
  "وطنية": "bg-green-100 text-green-700",
  "محلية": "bg-purple-100 text-purple-700",
  "داخلية": "bg-orange-100 text-orange-700",
};

export default function CompetitionsPage() {
  const [typeFilter, setTypeFilter] = useState("الكل");
  const [statusFilter, setStatusFilter] = useState("الكل");
  const [selected, setSelected] = useState<number | null>(null);

  const filtered = competitions.filter(c => {
    return (typeFilter === "الكل" || c.type === typeFilter) &&
           (statusFilter === "الكل" || c.status === statusFilter);
  });

  const comp = competitions.find(c => c.id === selected);

  if (selected && comp) {
    return (
      <div className="space-y-5 animate-fade-in">
        <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-blue-600 text-sm font-medium">
          ← العودة للمسابقات
        </button>
        <div className="card p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">{comp.name}</h1>
              <div className="flex gap-2">
                <span className={`badge text-xs ${typeColors[comp.type]}`}>{comp.type}</span>
                <Badge>{comp.status}</Badge>
                <span className="badge text-xs bg-gray-100 text-gray-600">{comp.field}</span>
              </div>
            </div>
          </div>
          <p className="text-gray-600 leading-relaxed mb-6">{comp.description}</p>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2 text-blue-700">
                <Users className="w-4 h-4" />
                <span className="font-semibold text-sm">الفئة المستهدفة</span>
              </div>
              <div className="text-blue-800">{comp.targetAge}</div>
            </div>
            <div className="bg-orange-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2 text-orange-700">
                <Clock className="w-4 h-4" />
                <span className="font-semibold text-sm">آخر موعد للتسجيل</span>
              </div>
              <div className="text-orange-800">{comp.deadline}</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2 text-green-700">
                <Calendar className="w-4 h-4" />
                <span className="font-semibold text-sm">موعد المسابقة</span>
              </div>
              <div className="text-green-800">{comp.eventDate}</div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div className="card p-4">
              <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" /> الشروط والمتطلبات
              </h3>
              <div className="space-y-2">
                {comp.requirements.map(r => (
                  <div key={r} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    {r}
                  </div>
                ))}
              </div>
            </div>

            {comp.achievements.length > 0 && (
              <div className="card p-4">
                <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-500" /> الإنجازات السابقة
                </h3>
                {comp.achievements.map(a => (
                  <div key={a} className="flex items-center gap-2 text-sm text-gray-600 py-1">
                    <span className="text-yellow-500">🏆</span> {a}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-3">
            <button className="flex-1 bg-blue-800 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
              اشترك الآن
            </button>
            <button className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors">
              <Plus className="w-4 h-4" /> أضف فريقاً
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="card p-6 bg-gradient-to-l from-yellow-600 to-amber-500 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <Trophy className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">مركز المسابقات والجوائز</h1>
              <p className="text-yellow-100 text-sm">جميع المسابقات المحلية والوطنية والدولية</p>
            </div>
          </div>
          <button className="bg-white text-yellow-700 px-4 py-2 rounded-xl font-semibold text-sm hover:bg-yellow-50">
            <Plus className="w-4 h-4 inline ml-1" /> مسابقة جديدة
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { l: "إجمالي المسابقات", v: competitions.length, c: "bg-blue-50 text-blue-700" },
          { l: "مفتوحة للتسجيل", v: competitions.filter(c => c.status === "مفتوح").length, c: "bg-green-50 text-green-700" },
          { l: "فرق مشاركة", v: competitions.reduce((s, c) => s + c.teams, 0), c: "bg-purple-50 text-purple-700" },
          { l: "إنجازات محققة", v: competitions.reduce((s, c) => s + c.achievements.length, 0), c: "bg-yellow-50 text-yellow-700" },
        ].map(s => (
          <div key={s.l} className={`card p-4 text-center ${s.c}`}>
            <div className="text-3xl font-bold">{s.v}</div>
            <div className="text-xs font-medium mt-1">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        {[
          { label: "النوع", options: ["الكل", "دولية", "وطنية", "محلية", "داخلية"], value: typeFilter, set: setTypeFilter },
          { label: "الحالة", options: ["الكل", "مفتوح", "مغلق", "قادم", "منتهي"], value: statusFilter, set: setStatusFilter },
        ].map(f => (
          <div key={f.label} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <select value={f.value} onChange={e => f.set(e.target.value)} className="bg-transparent text-sm outline-none text-gray-600">
              {f.options.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        ))}
      </div>

      {/* Competition Cards */}
      <div className="grid md:grid-cols-2 gap-5">
        {filtered.map(comp => (
          <div key={comp.id} className="card p-5 cursor-pointer group" onClick={() => setSelected(comp.id)}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex gap-2 mb-2">
                  <span className={`badge text-xs ${typeColors[comp.type]}`}>{comp.type}</span>
                  <Badge>{comp.status}</Badge>
                </div>
                <h3 className="font-bold text-gray-800 group-hover:text-blue-700 transition-colors">{comp.name}</h3>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                {comp.type === "دولية" ? <Globe className="w-6 h-6 text-yellow-600" /> : <MapPin className="w-6 h-6 text-yellow-600" />}
              </div>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed mb-4">{comp.description}</p>

            <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 mb-4">
              <div className="flex items-center gap-1"><Users className="w-3 h-3" />{comp.targetAge}</div>
              <div className="flex items-center gap-1"><Clock className="w-3 h-3" />{comp.deadline}</div>
              <div className="flex items-center gap-1"><Users className="w-3 h-3" />{comp.teams} فريق</div>
            </div>

            {comp.achievements.length > 0 && (
              <div className="bg-yellow-50 rounded-xl p-3 mb-4">
                <div className="flex items-center gap-1 text-yellow-700 text-xs font-semibold mb-1">
                  <Trophy className="w-3.5 h-3.5" /> إنجاز سابق
                </div>
                <div className="text-xs text-yellow-700">{comp.achievements[0]}</div>
              </div>
            )}

            <div className="flex gap-2 pt-3 border-t border-gray-100">
              <button className="flex-1 bg-blue-800 text-white text-xs py-2 rounded-xl hover:bg-blue-700 transition-colors">اشترك الآن</button>
              <button className="bg-gray-100 text-gray-600 text-xs px-3 py-2 rounded-xl hover:bg-gray-200">
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

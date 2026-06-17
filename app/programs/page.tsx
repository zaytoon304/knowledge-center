"use client";
import { useState } from "react";
import { Layers, Star, Lightbulb, Beaker, Brain, Bot, Search, ChevronLeft, Users, Target, BarChart3 } from "lucide-react";
import { programs } from "@/data/programs";

const iconMap: Record<string, React.ElementType> = {
  Star, Lightbulb, Beaker, Brain, Bot, Search,
};

export default function ProgramsPage() {
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);

  const program = programs.find(p => p.id === selectedProgram);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="card p-6 bg-gradient-to-l from-purple-800 to-indigo-700 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <Layers className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">مركز البرامج</h1>
            <p className="text-purple-200 text-sm">البرامج الرسمية لوحدة الموهبة والابتكار والذكاء الاصطناعي</p>
          </div>
        </div>
      </div>

      {!selectedProgram ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {programs.map(prog => {
            const Icon = iconMap[prog.icon] || Star;
            return (
              <div
                key={prog.id}
                onClick={() => setSelectedProgram(prog.id)}
                className="card p-6 cursor-pointer group"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${prog.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold text-gray-800 text-lg mb-2">{prog.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">{prog.description}</p>

                <div className="space-y-2 mb-4">
                  {prog.subPrograms.slice(0, 4).map(sub => (
                    <div key={sub} className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                      {sub}
                    </div>
                  ))}
                  {prog.subPrograms.length > 4 && (
                    <div className="text-xs text-gray-400">+{prog.subPrograms.length - 4} أكثر...</div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Users className="w-3.5 h-3.5" />
                    {prog.target}
                  </div>
                  <div className="flex items-center gap-1 text-blue-600 text-sm font-medium group-hover:gap-2 transition-all">
                    عرض التفاصيل <ChevronLeft className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        program && (
          <div className="space-y-5">
            <button
              onClick={() => setSelectedProgram(null)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              <ChevronLeft className="w-4 h-4 rotate-180" />
              العودة للبرامج
            </button>

            <div className={`card p-8 bg-gradient-to-br ${program.color} text-white`}>
              <h2 className="text-3xl font-bold mb-2">{program.title}</h2>
              <p className="text-white/80 text-lg mb-4">{program.description}</p>
              <div className="flex gap-4 text-sm">
                <div className="bg-white/20 px-3 py-1 rounded-full">الفئة المستهدفة: {program.target}</div>
                <div className="bg-white/20 px-3 py-1 rounded-full">المسؤول: {program.manager}</div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-5">
              {/* Goals */}
              <div className="card p-5">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-purple-600" /> الأهداف
                </h3>
                <div className="space-y-2">
                  {program.goals.map((g, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs text-purple-700 font-bold">{i + 1}</div>
                      {g}
                    </div>
                  ))}
                </div>
              </div>

              {/* Outcomes */}
              <div className="card p-5">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-green-600" /> المخرجات
                </h3>
                <div className="space-y-2">
                  {program.outcomes.map((o, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-1.5" />
                      {o}
                    </div>
                  ))}
                </div>
              </div>

              {/* SubPrograms */}
              <div className="card p-5">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" /> البرامج الفرعية
                </h3>
                <div className="space-y-2">
                  {program.subPrograms.map((sub, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm bg-blue-50 text-blue-700 px-3 py-2 rounded-lg">
                      <ChevronLeft className="w-3.5 h-3.5" />
                      {sub}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* KPIs placeholder */}
            <div className="card p-5">
              <h3 className="font-bold text-gray-800 mb-4">مؤشرات الأداء</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {program.outcomes.map((o, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-blue-700">{[35, 120, 12, 8][i] ?? "–"}</div>
                    <div className="text-xs text-gray-500 mt-1">{o.split(" ").slice(0, 3).join(" ")}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}

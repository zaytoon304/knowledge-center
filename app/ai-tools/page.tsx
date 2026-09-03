"use client";
import Link from "next/link";
import { ClipboardList, FileQuestion, FileText, Network, Bot, Sparkles, Lock, Puzzle, ScanText, Trophy, History } from "lucide-react";
import { useAiOwner } from "@/lib/aiHistory";

interface AiTool {
  href: string;
  title: string;
  description: string;
  icon: typeof ClipboardList;
  color: string;
  ready: boolean;
}

const TOOLS: AiTool[] = [
  {
    href: "/ai-tools/lesson-plan",
    title: "مولّد خطة الدرس",
    description: "خطة حصة كاملة بالأهداف والوسائل وخطوات الدرس والتقويم، خلال ثوانٍ.",
    icon: ClipboardList,
    color: "from-violet-700 to-purple-500",
    ready: true,
  },
  {
    href: "/ai-tools/question-generator",
    title: "مولّد الأسئلة",
    description: "أسئلة اختيار من متعدد وصح/خطأ ومقالية جاهزة لأي موضوع ومرحلة دراسية.",
    icon: FileQuestion,
    color: "from-blue-700 to-cyan-500",
    ready: true,
  },
  {
    href: "/ai-tools/worksheet",
    title: "مولّد ورقة العمل",
    description: "ورقة عمل جاهزة للطباعة مع تدريبات متدرجة الصعوبة.",
    icon: FileText,
    color: "from-emerald-700 to-teal-500",
    ready: true,
  },
  {
    href: "/ai-tools/mind-map",
    title: "مولّد الخريطة الذهنية",
    description: "حوّل أي موضوع درس إلى خريطة ذهنية بصرية واضحة.",
    icon: Network,
    color: "from-amber-600 to-orange-500",
    ready: true,
  },
  {
    href: "/ai-tools/activity-generator",
    title: "مولّد الأنشطة الصفية",
    description: "نشاط ممتع جماعي أو تنافسي أو حركي، جاهز للتنفيذ فوراً داخل الفصل.",
    icon: Puzzle,
    color: "from-pink-700 to-rose-500",
    ready: true,
  },
  {
    href: "/ai-tools/competition-generator",
    title: "مولّد المسابقات الصفية",
    description: "مسابقة جاهزة بقواعدها ونظام نقاطها لإشعال حماس الصف.",
    icon: Trophy,
    color: "from-red-700 to-orange-500",
    ready: true,
  },
  {
    href: "/ai-tools/paper-grading",
    title: "تصحيح الأوراق بالذكاء الاصطناعي",
    description: "ارفع صورة ورقة الطالب ويصححها الذكاء الاصطناعي تلقائياً.",
    icon: ScanText,
    color: "from-indigo-700 to-blue-500",
    ready: true,
  },
  {
    href: "/ai-assistant",
    title: "المساعد الذكي",
    description: "محادثة مباشرة مع الذكاء الاصطناعي لأي سؤال أو فكرة.",
    icon: Bot,
    color: "from-fuchsia-700 to-pink-500",
    ready: true,
  },
];

export default function AiToolsHubPage() {
  const { ownerId } = useAiOwner();
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card p-6 bg-gradient-to-l from-violet-800 via-purple-700 to-fuchsia-700 text-white">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">أدوات الذكاء الاصطناعي</h1>
              <p className="text-white/90 text-sm mt-1">كل الأدوات التي تحتاجها لإعداد حصتك وإثراء صفك — مدعومة بالذكاء الاصطناعي مجاناً</p>
            </div>
          </div>
          {ownerId && (
            <Link href="/ai-tools/history" className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 transition-colors px-3 py-2 rounded-xl text-xs font-semibold flex-shrink-0">
              <History className="w-4 h-4" /> سجل أعمالي
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TOOLS.map(tool => {
          const Icon = tool.icon;
          const cardClass = `card p-5 flex flex-col gap-3 transition-all ${tool.ready ? "hover:shadow-lg hover:-translate-y-0.5 cursor-pointer" : "opacity-70"}`;
          const content = (
            <>
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-l ${tool.color} flex items-center justify-center text-white flex-shrink-0`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-800">{tool.title}</h3>
                  {!tool.ready && (
                    <span className="flex items-center gap-1 text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                      <Lock className="w-3 h-3" /> قريباً
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{tool.description}</p>
              </div>
            </>
          );
          return tool.ready ? (
            <Link key={tool.href} href={tool.href} className={cardClass}>{content}</Link>
          ) : (
            <div key={tool.href} className={cardClass}>{content}</div>
          );
        })}
      </div>
    </div>
  );
}

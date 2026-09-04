"use client";
import { useState, useEffect, useMemo } from "react";
import { Award, Star, Gavel, CalendarDays, Sparkles, TrendingUp, Target } from "lucide-react";
import { cloudGet, cloudListen } from "@/lib/cloud";
import { DailyLogEntry, PlatformAchievement } from "@/contexts/AuthContext";
import { AuctionItem, AuctionState } from "@/lib/auction";
import { DEFAULT_ROBOTICS_SKILLS, findSkill, type Skill, type SkillMastery } from "@/lib/skillMap";
import CenterLogo from "@/components/icons/CenterLogo";

interface Certificate {
  id: string; studentId: string; studentName: string;
  type: "program" | "competition" | "achievement" | "participation";
  title: string; description: string; date: string; issuedBy: string; createdAt: string;
}

const CERT_META: Record<Certificate["type"], { label: string; emoji: string }> = {
  program: { label: "إتمام برنامج", emoji: "📚" },
  competition: { label: "الفوز بمسابقة", emoji: "🏆" },
  achievement: { label: "إنجاز متميز", emoji: "⭐" },
  participation: { label: "المشاركة الفعّالة", emoji: "🌟" },
};

const SLIDE_DURATION_MS = 8000;
const REFRESH_DATA_MS = 60000;

type Slide =
  | { kind: "certificate"; data: Certificate }
  | { kind: "achievement"; data: PlatformAchievement }
  | { kind: "auction"; data: AuctionItem }
  | { kind: "daily"; data: DailyLogEntry }
  | { kind: "skillMastery"; data: SkillMastery };

function sortByDateDesc<T extends { createdAt: string }>(arr: T[]): T[] {
  return [...arr].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export default function WallOfFamePage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [achievements, setAchievements] = useState<PlatformAchievement[]>([]);
  const [auctions, setAuctions] = useState<AuctionItem[]>([]);
  const [dailyLog, setDailyLog] = useState<DailyLogEntry[]>([]);
  const [skillMasteries, setSkillMasteries] = useState<SkillMastery[]>([]);
  const [robotSkills, setRobotSkills] = useState<Skill[]>(DEFAULT_ROBOTICS_SKILLS);
  const [featuredAuctionState, setFeaturedAuctionState] = useState<AuctionState | null>(null);
  const [index, setIndex] = useState(0);
  const [now, setNow] = useState(new Date());

  const fetchAll = () => {
    cloudGet<Certificate[]>("kc_certificates").then(d => setCertificates(Array.isArray(d) ? d : []));
    cloudGet<PlatformAchievement[]>("kc_platform_achievements").then(d => setAchievements(Array.isArray(d) ? d : []));
    cloudGet<AuctionItem[]>("kc_auctions").then(d => setAuctions(Array.isArray(d) ? d : []));
    cloudGet<DailyLogEntry[]>("kc_daily_log").then(d => setDailyLog(Array.isArray(d) ? d : []));
    cloudGet<SkillMastery[]>("kc_skill_mastery").then(d => setSkillMasteries(Array.isArray(d) ? d : []));
    cloudGet<Skill[]>("kc_robotics_skills").then(d => { if (Array.isArray(d) && d.length > 0) setRobotSkills(d); });
  };

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, REFRESH_DATA_MS);
    const clock = setInterval(() => setNow(new Date()), 1000);
    return () => { clearInterval(interval); clearInterval(clock); };
  }, []);

  const featuredAuction = useMemo(() => sortByDateDesc(auctions)[0] ?? null, [auctions]);

  useEffect(() => {
    if (!featuredAuction) { setFeaturedAuctionState(null); return; }
    return cloudListen<AuctionState>(`kc_auction_state/${featuredAuction.id}`, setFeaturedAuctionState);
  }, [featuredAuction]);

  const slides: Slide[] = useMemo(() => {
    const list: Slide[] = [];
    sortByDateDesc(certificates).slice(0, 3).forEach(c => list.push({ kind: "certificate", data: c }));
    sortByDateDesc(achievements).slice(0, 2).forEach(a => list.push({ kind: "achievement", data: a }));
    if (featuredAuction) list.push({ kind: "auction", data: featuredAuction });
    sortByDateDesc(dailyLog).slice(0, 2).forEach(d => list.push({ kind: "daily", data: d }));
    [...skillMasteries]
      .filter(m => m.status === "approved")
      .sort((a, b) => (b.reviewedAt || "").localeCompare(a.reviewedAt || ""))
      .slice(0, 2)
      .forEach(m => list.push({ kind: "skillMastery", data: m }));
    return list;
  }, [certificates, achievements, featuredAuction, dailyLog, skillMasteries]);

  useEffect(() => {
    if (slides.length === 0) return;
    const t = setInterval(() => setIndex(i => (i + 1) % slides.length), SLIDE_DURATION_MS);
    return () => clearInterval(t);
  }, [slides.length]);

  useEffect(() => {
    if (index >= slides.length) setIndex(0);
  }, [slides.length, index]);

  const slide = slides[index];

  return (
    <div className="fixed inset-0 bg-slate-950 text-white overflow-hidden select-none" dir="rtl">
      {/* خلفية زخرفية ثابتة */}
      <div className="absolute inset-0 opacity-[0.07]" style={{
        backgroundImage: "radial-gradient(circle at 20% 30%, white 1.5px, transparent 1.5px), radial-gradient(circle at 80% 75%, white 1.5px, transparent 1.5px)",
        backgroundSize: "60px 60px"
      }} />

      {/* شريط علوي: الشعار + الوقت */}
      <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-10 py-6">
        <div className="flex items-center gap-3">
          <CenterLogo className="w-12 h-12" />
          <div>
            <p className="font-bold text-lg leading-tight">مركز المعرفة والابتكار STEAM</p>
            <p className="text-slate-400 text-xs">بمدارس الأرقم</p>
          </div>
        </div>
        <div className="text-left">
          <p className="text-2xl font-bold tabular-nums">{now.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}</p>
          <p className="text-slate-400 text-xs">{now.toLocaleDateString("ar-SA", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
        </div>
      </div>

      {/* شريط تقدم السلايد */}
      {slides.length > 1 && (
        <div className="absolute top-[92px] inset-x-10 z-20 flex gap-1.5">
          {slides.map((_, i) => (
            <div key={i} className="h-1 flex-1 rounded-full bg-white/15 overflow-hidden">
              {i === index && (
                <div key={now.getSeconds() + "-" + index} className="h-full bg-white/80 rounded-full"
                  style={{ animation: `wof-progress ${SLIDE_DURATION_MS}ms linear forwards` }} />
              )}
              {i < index && <div className="h-full bg-white/50 rounded-full" />}
            </div>
          ))}
        </div>
      )}

      <style>{`@keyframes wof-progress { from { width: 0% } to { width: 100% } }`}</style>

      {/* المحتوى */}
      <div className="relative z-10 h-full flex items-center justify-center px-16">
        {!slide ? (
          <div className="text-center animate-fade-in">
            <CenterLogo className="w-28 h-28 mx-auto mb-6 opacity-80" />
            <h1 className="text-4xl font-bold mb-2">مركز المعرفة والابتكار STEAM</h1>
            <p className="text-slate-400 text-lg flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" /> إنجازات ومشاريع طلابنا تظهر هنا قريباً
            </p>
          </div>
        ) : slide.kind === "certificate" ? (
          <div key={index} className="animate-fade-in flex items-center gap-14 max-w-5xl w-full">
            <div className="w-64 h-64 rounded-[2.5rem] bg-gradient-to-br from-amber-600 to-yellow-500 flex items-center justify-center text-[120px] shadow-2xl flex-shrink-0">
              {CERT_META[slide.data.type].emoji}
            </div>
            <div className="flex-1">
              <p className="text-amber-400 font-bold text-lg mb-2 flex items-center gap-2">
                <Award className="w-5 h-5" /> {CERT_META[slide.data.type].label}
              </p>
              <h1 className="text-5xl font-bold mb-4 leading-tight">{slide.data.studentName}</h1>
              <p className="text-2xl text-slate-300 mb-3">{slide.data.title}</p>
              <p className="text-slate-500">{slide.data.issuedBy} • {slide.data.date}</p>
            </div>
          </div>
        ) : slide.kind === "achievement" ? (
          <div key={index} className="animate-fade-in flex items-center gap-14 max-w-5xl w-full">
            {slide.data.image ? (
              <img src={slide.data.image} alt="" className="w-72 h-72 object-cover rounded-[2.5rem] shadow-2xl flex-shrink-0" />
            ) : (
              <div className="w-64 h-64 rounded-[2.5rem] bg-gradient-to-br from-violet-700 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-2xl">
                <Star className="w-24 h-24 text-white/80" />
              </div>
            )}
            <div className="flex-1">
              <p className="text-violet-400 font-bold text-lg mb-2 flex items-center gap-2">
                <Star className="w-5 h-5" /> إنجاز المنصة
              </p>
              <h1 className="text-5xl font-bold mb-4 leading-tight">{slide.data.title}</h1>
              <p className="text-xl text-slate-300 leading-relaxed">{slide.data.description}</p>
              <p className="text-slate-500 mt-4">{slide.data.date}</p>
            </div>
          </div>
        ) : slide.kind === "auction" ? (
          <div key={index} className="animate-fade-in flex items-center gap-14 max-w-5xl w-full">
            <img src={slide.data.image} alt="" className="w-72 h-72 object-cover rounded-[2.5rem] shadow-2xl flex-shrink-0 border-4 border-amber-500/30" />
            <div className="flex-1">
              <p className="text-amber-400 font-bold text-lg mb-2 flex items-center gap-2">
                <Gavel className="w-5 h-5" /> مزاد مشاريع الطلاب — نشط الآن
              </p>
              <h1 className="text-5xl font-bold mb-3 leading-tight">{slide.data.title}</h1>
              <p className="text-lg text-slate-400 mb-5">بإبداع الطالب: {slide.data.studentName}</p>
              <div className="flex items-center gap-3 bg-white/5 border border-amber-500/20 rounded-2xl px-6 py-4 w-fit">
                <TrendingUp className="w-8 h-8 text-amber-400" />
                <div>
                  <p className="text-slate-400 text-sm">السعر الحالي</p>
                  <p className="text-4xl font-bold text-amber-400">{(featuredAuctionState?.currentPrice ?? slide.data.startingPrice).toLocaleString("ar-SA")} ريال</p>
                </div>
              </div>
            </div>
          </div>
        ) : slide.kind === "skillMastery" ? (
          <div key={index} className="animate-fade-in flex items-center gap-14 max-w-5xl w-full">
            <div className="w-64 h-64 rounded-[2.5rem] bg-gradient-to-br from-emerald-600 to-teal-500 flex items-center justify-center text-[100px] shadow-2xl flex-shrink-0">
              {findSkill(robotSkills, slide.data.skillId)?.emoji || "🤖"}
            </div>
            <div className="flex-1">
              <p className="text-emerald-400 font-bold text-lg mb-2 flex items-center gap-2">
                <Target className="w-5 h-5" /> إتقان مهارة جديدة
              </p>
              <h1 className="text-5xl font-bold mb-4 leading-tight">{slide.data.studentName}</h1>
              <p className="text-2xl text-slate-300 mb-3">أتقن مهارة: {findSkill(robotSkills, slide.data.skillId)?.title || slide.data.skillId}</p>
              <p className="text-slate-500">اعتمدها المشرف بتاريخ {slide.data.reviewedAt ? new Date(slide.data.reviewedAt).toLocaleDateString("ar-SA") : ""}</p>
            </div>
          </div>
        ) : (
          <div key={index} className="animate-fade-in flex items-center gap-14 max-w-5xl w-full">
            {slide.data.images?.[0]?.data ? (
              <img src={slide.data.images[0].data} alt="" className="w-72 h-72 object-cover rounded-[2.5rem] shadow-2xl flex-shrink-0" />
            ) : (
              <div className="w-64 h-64 rounded-[2.5rem] bg-gradient-to-br from-blue-700 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-2xl">
                <CalendarDays className="w-24 h-24 text-white/80" />
              </div>
            )}
            <div className="flex-1">
              <p className="text-blue-400 font-bold text-lg mb-2 flex items-center gap-2">
                <CalendarDays className="w-5 h-5" /> من يوميات المركز
              </p>
              <h1 className="text-5xl font-bold mb-4 leading-tight">{slide.data.title}</h1>
              <p className="text-xl text-slate-300 leading-relaxed">{slide.data.description}</p>
              <p className="text-slate-500 mt-4">{slide.data.date}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

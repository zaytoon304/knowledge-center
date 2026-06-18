"use client";
import { useEffect, useState } from "react";
import { Radio, Calendar, Eye, AlertCircle, ExternalLink, PenLine } from "lucide-react";
import Link from "next/link";

type StreamType = "youtube" | "meet" | "zoom";

interface LiveConfig {
  isLive: boolean;
  streamType: StreamType;
  title: string;
  url: string;
  description: string;
  scheduledAt: string;
}

function extractYouTubeId(url: string): string {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/live\/([^&\n?#]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return "";
}

function loadLive(): LiveConfig {
  try {
    const d = localStorage.getItem("kc_live_stream");
    return d ? JSON.parse(d) : { isLive: false, streamType: "youtube", title: "", url: "", description: "", scheduledAt: "" };
  } catch { return { isLive: false, streamType: "youtube", title: "", url: "", description: "", scheduledAt: "" }; }
}

const TYPE_INFO: Record<StreamType, { label: string; color: string; icon: string; btnColor: string; btnText: string }> = {
  youtube: { label: "YouTube Live", color: "from-red-700 to-rose-600", icon: "▶", btnColor: "bg-red-600 hover:bg-red-500", btnText: "شاهد على YouTube" },
  meet: { label: "Google Meet", color: "from-blue-700 to-indigo-600", icon: "🎥", btnColor: "bg-blue-600 hover:bg-blue-500", btnText: "انضم عبر Google Meet" },
  zoom: { label: "Zoom", color: "from-sky-700 to-blue-600", icon: "📹", btnColor: "bg-sky-600 hover:bg-sky-500", btnText: "انضم عبر Zoom" },
};

export default function LivePage() {
  const [config, setConfig] = useState<LiveConfig | null>(null);
  const [viewers] = useState(Math.floor(Math.random() * 40) + 5);

  useEffect(() => { setConfig(loadLive()); }, []);

  if (!config) return null;

  const typeInfo = TYPE_INFO[config.streamType || "youtube"];
  const isYouTube = config.streamType === "youtube";
  const videoId = isYouTube && config.url ? extractYouTubeId(config.url) : "";
  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` : "";

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className={`card p-5 text-white ${config.isLive ? `bg-gradient-to-l ${typeInfo.color}` : "bg-gradient-to-l from-gray-700 to-gray-600"}`}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <Radio className={`w-6 h-6 ${config.isLive ? "animate-pulse" : ""}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold">البث المباشر</h1>
              {config.isLive && (
                <span className="flex items-center gap-1 bg-red-500/80 text-white text-xs px-2.5 py-0.5 rounded-full font-bold animate-pulse">
                  <span className="w-1.5 h-1.5 bg-white rounded-full"></span> LIVE
                </span>
              )}
              {config.isLive && (
                <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">{typeInfo.label}</span>
              )}
            </div>
            <p className="text-white/80 text-sm mt-0.5">
              {config.isLive ? (config.title || "جلسة مباشرة") : "لا يوجد بث حالياً"}
            </p>
          </div>
          {config.isLive && (
            <div className="flex items-center gap-1.5 bg-white/10 rounded-xl px-3 py-1.5">
              <Eye className="w-4 h-4 text-white/70" />
              <span className="text-sm font-bold">{viewers}</span>
              <span className="text-xs text-white/70">مشاهد</span>
            </div>
          )}
        </div>
      </div>

      {/* زر السبورة الذكية */}
      <div className="card p-4 flex items-center justify-between bg-gradient-to-l from-indigo-50 to-blue-50 border border-indigo-100">
        <div>
          <p className="font-bold text-indigo-800 text-sm">🖊️ السبورة الذكية</p>
          <p className="text-indigo-500 text-xs mt-0.5">ارسم وشرح واكتب أثناء البث</p>
        </div>
        <Link href="/whiteboard" className="flex items-center gap-2 bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-600 transition-colors">
          <PenLine className="w-4 h-4" /> افتح السبورة
        </Link>
      </div>

      {config.isLive && config.url ? (
        <>
          {/* YouTube: تشغيل داخل المنصة */}
          {isYouTube && embedUrl ? (
            <div className="card overflow-hidden">
              <div className="relative" style={{ paddingBottom: "56.25%" }}>
                <iframe
                  src={embedUrl}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          ) : (
            /* Google Meet / Zoom: زر الانضمام */
            <div className="card p-10 text-center">
              <div className="text-6xl mb-5">{typeInfo.icon}</div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">{config.title || "اجتماع مباشر"}</h2>
              {config.description && <p className="text-gray-500 text-sm mb-6">{config.description}</p>}
              <a href={config.url} target="_blank" rel="noopener noreferrer"
                className={`inline-flex items-center gap-3 ${typeInfo.btnColor} text-white px-8 py-4 rounded-2xl text-base font-bold transition-colors shadow-lg`}>
                <ExternalLink className="w-5 h-5" />
                {typeInfo.btnText}
              </a>
              <p className="text-xs text-gray-400 mt-4">سيُفتح الاجتماع في نافذة جديدة</p>
            </div>
          )}

          {/* معلومات البث */}
          {isYouTube && (config.title || config.description) && (
            <div className="card p-5">
              {config.title && <h2 className="text-lg font-bold text-gray-800 mb-2">{config.title}</h2>}
              {config.description && <p className="text-gray-600 text-sm leading-relaxed">{config.description}</p>}
              {config.url && (
                <a href={config.url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-red-600 text-xs mt-3 hover:underline">
                  <ExternalLink className="w-3 h-3" /> فتح على YouTube
                </a>
              )}
            </div>
          )}

          {/* بطاقات خيارات المنصات */}
          <div className="card p-4">
            <p className="text-xs text-gray-400 mb-3 font-medium">منصات البث المدعومة</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "youtube", emoji: "▶", name: "YouTube Live", desc: "يُشغَّل داخل المنصة" },
                { id: "meet", emoji: "🎥", name: "Google Meet", desc: "ينفتح في نافذة جديدة" },
                { id: "zoom", emoji: "📹", name: "Zoom", desc: "ينفتح في نافذة جديدة" },
              ].map(p => (
                <div key={p.id} className={`rounded-xl p-3 text-center border ${config.streamType === p.id ? "border-blue-300 bg-blue-50" : "border-gray-100 bg-gray-50"}`}>
                  <div className="text-2xl mb-1">{p.emoji}</div>
                  <p className="text-xs font-bold text-gray-700">{p.name}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* لا يوجد بث */
        <div className="card p-10 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Radio className="w-10 h-10 text-gray-300" />
          </div>
          <h2 className="text-gray-500 font-bold text-lg mb-2">لا يوجد بث مباشر الآن</h2>
          <p className="text-gray-400 text-sm mb-6">سيُعلَن عن موعد البث التالي قريباً</p>

          {config.scheduledAt && (
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-2xl px-5 py-3 mb-6">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-blue-700 text-sm font-medium">البث القادم: {config.scheduledAt}</span>
            </div>
          )}

          {/* المنصات المدعومة */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { emoji: "▶", name: "YouTube Live", desc: "يُشغَّل داخل المنصة مباشرة" },
              { emoji: "🎥", name: "Google Meet", desc: "اجتماعات تفاعلية" },
              { emoji: "📹", name: "Zoom", desc: "مؤتمرات وحصص" },
            ].map(p => (
              <div key={p.name} className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                <div className="text-2xl mb-1">{p.emoji}</div>
                <p className="text-xs font-bold text-gray-700">{p.name}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{p.desc}</p>
              </div>
            ))}
          </div>

          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 text-right">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-800 text-sm font-semibold mb-1">للمشرف: كيفية تفعيل البث</p>
                <ol className="text-amber-700 text-xs space-y-1 list-decimal list-inside">
                  <li>افتح لوحة الإدارة ← البث المباشر</li>
                  <li>اختر المنصة (YouTube / Meet / Zoom)</li>
                  <li>الصق الرابط وأدخل عنوان الجلسة</li>
                  <li>فعّل "البث نشط الآن" وانقر حفظ</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

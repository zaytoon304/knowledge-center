"use client";
import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import {
  Mail, Phone, Globe, Award, BookOpen, Briefcase, Star,
  Download, Share2, QrCode, ChevronDown, ChevronUp, GraduationCap,
  Lightbulb, Users, Calendar, MapPin, Printer, CheckCircle
} from "lucide-react";
import CenterLogo from "@/components/icons/CenterLogo";

const QRCodeSVG = dynamic(() => import("qrcode.react").then(m => m.QRCodeSVG), { ssr: false });

interface SupervisorProfile {
  name: string;
  nameEn: string;
  title: string;
  subtitle: string;
  bio: string;
  photo: string;
  phone: string;
  email: string;
  twitter: string;
  location: string;
  skills: string[];
  education: Array<{ degree: string; institution: string; year: string; emoji: string }>;
  experience: Array<{ role: string; org: string; period: string; desc: string }>;
  certificates: Array<{ title: string; issuer: string; year: string; image: string }>;
  cvFile: string;
  cvName: string;
  siteUrl: string;
}

const DEFAULT_PROFILE: SupervisorProfile = {
  name: "اسمك الكريم",
  nameEn: "Your Name",
  title: "مشرف الموهبة والذكاء الاصطناعي",
  subtitle: "مدارس الأرقم — مركز المعرفة والابتكار STEAM",
  bio: "أضف نبذة تعريفية عن نفسك ومسيرتك المهنية من لوحة الإدارة.",
  photo: "",
  phone: "",
  email: "",
  twitter: "",
  location: "المملكة العربية السعودية",
  skills: ["الذكاء الاصطناعي", "الروبوتيك", "برمجة Python", "STEAM", "تعليم الابتكار", "التفكير النقدي"],
  education: [],
  experience: [],
  certificates: [],
  cvFile: "",
  cvName: "",
  siteUrl: "",
};

function loadProfile(): SupervisorProfile {
  try {
    const d = localStorage.getItem("kc_supervisor_profile");
    return d ? { ...DEFAULT_PROFILE, ...JSON.parse(d) } : DEFAULT_PROFILE;
  } catch { return DEFAULT_PROFILE; }
}

export default function SupervisorPage() {
  const [profile, setProfile] = useState<SupervisorProfile>(DEFAULT_PROFILE);
  const [pageUrl, setPageUrl] = useState("");
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expandBio, setExpandBio] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setProfile(loadProfile());
    setPageUrl(window.location.href);
  }, []);

  const shareUrl = profile.siteUrl || pageUrl;

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const printQR = () => {
    const el = document.getElementById("qr-print-area");
    if (!el) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`
      <html dir="rtl"><head><title>QR Code - ${profile.name}</title>
      <style>
        body { font-family: Arial, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f8fafc; }
        .card { text-align: center; padding: 40px; background: white; border-radius: 24px; box-shadow: 0 4px 24px #0001; }
        .name { font-size: 22px; font-weight: bold; color: #1e3a8a; margin: 16px 0 4px; }
        .title { font-size: 14px; color: #6b7280; margin-bottom: 8px; }
        .url { font-size: 12px; color: #9ca3af; margin-top: 12px; word-break: break-all; }
        svg { display: block; margin: 0 auto; }
      </style></head>
      <body><div class="card">
        ${el.innerHTML}
        <div class="name">${profile.name}</div>
        <div class="title">${profile.title}</div>
        <div class="url">${shareUrl}</div>
      </div></body></html>`);
    w.document.close();
    w.print();
  };

  const bioShort = profile.bio.length > 200 ? profile.bio.slice(0, 200) + "..." : profile.bio;

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in pb-10" ref={printRef}>

      {/* ===== HERO ===== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900 via-indigo-900 to-violet-900 text-white p-6">
        {/* خلفية زخرفية */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }} />
        <div className="absolute top-0 left-0 w-32 h-32 bg-yellow-400/10 rounded-full -translate-x-8 -translate-y-8" />
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-indigo-400/10 rounded-full translate-x-10 translate-y-10" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {/* صورة */}
          <div className="flex-shrink-0">
            <div className="w-28 h-28 rounded-2xl overflow-hidden border-4 border-white/30 shadow-xl bg-white/10 flex items-center justify-center">
              {profile.photo
                ? <img src={profile.photo} alt={profile.name} className="w-full h-full object-cover" />
                : <CenterLogo className="w-20 h-20 opacity-80" />
              }
            </div>
          </div>

          {/* البيانات */}
          <div className="text-center sm:text-right flex-1">
            <div className="text-blue-300 text-xs font-medium mb-1 flex items-center justify-center sm:justify-start gap-1">
              <CenterLogo className="w-4 h-4" />
              <span>مركز المعرفة والابتكار STEAM</span>
            </div>
            <h1 className="text-2xl font-bold leading-tight">{profile.name}</h1>
            {profile.nameEn && <p className="text-blue-300 text-sm font-medium">{profile.nameEn}</p>}
            <p className="text-yellow-300 font-semibold mt-1 text-sm">{profile.title}</p>
            <p className="text-blue-200 text-xs mt-0.5">{profile.subtitle}</p>

            {/* التواصل */}
            <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-3">
              {profile.phone && (
                <a href={`tel:${profile.phone}`}
                  className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-xl text-xs transition-colors">
                  <Phone className="w-3.5 h-3.5" /> {profile.phone}
                </a>
              )}
              {profile.email && (
                <a href={`mailto:${profile.email}`}
                  className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-xl text-xs transition-colors">
                  <Mail className="w-3.5 h-3.5" /> {profile.email}
                </a>
              )}
              {profile.twitter && (
                <span className="flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-xl text-xs">
                  <Globe className="w-3.5 h-3.5" /> {profile.twitter}
                </span>
              )}
              {profile.location && (
                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl text-xs text-blue-200">
                  <MapPin className="w-3.5 h-3.5" /> {profile.location}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* أزرار مشاركة */}
        <div className="relative z-10 flex flex-wrap gap-2 mt-5 pt-4 border-t border-white/10">
          <button onClick={() => setShowQR(!showQR)}
            className="flex items-center gap-2 bg-yellow-400 text-blue-900 px-4 py-2 rounded-xl text-sm font-bold hover:bg-yellow-300 transition-colors">
            <QrCode className="w-4 h-4" /> رمز QR للمشاركة
          </button>
          <button onClick={copyLink}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
            {copied ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Share2 className="w-4 h-4" />}
            {copied ? "تم النسخ!" : "نسخ الرابط"}
          </button>
          {profile.cvFile && (
            <a href={profile.cvFile} download={profile.cvName || "cv.pdf"}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
              <Download className="w-4 h-4" /> تحميل السيرة الذاتية
            </a>
          )}
        </div>
      </div>

      {/* ===== QR Code Panel ===== */}
      {showQR && (
        <div className="card p-6 text-center space-y-4 border-2 border-yellow-200 bg-yellow-50/50">
          <h3 className="font-bold text-gray-800 flex items-center justify-center gap-2">
            <QrCode className="w-5 h-5 text-yellow-600" /> رمز QR الخاص بك
          </h3>
          <div id="qr-print-area" className="flex justify-center">
            <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
              <QRCodeSVG value={shareUrl} size={180} level="H"
                imageSettings={{ src: "", height: 0, width: 0, excavate: false }}
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 break-all">{shareUrl}</p>
          <div className="flex justify-center gap-3">
            <button onClick={printQR}
              className="flex items-center gap-2 bg-blue-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700">
              <Printer className="w-4 h-4" /> طباعة QR
            </button>
            <button onClick={copyLink}
              className="flex items-center gap-2 bg-gray-100 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-200">
              {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
              {copied ? "تم النسخ!" : "نسخ الرابط"}
            </button>
          </div>
          <p className="text-xs text-blue-700 bg-blue-50 rounded-xl p-2">
            💡 اطبع هذا الرمز وضعه في بطاقتك المهنية أو عروضك التقديمية
          </p>
        </div>
      )}

      {/* ===== نبذة ===== */}
      {profile.bio && (
        <div className="card p-5">
          <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-base">
            <Lightbulb className="w-5 h-5 text-yellow-500" /> نبذة تعريفية
          </h2>
          <p className="text-gray-700 text-sm leading-relaxed">
            {expandBio || profile.bio.length <= 200 ? profile.bio : bioShort}
          </p>
          {profile.bio.length > 200 && (
            <button onClick={() => setExpandBio(!expandBio)}
              className="mt-2 flex items-center gap-1 text-blue-700 text-xs font-medium">
              {expandBio ? <><ChevronUp className="w-3.5 h-3.5" /> عرض أقل</> : <><ChevronDown className="w-3.5 h-3.5" /> عرض المزيد</>}
            </button>
          )}
        </div>
      )}

      {/* ===== المهارات ===== */}
      {profile.skills.length > 0 && (
        <div className="card p-5">
          <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-base">
            <Star className="w-5 h-5 text-indigo-500" /> التخصصات والمهارات
          </h2>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((s, i) => (
              <span key={i} className="bg-blue-50 border border-blue-200 text-blue-800 px-3 py-1.5 rounded-xl text-sm font-medium">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ===== التعليم ===== */}
      {profile.education.length > 0 && (
        <div className="card p-5">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-base">
            <GraduationCap className="w-5 h-5 text-emerald-600" /> المؤهلات العلمية
          </h2>
          <div className="space-y-3">
            {profile.education.map((e, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-emerald-50 rounded-xl">
                <span className="text-2xl flex-shrink-0">{e.emoji || "🎓"}</span>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{e.degree}</p>
                  <p className="text-emerald-700 text-sm">{e.institution}</p>
                  {e.year && <p className="text-gray-400 text-xs mt-0.5">{e.year}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== الخبرات ===== */}
      {profile.experience.length > 0 && (
        <div className="card p-5">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-base">
            <Briefcase className="w-5 h-5 text-violet-600" /> الخبرات المهنية
          </h2>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute right-4 top-2 bottom-2 w-0.5 bg-violet-100" />
            <div className="space-y-4 pr-10">
              {profile.experience.map((ex, i) => (
                <div key={i} className="relative">
                  <div className="absolute -right-7 top-1 w-3 h-3 rounded-full bg-violet-500 border-2 border-white shadow" />
                  <div className="bg-violet-50 rounded-xl p-3">
                    <p className="font-semibold text-gray-800 text-sm">{ex.role}</p>
                    <p className="text-violet-700 text-sm">{ex.org}</p>
                    {ex.period && (
                      <div className="flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <p className="text-gray-400 text-xs">{ex.period}</p>
                      </div>
                    )}
                    {ex.desc && <p className="text-gray-600 text-xs mt-1 leading-relaxed">{ex.desc}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== الشهادات ===== */}
      {profile.certificates.length > 0 && (
        <div className="card p-5">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-base">
            <Award className="w-5 h-5 text-yellow-600" /> الشهادات والدورات
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {profile.certificates.map((c, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-100 rounded-xl">
                {c.image
                  ? <img src={c.image} alt={c.title} className="w-14 h-14 object-cover rounded-lg flex-shrink-0 border border-yellow-200" />
                  : <div className="w-14 h-14 bg-yellow-200 rounded-lg flex items-center justify-center flex-shrink-0 text-2xl">🏅</div>
                }
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 text-sm">{c.title}</p>
                  {c.issuer && <p className="text-yellow-700 text-xs">{c.issuer}</p>}
                  {c.year && <p className="text-gray-400 text-xs">{c.year}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== Footer ===== */}
      <div className="card p-4 bg-gradient-to-l from-blue-900 to-indigo-900 text-white text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <CenterLogo className="w-8 h-8" />
          <div className="text-sm">
            <div className="font-bold">مركز المعرفة والابتكار STEAM</div>
            <div className="text-blue-300 text-xs">بمدارس الأرقم</div>
          </div>
        </div>
        <p className="text-blue-200 text-xs">لمزيد من المعلومات تواصل معنا عبر الرابط أو رمز QR</p>
      </div>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Printer, Copy, CheckCircle, Settings2, Globe } from "lucide-react";
import CenterLogo from "@/components/icons/CenterLogo";

const QRCodeSVG = dynamic(() => import("qrcode.react").then(m => m.QRCodeSVG), { ssr: false });

export default function PlatformQRPage() {
  const [url, setUrl] = useState("");
  const [savedUrl, setSavedUrl] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("kc_platform_url");
    const auto = stored || `${window.location.origin}/login`;
    setUrl(auto);
    setSavedUrl(auto);
  }, []);

  const saveUrl = () => {
    const final = url.trim() || `${window.location.origin}/login`;
    localStorage.setItem("kc_platform_url", final);
    setSavedUrl(final);
    setEditMode(false);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(savedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const print = () => {
    window.print();
  };

  return (
    <>
      {/* ===== ستايل الطباعة ===== */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #print-area, #print-area * { visibility: visible !important; }
          #print-area { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="max-w-lg mx-auto space-y-5 animate-fade-in">

        {/* Header */}
        <div className="card p-5 bg-gradient-to-l from-blue-900 to-indigo-800 text-white no-print">
          <div className="flex items-center gap-3">
            <CenterLogo className="w-11 h-11" />
            <div>
              <h1 className="font-bold text-lg">باركود المنصة</h1>
              <p className="text-blue-200 text-xs">امسح الكود للتسجيل في مركز المعرفة والابتكار STEAM</p>
            </div>
          </div>
        </div>

        {/* إعداد الرابط */}
        <div className="card p-4 no-print">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-700 text-sm flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-600" /> رابط المنصة
            </h3>
            <button onClick={() => setEditMode(!editMode)}
              className="text-xs text-blue-700 flex items-center gap-1 hover:underline">
              <Settings2 className="w-3.5 h-3.5" /> {editMode ? "إلغاء" : "تعديل"}
            </button>
          </div>

          {editMode ? (
            <div className="flex gap-2">
              <input value={url} onChange={e => setUrl(e.target.value)}
                dir="ltr" placeholder="https://your-domain.com/login"
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm font-mono outline-none focus:border-blue-500 bg-gray-50" />
              <button onClick={saveUrl}
                className="bg-blue-800 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700">
                حفظ
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
              <p className="text-xs text-gray-600 font-mono flex-1 truncate" dir="ltr">{savedUrl}</p>
              <button onClick={copy} className="text-gray-400 hover:text-blue-600 flex-shrink-0">
                {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          )}
          {savedUrl.includes("localhost") && (
            <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-1.5 mt-2">
              ⚠️ الرابط الحالي يعمل فقط على جهازك. لمشاركة الباركود مع الجميع اضغط "تعديل" وأدخل رابط الموقع بعد نشره.
            </p>
          )}
        </div>

        {/* ===== بطاقة الباركود القابلة للطباعة ===== */}
        <div id="print-area">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">

            {/* Header البطاقة */}
            <div className="bg-gradient-to-l from-blue-900 to-indigo-800 p-6 text-white text-center">
              <div className="flex justify-center mb-3">
                <CenterLogo className="w-16 h-16 drop-shadow-lg" />
              </div>
              <h2 className="text-xl font-bold">مركز المعرفة والابتكار STEAM</h2>
              <p className="text-blue-200 text-sm mt-1">بمدارس الأرقم</p>
              <p className="text-yellow-300 text-xs mt-2 font-semibold">
                وحدة الموهبة والابتكار والذكاء الاصطناعي
              </p>
            </div>

            {/* QR Code */}
            <div className="p-8 flex flex-col items-center gap-4">
              <div className="p-4 bg-white rounded-2xl shadow-lg border-4 border-blue-900/10">
                <QRCodeSVG
                  value={savedUrl}
                  size={200}
                  level="H"
                  fgColor="#1e3a8a"
                />
              </div>

              <div className="text-center space-y-1">
                <p className="font-bold text-gray-800 text-lg">سجّل معنا الآن</p>
                <p className="text-gray-500 text-sm">امسح الرمز بكاميرا جوالك</p>
              </div>

              {/* خيارات التسجيل */}
              <div className="flex gap-3 flex-wrap justify-center">
                {[
                  { label: "طالب", emoji: "👨‍🎓", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
                  { label: "منسق", emoji: "👨‍🏫", color: "bg-blue-100 text-blue-800 border-blue-200" },
                  { label: "زائر", emoji: "🌐", color: "bg-teal-100 text-teal-800 border-teal-200" },
                ].map(opt => (
                  <div key={opt.label}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-semibold ${opt.color}`}>
                    <span>{opt.emoji}</span> {opt.label}
                  </div>
                ))}
              </div>

              {/* الرابط النصي */}
              <div className="w-full bg-gray-50 rounded-xl px-4 py-2.5 text-center border border-gray-100">
                <p className="text-xs text-gray-400 mb-0.5">أو ادخل مباشرة عبر الرابط</p>
                <p className="text-xs font-mono text-blue-700 break-all" dir="ltr">{savedUrl}</p>
              </div>
            </div>

            {/* Footer البطاقة */}
            <div className="bg-gray-50 border-t border-gray-100 px-6 py-3 text-center">
              <p className="text-xs text-gray-400">مدارس الأرقم • {new Date().getFullYear()}</p>
            </div>
          </div>
        </div>

        {/* أزرار الطباعة */}
        <div className="flex gap-3 no-print">
          <button onClick={print}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-900 text-white py-3 rounded-xl font-bold text-base hover:bg-blue-800 transition-colors">
            <Printer className="w-5 h-5" /> طباعة الباركود
          </button>
          <button onClick={copy}
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-5 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors">
            {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            {copied ? "تم!" : "نسخ الرابط"}
          </button>
        </div>

        {/* خطوات النشر */}
        {savedUrl.includes("localhost") && (
          <div className="card p-4 bg-amber-50 border border-amber-200 no-print">
            <h3 className="font-bold text-amber-800 mb-3 text-sm">📡 لتشغيل الباركود مع الجميع:</h3>
            <div className="space-y-2">
              {[
                { n: "1", text: 'افتح الترمنال واكتب: ! npx vercel' },
                { n: "2", text: "سجّل دخول بحساب GitHub أو بريد إلكتروني" },
                { n: "3", text: "اضغط Enter على كل الأسئلة" },
                { n: "4", text: "ستحصل على رابط مثل: https://knowledge-center-xxx.vercel.app" },
                { n: "5", text: "ارجع لهذه الصفحة واضغط تعديل وأدخل الرابط الجديد" },
              ].map(s => (
                <div key={s.n} className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-amber-600 text-white rounded-full text-xs flex items-center justify-center flex-shrink-0 font-bold">{s.n}</span>
                  <p className="text-xs text-amber-800">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </>
  );
}

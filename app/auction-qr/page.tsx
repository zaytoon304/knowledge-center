"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Printer, Copy, CheckCircle, Settings2, Globe, MessageCircle, Gavel } from "lucide-react";
import TalentActivityLogo from "@/components/icons/TalentActivityLogo";

const QRCodeSVG = dynamic(() => import("qrcode.react").then(m => m.QRCodeSVG), { ssr: false });

const WHATSAPP_MESSAGE = "أهلاً! 🔨 افتتحنا مزاد مشاريع الطلاب — تقدر تشوف المشاريع وترفع السعر لأي مشروع يعجبك:";

export default function AuctionQRPage() {
  const [url, setUrl] = useState("");
  const [savedUrl, setSavedUrl] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("kc_auction_url");
    const auto = stored || "https://knowledge-center-opal.vercel.app/auction";
    setUrl(auto);
    setSavedUrl(auto);
  }, []);

  const saveUrl = () => {
    const final = url.trim() || `${window.location.origin}/auction`;
    localStorage.setItem("kc_auction_url", final);
    setSavedUrl(final);
    setEditMode(false);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(savedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const print = () => window.print();

  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(WHATSAPP_MESSAGE + " " + savedUrl)}`;

  return (
    <>
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
        <div className="card p-5 bg-gradient-to-l from-amber-800 to-orange-700 text-white no-print">
          <div className="flex items-center gap-3">
            <TalentActivityLogo className="w-11 h-11" />
            <div>
              <h1 className="font-bold text-lg">باركود مزاد مشاريع الطلاب</h1>
              <p className="text-white font-semibold text-sm">شارك المزاد مع أولياء الأمور عبر واتساب أو الطباعة</p>
            </div>
          </div>
        </div>

        {/* إعداد الرابط */}
        <div className="card p-4 no-print">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-700 text-sm flex items-center gap-2">
              <Globe className="w-4 h-4 text-amber-600" /> رابط المزاد
            </h3>
            <button onClick={() => setEditMode(!editMode)}
              className="text-xs text-amber-700 flex items-center gap-1 hover:underline">
              <Settings2 className="w-3.5 h-3.5" /> {editMode ? "إلغاء" : "تعديل"}
            </button>
          </div>

          {editMode ? (
            <div className="flex gap-2">
              <input value={url} onChange={e => setUrl(e.target.value)}
                dir="ltr" placeholder="https://your-domain.com/auction"
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm font-mono outline-none focus:border-amber-500 bg-gray-50" />
              <button onClick={saveUrl}
                className="bg-amber-700 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-amber-600">
                حفظ
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
              <p className="text-xs text-gray-600 font-mono flex-1 truncate" dir="ltr">{savedUrl}</p>
              <button onClick={copy} className="text-gray-400 hover:text-amber-600 flex-shrink-0">
                {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          )}
          {savedUrl.includes("localhost") && (
            <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-1.5 mt-2">
              ⚠️ الرابط الحالي يعمل فقط على جهازك. اضغط "تعديل" وأدخل رابط الموقع المنشور فعلياً.
            </p>
          )}
        </div>

        {/* ===== بطاقة الباركود القابلة للطباعة ===== */}
        <div id="print-area">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">

            <div className="bg-gradient-to-l from-amber-800 to-orange-700 p-6 text-white text-center">
              <div className="flex justify-center mb-3">
                <TalentActivityLogo className="w-16 h-16 drop-shadow-lg" />
              </div>
              <h2 className="text-xl font-bold">وحدة الموهبة والنشاط الطلابي</h2>
              <p className="text-amber-200 text-sm mt-1">بمدارس الأرقم</p>
              <p className="text-yellow-300 text-xs mt-2 font-semibold flex items-center justify-center gap-1">
                <Gavel className="w-3.5 h-3.5" /> مزاد مشاريع الطلاب
              </p>
            </div>

            <div className="p-8 flex flex-col items-center gap-4">
              <div className="p-4 bg-white rounded-2xl shadow-lg border-4 border-amber-900/10">
                <QRCodeSVG value={savedUrl} size={200} level="H" fgColor="#78350f" />
              </div>

              <div className="text-center space-y-1">
                <p className="font-bold text-gray-800 text-lg">شارك بمزاد مشاريع أبنائنا 🔨</p>
                <p className="text-gray-500 text-sm">امسح الرمز وشوف المشاريع المعروضة وارفع السعر</p>
              </div>

              <div className="w-full bg-gray-50 rounded-xl px-4 py-2.5 text-center border border-gray-100">
                <p className="text-xs text-gray-400 mb-0.5">أو ادخل مباشرة عبر الرابط</p>
                <p className="text-xs font-mono text-amber-700 break-all" dir="ltr">{savedUrl}</p>
              </div>
            </div>

            <div className="bg-gray-50 border-t border-gray-100 px-6 py-3 text-center">
              <p className="text-xs text-gray-400">مدارس الأرقم • {new Date().getFullYear()}</p>
            </div>
          </div>
        </div>

        {/* أزرار */}
        <div className="flex gap-3 no-print">
          <a href={whatsappShareUrl} target="_blank" rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl font-bold text-base hover:bg-green-500 transition-colors">
            <MessageCircle className="w-5 h-5" /> إرسال عبر واتساب
          </a>
          <button onClick={print}
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-5 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors">
            <Printer className="w-5 h-5" /> طباعة
          </button>
        </div>
      </div>
    </>
  );
}

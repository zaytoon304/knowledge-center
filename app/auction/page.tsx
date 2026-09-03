"use client";
import { useState, useEffect, useCallback } from "react";
import { Gavel, Timer, TrendingUp, Flame, UserPlus, Phone, Trophy, PlayCircle } from "lucide-react";
import { AuctionItem, AuctionState, getAuctions, placeBid } from "@/lib/auction";
import { cloudListen } from "@/lib/cloud";
import CenterLogo from "@/components/icons/CenterLogo";

const IDENTITY_KEY = "kc_bidder_identity";

interface Identity {
  name: string;
  phone: string;
}

function loadIdentity(): Identity | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(IDENTITY_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveIdentity(identity: Identity) {
  localStorage.setItem(IDENTITY_KEY, JSON.stringify(identity));
}

function timeLeftLabel(targetIso: string, now: number): string {
  const diff = new Date(targetIso).getTime() - now;
  if (diff <= 0) return "انتهى";
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (days > 0) return `${days} يوم ${hours} ساعة`;
  if (hours > 0) return `${hours} ساعة ${minutes} دقيقة`;
  if (minutes > 0) return `${minutes}:${String(seconds).padStart(2, "0")} دقيقة`;
  return `${seconds} ثانية`;
}

type Status = "upcoming" | "live" | "ended";

function getStatus(auction: AuctionItem, state: AuctionState | null, now: number): Status {
  if (now < new Date(auction.startAt).getTime()) return "upcoming";
  const endAt = state?.endAt || auction.endAt;
  if (now >= new Date(endAt).getTime()) return "ended";
  return "live";
}

export default function AuctionPage() {
  const [auctions, setAuctions] = useState<AuctionItem[] | null>(null);
  const [states, setStates] = useState<Record<string, AuctionState | null>>({});
  const [now, setNow] = useState(Date.now());
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [bidding, setBidding] = useState<string | null>(null);
  const [flash, setFlash] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setIdentity(loadIdentity());
    getAuctions().then(setAuctions);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!auctions) return;
    const unsubs = auctions.map(a =>
      cloudListen<AuctionState>(`kc_auction_state/${a.id}`, s => {
        setStates(prev => {
          const changed = prev[a.id]?.currentPrice !== s?.currentPrice && prev[a.id] !== undefined;
          if (changed) {
            setFlash(f => ({ ...f, [a.id]: true }));
            setTimeout(() => setFlash(f => ({ ...f, [a.id]: false })), 1000);
          }
          return { ...prev, [a.id]: s };
        });
      })
    );
    return () => unsubs.forEach(u => u());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auctions]);

  const confirmIdentity = () => {
    if (!nameInput.trim() || phoneInput.trim().length < 9) return;
    const id = { name: nameInput.trim(), phone: phoneInput.trim() };
    saveIdentity(id);
    setIdentity(id);
  };

  const bid = useCallback(async (auction: AuctionItem) => {
    if (!identity || bidding) return;
    setBidding(auction.id);
    await placeBid(auction, identity.name, identity.phone);
    setBidding(null);
  }, [identity, bidding]);

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-white">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-center gap-3 mb-2">
          <CenterLogo className="w-10 h-10" />
          <div className="text-center">
            <p className="text-xs text-gray-400">وحدة الموهبة والابتكار بمدارس الأرقم</p>
          </div>
        </div>

        <div className="card p-6 bg-gradient-to-l from-amber-700 via-orange-600 to-red-600 text-white text-center rounded-3xl">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Gavel className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-bold">مزاد مشاريع الطلاب</h1>
          <p className="text-white/90 text-sm mt-1">اشترِ ابتكار طالب حقيقي، وادعم موهبته!</p>
        </div>

        {!identity && (
          <div className="card p-5 space-y-3 border-2 border-amber-300">
            <h3 className="flex items-center gap-2 font-bold text-gray-800">
              <UserPlus className="w-5 h-5 text-amber-600" /> عرّف عن نفسك قبل المزايدة
            </h3>
            <p className="text-xs text-gray-500">اسمك ورقم جوالك — نحتاجهم بس لو فزت بالمزاد نتواصل معك، تُحفظ بجهازك ولا نطلبها منك مرة ثانية.</p>
            <input value={nameInput} onChange={e => setNameInput(e.target.value)} placeholder="الاسم"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-amber-500" />
            <input value={phoneInput} onChange={e => setPhoneInput(e.target.value)} placeholder="رقم الجوال" type="tel"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-amber-500" />
            <button onClick={confirmIdentity} disabled={!nameInput.trim() || phoneInput.trim().length < 9}
              className="w-full bg-amber-700 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-amber-600 disabled:opacity-40">
              تأكيد والدخول للمزاد
            </button>
          </div>
        )}

        {identity && (
          <div className="text-center text-xs text-gray-400">
            مسجّل باسم <span className="font-semibold text-gray-600">{identity.name}</span> ·{" "}
            <button onClick={() => { localStorage.removeItem(IDENTITY_KEY); setIdentity(null); setNameInput(""); setPhoneInput(""); }} className="text-amber-600 underline">تغيير البيانات</button>
          </div>
        )}

        {auctions === null && <p className="text-center text-gray-400 text-sm py-10">جارٍ التحميل...</p>}
        {auctions !== null && auctions.length === 0 && <p className="text-center text-gray-400 text-sm py-10">ما فيه مزادات حالياً — تابعنا قريباً!</p>}

        <div className="space-y-5">
          {auctions?.map(a => {
            const state = states[a.id];
            const status = getStatus(a, state ?? null, now);
            const price = state?.currentPrice ?? a.startingPrice;
            const isWinner = status === "ended" && !!identity && state?.leaderPhone === identity.phone;
            return (
              <div key={a.id} className={`card overflow-hidden rounded-2xl transition-shadow ${flash[a.id] ? "ring-4 ring-amber-400" : ""}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.image} alt={a.title} className="w-full h-56 object-cover" />
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-bold text-gray-800">{a.title}</h2>
                      <p className="text-xs text-gray-500 mt-0.5">من إبداع الطالب: <span className="font-semibold">{a.studentName}</span></p>
                    </div>
                    {status === "live" && <span className="flex items-center gap-1 text-[10px] bg-red-100 text-red-700 px-2 py-1 rounded-full font-bold flex-shrink-0"><Flame className="w-3 h-3" /> مباشر الآن</span>}
                    {status === "upcoming" && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-bold flex-shrink-0">قريباً</span>}
                    {status === "ended" && <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-full font-bold flex-shrink-0">انتهى المزاد</span>}
                  </div>

                  <p className="text-sm text-gray-600 leading-relaxed">{a.description}</p>

                  {a.video && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-amber-700 font-semibold flex items-center gap-1"><PlayCircle className="w-4 h-4" /> شاهد فيديو المشروع</summary>
                      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                      <video src={a.video} controls className="w-full rounded-xl mt-2" />
                    </details>
                  )}

                  <p className="text-[11px] text-gray-400">تكلفة تنفيذ المشروع: {a.executionCost} ريال (للشفافية)</p>

                  <div className="flex items-center justify-between bg-amber-50 rounded-2xl p-4">
                    <div>
                      <p className="text-[11px] text-gray-500">السعر الحالي</p>
                      <p className="text-2xl font-bold text-amber-800 flex items-center gap-1">
                        <TrendingUp className="w-5 h-5" /> {price} ريال
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="text-[11px] text-gray-500 flex items-center gap-1 justify-end"><Timer className="w-3.5 h-3.5" /> {status === "upcoming" ? "يبدأ خلال" : "ينتهي خلال"}</p>
                      <p className="font-bold text-gray-700">{timeLeftLabel(status === "upcoming" ? a.startAt : (state?.endAt || a.endAt), now)}</p>
                    </div>
                  </div>

                  {status === "live" && (
                    <button onClick={() => bid(a)} disabled={!identity || bidding === a.id}
                      className="w-full bg-red-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                      <Gavel className="w-4 h-4" />
                      {bidding === a.id ? "جارٍ الرفع..." : `ارفع السعر إلى ${price + a.bidIncrement} ريال`}
                    </button>
                  )}
                  {status === "live" && !identity && (
                    <p className="text-[11px] text-center text-amber-600">سجّل بياناتك بالأعلى عشان تقدر تزايد</p>
                  )}
                  {isWinner && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center flex items-center justify-center gap-2 text-green-700 font-bold text-sm">
                      <Trophy className="w-4 h-4" /> مبروك! فزت بالمزاد — سيتواصل معك المشرف لإتمام العقد
                    </div>
                  )}
                  {status === "ended" && !isWinner && state?.leaderName && (
                    <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1"><Phone className="w-3 h-3" /> سيتم التواصل مع الفائز لتسليم المنتج</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

"use client";
import { ref, runTransaction, get } from "firebase/database";
import { db, ensureSignedIn } from "./firebase";
import { cloudGet, cloudSet } from "./cloud";

export interface AuctionItem {
  id: string;
  title: string;
  studentName: string;
  description: string;
  image: string; // base64
  video?: string; // base64، اختياري
  executionCost: number; // تكلفة التنفيذ — للعرض فقط، شفافية للمزايدين
  startingPrice: number;
  bidIncrement: number;
  startAt: string; // ISO
  endAt: string; // ISO — النسخة الأصلية، الحالة الفعلية (بعد أي تمديد) بـ AuctionState
  createdAt: string;
}

export interface Bid {
  name: string;
  phone: string;
  amount: number;
  at: string; // ISO
}

export interface AuctionState {
  currentPrice: number;
  endAt: string; // ISO — قد تكون أبعد من endAt الأصلي بسبب تمديد "منع القنص"
  leaderName: string;
  leaderPhone: string;
  bids: Bid[];
  delivered: boolean;
}

const SNIPE_EXTEND_MINUTES = 2;
const SNIPE_WINDOW_MINUTES = 2;

const AUCTIONS_KEY = "kc_auctions";
const stateKey = (id: string) => `kc_auction_state/${id}`;

export async function getAuctions(): Promise<AuctionItem[]> {
  const data = await cloudGet<AuctionItem[]>(AUCTIONS_KEY);
  return Array.isArray(data) ? data : [];
}

export async function saveAuctions(items: AuctionItem[]): Promise<void> {
  await cloudSet(AUCTIONS_KEY, items);
}

export async function getAuctionState(id: string): Promise<AuctionState | null> {
  return cloudGet<AuctionState>(stateKey(id));
}

// ينشئ حالة ابتدائية لمزاد جديد (يُستدعى مرة وحدة عند إنشاء المزاد من لوحة الإدارة)
export async function initAuctionState(auction: AuctionItem): Promise<void> {
  const initial: AuctionState = {
    currentPrice: auction.startingPrice,
    endAt: auction.endAt,
    leaderName: "",
    leaderPhone: "",
    bids: [],
    delivered: false,
  };
  await cloudSet(stateKey(auction.id), initial);
}

export type BidResult =
  | { ok: true; newPrice: number; extended: boolean }
  | { ok: false; reason: "ended" | "not_started" | "error" };

// يرفع السعر بمقدار bidIncrement بأمان حتى لو زايد اثنان بنفس اللحظة —
// يستخدم معاملة Firebase حقيقية (نفس نمط cloudTransact) بدل قراءة ثم كتابة،
// ويمدد وقت الإغلاق تلقائياً لو المزايدة جت بآخر دقيقتين (منع "القنص" بالثانية الأخيرة)
export async function placeBid(auction: AuctionItem, name: string, phone: string): Promise<BidResult> {
  try {
    await ensureSignedIn();
    if (Date.now() < new Date(auction.startAt).getTime()) return { ok: false, reason: "not_started" };

    let applied = false;
    let extended = false;
    let newPrice = 0;

    const result = await runTransaction(ref(db, stateKey(auction.id)), (current: AuctionState | null) => {
      const state: AuctionState = current || {
        currentPrice: auction.startingPrice,
        endAt: auction.endAt,
        leaderName: "",
        leaderPhone: "",
        bids: [],
        delivered: false,
      };
      const now = Date.now(); // نعيد القراءة كل محاولة — Firebase يعيد تنفيذ الدالة تلقائياً عند تعارض
      const endMs = new Date(state.endAt).getTime();
      if (now >= endMs) { applied = false; return state; } // المزاد خلص فعلاً، ما نغيّر شي

      applied = true;
      newPrice = state.currentPrice + auction.bidIncrement;
      const bid: Bid = { name, phone, amount: newPrice, at: new Date(now).toISOString() };
      let nextEnd = endMs;
      extended = endMs - now <= SNIPE_WINDOW_MINUTES * 60 * 1000;
      if (extended) nextEnd = now + SNIPE_EXTEND_MINUTES * 60 * 1000;

      return {
        currentPrice: newPrice,
        endAt: new Date(nextEnd).toISOString(),
        leaderName: name,
        leaderPhone: phone,
        bids: [...(state.bids || []), bid],
        delivered: state.delivered || false,
      };
    });

    if (!result.committed) return { ok: false, reason: "error" };
    if (!applied) return { ok: false, reason: "ended" };
    return { ok: true, newPrice, extended };
  } catch {
    return { ok: false, reason: "error" };
  }
}

export async function markDelivered(auctionId: string, delivered: boolean): Promise<boolean> {
  try {
    await ensureSignedIn();
    const snap = await get(ref(db, stateKey(auctionId)));
    const state = (snap.val() as AuctionState) || null;
    if (!state) return false;
    await cloudSet(stateKey(auctionId), { ...state, delivered });
    return true;
  } catch {
    return false;
  }
}

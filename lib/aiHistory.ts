"use client";
import { useState, useEffect } from "react";
import { useAuth, CoordinatorProfile } from "@/contexts/AuthContext";
import { cloudGet, cloudTransact } from "./cloud";

export interface AiHistoryItem {
  id: string;
  tool: string;
  toolLabel: string;
  title: string;
  subject: string;
  grade: string;
  createdAt: string;
  textExport: string;
}

const MAX_ITEMS = 30;

function historyPath(ownerId: string): string {
  return `kc_ai_history/${ownerId}`;
}

export async function saveAiHistoryItem(ownerId: string, item: Omit<AiHistoryItem, "id" | "createdAt">): Promise<boolean> {
  const entry: AiHistoryItem = { ...item, id: Date.now().toString(), createdAt: new Date().toISOString() };
  return cloudTransact<AiHistoryItem[]>(historyPath(ownerId), current => {
    const list = Array.isArray(current) ? current : [];
    return [entry, ...list].slice(0, MAX_ITEMS);
  });
}

export async function getAiHistory(ownerId: string): Promise<AiHistoryItem[]> {
  const data = await cloudGet<AiHistoryItem[]>(historyPath(ownerId));
  return Array.isArray(data) ? data : [];
}

export async function deleteAiHistoryItem(ownerId: string, id: string): Promise<boolean> {
  return cloudTransact<AiHistoryItem[]>(historyPath(ownerId), current => {
    const list = Array.isArray(current) ? current : [];
    return list.filter(i => i.id !== id);
  });
}

// يحدد صاحب السجل الحالي (معلم/منسّق مسجّل دخول، أو الأدمن) — يرجّع null لأي زائر غير مسجّل
export function useAiOwner(): { ownerId: string | null; ownerLabel: string } {
  const { user, isCoordinator } = useAuth();
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") setAdmin(localStorage.getItem("kc_admin_auth") === "1");
  }, []);

  if (isCoordinator && user) {
    const c = user as CoordinatorProfile;
    return { ownerId: `coordinator_${c.id}`, ownerLabel: c.name || "معلمي" };
  }
  if (admin) return { ownerId: "admin", ownerLabel: "الأدمن" };
  return { ownerId: null, ownerLabel: "" };
}

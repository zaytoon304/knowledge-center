"use client";
import { cloudGet, cloudSet, cloudPush, cloudTransact } from "./cloud";

// "فيديو ردود الطلاب" — بدل ما يكتب الطالب إجابته نصاً، يسجّل فيديو قصير يشرح فكرته
// (مثال: "ليش استخدمت هذا الحساس بمشروعك؟") — يقوّي مهارة العرض والتواصل الهندسي، ويغذّي
// بورتفوليو "رحلتي" تلقائياً بعد الاعتماد (نفس فلسفة مراجعة إتقان المهارات: يُعتمد قبل ما يظهر).

export interface VideoPrompt {
  id: string;
  title: string; // السؤال/الطلب اللي يجاوب عليه الطالب بفيديو
  description: string;
  createdBy: string;
  createdAt: string;
  active: boolean;
}

export type VideoResponseStatus = "pending" | "approved" | "rejected";

export interface VideoResponse {
  id: string;
  promptId: string;
  promptTitle: string; // نسخة من عنوان السؤال وقت الإرسال (لو تغيّر السؤال لاحقاً)
  studentId: string;
  studentName: string;
  video: string; // base64
  status: VideoResponseStatus;
  createdAt: string;
  reviewedAt?: string;
  reviewerNote?: string;
}

const PROMPTS_KEY = "kc_video_prompts";
const RESPONSES_KEY = "kc_video_responses";

export const MAX_VIDEO_BYTES = 15 * 1024 * 1024;

export async function getPrompts(): Promise<VideoPrompt[]> {
  const data = await cloudGet<VideoPrompt[]>(PROMPTS_KEY);
  return Array.isArray(data) ? data : [];
}

export async function addPrompt(title: string, description: string, createdBy: string): Promise<boolean> {
  const item: VideoPrompt = { id: Date.now().toString(), title: title.trim(), description: description.trim(), createdBy, createdAt: new Date().toISOString(), active: true };
  return cloudPush(PROMPTS_KEY, item);
}

export async function togglePromptActive(id: string): Promise<boolean> {
  return cloudTransact<VideoPrompt[]>(PROMPTS_KEY, current => {
    const list = Array.isArray(current) ? current : [];
    return list.map(p => p.id === id ? { ...p, active: !p.active } : p);
  });
}

export async function deletePrompt(id: string): Promise<boolean> {
  return cloudTransact<VideoPrompt[]>(PROMPTS_KEY, current => {
    const list = Array.isArray(current) ? current : [];
    return list.filter(p => p.id !== id);
  });
}

export async function getResponses(): Promise<VideoResponse[]> {
  const data = await cloudGet<VideoResponse[]>(RESPONSES_KEY);
  return Array.isArray(data) ? data : [];
}

export async function submitVideoResponse(data: Omit<VideoResponse, "id" | "status" | "createdAt">): Promise<boolean> {
  const item: VideoResponse = { ...data, id: Date.now().toString(), status: "pending", createdAt: new Date().toISOString() };
  return cloudPush(RESPONSES_KEY, item);
}

export async function reviewVideoResponse(id: string, approve: boolean, reviewerNote?: string): Promise<boolean> {
  return cloudTransact<VideoResponse[]>(RESPONSES_KEY, current => {
    const list = Array.isArray(current) ? current : [];
    return list.map(r => r.id === id
      ? { ...r, status: (approve ? "approved" : "rejected") as VideoResponseStatus, reviewedAt: new Date().toISOString(), reviewerNote: reviewerNote || "" }
      : r);
  });
}

export async function deleteVideoResponse(id: string): Promise<boolean> {
  return cloudTransact<VideoResponse[]>(RESPONSES_KEY, current => {
    const list = Array.isArray(current) ? current : [];
    return list.filter(r => r.id !== id);
  });
}

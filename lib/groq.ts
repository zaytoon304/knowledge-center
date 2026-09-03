import { cloudGet, cloudSet } from "./cloud";

// مفتاح Groq الآن محفوظ بالسحابة (Firebase) بدل متصفح الأدمن فقط —
// هذا يخلي كل أدوات الذكاء الاصطناعي بالمنصة تشتغل لأي معلم/منسّق يفتحها من أي جهاز،
// بمجرد ما محمد يحفظ المفتاح مرة وحدة من لوحة الإدارة.
const GROQ_KEY_PATH = "kc_groq_key";
const LOCAL_CACHE_KEY = "kc_groq_key_cache";

export async function getGroqKey(): Promise<string> {
  const cloudKey = await cloudGet<string>(GROQ_KEY_PATH);
  if (cloudKey) {
    if (typeof window !== "undefined") localStorage.setItem(LOCAL_CACHE_KEY, cloudKey);
    return cloudKey;
  }
  // لو ما وصلنا للسحابة (مثلاً بدون نت لحظياً)، نستخدم آخر نسخة محفوظة محلياً كحل احتياطي
  if (typeof window !== "undefined") return localStorage.getItem(LOCAL_CACHE_KEY) || "";
  return "";
}

export async function saveGroqKey(key: string): Promise<boolean> {
  const trimmed = key.trim();
  if (typeof window !== "undefined") localStorage.setItem(LOCAL_CACHE_KEY, trimmed);
  await cloudSet(GROQ_KEY_PATH, trimmed);
  return true;
}

export async function deleteGroqKey(): Promise<void> {
  if (typeof window !== "undefined") localStorage.removeItem(LOCAL_CACHE_KEY);
  await cloudSet(GROQ_KEY_PATH, "");
}

export interface GroqMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

// نموذج نصي عام لكل الأدوات (خطة الدرس، الأسئلة، ورقة العمل، الخريطة الذهنية...)
export async function callGroqText(messages: GroqMessage[], apiKey: string, maxTokens = 2500): Promise<string> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      // llama-3.3-70b-versatile أصبح مُهملاً عند Groq (تحقّقنا حياً 2026-09-03 عبر
      // GET /openai/v1/models بمفتاح حقيقي) — qwen/qwen3.8-27b يرجّع JSON نظيفاً
      // وسريعاً بدون توكنات "تفكير" مخفية تستهلك الحد الأقصى بلا داعٍ (بخلاف نماذج
      // gpt-oss اللي جربناها وقطعت الرد قبل اكتماله بسبب ذلك).
      model: "qwen/qwen3.8-27b",
      messages,
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `خطأ ${res.status}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

// لتصحيح الأوراق: يرسل صورة (data URL) + تعليمات نصية لنفس النموذج (qwen3.8-27b يدعم
// الصور فعلياً — تحقّقنا حياً 2026-09-03 بمفتاح حقيقي، قرأ ورقة اختبار وصحّحها بدقة)
export async function callGroqVision(prompt: string, imageDataUrl: string, apiKey: string, maxTokens = 1500): Promise<string> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "qwen/qwen3.8-27b",
      messages: [{
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: imageDataUrl } },
        ],
      }],
      max_tokens: maxTokens,
      temperature: 0.3,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `خطأ ${res.status}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

// يحاول يستخرج أول كتلة JSON صالحة من رد النموذج (أحياناً يضيف شرح أو ```json حولها)
export function extractJson<T>(raw: string): T | null {
  const cleaned = raw.replace(/```json/gi, "```").trim();
  const match = cleaned.match(/```([\s\S]*?)```/) || cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  const jsonText = match ? match[1] : cleaned;
  try {
    return JSON.parse(jsonText.trim()) as T;
  } catch {
    return null;
  }
}

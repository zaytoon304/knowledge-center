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

// شخصية/معايير جودة موحّدة تُضاف كرسالة system لكل أدوات إعداد المحتوى التعليمي —
// الهدف رفع مستوى المخرجات من "مقبول" إلى "عالمي": تفاصيل ملموسة حقيقية بدل
// العبارات العامة، وأمثلة قابلة للتنفيذ فوراً بدون أي تفكير إضافي من المعلم.
export const TEACHER_EXPERT_SYSTEM_PROMPT = `أنت خبير تربوي عالمي المستوى بخبرة عملية طويلة داخل الفصول الحقيقية، ومطّلع على أفضل ممارسات التدريس السعودية والدولية (STEAM، التعلم النشط، التعلم القائم على المشاريع). تُعِد محتوى تعليمياً لمعلمين ومنسّقين محترفين سيستخدمونه غداً مباشرة في فصولهم بدون أي تعديل.

قواعد صارمة إلزامية بكل مخرجاتك:
1. ممنوع أي عبارة عامة أو غامضة (مثل "نشاط تفاعلي ممتع" أو "اشرح المفهوم" بدون تفاصيل فعلية) — كل جملة يجب أن تكون قابلة للتنفيذ الفوري.
2. استخدم دائماً تفاصيل ملموسة وواقعية: أرقام حقيقية، أدوات فعلية متاحة بفصل سعودي عادي، سيناريوهات من حياة الطالب اليومية.
3. اجعل المحتوى مناسباً تماماً للمرحلة العمرية المحددة بدقة — لا أسهل ولا أصعب من قدرات الطالب الفعلية بهذا الصف.
4. تجنّب التكرار والحشو — كل عنصر يضيف قيمة حقيقية جديدة، لا يعيد صياغة ما قبله.
5. أخرج فقط بصيغة JSON المطلوبة بالضبط كما هي، بدون أي نص أو markdown خارج الـJSON.
6. فكّر دائماً وكأن هذا المحتوى سيُعرض أمام مشرف تربوي خبير أو لجنة تحكيم دولية — لا مجال لمحتوى سطحي.
7. تحقق حسابي إلزامي: أي سؤال يتضمن حساباً رياضياً أو رقمياً (جمع، طرح، ضرب، قسمة، كسور، نسب مئوية...) يجب أن تحله بنفسك خطوة بخطوة بذهنك أولاً قبل كتابة الإجابة النهائية، وتتأكد أن الإجابة الصحيحة (answer) تطابق حلّك تماماً وموجودة فعلاً ضمن الخيارات (options) دون تكرار قيمة بمظهرين مختلفين (مثل 2/12 و1/6 لنفس القيمة). لا تثق بحدسك الأول بالحساب — تحقق مرتين.`;

// نفس الروح لكن لأدوات الروبوتات والذكاء الاصطناعي تحديداً — معلم/منسّق روبوتات
// سعودي يحضّر حصة أو يشرح مفهوماً تقنياً لطلاب حقيقيين بمعدات Arduino/ESP32 فعلية.
export const ROBOTICS_EXPERT_SYSTEM_PROMPT = `أنت خبير عالمي في تعليم الروبوتات والذكاء الاصطناعي للأطفال والناشئة، شاركت في تدريب فرق فازت بمسابقات دولية (WRO وأشباهها)، ومطّلع تماماً على القطع الشائعة بالمدارس السعودية (Arduino Uno/Mega، ESP32، حساسات المسافة والحرارة والضوء، محركات سيرفو وستيبر، شاشات LCD/OLED). تخاطب معلماً أو منسّقاً سيستخدم كلامك مباشرة أمام طلاب حقيقيين بمعدات حقيقية — أي خطأ تقني منك يعني معدات تالفة أو حصة فاشلة فعلياً.

قواعد صارمة إلزامية بكل مخرجاتك:
1. أي كود Arduino/C++ تكتبه يجب أن يكون صحيحاً فعلياً 100% وقابلاً للرفع مباشرة (compile-ready): كل قوس وعلامة اقتباس واستدعاء دالة مغلق بشكل صحيح. راجع الكود سطراً سطراً بعد كتابته للتأكد من عدم وجود قوس أو علامة اقتباس ناقصة قبل إخراجه نهائياً.
2. منافذ GPIO يجب أن تكون ضمن المنافذ الفعلية الموجودة حقاً على اللوحة المحددة فقط:
   - ESP32 DevKit V1: المنافذ الصالحة للاستخدام العام هي فقط 0,2,4,5,12,13,14,15,16,17,18,19,21,22,23,25,26,27,32,33,34,35,36,39 (لا يوجد GPIO24 ولا GPIO40 وما فوق إطلاقاً؛ 34-39 قراءة فقط INPUT، لا تصلح كمخرج OUTPUT).
   - Arduino Uno: المنافذ الرقمية 0-13 فقط (0،1 محجوزان للتواصل التسلسلي، تجنّبهما)، والتناظرية A0-A5.
   - Arduino Mega: المنافذ الرقمية 0-53، التناظرية A0-A15.
   لا تخترع رقم منفذ أبداً — لو غير متأكد من رقم محدد، استخدم رقماً معروفاً وآمناً من القائمة أعلاه فقط.
3. تنبيه فولت إلزامي: أي حساس يُخرج إشارة 5V (مثل ECHO بحساس HC-SR04) وموصول بلوحة تعمل منطقها الداخلي على 3.3V فقط (مثل ESP32) يحتاج مقسّم جهد (Voltage Divider، مثلاً مقاومتين 1KΩ و2KΩ) قبل توصيله بمنفذ GPIO — اذكر هذا صراحة بـ"safetyNotes" و"wiringSteps" كلما انطبق الحال، وإلا فقد يتلف منفذ اللوحة فعلياً.
4. اشرح أي مفهوم تقني بلغة عربية مبسّطة تماماً تناسب عمر الطالب المحدد، مع تشبيه واقعي يفهمه طفل سعودي (لا مصطلحات جامعية معقدة لمرحلة ابتدائية).
5. ممنوع أي عبارة عامة (مثل "وصّل الحساس بشكل صحيح" بدون تحديد أي منفذ بالضبط).
6. أخرج فقط بصيغة JSON المطلوبة بالضبط كما هي، بدون أي نص أو markdown خارج الـJSON.`;

// مفتاح Groq المجاني (كل المنصة تشترك بمفتاح واحد) عنده سقف صارم لعدد الكلمات
// بالرد بالدقيقة الواحدة لنموذج qwen3.8-27b تحديداً (اكتُشف فعلياً 2026-09-06: طلب برد
// أطول من ~1000 كلمة يُرفض أحياناً بخطأ "429 OTPM" حتى لو أول محاولة بالدقيقة، حسب
// تقدير جوجل الداخلي لحجم الرد المتوقع) — بدون هذا، المعلم/الطالب يشوف رسالة إنجليزية
// تقنية مخيفة (فيها رابط فوترة Groq) بدل رد عادي.
function isGroqBusyError(status: number, message: string): boolean {
  return status === 429 && /output tokens per minute|OTPM|rate.?limit/i.test(message);
}
const GROQ_BUSY_MESSAGE = "الخادم مزدحم لحظياً بسبب كثرة الاستخدام بنفس الوقت — انتظر بضع ثوانٍ وحاول مرة أخرى.";

async function groqChatRequest(body: Record<string, unknown>, apiKey: string): Promise<{ ok: true; content: string } | { ok: false; status: number; message: string }> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return { ok: false, status: res.status, message: err?.error?.message || `خطأ ${res.status}` };
  }
  const data = await res.json();
  return { ok: true, content: data.choices?.[0]?.message?.content || "" };
}

// نموذج نصي عام لكل الأدوات (خطة الدرس، الأسئلة، ورقة العمل، الخريطة الذهنية...)
export async function callGroqText(messages: GroqMessage[], apiKey: string, maxTokens = 2500, temperature = 0.7): Promise<string> {
  // llama-3.3-70b-versatile أصبح مُهملاً عند Groq (تحقّقنا حياً 2026-09-03 عبر
  // GET /openai/v1/models بمفتاح حقيقي) — qwen/qwen3.8-27b يرجّع JSON نظيفاً
  // وسريعاً بدون توكنات "تفكير" مخفية تستهلك الحد الأقصى بلا داعٍ (بخلاف نماذج
  // gpt-oss اللي جربناها وقطعت الرد قبل اكتماله بسبب ذلك).
  const build = (tokens: number) => ({ model: "qwen/qwen3.8-27b", messages, max_tokens: tokens, temperature });
  let result = await groqChatRequest(build(maxTokens), apiKey);
  // إعادة محاولة تلقائية واحدة بسقف أقل (900، مؤكَّد إنه يمر بأمان) لو رُفضت الأولى
  // بسبب الازدحام — تحل أغلب الحالات بصمت بدل ما يشوف المستخدم خطأ إطلاقاً.
  if (!result.ok && isGroqBusyError(result.status, result.message) && maxTokens > 900) {
    result = await groqChatRequest(build(900), apiKey);
  }
  if (!result.ok) throw new Error(isGroqBusyError(result.status, result.message) ? GROQ_BUSY_MESSAGE : result.message);
  return result.content;
}

// لتصحيح الأوراق: يرسل صورة (data URL) + تعليمات نصية لنفس النموذج (qwen3.8-27b يدعم
// الصور فعلياً — تحقّقنا حياً 2026-09-03 بمفتاح حقيقي، قرأ ورقة اختبار وصحّحها بدقة)
export async function callGroqVision(prompt: string, imageDataUrl: string, apiKey: string, maxTokens = 1500): Promise<string> {
  const build = (tokens: number) => ({
    model: "qwen/qwen3.8-27b",
    messages: [{
      role: "user",
      content: [
        { type: "text", text: prompt },
        { type: "image_url", image_url: { url: imageDataUrl } },
      ],
    }],
    max_tokens: tokens,
    temperature: 0.3,
  });
  let result = await groqChatRequest(build(maxTokens), apiKey);
  if (!result.ok && isGroqBusyError(result.status, result.message) && maxTokens > 900) {
    result = await groqChatRequest(build(900), apiKey);
  }
  if (!result.ok) throw new Error(isGroqBusyError(result.status, result.message) ? GROQ_BUSY_MESSAGE : result.message);
  return result.content;
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

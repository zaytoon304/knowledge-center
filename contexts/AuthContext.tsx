"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { cloudGet, cloudSet, cloudPush, cloudTransact } from "@/lib/cloud";
import { getDeviceId, validateAccessCode, grantAccess, hasAccess as hasDeviceAccess, revokeAccess } from "@/lib/deviceCode";
import { hashPassword, verifyPassword, isHashed } from "@/lib/password";
import { sha256Hex } from "@/lib/hash";

export interface StudentProfile {
  id: string; name: string; nationalId: string; school: string; grade: string;
  phone: string; email: string; parentPhone: string; birthDate: string;
  photo: string; password: string; role: "student"; teams: string[];
  registeredAt: string; status: "pending" | "approved" | "rejected";
  deviceId?: string; // نفس رمز جهاز الطالب — يُستخدم لتوليد والتحقق من رمز الدخول (نظام أكاديمية زيتون)
  department?: string; // القسم: ابتدائي عام / ابتدائي تحفيظ / متوسط / ثانوي
  classroom?: string; // الفصل
  coordinatorName?: string; // يُشتق تلقائياً من القسم عند التسجيل
}

// كل قسم مرتبط بمنسّق مسؤول عنه — تُستخدم لتحديد "المنسق التابع له" تلقائياً وقت تسجيل الطالب
export const DEPARTMENTS = ["ابتدائي عام", "ابتدائي تحفيظ", "متوسط", "ثانوي"] as const;
export const DEPARTMENT_COORDINATOR: Record<string, string> = {
  "ابتدائي عام": "سمير علي أنور علي عوض",
  "ابتدائي تحفيظ": "محمد ضيف عبد الغني سعيد",
  "متوسط": "فتحي محفوظ عبد الله",
  "ثانوي": "خالد علي محمد شعبان",
};

export interface CoordinatorProfile {
  id: string; name: string; email: string; phone: string;
  school: string; subject: string;
  photo: string; cv: string; cvName: string;
  password: string; role: "coordinator";
  registeredAt: string; status: "pending" | "approved" | "rejected";
  // صلاحية محدودة يمنحها الأدمن: متابعة المنسقين والطلاب وإرسال ملاحظات فقط —
  // بدون دخول لوحة الإدارة أو التحكم بأي محتوى/أيقونة بالمنصة
  isSupervisor?: boolean;
  // يضبطها الأدمن لإنهاء جلسة المنسق فوراً — أي دخول محفوظ محلياً قبل هذا التاريخ
  // يُرفض تلقائياً بأول فتح للتطبيق، ويضطر يدخل بالإيميل وكلمة المرور من جديد
  sessionRevokedAt?: string;
}

export type AnyUser = StudentProfile | CoordinatorProfile;

export interface ChatGroup {
  id: string; name: string; type: "general" | "team";
  emoji: string; color: string; description: string; createdAt: string;
  members?: string[];
}

export interface LiveStreamSettings {
  enabled: boolean;
  streamType: "youtube" | "meet" | "zoom";
  url: string;
  zoomLink: string;
  title: string;
  description: string;
  scheduledAt: string;
}

export interface LessonItem {
  id: string; title: string; videoUrl: string; pdfUrl: string; pdfName: string; duration: string;
  content?: string; // نص الدرس المباشر — لدروس نصية بدون فيديو (مثل عناصر اللوائح والأدلة)
  slides?: string[]; // عرض شرائح محمي — صور فقط (بدون ملف قابل للتحميل)، بلا رابط تحميل أو حفظ
}

export interface CourseItem {
  id: string; title: string; description: string;
  emoji: string; instructor: string; duration: string;
  lessons: LessonItem[];
  createdAt: string;
}

export interface VideoItem {
  id: string; title: string; link: string; description: string; emoji: string;
}

export interface ProjectVideo {
  id: string;
  title: string;
  url: string;
  type: "journey" | "presentation" | "problems" | "other";
  description: string;
}

export interface ProjectItem {
  id: string; title: string; description: string; field: string; level: string; emoji: string;
  image: string; imageName: string;
  students: string;
  division: string;
  components: string;
  code: string;
  codeFile: string; codeFileName: string;
  videos: ProjectVideo[];
}

export interface DailyLogEntry {
  id: string; title: string; date: string; description: string;
  category: string;
  images: Array<{ data: string; name: string; caption?: string }>;
  videoLinks: string[];
  createdAt: string;
}

export interface ShopItem {
  id: string; name: string; description: string; price: string;
  image: string; imageName: string; category: string; contact: string; createdAt: string;
}

export interface PlatformAchievement {
  id: string; title: string; description: string; date: string;
  image: string; imageName: string; createdAt: string;
}

export interface RegCodes {
  studentCode: string;
  coordCode: string;
}

interface AuthContextType {
  cloudSyncTick: number;
  user: AnyUser | null;
  isLoggedIn: boolean;
  isStudent: boolean;
  isCoordinator: boolean;
  isApproved: boolean;
  login: (id: string, pw: string) => Promise<{ success: boolean; message: string }>;
  loginWithAccessCode: (code: string) => Promise<{ success: boolean; message: string }>;
  loginCoordinator: (email: string, pw: string) => Promise<{ success: boolean; message: string }>;
  register: (data: Omit<StudentProfile, "id" | "role" | "registeredAt" | "status">) => Promise<{ success: boolean; message: string }>;
  registerCoordinator: (data: Omit<CoordinatorProfile, "id" | "role" | "registeredAt" | "status">, code: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateProfile: (data: Partial<AnyUser>) => void;
  getAllStudents: () => StudentProfile[];
  approveStudent: (id: string) => void;
  rejectStudent: (id: string) => void;
  deleteStudent: (id: string) => void;
  getAllCoordinators: () => CoordinatorProfile[];
  approveCoordinator: (id: string) => void;
  rejectCoordinator: (id: string) => void;
  deleteCoordinator: (id: string) => void;
  toggleSupervisor: (id: string) => void;
  endCoordinatorSession: (id: string) => void;
  getGroups: () => ChatGroup[];
  createGroup: (g: Omit<ChatGroup, "id" | "createdAt">) => void;
  deleteGroup: (id: string) => void;
  getLiveStream: () => LiveStreamSettings;
  updateLiveStream: (s: Partial<LiveStreamSettings>) => void;
  getCourses: () => CourseItem[];
  addCourse: (c: Omit<CourseItem, "id">) => void;
  deleteCourse: (id: string) => void;
  getVideos: () => VideoItem[];
  addVideo: (v: Omit<VideoItem, "id">) => void;
  deleteVideo: (id: string) => void;
  getProjects: () => ProjectItem[];
  addProject: (p: Omit<ProjectItem, "id">) => void;
  deleteProject: (id: string) => void;
  getDailyLog: () => DailyLogEntry[];
  addDailyLogEntry: (e: Omit<DailyLogEntry, "id" | "createdAt">) => Promise<boolean>;
  deleteDailyLogEntry: (id: string) => Promise<boolean>;
  getShopItems: () => ShopItem[];
  addShopItem: (s: Omit<ShopItem, "id" | "createdAt">) => void;
  deleteShopItem: (id: string) => void;
  getPlatformAchievements: () => PlatformAchievement[];
  addPlatformAchievement: (a: Omit<PlatformAchievement, "id" | "createdAt">) => void;
  deletePlatformAchievement: (id: string) => void;
  getRegCodes: () => RegCodes;
  setRegCodes: (codes: RegCodes) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const KEYS = {
  students: "kc_students", currentUser: "kc_currentUser",
  coordinators: "kc_coordinators", studentsContact: "kc_students_contact",
  coordinatorsContact: "kc_coordinators_contact",
  groups: "kc_groups", liveStream: "kc_liveStream",
  courses: "kc_courses", videos: "kc_videos", projects: "kc_projects",
  shop: "kc_shop", achievements: "kc_platform_achievements",
  regCodes: "kc_reg_codes", dailyLog: "kc_daily_log",
  sessionStartedAt: "kc_session_started_at",
};

function load<T>(key: string, fallback: T): T {
  try { const d = localStorage.getItem(key); return d ? JSON.parse(d) : fallback; } catch { return fallback; }
}
function save(key: string, val: unknown) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

// جوال الطالب/جوال ولي الأمر/رقم الهوية الوطنية لا تُخزّن بعد الآن داخل "kc_students" (يقدر أي
// زائر يقرأها بحساب مجهول تلقائي) — تُحفظ بعقدة منفصلة "kc_students_contact/{id}" مقروءة من
// الأدمن فقط بقواعد أمان Firebase، بينما القراءة العامة لباقي بيانات الطالب (الاسم، الفريق...)
// تبقى كما هي (تحتاجها ميزات شغالة زي لوحة الصدارة). الكتابة تبقى مفتوحة (الطالب نفسه يسجّل
// بياناته عند التسجيل). رقم الهوية لا يزال قابلاً للبحث عبر فهرس هاش عام "kc_nid_index"
// (راجع nidIndexEntry) — يكشف فقط تطابق قيمة معروفة مسبقاً لدى الباحث، لا كشف القائمة كاملة.
function splitStudentContact(s: StudentProfile): { pub: StudentProfile; contact: { phone: string; parentPhone: string; nationalId: string } } {
  const contact = { phone: s.phone || "", parentPhone: s.parentPhone || "", nationalId: s.nationalId || "" };
  return { pub: { ...s, phone: "", parentPhone: "", nationalId: "" }, contact };
}

// يكتب مدخل فهرس بحث عام (هاش رقم الهوية → معرّف الطالب) — يسمح بإيجاد طالب برقم هويته
// (تسجيل دخول قديم، بوابة ولي الأمر، فحص تكرار عند التسجيل) بدون قراءة قائمة الطلاب كاملة.
async function nidIndexEntry(nationalId: string, studentId: string): Promise<void> {
  if (!nationalId) return;
  const hash = await sha256Hex(nationalId);
  cloudSet(`kc_nid_index/${hash}`, studentId);
}
async function findStudentIdByNationalId(nationalId: string): Promise<string | null> {
  if (!nationalId) return null;
  const hash = await sha256Hex(nationalId);
  return cloudGet<string>(`kc_nid_index/${hash}`);
}

// نفس منطق حماية جوال الطالب، لكن للمنسّق — البريد يبقى بالمصفوفة العامة لأن دخول
// المنسّق يبحث به مباشرة (نفس دور nationalId عند الطالب)، الجوال بس ينتقل للعقدة المحمية.
function splitCoordinatorContact(c: CoordinatorProfile): { pub: CoordinatorProfile; contact: { phone: string } } {
  const contact = { phone: c.phone || "" };
  return { pub: { ...c, phone: "" }, contact };
}

const defaultLiveStream: LiveStreamSettings = {
  enabled: false, streamType: "youtube", url: "", zoomLink: "", title: "", description: "", scheduledAt: ""
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AnyUser | null>(null);
  // يتغيّر بعد وصول بيانات السحابة عشان يجبر كل الصفحات المشتركة (تقرأ localStorage مباشرة) تُعيد القراءة
  const [cloudSyncTick, setCloudSyncTick] = useState(0);

  useEffect(() => {
    // مزامنة البيانات من Firebase عند فتح التطبيق
    const syncs: Promise<unknown>[] = [
      cloudGet<CoordinatorProfile[]>("kc_coordinators").then(data => {
        if (Array.isArray(data) && data.length > 0) {
          localStorage.setItem(KEYS.coordinators, JSON.stringify(data));
          // تحقق بأحدث بيانات فعلية من السحابة (لا نعتمد على النسخة المحلية القديمة) —
          // لو الأدمن أنهى جلسة هذا المنسّق من جهاز ثاني، أخرجه فوراً من هنا
          const storedNow = load<AnyUser | null>(KEYS.currentUser, null);
          if (storedNow && storedNow.role === "coordinator") {
            const freshC = data.find(c => c.id === storedNow.id);
            const sessionStartedAt = localStorage.getItem(KEYS.sessionStartedAt);
            if (freshC?.sessionRevokedAt && (!sessionStartedAt || new Date(sessionStartedAt) < new Date(freshC.sessionRevokedAt))) {
              setUser(null);
              localStorage.removeItem(KEYS.currentUser);
              localStorage.removeItem(KEYS.sessionStartedAt);
            }
          }
        }
      }),
      cloudGet<StudentProfile[]>("kc_students").then(data => {
        if (Array.isArray(data) && data.length > 0)
          localStorage.setItem(KEYS.students, JSON.stringify(data));
      }),
      cloudGet<RegCodes>("kc_reg_codes").then(data => {
        if (data) localStorage.setItem(KEYS.regCodes, JSON.stringify(data));
      }),
      cloudGet<ChatGroup[]>(KEYS.groups).then(data => { if (Array.isArray(data)) localStorage.setItem(KEYS.groups, JSON.stringify(data)); }),
      cloudGet<LiveStreamSettings>(KEYS.liveStream).then(data => { if (data) localStorage.setItem(KEYS.liveStream, JSON.stringify(data)); }),
      cloudGet<CourseItem[]>(KEYS.courses).then(data => { if (Array.isArray(data)) localStorage.setItem(KEYS.courses, JSON.stringify(data)); }),
      cloudGet<VideoItem[]>(KEYS.videos).then(data => { if (Array.isArray(data)) localStorage.setItem(KEYS.videos, JSON.stringify(data)); }),
      cloudGet<ProjectItem[]>(KEYS.projects).then(data => { if (Array.isArray(data)) localStorage.setItem(KEYS.projects, JSON.stringify(data)); }),
      cloudGet<DailyLogEntry[]>(KEYS.dailyLog).then(data => {
        if (Array.isArray(data)) {
          // Firebase يحذف المصفوفات الفاضية عند الحفظ (images/videoLinks) فتصير undefined عند
          // القراءة — لولا هذا التطبيع كل عنصر يومية بدون صور/فيديو كان يُسقط الصفحة كاملة بخطأ
          const normalized = data.map(e => ({ ...e, images: e.images || [], videoLinks: e.videoLinks || [] }));
          localStorage.setItem(KEYS.dailyLog, JSON.stringify(normalized));
        }
      }),
      cloudGet<ShopItem[]>(KEYS.shop).then(data => { if (Array.isArray(data)) localStorage.setItem(KEYS.shop, JSON.stringify(data)); }),
      cloudGet<PlatformAchievement[]>(KEYS.achievements).then(data => { if (Array.isArray(data)) localStorage.setItem(KEYS.achievements, JSON.stringify(data)); }),
    ];
    Promise.all(syncs).then(() => setCloudSyncTick(t => t + 1));

    const stored = load<AnyUser | null>(KEYS.currentUser, null);
    if (stored) {
      const all = stored.role === "coordinator"
        ? load<CoordinatorProfile[]>(KEYS.coordinators, [])
        : load<StudentProfile[]>(KEYS.students, []);
      let fresh = (all as AnyUser[]).find(u => u.id === stored.id) || stored;

      // لو الطالب دخل بنظام رمز الجهاز الجديد وانتهت صلاحية رمزه، أخرجه
      // تلقائياً (نفس فكرة أكاديمية زيتون) — لا يمس الحسابات القديمة
      // (كلمة مرور) اللي أصلاً ما تستخدم هذا النظام
      const isDeviceBoundStudent = fresh.role === "student" && (fresh as StudentProfile).deviceId === getDeviceId();
      if (isDeviceBoundStudent && !hasDeviceAccess()) {
        localStorage.removeItem(KEYS.currentUser);
      } else {
        // جواله وجوال ولي أمره لم يعودا موجودين بالنسخة العامة المُزامَنة من السحابة (حماية أمنية) —
        // نبقيهما زي ما كانا محفوظين محلياً بجهازه هو نفسه، عشان يقدر يشوفهما ببوابته زي المعتاد
        if (fresh.role === "student") {
          const sf = fresh as StudentProfile, ss = stored as StudentProfile;
          if (!sf.phone && ss.phone) fresh = { ...sf, phone: ss.phone };
          if (!(fresh as StudentProfile).parentPhone && ss.parentPhone) fresh = { ...(fresh as StudentProfile), parentPhone: ss.parentPhone };
          if (!(fresh as StudentProfile).nationalId && ss.nationalId) fresh = { ...(fresh as StudentProfile), nationalId: ss.nationalId };
        } else if (fresh.role === "coordinator") {
          const cf = fresh as CoordinatorProfile, cs = stored as CoordinatorProfile;
          if (!cf.phone && cs.phone) fresh = { ...cf, phone: cs.phone };
        }
        setUser(fresh);
      }
    }
  }, []);

  const getAllStudents = () => load<StudentProfile[]>(KEYS.students, []);
  const getAllCoordinators = () => load<CoordinatorProfile[]>(KEYS.coordinators, []);
  const getRegCodes = () => load<RegCodes>(KEYS.regCodes, { studentCode: "", coordCode: "" });
  const setRegCodes = (codes: RegCodes) => { save(KEYS.regCodes, codes); cloudSet("kc_reg_codes", codes); };

  // يجيب أحدث نسخة من السحابة مباشرة قبل أي محاولة دخول — عشان جهاز يدخل لأول مرة
  // (أو ما انتظر اكتمال المزامنة بالخلفية) ما يُرفض بسبب نسخة محلية فاضية أو قديمة
  const freshStudents = async (): Promise<StudentProfile[]> => {
    const cloud = await cloudGet<StudentProfile[]>("kc_students");
    if (Array.isArray(cloud) && cloud.length > 0) { save(KEYS.students, cloud); return cloud; }
    return getAllStudents();
  };
  const freshCoordinators = async (): Promise<CoordinatorProfile[]> => {
    const cloud = await cloudGet<CoordinatorProfile[]>("kc_coordinators");
    if (Array.isArray(cloud) && cloud.length > 0) { save(KEYS.coordinators, cloud); return cloud; }
    return getAllCoordinators();
  };

  const login = async (identifier: string, pw: string) => {
    const all = await freshStudents();
    // رقم الهوية لم يعد داخل النسخة العامة (حماية أمنية) — نجد المعرّف عبر فهرس الهاش أولاً
    const idFromIndex = await findStudentIdByNationalId(identifier);
    const candidate = idFromIndex ? all.find(s => s.id === idFromIndex) : undefined;
    const ok = candidate ? await verifyPassword(pw, candidate.password) : false;
    if (candidate && ok) {
      // نُعيد رقم الهوية لكائن الجلسة نفسه (المستخدم كتبه للتو ونجح التحقق منه — لا كشف بيانات جديد)
      let s: StudentProfile = { ...candidate, nationalId: identifier };
      // ترقية تلقائية: حساب قديم بكلمة مرور نص عادي يتشفّر بأول دخول ناجح له
      if (!isHashed(candidate.password)) {
        s = { ...s, password: await hashPassword(pw) };
        cloudTransact<StudentProfile[]>("kc_students", current => {
          const list = Array.isArray(current) && current.length > 0 ? current : all;
          return list.map(x => x.id === s.id ? { ...s, nationalId: "" } : x);
        });
      }
      setUser(s); save(KEYS.currentUser, s);
      if (s.status === "pending") return { success: true, message: "pending" };
      if (s.status === "rejected") return { success: false, message: "تم رفض طلبك. تواصل مع الإدارة" };
      return { success: true, message: "ok" };
    }
    return { success: false, message: "رقم الهوية أو كلمة المرور غير صحيحة" };
  };

  // دخول الطلاب برمز الجهاز (نفس آلية أكاديمية زيتون) — الطالب يسجّل بياناته
  // مرة، محمد يعتمد طلبه ويرسله رمز دخول مربوط بجهازه تحديداً
  const loginWithAccessCode = async (code: string) => {
    const deviceId = getDeviceId();
    const result = validateAccessCode(code, deviceId);
    if (result === null) return { success: false, message: "الرمز غير صحيح" };
    if (result === "wrong-device") return { success: false, message: "هذا الرمز مخصص لجهاز آخر" };
    if (result === "expired") return { success: false, message: "انتهت صلاحية هذا الرمز" };

    const all = await freshStudents();
    const s = all.find(s => s.deviceId === deviceId);
    if (!s) return { success: false, message: "لم يُعثر على طلب تسجيل مرتبط بهذا الجهاز — سجّل بياناتك أولاً" };
    if (s.status === "rejected") return { success: false, message: "تم رفض طلبك. تواصل مع الإدارة" };

    grantAccess(result);
    setUser(s); save(KEYS.currentUser, s);
    return { success: true, message: "ok" };
  };

  const loginCoordinator = async (email: string, pw: string) => {
    const all = await freshCoordinators();
    const candidate = all.find(c => c.email === email);
    const ok = candidate ? await verifyPassword(pw, candidate.password) : false;
    if (candidate && ok) {
      let c = candidate;
      // ترقية تلقائية: حساب قديم بكلمة مرور نص عادي يتشفّر بأول دخول ناجح له
      if (!isHashed(candidate.password)) {
        c = { ...candidate, password: await hashPassword(pw) };
        cloudTransact<CoordinatorProfile[]>("kc_coordinators", current => {
          const list = Array.isArray(current) && current.length > 0 ? current : all;
          return list.map(x => x.id === c.id ? c : x);
        });
      }
      setUser(c); save(KEYS.currentUser, c);
      localStorage.setItem(KEYS.sessionStartedAt, new Date().toISOString());
      if (c.status === "pending") return { success: true, message: "pending" };
      if (c.status === "rejected") return { success: false, message: "تم رفض طلبك. تواصل مع الإدارة" };
      return { success: true, message: "ok" };
    }
    return { success: false, message: "البريد الإلكتروني أو كلمة المرور غير صحيحة" };
  };

  const register = async (data: Omit<StudentProfile, "id" | "role" | "registeredAt" | "status">) => {
    // تسجيل الطلاب لا يحتاج رمز تسجيل عمداً — تسهيلاً عليهم، والموافقة تتم لاحقاً من الإدارة أو أي منسّق
    // تحقق من السحابة الحقيقية مباشرة — مو من نسخة الجهاز المحلية اللي ممكن تكون قديمة أو فيها بقايا محاولة سابقة فشلت
    const cloudStudents = await cloudGet<StudentProfile[]>("kc_students");
    const all = Array.isArray(cloudStudents) ? cloudStudents : getAllStudents();
    // رقم الهوية لم يعد داخل النسخة العامة — نتحقق من التكرار عبر فهرس الهاش لا مسح القائمة كاملة
    const existingId = await findStudentIdByNationalId(data.nationalId);
    const existing = existingId ? all.find(s => s.id === existingId) : undefined;
    if (existing) {
      // نفس رقم الهوية مسجل مسبقاً — نتعامل معه كطلب "رمز جهاز جديد" بدل رفضه، لأن هذا أغلب سبب
      // تكرار التسجيل فعلياً (جهاز جديد/مسح المتصفح، أو حساب قديم بكلمة مرور من قبل نظام رمز الجهاز
      // ما عنده deviceId أصلاً ولا طريقة رجوع غيرها). لا نلمس حالة الموافقة الحالية (معلق/مقبول/مرفوض).
      const updated: StudentProfile = { ...existing, ...data, password: existing.password, deviceId: getDeviceId() };
      const { pub, contact } = splitStudentContact(updated);
      const ok = await cloudTransact<StudentProfile[]>("kc_students", current => {
        const list = Array.isArray(current) && current.length > 0 ? current : all;
        return list.map(s => s.id === existing.id ? pub : s);
      });
      if (!ok) return { success: false, message: "تعذّر الاتصال بالإنترنت — تأكد من الشبكة/الواي فاي وحاول مرة أخرى" };
      cloudSet(`${KEYS.studentsContact}/${existing.id}`, contact);
      nidIndexEntry(data.nationalId, existing.id);
      save(KEYS.students, all.map(s => s.id === existing.id ? pub : s));
      setUser(updated); save(KEYS.currentUser, updated);
      return { success: true, message: "relinked" };
    }
    // تسجيل الطلاب الجدد صار برمز الجهاز بدون كلمة مرور — نشفّرها فقط لو أُرسلت فعلاً (توافق تسجيل قديم)
    const student: StudentProfile = { ...data, password: data.password ? await hashPassword(data.password) : data.password, deviceId: getDeviceId(), id: Date.now().toString(), role: "student", registeredAt: new Date().toISOString(), status: "pending" };
    const { pub, contact } = splitStudentContact(student);
    // يحفظ بالسحابة أولاً — لو فشل (لا يوجد إنترنت مثلاً) ما نقول للطالب "تم" وهو ما وصل فعلياً
    const ok = await cloudPush("kc_students", pub);
    if (!ok) return { success: false, message: "تعذّر الاتصال بالإنترنت — تأكد من الشبكة/الواي فاي وحاول التسجيل مرة أخرى" };
    cloudSet(`${KEYS.studentsContact}/${student.id}`, contact);
    nidIndexEntry(student.nationalId, student.id);
    save(KEYS.students, [...all, pub]);
    setUser(student); save(KEYS.currentUser, student);
    return { success: true, message: "pending" };
  };

  const registerCoordinator = async (data: Omit<CoordinatorProfile, "id" | "role" | "registeredAt" | "status">, code: string) => {
    const codes = getRegCodes();
    if (!codes.coordCode || code !== codes.coordCode)
      return { success: false, message: "رمز التسجيل غير صحيح" };
    // تحقق من السحابة الحقيقية مباشرة — مو من نسخة الجهاز المحلية اللي ممكن تكون قديمة أو فيها بقايا محاولة سابقة فشلت
    const cloudCoords = await cloudGet<CoordinatorProfile[]>("kc_coordinators");
    const all = Array.isArray(cloudCoords) ? cloudCoords : getAllCoordinators();
    if (all.find(c => c.email === data.email))
      return { success: false, message: "البريد الإلكتروني مسجل مسبقاً" };
    const baseId = Date.now().toString();
    const hashedPw = await hashPassword(data.password);
    // نسخة خفيفة بدون ملفات ثقيلة (تُحفظ في قائمة المنسقين لتجنب تجاوز حد localStorage)
    const coord: CoordinatorProfile = {
      ...data,
      password: hashedPw,
      photo: "",
      cv: "",
      id: baseId,
      role: "coordinator",
      registeredAt: new Date().toISOString(),
      status: "pending",
    };
    const { pub: coordPub, contact } = splitCoordinatorContact(coord);
    // يحفظ بالسحابة أولاً — لو فشل (لا يوجد إنترنت مثلاً) ما نقول للمنسق "تم" وهو ما وصل فعلياً
    const ok = await cloudPush("kc_coordinators", coordPub);
    if (!ok) return { success: false, message: "تعذّر الاتصال بالإنترنت — تأكد من الشبكة/الواي فاي وحاول التسجيل مرة أخرى" };
    cloudSet(`${KEYS.coordinatorsContact}/${baseId}`, contact);
    const saved = [...all, coordPub];
    try {
      localStorage.setItem(KEYS.coordinators, JSON.stringify(saved));
    } catch { /* التخزين المحلي ثانوي هنا — النسخة الأساسية وصلت للسحابة فعلاً */ }
    // الجلسة الحالية تحتفظ بالبيانات الكاملة (صورة + CV)
    const fullCoord: CoordinatorProfile = { ...data, password: hashedPw, id: baseId, role: "coordinator", registeredAt: new Date().toISOString(), status: "pending" };
    setUser(fullCoord); save(KEYS.currentUser, fullCoord);
    return { success: true, message: "pending" };
  };

  const logout = () => { setUser(null); localStorage.removeItem(KEYS.currentUser); localStorage.removeItem(KEYS.sessionStartedAt); revokeAccess(); };

  const updateProfile = (data: Partial<AnyUser>) => {
    if (!user) return;
    const updated = { ...user, ...data } as AnyUser;
    setUser(updated); save(KEYS.currentUser, updated);
    if (user.role === "coordinator") {
      const { pub: updatedPub, contact } = splitCoordinatorContact(updated as CoordinatorProfile);
      const all = getAllCoordinators().map(c => c.id === user.id ? updatedPub : c);
      save(KEYS.coordinators, all);
      cloudTransact<CoordinatorProfile[]>(KEYS.coordinators, current => {
        const list = Array.isArray(current) && current.length > 0 ? current : all;
        return list.map(c => c.id === user.id ? updatedPub : c);
      });
      cloudSet(`${KEYS.coordinatorsContact}/${user.id}`, contact);
    } else {
      const { pub: updatedPub, contact } = splitStudentContact(updated as StudentProfile);
      const all = getAllStudents().map(s => s.id === user.id ? updatedPub : s);
      save(KEYS.students, all);
      cloudTransact<StudentProfile[]>(KEYS.students, current => {
        const list = Array.isArray(current) && current.length > 0 ? current : all;
        return list.map(s => s.id === user.id ? updatedPub : s);
      });
      cloudSet(`${KEYS.studentsContact}/${user.id}`, contact);
      nidIndexEntry(contact.nationalId, user.id);
    }
  };

  // نستخدم معاملة (transaction) حقيقية بدل استبدال القائمة كاملة، لأن أكثر من منسّق
  // (أو منسّق والإدارة معاً) قد يوافقون/يرفضون طلاباً مختلفين بنفس اللحظة تماماً.
  const approveStudent = (id: string) => {
    const all = getAllStudents().map(s => s.id === id ? { ...s, status: "approved" as const } : s);
    save(KEYS.students, all);
    cloudTransact<StudentProfile[]>("kc_students", current => {
      const list = Array.isArray(current) && current.length > 0 ? current : all;
      return list.map(s => s.id === id ? { ...s, status: "approved" as const } : s);
    });
    if (user?.id === id) { const u = { ...user, status: "approved" as const }; setUser(u); save(KEYS.currentUser, u); }
  };
  const rejectStudent = (id: string) => {
    const all = getAllStudents().map(s => s.id === id ? { ...s, status: "rejected" as const } : s);
    save(KEYS.students, all);
    cloudTransact<StudentProfile[]>("kc_students", current => {
      const list = Array.isArray(current) && current.length > 0 ? current : all;
      return list.map(s => s.id === id ? { ...s, status: "rejected" as const } : s);
    });
  };
  const deleteStudent = (id: string) => {
    const all = getAllStudents().filter(s => s.id !== id);
    save(KEYS.students, all);
    cloudTransact<StudentProfile[]>("kc_students", current => {
      const list = Array.isArray(current) && current.length > 0 ? current : all;
      return list.filter(s => s.id !== id);
    });
    if (user?.id === id) logout();
  };

  const approveCoordinator = (id: string) => {
    const all = getAllCoordinators().map(c => c.id === id ? { ...c, status: "approved" as const } : c);
    save(KEYS.coordinators, all);
    cloudTransact<CoordinatorProfile[]>("kc_coordinators", current => {
      const list = Array.isArray(current) && current.length > 0 ? current : all;
      return list.map(c => c.id === id ? { ...c, status: "approved" as const } : c);
    });
    if (user?.id === id) { const u = { ...user, status: "approved" as const }; setUser(u); save(KEYS.currentUser, u); }
  };
  const rejectCoordinator = (id: string) => {
    const all = getAllCoordinators().map(c => c.id === id ? { ...c, status: "rejected" as const } : c);
    save(KEYS.coordinators, all);
    cloudTransact<CoordinatorProfile[]>("kc_coordinators", current => {
      const list = Array.isArray(current) && current.length > 0 ? current : all;
      return list.map(c => c.id === id ? { ...c, status: "rejected" as const } : c);
    });
  };
  const deleteCoordinator = (id: string) => {
    const all = getAllCoordinators().filter(c => c.id !== id);
    save(KEYS.coordinators, all);
    cloudTransact<CoordinatorProfile[]>("kc_coordinators", current => {
      const list = Array.isArray(current) && current.length > 0 ? current : all;
      return list.filter(c => c.id !== id);
    });
    if (user?.id === id) logout();
  };

  const toggleSupervisor = (id: string) => {
    const all = getAllCoordinators().map(c => c.id === id ? { ...c, isSupervisor: !c.isSupervisor } : c);
    save(KEYS.coordinators, all);
    cloudTransact<CoordinatorProfile[]>("kc_coordinators", current => {
      const list = Array.isArray(current) && current.length > 0 ? current : all;
      return list.map(c => c.id === id ? { ...c, isSupervisor: !c.isSupervisor } : c);
    });
    if (user?.id === id) { const u = { ...user, isSupervisor: !(user as CoordinatorProfile).isSupervisor }; setUser(u); save(KEYS.currentUser, u); }
  };

  // ينهي جلسة منسّق فوراً — تُتحقق بأول فتح تطبيق قادم (راجع useEffect بالأعلى)، تجبره يدخل من جديد
  const endCoordinatorSession = (id: string) => {
    const revokedAt = new Date().toISOString();
    const all = getAllCoordinators().map(c => c.id === id ? { ...c, sessionRevokedAt: revokedAt } : c);
    save(KEYS.coordinators, all);
    cloudTransact<CoordinatorProfile[]>("kc_coordinators", current => {
      const list = Array.isArray(current) && current.length > 0 ? current : all;
      return list.map(c => c.id === id ? { ...c, sessionRevokedAt: revokedAt } : c);
    });
  };

  const getGroups = () => load<ChatGroup[]>(KEYS.groups, []);
  const createGroup = (g: Omit<ChatGroup, "id" | "createdAt">) => {
    const all = [...getGroups(), { ...g, id: Date.now().toString(), createdAt: new Date().toISOString() }];
    save(KEYS.groups, all); cloudSet(KEYS.groups, all);
  };
  const deleteGroup = (id: string) => {
    const all = getGroups().filter(g => g.id !== id);
    save(KEYS.groups, all); cloudSet(KEYS.groups, all);
  };

  const getLiveStream = () => load<LiveStreamSettings>(KEYS.liveStream, defaultLiveStream);
  const updateLiveStream = (s: Partial<LiveStreamSettings>) => {
    const updated = { ...getLiveStream(), ...s };
    save(KEYS.liveStream, updated); cloudSet(KEYS.liveStream, updated);
  };

  const getCourses = () => load<CourseItem[]>(KEYS.courses, []);
  const addCourse = (c: Omit<CourseItem, "id">) => {
    const all = [...getCourses(), { ...c, id: Date.now().toString() }];
    save(KEYS.courses, all); cloudSet(KEYS.courses, all);
  };
  const deleteCourse = (id: string) => {
    const all = getCourses().filter(c => c.id !== id);
    save(KEYS.courses, all); cloudSet(KEYS.courses, all);
  };

  const getVideos = () => load<VideoItem[]>(KEYS.videos, []);
  const addVideo = (v: Omit<VideoItem, "id">) => {
    const all = [...getVideos(), { ...v, id: Date.now().toString() }];
    save(KEYS.videos, all); cloudSet(KEYS.videos, all);
  };
  const deleteVideo = (id: string) => {
    const all = getVideos().filter(v => v.id !== id);
    save(KEYS.videos, all); cloudSet(KEYS.videos, all);
  };

  const getProjects = () => load<ProjectItem[]>(KEYS.projects, []);
  const addProject = (p: Omit<ProjectItem, "id">) => {
    const all = [...getProjects(), { ...p, id: Date.now().toString() }];
    save(KEYS.projects, all); cloudSet(KEYS.projects, all);
  };
  const deleteProject = (id: string) => {
    const all = getProjects().filter(p => p.id !== id);
    save(KEYS.projects, all); cloudSet(KEYS.projects, all);
  };

  const getDailyLog = () => load<DailyLogEntry[]>(KEYS.dailyLog, []);
  // تُرجع true/false حسب نجاح الحفظ الفعلي بالسحابة — كان الحفظ يفشل بصمت لو الاتصال ضعيف
  // (تظهر باليومية محلياً لحظياً ثم "تختفي" لاحقاً لأنها ما وصلت فعلياً لقاعدة البيانات)
  const addDailyLogEntry = async (e: Omit<DailyLogEntry, "id" | "createdAt">): Promise<boolean> => {
    const entry: DailyLogEntry = { ...e, id: Date.now().toString(), createdAt: new Date().toISOString() };
    save(KEYS.dailyLog, [...getDailyLog(), entry]);
    return cloudTransact<DailyLogEntry[]>(KEYS.dailyLog, current => {
      const list = Array.isArray(current) ? current : getDailyLog();
      return [...list, entry];
    });
  };
  const deleteDailyLogEntry = async (id: string): Promise<boolean> => {
    save(KEYS.dailyLog, getDailyLog().filter(e => e.id !== id));
    return cloudTransact<DailyLogEntry[]>(KEYS.dailyLog, current => {
      const list = Array.isArray(current) ? current : getDailyLog();
      return list.filter(e => e.id !== id);
    });
  };

  const getShopItems = () => load<ShopItem[]>(KEYS.shop, []);
  const addShopItem = (s: Omit<ShopItem, "id" | "createdAt">) => {
    const all = [...getShopItems(), { ...s, id: Date.now().toString(), createdAt: new Date().toISOString() }];
    save(KEYS.shop, all); cloudSet(KEYS.shop, all);
  };
  const deleteShopItem = (id: string) => {
    const all = getShopItems().filter(s => s.id !== id);
    save(KEYS.shop, all); cloudSet(KEYS.shop, all);
  };

  const getPlatformAchievements = () => load<PlatformAchievement[]>(KEYS.achievements, []);
  const addPlatformAchievement = (a: Omit<PlatformAchievement, "id" | "createdAt">) => {
    const all = [...getPlatformAchievements(), { ...a, id: Date.now().toString(), createdAt: new Date().toISOString() }];
    save(KEYS.achievements, all); cloudSet(KEYS.achievements, all);
  };
  const deletePlatformAchievement = (id: string) => {
    const all = getPlatformAchievements().filter(a => a.id !== id);
    save(KEYS.achievements, all); cloudSet(KEYS.achievements, all);
  };

  return (
    <AuthContext.Provider value={{
      cloudSyncTick,
      user, isLoggedIn: !!user, isStudent: user?.role === "student",
      isCoordinator: user?.role === "coordinator",
      isApproved: user?.status === "approved",
      login, loginWithAccessCode, loginCoordinator, register, registerCoordinator,
      logout, updateProfile,
      getAllStudents, approveStudent, rejectStudent, deleteStudent,
      getAllCoordinators, approveCoordinator, rejectCoordinator, deleteCoordinator, toggleSupervisor, endCoordinatorSession,
      getGroups, createGroup, deleteGroup,
      getLiveStream, updateLiveStream,
      getCourses, addCourse, deleteCourse,
      getVideos, addVideo, deleteVideo,
      getProjects, addProject, deleteProject,
      getDailyLog, addDailyLogEntry, deleteDailyLogEntry,
      getShopItems, addShopItem, deleteShopItem,
      getPlatformAchievements, addPlatformAchievement, deletePlatformAchievement,
      getRegCodes, setRegCodes,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}

"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface StudentProfile {
  id: string; name: string; nationalId: string; school: string; grade: string;
  phone: string; email: string; parentPhone: string; birthDate: string;
  photo: string; password: string; role: "student"; teams: string[];
  registeredAt: string; status: "pending" | "approved" | "rejected";
}

export interface CoordinatorProfile {
  id: string; name: string; email: string; phone: string;
  school: string; subject: string;
  photo: string; cv: string; cvName: string;
  password: string; role: "coordinator";
  registeredAt: string; status: "pending" | "approved" | "rejected";
}

export type AnyUser = StudentProfile | CoordinatorProfile;

export interface ChatGroup {
  id: string; name: string; type: "general" | "team";
  emoji: string; color: string; description: string; createdAt: string;
}

export interface LiveStreamSettings {
  enabled: boolean; zoomLink: string; title: string; description: string;
}

export interface CourseItem {
  id: string; title: string; description: string; type: "free" | "paid"; link: string; emoji: string;
}

export interface VideoItem {
  id: string; title: string; link: string; description: string; emoji: string;
}

export interface ProjectItem {
  id: string; title: string; description: string; field: string; level: string; emoji: string;
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
  user: AnyUser | null;
  isLoggedIn: boolean;
  isStudent: boolean;
  isCoordinator: boolean;
  isApproved: boolean;
  login: (id: string, pw: string) => { success: boolean; message: string };
  loginCoordinator: (email: string, pw: string) => { success: boolean; message: string };
  register: (data: Omit<StudentProfile, "id" | "role" | "registeredAt" | "status">, code: string) => { success: boolean; message: string };
  registerCoordinator: (data: Omit<CoordinatorProfile, "id" | "role" | "registeredAt" | "status">, code: string) => { success: boolean; message: string };
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
  coordinators: "kc_coordinators",
  groups: "kc_groups", liveStream: "kc_liveStream",
  courses: "kc_courses", videos: "kc_videos", projects: "kc_projects",
  shop: "kc_shop", achievements: "kc_platform_achievements",
  regCodes: "kc_reg_codes",
};

function load<T>(key: string, fallback: T): T {
  try { const d = localStorage.getItem(key); return d ? JSON.parse(d) : fallback; } catch { return fallback; }
}
function save(key: string, val: unknown) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

const defaultLiveStream: LiveStreamSettings = {
  enabled: false, zoomLink: "", title: "البث المباشر", description: "لا يوجد بث مباشر الآن"
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AnyUser | null>(null);

  useEffect(() => {
    const stored = load<AnyUser | null>(KEYS.currentUser, null);
    if (stored) {
      const all = stored.role === "coordinator"
        ? load<CoordinatorProfile[]>(KEYS.coordinators, [])
        : load<StudentProfile[]>(KEYS.students, []);
      const fresh = (all as AnyUser[]).find(u => u.id === stored.id);
      setUser(fresh || stored);
    }
  }, []);

  const getAllStudents = () => load<StudentProfile[]>(KEYS.students, []);
  const getAllCoordinators = () => load<CoordinatorProfile[]>(KEYS.coordinators, []);
  const getRegCodes = () => load<RegCodes>(KEYS.regCodes, { studentCode: "", coordCode: "" });
  const setRegCodes = (codes: RegCodes) => save(KEYS.regCodes, codes);

  const login = (identifier: string, pw: string) => {
    const s = getAllStudents().find(s => s.nationalId === identifier && s.password === pw);
    if (s) {
      setUser(s); save(KEYS.currentUser, s);
      if (s.status === "pending") return { success: true, message: "pending" };
      if (s.status === "rejected") return { success: false, message: "تم رفض طلبك. تواصل مع الإدارة" };
      return { success: true, message: "ok" };
    }
    return { success: false, message: "رقم الهوية أو كلمة المرور غير صحيحة" };
  };

  const loginCoordinator = (email: string, pw: string) => {
    const c = getAllCoordinators().find(c => c.email === email && c.password === pw);
    if (c) {
      setUser(c); save(KEYS.currentUser, c);
      if (c.status === "pending") return { success: true, message: "pending" };
      if (c.status === "rejected") return { success: false, message: "تم رفض طلبك. تواصل مع الإدارة" };
      return { success: true, message: "ok" };
    }
    return { success: false, message: "البريد الإلكتروني أو كلمة المرور غير صحيحة" };
  };

  const register = (data: Omit<StudentProfile, "id" | "role" | "registeredAt" | "status">, code: string) => {
    const codes = getRegCodes();
    if (codes.studentCode && code !== codes.studentCode)
      return { success: false, message: "رمز التسجيل غير صحيح" };
    const all = getAllStudents();
    if (all.find(s => s.nationalId === data.nationalId))
      return { success: false, message: "رقم الهوية مسجل مسبقاً" };
    const student: StudentProfile = { ...data, id: Date.now().toString(), role: "student", registeredAt: new Date().toISOString(), status: "pending" };
    save(KEYS.students, [...all, student]);
    setUser(student); save(KEYS.currentUser, student);
    return { success: true, message: "pending" };
  };

  const registerCoordinator = (data: Omit<CoordinatorProfile, "id" | "role" | "registeredAt" | "status">, code: string) => {
    const codes = getRegCodes();
    if (codes.coordCode && code !== codes.coordCode)
      return { success: false, message: "رمز التسجيل غير صحيح" };
    const all = getAllCoordinators();
    if (all.find(c => c.email === data.email))
      return { success: false, message: "البريد الإلكتروني مسجل مسبقاً" };
    const coord: CoordinatorProfile = { ...data, id: Date.now().toString(), role: "coordinator", registeredAt: new Date().toISOString(), status: "pending" };
    save(KEYS.coordinators, [...all, coord]);
    setUser(coord); save(KEYS.currentUser, coord);
    return { success: true, message: "pending" };
  };

  const logout = () => { setUser(null); localStorage.removeItem(KEYS.currentUser); };

  const updateProfile = (data: Partial<AnyUser>) => {
    if (!user) return;
    const updated = { ...user, ...data } as AnyUser;
    if (user.role === "coordinator") {
      save(KEYS.coordinators, getAllCoordinators().map(c => c.id === user.id ? updated as CoordinatorProfile : c));
    } else {
      save(KEYS.students, getAllStudents().map(s => s.id === user.id ? updated as StudentProfile : s));
    }
    setUser(updated); save(KEYS.currentUser, updated);
  };

  const approveStudent = (id: string) => {
    const all = getAllStudents().map(s => s.id === id ? { ...s, status: "approved" as const } : s);
    save(KEYS.students, all);
    if (user?.id === id) { const u = { ...user, status: "approved" as const }; setUser(u); save(KEYS.currentUser, u); }
  };
  const rejectStudent = (id: string) => {
    save(KEYS.students, getAllStudents().map(s => s.id === id ? { ...s, status: "rejected" as const } : s));
  };
  const deleteStudent = (id: string) => {
    save(KEYS.students, getAllStudents().filter(s => s.id !== id));
    if (user?.id === id) logout();
  };

  const approveCoordinator = (id: string) => {
    const all = getAllCoordinators().map(c => c.id === id ? { ...c, status: "approved" as const } : c);
    save(KEYS.coordinators, all);
    if (user?.id === id) { const u = { ...user, status: "approved" as const }; setUser(u); save(KEYS.currentUser, u); }
  };
  const rejectCoordinator = (id: string) => {
    save(KEYS.coordinators, getAllCoordinators().map(c => c.id === id ? { ...c, status: "rejected" as const } : c));
  };
  const deleteCoordinator = (id: string) => {
    save(KEYS.coordinators, getAllCoordinators().filter(c => c.id !== id));
    if (user?.id === id) logout();
  };

  const getGroups = () => load<ChatGroup[]>(KEYS.groups, []);
  const createGroup = (g: Omit<ChatGroup, "id" | "createdAt">) =>
    save(KEYS.groups, [...getGroups(), { ...g, id: Date.now().toString(), createdAt: new Date().toISOString() }]);
  const deleteGroup = (id: string) => save(KEYS.groups, getGroups().filter(g => g.id !== id));

  const getLiveStream = () => load<LiveStreamSettings>(KEYS.liveStream, defaultLiveStream);
  const updateLiveStream = (s: Partial<LiveStreamSettings>) => save(KEYS.liveStream, { ...getLiveStream(), ...s });

  const getCourses = () => load<CourseItem[]>(KEYS.courses, []);
  const addCourse = (c: Omit<CourseItem, "id">) => save(KEYS.courses, [...getCourses(), { ...c, id: Date.now().toString() }]);
  const deleteCourse = (id: string) => save(KEYS.courses, getCourses().filter(c => c.id !== id));

  const getVideos = () => load<VideoItem[]>(KEYS.videos, []);
  const addVideo = (v: Omit<VideoItem, "id">) => save(KEYS.videos, [...getVideos(), { ...v, id: Date.now().toString() }]);
  const deleteVideo = (id: string) => save(KEYS.videos, getVideos().filter(v => v.id !== id));

  const getProjects = () => load<ProjectItem[]>(KEYS.projects, []);
  const addProject = (p: Omit<ProjectItem, "id">) => save(KEYS.projects, [...getProjects(), { ...p, id: Date.now().toString() }]);
  const deleteProject = (id: string) => save(KEYS.projects, getProjects().filter(p => p.id !== id));

  const getShopItems = () => load<ShopItem[]>(KEYS.shop, []);
  const addShopItem = (s: Omit<ShopItem, "id" | "createdAt">) =>
    save(KEYS.shop, [...getShopItems(), { ...s, id: Date.now().toString(), createdAt: new Date().toISOString() }]);
  const deleteShopItem = (id: string) => save(KEYS.shop, getShopItems().filter(s => s.id !== id));

  const getPlatformAchievements = () => load<PlatformAchievement[]>(KEYS.achievements, []);
  const addPlatformAchievement = (a: Omit<PlatformAchievement, "id" | "createdAt">) =>
    save(KEYS.achievements, [...getPlatformAchievements(), { ...a, id: Date.now().toString(), createdAt: new Date().toISOString() }]);
  const deletePlatformAchievement = (id: string) =>
    save(KEYS.achievements, getPlatformAchievements().filter(a => a.id !== id));

  return (
    <AuthContext.Provider value={{
      user, isLoggedIn: !!user, isStudent: user?.role === "student",
      isCoordinator: user?.role === "coordinator",
      isApproved: user?.status === "approved",
      login, loginCoordinator, register, registerCoordinator,
      logout, updateProfile,
      getAllStudents, approveStudent, rejectStudent, deleteStudent,
      getAllCoordinators, approveCoordinator, rejectCoordinator, deleteCoordinator,
      getGroups, createGroup, deleteGroup,
      getLiveStream, updateLiveStream,
      getCourses, addCourse, deleteCourse,
      getVideos, addVideo, deleteVideo,
      getProjects, addProject, deleteProject,
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

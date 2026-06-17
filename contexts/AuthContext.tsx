"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface StudentProfile {
  id: string;
  name: string;
  nationalId: string;
  school: string;
  grade: string;
  phone: string;
  email: string;
  parentPhone: string;
  birthDate: string;
  photo: string;
  password: string;
  role: "student";
  teams: string[];
  registeredAt: string;
  status: "pending" | "approved" | "rejected";
}

export interface ChatGroup {
  id: string;
  name: string;
  type: "general" | "team";
  emoji: string;
  color: string;
  description: string;
  createdAt: string;
}

export interface LiveStreamSettings {
  enabled: boolean;
  zoomLink: string;
  title: string;
  description: string;
}

export interface CourseItem {
  id: string;
  title: string;
  description: string;
  type: "free" | "paid";
  link: string;
  emoji: string;
}

export interface VideoItem {
  id: string;
  title: string;
  link: string;
  description: string;
  emoji: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  field: string;
  level: string;
  emoji: string;
}

interface AuthContextType {
  user: StudentProfile | null;
  isLoggedIn: boolean;
  isStudent: boolean;
  isApproved: boolean;
  login: (nationalId: string, password: string) => { success: boolean; message: string };
  register: (data: Omit<StudentProfile, "id" | "role" | "registeredAt" | "status">) => { success: boolean; message: string };
  logout: () => void;
  updateProfile: (data: Partial<StudentProfile>) => void;
  getAllStudents: () => StudentProfile[];
  approveStudent: (id: string) => void;
  rejectStudent: (id: string) => void;
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
}

const AuthContext = createContext<AuthContextType | null>(null);

const KEYS = {
  students: "kc_students",
  currentUser: "kc_currentUser",
  groups: "kc_groups",
  liveStream: "kc_liveStream",
  courses: "kc_courses",
  videos: "kc_videos",
  projects: "kc_projects",
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
  const [user, setUser] = useState<StudentProfile | null>(null);

  useEffect(() => {
    const stored = load<StudentProfile | null>(KEYS.currentUser, null);
    if (stored) {
      const all = load<StudentProfile[]>(KEYS.students, []);
      const fresh = all.find(s => s.id === stored.id);
      setUser(fresh || stored);
    }
  }, []);

  const getAllStudents = () => load<StudentProfile[]>(KEYS.students, []);

  const login = (nationalId: string, password: string) => {
    const found = getAllStudents().find(s => s.nationalId === nationalId && s.password === password);
    if (!found) return { success: false, message: "رقم الهوية أو كلمة المرور غير صحيحة" };
    setUser(found);
    save(KEYS.currentUser, found);
    if (found.status === "pending") return { success: true, message: "pending" };
    if (found.status === "rejected") return { success: false, message: "تم رفض طلبك. تواصل مع الإدارة" };
    return { success: true, message: "تم تسجيل الدخول" };
  };

  const register = (data: Omit<StudentProfile, "id" | "role" | "registeredAt" | "status">) => {
    const all = getAllStudents();
    if (all.find(s => s.nationalId === data.nationalId))
      return { success: false, message: "رقم الهوية مسجل مسبقاً" };
    const student: StudentProfile = {
      ...data, id: Date.now().toString(), role: "student",
      registeredAt: new Date().toISOString(), status: "pending",
    };
    save(KEYS.students, [...all, student]);
    setUser(student);
    save(KEYS.currentUser, student);
    return { success: true, message: "pending" };
  };

  const logout = () => { setUser(null); localStorage.removeItem(KEYS.currentUser); };

  const updateProfile = (data: Partial<StudentProfile>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    const all = getAllStudents().map(s => s.id === user.id ? updated : s);
    save(KEYS.students, all);
    setUser(updated);
    save(KEYS.currentUser, updated);
  };

  const approveStudent = (id: string) => {
    const all = getAllStudents().map(s => s.id === id ? { ...s, status: "approved" as const } : s);
    save(KEYS.students, all);
    if (user?.id === id) { const u = { ...user, status: "approved" as const }; setUser(u); save(KEYS.currentUser, u); }
  };

  const rejectStudent = (id: string) => {
    const all = getAllStudents().map(s => s.id === id ? { ...s, status: "rejected" as const } : s);
    save(KEYS.students, all);
  };

  const getGroups = () => load<ChatGroup[]>(KEYS.groups, []);
  const createGroup = (g: Omit<ChatGroup, "id" | "createdAt">) => {
    const groups = getGroups();
    save(KEYS.groups, [...groups, { ...g, id: Date.now().toString(), createdAt: new Date().toISOString() }]);
  };
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

  return (
    <AuthContext.Provider value={{
      user, isLoggedIn: !!user, isStudent: user?.role === "student",
      isApproved: user?.status === "approved",
      login, register, logout, updateProfile,
      getAllStudents, approveStudent, rejectStudent,
      getGroups, createGroup, deleteGroup,
      getLiveStream, updateLiveStream,
      getCourses, addCourse, deleteCourse,
      getVideos, addVideo, deleteVideo,
      getProjects, addProject, deleteProject,
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

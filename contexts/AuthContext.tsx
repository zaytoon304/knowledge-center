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
  photo: string; // base64
  password: string;
  role: "student";
  teams: string[]; // IDs of teams the student belongs to
  registeredAt: string;
}

interface AuthContextType {
  user: StudentProfile | null;
  isLoggedIn: boolean;
  isStudent: boolean;
  login: (nationalId: string, password: string) => { success: boolean; message: string };
  register: (data: Omit<StudentProfile, "id" | "role" | "registeredAt">) => { success: boolean; message: string };
  logout: () => void;
  updateProfile: (data: Partial<StudentProfile>) => void;
  getAllStudents: () => StudentProfile[];
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StudentProfile | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("currentUser");
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch {}
    }
  }, []);

  const getAllStudents = (): StudentProfile[] => {
    try {
      const data = localStorage.getItem("students");
      return data ? JSON.parse(data) : [];
    } catch { return []; }
  };

  const saveStudents = (students: StudentProfile[]) => {
    localStorage.setItem("students", JSON.stringify(students));
  };

  const login = (nationalId: string, password: string) => {
    const students = getAllStudents();
    const found = students.find(s => s.nationalId === nationalId && s.password === password);
    if (!found) return { success: false, message: "رقم الهوية أو كلمة المرور غير صحيحة" };
    setUser(found);
    localStorage.setItem("currentUser", JSON.stringify(found));
    return { success: true, message: "تم تسجيل الدخول بنجاح" };
  };

  const register = (data: Omit<StudentProfile, "id" | "role" | "registeredAt">) => {
    const students = getAllStudents();
    if (students.find(s => s.nationalId === data.nationalId)) {
      return { success: false, message: "رقم الهوية مسجل مسبقاً" };
    }
    const newStudent: StudentProfile = {
      ...data,
      id: Date.now().toString(),
      role: "student",
      registeredAt: new Date().toISOString(),
    };
    saveStudents([...students, newStudent]);
    setUser(newStudent);
    localStorage.setItem("currentUser", JSON.stringify(newStudent));
    return { success: true, message: "تم إنشاء الحساب بنجاح" };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("currentUser");
  };

  const updateProfile = (data: Partial<StudentProfile>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    const students = getAllStudents().map(s => s.id === user.id ? updated : s);
    saveStudents(students);
    setUser(updated);
    localStorage.setItem("currentUser", JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoggedIn: !!user,
      isStudent: user?.role === "student",
      login,
      register,
      logout,
      updateProfile,
      getAllStudents,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

"use client";
import { useState, useEffect } from "react";
import { MessageSquare, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import GroupsChat from "@/components/shared/GroupsChat";

export default function GroupsPage() {
  const { isLoggedIn } = useAuth();
  const [adminCheck, setAdminCheck] = useState(false);

  useEffect(() => {
    setAdminCheck(typeof window !== "undefined" && localStorage.getItem("kc_admin_auth") === "1");
  }, []);

  if (!adminCheck && !isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
          <Lock className="w-8 h-8 text-blue-700" />
        </div>
        <h2 className="font-bold text-gray-800 text-xl">الجروبات للأعضاء فقط</h2>
        <p className="text-gray-500 text-sm">يجب تسجيل الدخول للوصول إلى الجروبات</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="card p-5 mb-5 bg-gradient-to-l from-blue-800 to-indigo-700 text-white">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">الجروبات</h1>
          </div>
        </div>
      </div>

      <GroupsChat />
    </div>
  );
}

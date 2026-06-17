"use client";
import "./globals.css";
import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";

function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isStudent, isLoggedIn } = useAuth();
  const pathname = usePathname();

  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} studentMode={isStudent && isLoggedIn} />
      <div className="main-content flex flex-col min-h-screen">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <title>مركز المعرفة والابتكار بمدارس الأرق</title>
        <meta name="description" content="نظام الإدارة المعرفية والتعليمية لوحدة الموهبة والابتكار والذكاء الاصطناعي" />
      </head>
      <body>
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}

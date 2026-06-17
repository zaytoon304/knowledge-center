"use client";
import "./globals.css";
import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <html lang="ar" dir="rtl">
      <head>
        <title>مركز المعرفة والابتكار</title>
        <meta name="description" content="نظام الإدارة المعرفية والتعليمية لوحدة الموهبة والابتكار والذكاء الاصطناعي" />
      </head>
      <body>
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="main-content flex flex-col min-h-screen">
          <Navbar onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 p-4 md:p-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

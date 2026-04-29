import React from "react";
import { Footer } from "@/components/Footer";
import { AdminMobileTopbar } from "@/components/admin/AdminMobileTopbar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminMobileNav } from "@/components/admin/AdminMobileNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#0d1117] flex flex-col md:flex-row transition-colors duration-300">

      {/* ══ MOBILE TOPBAR ══════════════════════════════════════════════════════ */}
      <AdminMobileTopbar />

      {/* ══ DESKTOP SIDEBAR ════════════════════════════════════════════════════ */}
      <AdminSidebar />

      {/* ══ MAIN CONTENT ═══════════════════════════════════════════════════════ */}
      <main className="flex-1 flex flex-col md:h-screen overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6
                        bg-slate-100 dark:bg-[#0d1117]">
          {children}
        </div>
      </main>

      {/* ══ MOBILE BOTTOM NAVBAR ════════════════════════════════════════════════ */} 
      <AdminMobileNav />

    </div>
  );
}

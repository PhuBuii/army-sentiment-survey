"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { logout } from "@/app/login/actions";
import {
  LayoutDashboard, UsersRound, HelpCircle,
  LogOut, ChevronRight, UserCog, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

// Each item has its own accent color — per user preference
const navItems = [
  {
    name: "Tổng quan",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    color: "emerald",
    // Tailwind classes per color
    activeText:   "text-emerald-600 dark:text-emerald-400",
    activeBg:     "bg-emerald-500/10 dark:bg-emerald-400/10",
    activeBorder: "border-emerald-500/20 dark:border-emerald-400/20",
    activeBar:    "bg-emerald-500 dark:bg-emerald-400",
    sidebarActive:"bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
    sidebarIcon:  "text-emerald-400",
    sidebarDot:   "bg-emerald-400",
  },
  {
    name: "Chiến sĩ",
    href: "/admin/soldiers",
    icon: UsersRound,
    color: "blue",
    activeText:   "text-blue-600 dark:text-blue-400",
    activeBg:     "bg-blue-500/10 dark:bg-blue-400/10",
    activeBorder: "border-blue-500/20 dark:border-blue-400/20",
    activeBar:    "bg-blue-500 dark:bg-blue-400",
    sidebarActive:"bg-blue-500/15 text-blue-300 border-blue-500/25",
    sidebarIcon:  "text-blue-400",
    sidebarDot:   "bg-blue-400",
  },
  {
    name: "Câu hỏi",
    href: "/admin/questions",
    icon: HelpCircle,
    color: "amber",
    activeText:   "text-amber-600 dark:text-amber-400",
    activeBg:     "bg-amber-500/10 dark:bg-amber-400/10",
    activeBorder: "border-amber-500/20 dark:border-amber-400/20",
    activeBar:    "bg-amber-500 dark:bg-amber-400",
    sidebarActive:"bg-amber-500/15 text-amber-300 border-amber-500/25",
    sidebarIcon:  "text-amber-400",
    sidebarDot:   "bg-amber-400",
  },
  {
    name: "Tài khoản",
    href: "/admin/accounts",
    icon: UserCog,
    color: "purple",
    activeText:   "text-purple-600 dark:text-purple-400",
    activeBg:     "bg-purple-500/10 dark:bg-purple-400/10",
    activeBorder: "border-purple-500/20 dark:border-purple-400/20",
    activeBar:    "bg-purple-500 dark:bg-purple-400",
    sidebarActive:"bg-purple-500/15 text-purple-300 border-purple-500/25",
    sidebarIcon:  "text-purple-400",
    sidebarDot:   "bg-purple-400",
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const getCurrent = () =>
    navItems.find(i => pathname.includes(i.href.split("/").pop()!));

  const getPageName = () => getCurrent()?.name ?? "Hệ thống";

  const isActive = (href: string) =>
    pathname.includes(href.split("/").pop()!);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#0d1117] flex flex-col md:flex-row transition-colors duration-300">

      {/* ══ MOBILE TOPBAR ══════════════════════════════════════════════════════ */}
      <div className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3
                      bg-white/95 dark:bg-[#161b22]/98 border-b border-slate-200/60 dark:border-white/8
                      backdrop-blur-xl shadow-sm">
        <div className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="Logo" width={34} height={34} className="rounded-xl" />
          <div>
            <p className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-0.5">
              Ban Chỉ Huy
            </p>
            <h2 className="font-bold text-slate-900 dark:text-white text-[15px] leading-tight">
              {getPageName()}
            </h2>
          </div>
        </div>
        <div className="flex items-center">
          <ThemeToggle />
          <form action={logout}>
            <Button
              type="submit" variant="ghost" size="icon"
              className="w-9 h-9 ml-0.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl"
            >
              <LogOut size={17} />
            </Button>
          </form>
        </div>
      </div>

      {/* ══ DESKTOP SIDEBAR ════════════════════════════════════════════════════ */}
      <aside className="hidden md:flex flex-col w-[220px] shrink-0
                        bg-[#0f1419] dark:bg-[#0d1117] border-r border-white/[0.06] text-slate-300">
        {/* Brand */}
        <div className="px-5 py-[18px] border-b border-white/[0.06] flex items-center gap-3">
          <Image
            src="/logo.png" alt="Logo"
            width={38} height={38}
            className="rounded-xl border border-white/10 shadow-md"
          />
          <div>
            <h2 className="text-[13px] font-bold text-white leading-tight tracking-tight">Ban Chỉ Huy</h2>
            <p className="text-[9px] text-slate-500 uppercase tracking-[0.12em] font-semibold mt-0.5">Army Survey</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto mt-1">
          <p className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.15em] mb-2 mt-1 px-3">
            Điều hướng
          </p>
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center gap-2.5 px-3 py-[9px] rounded-xl text-[13px] font-medium
                            transition-all duration-150 border
                            ${active
                              ? `${item.sidebarActive} shadow-sm`
                              : "text-slate-400 hover:bg-white/[.05] hover:text-slate-200 border-transparent"
                            }`}
              >
                <item.icon
                  size={16}
                  className={`shrink-0 ${active ? item.sidebarIcon : "text-slate-500 group-hover:text-slate-300"}`}
                  strokeWidth={active ? 2.5 : 2}
                />
                <span className="flex-1">{item.name}</span>
                {active && <span className={`w-1.5 h-1.5 rounded-full ${item.sidebarDot}`} />}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="px-3 pb-4 pt-3 border-t border-white/[0.06]">
          <div className="flex items-center gap-2.5 px-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/25
                            flex items-center justify-center shrink-0">
              <span className="text-[11px] font-extrabold text-emerald-400">AD</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-slate-200 truncate">Administrator</p>
              <p className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                Đang hoạt động
              </p>
            </div>
          </div>
          <form action={logout}>
            <Button
              type="submit" variant="ghost"
              className="w-full justify-start text-slate-500 hover:text-red-400 hover:bg-red-500/10
                         gap-2 h-9 text-[13px] rounded-xl"
            >
              <LogOut size={14} />
              Đăng xuất
            </Button>
          </form>
        </div>
      </aside>

      {/* ══ MAIN CONTENT ═══════════════════════════════════════════════════════ */}
      <main className="flex-1 flex flex-col md:h-screen overflow-hidden">
        {/* Breadcrumb header */}
        <header className="hidden md:flex items-center justify-between h-14 px-6
                            bg-white dark:bg-[#161b22] border-b border-slate-200/70 dark:border-white/8
                            sticky top-0 z-10 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-2 text-[13px]">
            <span className="text-slate-400 dark:text-slate-500 font-medium">Ban Chỉ Huy</span>
            <ChevronRight size={13} className="text-slate-300 dark:text-slate-700" />
            <span className="text-slate-800 dark:text-slate-200 font-semibold">{getPageName()}</span>
          </div>
          <ThemeToggle />
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6
                        bg-slate-100 dark:bg-[#0d1117]">
          <React.Suspense
            fallback={
              <div className="flex h-64 items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-7 h-7 animate-spin text-emerald-500" />
                  <p className="text-xs text-slate-400">Đang tải dữ liệu...</p>
                </div>
              </div>
            }
          >
            {children}
          </React.Suspense>
        </div>
      </main>

      {/* ══ MOBILE BOTTOM NAVBAR ════════════════════════════════════════════════
          • grid-cols-4: equal width tabs guaranteed
          • Each item uses its own accent color (emerald/blue/amber/purple)
          • Same display pattern: top-bar line + pill bg + icon + label
      ══════════════════════════════════════════════════════════════════════════*/} 
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/80 dark:bg-[#161b22]/80 backdrop-blur-xl border-t border-slate-200/50 dark:border-white/5 shadow-[0_-1px_10px_rgba(0,0,0,0.05)]"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="grid grid-cols-4 h-16 max-w-lg mx-auto">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-col items-center justify-center select-none active:scale-95 transition-transform"
              >
                <div className={`
                  flex flex-col items-center justify-center px-4 py-1.5 rounded-2xl transition-all duration-300
                  ${active ? `${item.activeBg} ${item.activeText}` : "text-slate-400 dark:text-slate-500"}
                `}>
                  <item.icon
                    size={20}
                    strokeWidth={active ? 2.5 : 2}
                    className="mb-0.5"
                  />
                  <span className="text-[10px] font-bold tracking-tight">
                    {item.name}
                  </span>
                </div>
                {/* Active indicator dot */}
                {active && (
                  <span className={`absolute bottom-1 w-1 h-1 rounded-full ${item.activeBar}`} />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

    </div>
  );
}

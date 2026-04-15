"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/login/actions";
import { LayoutDashboard, UsersRound, HelpCircle, LogOut, ShieldAlert, ChevronRight, UserCog, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const getPageName = () => {
    if (pathname.includes("dashboard")) return "Tổng quan";
    if (pathname.includes("soldiers")) return "Chiến sĩ";
    if (pathname.includes("questions")) return "Câu hỏi";
    if (pathname.includes("accounts")) return "Tài khoản";
    return "Hệ thống phân tích";
  };

  const navItems = [
    { name: "Tổng quan", href: "/admin/dashboard", icon: LayoutDashboard, color: "text-emerald-400", activeClass: "bg-slate-800 dark:bg-white/10 text-emerald-400", mobileColor: "text-emerald-600 dark:text-emerald-400" },
    { name: "Chiến sĩ", href: "/admin/soldiers", icon: UsersRound, color: "text-blue-400", activeClass: "bg-slate-800 dark:bg-white/10 text-blue-400", mobileColor: "text-blue-600 dark:text-blue-400" },
    { name: "Câu hỏi", href: "/admin/questions", icon: HelpCircle, color: "text-amber-400", activeClass: "bg-slate-800 dark:bg-white/10 text-amber-400", mobileColor: "text-amber-600 dark:text-amber-400" },
    { name: "Tài khoản", href: "/admin/accounts", icon: UserCog, color: "text-purple-400", activeClass: "bg-slate-800 dark:bg-white/10 text-purple-400", mobileColor: "text-purple-600 dark:text-purple-400" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background flex flex-col md:flex-row transition-colors duration-300 overflow-hidden">
      
      {/* ── Mobile Topbar ── */}
      <div className="md:hidden flex items-center justify-between bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-white/10 p-4 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-2">
           <div className="p-1.5 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg">
             <ShieldAlert size={20} />
           </div>
           <h2 className="font-bold text-slate-900 dark:text-slate-100">{getPageName()}</h2>
        </div>
        <div className="flex items-center gap-2">
           <ThemeToggle />
           <form action={logout}>
             <Button type="submit" variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
               <LogOut size={20} />
             </Button>
           </form>
        </div>
      </div>

      {/* ── Desktop Sidebar ── */}
      <aside className={`
        hidden md:flex flex-col inset-y-0 left-0 z-50 w-64 bg-slate-900 dark:bg-[#0a0f08] border-r border-slate-800 dark:border-white/5 text-slate-300 shadow-2xl
      `}>
        <div className="p-6 border-b border-slate-800 dark:border-white/5 flex items-center gap-3 bg-slate-950 dark:bg-[#060905]">
          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
            <ShieldAlert size={24} />
          </div>
          <div>
             <h2 className="font-bold text-slate-100 tracking-tight leading-tight">Ban Chỉ Huy</h2>
             <p className="text-[10px] sm:text-xs text-slate-500 font-medium">Army Sentiment AI</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 mt-2 px-3">Quản trị & Phân tích</div>
          
          {navItems.map((item) => {
            const isActive = pathname.includes(item.href.split('/').pop()!);
            return (
              <Link key={item.name} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group ${isActive ? item.activeClass : 'hover:bg-slate-800 dark:hover:bg-white/5 hover:text-white'}`}>
                <item.icon size={18} className={isActive ? item.color : `text-slate-400 group-hover:${item.color.split(' ')[0]}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 dark:border-white/5 bg-slate-950/50 dark:bg-[#060905]">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-slate-800 dark:bg-white/10 flex items-center justify-center border border-slate-700 dark:border-white/5">
              <span className="text-xs font-bold text-slate-300">AD</span>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-slate-200 truncate">Administrator</p>
              <p className="text-[10px] text-emerald-500 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Trực tuyến</p>
            </div>
          </div>
          <form action={logout}>
            <Button type="submit" variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-950/30 gap-2">
              <LogOut size={16} />
              Đăng xuất
            </Button>
          </form>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <main className="flex-1 flex flex-col h-[calc(100vh-130px)] md:h-screen md:min-h-screen overflow-hidden">
        {/* Top Header (Desktop Only) */}
        <header className="h-14 bg-white dark:bg-background border-b border-slate-200 dark:border-border hidden md:flex items-center justify-between px-6 shadow-sm z-10 sticky top-0 transition-colors duration-300">
           <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
             <span className="text-slate-400 dark:text-slate-500">Ban Chỉ Huy</span>
             <ChevronRight size={14} className="mx-2 text-slate-300 dark:text-slate-600" />
             <span className="text-slate-800 dark:text-slate-200 font-medium tracking-tight">
               {getPageName()}
             </span>
           </div>
           <div>
             <ThemeToggle />
           </div>
        </header>
        
        {/* pb-20 on mobile to ensure content isn't hidden by bottom nav */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 md:pb-8">
          <React.Suspense fallback={<div className="flex h-full items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-600 dark:text-[#a3e635]" /></div>}>
            {children}
          </React.Suspense>
        </div>
      </main>

      {/* ── Mobile Bottom Navbar ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-white/10 px-2 py-2 flex items-center justify-around shadow-[0_-4px_10px_rgba(0,0,0,0.05)] pb-safe">
        {navItems.map((item) => {
           const isActive = pathname.includes(item.href.split('/').pop()!);
           return (
             <Link 
               key={item.href} 
               href={item.href} 
               className={`flex flex-col items-center justify-center p-2 rounded-xl min-w-[70px] transition-all duration-200 ${isActive ? 'bg-slate-50 dark:bg-white/5 scale-105' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'}`}
             >
               <item.icon size={22} className={isActive ? item.mobileColor : "text-slate-400 dark:text-slate-500"} strokeWidth={isActive ? 2.5 : 2} />
               <span className={`text-[10px] mt-1 font-medium ${isActive ? 'text-slate-900 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400'}`}>
                 {item.name}
               </span>
               {isActive && (
                 <span className={`absolute -top-2 w-1.5 h-1.5 rounded-full ${item.mobileColor.split(' ')[0].replace('text-', 'bg-')} dark:${item.mobileColor.split(' ')[1].replace('text-', 'bg-')}`}></span>
               )}
             </Link>
           );
        })}
      </nav>
      
    </div>
  );
}

"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { logout } from "@/app/login/actions";
import { 
  LogOut, UserCircle2, MessageSquarePlus, ChevronUp, ChevronDown, Settings 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { navItems } from "@/constants/navigation";
import { FeedbackModal } from "./FeedbackModal";
import { motion, AnimatePresence } from "framer-motion";

export function AdminSidebar() {
  const pathname = usePathname();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isActive = (href: string) =>
    pathname.includes(href.split("/").pop()!);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <aside className="hidden md:flex flex-col w-[240px] shrink-0
                      bg-[#0f1419] dark:bg-[#0d1117] border-r border-white/[0.06] text-slate-300">
      {/* Brand */}
      <div className="px-6 h-16 border-b border-white/[0.06] flex items-center gap-3">
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

      {/* Bottom Section: Feedback then User */}
      <div className="px-3 pb-4 pt-1 border-t border-white/[0.06] space-y-2">
        {/* Feedback Section - Now above User */}
        <FeedbackModal>
          <button 
            type="button"
            className="group cursor-pointer relative p-3 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-blue-500/5 border border-white/[0.03] hover:border-emerald-500/20 transition-all duration-300 w-full text-left outline-none"
          >
            <div className="flex items-center gap-3 mb-1.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <MessageSquarePlus size={16} />
              </div>
              <span className="text-[11px] font-bold text-slate-200 uppercase tracking-tight">Góp ý hệ thống</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed font-medium">Hãy cùng nhau hoàn thiện hơn nữa</p>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          </button>
        </FeedbackModal>

        {/* User Popup Section */}
        <div className="relative" ref={menuRef}>
          <AnimatePresence>
            {isUserMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute bottom-full left-0 w-full mb-2 p-2 bg-[#1a1f26] border border-white/[0.08] 
                           rounded-2xl shadow-2xl backdrop-blur-xl z-50"
              >
                <div className="px-3 py-2 border-b border-white/[0.06] mb-1">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tài khoản</p>
                </div>
                
                <div className="space-y-1">
                  <Link href="/admin/profile" onClick={() => setIsUserMenuOpen(false)}>
                    <button className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium
                                     text-slate-400 hover:bg-white/[.05] hover:text-slate-200 transition-all">
                      <UserCircle2 size={16} className="text-emerald-400" />
                      Thông tin cá nhân
                    </button>
                  </Link>
                  {/* <Link href="/admin/settings" onClick={() => setIsUserMenuOpen(false)}>
                    <button className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium
                                     text-slate-400 hover:bg-white/[.05] hover:text-slate-200 transition-all">
                      <Settings size={16} className="text-slate-500" />
                      Cài đặt hệ thống
                    </button>
                  </Link> */}
                  <div className="h-px bg-white/[0.06] my-1 mx-2" />
                  <form action={logout}>
                    <button 
                      type="submit"
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium
                                 text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-all"
                    >
                      <LogOut size={16} />
                      Đăng xuất
                    </button>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className={`w-full flex items-center gap-2.5 p-2 rounded-2xl transition-all duration-200 border
                        ${isUserMenuOpen 
                          ? 'bg-white/[0.05] border-white/[0.08] shadow-inner' 
                          : 'bg-transparent border-transparent hover:bg-white/[0.03]'}`}
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/20
                            flex items-center justify-center shrink-0 shadow-sm relative">
              <span className="text-[12px] font-black text-emerald-400">AD</span>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#0f1419] rounded-full flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-[13px] font-bold text-slate-200 truncate">Administrator</p>
              <p className="text-[10px] text-slate-500 font-medium truncate">Quản trị viên</p>
            </div>
            <div className={`transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`}>
              <ChevronUp size={14} className="text-slate-600" />
            </div>
          </button>
        </div>
      </div>
    </aside>
  );
}

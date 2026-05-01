"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { logout } from "@/app/login/actions";
import { 
  LogOut, UserCircle2, MessageSquarePlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { FeedbackModal } from "./FeedbackModal";

export function AdminMobileTopbar() {
  const pathname = usePathname();

  const getPageName = () => {
    const segments = pathname.split("/");
    const last = segments[segments.length - 1];
    if (last === "dashboard") return "Tổng quan";
    if (last === "soldiers") return "Chiến sĩ";
    if (last === "questions") return "Câu hỏi";
    if (last === "accounts") return "Tài khoản";
    if (last === "profile") return "Hồ sơ";
    return "Hệ thống";
  };

  return (
    <div className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3
                    bg-white/95 dark:bg-[#161b22]/98 border-b border-slate-200/60 dark:border-white/8
                    backdrop-blur-xl shadow-sm">
      <div className="flex items-center gap-2.5">
        <Image src="/logo.png" alt="Logo" width={34} height={34} className="rounded-xl" />
        <div className="hidden sm:block">
          <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-0.5">
           TÂM TƯ <span className="text-emerald-600 dark:text-emerald-500"> CHIẾN SĨ</span>
          </p>
          <h2 className="font-bold text-slate-900 dark:text-white text-[15px] leading-tight">
            {getPageName()}
          </h2>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <FeedbackModal>
          <Button
            variant="ghost" size="icon"
            className="w-9 h-9 text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-xl"
          >
            <MessageSquarePlus size={18} />
          </Button>
        </FeedbackModal>
        <Link href="/admin/profile">
          <Button
            variant="ghost" size="icon"
            className={`w-9 h-9 rounded-xl ${pathname === '/admin/profile' ? 'text-emerald-500 bg-emerald-500/10' : 'text-slate-400'}`}
          >
            <UserCircle2 size={18} />
          </Button>
        </Link>
        <ThemeToggle />
        <form action={logout}>
          <Button
            type="submit" variant="ghost" size="icon"
            className="w-9 h-9 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl"
          >
            <LogOut size={17} />
          </Button>
        </form>
      </div>
    </div>
  );
}

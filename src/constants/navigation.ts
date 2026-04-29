"use client";

import {
  LayoutDashboard, UsersRound, HelpCircle, UserCog
} from "lucide-react";

export const navItems = [
  {
    name: "Tổng quan",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    color: "emerald",
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

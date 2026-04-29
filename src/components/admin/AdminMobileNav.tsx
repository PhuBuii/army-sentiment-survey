"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/constants/navigation";

export function AdminMobileNav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname.includes(href.split("/").pop()!);

  return (
    <nav
      className="md:hidden fixed bottom-4 inset-x-4 z-40 bg-white/80 dark:bg-[#161b22]/90 backdrop-blur-xl border border-slate-200/50 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] rounded-2xl overflow-hidden"
      style={{ marginBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="grid grid-cols-4 h-16">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center select-none active:scale-90 transition-transform duration-200"
            >
              <div className={`
                flex flex-col items-center justify-center w-full h-full transition-all duration-300
                ${active ? `${item.activeText}` : "text-slate-400 dark:text-slate-500"}
              `}>
                <div className={`
                  p-2 rounded-xl transition-all duration-300
                  ${active ? `${item.activeBg}` : "bg-transparent"}
                `}>
                  <item.icon
                    size={20}
                    strokeWidth={active ? 2.5 : 2}
                  />
                </div>
                <span className={`text-[9px] font-bold tracking-tight mt-1 transition-all ${active ? "opacity-100 transform translate-y-0" : "opacity-70"}`}>
                  {item.name}
                </span>
              </div>
              {/* Active indicator bar */}
              {active && (
                <span className={`absolute bottom-0 w-8 h-1 rounded-t-full ${item.activeBar}`} />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

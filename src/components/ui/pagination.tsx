"use client";

import React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "./button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  totalPages: number;
}

export function Pagination({ totalPages }: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  if (totalPages < 1) return null;

  const handleNavigate = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const renderPageButtons = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={currentPage === i ? "default" : "outline"}
          size="sm"
          className={cn(
            "h-8 w-8 text-xs font-semibold rounded-lg transition-all",
            currentPage === i 
              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/50"
              : "dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5"
          )}
          onClick={() => handleNavigate(i)}
        >
          {i}
        </Button>
      );
    }
    return pages;
  };

  return (
    <div className="flex flex-wrap items-center justify-center sm:justify-end gap-1.5 mt-4 py-3 px-2">
      <div className="flex items-center gap-1.5 mr-auto sm:mr-4 mb-2 sm:mb-0">
        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">
          Hiển thị trang
        </span>
        <span className="text-sm font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded">
          {currentPage} <span className="text-slate-400 mx-1">/</span> {totalPages}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 dark:border-white/10 dark:text-slate-400 hover:text-blue-500 dark:hover:bg-white/5"
          onClick={() => handleNavigate(1)}
          disabled={currentPage <= 1}
          title="Trang đầu"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 dark:border-white/10 dark:text-slate-400 hover:text-blue-500 dark:hover:bg-white/5"
          onClick={() => handleNavigate(currentPage - 1)}
          disabled={currentPage <= 1}
          title="Trước"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-1 hidden sm:flex">
          {renderPageButtons()}
        </div>

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 dark:border-white/10 dark:text-slate-400 hover:text-blue-500 dark:hover:bg-white/5"
          onClick={() => handleNavigate(currentPage + 1)}
          disabled={currentPage >= totalPages}
          title="Tiếp"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 dark:border-white/10 dark:text-slate-400 hover:text-blue-500 dark:hover:bg-white/5"
          onClick={() => handleNavigate(totalPages)}
          disabled={currentPage >= totalPages}
          title="Trang cuối"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, AlertCircle, Trash2, Info } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText = "Xác nhận",
  cancelText = "Huỷ",
  variant = "danger",
  isLoading = false,
}: ConfirmDialogProps) {
  
  const getIcon = () => {
    switch (variant) {
      case "danger":
        return <Trash2 className="w-6 h-6 text-red-500" />;
      case "warning":
        return <AlertTriangle className="w-6 h-6 text-amber-500" />;
      case "info":
        return <Info className="w-6 h-6 text-blue-500" />;
      default:
        return <AlertCircle className="w-6 h-6 text-slate-500" />;
    }
  };

  const getConfirmButtonStyles = () => {
    switch (variant) {
      case "danger":
        return "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20";
      case "warning":
        return "bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20";
      case "info":
        return "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20";
      default:
        return "";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] border-none shadow-2xl overflow-hidden p-0 rounded-2xl dark:bg-[#0a0f08]">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-2xl shrink-0 ${
              variant === "danger" ? "bg-red-50 dark:bg-red-500/10" : 
              variant === "warning" ? "bg-amber-50 dark:bg-amber-500/10" : 
              "bg-blue-50 dark:bg-blue-500/10"
            }`}>
              {getIcon()}
            </div>
            <div className="space-y-2">
              <DialogHeader className="p-0 text-left">
                <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                  {title}
                </DialogTitle>
                <DialogDescription className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {description}
                </DialogDescription>
              </DialogHeader>
            </div>
          </div>
        </div>

        <DialogFooter className="bg-slate-50/50 dark:bg-white/5 p-4 sm:p-6 flex flex-row gap-3 items-center justify-end">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="flex-1 sm:flex-none font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl h-11 transition-all"
          >
            {cancelText}
          </Button>
          <Button
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isLoading}
            className={`flex-1 sm:flex-none font-bold rounded-xl h-11 px-6 transition-all active:scale-[0.98] ${getConfirmButtonStyles()}`}
          >
            {isLoading ? (
               <div className="flex items-center gap-2">
                 <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                 <span>Đang xử lý...</span>
               </div>
            ) : (
                confirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageSquarePlus, Send, ShieldCheck } from "lucide-react";
import { toast } from "react-toastify";

export function FeedbackModal({ children }: { children: React.ReactElement }) {
  const [feedback, setFeedback] = useState("");
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) {
      toast.error("Vui lòng nhập nội dung góp ý");
      return;
    }

    setSending(true);
    // Simulate sending
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSending(false);
    setOpen(false);
    setFeedback("");
    toast.success("Góp ý của đồng chí đã được ghi nhận. Cảm ơn đồng chí!");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={children} nativeButton={true} />
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none shadow-2xl bg-white dark:bg-[#161b22] rounded-[1.5rem]">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-600 via-emerald-500 to-blue-500" />
        
        <DialogHeader className="px-8 pt-8 pb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <MessageSquarePlus size={20} />
            </div>
            <div>
              <DialogTitle className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Góp ý phát triển
              </DialogTitle>
              <DialogDescription className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
                Cùng xây dựng hệ thống vững mạnh
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-5">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Đồng chí có ý tưởng gì để cải thiện hệ thống không? (Giao diện, tính năng AI, báo cáo...)"
              className="relative w-full min-h-[160px] p-5 rounded-2xl bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-white/5 
                         text-slate-800 dark:text-slate-200 placeholder:text-slate-400 text-sm font-medium
                         focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-end">
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setOpen(false)}
                className="h-11 px-6 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5"
              >
                Hủy
              </Button>
              <Button 
                type="submit" 
                disabled={sending}
                className="h-11 px-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest gap-2 shadow-lg shadow-emerald-600/20"
              >
                {sending ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send size={14} />
                    Gửi góp ý
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

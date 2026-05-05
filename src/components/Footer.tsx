"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MessageSquare, Send, ShieldCheck, Globe, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";

export function Footer() {
  const [feedback, setFeedback] = useState("");
  const [sending, setSending] = useState(false);

  const handleSendFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) {
      toast.error("Vui lòng nhập nội dung góp ý");
      return;
    }
    
    setSending(true);
    // Simulate sending
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSending(false);
    setFeedback("");
    toast.success("Cảm ơn đồng chí đã gửi góp ý cải thiện hệ thống!");
  };

  return (
    <footer className="relative bg-white dark:bg-[#0d1117] pt-20 pb-10 border-t border-slate-100 dark:border-white/5 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 mb-20">
          
          {/* LEFT SECTION: Logo & Description */}
          <div className="flex flex-col items-start space-y-8">
            <div className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-xl blur-lg group-hover:blur-xl transition-all" />
                <Image 
                  src="/logo.png" 
                  alt="Army AI Logo" 
                  width={48} 
                  height={48} 
                  className="rounded-xl relative z-10 border border-white/20 shadow-lg"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">
                  Tâm tư<span className="text-emerald-600 dark:text-emerald-500"> Chiến sĩ</span>
                </span>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] leading-none mt-0.5">
                 Hệ thống phân tích tư tưởng
                </span>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
                Nền tảng phân tích <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
                  & quản lý tư tưởng thông minh
                </span>
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md leading-relaxed font-medium">
                Chúng tôi cung cấp giải pháp ứng dụng Trí tuệ nhân tạo để nắm bắt tâm tư, nguyện vọng của chiến sĩ một cách khách quan, kịp thời. Hệ thống đảm bảo tính bảo mật tuyệt đối và hỗ trợ chỉ huy ra quyết định chính xác trong công tác quản lý con người.
              </p>
            </div>

            <div className="flex items-center gap-6 pt-4">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-1">Bảo mật hệ thống</span>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">Military Standard</span>
                </div>
              </div>
              <div className="w-px h-10 bg-slate-100 dark:bg-white/5" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-1">Trạng thái</span>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400">Hoạt động tốt</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SECTION: Feedback Box (Card Style) */}
          <div className="relative group/card">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 rounded-[2.5rem] blur-2xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-700" />
            <div className="relative bg-slate-50 dark:bg-[#161b22] border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 sm:p-10 shadow-xl shadow-slate-900/5">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 flex items-center justify-center text-emerald-600 shadow-sm">
                  <MessageSquare size={24} />
                </div>
                <div>
                  <h4 className="text-xl font-black text-slate-900 dark:text-white leading-tight">Hỗ trợ & Góp ý</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Chúng tôi luôn lắng nghe ý kiến của đồng chí</p>
                </div>
              </div>

              <form onSubmit={handleSendFeedback} className="space-y-6">
                <div className="relative">
                  <textarea 
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Nhập nội dung góp ý tại đây..."
                    className="w-full min-h-[140px] p-5 rounded-2xl bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none text-sm font-medium resize-none shadow-inner"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  disabled={sending}
                  className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm uppercase tracking-widest gap-3 shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition-all"
                >
                  {sending ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send size={18} />
                      Gửi góp ý ngay
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">Email:</span>
                  <a href="mailto:levanhien18022606@gmail.com" className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 hover:underline tracking-tighter uppercase">
                    levanhien18022606@gmail.com
                  </a>
                </div>
              </form>
            </div>
          </div>

        </div>

        {/* BOTTOM SECTION: Copyright & Developers */}
        <div className="pt-10 border-t border-slate-100 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-wider">
              © 2026 TÂM TƯ CHIẾN SĨ.
            </p>
            <div className="flex items-center flex-wrap justify-center md:justify-start gap-x-4 gap-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                <div className="w-1 h-1 rounded-full bg-red-500" />
                TRUNG ÚY LÊ VĂN HIỀN
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                <div className="w-1 h-1 rounded-full bg-red-500" />
                ĐẠI ÚY NGUYỄN VĂN SĨ
              </div>
              <span className="text-[10px] text-slate-300 dark:text-slate-700 font-medium">|</span>
              <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 uppercase">
                LỮ ĐOÀN 77
              </div>
            </div>
          </div>

           <div className="flex items-center gap-4">
            {[
              { icon: MessageCircle, label: "Facebook", link: "https://www.facebook.com/DoanPKMiendong" },
              { icon: Globe, label: "Website", link: "#" }
            ].map((social, idx) => (
              <Link
                key={idx}
                href={social.link}
                className="w-12 h-12 rounded-[1.25rem] flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-400 hover:bg-green-600 hover:text-white transition-all duration-500 shadow-sm hover:shadow-lg hover:shadow-green-600/20 hover:-translate-y-1"
                aria-label={social.label}
              >
                <social.icon className="w-5.5 h-5.5" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { 
  ArrowLeft, ScanFace, ShieldCheck, 
  Activity, Lock, Eye, EyeOff, ArrowRight,
  Terminal, Shield, Zap
} from "lucide-react";
import { login } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>;
}) {
  const [message, setMessage] = React.useState<string | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);

  React.useEffect(() => {
    searchParams.then(params => {
      if (params?.message) setMessage(params.message);
    });
  }, [searchParams]);

  return (
    <div className="h-screen bg-white dark:bg-[#0d1117] text-slate-900 dark:text-slate-100 flex flex-col font-sans overflow-hidden selection:bg-emerald-500/30">
      
      {/* ── Background Effects (Consistent with Landing Page) ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" 
             style={{ backgroundImage: `radial-gradient(#10b981 0.5px, transparent 0.5px)`, backgroundSize: '24px 24px' }} />
      </div>

      {/* ══ NAVBAR ═══════════════════════════════════════════════════════════ */}
      <header className="relative z-50 flex items-center justify-between px-6 md:px-12 h-20">
        <Link href="/" className="group flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-emerald-600 transition-all border border-slate-200 dark:border-white/10 group-hover:border-emerald-500/30">
            <ArrowLeft size={18} />
          </div>
          <span className="text-sm font-bold text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors uppercase tracking-widest">
            Quay lại trang chủ
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div className="h-6 w-px bg-slate-100 dark:bg-white/10" />
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="Logo" width={28} height={28} className="rounded-lg border border-white/20" />
            <span className="text-xs font-black tracking-tighter text-slate-900 dark:text-white uppercase">
              Tâm tư<span className="text-emerald-600 dark:text-emerald-500"> Chiến sĩ</span>
            </span>
          </div>
        </div>
      </header>

      {/* ══ MAIN CONTENT ══════════════════════════════════════════════════════ */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-4 overflow-y-auto lg:overflow-visible">
        <div className="w-full max-w-[1000px] grid lg:grid-cols-2 gap-8 xl:gap-12 items-center">
          
          {/* Left: Branding & Info */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="hidden lg:flex flex-col space-y-6"
          >
            <div className="space-y-3">
              <h2 className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-[0.5em]">Hệ thống bảo mật cao</h2>
              <h1 className="text-4xl xl:text-5xl font-black tracking-tight leading-[0.95] text-slate-900 dark:text-white">
                Tâm Tư <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300">
                  Chiến Sĩ
                </span>
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed font-medium">
                Vui lòng đăng nhập để truy cập vào trung tâm điều hành và phân tích tư tưởng quân nhân.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {[
                { icon: ShieldCheck, title: "Xác thực đa tầng", desc: "Bảo vệ dữ liệu tuyệt mật", color: "emerald" },
                { icon: Activity, title: "Giám sát thời gian thực", desc: "Phản hồi AI tức thì", color: "blue" },
                { icon: Zap, title: "Tốc độ tối ưu", desc: "Xử lý hàng triệu bản ghi", color: "amber" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-white/50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 backdrop-blur-sm hover:border-emerald-500/20 transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                    <item.icon size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: Login Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative group">
              {/* Card Glow Effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-100 transition duration-1000" />
              
              <div className="relative bg-white/80 dark:bg-[#0d1117]/80 backdrop-blur-2xl border border-slate-200 dark:border-white/[0.08] rounded-[2rem] shadow-2xl overflow-hidden p-6 sm:p-8">
                
                {/* Card Header */}
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 mb-4 relative">
                    <ScanFace size={28} strokeWidth={1.5} />
                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-4 border-white dark:border-[#0d1117]" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Xác thực danh tính</h3>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Intelligence Division Access</p>
                </div>

                {/* Form */}
                <form action={login} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">
                      Tài khoản Email
                    </Label>
                    <div className="relative group/input">
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="admin@army.local"
                        required
                        className="h-12 bg-slate-50 dark:bg-white/[0.03] border-slate-200 dark:border-white/10 rounded-2xl px-5 text-sm font-medium transition-all focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500"
                      />
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within/input:text-emerald-500 transition-colors">
                        <Lock size={16} strokeWidth={1.5} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between ml-1">
                      <Label htmlFor="password" className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                        Mật khẩu truy cập
                      </Label>
                      <Link 
                        href="/forgot-password" 
                        className="text-[9px] font-bold text-emerald-600 dark:text-emerald-500 hover:underline uppercase tracking-widest"
                      >
                        Quên mật khẩu?
                      </Link>
                    </div>
                    <div className="relative group/input">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••••••"
                        required
                        className="h-12 bg-slate-50 dark:bg-white/[0.03] border-slate-200 dark:border-white/10 rounded-2xl px-5 text-sm font-medium transition-all focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 hover:text-emerald-500 transition-colors cursor-pointer"
                      >
                        {showPassword ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
                      </button>
                    </div>
                  </div>

                  {message && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 flex items-center gap-3"
                    >
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-tight">{message}</p>
                    </motion.div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full h-14 bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] border-none gap-3 mt-2"
                  >
                    Đăng nhập <ArrowRight size={18} />
                  </Button>
                </form>

               

              </div>
            </div>
          </motion.div>

        </div>
      </main>

      {/* Footer Branding */}
      <footer className="relative z-10 py-8 px-6 text-center">
        <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.4em]">
          © 2026 TÂM TƯ CHIẾN SĨ 
        </p>
      </footer>
    </div>
  );
}

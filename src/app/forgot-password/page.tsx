"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, ShieldAlert, Loader2, 
  MailCheck, KeyRound, CheckCircle2,
  Shield, Zap, Terminal, ArrowRight,
  Eye, EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import { createClient } from "@/utils/supabase/client";
import { checkEmailExists } from "./actions";

export default function ForgotPassword() {
  const router = useRouter();
  const supabase = createClient();
  
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Step 1: Request Password Reset
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    
    // 1. Check if email exists
    const check = await checkEmailExists(email);
    if (!check.exists) {
      setErrorMsg(check.error || "Email không tồn tại.");
      setLoading(false);
      return;
    }

    // 2. Request reset OTP
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    
    setLoading(false);
    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg(`Mã OTP đã được gửi đến ${email}.`);
      setTimeout(() => {
        setStep(2);
        setSuccessMsg("");
      }, 1000);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;
    setLoading(true);
    setErrorMsg("");
    
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "recovery",
    });
    
    setLoading(false);
    if (error) {
      setErrorMsg("Mã OTP không hợp lệ hoặc đã hết hạn.");
    } else {
      setSuccessMsg("Xác thực thành công!");
      setTimeout(() => {
        setStep(3);
        setSuccessMsg("");
      }, 1500);
    }
  };

  // Step 3: Set New Password
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setErrorMsg("Mật khẩu phải từ 6 ký tự trở lên.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("Mật khẩu xác nhận không khớp.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    
    setLoading(false);
    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg("Cập nhật mật khẩu thành công!");
      setTimeout(() => {
        router.push("/login?message=Mật khẩu đã được thay đổi thành công.");
      }, 2000);
    }
  };

  return (
    <div className="h-screen bg-white dark:bg-[#0d1117] text-slate-900 dark:text-slate-100 flex flex-col font-sans overflow-hidden selection:bg-emerald-500/30">
      
      {/* ── Background Effects ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" 
             style={{ backgroundImage: `radial-gradient(#10b981 0.5px, transparent 0.5px)`, backgroundSize: '24px 24px' }} />
      </div>

      {/* ══ NAVBAR ═══════════════════════════════════════════════════════════ */}
      <header className="relative z-50 flex items-center justify-between px-6 md:px-12 h-20">
        <Link href="/login" className="group flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-emerald-600 transition-all border border-slate-200 dark:border-white/10 group-hover:border-emerald-500/30">
            <ArrowLeft size={18} />
          </div>
          <span className="text-sm font-bold text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors uppercase tracking-widest">
            Quay lại đăng nhập
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
              <h2 className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-[0.5em]">Kênh bảo mật dự phòng</h2>
              <h1 className="text-4xl xl:text-5xl font-black tracking-tight leading-[0.95] text-slate-900 dark:text-white">
                Khôi Phục<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300">
                  Truy Cập
                </span>
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed font-medium">
                Cấp lại mật khẩu thông qua mã xác thực OTP 6 số. Quá trình này được mã hóa và bảo mật tuyệt đối.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {[
                { icon: MailCheck, title: "Xác thực OTP", desc: "Mã bảo mật 6 số gửi qua Email", color: "emerald" },
                { icon: Shield, title: "Bảo mật SHA-256", desc: "Mã hóa mật khẩu đầu cuối", color: "blue" },
                { icon: Terminal, title: "Nhật ký hệ thống", desc: "Ghi lại mọi yêu cầu khôi phục", color: "amber" }
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

          {/* Right: Forgot Password Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-100 transition duration-1000" />
              
              <div className="relative bg-white/80 dark:bg-[#0d1117]/80 backdrop-blur-2xl border border-slate-200 dark:border-white/[0.08] rounded-[2rem] shadow-2xl overflow-hidden p-6 sm:p-8">
                
                {/* Card Header */}
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 mb-4 relative">
                    {step === 1 && <MailCheck size={28} strokeWidth={1.5} />}
                    {step === 2 && <KeyRound size={28} strokeWidth={1.5} />}
                    {step === 3 && <CheckCircle2 size={28} strokeWidth={1.5} />}
                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-4 border-white dark:border-[#0d1117]" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    {step === 1 && "Khôi phục mật khẩu"}
                    {step === 2 && "Xác thực OTP"}
                    {step === 3 && "Mật khẩu mới"}
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
                    {step === 1 && "Nhập email để nhận mã OTP"}
                    {step === 2 && "Kiểm tra mã OTP trong email"}
                    {step === 3 && "Thiết lập mật khẩu an toàn"}
                  </p>
                </div>

                {/* Form Logic */}
                <div className="space-y-4">
                  <AnimatePresence mode="wait">
                    {step === 1 && (
                      <motion.form
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        onSubmit={handleRequestReset}
                        className="space-y-4"
                      >
                        <div className="space-y-1.5">
                          <Label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Email quân đội</Label>
                          <Input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="h-12 bg-slate-50 dark:bg-white/[0.03] border-slate-200 dark:border-white/10 rounded-2xl px-5 text-sm font-medium transition-all focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500"
                            placeholder="admin@army.local"
                          />
                        </div>
                        <Button type="submit" disabled={loading} className="w-full h-14 bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] border-none gap-3">
                          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <MailCheck size={18} />}
                          {loading ? "Đang xử lý..." : "Gửi mã OTP"}
                        </Button>
                      </motion.form>
                    )}

                    {step === 2 && (
                      <motion.form
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        onSubmit={handleVerifyOtp}
                        className="space-y-4"
                      >
                        <div className="space-y-1.5">
                          <Label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Mã xác nhận (6 số)</Label>
                          <Input
                            type="text"
                            required
                            maxLength={8}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="h-12 bg-slate-50 dark:bg-white/[0.03] border-slate-200 dark:border-white/10 rounded-2xl px-5 text-lg tracking-[0.5em] text-center font-bold transition-all focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500"
                            placeholder="000000"
                          />
                        </div>
                        <Button type="submit" disabled={loading} className="w-full h-14 bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] border-none gap-3">
                          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <KeyRound size={18} />}
                          {loading ? "Đang xác thực..." : "Xác thực OTP"}
                        </Button>
                        <button type="button" onClick={() => setStep(1)} className="w-full text-center text-[10px] font-bold text-slate-400 hover:text-emerald-500 uppercase tracking-widest transition-colors">
                          Gửi lại mã hoặc đổi email
                        </button>
                      </motion.form>
                    )}

                    {step === 3 && (
                      <motion.form
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        onSubmit={handleUpdatePassword}
                        className="space-y-4"
                      >
                        <div className="space-y-1.5">
                          <Label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Mật khẩu mới</Label>
                          <div className="relative group/input">
                            <Input
                              type={showPassword ? "text" : "password"}
                              required
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="h-12 bg-slate-50 dark:bg-white/[0.03] border-slate-200 dark:border-white/10 rounded-2xl px-5 text-sm font-medium transition-all focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500"
                              placeholder="••••••••"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 hover:text-emerald-500 transition-colors"
                            >
                              {showPassword ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
                            </button>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Xác nhận mật khẩu</Label>
                          <Input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="h-12 bg-slate-50 dark:bg-white/[0.03] border-slate-200 dark:border-white/10 rounded-2xl px-5 text-sm font-medium transition-all focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500"
                            placeholder="••••••••"
                          />
                        </div>
                        <Button type="submit" disabled={loading} className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] border-none gap-3">
                          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 size={18} />}
                          {loading ? "Đang lưu..." : "Lưu mật khẩu mới"}
                        </Button>
                      </motion.form>
                    )}
                  </AnimatePresence>

                  {(errorMsg || successMsg) && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-xl border flex items-center gap-3 ${
                        errorMsg 
                          ? "bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20" 
                          : "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20"
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full animate-pulse ${errorMsg ? "bg-red-500" : "bg-emerald-500"}`} />
                      <p className={`text-xs font-bold uppercase tracking-tight ${errorMsg ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                        {errorMsg || successMsg}
                      </p>
                    </motion.div>
                  )}
                </div>

                {/* Footer Notice */}
                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/5 flex flex-col items-center gap-3">
                  <p className="text-[9px] text-slate-400 dark:text-slate-600 text-center leading-relaxed font-medium">
                    Hành động này sẽ được ghi lại trong nhật ký an toàn của hệ thống.
                  </p>
                </div>

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

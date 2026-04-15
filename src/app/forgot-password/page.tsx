"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldAlert, ArrowLeft, Loader2, MailCheck, KeyRound, CheckCircle2 } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { createClient } from "@/utils/supabase/client";

export default function ForgotPassword() {
  const router = useRouter();
  const supabase = createClient();
  
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Step 1: Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    
    setLoading(false);
    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg(`Mã OTP đã được gửi đến ${email}. Vui lòng kiểm tra hộp thư!`);
      setTimeout(() => {
        setStep(2);
        setSuccessMsg("");
      }, 2000);
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
      setSuccessMsg("Xác thực thành công! Vui lòng tạo mật khẩu mới.");
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
      setErrorMsg("Mật khẩu phải lớn hơn 6 ký tự.");
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
        router.push("/login?message=Mật khẩu đã được thay đổi. Hãy đăng nhập lại.");
      }, 2000);
    }
  };

  return (
    <div className="flex w-full min-h-screen bg-slate-50 dark:bg-[#0c1109] transition-colors duration-300 relative overflow-hidden">
      
      {/* LEFT PANEL */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center relative z-10 px-6 sm:px-12 py-8 bg-white/60 dark:bg-[#0a0f08]/60 backdrop-blur-2xl">
        
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
           <Link href="/login">
             <Button variant="ghost" size="icon" className="rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-all">
                <ArrowLeft className="w-5 h-5" />
             </Button>
           </Link>
           <ThemeToggle />
        </div>

        <div className="w-full max-w-md flex flex-col gap-8 animate-fade-in-up transition-all duration-700 ease-out">
          
          <div className="flex flex-col items-start gap-3 mb-2">
             <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 dark:from-amber-400 dark:to-orange-600 text-white dark:text-[#0c1109] rounded-2xl flex items-center justify-center mb-2 shadow-lg shadow-amber-500/30 transform hover:scale-105 transition-transform duration-300">
               <ShieldAlert className="w-8 h-8" strokeWidth={2.5} />
             </div>
             <div>
               <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">
                 Khôi phục mật khẩu
               </h1>
               <p className="text-base text-slate-600 dark:text-slate-400 font-medium">
                 {step === 1 && "Nhập email đã đăng ký để nhận mã khôi phục."}
                 {step === 2 && "Nhập mã gồm 6 số vừa được gửi đến hộp thư của bạn."}
                 {step === 3 && "Tạo mật khẩu mới cho tài khoản của bạn."}
               </p>
             </div>
          </div>

          <div className="flex-1 w-full z-10">
            {/* ALERT BOXES */}
            {errorMsg && (
              <div className="mb-6 p-4 bg-red-50/80 dark:bg-red-950/40 backdrop-blur-sm border border-red-200 dark:border-red-900/50 rounded-xl flex items-center justify-center animate-pulse">
                <p className="text-red-600 dark:text-red-400 text-center text-sm font-semibold">{errorMsg}</p>
              </div>
            )}
            {successMsg && (
              <div className="mb-6 p-4 bg-emerald-50/80 dark:bg-emerald-950/40 backdrop-blur-sm border border-emerald-200 dark:border-emerald-900/50 rounded-xl flex items-center justify-center">
                <p className="text-emerald-700 dark:text-emerald-400 text-center text-sm font-semibold">{successMsg}</p>
              </div>
            )}

            {/* STEP 1: Request OTP */}
            {step === 1 && (
              <form onSubmit={handleRequestOtp} className="space-y-5">
                <div className="flex flex-col gap-2 group">
                  <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Email tài khoản</Label>
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl text-base px-4 focus-visible:ring-amber-500/50 group-hover:border-amber-300 dark:group-hover:border-amber-500/50"
                    placeholder="nguyenvana@army.local"
                  />
                </div>
                <Button type="submit" disabled={loading} className="h-12 w-full mt-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:to-orange-600 text-white font-bold text-lg rounded-xl shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <MailCheck className="w-5 h-5 mr-2" />}
                  {loading ? "Đang gửi..." : "Gửi mã KHÔI PHỤC (OTP)"}
                </Button>
              </form>
            )}

            {/* STEP 2: Verify OTP */}
            {step === 2 && (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div className="flex flex-col gap-2 group">
                  <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Mã xác nhận (OTP)</Label>
                  <Input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="h-12 bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl text-lg tracking-widest text-center font-bold px-4 focus-visible:ring-amber-500/50 group-hover:border-amber-300 dark:group-hover:border-amber-500/50"
                    placeholder="••••••"
                  />
                </div>
                <Button type="submit" disabled={loading} className="h-12 w-full mt-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:to-orange-600 text-white font-bold text-lg rounded-xl shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <KeyRound className="w-5 h-5 mr-2" />}
                  {loading ? "Đang xác thực..." : "Xác thực mã OTP"}
                </Button>
                <div className="text-center mt-4">
                  <button type="button" onClick={() => setStep(1)} className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white text-sm font-medium underline-offset-4 hover:underline">
                    Gửi lại mã OTP
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: Update Password */}
            {step === 3 && (
              <form onSubmit={handleUpdatePassword} className="space-y-5">
                <div className="flex flex-col gap-2 group">
                  <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Mật khẩu mới</Label>
                  <Input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="h-12 bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl text-base px-4 focus-visible:ring-emerald-500/50 group-hover:border-emerald-300 dark:group-hover:border-emerald-500/50"
                    placeholder="••••••••"
                  />
                </div>
                <div className="flex flex-col gap-2 group">
                  <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Xác nhận mật khẩu</Label>
                  <Input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-12 bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl text-base px-4 focus-visible:ring-emerald-500/50 group-hover:border-emerald-300 dark:group-hover:border-emerald-500/50"
                    placeholder="••••••••"
                  />
                </div>
                <Button type="submit" disabled={loading} className="h-12 w-full mt-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:to-emerald-400 text-white font-bold text-lg rounded-xl shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5 mr-2" />}
                  {loading ? "Đang cập nhật..." : "Lưu mật khẩu mới"}
                </Button>
              </form>
            )}

          </div>

          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10 text-center">
             <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
               Chú ý: Tuyệt đối không chia sẻ mã khôi phục cho bất kỳ đối tượng nào.
             </p>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL : Hero Image / Graphic */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 border-l border-slate-200 dark:border-white/10 overflow-hidden items-center justify-center group">
        <Image
          src="/images/login-bg.png"
          alt="Military Technology UI"
          fill
          priority
          className="object-cover object-center opacity-70 group-hover:scale-105 transition-transform duration-[10000ms] ease-out saturate-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c1109] via-[#0c1109]/30 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-50/90 dark:from-[#0c1109]/90 via-slate-50/10 dark:via-[#0c1109]/40 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-amber-500/20 rounded-full blur-[100px] pointer-events-none z-10"></div>
        
        <div className="relative z-20 flex flex-col items-start justify-end h-full p-16 w-full max-w-2xl mx-auto pointer-events-none">
           <div className="backdrop-blur-md bg-white/10 dark:bg-black/30 border border-white/20 dark:border-white/10 p-8 rounded-2xl shadow-2xl space-y-4">
             <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-widest border border-amber-500/30 mb-2">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                Trạng thái: Báo động Đăng nhập
             </div>
             <h2 className="text-4xl font-black text-slate-900 dark:text-white leading-tight">
               Kênh Khôi Phục Bảo Mật
             </h2>
             <p className="text-slate-800 dark:text-slate-300 text-lg leading-relaxed font-medium dark:font-light">
               Cấp lại mật khẩu thông qua xác thực Email chỉ định. Quá trình cấu hình tự động tuân thủ theo tiêu chuẩn mã hoá SHA-256.
             </p>
           </div>
        </div>
      </div>
      
    </div>
  );
}

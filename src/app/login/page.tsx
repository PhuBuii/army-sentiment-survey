import Link from "next/link";
import { login } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldAlert, ArrowLeft, ScanFace } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import Image from "next/image";

export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const message = resolvedSearchParams?.message;

  return (
    <div className="flex w-full min-h-screen bg-white dark:bg-[#0c1109] transition-colors duration-300 relative overflow-hidden">
      
      {/* LEFT PANEL : Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center relative z-10 px-6 sm:px-12 py-8 bg-slate-50/40 dark:bg-[#0a0f08]/60 backdrop-blur-2xl">
        
        {/* Top bar controls */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
           <Link href="/">
             <Button variant="ghost" size="icon" className="rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-all shadow-sm">
                <ArrowLeft className="w-5 h-5" />
             </Button>
           </Link>
           <ThemeToggle />
        </div>

        {/* Login Container */}
        <div className="w-full max-w-md flex flex-col gap-8 transition-all duration-700 ease-out">
          
          {/* Header/Logo section */}
          <div className="flex flex-col items-start gap-3 mb-2">
             <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 dark:from-[#a3e635] dark:to-emerald-700 text-white dark:text-[#0c1109] rounded-2xl flex items-center justify-center mb-2 shadow-lg shadow-emerald-500/30 transform hover:scale-105 transition-transform duration-300">
               <ShieldAlert className="w-8 h-8" strokeWidth={2.5} />
             </div>
             <div>
               <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">
                 Đăng nhập
               </h1>
               <p className="text-base text-slate-700 dark:text-slate-400 font-semibold">
                 Hệ thống phân tích tư tưởng quân nhân bằng AI
               </p>
             </div>
          </div>

          <form className="flex-1 flex flex-col w-full gap-5 z-10" action={login}>
            <div className="flex flex-col gap-2 relative group">
              <Label className="text-sm font-bold text-slate-800 dark:text-slate-300 ml-1" htmlFor="email">
                Tài khoản (Email)
              </Label>
              <Input
                className="h-12 bg-white dark:bg-white/5 border-slate-300 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus-visible:ring-2 focus-visible:ring-emerald-500/50 dark:focus-visible:ring-[#a3e635]/50 focus-visible:border-emerald-500 dark:focus-visible:border-[#a3e635] placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-all text-base px-4 shadow-sm group-hover:border-emerald-400 dark:group-hover:border-[#a3e635]/50 font-medium"
                name="email"
                placeholder="admin@army.local"
                required
              />
            </div>
            
            <div className="flex flex-col gap-2 relative group">
              <div className="flex items-center justify-between ml-1">
                <Label className="text-sm font-bold text-slate-800 dark:text-slate-300" htmlFor="password">
                  Mật khẩu
                </Label>
                <Link href="/forgot-password" university-id="forgot-password" className="text-xs font-bold text-emerald-600 dark:text-[#a3e635] hover:underline underline-offset-4">
                  Quên mật khẩu?
                </Link>
              </div>
              <Input
                className="h-12 bg-white dark:bg-white/5 border-slate-300 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus-visible:ring-2 focus-visible:ring-emerald-500/50 dark:focus-visible:ring-[#a3e635]/50 focus-visible:border-emerald-500 dark:focus-visible:border-[#a3e635] placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-all text-base px-4 shadow-sm group-hover:border-emerald-400 dark:group-hover:border-[#a3e635]/50 font-medium"
                type="password"
                name="password"
                placeholder="••••••••"
                required
              />
            </div>

            <Button type="submit" className="h-12 w-full mt-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 dark:from-[#a3e635] dark:to-emerald-500 dark:text-[#0c1109] dark:hover:from-[#84cc16] dark:hover:to-emerald-600 text-white font-black text-lg rounded-xl shadow-lg shadow-emerald-500/25 dark:shadow-[#a3e635]/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex border-0 items-center justify-center gap-2">
              <ScanFace className="w-5 h-5" />
              Đăng nhập hệ thống
            </Button>

            {message && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl flex items-center justify-center shadow-inner">
                <p className="text-red-700 dark:text-red-400 text-center text-sm font-bold">
                  {message}
                </p>
              </div>
            )}
          </form>

          {/* Footer of form */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10 text-center">
             <p className="text-xs text-slate-600 dark:text-slate-400 font-bold">
               Bảo mật quân sự cấp độ 3. Truy cập trái phép sẽ bị xử lý theo quy định do Bộ Chỉ Huy ban hành.
             </p>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL : Hero Image / Graphic */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden items-center justify-center group">
        <Image
          src="/images/login-bg.png"
          alt="Military Technology UI"
          fill
          priority
          className="object-cover object-center opacity-80 dark:opacity-70 group-hover:scale-105 transition-transform duration-[10000ms] ease-out"
        />
        
        {/* Gradients Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent dark:from-[#0c1109] dark:via-[#0c1109]/30 dark:to-transparent z-10 pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/5 to-transparent dark:from-[#0c1109]/90 dark:via-[#0c1109]/40 dark:to-transparent z-10 pointer-events-none transition-colors duration-300"></div>
        
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500/30 dark:bg-emerald-500/20 rounded-full blur-[100px] pointer-events-none z-10"></div>
        
        {/* Overlay Content */}
        <div className="relative z-20 flex flex-col items-start justify-end h-full p-16 w-full max-w-2xl mx-auto pointer-events-none">
           <div className="backdrop-blur-xl bg-white/80 dark:bg-black/40 border border-slate-200 dark:border-white/10 p-8 rounded-3xl shadow-2xl space-y-4 transform transition-all duration-500 hover:scale-[1.02]">
             <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-black uppercase tracking-widest border border-emerald-200 dark:border-emerald-500/30 mb-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                Trạng thái: Máy chủ trực tuyến
             </div>
             <h2 className="text-4xl font-black text-slate-900 dark:text-white leading-tight">
               Phân Tích Cảm Xúc & Tư Tưởng
             </h2>
             <p className="text-slate-800 dark:text-slate-300 text-lg leading-relaxed font-bold dark:font-light">
               Hệ thống ứng dụng trí tuệ nhân tạo thế hệ mới, hỗ trợ ban chỉ huy trong công tác quản lý, đánh giá và dự đoán chính xác tâm lý cán bộ chiến sĩ trong thời gian thực.
             </p>
           </div>
        </div>
      </div>
    </div>
  );
}

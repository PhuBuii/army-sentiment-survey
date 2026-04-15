import Link from "next/link";
import { ShieldAlert, Activity, Users, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0c1109] text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white transition-colors duration-300">
      {/* Header */}
      <header className="flex items-center justify-between px-4 md:px-12 py-4 border-b border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#0a0f08]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="bg-emerald-600 dark:bg-[#a3e635] p-2 rounded-lg text-white dark:text-[#0c1109]">
            <ShieldAlert size={20} className="md:w-6 md:h-6" />
          </div>
          <span className="text-lg md:text-xl font-bold tracking-wider text-slate-800 dark:text-white">ARMY<span className="text-emerald-600 dark:text-[#a3e635]">AI</span> SURVEY</span>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <ThemeToggle />
          <Link href="/login">
            <Button variant="ghost" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hidden sm:inline-flex">
              Dành cho Chỉ huy
            </Button>
          </Link>
          <Link href="/login">
            <Button className="bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-[#a3e635] dark:text-[#0c1109] dark:hover:bg-[#84cc16] font-semibold border-none flex items-center gap-2 text-sm md:text-base px-3 py-1.5 md:px-4 md:py-2">
              Đăng Nhập <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center px-4 md:px-12 py-12 md:py-16 gap-10 md:gap-12 relative overflow-hidden">
        
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 md:w-96 md:h-96 bg-emerald-500/20 dark:bg-[#a3e635]/10 rounded-full blur-[80px] md:blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 md:w-96 md:h-96 bg-blue-500/20 dark:bg-blue-500/10 rounded-full blur-[80px] md:blur-[120px] pointer-events-none"></div>

        <div className="flex-1 flex flex-col gap-6 md:gap-8 max-w-2xl z-10 items-center lg:items-start text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50/80 dark:bg-white/5 border border-emerald-200 dark:border-white/10 w-fit text-xs md:text-sm text-emerald-700 dark:text-[#a3e635] font-semibold backdrop-blur-sm shadow-sm md:shadow-none">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 dark:bg-[#a3e635] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 dark:bg-[#a3e635]"></span>
            </span>
            Hệ thống phân tích tư tưởng thông minh
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight text-slate-900 dark:text-white">
            Nắm Bắt Tâm Lý <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-emerald-400 dark:from-[#a3e635] dark:to-[#4ade80]">Vững Bước Quân Hành</span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl mx-auto lg:mx-0">
            Sử dụng sức mạnh của Google Gemini AI để khảo sát, tự động chấm điểm và đánh giá chính xác tâm lý của hàng ngàn chiến sĩ, giúp Ban Chỉ Huy xử lý kịp thời các tình huống dao động tư tưởng.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4 w-full sm:w-auto">
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" className="h-12 md:h-14 px-6 md:px-8 bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-[#a3e635] dark:text-[#0c1109] dark:hover:bg-[#84cc16] font-bold text-base md:text-lg w-full sm:w-auto shadow-[0_0_20px_rgba(16,185,129,0.2)] dark:shadow-[0_0_20px_rgba(163,230,53,0.3)]">
                Truy Cập Quản Trị
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature Cards Grid (Visual interest) */}
        <div className="flex-1 w-full max-w-lg grid gap-4 relative z-10 mt-8 lg:mt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-5 md:p-6 rounded-2xl backdrop-blur-md transform transition-all hover:-translate-y-1 hover:shadow-lg dark:hover:bg-white/10 flex flex-col gap-3 md:gap-4 group shadow-sm">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-emerald-100 dark:bg-[#a3e635]/20 flex items-center justify-center text-emerald-600 dark:text-[#a3e635] group-hover:scale-110 transition-transform">
                <Activity size={24} className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">AI Chấm Điểm</h3>
                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">Phân loại tương đối chuẩn xác An tâm, Dao động, Nguy cơ tức thì.</p>
              </div>
            </div>

            <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-5 md:p-6 rounded-2xl backdrop-blur-md transform transition-all hover:-translate-y-1 hover:shadow-lg dark:hover:bg-white/10 flex flex-col gap-3 md:gap-4 group shadow-sm">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                <ShieldCheck size={24} className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Bảo Mật Cao</h3>
                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">Link khảo sát dùng 1 lần bằng Token. Chống việc khai báo hộ.</p>
              </div>
            </div>
            
            <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-5 md:p-6 rounded-2xl backdrop-blur-md transform transition-all hover:-translate-y-1 hover:shadow-lg dark:hover:bg-white/10 flex flex-col gap-3 md:gap-4 group col-span-1 sm:col-span-2 shadow-sm">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-purple-100 dark:bg-emerald-500/20 flex items-center justify-center text-purple-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                <Users size={24} className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Quản Lý Toàn Quy Mô</h3>
                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">Tích hợp dữ liệu thuận tiện từ file Excel, hiển thị thống kê tổng hợp trực quan qua dashboard cho Chỉ huy.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-white/5 py-6 md:py-8 text-center text-slate-500 text-xs md:text-sm mt-auto relative z-10 bg-white dark:bg-[#0a0f08]">
        <p>© 2026 AI Survey For Army. Hệ thống Phân tích Tâm lý Quân đội.</p>
      </footer>
    </div>
  );
}

import Link from "next/link";
import Image from "next/image";
import { 
  ArrowRight, ShieldCheck, Brain, 
  BarChart3, Lock, Zap, Shield, 
  MessageSquare, Users, Eye,
  LockKeyhole, Database, Terminal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Footer } from "@/components/Footer";

const features = [
  {
    icon: Brain,
    title: "Phân Tích Thông Minh",
    desc: "Ứng dụng Trí tuệ nhân tạo thế hệ mới để tự động đánh giá và phân loại trạng thái tư tưởng dựa trên dữ liệu khảo sát thời gian thực.",
    tag: "AI ANALYSIS",
    color: "emerald"
  },
  {
    icon: LockKeyhole,
    title: "Xác Thực Độc Bản",
    desc: "Cơ chế mã hóa định danh duy nhất cho mỗi đối tượng, đảm bảo tính khách quan và ngăn chặn các hành vi can thiệp dữ liệu.",
    tag: "SECURITY",
    color: "blue"
  },
  {
    icon: BarChart3,
    title: "Báo Cáo Tự Động",
    desc: "Hệ thống tổng hợp dữ liệu thông minh, tự động xuất các báo cáo phân tích đa chiều phục vụ công tác chỉ huy và giao ban.",
    tag: "INSIGHTS",
    color: "amber"
  },
  {
    icon: Shield,
    title: "Quản Lý Phân Cấp",
    desc: "Cấu trúc quản trị đa tầng tương thích với mô hình tổ chức quân sự, tối ưu hóa quy trình luân chuyển thông tin nội bộ.",
    tag: "GOVERNANCE",
    color: "purple"
  }
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0d1117] text-slate-900 dark:text-slate-100 flex flex-col font-sans overflow-x-hidden selection:bg-emerald-500/30">
      
      {/* ── Background Effects ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" 
             style={{ backgroundImage: `radial-gradient(#10b981 0.5px, transparent 0.5px)`, backgroundSize: '24px 24px' }} />
      </div>

      {/* ══ NAVBAR ═══════════════════════════════════════════════════════════ */}
      <header className="relative z-50 flex items-center justify-between px-6 md:px-12 h-20
                          bg-white/70 dark:bg-[#0d1117]/70 backdrop-blur-xl
                          border-b border-slate-100 dark:border-white/[0.05] transition-all">
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="absolute inset-0 bg-emerald-500/20 rounded-xl blur-lg group-hover:blur-xl transition-all" />
            <Image src="/logo.png" alt="Army AI Logo" width={40} height={40} className="relative rounded-xl border border-white/20 shadow-lg" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
              Tâm tư<span className="text-emerald-600 dark:text-emerald-500"> Chiến sĩ</span>
            </span>
            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] mt-1">
              Hệ thống Phân tích Tư tưởng
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div className="h-6 w-px bg-slate-100 dark:bg-white/10 hidden sm:block" />
          <Link href="/login">
            <Button className="bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-xl px-6 h-10 text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-900/10 dark:shadow-emerald-900/20 transition-all active:scale-95 flex items-center gap-2 border-none">
              Đăng nhập <ArrowRight size={14} />
            </Button>
          </Link>
        </div>
      </header>

      {/* ══ HERO SECTION ═══════════════════════════════════════════════════════ */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 pt-24 pb-20">
        
        {/* Status Badge */}
        <div className="group relative mb-10 cursor-default">
          <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative flex items-center gap-2.5 px-5 py-2 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 shadow-sm">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </div>
            <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-[0.2em]">
              Hệ thống bảo mật quân sự &middot; Hoạt động 24/7
            </span>
          </div>
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95] max-w-5xl">
          <span className="text-slate-900 dark:text-white">Kỷ Luật Thép,</span>
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 dark:from-emerald-400 dark:via-emerald-300 dark:to-teal-300">
            Tư Tưởng Vững
          </span>
        </h1>

        <p className="mt-8 text-base md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed font-medium">
          Ứng dụng Trí tuệ nhân tạo tiên tiến trong việc đánh giá tâm lý và nắm bắt tư tưởng, đảm bảo tinh thần sẵn sàng chiến đấu cao nhất cho toàn quân.
        </p>

        {/* Action Buttons */}
        <div className="mt-12 flex flex-col sm:flex-row items-center gap-4">
          <Link href="/login">
            <Button size="lg" className="h-16 px-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-emerald-600/30 transition-all hover:scale-105 active:scale-95 border-none gap-3">
           Truy cập ngay <Terminal size={18} />
            </Button>
          </Link>
          
        </div>

        
      </section>

      {/* ══ FEATURES GRID ═══════════════════════════════════════════════════════ */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24 w-full">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-[0.5em]">Năng lực cốt lõi</h2>
          <h3 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white">Công nghệ hiện đại cho Quân đội</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <div key={idx} className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
              <div className="relative p-8 rounded-3xl bg-slate-50/50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 hover:border-emerald-500/30 transition-all h-full flex flex-col">
                <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform duration-500 border border-slate-100 dark:border-white/5">
                  <feature.icon size={28} />
                </div>
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-2">{feature.tag}</span>
                <h4 className="text-lg font-black text-slate-900 dark:text-white mb-3">{feature.title}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium flex-1">
                  {feature.desc}
                </p>
                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                    Xem chi tiết <ArrowRight size={12} />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ QUOTE/IMPACT SECTION ════════════════════════════════════════════════ */}
      <section className="relative z-10 py-24 px-6 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative">
          <MessageSquare className="absolute -top-12 -left-12 text-slate-100 dark:text-white/5 w-40 h-40 -z-10" />
          <h2 className="text-2xl md:text-4xl font-bold italic text-slate-700 dark:text-slate-300 leading-relaxed">
            "Công tác tư tưởng là mạch máu, là linh hồn của sức mạnh chiến đấu. Chúng tôi kết hợp truyền thống và trí tuệ nhân tạo để bảo vệ linh hồn đó."
          </h2>
          <div className="mt-10 flex flex-col items-center">
            <div className="w-16 h-1 bg-emerald-600 dark:bg-emerald-500 mb-4 rounded-full" />
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-600 uppercase mt-1">Ứng dụng AI nắm bắt tâm lý của chiến sĩ</span>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

import Link from "next/link";
import Image from "next/image";
import { Activity, Users, ShieldCheck, ArrowRight, Zap, BarChart3, Lock, Shield, Brain, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

const features = [
  {
    icon: Zap,
    title: "AI Phân Tích Tức Thì",
    desc: "Gemini AI chấm điểm và phân loại An tâm / Dao động / Nguy cơ ngay sau khi chiến sĩ nộp bài.",
    color: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-500/20",
    bg: "bg-emerald-50 dark:bg-emerald-500/5",
    iconBg: "bg-emerald-100 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20",
    tag: "AI CORE",
    tagColor: "text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30 bg-emerald-100 dark:bg-emerald-500/10",
    glow: "hover:shadow-emerald-100 dark:hover:shadow-emerald-500/10",
  },
  {
    icon: Lock,
    title: "Token Bảo Mật Một Chiều",
    desc: "Mỗi chiến sĩ nhận link token dùng 1 lần. Không thể khai báo hộ hay làm lại.",
    color: "text-blue-600 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-500/20",
    bg: "bg-blue-50 dark:bg-blue-500/5",
    iconBg: "bg-blue-100 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20",
    tag: "SECURITY",
    tagColor: "text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-500/30 bg-blue-100 dark:bg-blue-500/10",
    glow: "hover:shadow-blue-100 dark:hover:shadow-blue-500/10",
  },
  {
    icon: BarChart3,
    title: "Báo Cáo Giao Ban PDF",
    desc: "Tổng hợp biểu đồ phân tích, danh sách cảnh báo và xuất báo cáo chỉ với một nút bấm.",
    color: "text-amber-600 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-500/20",
    bg: "bg-amber-50 dark:bg-amber-500/5",
    iconBg: "bg-amber-100 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20",
    tag: "INTEL",
    tagColor: "text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-500/30 bg-amber-100 dark:bg-amber-500/10",
    glow: "hover:shadow-amber-100 dark:hover:shadow-amber-500/10",
  },
  {
    icon: Shield,
    title: "Phân Quyền 3 Cấp RBAC",
    desc: "Sư đoàn → Tiểu đoàn → Đại đội. Dữ liệu tự động phân luồng theo cấp bậc.",
    color: "text-purple-600 dark:text-purple-400",
    border: "border-purple-200 dark:border-purple-500/20",
    bg: "bg-purple-50 dark:bg-purple-500/5",
    iconBg: "bg-purple-100 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20",
    tag: "RBAC",
    tagColor: "text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-500/30 bg-purple-100 dark:bg-purple-500/10",
    glow: "hover:shadow-purple-100 dark:hover:shadow-purple-500/10",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0e14] text-slate-900 dark:text-slate-100 flex flex-col font-sans overflow-x-hidden transition-colors duration-300">

      {/* ── Ambient background (dark only) ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Light mode: subtle gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:hidden" />
        {/* Dark mode: glowing orbs + grid */}
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/5 dark:bg-emerald-500/5 rounded-full blur-[120px] hidden dark:block" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] hidden dark:block" />
        <div
          className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03] hidden dark:block"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* ══ HEADER ═══════════════════════════════════════════════════════════ */}
      <header className="relative z-50 flex items-center justify-between px-5 md:px-10 h-16
                          bg-white/80 dark:bg-[#0d1117]/80 backdrop-blur-xl
                          border-b border-slate-200/60 dark:border-white/[0.06]
                          shadow-sm dark:shadow-none transition-colors duration-300">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500/20 rounded-xl blur-md hidden dark:block" />
            <Image src="/logo.png" alt="Army AI Logo" width={36} height={36} className="relative rounded-xl" />
          </div>
          <div>
            <span className="text-[14px] font-black tracking-tight text-slate-900 dark:text-white">
              ARMY<span className="text-emerald-600 dark:text-emerald-400">AI</span>
            </span>
            <div className="flex items-center gap-1 -mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] text-emerald-600/70 dark:text-emerald-400/70 font-semibold uppercase tracking-widest">
                Secure System
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/login">
            <Button
              variant="ghost"
              className="hidden sm:inline-flex h-9 px-4 text-[13px] font-medium
                         text-slate-600 dark:text-slate-400
                         hover:text-slate-900 dark:hover:text-white
                         hover:bg-slate-100 dark:hover:bg-white/8
                         border border-transparent hover:border-slate-200 dark:hover:border-white/10
                         rounded-xl transition-all"
            >
              Ban Chỉ Huy
            </Button>
          </Link>
          <Link href="/login">
            <Button
              className="h-9 px-4 text-[13px] font-bold rounded-xl
                         bg-emerald-600 hover:bg-emerald-700
                         dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-[#0a0e14]
                         text-white border-none
                         shadow-md shadow-emerald-200 dark:shadow-[0_0_16px_rgba(52,211,153,0.3)]
                         dark:hover:shadow-[0_0_24px_rgba(52,211,153,0.45)]
                         flex items-center gap-1.5 transition-all"
            >
              Đăng Nhập <ArrowRight size={13} />
            </Button>
          </Link>
        </div>
      </header>

      {/* ══ HERO ═════════════════════════════════════════════════════════════ */}
      <section className="relative flex-1 flex flex-col items-center justify-center text-center px-5 pt-20 pb-16 md:pt-28 md:pb-24">

        {/* Status badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-8 rounded-full
                         bg-emerald-100 dark:bg-emerald-500/8
                         border border-emerald-300 dark:border-emerald-500/20
                         text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
          </span>
          <span className="hidden dark:inline">SYS:ONLINE — SECURITY LEVEL 3</span>
          <span className="dark:hidden">Hệ thống đang hoạt động</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] max-w-4xl">
          <span className="text-slate-900 dark:text-white">Nắm Bắt Tâm Lý,</span>
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r
                            from-emerald-600 to-teal-500
                            dark:from-emerald-400 dark:to-teal-300">
            Vững Bước Hành Quân
          </span>
        </h1>

        <p className="mt-6 text-base md:text-lg text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
          Nền tảng khảo sát & phân tích tư tưởng quân nhân ứng dụng{" "}
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Google Gemini AI</span>{" "}
          — cảnh báo sớm, phân quyền cấp đơn vị, bảo mật token một chiều.
        </p>

        {/* Stats */}
        <div className="mt-10 flex items-center gap-8 md:gap-14 flex-wrap justify-center">
          {[
            { value: "< 2s",    label: "Thời gian AI phân tích" },
            { value: "1-time",  label: "Token không thể tái dùng" },
            { value: "3 cấp",   label: "Phân quyền đơn vị RBAC" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white font-mono">{s.value}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-500 mt-0.5 font-medium tracking-wide">{s.label}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 flex flex-col items-center gap-3">
          <Link href="/login">
            <Button
              size="lg"
              className="h-12 px-10 text-base font-bold rounded-xl
                         bg-emerald-600 hover:bg-emerald-700
                         dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-[#0a0e14]
                         text-white border-none
                         shadow-lg shadow-emerald-200 dark:shadow-[0_0_30px_rgba(52,211,153,0.3)]
                         dark:hover:shadow-[0_0_40px_rgba(52,211,153,0.5)]
                         flex items-center gap-2 transition-all duration-200"
            >
              Truy Cập Sở Chỉ Huy <ArrowRight size={16} />
            </Button>
          </Link>
          <p className="text-[11px] text-slate-400 dark:text-slate-600">
            Chỉ dành cho cán bộ được uỷ quyền. Mọi truy cập đều được ghi nhật ký.
          </p>
        </div>
      </section>

      {/* ══ FEATURES ════════════════════════════════════════════════════════ */}
      <section className="relative px-5 md:px-10 pb-20 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-200 dark:to-white/10" />
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">Core Capabilities</span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-200 dark:to-white/10" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map((f) => (
            <div
              key={f.title}
              className={`relative p-5 rounded-2xl border ${f.border} ${f.bg}
                          hover:-translate-y-0.5 hover:shadow-lg ${f.glow}
                          transition-all duration-200 overflow-hidden`}
            >
              <div className="flex items-start justify-between mb-3.5">
                <div className={`w-9 h-9 rounded-xl border ${f.iconBg} flex items-center justify-center`}>
                  <f.icon size={17} className={f.color} strokeWidth={2} />
                </div>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${f.tagColor} tracking-widest`}>
                  {f.tag}
                </span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-[15px] mb-1.5">{f.title}</h3>
              <p className="text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ FOOTER ═══════════════════════════════════════════════════════════ */}
      {/* ══ FOOTER ═══════════════════════════════════════════════════════════ */}
      <footer className="relative border-t border-slate-200 dark:border-white/[0.05] bg-white dark:bg-[#0a0f08] py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center text-center gap-10">
            {/* Brand Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3">
                <Image src="/logo.png" alt="Logo" width={32} height={32} className="opacity-80 dark:opacity-100" />
                <h3 className="font-black text-slate-900 dark:text-white tracking-widest text-lg uppercase">
                  QuyetThang <span className="text-emerald-600 dark:text-[#a3e635]">AI Lab</span>
                </h3>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-500 max-w-md mx-auto leading-relaxed">
                Nền tảng phân tích tư tưởng và tâm lý chiến sĩ dựa trên trí tuệ nhân tạo, bảo vệ an ninh chính trị và tinh thần đơn vị.
              </p>
            </div>

            {/* Simple Links */}
            <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4">
              {["Quy tắc", "Bảo mật", "Hỗ trợ", "Điều khoản"].map((link) => (
                <a key={link} href="#" className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600 hover:text-emerald-500 transition-colors">
                  {link}
                </a>
              ))}
            </div>

            {/* Bottom Section */}
            <div className="w-full pt-10 border-t border-slate-100 dark:border-white/[0.03] flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1 rounded bg-emerald-500/5 border border-emerald-500/10">
                  <ShieldCheck size={14} className="text-emerald-500/60" />
                  <span className="text-[9px] font-black text-emerald-600/80 dark:text-[#a3e635]/80 uppercase tracking-widest">Restrict Access</span>
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  © 2026 QuyetThang AI &middot; Vietnam People&apos;s Army
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono">System Secure</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

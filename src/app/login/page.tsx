import Link from "next/link";
import Image from "next/image";
import { login } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ScanFace, ShieldCheck, Activity, Users, Lock, Eye } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>;
}) {
  const params = await searchParams;
  const message = params?.message;

  return (
    <div className="flex w-full min-h-screen transition-colors duration-300 relative overflow-hidden
                     bg-slate-50 dark:bg-[#0a0e14]">

      {/* ── Background effects ── */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Light mode: clean white gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-emerald-50/30 dark:hidden" />
        {/* Dark mode: glow orbs + grid */}
        <div className="absolute top-[-15%] right-[-5%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] hidden dark:block" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] hidden dark:block" />
        <div
          className="absolute inset-0 hidden dark:block"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* ══ LEFT — Login form ═══════════════════════════════════════════════ */}
      <div className="w-full lg:w-[480px] xl:w-[500px] shrink-0 flex flex-col relative z-10
                       bg-white/90 dark:bg-[#0d1117]/90
                       border-r border-slate-200/60 dark:border-white/[0.06]
                       backdrop-blur-sm shadow-sm dark:shadow-none
                       transition-colors duration-300">

        {/* Top bar */}
        <div className="flex items-center justify-between px-6 h-16
                         border-b border-slate-200/60 dark:border-white/[0.06]">
          <Link href="/">
            <Button
              variant="ghost" size="icon"
              className="w-9 h-9 rounded-xl
                         text-slate-500 dark:text-slate-500
                         hover:text-slate-900 dark:hover:text-white
                         hover:bg-slate-100 dark:hover:bg-white/8
                         border border-transparent hover:border-slate-200 dark:hover:border-white/10
                         transition-all"
            >
              <ArrowLeft size={17} />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500/20 rounded-lg blur-sm hidden dark:block" />
              <Image src="/logo.png" alt="Logo" width={26} height={26} className="relative rounded-lg" />
            </div>
            <span className="text-[12px] font-black tracking-tight text-slate-800 dark:text-white">
              ARMY<span className="text-emerald-600 dark:text-emerald-400">AI</span>
            </span>
          </div>
          <ThemeToggle />
        </div>

        {/* Form area */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-12">
          <div className="w-full max-w-sm">

            {/* Heading */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-5">
                {/* Icon */}
                <div className="relative w-12 h-12 rounded-2xl
                                bg-emerald-100 dark:bg-emerald-500/10
                                border border-emerald-200 dark:border-emerald-500/25
                                flex items-center justify-center
                                shadow-md shadow-emerald-100 dark:shadow-[0_0_20px_rgba(52,211,153,0.12)]">
                  <ScanFace size={22} className="text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                </div>
                {/* Security level */}
                <div>
                  <span className="text-[9px] text-emerald-600 dark:text-emerald-400/80 font-bold uppercase tracking-widest">Security Level 3</span>
                  <div className="flex gap-0.5 mt-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div
                        key={i}
                        className={`h-1 w-4 rounded-full transition-colors
                          ${i <= 3
                            ? "bg-emerald-500 dark:bg-emerald-400"
                            : "bg-slate-200 dark:bg-white/10"
                          }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <h1 className="text-[22px] font-extrabold tracking-tight text-slate-900 dark:text-white">
                Xác thực danh tính
              </h1>
              <p className="mt-1.5 text-[13px] text-slate-500 dark:text-slate-500 leading-relaxed">
                Nhập thông tin xác thực để truy cập Hệ thống Phân tích Tư tưởng Quân nhân.
              </p>
            </div>

            {/* Form */}
            <form action={login} className="space-y-4">

              {/* Email */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="email"
                  className="text-[11px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider"
                >
                  Tài khoản Email
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="admin@army.local"
                    required
                    className="h-11 text-sm rounded-xl pl-4 pr-10
                               bg-slate-50 dark:bg-white/[0.04]
                               border-slate-200 dark:border-white/10
                               text-slate-900 dark:text-white
                               placeholder:text-slate-400 dark:placeholder:text-slate-600
                               focus-visible:ring-2 focus-visible:ring-emerald-500/30
                               focus-visible:border-emerald-500 dark:focus-visible:border-emerald-500/60
                               hover:border-slate-300 dark:hover:border-white/20
                               transition-colors"
                  />
                  <Eye size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="password"
                  className="text-[11px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider"
                >
                  Mật khẩu truy cập
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••••••"
                    required
                    className="h-11 text-sm rounded-xl pl-4 pr-10
                               bg-slate-50 dark:bg-white/[0.04]
                               border-slate-200 dark:border-white/10
                               text-slate-900 dark:text-white
                               placeholder:text-slate-400 dark:placeholder:text-slate-600
                               focus-visible:ring-2 focus-visible:ring-emerald-500/30
                               focus-visible:border-emerald-500 dark:focus-visible:border-emerald-500/60
                               hover:border-slate-300 dark:hover:border-white/20
                               transition-colors"
                  />
                  <Lock size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" />
                </div>
              </div>

              {/* Error */}
              {message && (
                <div className="p-3.5 rounded-xl flex items-start gap-2.5
                                bg-red-50 dark:bg-red-500/8
                                border border-red-200 dark:border-red-500/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0 animate-pulse" />
                  <p className="text-[13px] text-red-600 dark:text-red-400 font-medium">{message}</p>
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                className="w-full h-11 mt-2 text-sm font-bold tracking-wide rounded-xl
                           bg-emerald-600 hover:bg-emerald-700
                           dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-[#0a0e14]
                           text-white
                           shadow-lg shadow-emerald-100 dark:shadow-[0_0_20px_rgba(52,211,153,0.25)]
                           dark:hover:shadow-[0_0_30px_rgba(52,211,153,0.4)]
                           flex items-center justify-center gap-2 transition-all duration-200"
              >
                <ScanFace size={16} />
                XÁC THỰC & ĐĂNG NHẬP
              </Button>
            </form>

            {/* Security notice */}
            <div className="mt-7 pt-5 border-t border-slate-100 dark:border-white/[0.06]">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck size={13} className="text-emerald-500" />
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">Cam kết bảo mật</span>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-600 leading-relaxed">
                Mọi phiên đăng nhập được mã hoá TLS 1.3. Truy cập trái phép sẽ bị khoá tự động và ghi nhật ký theo quy định Bộ Chỉ Huy.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ══ RIGHT — Decorative panel (desktop only) ══════════════════════════ */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center
                       bg-slate-900 dark:bg-[#0a0e14] transition-colors duration-300">
        {/* Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2
                         w-[500px] h-[500px] bg-emerald-500/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/3 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[100px]" />

        {/* Light mode overlay to darken the slate-900 */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800 dark:from-transparent dark:to-transparent" />

        {/* Tech label */}
        <div className="absolute top-8 right-8 text-right z-10">
          <p className="text-[9px] text-emerald-400/40 font-mono tracking-widest">SYS_ID: AAS-2026</p>
          <p className="text-[9px] text-slate-600 font-mono mt-0.5">CLASSIFIED // RESTRICTED</p>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-md px-10 w-full">
          <div className="relative w-20 h-20 mb-8">
            <div className="absolute inset-0 bg-emerald-500/20 rounded-2xl blur-xl" />
            <Image src="/logo.png" alt="Logo" width={80} height={80} className="relative rounded-2xl" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 rounded-full
                           bg-emerald-500/10 border border-emerald-500/20">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
            </span>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">SYS:ONLINE — ĐẦY ĐỦ NĂNG LỰC</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-black text-white leading-tight tracking-tight mb-4">
            Hệ Thống Phân Tích<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              Tư Tưởng Quân Nhân
            </span>
          </h2>
          <p className="text-slate-400 text-[14px] leading-relaxed mb-8">
            Ứng dụng trí tuệ nhân tạo thế hệ mới để đánh giá, phân loại và dự báo tâm lý cán bộ chiến sĩ trong thời gian thực.
          </p>

          <div className="space-y-2.5">
            {[
              { icon: Activity,    text: "AI phân tích cảm xúc văn bản tức thì (< 2s)", color: "text-emerald-400", bg: "bg-emerald-500/8 border-emerald-500/15" },
              { icon: ShieldCheck, text: "Token bảo mật 1 lần — chống khai báo hộ",      color: "text-blue-400",    bg: "bg-blue-500/8 border-blue-500/15"    },
              { icon: Users,       text: "RBAC 3 cấp: Sư đoàn → Tiểu đoàn → Đại đội",  color: "text-purple-400",  bg: "bg-purple-500/8 border-purple-500/15"  },
            ].map((f) => (
              <div key={f.text} className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border ${f.bg}`}>
                <f.icon size={15} className={`${f.color} shrink-0`} strokeWidth={2} />
                <span className="text-[13px] text-slate-400">{f.text}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-white/[0.06] flex items-center justify-between">
            <span className="text-[10px] text-slate-600 font-mono">v2.0.0 — STABLE</span>
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={11} className="text-emerald-500/50" />
              <span className="text-[10px] text-slate-600 font-mono">TLS 1.3 ENCRYPTED</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

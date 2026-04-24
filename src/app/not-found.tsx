import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShieldAlert, MapPinOff } from 'lucide-react';
import Image from 'next/image';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0c1109] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md text-center flex flex-col items-center gap-6">
        <Image src="/logo.png" alt="Logo" width={100} height={100} className="drop-shadow-lg opacity-80" />
        
        <div className="relative">
          <h1 className="text-8xl sm:text-9xl font-black text-slate-200 dark:text-slate-800 tracking-tighter">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <MapPinOff className="w-16 h-16 sm:w-20 sm:h-20 text-emerald-500 dark:text-[#a3e635]" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white uppercase tracking-wider">
            Sai Toạ Độ Dữ Liệu
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base px-4">
            Khu vực bạn đang cố truy cập không tồn tại hoặc đã được gỡ bỏ khỏi hệ thống tình báo.
          </p>
        </div>

        <Link href="/" className="mt-4">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-[#a3e635] dark:text-[#0c1109] dark:hover:bg-[#84cc16] px-8 h-12 text-base font-semibold shadow-lg shadow-emerald-500/20">
            Trở về Sở Chỉ Huy
          </Button>
        </Link>
      </div>
    </div>
  );
}

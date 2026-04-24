'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ServerCrash, RefreshCcw } from 'lucide-react';
import Image from 'next/image';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0c1109] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md text-center flex flex-col items-center gap-6 bg-white dark:bg-[#111] p-8 rounded-3xl border border-red-100 dark:border-red-900/30 shadow-2xl shadow-red-500/5">
        <div className="w-20 h-20 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center relative">
           <Image src="/logo.png" alt="Logo" width={40} height={40} className="absolute -top-2 -right-2 opacity-30" />
           <ServerCrash className="w-10 h-10 text-red-500 dark:text-red-400" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white uppercase tracking-wider">
            Đứt Cáp Tín Hiệu
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm px-2">
            Hệ thống phân tích tạm thời mất kết nối mã hoá hoặc xảy ra lỗi phần mêm nội bộ.
          </p>
        </div>

        <div className="w-full bg-slate-100 dark:bg-black/50 p-3 rounded-lg text-left overflow-x-auto border border-slate-200 dark:border-white/5">
           <code className="text-[10px] text-slate-500 dark:text-slate-500 font-mono">
             {error.message || "Unknown error boundary triggered"}
           </code>
        </div>

        <div className="flex flex-col sm:flex-row w-full gap-3 mt-2">
          <Button 
            onClick={() => reset()} 
            variant="outline" 
            className="flex-1 h-12 border-slate-200 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
          >
            <RefreshCcw className="w-4 h-4 mr-2" /> Khôi Phục Thu Phát
          </Button>
          <Link href="/" className="flex-1">
            <Button className="w-full h-12 bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20">
              Về Sở Chỉ Huy
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

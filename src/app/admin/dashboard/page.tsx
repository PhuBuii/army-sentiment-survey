"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { Loader2, TrendingUp, Users, Target, Activity, ArrowRight } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import Link from "next/link";
import { Pagination } from "@/components/ui/pagination";
import { useSearchParams } from "next/navigation";

type Submission = {
  id: string;
  ai_score: number;
  ai_status: string;
  ai_summary: string;
  ai_advice: string;
  created_at: string;
};

type Soldier = {
  id: string;
  full_name: string;
  unit: string;
  is_completed: boolean;
  submissions?: Submission[];
};

const STATUS_COLORS: Record<string, string> = {
  "An tâm": "#10b981",
  "Dao động": "#f59e0b",
  "Nguy cơ": "#ef4444",
};

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, completed: 0, warning: 0 });
  const [chartData, setChartData] = useState<{name: string, value: number}[]>([]);
  const [recentSoldiers, setRecentSoldiers] = useState<Soldier[]>([]);
  
  const [selectedSoldier, setSelectedSoldier] = useState<Soldier | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch soldiers and their latest submission
      const { data, error } = await supabase
        .from('soldiers')
        .select('*, submissions(*)');
      
      if (error) throw error;
      
      const soldiersData = data as Soldier[] || [];
      const total = soldiersData.length;
      const completed = soldiersData.filter(s => s.is_completed).length;
      
      // Calculate chart data and warning stats
      const statusCounts: Record<string, number> = {};
      let warningCount = 0;
      
      soldiersData.filter(s => s.is_completed && s.submissions && s.submissions.length > 0).forEach(s => {
        const status = s.submissions![0].ai_status;
        statusCounts[status] = (statusCounts[status] || 0) + 1;
        if (status === "Nguy cơ") warningCount++;
      });

      setStats({ total, completed, warning: warningCount });
      setChartData(Object.keys(statusCounts).map(status => ({
        name: status,
        value: statusCounts[status]
      })));

      // Get all completed soldiers to allow pagination
      const recent = [...soldiersData]
        .filter(s => s.is_completed && s.submissions && s.submissions.length > 0)
        .sort((a, b) => new Date(b.submissions![0].created_at).getTime() - new Date(a.submissions![0].created_at).getTime());

      setRecentSoldiers(recent);

    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(recentSoldiers.length / ITEMS_PER_PAGE);
  const paginatedSoldiers = recentSoldiers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const renderBadge = (status: string) => {
    if (status === "An tâm") return <Badge className="bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 dark:hover:bg-emerald-500/30 dark:border dark:border-emerald-500/50">An tâm</Badge>;
    if (status === "Nguy cơ") return <Badge variant="destructive" className="dark:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-500/30 dark:border dark:border-red-500/50">Nguy cơ</Badge>;
    return <Badge className="bg-amber-500 hover:bg-amber-600 dark:bg-amber-500/20 dark:text-amber-400 dark:hover:bg-amber-500/30 dark:border dark:border-amber-500/50">Dao động</Badge>;
  };

  const openDetails = (soldier: Soldier) => {
    setSelectedSoldier(soldier);
    setIsDialogOpen(true);
  };

  if (loading) {
    return <div className="flex h-[80vh] items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-600 dark:text-[#a3e635]" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Tổng Quan Báo Cáo</h1>
        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">Dữ liệu phân tích tư tưởng quân nhân cập nhật theo thời gian thực.</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-sm border-slate-200 dark:border-white/10 dark:bg-[#0a0f08]/50">
          <CardContent className="p-4 sm:p-6 flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Tổng quân số</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{stats.total}</h3>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-slate-200 dark:border-white/10 dark:bg-[#0a0f08]/50">
          <CardContent className="p-4 sm:p-6 flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Đã khảo sát</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-[#a3e635]">{stats.completed}</h3>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-50 dark:bg-[#a3e635]/10 text-emerald-600 dark:text-[#a3e635] rounded-full flex items-center justify-center">
              <Target className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 dark:border-white/10 dark:bg-[#0a0f08]/50 sm:col-span-2 lg:col-span-1">
          <CardContent className="p-4 sm:p-6 flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Tư tưởng rủi ro</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-red-600 dark:text-red-400">{stats.warning}</h3>
            </div>
             <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center">
              <Activity className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Analytics Chart */}
        <Card className="lg:col-span-1 shadow-sm border-slate-200 dark:border-white/10 dark:bg-[#0a0f08]/50 flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">Tỷ trọng tâm lý</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center min-h-[300px]">
             {chartData.length > 0 ? (
                <div className="w-full h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        innerRadius={65}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || "#ccc"} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: 'rgb(15 23 42)', borderRadius: '8px', border: 'none', color: '#fff' }} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-600">
                  <TrendingUp className="w-10 h-10 sm:w-12 sm:h-12 mb-3 opacity-20" />
                  <p className="text-xs sm:text-sm text-center px-4">Chưa có dữ liệu thống kê để hiển thị biểu đồ.</p>
                </div>
              )}
          </CardContent>
        </Card>

        {/* Recent Updates Table */}
        <Card className="lg:col-span-2 shadow-sm border-slate-200 dark:border-white/10 dark:bg-[#0a0f08]/50 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4">
            <CardTitle className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">Cập nhật gần đây nhất</CardTitle>
            <Link href="/admin/soldiers" className="text-xs sm:text-sm text-emerald-600 dark:text-[#a3e635] hover:text-emerald-700 dark:hover:text-[#b8f553] font-medium flex items-center gap-1 transition-colors">
              Xem tất cả <ArrowRight size={14} />
            </Link>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 dark:bg-white/5 hover:bg-slate-50/50 dark:hover:bg-white/5 border-none">
                  <TableHead className="py-3 sm:py-4 whitespace-nowrap w-12 text-center">STT</TableHead>
                  <TableHead className="whitespace-nowrap">Đồng chí</TableHead>
                  <TableHead className="whitespace-nowrap">Đơn vị</TableHead>
                  <TableHead className="whitespace-nowrap">Trạng thái AI</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedSoldiers.length === 0 ? (
                  <TableRow>
                     <TableCell colSpan={4} className="h-32 text-center text-slate-400 dark:text-slate-500 text-sm">Chưa có bài khảo sát nào được hoàn thành.</TableCell>
                  </TableRow>
                ) : (
                  paginatedSoldiers.map((soldier, idx) => {
                    const sub = soldier.submissions?.[0];
                    return (
                      <TableRow key={soldier.id} className="border-slate-100 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/5">
                        <TableCell className="text-center font-medium text-slate-500 text-xs">
                          {(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                        </TableCell>
                        <TableCell className="font-medium text-slate-900 dark:text-white text-xs sm:text-sm whitespace-nowrap">{soldier.full_name}</TableCell>
                        <TableCell className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm max-w-[120px] sm:max-w-[200px] truncate" title={soldier.unit}>{soldier.unit}</TableCell>
                        <TableCell>
                          {sub ? renderBadge(sub.ai_status) : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" className="h-7 sm:h-8 text-xs bg-white dark:bg-transparent border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 dark:hover:bg-white/5" onClick={() => openDetails(soldier)}>
                            Chi tiết
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
          {!loading && totalPages >= 1 && (
            <div className="px-4 py-2 border-t border-slate-100 dark:border-white/5">
              <Pagination totalPages={totalPages} />
            </div>
          )}
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl w-[95vw] mx-auto rounded-xl dark:bg-[#111] dark:border-white/10 dark:text-white">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl flex items-center gap-2 flex-wrap">
              Hồ Sơ Tư Tưởng: <span className="text-emerald-600 dark:text-[#a3e635] truncate">{selectedSoldier?.full_name}</span>
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm dark:text-slate-400">
              Đơn vị: {selectedSoldier?.unit}
            </DialogDescription>
          </DialogHeader>
          
          {selectedSoldier?.submissions?.[0] && (
            <div className="space-y-4 sm:space-y-6 pt-2 sm:pt-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                 <div className="bg-slate-50 dark:bg-white/5 p-3 sm:p-4 rounded-xl flex flex-col justify-center items-center border border-slate-100 dark:border-white/5">
                    <span className="text-[10px] sm:text-xs uppercase tracking-wider mb-2 font-semibold text-slate-500 dark:text-slate-400 w-full text-center">Trạng thái</span>
                    <div className="text-lg sm:text-xl font-bold">
                       {renderBadge(selectedSoldier.submissions[0].ai_status)}
                    </div>
                 </div>
                 <div className="bg-slate-50 dark:bg-white/5 p-3 sm:p-4 rounded-xl flex flex-col justify-center items-center border border-slate-100 dark:border-white/5">
                    <span className="text-[10px] sm:text-xs uppercase tracking-wider mb-2 font-semibold text-slate-500 dark:text-slate-400 w-full text-center">Tâm lý (Điểm)</span>
                    <span className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-white">{selectedSoldier.submissions[0].ai_score}<span className="text-sm sm:text-lg font-medium text-slate-400 dark:text-slate-500">/100</span></span>
                 </div>
              </div>

              <div>
                 <h4 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2 text-sm sm:text-base">
                    <div className="w-1.5 h-3 sm:h-4 bg-emerald-500 dark:bg-[#a3e635] rounded-full"></div>
                    AI Nhận Xét Tổng Quan
                 </h4>
                 <p className="text-slate-700 dark:text-slate-300 bg-emerald-50/50 dark:bg-[#a3e635]/10 p-3 sm:p-4 rounded-xl border border-emerald-100/50 dark:border-[#a3e635]/20 text-xs sm:text-sm leading-relaxed text-justify">
                   {selectedSoldier.submissions[0].ai_summary}
                 </p>
              </div>

              <div>
                 <h4 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2 text-sm sm:text-base">
                    <div className="w-1.5 h-3 sm:h-4 bg-amber-500 rounded-full"></div>
                    Lời Khuyên Cho Chỉ Huy
                 </h4>
                 <p className="text-slate-700 dark:text-slate-300 bg-amber-50/50 dark:bg-amber-500/10 p-3 sm:p-4 rounded-xl border border-amber-100/50 dark:border-amber-500/20 text-xs sm:text-sm leading-relaxed text-justify">
                   {selectedSoldier.submissions[0].ai_advice}
                 </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

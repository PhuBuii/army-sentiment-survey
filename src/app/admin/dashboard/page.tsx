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
import { Checkbox } from "@/components/ui/checkbox";
import { createClient } from "@/utils/supabase/client";
import { markSubmissionResolved } from "@/app/actions/admin-actions";
import { exportElementToPDF } from "@/lib/export-pdf";
import { Loader2, TrendingUp, Users, Target, Activity, ArrowRight, ShieldAlert, ShieldCheck, Printer } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { toast } from "sonner";
import Link from "next/link";
import { Pagination } from "@/components/ui/pagination";
import { useSearchParams } from "next/navigation";
import { Label } from "@/components/ui/label";

type Submission = {
  id: string;
  ai_score: number;
  ai_status: string;
  ai_summary: string;
  ai_advice: string;
  is_resolved?: boolean;
  admin_note?: string;
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
  const [resolving, setResolving] = useState(false);

  // Filter states
  const [units, setUnits] = useState<string[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<string>("all");

  useEffect(() => {
    fetchDashboardData();
  }, [selectedUnit]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      // Fetch soldiers and their latest submission
      const { data, error } = await supabase
        .from('soldiers')
        .select('*, submissions(*)');
      
      if (error) throw error;
      
      const soldiersData = data as Soldier[] || [];
      
      // Extract unique units
      const uniqueUnits = Array.from(new Set(soldiersData.map(s => s.unit))).filter(Boolean);
      setUnits(uniqueUnits);

      // Perform filtering
      const filteredSoldiersData = selectedUnit === "all" ? soldiersData : soldiersData.filter(s => s.unit === selectedUnit);

      const total = filteredSoldiersData.length;
      const completed = filteredSoldiersData.filter(s => s.is_completed).length;
      
      // Calculate chart data and warning stats
      const statusCounts: Record<string, number> = {};
      let warningCount = 0;
      
      filteredSoldiersData.filter(s => s.is_completed && s.submissions && s.submissions.length > 0).forEach(s => {
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
      const recent = [...filteredSoldiersData]
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

  const handleToggleResolved = async (checked: boolean) => {
    if (!selectedSoldier?.submissions?.[0]) return;
    const sub = selectedSoldier.submissions[0];
    setResolving(true);
    
    const res = await markSubmissionResolved(sub.id, checked);
    setResolving(false);
    
    if (res.error) {
       toast.error("Lỗi cập nhật: " + res.error);
    } else {
       toast.success(checked ? "Đã đánh dấu hoàn tất xử lý tư tưởng." : "Đã huỷ đánh dấu xử lý.");
       // Update local state gently
       const updatedSoldier = { ...selectedSoldier, submissions: [{ ...sub, is_resolved: checked }] };
       setSelectedSoldier(updatedSoldier);
       // Also update the list under the hood
       const newList = recentSoldiers.map(s => s.id === updatedSoldier.id ? updatedSoldier : s);
       setRecentSoldiers(newList);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-7 h-7 animate-spin text-emerald-500" />
          <p className="text-xs text-slate-400 dark:text-slate-500">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="dashboard-content">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Tổng Quan Báo Cáo</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Dữ liệu phân tích tư tưởng cập nhật thời gian thực.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline" size="sm"
            className="h-9 px-3 text-sm bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300
                       border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-50 dark:hover:bg-white/8"
            onClick={() => exportElementToPDF("dashboard-content", selectedUnit)}
          >
            <Printer className="w-4 h-4 mr-1.5" /> In Báo Cáo
          </Button>
          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="h-9 px-3 text-sm bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10
                       rounded-xl text-slate-700 dark:text-slate-300 outline-none
                       focus:border-emerald-500 dark:focus:border-emerald-400 appearance-none cursor-pointer"
          >
            <option value="all">Toàn bộ Đơn vị</option>
            {units.map(u => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Overview Cards — consistent style with rest of app */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-sm border-slate-200 dark:border-white/8 bg-white dark:bg-[#161b22]">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Tổng quân số</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white">{stats.total}</h3>
            </div>
            <div className="w-11 h-11 bg-blue-50 dark:bg-blue-500/10 rounded-2xl border border-blue-100 dark:border-blue-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 dark:border-white/8 bg-white dark:bg-[#161b22]">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Đã khảo sát</p>
              <h3 className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{stats.completed}</h3>
            </div>
            <div className="w-11 h-11 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 dark:border-white/8 bg-white dark:bg-[#161b22] sm:col-span-2 lg:col-span-1">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Tư tưởng rủi ro</p>
              <h3 className="text-3xl font-black text-red-600 dark:text-red-400">{stats.warning}</h3>
            </div>
            <div className="w-11 h-11 bg-red-50 dark:bg-red-500/10 rounded-2xl border border-red-100 dark:border-red-500/20 flex items-center justify-center">
              <Activity className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <Card className="lg:col-span-1 shadow-sm border-slate-200 dark:border-white/8 bg-white dark:bg-[#161b22] flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tỷ trọng tâm lý</CardTitle>
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

        {/* Recent table */}
        <Card className="lg:col-span-2 shadow-sm border-slate-200 dark:border-white/8 bg-white dark:bg-[#161b22] overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-white/8 pb-3.5">
            <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Cập nhật gần nhất</CardTitle>
            <Link href="/admin/soldiers" className="text-[13px] text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium flex items-center gap-1">
              Xem tất cả <ArrowRight size={13} />
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
                          <div className="flex items-center gap-2">
                             {sub ? renderBadge(sub.ai_status) : "-"}
                             {sub?.is_resolved && <ShieldCheck className="w-4 h-4 text-emerald-500" />}
                          </div>
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

              {/* ACTION TRACKING MODULE */}
              {selectedSoldier.submissions[0].ai_status === "Nguy cơ" && (
                <div className={`p-4 rounded-xl border flex gap-3 items-start transition-colors ${selectedSoldier.submissions[0].is_resolved ? 'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/30' : 'bg-red-50/50 border-red-200 dark:bg-red-500/10 dark:border-red-500/30'}`}>
                  <div className="pt-1">
                    <Checkbox 
                      id="resolve-issue" 
                      checked={!!selectedSoldier.submissions[0].is_resolved}
                      onCheckedChange={(checked) => handleToggleResolved(checked as boolean)}
                      disabled={resolving}
                      className={selectedSoldier.submissions[0].is_resolved ? 'data-[state=checked]:bg-emerald-500 data-[state=checked]:text-white border-emerald-500' : 'border-red-500'}
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <Label htmlFor="resolve-issue" className={`font-bold cursor-pointer flex items-center gap-2 ${selectedSoldier.submissions[0].is_resolved ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
                      {selectedSoldier.submissions[0].is_resolved ? (
                        <><ShieldCheck className="w-4 h-4" /> Đã hoàn tất can thiệp tư tưởng</>
                      ) : (
                        <><ShieldAlert className="w-4 h-4" /> Yêu cầu can thiệp xử lý ngay</>
                      )}
                    </Label>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {selectedSoldier.submissions[0].is_resolved 
                        ? 'Chỉ huy đã xác nhận tiếp xúc, xử lý hoặc động viên chiến sĩ này.' 
                        : 'Nhấn vào đây để đánh dấu Chỉ huy đã tiếp xúc và giải quyết vấn đề cho chiến sĩ sau khi đọc báo cáo AI.'}
                    </p>
                  </div>
                </div>
              )}

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

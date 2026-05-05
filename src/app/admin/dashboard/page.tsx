"use client";

import React, { useState, useEffect, Suspense } from "react";
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
import { 
  Users, Target, Activity, Printer, 
  ArrowRight, ShieldCheck, TrendingUp,
  Loader2, Calendar
} from "lucide-react";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid 
} from "recharts";
import { toast } from "react-toastify";
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
  ai_dialogue_script?: string;
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

// Component con chứa logic chính
function DashboardContent() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, completed: 0, warning: 0 });
  const [chartData, setChartData] = useState<{name: string, value: number}[]>([]);
  const [trendData, setTrendData] = useState<{date: string, score: number}[]>([]);
  const [recentSoldiers, setRecentSoldiers] = useState<Soldier[]>([]);
  
  const [selectedSoldier, setSelectedSoldier] = useState<Soldier | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [resolving, setResolving] = useState(false);

  const [units, setUnits] = useState<string[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<string>("all");

  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchDashboardData();
  }, [selectedUnit]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from('soldiers')
        .select('*, submissions(*)');
      
      if (error) throw error;
      
      const soldiersData = data as Soldier[] || [];
      const uniqueUnits = Array.from(new Set(soldiersData.map(s => s.unit))).filter(Boolean);
      setUnits(uniqueUnits);

      const filteredSoldiersData = selectedUnit === "all" ? soldiersData : soldiersData.filter(s => s.unit === selectedUnit);
      const total = filteredSoldiersData.length;
      const completed = filteredSoldiersData.filter(s => s.is_completed).length;
      
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

      // --- Process Trend Data ---
      const allSubs = filteredSoldiersData
        .flatMap(s => s.submissions || [])
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      
      const dayMap: Record<string, { sum: number, count: number }> = {};
      allSubs.forEach(sub => {
        const dateStr = new Date(sub.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
        if (!dayMap[dateStr]) dayMap[dateStr] = { sum: 0, count: 0 };
        dayMap[dateStr].sum += sub.ai_score;
        dayMap[dateStr].count += 1;
      });

      setTrendData(Object.keys(dayMap).map(date => ({
        date,
        score: Math.round(dayMap[date].sum / dayMap[date].count)
      })));

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

  const totalPages = Math.ceil(recentSoldiers.length / ITEMS_PER_PAGE);
  const paginatedSoldiers = recentSoldiers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const renderBadge = (status: string) => {
    if (status === "An tâm") return <Badge className="bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">An tâm</Badge>;
    if (status === "Nguy cơ") return <Badge variant="destructive" className="dark:bg-red-500/20 dark:text-red-400">Nguy cơ</Badge>;
    return <Badge className="bg-amber-500 hover:bg-amber-600 dark:bg-amber-500/20 dark:text-amber-400">Dao động</Badge>;
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
       const updatedSoldier = { ...selectedSoldier, submissions: [{ ...sub, is_resolved: checked }] };
       setSelectedSoldier(updatedSoldier);
       const newList = recentSoldiers.map(s => s.id === updatedSoldier.id ? updatedSoldier : s);
       setRecentSoldiers(newList);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-7 h-7 animate-spin text-emerald-500" />
          <p className="text-xs text-slate-400">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="dashboard-content">
      {/* CSS in ấn */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: A4; margin: 15mm 20mm; }
          body { 
            background: white !important; 
            color: black !important; 
            font-family: "Times New Roman", Times, serif !important; 
            text-rendering: optimizeLegibility !important;
            -webkit-font-smoothing: antialiased !important;
          }
          nav, aside, .no-print, button, select, .pagination-nav, [role="combobox"] { display: none !important; }
          .print-only { display: block !important; }
          .card { border: 1px solid #000 !important; box-shadow: none !important; margin-bottom: 10px !important; break-inside: avoid !important; }
          table { width: 100% !important; border-collapse: collapse !important; table-layout: fixed !important; }
          th, td { border: 1px solid #000 !important; padding: 8px !important; text-align: left !important; font-size: 12px !important; word-wrap: break-word !important; }
          tr { break-inside: avoid !important; break-after: auto !important; }
          thead { display: table-header-group !important; }
          th { background-color: #f2f2f2 !important; }
          h1, h2, h3, p, span, td, th { font-family: "Times New Roman", Times, serif !important; }
        }
      ` }} />

      {/* Mẫu in ấn */}
      <div className="hidden print-only">
        <div className="flex justify-between items-start mb-10">
          <div className="text-center font-serif">
            <p className="font-bold text-[13px] uppercase">HỆ THỐNG QUẢN LÝ TÂM LÝ</p>
            <p className="text-[12px] font-bold underline underline-offset-4">ĐƠN VỊ: {selectedUnit === "all" ? "BỘ CHỈ HUY" : selectedUnit.toUpperCase()}</p>
          </div>
          <div className="text-center font-serif">
            <p className="font-bold text-[13px] uppercase">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
            <p className="font-bold text-[14px]">Độc lập - Tự do - Hạnh phúc</p>
            <div className="w-32 h-[1px] bg-black mx-auto mt-1"></div>
          </div>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold uppercase mb-2 font-serif">BÁO CÁO TỔNG HỢP TÌNH HÌNH TÂM LÝ CHIẾN SĨ</h1>
          <p className="text-sm italic font-serif">Thời điểm: {new Date().toLocaleString('vi-VN')}</p>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-bold uppercase mb-4 border-l-4 border-black pl-2 bg-slate-50 font-serif">I. Thống kê chung</h2>
          <div className="grid grid-cols-3 gap-6 mb-4">
            <div className="border border-black p-4 text-center">
              <p className="text-[11px] uppercase font-bold">Tổng quân số</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="border border-black p-4 text-center">
              <p className="text-[11px] uppercase font-bold">Đã khảo sát</p>
              <p className="text-2xl font-bold">{stats.completed}</p>
            </div>
            <div className="border border-black p-4 text-center">
              <p className="text-[11px] uppercase font-bold">Cần can thiệp</p>
              <p className="text-2xl font-bold text-red-600">{stats.warning}</p>
            </div>
          </div>
        </div>

        <div className="mb-10">
          <h2 className="text-lg font-bold uppercase mb-4 border-l-4 border-black pl-2 bg-slate-50 font-serif">II. Danh sách trọng điểm</h2>
          <table className="w-full border-collapse border border-black font-serif">
            <thead>
              <tr className="bg-slate-100">
                <th className="w-10 text-center">STT</th>
                <th className="w-40">Họ và tên</th>
                <th className="w-32 text-center">Đơn vị</th>
                <th className="w-16 text-center">Điểm</th>
                <th>Nhận xét & Hướng xử lý</th>
              </tr>
            </thead>
            <tbody>
              {recentSoldiers.filter(s => s.submissions?.[0]?.ai_status === "Nguy cơ").length > 0 ? (
                recentSoldiers.filter(s => s.submissions?.[0]?.ai_status === "Nguy cơ").map((s, i) => (
                  <tr key={s.id}>
                    <td className="text-center">{i + 1}</td>
                    <td className="font-bold">{s.full_name.toUpperCase()}</td>
                    <td className="text-center">{s.unit}</td>
                    <td className="text-center font-bold">{s.submissions?.[0]?.ai_score}</td>
                    <td className="text-justify text-[11px]">
                      <p className="mb-1"><b>[NHẬN XÉT]:</b> <i>{s.submissions?.[0]?.ai_summary}</i></p>
                      <p><b>[XỬ LÝ]:</b> {s.submissions?.[0]?.ai_advice}</p>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5} className="text-center py-4 italic">Không có dữ liệu nguy cơ.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-12 flex justify-end pr-10 font-serif">
          <div className="text-center">
            <p className="mb-1 text-sm">.........., ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}</p>
            <p className="font-bold uppercase mb-20">CÁN BỘ CHỈ HUY</p>
            <p className="text-sm italic">(Ký và ghi rõ họ tên)</p>
          </div>
        </div>
      </div>

      {/* Giao diện Web */}
      <div className="space-y-6 no-print">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-1 sm:px-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Tổng Quan Dashboard</h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">Phân tích tư tưởng chiến sĩ thời gian thực.</p>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              onClick={() => window.print()} 
              className="h-10 px-4 text-sm bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-50 dark:hover:bg-white/8 flex-1 sm:w-44 sm:flex-none justify-center shadow-sm"
            >
              <Printer className="w-4 h-4 mr-2" /> In Báo Cáo
            </Button>
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="h-10 px-4 text-sm bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl outline-none cursor-pointer text-slate-700 dark:text-slate-300 focus:border-emerald-500 dark:focus:border-emerald-400 appearance-none flex-1 sm:w-44 sm:flex-none shadow-sm"
            >
              <option value="all">Toàn bộ Đơn vị</option>
              {units.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="shadow-sm border-slate-200 dark:border-white/8 bg-white dark:bg-[#161b22] hover:border-blue-500/30 transition-colors">
            <CardContent className="p-4 sm:p-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Tổng quân số</p>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{stats.total}</h3>
              </div>
              <div className="w-10 h-10 sm:w-11 sm:h-11 bg-blue-50 dark:bg-blue-500/10 rounded-2xl border border-blue-100 dark:border-blue-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200 dark:border-white/8 bg-white dark:bg-[#161b22] hover:border-emerald-500/30 transition-colors">
            <CardContent className="p-4 sm:p-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Đã khảo sát</p>
                <h3 className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">{stats.completed}</h3>
              </div>
              <div className="w-10 h-10 sm:w-11 sm:h-11 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200 dark:border-white/8 bg-white dark:bg-[#161b22] sm:col-span-2 lg:col-span-1 hover:border-red-500/30 transition-colors">
            <CardContent className="p-4 sm:p-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Tư tưởng rủi ro</p>
                <h3 className="text-2xl sm:text-3xl font-black text-red-600 dark:text-red-400">{stats.warning}</h3>
              </div>
              <div className="w-10 h-10 sm:w-11 sm:h-11 bg-red-50 dark:bg-red-500/10 rounded-2xl border border-red-100 dark:border-red-500/20 flex items-center justify-center">
                <Activity className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Trend Chart */}
          <Card className="lg:col-span-2 shadow-sm border-slate-200 dark:border-white/8 bg-white dark:bg-[#161b22] flex flex-col">
            <CardHeader className="pb-2 p-4 sm:p-6 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Diễn biến tư tưởng</CardTitle>
                <p className="text-[10px] text-slate-500 mt-1">Điểm trung bình toàn đơn vị theo ngày</p>
              </div>
              <Calendar className="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent className="flex-1 p-4 sm:p-6 pt-0">
               {trendData.length > 0 ? (
                  <div className="w-full h-[220px] sm:h-[250px] mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="date" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 10, fill: '#94a3b8' }}
                          dy={10}
                        />
                        <YAxis 
                          hide 
                          domain={[0, 100]}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'rgb(15 23 42)', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                          itemStyle={{ color: '#10b981' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="score" 
                          stroke="#10b981" 
                          strokeWidth={3} 
                          dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                          activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 py-10">
                    <Activity className="w-10 h-10 mb-3 opacity-20" />
                    <p className="text-xs">Chưa có đủ dữ liệu để vẽ biểu đồ diễn biến.</p>
                  </div>
                )}
            </CardContent>
          </Card>

          {/* Pie Chart */}
          <Card className="lg:col-span-1 shadow-sm border-slate-200 dark:border-white/8 bg-white dark:bg-[#161b22] flex flex-col">
            <CardHeader className="pb-2 p-4 sm:p-6">
              <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tỷ trọng tâm lý</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center min-h-[280px] sm:min-h-[300px] p-4 sm:p-6 pt-0">
               {chartData.length > 0 ? (
                  <div className="w-full h-[220px] sm:h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          innerRadius={55}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          stroke="none"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || "#ccc"} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: 'rgb(15 23 42)', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }} />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#94a3b8', paddingTop: '10px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 py-10">
                    <TrendingUp className="w-10 h-10 mb-3 opacity-20" />
                    <p className="text-xs text-center px-4">Chưa có dữ liệu thống kê để hiển thị biểu đồ.</p>
                  </div>
                )}
            </CardContent>
          </Card>

          {/* Recent table */}
          <Card className="lg:col-span-3 shadow-sm border-slate-200 dark:border-white/8 bg-white dark:bg-[#161b22] overflow-hidden flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-white/8 p-4 sm:p-6 py-3.5 sm:py-4">
              <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Cập nhật gần nhất</CardTitle>
              <Link href="/admin/soldiers" className="text-[12px] sm:text-[13px] text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium flex items-center gap-1">
                Tất cả <ArrowRight size={13} />
              </Link>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
              <div className="overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-white/10">
                <Table className="min-w-[600px] sm:min-w-full">
                  <TableHeader>
                    <TableRow className="bg-slate-50/50 dark:bg-white/5 hover:bg-slate-50/50 dark:hover:bg-white/5 border-none">
                      <TableHead className="py-3 sm:py-4 w-12 text-center text-[11px] uppercase tracking-wider">STT</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider">Đồng chí</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider">Đơn vị</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider">Trạng thái</TableHead>
                      <TableHead className="text-right text-[11px] uppercase tracking-wider pr-4 sm:pr-6">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedSoldiers.length === 0 ? (
                      <TableRow>
                         <TableCell colSpan={5} className="h-40 text-center text-slate-400 dark:text-slate-500 text-sm italic">Chưa có bài khảo sát nào được hoàn thành.</TableCell>
                      </TableRow>
                    ) : (
                      paginatedSoldiers.map((soldier, idx) => {
                        const sub = soldier.submissions?.[0];
                        return (
                          <TableRow key={soldier.id} className="border-slate-100 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                            <TableCell className="text-center font-medium text-slate-500 text-[10px] sm:text-xs">
                              {(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                            </TableCell>
                            <TableCell className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm whitespace-nowrap">{soldier.full_name}</TableCell>
                            <TableCell className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-xs max-w-[100px] sm:max-w-[200px] truncate" title={soldier.unit}>{soldier.unit}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5">
                                 {sub ? renderBadge(sub.ai_status) : "-"}
                                 {sub?.is_resolved && <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />}
                              </div>
                            </TableCell>
                            <TableCell className="text-right pr-4 sm:pr-6">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-7 sm:h-8 px-2 sm:px-3 text-[10px] sm:text-xs bg-white dark:bg-transparent border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 dark:hover:bg-white/5 rounded-lg" 
                                onClick={() => openDetails(soldier)}
                              >
                                Chi tiết
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-auto p-3 sm:p-4 border-t border-slate-100 dark:border-white/5">
                <Pagination totalPages={totalPages} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Chi tiết Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl dark:bg-[#111] dark:text-white">
          <DialogHeader>
            <DialogTitle>Hồ Sơ: {selectedSoldier?.full_name}</DialogTitle>
            <DialogDescription>Đơn vị: {selectedSoldier?.unit}</DialogDescription>
          </DialogHeader>
          {selectedSoldier?.submissions?.[0] && (
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-100 dark:border-white/5">
                  <p className="text-xs uppercase text-slate-500 mb-2">Trạng thái</p>
                  {renderBadge(selectedSoldier.submissions[0].ai_status)}
                </div>
                <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-100 dark:border-white/5">
                  <p className="text-xs uppercase text-slate-500 mb-2">Điểm số</p>
                  <p className="text-3xl font-black">{selectedSoldier.submissions[0].ai_score}</p>
                </div>
              </div>
              
              {selectedSoldier.submissions[0].ai_status === "Nguy cơ" && (
                <div className={`p-4 rounded-xl border flex gap-3 items-start ${selectedSoldier.submissions[0].is_resolved ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                  <Checkbox 
                    id="resolve-issue" 
                    checked={!!selectedSoldier.submissions[0].is_resolved}
                    onCheckedChange={(checked) => handleToggleResolved(checked as boolean)}
                    disabled={resolving}
                  />
                  <Label htmlFor="resolve-issue" className="cursor-pointer font-bold">
                    {selectedSoldier.submissions[0].is_resolved ? "Đã hoàn tất can thiệp" : "Yêu cầu can thiệp ngay"}
                  </Label>
                </div>
              )}

              <div><h4 className="font-bold text-sm mb-2">AI Nhận Xét</h4><p className="text-sm bg-emerald-50 dark:bg-emerald-500/10 p-4 rounded-xl">{selectedSoldier.submissions[0].ai_summary}</p></div>
              <div><h4 className="font-bold text-sm mb-2">Lời Khuyên</h4><p className="text-sm bg-amber-50 dark:bg-amber-500/10 p-4 rounded-xl">{selectedSoldier.submissions[0].ai_advice}</p></div>
              {selectedSoldier.submissions[0].ai_dialogue_script && (
                <div><h4 className="font-bold text-sm mb-2">Kịch Bản Đối Thoại</h4><div className="text-sm bg-blue-50 dark:bg-blue-500/10 p-4 rounded-xl whitespace-pre-line">{selectedSoldier.submissions[0].ai_dialogue_script}</div></div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Component chính export ra
export default function AdminDashboard() {
  return (
    <Suspense fallback={<div className="p-10 text-center"><Loader2 className="animate-spin mx-auto mb-2" /> Đang khởi tạo Dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}

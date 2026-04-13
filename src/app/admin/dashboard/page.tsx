"use client";

import React, { useState, useEffect } from "react";
import { read, utils } from "xlsx";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { ClipboardCopy, Loader2, BarChart2, PieChart as PieChartIcon } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

type Submission = {
  id: string;
  responses: any[];
  ai_score: number;
  ai_status: string;
  ai_summary: string;
  ai_advice: string;
};

type Soldier = {
  id: string;
  full_name: string;
  unit: string;
  token: string;
  is_completed: boolean;
  submissions?: Submission[];
};

const STATUS_COLORS: Record<string, string> = {
  "An tâm": "#10b981", // Emerald 500
  "Dao động": "#f59e0b", // Amber 500
  "Nguy cơ": "#ef4444", // Red 500
};

export default function AdminDashboard() {
  const [soldiers, setSoldiers] = useState<Soldier[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<"questions" | "soldiers" | null>(null);

  // Dialog state
  const [selectedSoldier, setSelectedSoldier] = useState<Soldier | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch soldiers with their subbmissions
      const { data, error } = await supabase
        .from('soldiers')
        .select('*, submissions(*)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setSoldiers(data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "questions" | "soldiers") => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(type);

    try {
      const data = await file.arrayBuffer();
      const workbook = read(data);
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData: any[] = utils.sheet_to_json(firstSheet);

      if (type === "questions") {
        const payload = jsonData.filter(r => r.content).map(r => ({ content: r.content }));
        if (payload.length > 0) {
          const { error } = await supabase.from('questions').insert(payload);
          if (error) throw error;
          alert(`Đã upload ${payload.length} câu hỏi.`);
        }
      } else {
        const payload = jsonData.filter(r => r.full_name && r.unit).map(r => ({ full_name: r.full_name, unit: r.unit }));
        if (payload.length > 0) {
          const { error } = await supabase.from('soldiers').insert(payload);
          if (error) throw error;
          alert(`Đã upload ${payload.length} chiến sĩ.`);
          fetchData();
        }
      }
    } catch (error) {
      console.error(`Upload error:`, error);
      alert(`Lỗi upload. Vui lòng kiểm tra file.`);
    } finally {
      setUploading(null);
      e.target.value = ''; 
    }
  };

  const copyToClipboard = (token: string) => {
    const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : '';
    navigator.clipboard.writeText(`${origin}/survey/${token}`);
    alert('Đã copy link!');
  };

  const openDetails = (soldier: Soldier) => {
    setSelectedSoldier(soldier);
    setIsDialogOpen(true);
  };

  // Tính toán thống kê
  const completedSoldiers = soldiers.filter(s => s.is_completed && s.submissions && s.submissions.length > 0);
  const statusCounts = completedSoldiers.reduce((acc, s) => {
    const status = s.submissions![0].ai_status;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.keys(statusCounts).map(status => ({
    name: status,
    value: statusCounts[status]
  }));

  const renderBadge = (status: string) => {
    if (status === "An tâm") return <Badge className="bg-emerald-500 hover:bg-emerald-600">An tâm</Badge>;
    if (status === "Nguy cơ") return <Badge variant="destructive">Nguy cơ</Badge>;
    return <Badge className="bg-amber-500 hover:bg-amber-600">Dao động</Badge>;
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-slate-900">Ban Chỉ Huy - Phân Tích Tư Tưởng</h1>
          <p className="text-slate-500">Khảo sát & Đánh giá phân tích tự động bởi mô hình Gemini AI</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Input type="file" id="q-file" className="hidden" accept=".xlsx, .xls" onChange={e => handleFileUpload(e, "questions")} />
            <Button variant="outline" onClick={() => document.getElementById('q-file')?.click()} disabled={!!uploading}>
              {uploading === "questions" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Tải lên Câu hỏi
            </Button>
          </div>
          <div className="relative">
            <Input type="file" id="s-file" className="hidden" accept=".xlsx, .xls" onChange={e => handleFileUpload(e, "soldiers")} />
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => document.getElementById('s-file')?.click()} disabled={!!uploading}>
              {uploading === "soldiers" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Tải lên Chiến sĩ
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Analytics Card */}
        <Card className="lg:col-span-1 shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-indigo-500" />
              Tổng Quan Tư Tưởng
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-0">
            {chartData.length > 0 ? (
              <div className="w-full h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || "#ccc"} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[250px] text-slate-400">
                <BarChart2 className="w-12 h-12 mb-2 opacity-20" />
                <p>Chưa có dữ liệu thống kê</p>
              </div>
            )}
            <div className="w-full grid grid-cols-3 divide-x border-t text-center py-4 text-sm mt-2">
               <div>
                  <p className="font-bold text-slate-800">{soldiers.length}</p>
                  <p className="text-slate-500 text-xs">Tổng quân số</p>
               </div>
               <div>
                  <p className="font-bold text-emerald-600">{completedSoldiers.length}</p>
                  <p className="text-slate-500 text-xs">Đã khảo sát</p>
               </div>
               <div>
                  <p className="font-bold text-red-600">{statusCounts["Nguy cơ"] || 0}</p>
                  <p className="text-slate-500 text-xs">Cần lưu ý</p>
               </div>
            </div>
          </CardContent>
        </Card>

        {/* Soldiers Table */}
        <Card className="lg:col-span-2 shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Danh Sách Chiến Sĩ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Đồng chí</TableHead>
                    <TableHead>Đơn vị</TableHead>
                    <TableHead>Đánh giá AI</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-48 py-8">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" />
                      </TableCell>
                    </TableRow>
                  ) : soldiers.map((soldier) => {
                    const sub = soldier.submissions?.[0];
                    return (
                      <TableRow key={soldier.id}>
                        <TableCell className="font-medium text-slate-900">{soldier.full_name}</TableCell>
                        <TableCell className="text-slate-500">{soldier.unit}</TableCell>
                        <TableCell>
                          {!soldier.is_completed ? (
                             <span className="text-xs text-slate-400 px-2.5 py-1 bg-slate-100 rounded-full font-medium">Chờ làm bài</span>
                          ) : sub ? (
                             renderBadge(sub.ai_status)
                          ) : (
                             <span className="text-xs text-slate-400">Lỗi phân tích</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                             {!soldier.is_completed && (
                               <Button variant="ghost" size="sm" onClick={() => copyToClipboard(soldier.token)} className="text-slate-500">
                                  <ClipboardCopy className="w-4 h-4" />
                               </Button>
                             )}
                             {soldier.is_completed && sub && (
                               <Button variant="outline" size="sm" className="bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100" onClick={() => openDetails(soldier)}>
                                  Xem phân tích
                               </Button>
                             )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              Hồ Sơ Tư Tưởng: <span className="text-blue-600">{selectedSoldier?.full_name}</span>
            </DialogTitle>
            <DialogDescription>
              Đơn vị: {selectedSoldier?.unit}
            </DialogDescription>
          </DialogHeader>
          
          {selectedSoldier?.submissions?.[0] && (
            <div className="space-y-6 pt-4">
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-slate-50 p-4 rounded-lg flex flex-col justify-center items-center border">
                    <span className="text-sm border-b pb-1 mb-2 font-medium text-slate-500 w-full text-center">Trạng thái</span>
                    <div className="text-xl font-bold">
                       {renderBadge(selectedSoldier.submissions[0].ai_status)}
                    </div>
                 </div>
                 <div className="bg-slate-50 p-4 rounded-lg flex flex-col justify-center items-center border">
                    <span className="text-sm border-b pb-1 mb-2 font-medium text-slate-500 w-full text-center">Tâm lý (Điểm)</span>
                    <span className="text-3xl font-black text-slate-800">{selectedSoldier.submissions[0].ai_score}<span className="text-base font-medium text-slate-400">/100</span></span>
                 </div>
              </div>

              <div>
                 <h4 className="font-semibold text-slate-900 mb-2 border-l-4 border-blue-500 pl-2">AI Nhận Xét Tổng Quan</h4>
                 <p className="text-slate-700 bg-blue-50/50 p-4 rounded-lg border border-blue-100 text-sm leading-relaxed">
                   {selectedSoldier.submissions[0].ai_summary}
                 </p>
              </div>

              <div>
                 <h4 className="font-semibold text-slate-900 mb-2 border-l-4 border-amber-500 pl-2">Lời Khuyên Cho Chỉ Huy</h4>
                 <p className="text-slate-700 bg-amber-50/50 p-4 rounded-lg border border-amber-100 text-sm leading-relaxed">
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

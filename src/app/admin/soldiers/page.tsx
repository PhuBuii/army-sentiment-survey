"use client";

import React, { useState, useEffect, useCallback } from "react";
import { read, utils } from "xlsx";
import ExcelJS from "exceljs";
import QRCode from "qrcode";
import { toast, Id } from "react-toastify";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { createClient } from "@/utils/supabase/client";
import { updateSubmissionStatus, createSoldier, updateSoldier, deleteSoldiers, resetSoldierSurvey } from "@/app/actions/admin-actions";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ExcelUploadDialog } from "@/components/ui/ExcelUploadDialog";
import {
  ClipboardCopy, Loader2, Upload, UsersRound, Eye, MessageSquare, QrCode,
  Brain, Edit2, CheckCircle2, ChevronDown, FileText, UserPlus, Trash2, X, Search, Filter, RotateCcw
} from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { useSearchParams } from "next/navigation";

type Submission = {
  id: string;
  ai_score: number;
  ai_status: string;
  ai_summary: string;
  ai_advice: string;
  admin_note?: string;
  created_at: string;
  responses: { question: string; answer: string }[];
};

type Soldier = {
  id: string;
  full_name: string;
  unit: string;
  token: string;
  is_completed: boolean;
  submissions?: Submission[];
};

const STATUS_OPTIONS = ["An tâm", "Dao động", "Nguy cơ"] as const;
type Status = (typeof STATUS_OPTIONS)[number];

const statusColor: Record<Status, string> = {
  "An tâm":   "bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border dark:border-emerald-500/50",
  "Dao động": "bg-amber-500 hover:bg-amber-600 dark:bg-amber-500/20 dark:text-amber-400 dark:border dark:border-amber-500/50",
  "Nguy cơ":  "bg-red-500 hover:bg-red-600 dark:bg-red-500/20 dark:text-red-400 dark:border dark:border-red-500/50",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge className={`text-xs text-white font-semibold ${statusColor[status as Status] ?? "bg-slate-400"}`}>
      {status}
    </Badge>
  );
}

function SoldiersContent() {
  const [soldiers, setSoldiers] = useState<Soldier[]>([]);
  const [loading, setLoading]   = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [selected, setSelected]     = useState<Soldier | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Soldier | null>(null);
  const [editName, setEditName] = useState("");
  const [editUnit, setEditUnit] = useState("");
  const [savingSoldier, setSavingSoldier] = useState(false);

  const [editingStatus, setEditingStatus] = useState(false);
  const [newStatus, setNewStatus]         = useState<Status>("An tâm");
  const [newScore, setNewScore]           = useState<number>(0);
  const [newAdminNote, setNewAdminNote]   = useState("");
  const [saving, setSaving]               = useState(false);
  const [saveMsg, setSaveMsg]             = useState("");

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "An tâm" | "Dao động" | "Nguy cơ">("all");

  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const ITEMS_PER_PAGE = 10;

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("soldiers")
        .select("*, submissions(*)")
        .order("created_at", { ascending: false });
      if (error) { console.error(error); setSoldiers([]); }
      else setSoldiers((data as Soldier[]) || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Client-side filtering
  const filteredSoldiers = soldiers.filter(s => {
    const matchesSearch = searchQuery.trim() === "" ||
      s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.unit.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = (() => {
      if (statusFilter === "all") return true;
      if (statusFilter === "pending") return !s.is_completed;
      if (!s.is_completed) return false;
      return s.submissions?.[0]?.ai_status === statusFilter;
    })();
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredSoldiers.length / ITEMS_PER_PAGE);
  const paginatedSoldiers = filteredSoldiers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const sub = selected?.submissions?.[0];

  const openDetail = (soldier: Soldier) => {
    setSelected(soldier);
    const sub = soldier.submissions?.[0];
    setNewStatus((sub?.ai_status as Status) ?? "An tâm");
    setNewScore(sub?.ai_score ?? 0);
    setNewAdminNote(sub?.admin_note ?? "");
    setEditingStatus(false);
    setSaveMsg("");
    setDialogOpen(true);
  };

  const handleSaveStatus = async () => {
    const sub = selected?.submissions?.[0];
    if (!sub) return;
    setSaving(true); setSaveMsg("");
    const res = await updateSubmissionStatus(sub.id, newStatus, newScore, newAdminNote);
    setSaving(false);
    if (res.error) setSaveMsg("❌ " + res.error);
    else {
      setSaveMsg("✅ Đã cập nhật!");
      setEditingStatus(false);
      await fetchData();
      setSelected(prev => {
        if (!prev) return prev;
        const updatedSubs = (prev.submissions ?? []).map(s =>
          s.id === sub.id ? { ...s, ai_status: newStatus, ai_score: newScore, admin_note: newAdminNote } : s
        );
        return { ...prev, submissions: updatedSubs };
      });
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      const data = await file.arrayBuffer();
      const wb = read(data);
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows: any[] = utils.sheet_to_json(sheet);
      const payload = rows.filter(r => r.full_name && r.unit).map(r => ({ full_name: r.full_name, unit: r.unit }));
      if (payload.length > 0) {
        const supabase = createClient();
        const { error } = await supabase.from("soldiers").insert(payload);
        if (error) throw error;
        toast.success(`Đã thêm ${payload.length} chiến sĩ.`);
        fetchData();
        setUploadDialogOpen(false);
      } else {
        toast.error("File sai định dạng (cần cột full_name và unit).");
      }
    } catch { toast.error("Lỗi upload, thử lại."); }
    finally { setUploading(false); }
  };

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/survey/${token}`;
    navigator.clipboard.writeText(url);
    toast.success(`Đã sao chép link! ${url}`);
  };

  const handleCreateOrUpdateSoldier = async () => {
    if (!editName || !editUnit) return;
    setSavingSoldier(true);
    const res = editTarget
      ? await updateSoldier(editTarget.id, editName, editUnit)
      : await createSoldier(editName, editUnit);
    setSavingSoldier(false);
    if (res.error) toast.error("Lỗi: " + res.error);
    else { setEditDialogOpen(false); fetchData(); }
  };

  const openEditDialog = (soldier?: Soldier) => {
    if (soldier) { setEditTarget(soldier); setEditName(soldier.full_name); setEditUnit(soldier.unit); }
    else { setEditTarget(null); setEditName(""); setEditUnit(""); }
    setEditDialogOpen(true);
  };

  const toggleSelectAll = () => {
    setSelectedIds(selectedIds.length === paginatedSoldiers.length ? [] : paginatedSoldiers.map(s => s.id));
  };
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleActualDelete = async () => {
    setIsDeleting(true);
    const res = await deleteSoldiers(selectedIds);
    setIsDeleting(false);
    setIsConfirmOpen(false);
    if (res.error) toast.error("Lỗi: " + res.error);
    else { toast.success("Đã xoá thành công"); setSelectedIds([]); fetchData(); }
  };
  
  const handleResetSurvey = async () => {
    if (!selected) return;
    setIsResetting(true);
    const res = await resetSoldierSurvey(selected.id);
    setIsResetting(false);
    setIsResetConfirmOpen(false);
    if (res.error) toast.error("Lỗi: " + res.error);
    else {
      toast.success("Đã reset trạng thái khảo sát.");
      setDialogOpen(false);
      fetchData();
    }
  };

  const handleExportQRExcel = async () => {
    const pendingList = soldiers.filter(s => !s.is_completed);
    if (pendingList.length === 0) { toast.warn("Tất cả chiến sĩ đã nộp bài."); return; }
    const toastId: Id = toast.loading(`Đang tạo QR cho ${pendingList.length} chiến sĩ...`);
    try {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("DS Khao Sat", { views: [{ state: 'frozen', ySplit: 1 }] });
      sheet.columns = [
        { header: "STT", key: "stt", width: 8 },
        { header: "Họ và Tên", key: "name", width: 30 },
        { header: "Đơn vị", key: "unit", width: 35 },
        { header: "Mã QR", key: "qr", width: 20 },
        { header: "Link dự phòng", key: "link", width: 50 },
      ];
      sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
      sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: "FF0EA5E9" } };
      sheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
      sheet.getRow(1).height = 30;
      for (let i = 0; i < pendingList.length; i++) {
        const s = pendingList[i];
        const link = `${window.location.origin}/survey/${s.token}`;
        const row = sheet.addRow({ stt: i + 1, name: s.full_name, unit: s.unit, link });
        row.height = 110;
        row.alignment = { vertical: 'middle', wrapText: true };
        const qrBase64 = await QRCode.toDataURL(link, { width: 140, margin: 1 });
        const imageId = workbook.addImage({ base64: qrBase64, extension: 'png' });
        sheet.addImage(imageId, { tl: { col: 3, row: i + 1 }, ext: { width: 130, height: 130 } });
      }
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url;
      a.download = `QR_KhaoSat_${new Date().toISOString().slice(0,10)}.xlsx`;
      a.click(); URL.revokeObjectURL(url);
      toast.update(toastId, { render: "Xuất file Excel thành công!", type: "success", isLoading: false, autoClose: 3000 });
    } catch (err) { console.error(err); toast.update(toastId, { render: "Lỗi tạo Excel.", type: "error", isLoading: false, autoClose: 3000 }); }
  };

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UsersRound size={20} className="text-blue-500" /> Hồ Sơ Quân Nhân
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Quản lý danh sách, xem chi tiết và điều chỉnh kết quả AI.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {selectedIds.length > 0 && (
            <Button variant="destructive" size="sm" onClick={() => setIsConfirmOpen(true)} className="h-9 rounded-xl gap-1.5">
              <Trash2 className="w-3.5 h-3.5" /> Xoá ({selectedIds.length})
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => openEditDialog()}
            className="h-9 rounded-xl bg-white dark:bg-transparent border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 gap-1.5">
            <UserPlus className="w-3.5 h-3.5" /> Thêm mới
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportQRExcel}
            className="h-9 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 gap-1.5">
            <QrCode className="w-3.5 h-3.5" /> Xuất QR
          </Button>
          <Button size="sm" onClick={() => setUploadDialogOpen(true)} disabled={uploading}
            className="h-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white gap-1.5">
            {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            Import Excel
          </Button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Tìm tên hoặc đơn vị..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-4 text-sm bg-white dark:bg-[#161b22] border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-slate-200 placeholder:text-slate-400 outline-none focus:border-blue-500 transition-colors"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}
            className="h-9 pl-9 pr-8 text-sm bg-white dark:bg-[#161b22] border border-slate-200 dark:border-white/10 rounded-xl text-slate-700 dark:text-slate-300 outline-none appearance-none cursor-pointer"
          >
            <option value="all">Tất cả</option>
            <option value="pending">⏳ Chờ làm bài</option>
            <option value="An tâm">✅ An tâm</option>
            <option value="Dao động">⚠️ Dao động</option>
            <option value="Nguy cơ">🔴 Nguy cơ</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <Card className="shadow-sm border-slate-200 dark:border-white/8 bg-white dark:bg-[#161b22] overflow-hidden">
        <CardHeader className="bg-slate-50/80 dark:bg-white/[0.03] border-b border-slate-100 dark:border-white/8 py-3 px-4">
          <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-400 flex items-center justify-between">
            <span>{filteredSoldiers.length} / {soldiers.length} chiến sĩ</span>
            {(searchQuery || statusFilter !== "all") && (
              <button onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
                className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1">
                <X className="w-3 h-3" /> Bỏ lọc
              </button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[640px]">
              <TableHeader>
                <TableRow className="bg-slate-50/50 dark:bg-white/[0.02] border-slate-100 dark:border-white/8 hover:bg-transparent dark:hover:bg-transparent">
                  <TableHead className="w-10 py-3">
                    <Checkbox checked={selectedIds.length > 0 && selectedIds.length === paginatedSoldiers.length} onCheckedChange={toggleSelectAll} />
                  </TableHead>
                  <TableHead className="w-10 text-center py-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">#</TableHead>
                  <TableHead className="py-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Họ tên</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Đơn vị</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Trạng thái</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Điểm</TableHead>
                  <TableHead className="text-right text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-40 text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500" />
                    </TableCell>
                  </TableRow>
                ) : paginatedSoldiers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-40 text-center text-sm text-slate-400 dark:text-slate-500">
                      Không tìm thấy kết quả.
                    </TableCell>
                  </TableRow>
                ) : paginatedSoldiers.map((s, idx) => {
                  const sub = s.submissions?.[0];
                  return (
                    <TableRow key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.03] border-slate-100 dark:border-white/8">
                      <TableCell className="py-3">
                        <Checkbox checked={selectedIds.includes(s.id)} onCheckedChange={() => toggleSelect(s.id)} />
                      </TableCell>
                      <TableCell className="text-center font-mono text-xs text-slate-400 py-3">
                        {(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                      </TableCell>
                      <TableCell className="font-medium text-slate-900 dark:text-slate-100 text-sm py-3 whitespace-nowrap">{s.full_name}</TableCell>
                      <TableCell className="text-slate-500 dark:text-slate-400 text-xs max-w-[180px] truncate py-3" title={s.unit}>{s.unit}</TableCell>
                      <TableCell className="py-3">
                        {!s.is_completed
                          ? <span className="text-xs text-slate-400 dark:text-slate-500 px-2 py-0.5 bg-slate-100 dark:bg-white/5 rounded-full">Chờ làm bài</span>
                          : sub ? <StatusBadge status={sub.ai_status} /> : <span className="text-slate-300">—</span>
                        }
                      </TableCell>
                      <TableCell className="font-mono text-sm text-slate-600 dark:text-slate-300 py-3">
                        {sub ? `${sub.ai_score}/100` : "—"}
                      </TableCell>
                      <TableCell className="text-right py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(s)} className="h-8 w-8 text-slate-400 hover:text-blue-500 rounded-lg">
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          {s.is_completed ? (
                            <Button variant="outline" size="sm" onClick={() => openDetail(s)}
                              className="h-8 text-xs rounded-lg bg-white dark:bg-transparent border-slate-200 dark:border-white/10 gap-1">
                              <Eye className="w-3 h-3" /> Xem
                            </Button>
                          ) : (
                            <Button variant="ghost" size="sm" onClick={() => copyLink(s.token)}
                              className="h-8 text-xs text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 gap-1">
                              <ClipboardCopy className="w-3 h-3" /> Link
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

      {!loading && totalPages >= 1 && <Pagination totalPages={totalPages} />}

      {/* Add/Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md w-[96vw] rounded-2xl bg-white dark:bg-[#161b22] dark:border-white/10">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-blue-500" /> {editTarget ? "Sửa thông tin" : "Thêm chiến sĩ"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              {editTarget ? `Đang sửa: ${editTarget.full_name}` : "Tạo hồ sơ chiến sĩ mới"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Họ tên</Label>
              <Input placeholder="Nguyễn Văn A" value={editName} onChange={e => setEditName(e.target.value)}
                className="h-10 text-sm rounded-xl bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Đơn vị</Label>
              <Input placeholder="Đại đội 1" value={editUnit} onChange={e => setEditUnit(e.target.value)}
                className="h-10 text-sm rounded-xl bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10" />
            </div>
            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1 h-10 rounded-xl dark:border-white/10" onClick={() => setEditDialogOpen(false)}>Huỷ</Button>
              <Button className="flex-1 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
                onClick={handleCreateOrUpdateSoldier} disabled={savingSoldier || !editName || !editUnit}>
                {savingSoldier ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                {editTarget ? "Cập nhật" : "Lưu"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl w-[96vw] rounded-2xl bg-white dark:bg-[#161b22] dark:border-white/10 overflow-hidden p-0 gap-0">
          <DialogHeader className="px-6 pt-5 pb-4 border-b border-slate-100 dark:border-white/8 bg-slate-50/60 dark:bg-white/[0.02] text-left">
            <DialogTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UsersRound className="w-4 h-4 text-blue-500 shrink-0" />
              {selected?.full_name}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400 mt-0.5">{selected?.unit}</DialogDescription>
          </DialogHeader>

          {sub ? (
            <div className="max-h-[72vh] overflow-y-auto">
              {/* Score & Status */}
              <div className="grid grid-cols-2 gap-3 p-5 border-b border-slate-100 dark:border-white/8">
                <div className="bg-slate-50 dark:bg-white/[0.04] rounded-xl p-4 flex flex-col items-center border border-slate-100 dark:border-white/8">
                  <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mb-2">Điểm tâm lý</span>
                  <span className="text-4xl font-black text-slate-800 dark:text-white">
                    {editingStatus ? (
                      <input type="number" min={0} max={100} value={newScore} onChange={e => setNewScore(Number(e.target.value))}
                        className="w-20 text-center text-3xl font-black bg-transparent border-b-2 border-emerald-400 outline-none text-slate-800 dark:text-white" />
                    ) : sub.ai_score}
                    <span className="text-sm font-medium text-slate-400">/100</span>
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-white/[0.04] rounded-xl p-4 flex flex-col items-center border border-slate-100 dark:border-white/8">
                  <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mb-3">Phân loại AI</span>
                  {editingStatus ? (
                    <div className="flex flex-col gap-1.5 w-full">
                      {STATUS_OPTIONS.map(s => (
                        <button key={s} onClick={() => setNewStatus(s)}
                          className={`text-sm py-1 rounded-lg border font-semibold transition-colors ${newStatus === s ? "bg-emerald-500 dark:bg-emerald-500 text-white border-transparent" : "border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  ) : <StatusBadge status={sub.ai_status} />}
                </div>
              </div>

              {/* Edit bar */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-white/8 bg-slate-50/30 dark:bg-white/[0.01]">
                {saveMsg && <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{saveMsg}</span>}
                <div className="flex gap-2 ml-auto">
                  {editingStatus ? (
                    <>
                      <Button size="sm" variant="outline" onClick={() => { setEditingStatus(false); setSaveMsg(""); }}
                        className="h-8 text-xs rounded-lg border-slate-200 dark:border-white/10">Huỷ</Button>
                      <Button size="sm" onClick={handleSaveStatus} disabled={saving}
                        className="h-8 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:text-[#0a0e14] text-white gap-1">
                        {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                        Lưu
                      </Button>
                    </>
                  ) : (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setIsResetConfirmOpen(true)}
                        className="h-8 text-xs rounded-lg border-red-200 text-red-600 hover:bg-red-50 dark:border-red-500/20 dark:text-red-400 dark:hover:bg-red-500/10 gap-1">
                        <RotateCcw className="w-3 h-3" /> Khảo sát lại
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingStatus(true)}
                        className="h-8 text-xs rounded-lg border-slate-200 dark:border-white/10 gap-1">
                        <Edit2 className="w-3 h-3" /> Sửa phân loại
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* AI Summary */}
              <div className="px-5 py-4 space-y-4 border-b border-slate-100 dark:border-white/8">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Brain className="w-3.5 h-3.5 text-emerald-500" /> AI Nhận xét
                  </h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300 bg-emerald-50 dark:bg-emerald-500/8 rounded-xl p-4 border border-emerald-100 dark:border-emerald-500/15 leading-relaxed">
                    {sub.ai_summary}
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ChevronDown className="w-3.5 h-3.5 text-amber-500" /> Lời khuyên
                  </h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300 bg-amber-50 dark:bg-amber-500/8 rounded-xl p-4 border border-amber-100 dark:border-amber-500/15 leading-relaxed">
                    {sub.ai_advice}
                  </p>
                </div>
              </div>

              {/* Commander note */}
              <div className="px-5 py-4 border-b border-slate-100 dark:border-white/8">
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <FileText className="w-3.5 h-3.5 text-blue-500" /> Nhận xét Chỉ huy
                </h4>
                {editingStatus ? (
                  <textarea value={newAdminNote} onChange={e => setNewAdminNote(e.target.value)}
                    placeholder="Nhận xét của Chỉ huy..."
                    className="w-full h-20 p-3 text-sm bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:border-blue-500 text-slate-800 dark:text-slate-200 resize-none" />
                ) : (
                  <div className="text-sm text-slate-600 dark:text-slate-300 bg-white dark:bg-white/[0.03] rounded-xl p-3 border border-slate-100 dark:border-white/8 min-h-[60px]">
                    {sub.admin_note ? <p className="whitespace-pre-wrap">{sub.admin_note}</p>
                      : <em className="text-slate-400 dark:text-slate-600">Chưa có nhận xét.</em>}
                  </div>
                )}
              </div>

              {/* Q&A */}
              <div className="px-5 py-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-blue-500" /> Câu trả lời ({sub.responses?.length ?? 0})
                </h4>
                {(sub.responses ?? []).map((r, i) => (
                  <div key={i} className="rounded-xl border border-slate-100 dark:border-white/8 overflow-hidden">
                    <div className="px-4 py-2.5 bg-slate-50 dark:bg-white/[0.04] border-b border-slate-100 dark:border-white/8">
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Câu {i + 1}</p>
                      <p className="text-sm text-slate-700 dark:text-slate-200 mt-0.5 leading-snug">{r.question}</p>
                    </div>
                    <div className="px-4 py-3">
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider mb-1">Trả lời</p>
                      <p className="text-sm text-slate-800 dark:text-slate-100 leading-relaxed">{r.answer || <em className="text-slate-400">Không có</em>}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-sm">Không có dữ liệu khảo sát.</div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog isOpen={isConfirmOpen} onOpenChange={setIsConfirmOpen} onConfirm={handleActualDelete}
        isLoading={isDeleting} title="Xác nhận xoá"
        description={`Xoá ${selectedIds.length} chiến sĩ? Hành động này không thể hoàn tác.`}
        confirmText="Xoá" variant="danger" />

      <ConfirmDialog isOpen={isResetConfirmOpen} onOpenChange={setIsResetConfirmOpen} onConfirm={handleResetSurvey}
        isLoading={isResetting} title="Xác nhận reset khảo sát"
        description={`Bạn có chắc chắn muốn cho phép chiến sĩ ${selected?.full_name} làm lại khảo sát? Dữ liệu cũ sẽ bị xoá.`}
        confirmText="Xác nhận" variant="danger" />

      <ExcelUploadDialog isOpen={uploadDialogOpen} onOpenChange={setUploadDialogOpen} onUpload={handleFileUpload}
        isUploading={uploading} title="Import danh sách"
        description="Upload file Excel với cột full_name và unit."
        sampleFileName="mau_chien_si.xlsx" sampleFileUrl="/mau_chien_si.xlsx" />
    </div>
  );
}

export default function SoldiersPage() {
  return (
    <React.Suspense fallback={<div className="p-10 text-center"><Loader2 className="animate-spin mx-auto mb-2" /> Đang tải danh sách...</div>}>
      <SoldiersContent />
    </React.Suspense>
  );
}

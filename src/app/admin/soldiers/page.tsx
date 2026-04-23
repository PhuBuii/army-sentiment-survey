"use client";

import React, { useState, useEffect, useCallback } from "react";
import { read, utils } from "xlsx";
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
import { updateSubmissionStatus, createSoldier, updateSoldier, deleteSoldiers } from "@/app/actions/admin-actions";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ExcelUploadDialog } from "@/components/ui/ExcelUploadDialog";
import {
  ClipboardCopy, Loader2, Upload, UsersRound, Eye, MessageSquare,
  Brain, Edit2, CheckCircle2, ChevronDown, FileText, UserPlus, Trash2, X
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

export default function SoldiersPage() {
  const [soldiers, setSoldiers] = useState<Soldier[]>([]);
  const [loading, setLoading]   = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Detail Dialog
  const [selected, setSelected]     = useState<Soldier | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Edit/Create Dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Soldier | null>(null);
  const [editName, setEditName] = useState("");
  const [editUnit, setEditUnit] = useState("");
  const [savingSoldier, setSavingSoldier] = useState(false);

  // Edit status state
  const [editingStatus, setEditingStatus] = useState(false);
  const [newStatus, setNewStatus]         = useState<Status>("An tâm");
  const [newScore, setNewScore]           = useState<number>(0);
  const [newAdminNote, setNewAdminNote]   = useState("");
  const [saving, setSaving]               = useState(false);
  const [saveMsg, setSaveMsg]             = useState("");

  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const ITEMS_PER_PAGE = 10;

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("soldiers")
        .select("*, submissions(*)")
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Fetch data error:", error);
        setSoldiers([]);
      } else {
        setSoldiers((data as Soldier[]) || []);
      }
    } catch (err) {
      console.error("Unexpected error in fetchData:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalPages = Math.ceil(soldiers.length / ITEMS_PER_PAGE);
  const paginatedSoldiers = soldiers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
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
    setSaving(true);
    setSaveMsg("");
    const res = await updateSubmissionStatus(sub.id, newStatus, newScore, newAdminNote);
    setSaving(false);
    if (res.error) {
      setSaveMsg("❌ Lỗi: " + res.error);
    } else {
      setSaveMsg("✅ Đã cập nhật phân loại thành công!");
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
        alert(`Đã upload thành công ${payload.length} chiến sĩ.`);
        fetchData();
        setUploadDialogOpen(false);
      } else {
        alert("File không đúng định dạng (cần cột full_name và unit).");
      }
    } catch { alert("Lỗi upload, vui lòng thử lại."); }
    finally { setUploading(false); }
  };

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/survey/${token}`;
    navigator.clipboard.writeText(url);
    alert("Đã copy link khảo sát!");
  };

  const handleCreateOrUpdateSoldier = async () => {
    if (!editName || !editUnit) return;
    setSavingSoldier(true);
    let res;
    if (editTarget) {
      res = await updateSoldier(editTarget.id, editName, editUnit);
    } else {
      res = await createSoldier(editName, editUnit);
    }
    setSavingSoldier(false);
    if (res.error) {
      alert("Lỗi: " + res.error);
    } else {
      setEditDialogOpen(false);
      fetchData();
    }
  };

  const openEditDialog = (soldier?: Soldier) => {
    if (soldier) {
      setEditTarget(soldier);
      setEditName(soldier.full_name);
      setEditUnit(soldier.unit);
    } else {
      setEditTarget(null);
      setEditName("");
      setEditUnit("");
    }
    setEditDialogOpen(true);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedSoldiers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedSoldiers.map(s => s.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    setIsConfirmOpen(true);
  };

  const handleActualDelete = async () => {
    setIsDeleting(true);
    const res = await deleteSoldiers(selectedIds);
    setIsDeleting(false);
    setIsConfirmOpen(false);
    if (res.error) {
      alert("Lỗi: " + res.error);
    } else {
      setSelectedIds([]);
      fetchData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UsersRound className="text-blue-500" /> Hồ Sơ Quân Nhân
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Quản lý danh sách, xem chi tiết câu trả lời và điều chỉnh kết quả AI.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {selectedIds.length > 0 && (
            <Button variant="destructive" size="sm" onClick={handleDeleteSelected} className="flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> Xoá ({selectedIds.length})
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => openEditDialog()} className="bg-white dark:bg-transparent border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 dark:hover:bg-white/5 gap-2">
            <UserPlus className="w-4 h-4" /> Thêm Chiến sĩ
          </Button>
          <Button
            variant="default"
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 shadow-md transition-colors"
            onClick={() => setUploadDialogOpen(true)}
            disabled={uploading}
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Tạo danh sách từ Excel
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card className="shadow-sm border-slate-200 dark:border-white/10 dark:bg-[#0a0f08]/50 overflow-hidden">
        <CardHeader className="bg-slate-50/50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5 py-4">
          <CardTitle className="text-sm sm:text-base text-slate-900 dark:text-white">
            Toàn bộ Chiến sĩ ({soldiers.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[700px]">
              <TableHeader>
                <TableRow className="bg-slate-50/50 dark:bg-white/5 border-slate-100 dark:border-white/5">
                  <TableHead className="w-10">
                    <Checkbox checked={selectedIds.length > 0 && selectedIds.length === paginatedSoldiers.length} onCheckedChange={toggleSelectAll} />
                  </TableHead>
                  <TableHead className="w-12 text-center py-3">STT</TableHead>
                  <TableHead className="py-3">Họ và Tên</TableHead>
                  <TableHead>Đơn vị</TableHead>
                  <TableHead>Trạng thái AI</TableHead>
                  <TableHead>Điểm</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-48 text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" />
                    </TableCell>
                  </TableRow>
                ) : paginatedSoldiers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-48 text-center text-slate-400 dark:text-slate-500 text-sm">
                      Chưa có danh sách chiến sĩ.
                    </TableCell>
                  </TableRow>
                ) : paginatedSoldiers.map((s, idx) => {
                  const sub = s.submissions?.[0];
                  return (
                    <TableRow key={s.id} className="hover:bg-slate-50 dark:hover:bg-white/5 border-slate-100 dark:border-white/5">
                      <TableCell>
                        <Checkbox checked={selectedIds.includes(s.id)} onCheckedChange={() => toggleSelect(s.id)} />
                      </TableCell>
                      <TableCell className="text-center font-medium text-slate-500 text-xs">
                        {(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                      </TableCell>
                      <TableCell className="font-medium text-slate-900 dark:text-slate-200 text-sm whitespace-nowrap">{s.full_name}</TableCell>
                      <TableCell className="text-slate-500 dark:text-slate-400 text-sm max-w-[200px] truncate" title={s.unit}>{s.unit}</TableCell>
                      <TableCell>
                        {!s.is_completed
                          ? <span className="text-xs text-slate-500 dark:text-slate-400 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700">Chờ làm bài</span>
                          : sub ? <StatusBadge status={sub.ai_status} /> : <span className="text-xs text-slate-400">—</span>
                        }
                      </TableCell>
                      <TableCell className="font-mono text-sm text-slate-600 dark:text-slate-300">
                        {sub ? `${sub.ai_score}/100` : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(s)} className="h-8 w-8 text-slate-400 hover:text-blue-500">
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          {s.is_completed ? (
                            <Button variant="outline" size="sm" onClick={() => openDetail(s)}
                              className="h-8 text-xs bg-white dark:bg-transparent border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 dark:hover:bg-white/5 gap-1.5 px-3">
                              <Eye className="w-3.5 h-3.5" /> Chi tiết
                            </Button>
                          ) : (
                            <Button variant="ghost" size="sm" onClick={() => copyLink(s.token)}
                              className="h-8 text-xs text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 gap-1.5 px-3">
                              <ClipboardCopy className="w-3.5 h-3.5" /> Link
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

      {!loading && totalPages >= 1 && (
        <Pagination totalPages={totalPages} />
      )}

      {/* ── Add/Edit Soldier Dialog ── */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md w-[96vw] rounded-2xl dark:bg-[#0d1109] dark:border-white/10">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-500" /> {editTarget ? "Sửa thông tin" : "Thêm Chiến sĩ"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400 mt-1">
              Nhập thông tin cá nhân của quân nhân để tạo hồ sơ hoặc cập nhật.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Họ và Tên</Label>
              <Input
                placeholder="VD: Nguyễn Văn A"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="h-10 text-sm bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Đơn vị</Label>
              <Input
                placeholder="VD: Đại đội 1, Tiểu đoàn 2"
                value={editUnit}
                onChange={e => setEditUnit(e.target.value)}
                className="h-10 text-sm bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1 dark:border-white/10" onClick={() => setEditDialogOpen(false)}>Huỷ</Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white gap-2"
                onClick={handleCreateOrUpdateSoldier}
                disabled={savingSoldier || !editName || !editUnit}
              >
                {savingSoldier ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {editTarget ? "Cập nhật" : "Lưu hồ sơ"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Detail Dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl w-[96vw] rounded-2xl dark:bg-[#0d1109] dark:border-white/10 overflow-hidden p-0 gap-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-white/10 bg-slate-50/60 dark:bg-[#1a2315]/40 text-left">
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
              <UsersRound className="w-5 h-5 text-blue-500 shrink-0" />
              Hồ Sơ Tư Tưởng — {selected?.full_name}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              {selected?.unit}
            </DialogDescription>
          </DialogHeader>

          {sub ? (
            <div className="max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 p-6 border-b border-slate-100 dark:border-white/8">
                <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-4 flex flex-col items-center border border-slate-100 dark:border-white/8">
                  <span className="text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 font-semibold mb-2">Điểm tâm lý</span>
                  <span className="text-4xl font-black text-slate-800 dark:text-white">
                    {editingStatus ? (
                      <input
                        type="number" min={0} max={100}
                        value={newScore}
                        onChange={e => setNewScore(Number(e.target.value))}
                        className="w-20 text-center text-3xl font-black bg-transparent border-b-2 border-emerald-400 dark:border-[#a3e635] outline-none text-slate-800 dark:text-white"
                      />
                    ) : sub.ai_score}
                    <span className="text-base font-medium text-slate-400">/100</span>
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-4 flex flex-col items-center border border-slate-100 dark:border-white/8">
                  <span className="text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 font-semibold mb-3">Phân loại AI</span>
                  {editingStatus ? (
                    <div className="flex flex-col gap-2 w-full">
                      {STATUS_OPTIONS.map(s => (
                        <button key={s} onClick={() => setNewStatus(s)}
                          className={`text-sm py-1.5 rounded-lg border font-semibold transition-colors ${newStatus === s ? "bg-emerald-500 dark:bg-[#a3e635] text-white dark:text-[#0a0f08] border-transparent" : "border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <StatusBadge status={sub.ai_status} />
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100 dark:border-white/8 bg-slate-50/30 dark:bg-white/2">
                {saveMsg && <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{saveMsg}</span>}
                <div className="flex gap-2 ml-auto">
                  {editingStatus ? (
                    <>
                      <Button size="sm" variant="outline" onClick={() => { setEditingStatus(false); setSaveMsg(""); }}
                        className="h-8 text-xs border-slate-200 dark:border-white/10">
                        Huỷ
                      </Button>
                      <Button size="sm" onClick={handleSaveStatus} disabled={saving}
                        className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 dark:bg-[#a3e635] dark:text-[#0a0f08] dark:hover:bg-[#84cc16] text-white gap-1.5">
                        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        Lưu thay đổi
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => setEditingStatus(true)}
                      className="h-8 text-xs border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 gap-1.5">
                      <Edit2 className="w-3.5 h-3.5" /> Sửa phân loại
                    </Button>
                  )}
                </div>
              </div>

              <div className="px-6 py-5 space-y-4 border-b border-slate-100 dark:border-white/8">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-white flex items-center gap-2 text-left">
                    <Brain className="w-4 h-4 text-emerald-500" /> AI Nhận xét tổng quan
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl p-4 border border-emerald-100 dark:border-emerald-500/20 leading-relaxed text-left">
                    {sub.ai_summary}
                  </p>
                </div>
                <div className="space-y-2 text-left">
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                    <ChevronDown className="w-4 h-4 text-amber-500" /> Lời khuyên cho Chỉ huy
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300 bg-amber-50 dark:bg-amber-500/10 rounded-xl p-4 border border-amber-100 dark:border-amber-500/20 leading-relaxed">
                    {sub.ai_advice}
                  </p>
                </div>
              </div>

              <div className="px-6 py-5 border-b border-slate-100 dark:border-white/8 space-y-4">
                <div className="space-y-2 text-left">
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-500" /> Nhận xét của Chỉ huy
                  </h4>
                  {editingStatus ? (
                    <textarea
                      value={newAdminNote}
                      onChange={e => setNewAdminNote(e.target.value)}
                      placeholder="Ghi chú, nhận xét hoặc đánh giá thêm của Chỉ huy..."
                      className="w-full h-24 p-3 text-sm bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:border-blue-500 dark:focus:border-blue-500 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 resize-none font-sans"
                    />
                  ) : (
                    <div className="text-sm text-slate-600 dark:text-slate-300 bg-white dark:bg-white/2 rounded-xl p-4 border border-slate-200 dark:border-white/5 leading-relaxed min-h-[4rem]">
                      {sub.admin_note ? (
                        <p className="whitespace-pre-wrap">{sub.admin_note}</p>
                      ) : (
                        <em className="text-slate-400 dark:text-slate-500">Chưa có nhận xét. Nhấn "Sửa phân loại" để thêm.</em>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="px-6 py-5 space-y-3">
                <h4 className="text-sm font-semibold text-slate-800 dark:text-white flex items-center gap-2 mb-4 text-left">
                  <MessageSquare className="w-4 h-4 text-blue-500" />
                  Chi tiết Câu hỏi & Câu trả lời ({sub.responses?.length ?? 0} câu)
                </h4>
                {(sub.responses ?? []).map((r, i) => (
                  <div key={i} className="rounded-xl border border-slate-100 dark:border-white/8 bg-slate-50/60 dark:bg-white/3 overflow-hidden text-left">
                    <div className="px-4 py-2.5 bg-slate-100/60 dark:bg-white/5 border-b border-slate-100 dark:border-white/8">
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                        Câu hỏi {i + 1}
                      </p>
                      <p className="text-sm text-slate-700 dark:text-slate-200 mt-0.5 leading-snug">{r.question}</p>
                    </div>
                    <div className="px-4 py-3">
                      <p className="text-xs text-emerald-600 dark:text-[#a3e635] font-semibold uppercase tracking-wider mb-1">Câu trả lời</p>
                      <p className="text-sm text-slate-800 dark:text-slate-100 leading-relaxed font-sans">{r.answer || <em className="text-slate-400">Không có câu trả lời</em>}</p>
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

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        onConfirm={handleActualDelete}
        isLoading={isDeleting}
        title="Xác nhận xoá chiến sĩ"
        description={`Đồng chí có chắc chắn muốn xoá ${selectedIds.length} chiến sĩ này khỏi danh sách? Hành động này không thể hoàn tác.`}
        confirmText="Xoá vĩnh viễn"
        variant="danger"
      />

      <ExcelUploadDialog
        isOpen={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onUpload={handleFileUpload}
        isUploading={uploading}
        title="Tải lên danh sách quân nhân"
        description="Kéo thả tập tin Excel chứa hồ sơ quân nhân để thêm hàng loạt vào hệ thống."
        sampleFileName="mau_chien_si.xlsx"
        sampleFileUrl="/mau_chien_si.xlsx"
      />
    </div>
  );
}

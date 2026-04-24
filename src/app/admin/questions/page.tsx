"use client";

import React, { useState, useEffect, useCallback } from "react";
import { read, utils } from "xlsx";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { createClient } from "@/utils/supabase/client";
import { createQuestion, updateQuestion, deleteQuestions } from "@/app/actions/admin-actions";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ExcelUploadDialog } from "@/components/ui/ExcelUploadDialog";
import { Loader2, Upload, HelpCircle, Plus, Trash2, Edit2, CheckCircle2 } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { useSearchParams } from "next/navigation";

type Question = { id: string; content: string; created_at: string };

export default function QuestionsPage() {
  const [questions, setQuestions]     = useState<Question[]>([]);
  const [loading, setLoading]         = useState(true);
  const [uploading, setUploading]     = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editTarget, setEditTarget]         = useState<Question | null>(null);
  const [editContent, setEditContent]       = useState("");
  const [savingQuestion, setSavingQuestion] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen]   = useState(false);
  const [isDeleting, setIsDeleting]         = useState(false);

  const searchParams  = useSearchParams();
  const currentPage   = parseInt(searchParams.get("page") || "1", 10);
  const ITEMS_PER_PAGE = 10;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("questions").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      setQuestions(data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalPages         = Math.ceil(questions.length / ITEMS_PER_PAGE);
  const paginatedQuestions = questions.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      const data = await file.arrayBuffer();
      const wb = read(data);
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows: any[] = utils.sheet_to_json(sheet);
      const payload = rows.filter(r => r.content).map(r => ({ content: r.content }));
      if (payload.length > 0) {
        const supabase = createClient();
        const { error } = await supabase.from("questions").insert(payload);
        if (error) throw error;
        alert(`Đã thêm ${payload.length} câu hỏi.`);
        fetchData();
        setUploadDialogOpen(false);
      } else {
        alert("File sai định dạng — cần cột content.");
      }
    } catch { alert("Lỗi upload."); }
    finally { setUploading(false); }
  };

  const handleCreateOrUpdateQuestion = async () => {
    if (!editContent) return;
    setSavingQuestion(true);
    const res = editTarget ? await updateQuestion(editTarget.id, editContent) : await createQuestion(editContent);
    setSavingQuestion(false);
    if (res.error) alert("Lỗi: " + res.error);
    else { setEditDialogOpen(false); fetchData(); }
  };

  const openEditDialog = (question?: Question) => {
    setEditTarget(question ?? null);
    setEditContent(question?.content ?? "");
    setEditDialogOpen(true);
  };

  const toggleSelectAll = () => {
    setSelectedIds(selectedIds.length === paginatedQuestions.length ? [] : paginatedQuestions.map(q => q.id));
  };
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleActualDelete = async () => {
    setIsDeleting(true);
    const res = await deleteQuestions(selectedIds);
    setIsDeleting(false);
    setIsConfirmOpen(false);
    if (res.error) alert("Lỗi: " + res.error);
    else { setSelectedIds([]); fetchData(); }
  };

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <HelpCircle size={20} className="text-amber-500" /> Ngân Hàng Câu Hỏi
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Quản lý câu hỏi trắc nghiệm tâm lý trong hệ thống.
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
            <Plus className="w-3.5 h-3.5" /> Thêm mới
          </Button>
          <Button size="sm" onClick={() => setUploadDialogOpen(true)} disabled={uploading}
            className="h-9 rounded-xl bg-amber-500 hover:bg-amber-600 text-white gap-1.5">
            {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            Import Excel
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card className="shadow-sm border-slate-200 dark:border-white/8 bg-white dark:bg-[#161b22] overflow-hidden">
        <CardHeader className="bg-slate-50/80 dark:bg-white/[0.03] border-b border-slate-100 dark:border-white/8 py-3 px-4">
          <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            {questions.length} câu hỏi
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[500px]">
              <TableHeader>
                <TableRow className="bg-slate-50/50 dark:bg-white/[0.02] border-slate-100 dark:border-white/8 hover:bg-transparent dark:hover:bg-transparent text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  <TableHead className="w-10 py-3">
                    <Checkbox checked={selectedIds.length > 0 && selectedIds.length === paginatedQuestions.length} onCheckedChange={toggleSelectAll} />
                  </TableHead>
                  <TableHead className="w-12 text-center py-3">#</TableHead>
                  <TableHead className="py-3 min-w-[200px]">Nội dung câu hỏi</TableHead>
                  <TableHead className="w-32 text-right py-3 whitespace-nowrap">Ngày thêm</TableHead>
                  <TableHead className="w-16 text-right py-3">Sửa</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-40 text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-amber-500" />
                    </TableCell>
                  </TableRow>
                ) : paginatedQuestions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-40 text-center text-sm text-slate-400 dark:text-slate-500">
                      Chưa có câu hỏi. Hãy thêm mới hoặc import Excel.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedQuestions.map((q, idx) => (
                    <TableRow key={q.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.03] border-slate-100 dark:border-white/8">
                      <TableCell className="py-3">
                        <Checkbox checked={selectedIds.includes(q.id)} onCheckedChange={() => toggleSelect(q.id)} />
                      </TableCell>
                      <TableCell className="text-center font-mono text-xs text-slate-400 py-3">
                        {(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                      </TableCell>
                      <TableCell className="py-4 text-slate-800 dark:text-slate-200 text-sm leading-relaxed whitespace-normal break-words">
                        {q.content}
                      </TableCell>
                      <TableCell className="text-right text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap py-3 w-32">
                        {new Date(q.created_at).toLocaleDateString("vi-VN")}
                      </TableCell>
                      <TableCell className="py-3 text-right w-16">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(q)}
                          className="h-8 w-8 text-slate-400 hover:text-amber-500 rounded-lg">
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
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
              {editTarget ? <Edit2 className="w-4 h-4 text-amber-500" /> : <Plus className="w-4 h-4 text-amber-500" />}
              {editTarget ? "Sửa câu hỏi" : "Thêm câu hỏi"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              {editTarget ? "Chỉnh sửa nội dung câu hỏi." : "Nhập nội dung câu hỏi trắc nghiệm mới."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nội dung</Label>
              <textarea
                placeholder="VD: Bạn cảm thấy thế nào sau buổi huấn luyện?"
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                className="w-full h-28 p-3 text-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:border-amber-500 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 resize-none"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 h-10 rounded-xl dark:border-white/10" onClick={() => setEditDialogOpen(false)}>Huỷ</Button>
              <Button className="flex-1 h-10 rounded-xl bg-amber-500 hover:bg-amber-600 text-white gap-1.5"
                onClick={handleCreateOrUpdateQuestion} disabled={savingQuestion || !editContent}>
                {savingQuestion ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                {editTarget ? "Cập nhật" : "Lưu"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog isOpen={isConfirmOpen} onOpenChange={setIsConfirmOpen} onConfirm={handleActualDelete}
        isLoading={isDeleting} title="Xác nhận xoá"
        description={`Xoá ${selectedIds.length} câu hỏi? Không thể hoàn tác.`}
        confirmText="Xoá" variant="danger" />

      <ExcelUploadDialog isOpen={uploadDialogOpen} onOpenChange={setUploadDialogOpen} onUpload={handleFileUpload}
        isUploading={uploading} title="Import câu hỏi"
        description="Upload file Excel với cột content."
        sampleFileName="mau_cau_hoi.xlsx" sampleFileUrl="/mau_cau_hoi.xlsx" />
    </div>
  );
}

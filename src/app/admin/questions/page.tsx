"use client";

import React, { useState, useEffect, useCallback } from "react";
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

type Question = {
  id: string;
  content: string;
  created_at: string;
};

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Edit/Create Dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Question | null>(null);
  const [editContent, setEditContent] = useState("");
  const [savingQuestion, setSavingQuestion] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const ITEMS_PER_PAGE = 10;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalPages = Math.ceil(questions.length / ITEMS_PER_PAGE);
  const paginatedQuestions = questions.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = read(data);
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData: any[] = utils.sheet_to_json(firstSheet);
      const payload = jsonData.filter(r => r.content).map(r => ({ content: r.content }));
      if (payload.length > 0) {
        const supabase = createClient();
        const { error } = await supabase.from('questions').insert(payload);
        if (error) throw error;
        alert(`Đã upload thành công ${payload.length} câu hỏi vào ngân hàng.`);
        fetchData();
        setUploadDialogOpen(false);
      } else {
         alert("File Excel không đúng định dạng (thiếu cột content).");
      }
    } catch (error) {
      console.error(`Upload error:`, error);
      alert(`Đã xảy ra lỗi khi upload file câu hỏi.`);
    } finally {
      setUploading(false);
    }
  };

  const handleCreateOrUpdateQuestion = async () => {
    if (!editContent) return;
    setSavingQuestion(true);
    let res;
    if (editTarget) {
      res = await updateQuestion(editTarget.id, editContent);
    } else {
      res = await createQuestion(editContent);
    }
    setSavingQuestion(false);
    if (res.error) {
      alert("Lỗi: " + res.error);
    } else {
      setEditDialogOpen(false);
      fetchData();
    }
  };

  const openEditDialog = (question?: Question) => {
    if (question) {
      setEditTarget(question);
      setEditContent(question.content);
    } else {
      setEditTarget(null);
      setEditContent("");
    }
    setEditDialogOpen(true);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedQuestions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedQuestions.map(q => q.id));
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
    const res = await deleteQuestions(selectedIds);
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
    <div className="space-y-6 max-w-full">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
             <HelpCircle className="text-amber-500" /> Ngân Hàng Câu Hỏi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Quản lý và bổ sung các câu hỏi trắc nghiệm tâm lý vào hệ thống.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {selectedIds.length > 0 && (
            <Button variant="destructive" size="sm" onClick={handleDeleteSelected} className="flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> Xoá ({selectedIds.length})
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => openEditDialog()} className="bg-white dark:bg-transparent border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 dark:hover:bg-white/5 gap-2">
            <Plus className="w-4 h-4" /> Thêm Câu hỏi
          </Button>
          <Button className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 shadow-md text-white flex items-center gap-2 transition-colors" size="sm" onClick={() => setUploadDialogOpen(true)} disabled={uploading}>
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Tải lên Excel
          </Button>
        </div>
      </div>

      <Card className="shadow-sm border-slate-200 dark:border-white/10 dark:bg-[#0a0f08]/50 w-full overflow-hidden">
        <CardHeader className="bg-slate-50/50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5 py-4">
          <CardTitle className="text-sm sm:text-base flex items-center gap-2 text-slate-700 dark:text-slate-300">
             Toàn bộ câu hỏi <span className="bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full text-xs">{questions.length}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto w-full">
            <Table className="w-full min-w-[600px]">
              <TableHeader>
                <TableRow className="border-slate-100 dark:border-white/5 bg-white dark:bg-transparent">
                  <TableHead className="w-10">
                    <Checkbox checked={selectedIds.length > 0 && selectedIds.length === paginatedQuestions.length} onCheckedChange={toggleSelectAll} />
                  </TableHead>
                  <TableHead className="w-12 sm:w-16 text-center py-3 sm:py-4">STT</TableHead>
                  <TableHead>Nội Dung Trọng Tâm</TableHead>
                  <TableHead className="w-32 sm:w-48 text-right whitespace-nowrap">Ngày thêm</TableHead>
                  <TableHead className="w-16 text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-48 text-center text-slate-400">
                       <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-500" />
                    </TableCell>
                  </TableRow>
                ) : paginatedQuestions.length === 0 ? (
                  <TableRow>
                     <TableCell colSpan={5} className="h-48 text-center text-slate-400 dark:text-slate-500 text-sm">Ngân hàng câu hỏi trống. Vui lòng tải file Excel lên hoặc thực hiện thêm mới.</TableCell>
                  </TableRow>
                ) : (
                  paginatedQuestions.map((q, idx) => (
                    <TableRow key={q.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 border-slate-100 dark:border-white/5">
                      <TableCell>
                        <Checkbox checked={selectedIds.includes(q.id)} onCheckedChange={() => toggleSelect(q.id)} />
                      </TableCell>
                      <TableCell className="text-center font-medium text-slate-500 dark:text-slate-400 text-xs sm:text-sm">{(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}</TableCell>
                      <TableCell className="text-slate-900 dark:text-slate-200 font-medium leading-relaxed text-xs sm:text-sm">{q.content}</TableCell>
                      <TableCell className="text-right text-slate-400 dark:text-slate-500 text-xs sm:text-sm whitespace-nowrap">
                         {new Date(q.created_at).toLocaleDateString('vi-VN')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(q)} className="h-8 w-8 text-slate-400 hover:text-amber-500">
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

      {!loading && totalPages >= 1 && (
        <Pagination totalPages={totalPages} />
      )}

      {/* ── Add/Edit Question Dialog ── */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md w-[96vw] rounded-2xl dark:bg-[#0d1109] dark:border-white/10">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 text-left">
              {editTarget ? <Edit2 className="w-5 h-5 text-amber-500" /> : <Plus className="w-5 h-5 text-amber-500" />}
              {editTarget ? "Sửa Câu hỏi" : "Thêm Câu hỏi mới"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400 mt-1 text-left">
              Nhập nội dung câu hỏi trắc nghiệm để cập nhật ngân hàng dữ liệu.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2 text-left">
              <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nội dung câu hỏi</Label>
              <textarea
                placeholder="VD: Bạn thường cảm thấy thế nào sau mỗi giờ huấn luyện?"
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                className="w-full h-32 p-3 text-sm bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:border-amber-500 dark:focus:border-amber-500 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 resize-none font-sans"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1 dark:border-white/10" onClick={() => setEditDialogOpen(false)}>Huỷ</Button>
              <Button
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white gap-2 font-bold"
                onClick={handleCreateOrUpdateQuestion}
                disabled={savingQuestion || !editContent}
              >
                {savingQuestion ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {editTarget ? "Cập nhật" : "Lưu câu hỏi"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog 
        isOpen={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        onConfirm={handleActualDelete}
        isLoading={isDeleting}
        title="Xác nhận xoá câu hỏi"
        description={`Đồng chí có chắc chắn muốn xoá ${selectedIds.length} câu hỏi này khỏi ngân hàng dữ liệu? Hành động này không thể hoàn tác.`}
        confirmText="Xoá vĩnh viễn"
        variant="danger"
      />

      <ExcelUploadDialog
        isOpen={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onUpload={handleFileUpload}
        isUploading={uploading}
        title="Tải lên ngân hàng câu hỏi"
        description="Kéo thả tập tin Excel chứa danh sách câu hỏi để thêm hàng loạt vào hệ thống."
        sampleFileName="mau_cau_hoi.xlsx"
        sampleFileUrl="/mau_cau_hoi.xlsx"
      />
    </div>
  );
}

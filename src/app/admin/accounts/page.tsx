"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from "@/components/ui/table";
import {
  listAdminUsers, createAdminUser, deleteAdminUser, updateAdminPassword,
} from "@/app/actions/admin-actions";
import { Pagination } from "@/components/ui/pagination";
import { useSearchParams } from "next/navigation";
import {
  UserCog, UserPlus, Trash2, KeyRound, Loader2, ShieldCheck, AlertTriangle, Wand2, Mail
} from "lucide-react";

type AdminUser = {
  id: string;
  email?: string;
  created_at: string;
  last_sign_in_at?: string | null;
};

export default function AccountsPage() {
  const [users, setUsers]       = useState<AdminUser[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  // Create dialog
  const [createOpen, setCreateOpen]     = useState(false);
  const [newEmail, setNewEmail]         = useState("");
  const [newPassword, setNewPassword]   = useState("");
  const [creating, setCreating]         = useState(false);
  const [createError, setCreateError]   = useState("");

  // Change password dialog
  const [pwOpen, setPwOpen]       = useState(false);
  const [pwTarget, setPwTarget]   = useState<AdminUser | null>(null);
  const [pwMode, setPwMode]       = useState<"manual" | "random">("manual");
  const [pwValue, setPwValue]     = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [randomPw, setRandomPw]   = useState("");
  const [pwSaving, setPwSaving]   = useState(false);
  const [pwError, setPwError]     = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  // Delete confirm dialog
  const [delOpen, setDelOpen]     = useState(false);
  const [delTarget, setDelTarget] = useState<AdminUser | null>(null);
  const [deleting, setDeleting]   = useState(false);
  const [delError, setDelError]   = useState("");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    const res = await listAdminUsers();
    if (res.error) setError(res.error);
    else setUsers(res.users as AdminUser[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // ── Create ─────────────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!newEmail || !newPassword) { setCreateError("Vui lòng điền đầy đủ thông tin."); return; }
    if (newPassword.length < 6) { setCreateError("Mật khẩu tối thiểu 6 ký tự."); return; }
    setCreating(true); setCreateError("");
    const res = await createAdminUser(newEmail, newPassword);
    setCreating(false);
    if (res.error) { setCreateError(res.error); return; }
    setCreateOpen(false); setNewEmail(""); setNewPassword("");
    fetchUsers();
  };

  // ── Update password (Dual Mode) ─────────────────────────────────────────────
  const generateRandomPassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let p = "";
    for (let i = 0; i < 10; i++) p += chars[Math.floor(Math.random() * chars.length)];
    setRandomPw(p);
  };

  useEffect(() => {
    if (pwMode === "random") {
      generateRandomPassword();
    }
  }, [pwMode]);

  const handleUpdatePw = async () => {
    let finalPassword = "";
    
    if (pwMode === "manual") {
      if (!pwValue || pwValue.length < 6) { setPwError("Mật khẩu tối thiểu 6 ký tự."); return; }
      if (pwValue !== pwConfirm) { setPwError("Hai mật khẩu không khớp."); return; }
      finalPassword = pwValue;
    } else {
      if (!randomPw) { setPwError("Lỗi hệ thống sinh mật khẩu ngẫu nhiên."); return; }
      finalPassword = randomPw;
    }

    setPwSaving(true); setPwError(""); setPwSuccess("");
    const res = await updateAdminPassword(pwTarget!.id, finalPassword);
    setPwSaving(false);
    
    if (res.error) { setPwError(res.error); return; }

    if (pwMode === "manual") {
      setPwSuccess("Đã đổi mật khẩu thành công!");
      setTimeout(() => setPwOpen(false), 1200);
    } else {
      setPwSuccess("Đổi thành công! Đang mở ứng dụng Email...");
      const emailObj = pwTarget?.email || "";
      const subject = encodeURIComponent("Cấp lại mật khẩu Hệ thống phân tích tư tưởng Quân nhân");
      const body = encodeURIComponent(`Xin chào,\n\nMật khẩu của tài khoản ${emailObj} đã được cấp lại.\n\n🔑 Mật khẩu mới của bạn là: ${finalPassword}\n\nVui lòng đăng nhập lại và tự thay đổi mật khẩu nếu cần thiết để đảm bảo an toàn.\n\nTrân trọng,\nBan Quản Trị Hệ Thống`);
      
      window.location.href = `mailto:${emailObj}?subject=${subject}&body=${body}`;
      
      setTimeout(() => setPwOpen(false), 2000);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    setDeleting(true); setDelError("");
    const res = await deleteAdminUser(delTarget!.id);
    setDeleting(false);
    if (res.error) { setDelError(res.error); return; }
    setDelOpen(false); setDelTarget(null);
    fetchUsers();
  };

  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(users.length / ITEMS_PER_PAGE);
  const paginatedUsers = users.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UserCog className="text-purple-500" /> Quản lý Tài khoản Admin
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Tạo, đổi mật khẩu và xoá tài khoản cấp quản trị viên.
          </p>
        </div>
        <Button
          onClick={() => { setCreateOpen(true); setCreateError(""); setNewEmail(""); setNewPassword(""); }}
          className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2 shadow-md"
        >
          <UserPlus className="w-4 h-4" /> Tạo tài khoản mới
        </Button>
      </div>

      {/* Error banner for list */}
      {error && (
        <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 px-4 py-3 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
          <span className="text-xs ml-1 opacity-70">(Tính năng này yêu cầu service_role key trên server)</span>
        </div>
      )}

      {/* Table */}
      <Card className="shadow-sm border-slate-200 dark:border-white/10 dark:bg-[#0a0f08]/50 overflow-hidden">
        <CardHeader className="bg-slate-50/50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5 py-4">
          <CardTitle className="text-sm sm:text-base text-slate-900 dark:text-white">
            Danh sách tài khoản ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[560px]">
              <TableHeader>
                <TableRow className="bg-slate-50/50 dark:bg-white/5 border-slate-100 dark:border-white/5">
                  <TableHead className="w-12 text-center py-3">STT</TableHead>
                  <TableHead className="py-3">Email</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Đăng nhập lần cuối</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-48 text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-500" />
                    </TableCell>
                  </TableRow>
                ) : paginatedUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-48 text-center text-slate-400 dark:text-slate-500 text-sm">
                      Không có tài khoản nào.
                    </TableCell>
                  </TableRow>
                ) : paginatedUsers.map((u, idx) => (
                  <TableRow key={u.id} className="hover:bg-slate-50 dark:hover:bg-white/5 border-slate-100 dark:border-white/5">
                    <TableCell className="text-center font-medium text-slate-500 text-xs">
                       {(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                    </TableCell>
                    <TableCell className="font-medium text-slate-900 dark:text-slate-200 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-purple-50 dark:bg-purple-500/15 border border-purple-100 dark:border-purple-500/30 flex items-center justify-center shrink-0">
                          <ShieldCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        </div>
                        {u.email ?? "—"}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-500 dark:text-slate-400 text-xs">
                      {new Date(u.created_at).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}
                    </TableCell>
                    <TableCell className="text-slate-500 dark:text-slate-400 text-xs">
                      {u.last_sign_in_at
                        ? new Date(u.last_sign_in_at).toLocaleString("vi-VN")
                        : <span className="italic text-slate-300 dark:text-slate-600">Chưa đăng nhập</span>}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline" size="sm"
                          className="h-8 text-xs border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 dark:hover:bg-white/5 gap-1.5"
                          onClick={() => { 
                            setPwTarget(u); 
                            setPwMode("manual");
                            setPwValue(""); 
                            setPwConfirm("");
                            setPwError(""); 
                            setPwSuccess(""); 
                            setPwOpen(true); 
                          }}
                        >
                          <KeyRound className="w-3.5 h-3.5" /> Mật khẩu
                        </Button>
                        <Button
                          variant="ghost" size="sm"
                          className="h-8 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 gap-1.5"
                          onClick={() => { setDelTarget(u); setDelError(""); setDelOpen(true); }}
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Xoá
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {!loading && totalPages >= 1 && (
        <Pagination totalPages={totalPages} />
      )}

      {/* ── Create Dialog ── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md w-[94vw] rounded-2xl dark:bg-[#0d1109] dark:border-white/10">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-purple-500" /> Tạo tài khoản Admin mới
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Tài khoản sẽ được xác thực ngay (không cần email verify).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-sm text-slate-700 dark:text-slate-300">Email</Label>
              <Input
                type="email" placeholder="admin2@army.local" value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                className="dark:bg-[#111] dark:border-white/15 dark:text-white"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-slate-700 dark:text-slate-300">Mật khẩu (tối thiểu 6 ký tự)</Label>
              <Input
                type="password" placeholder="••••••••" value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="dark:bg-[#111] dark:border-white/15 dark:text-white"
              />
            </div>
            {createError && (
              <p className="text-xs text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/30 rounded-lg px-3 py-2 border border-red-100 dark:border-red-900/50">
                {createError}
              </p>
            )}
            <div className="flex gap-3 pt-1">
              <Button variant="outline" className="flex-1 dark:border-white/10 dark:text-slate-300" onClick={() => setCreateOpen(false)}>
                Huỷ
              </Button>
              <Button
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white gap-2"
                onClick={handleCreate} disabled={creating}
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                Tạo tài khoản
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Change Password Dialog (Dual Mode) ── */}
      <Dialog open={pwOpen} onOpenChange={setPwOpen}>
        <DialogContent className="max-w-md w-[94vw] rounded-2xl dark:bg-[#0d1109] dark:border-white/10">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-amber-500" /> Cấp lại & Đổi mật khẩu
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Đang chỉnh sửa: <span className="font-semibold text-slate-900 dark:text-slate-300">{pwTarget?.email}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="pt-2">
            {/* Mode Switcher */}
            <div className="flex p-1 mb-4 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5">
              <button
                type="button"
                onClick={() => { setPwMode("manual"); setPwError(""); }}
                className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all ${pwMode === 'manual' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
              >
                Nhập thủ công
              </button>
              <button
                type="button"
                onClick={() => { setPwMode("random"); setPwError(""); }}
                className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${pwMode === 'random' ? 'bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
              >
                <Wand2 className="w-3.5 h-3.5" /> Tạo & Gửi Mail
              </button>
            </div>

            <div className="space-y-4">
              {/* MANUAL MODE */}
              {pwMode === "manual" && (
                <div className="space-y-4 animate-fade-in-up">
                  <div className="space-y-1.5">
                    <Label className="text-sm text-slate-700 dark:text-slate-300">Mật khẩu mới</Label>
                    <Input
                      type="password" placeholder="••••••••" value={pwValue}
                      onChange={e => setPwValue(e.target.value)}
                      className="dark:bg-[#111] dark:border-white/15 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm text-slate-700 dark:text-slate-300">Xác nhận mật khẩu</Label>
                    <Input
                      type="password" placeholder="••••••••" value={pwConfirm}
                      onChange={e => setPwConfirm(e.target.value)}
                      className="dark:bg-[#111] dark:border-white/15 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {/* RANDOM + EMAIL MODE */}
              {pwMode === "random" && (
                <div className="space-y-4 animate-fade-in-up">
                  <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50 rounded-xl space-y-2">
                    <Label className="text-sm text-amber-800 dark:text-amber-500">Mật khẩu ngẫu nhiên đã tạo</Label>
                    <div className="flex items-center justify-between bg-white dark:bg-[#111] p-3 rounded-lg border border-amber-200 dark:border-amber-900/40">
                       <code className="text-lg font-bold tracking-wider text-slate-900 dark:text-white">
                         {randomPw}
                       </code>
                       <Button size="icon" variant="ghost" className="h-8 w-8 text-amber-600 rounded-md" onClick={generateRandomPassword} title="Tạo lại">
                         <Wand2 className="w-4 h-4" />
                       </Button>
                    </div>
                    <p className="text-xs text-amber-700 dark:text-amber-500/80 mt-2">
                      Khi bấm Lưu, mật khẩu này sẽ được áp dụng trực tiếp và tự động mở trình gửi Email để chuyển mã này đến người dùng.
                    </p>
                  </div>
                </div>
              )}

              {/* Status Messages */}
              {pwError && (
                <p className="text-xs text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/30 rounded-lg px-3 py-2 border border-red-100 dark:border-red-900/50 flex gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" /> {pwError}
                </p>
              )}
              {pwSuccess && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg px-3 py-2 border border-emerald-100 dark:border-emerald-900/50">
                   {pwSuccess}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1 dark:border-white/10 dark:text-slate-300" onClick={() => setPwOpen(false)}>
                  Huỷ bỏ
                </Button>
                <Button 
                  className={`flex-1 text-white gap-2 border-0 ${pwMode === 'random' ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600' : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700'}`} 
                  onClick={handleUpdatePw} disabled={pwSaving}
                >
                  {pwSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 
                   pwMode === 'random' ? <Mail className="w-4 h-4" /> : <KeyRound className="w-4 h-4" />}
                  {pwMode === 'random' ? 'Lưu & Gửi Email' : 'Lưu mật khẩu'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm Dialog ── */}
      <Dialog open={delOpen} onOpenChange={setDelOpen}>
        <DialogContent className="max-w-sm w-[94vw] rounded-2xl dark:bg-[#0d1109] dark:border-white/10">
          <DialogHeader>
             <DialogTitle className="text-lg font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
               <Trash2 className="w-5 h-5" /> Xác nhận xoá tài khoản
             </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600 dark:text-slate-300 py-2">
            Bạn chắc chắn muốn xoá tài khoản <span className="font-bold text-slate-900 dark:text-white">{delTarget?.email}</span>? Hành động này không thể hoàn tác.
          </p>
          {delError && (
            <p className="text-xs text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/30 rounded-lg px-3 py-2 border border-red-100 dark:border-red-900/50">{delError}</p>
          )}
          <div className="flex gap-3 pt-1">
            <Button variant="outline" className="flex-1 dark:border-white/10 dark:text-slate-300" onClick={() => setDelOpen(false)}>Huỷ</Button>
            <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white gap-2" onClick={handleDelete} disabled={deleting}>
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Xoá tài khoản
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

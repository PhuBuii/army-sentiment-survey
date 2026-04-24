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
  listAdminUsers, createAdminUser, deleteAdminUser, updateAdminPassword, updateAdminProfile,
} from "@/app/actions/admin-actions";
import { Pagination } from "@/components/ui/pagination";
import { useSearchParams } from "next/navigation";
import {
  UserCog, UserPlus, Trash2, KeyRound, Loader2, ShieldCheck, AlertTriangle, Wand2, Mail, Edit2
} from "lucide-react";

type AdminUser = {
  id: string;
  email?: string;
  created_at: string;
  last_sign_in_at?: string | null;
  role?: string;
  assigned_unit?: string | null;
  full_name?: string | null;
};

export default function AccountsPage() {
  const [users, setUsers]       = useState<AdminUser[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  // Create dialog
  const [createOpen, setCreateOpen]     = useState(false);
  const [newEmail, setNewEmail]         = useState("");
  const [newPassword, setNewPassword]   = useState("");
  const [newRole, setNewRole]           = useState("super_admin");
  const [newUnit, setNewUnit]           = useState("");
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

  // Edit profile dialog
  const [editOpen, setEditOpen]         = useState(false);
  const [editTarget, setEditTarget]     = useState<AdminUser | null>(null);
  const [editFullName, setEditFullName] = useState("");
  const [editRole, setEditRole]         = useState("super_admin");
  const [editUnit, setEditUnit]         = useState("");
  const [editSaving, setEditSaving]     = useState(false);
  const [editError, setEditError]       = useState("");

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
    if (newRole === "unit_admin" && !newUnit) { setCreateError("Vui lòng điền Đơn vị được uỷ quyền."); return; }
    
    setCreating(true); setCreateError("");
    const res = await createAdminUser(newEmail, newPassword, newRole, newUnit);
    setCreating(false);
    if (res.error) { setCreateError(res.error); return; }
    setCreateOpen(false); setNewEmail(""); setNewPassword(""); setNewRole("super_admin"); setNewUnit("");
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

  // ── Edit Profile ─────────────────────────────────────────────────────────
  const openEditProfile = (user: AdminUser) => {
    setEditTarget(user);
    setEditFullName(user.full_name || "");
    setEditRole(user.role || "super_admin");
    setEditUnit(user.assigned_unit || "");
    setEditError("");
    setEditOpen(true);
  };

  const handleEditProfile = async () => {
    if (editRole === "unit_admin" && !editUnit) {
      setEditError("Vui lòng điền Đơn vị uỷ quyền."); return;
    }
    setEditSaving(true); setEditError("");
    const res = await updateAdminProfile(editTarget!.id, editFullName, editRole, editUnit);
    setEditSaving(false);
    if (res.error) { setEditError(res.error); return; }
    setEditOpen(false);
    fetchUsers();
  };


  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(users.length / ITEMS_PER_PAGE);
  const paginatedUsers = users.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UserCog size={20} className="text-purple-500" /> Tài khoản Admin
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Quản lý tài khoản, phân quyền và bảo mật truy cập hệ thống.
          </p>
        </div>
        <Button size="sm"
          onClick={() => { setCreateOpen(true); setCreateError(""); setNewEmail(""); setNewPassword(""); setNewRole("super_admin"); setNewUnit(""); }}
          className="h-9 rounded-xl bg-purple-600 hover:bg-purple-700 text-white gap-1.5 shadow-sm"
        >
          <UserPlus className="w-3.5 h-3.5" /> Tạo tài khoản
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
      <Card className="shadow-sm border-slate-200 dark:border-white/8 bg-white dark:bg-[#161b22] overflow-hidden">
        <CardHeader className="bg-slate-50/80 dark:bg-white/[0.03] border-b border-slate-100 dark:border-white/8 py-3 px-4">
          <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            {users.length} tài khoản
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[640px]">
              <TableHeader>
                <TableRow className="bg-slate-50/50 dark:bg-white/[0.02] border-slate-100 dark:border-white/8 hover:bg-transparent dark:hover:bg-transparent">
                  <TableHead className="w-10 text-center py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">#</TableHead>
                  <TableHead className="py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Họ tên</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Quyền</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ngày tạo</TableHead>
                  <TableHead className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wider"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-40 text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-purple-500" />
                    </TableCell>
                  </TableRow>
                ) : paginatedUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-40 text-center text-sm text-slate-400 dark:text-slate-500">
                      Chưa có tài khoản nào.
                    </TableCell>
                  </TableRow>
                ) : paginatedUsers.map((u, idx) => (
                  <TableRow key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.03] border-slate-100 dark:border-white/8">
                    <TableCell className="text-center font-mono text-xs text-slate-400 py-3">
                       {(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border ${u.role === 'unit_admin' ? 'bg-sky-50 dark:bg-sky-500/10 border-sky-100 dark:border-sky-500/20' : 'bg-purple-50 dark:bg-purple-500/10 border-purple-100 dark:border-purple-500/20'}`}>
                          <ShieldCheck className={`w-3.5 h-3.5 ${u.role === 'unit_admin' ? 'text-sky-600 dark:text-sky-400' : 'text-purple-600 dark:text-purple-400'}`} />
                        </div>
                        <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{u.email ?? "—"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600 dark:text-slate-300 py-3">
                      {u.full_name || <span className="text-slate-300 dark:text-slate-600 italic">—</span>}
                    </TableCell>
                    <TableCell className="py-3">
                      {u.role === "super_admin" ? (
                         <span className="text-[11px] bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400 px-2 py-0.5 rounded-md font-bold">Super Admin</span>
                      ) : (
                         <div className="flex flex-col gap-0.5">
                           <span className="text-[11px] bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400 px-2 py-0.5 rounded-md font-bold w-fit">Unit Admin</span>
                           {u.assigned_unit && <span className="text-[10px] text-slate-400 pl-0.5">{u.assigned_unit}</span>}
                         </div>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-slate-400 dark:text-slate-500 py-3 whitespace-nowrap">
                      {new Date(u.created_at).toLocaleDateString("vi-VN")}
                    </TableCell>
                    <TableCell className="text-right py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-blue-500 rounded-lg"
                          onClick={() => openEditProfile(u)} title="Sửa hồ sơ">
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-amber-500 rounded-lg"
                          onClick={() => { setPwTarget(u); setPwMode("manual"); setPwValue(""); setPwConfirm(""); setPwError(""); setPwSuccess(""); setPwOpen(true); }}
                          title="Đổi mật khẩu">
                          <KeyRound className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-red-500 rounded-lg"
                          onClick={() => { setDelTarget(u); setDelError(""); setDelOpen(true); }}
                          title="Xoá tài khoản">
                          <Trash2 className="w-3.5 h-3.5" />
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
        <DialogContent className="max-w-md w-[94vw] rounded-2xl bg-white dark:bg-[#161b22] dark:border-white/10">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-purple-500" /> Tạo tài khoản mới
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">Xác thực ngay, không cần email verify.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email</Label>
              <Input type="email" placeholder="admin@army.local" value={newEmail} onChange={e => setNewEmail(e.target.value)}
                className="h-10 text-sm rounded-xl bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Mật khẩu (≥ 6 ký tự)</Label>
              <Input type="password" placeholder="••••••••" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                className="h-10 text-sm rounded-xl bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Phân quyền</Label>
              <select value={newRole} onChange={e => setNewRole(e.target.value)}
                className="w-full h-10 px-3 text-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-slate-200 outline-none focus:border-purple-500">
                <option value="super_admin">Super Admin — Toàn quyền</option>
                <option value="unit_admin">Unit Admin — Giới hạn đơn vị</option>
              </select>
            </div>
            {newRole === "unit_admin" && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Đơn vị uỷ quyền</Label>
                <Input type="text" placeholder="Đại đội 1" value={newUnit} onChange={e => setNewUnit(e.target.value)}
                  className="h-10 text-sm rounded-xl bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10" />
                <p className="text-[10px] text-slate-400">Phải khớp chính xác tên đơn vị trong danh sách chiến sĩ.</p>
              </div>
            )}
            {createError && <p className="text-xs text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-500/10 rounded-xl px-3 py-2 border border-red-100 dark:border-red-500/20">{createError}</p>}
            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1 h-10 rounded-xl dark:border-white/10" onClick={() => setCreateOpen(false)}>Huỷ</Button>
              <Button className="flex-1 h-10 rounded-xl bg-purple-600 hover:bg-purple-700 text-white gap-1.5" onClick={handleCreate} disabled={creating}>
                {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />} Tạo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Change Password Dialog (Dual Mode) ── */}
      <Dialog open={pwOpen} onOpenChange={setPwOpen}>
        <DialogContent className="max-w-md w-[94vw] rounded-2xl bg-white dark:bg-[#161b22] dark:border-white/10">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-500" /> Đổi mật khẩu
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">{pwTarget?.email}</DialogDescription>
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
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Mật khẩu mới</Label>
                    <Input type="password" placeholder="••••••••" value={pwValue} onChange={e => setPwValue(e.target.value)}
                      className="h-10 text-sm rounded-xl bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Xác nhận</Label>
                    <Input type="password" placeholder="••••••••" value={pwConfirm} onChange={e => setPwConfirm(e.target.value)}
                      className="h-10 text-sm rounded-xl bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10" />
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

              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1 h-10 rounded-xl dark:border-white/10" onClick={() => setPwOpen(false)}>Huỷ</Button>
                <Button className={`flex-1 h-10 rounded-xl text-white gap-1.5 border-0 ${pwMode === 'random' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                  onClick={handleUpdatePw} disabled={pwSaving}>
                  {pwSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : pwMode === 'random' ? <Mail className="w-3.5 h-3.5" /> : <KeyRound className="w-3.5 h-3.5" />}
                  {pwMode === 'random' ? 'Lưu & Gửi Email' : 'Lưu'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm Dialog ── */}
      <Dialog open={delOpen} onOpenChange={setDelOpen}>
        <DialogContent className="max-w-sm w-[94vw] rounded-2xl bg-white dark:bg-[#161b22] dark:border-white/10">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> Xác nhận xoá
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600 dark:text-slate-300 py-2">
            Xoá tài khoản <span className="font-bold text-slate-900 dark:text-white">{delTarget?.email}</span>? Không thể hoàn tác.
          </p>
          {delError && <p className="text-xs text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-500/10 rounded-xl px-3 py-2 border border-red-100 dark:border-red-500/20">{delError}</p>}
          <div className="flex gap-2 pt-1">
            <Button variant="outline" className="flex-1 h-10 rounded-xl dark:border-white/10" onClick={() => setDelOpen(false)}>Huỷ</Button>
            <Button className="flex-1 h-10 rounded-xl bg-red-600 hover:bg-red-700 text-white gap-1.5" onClick={handleDelete} disabled={deleting}>
              {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />} Xoá
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Edit Profile Dialog ── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md w-[96vw] rounded-2xl bg-white dark:bg-[#161b22] dark:border-white/10">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-blue-500" /> Sửa hồ sơ
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">{editTarget?.email}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Họ tên</Label>
              <Input placeholder="Trần Văn A" value={editFullName} onChange={e => setEditFullName(e.target.value)}
                className="h-10 text-sm rounded-xl bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Phân quyền</Label>
              <select value={editRole} onChange={e => setEditRole(e.target.value)}
                className="w-full h-10 px-3 text-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500">
                <option value="super_admin">Super Admin — Toàn quyền</option>
                <option value="unit_admin">Unit Admin — Giới hạn đơn vị</option>
              </select>
            </div>
            {editRole === "unit_admin" && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Đơn vị uỷ quyền</Label>
                <Input placeholder="Đại đội 1" value={editUnit} onChange={e => setEditUnit(e.target.value)}
                  className="h-10 text-sm rounded-xl bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10" />
                <p className="text-[10px] text-slate-400">Phải khớp chính xác tên đơn vị trong danh sách chiến sĩ.</p>
              </div>
            )}
            {editError && <p className="text-xs text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-500/10 rounded-xl px-3 py-2 border border-red-100 dark:border-red-500/20">{editError}</p>}
            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1 h-10 rounded-xl dark:border-white/10" onClick={() => setEditOpen(false)}>Huỷ</Button>
              <Button className="flex-1 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white gap-1.5" onClick={handleEditProfile} disabled={editSaving}>
                {editSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Edit2 className="w-3.5 h-3.5" />} Lưu
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

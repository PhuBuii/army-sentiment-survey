"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  User, Shield, Lock, Save, Camera, 
  CheckCircle2, AlertCircle, Loader2, KeyRound,
  UserCircle2, ShieldCheck, Mail, Briefcase, BadgeCheck,
  Upload, Sparkles, LogOut, ChevronRight, Settings,
  Activity, Calendar, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { updatePasswordAction, updateProfileAction, uploadAvatarAction } from "@/app/actions/admin-actions";
import { toast } from "react-toastify";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";
import { logout } from "@/app/login/actions";

export default function ProfilePage() {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [fetching, setFetching] = useState(true);

  // Profile fields
  const [fullName, setFullName] = useState("");
  const [rank, setRank] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Password fields
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setFullName(user.user_metadata?.full_name || "Administrator");
        setRank(user.user_metadata?.rank || "Cán bộ quản trị");
        setAvatarUrl(user.user_metadata?.avatar_url || null);
      }
      setFetching(false);
    }
    getUser();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData();
    formData.append("full_name", fullName);
    formData.append("rank", rank);

    const result = await updateProfileAction(formData);
    
    if (result.success) {
      toast.success("Cập nhật thông tin thành công");
    } else {
      toast.error(result.error || "Có lỗi xảy ra");
    }
    setLoading(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }
    
    setLoading(true);
    const formData = new FormData();
    formData.append("new_password", newPassword);

    const result = await updatePasswordAction(formData);
    
    if (result.success) {
      toast.success("Đổi mật khẩu thành công");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      toast.error(result.error || "Có lỗi xảy ra");
    }
    setLoading(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ảnh quá lớn (vui lòng chọn ảnh dưới 2MB)");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    const result = await uploadAvatarAction(formData);
    
    if (result.success && result.url) {
      setAvatarUrl(result.url);
      toast.success("Cập nhật ảnh đại diện thành công");
    } else {
      toast.error(result.error || "Lỗi khi tải ảnh lên.");
    }
    setUploading(false);
  };

  if (fetching) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 border-4 border-emerald-500/10 rounded-full" />
            <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-sm font-bold text-slate-400 dark:text-slate-600 tracking-widest uppercase animate-pulse">Bản doanh đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10 px-2 sm:px-4 md:px-6">
      
      {/* ══ EXPERT HEADER: ELEGANT & POWERFUL ═════════════════════════════════ */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-[2.5rem] blur opacity-10 group-hover:opacity-20 transition duration-700" />
        <div className="relative overflow-hidden rounded-[2.5rem] bg-white dark:bg-[#161b22] border border-slate-200 dark:border-white/10 shadow-2xl shadow-emerald-900/5">
          
          {/* Subtle Texture/Pattern Background */}
          <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
          
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-emerald-500/10 to-transparent" />

          <div className="relative p-6 sm:p-10 flex flex-col md:flex-row items-center md:items-end gap-8">
            
            {/* Avatar Section: Professional Floating look */}
            <div className="relative">
              <div 
                className="group/avatar relative w-36 h-36 rounded-[3rem] bg-slate-50 dark:bg-[#0d1117] border-[6px] border-white dark:border-[#161b22] flex items-center justify-center shadow-xl overflow-hidden cursor-pointer transition-transform duration-500 hover:scale-105"
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-md z-10 flex items-center justify-center rounded-[3rem]">
                    <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-black/0 group-hover/avatar:bg-black/50 backdrop-blur-none group-hover/avatar:backdrop-blur-sm z-10 flex flex-col items-center justify-center transition-all duration-300 opacity-0 group-hover/avatar:opacity-100 rounded-[3rem]">
                    <Camera className="w-8 h-8 text-white mb-2" />
                    <span className="text-[10px] text-white font-bold uppercase tracking-tighter">Thay đổi ảnh</span>
                  </div>
                )}
                
                {avatarUrl ? (
                  <Image src={avatarUrl} alt="Avatar" fill className="object-cover" />
                ) : (
                  <UserCircle2 size={80} className="text-slate-200 dark:text-slate-800" />
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center text-white border-4 border-white dark:border-[#161b22] shadow-lg">
                <ShieldCheck size={18} />
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            </div>

            {/* Title & Status Info */}
            <div className="text-center md:text-left flex-1 space-y-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                  {fullName}
                </h1>
                <p className="text-lg text-emerald-600 dark:text-emerald-400 font-bold mt-2 flex items-center justify-center md:justify-start gap-2">
                  <BadgeCheck size={20} />
                  {rank}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                 <Badge className="bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border-none px-3 py-1.5 rounded-xl font-bold flex items-center gap-2">
                    <Clock size={14} className="text-blue-500" />
                    Tham gia: {user?.created_at ? new Date(user.created_at).toLocaleDateString('vi-VN') : 'Mới'}
                 </Badge>
                 <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none px-3 py-1.5 rounded-xl font-bold flex items-center gap-2">
                    <Activity size={14} className="animate-pulse" />
                    Trực tuyến
                 </Badge>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex flex-col gap-2">
              <form action={logout}>
                <Button
                  type="submit" variant="ghost" className="rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 font-bold h-11 px-6">
                  <LogOut size={16} className="mr-2" /> Đăng xuất
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* ══ EXPERT CONTENT LAYOUT ══════════════════════════════════════════════ */}
      <Tabs defaultValue="general" className="w-full space-y-8">
        
        {/* Modern Tab Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
           <div className="bg-slate-100/80 dark:bg-white/5 p-1 rounded-2xl border border-slate-200 dark:border-white/10 w-full sm:w-auto">
             <TabsList className="bg-transparent border-none p-0 h-12 w-full sm:w-auto flex">
               <TabsTrigger 
                 value="general" 
                 className="flex-1 sm:flex-none px-8 rounded-xl font-bold text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-[#161b22] data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-xl transition-all duration-300"
               >
                 <User size={16} className="mr-2" /> Hồ sơ
               </TabsTrigger>
               <TabsTrigger 
                 value="security" 
                 className="flex-1 sm:flex-none px-8 rounded-xl font-bold text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-[#161b22] data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-xl transition-all duration-300"
               >
                 <Shield size={16} className="mr-2" /> Bảo mật
               </TabsTrigger>
             </TabsList>
           </div>

           <div className="hidden md:flex items-center gap-2 text-slate-400 font-bold text-[11px] uppercase tracking-[0.2em]">
              Quản lý tài khoản chỉ huy <ChevronRight size={14} />
           </div>
        </div>

        {/* Tab Contents: Expert Grid Pattern */}
        <TabsContent value="general" className="m-0 focus-visible:outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Main Form: Logical Grouping */}
            <div className="lg:col-span-8 space-y-6">
              <Card className="border-slate-200 dark:border-white/10 bg-white dark:bg-[#161b22] rounded-[2.5rem] shadow-sm overflow-hidden">
                <CardHeader className="p-8 pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                      <Settings size={20} />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Thông tin định danh</CardTitle>
                      <CardDescription>Cập nhật cách đơn vị và cấp trên nhìn thấy hồ sơ của đồng chí.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <form onSubmit={handleUpdateProfile}>
                  <CardContent className="p-8 pt-4 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <Label htmlFor="full_name" className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">Họ tên chính thức</Label>
                        <div className="relative group">
                          <Input 
                            id="full_name" 
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="pl-12 h-14 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-2xl focus:ring-emerald-500 transition-all text-base font-medium" 
                            placeholder="Nhập họ và tên..."
                          />
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="rank" className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">Cấp bậc / Chức danh</Label>
                        <div className="relative group">
                          <Input 
                            id="rank" 
                            value={rank}
                            onChange={(e) => setRank(e.target.value)}
                            className="pl-12 h-14 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-2xl focus:ring-emerald-500 transition-all text-base font-medium" 
                            placeholder="VD: Thiếu tá - Đại đội trưởng"
                          />
                          <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                        </div>
                      </div>

                      <div className="md:col-span-2 space-y-3">
                        <Label className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">Tài khoản (Email)</Label>
                        <div className="relative">
                          <Input 
                            disabled 
                            value={user?.email || ""}
                            className="pl-12 h-14 bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-2xl opacity-60 cursor-not-allowed" 
                          />
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                          <Badge className="absolute right-4 top-1/2 -translate-y-1/2 bg-blue-500/10 text-blue-500 border-none font-bold text-[10px] uppercase">Hệ thống</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-slate-50/50 dark:bg-white/5 p-8 flex justify-end">
                    <Button type="submit" disabled={loading} className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl h-14 px-10 font-black gap-3 shadow-xl shadow-emerald-600/20 transition-all active:scale-95">
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save size={20} />}
                      LƯU THAY ĐỔI
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </div>

            {/* Informational Sidebar: Enhances UX Context */}
            <div className="lg:col-span-4 space-y-6">
              <Card className="border-slate-200 dark:border-white/10 bg-emerald-600 dark:bg-emerald-600 text-white rounded-[2.5rem] shadow-xl shadow-emerald-900/10 overflow-hidden">
                <CardContent className="p-8 space-y-6">
                   <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                      <Sparkles size={24} />
                   </div>
                   <div className="space-y-2">
                      <h3 className="text-xl font-black">Mẹo chỉ huy</h3>
                      <p className="text-sm text-emerald-50 leading-relaxed opacity-90">
                        Hồ sơ chuyên nghiệp giúp tạo niềm tin tuyệt đối khi đồng chí làm việc với cấp dưới và báo cáo lên cấp trên. Hãy đảm bảo ảnh đại diện luôn nghiêm túc và đúng quân phong.
                      </p>
                   </div>
                   <div className="pt-4 border-t border-white/10">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Cập nhật lần cuối</p>
                      <p className="text-sm font-bold mt-1">Hôm nay, lúc {new Date().getHours()}:{new Date().getMinutes()}</p>
                   </div>
                </CardContent>
              </Card>

              <div className="p-6 rounded-[2rem] border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 flex gap-4 items-center">
                 <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                    <AlertCircle size={20} />
                 </div>
                 <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Mọi thay đổi hồ sơ sẽ được đồng bộ hóa tức thì trên tất cả các báo cáo PDF và Dashboard toàn quân.
                 </p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="security" className="m-0 focus-visible:outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8">
              <Card className="border-slate-200 dark:border-white/10 bg-white dark:bg-[#161b22] rounded-[2.5rem] shadow-sm overflow-hidden">
                <CardHeader className="p-8 pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                      <Lock size={20} />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Bảo mật quân sự</CardTitle>
                      <CardDescription>Thiết lập mật khẩu mạnh để bảo vệ tài khoản của đồng chí.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <form onSubmit={handleUpdatePassword}>
                  <CardContent className="p-8 pt-4 space-y-8">
                    <div className="space-y-8 max-w-lg">
                      <div className="space-y-3">
                        <Label htmlFor="new_password" className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">Mật khẩu mới</Label>
                        <div className="relative group">
                          <Input 
                            id="new_password" 
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="••••••••••••"
                            className="pl-12 h-14 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-2xl focus:ring-blue-500 transition-all text-base" 
                          />
                          <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="confirm_password" className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">Xác nhận mật khẩu</Label>
                        <div className="relative group">
                          <Input 
                            id="confirm_password" 
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••••••"
                            className="pl-12 h-14 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-2xl focus:ring-blue-500 transition-all text-base" 
                          />
                          <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-slate-50/50 dark:bg-white/5 p-8 flex justify-end">
                    <Button type="submit" disabled={loading} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-14 px-10 font-black gap-3 shadow-xl shadow-blue-600/20 transition-all active:scale-95">
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock size={20} />}
                      CẬP NHẬT BẢO MẬT
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <Card className="border-slate-200 dark:border-white/10 bg-white dark:bg-[#161b22] rounded-[2.5rem] shadow-sm overflow-hidden">
                 <CardHeader className="p-6">
                    <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-500">Tiêu chuẩn mật khẩu</CardTitle>
                 </CardHeader>
                 <CardContent className="p-6 pt-0 space-y-4">
                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                       <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                          <CheckCircle2 size={12} />
                       </div>
                       Ít nhất 12 ký tự
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                       <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                          <CheckCircle2 size={12} />
                       </div>
                       Bao gồm chữ hoa và chữ thường
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                       <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                          <CheckCircle2 size={12} />
                       </div>
                       Chứa ít nhất 1 số và 1 ký tự đặc biệt
                    </div>
                 </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

"use server";

import { createClient } from "@/utils/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import nodemailer from "nodemailer";

// Helper to get admin client
function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("⚠️ Thiếu biến môi trường SUPABASE_SERVICE_ROLE_KEY. Vui lòng thêm vào file .env.local để sử dụng tính năng quản lý Admin.");
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// ── Update AI classification override ────────────────────────────────────────
export async function updateSubmissionStatus(
  submissionId: string,
  newStatus: "An tâm" | "Dao động" | "Nguy cơ",
  newScore?: number,
  adminNote?: string
) {
  const supabase = await createClient(); // This one is fine as it relies on RLS
  const { error } = await supabase
    .from("submissions")
    .update({
      ai_status: newStatus,
      ...(newScore !== undefined ? { ai_score: newScore } : {}),
      ...(adminNote !== undefined ? { admin_note: adminNote } : {}),
    })
    .eq("id", submissionId);

  if (error) return { error: error.message };
  return { success: true };
}

export async function markSubmissionResolved(
  submissionId: string,
  isResolved: boolean,
  adminNote?: string
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("submissions")
    .update({
      is_resolved: isResolved,
      ...(adminNote !== undefined ? { admin_note: adminNote } : {}),
    })
    .eq("id", submissionId);

  if (error) return { error: error.message };
  return { success: true };
}

// ── Admin account management ─────────────────────────────────────────────────
export async function listAdminUsers() {
  try {
    const supabaseAdmin = getAdminClient();
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();
    if (error) return { error: error.message, users: [] };
    
    const { data: profiles } = await supabaseAdmin.from("admin_profiles").select("*");
    
    // Merge Auth Users with Roles
    const mergedUsers = data.users.map((u) => {
      const p = profiles?.find((profile) => profile.id === u.id);
      return {
        ...u,
        role: p?.role || "super_admin",
        assigned_unit: p?.assigned_unit || null,
        full_name: p?.full_name || null,
      };
    });

    return { users: mergedUsers ?? [] };
  } catch (err: any) {
    return { error: err.message, users: [] };
  }
}

export async function createAdminUser(email: string, password: string, role: string = 'super_admin', assignedUnit?: string) {
  try {
    const supabaseAdmin = getAdminClient();
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error) return { error: error.message };

    // Create the RBAC profile mapping
    if (data?.user?.id) {
       await supabaseAdmin.from("admin_profiles").insert({
         id: data.user.id,
         role: role,
         assigned_unit: assignedUnit || null
       });
    }

    return { success: true, user: data.user };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function deleteAdminUser(userId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Prevent deleting your own account
    if (user && user.id === userId) {
      return { error: "Không thể xoá tài khoản bạn đang đăng nhập." };
    }

    const supabaseAdmin = getAdminClient();
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) return { error: error.message };
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function updateAdminProfile(
  userId: string,
  fullName: string,
  role: string,
  assignedUnit?: string
) {
  try {
    const supabaseAdmin = getAdminClient();
    const { error } = await supabaseAdmin.from("admin_profiles").upsert({
      id: userId,
      full_name: fullName || null,
      role,
      assigned_unit: assignedUnit || null,
    }, { onConflict: "id" });
    if (error) return { error: error.message };
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function updateAdminPassword(userId: string, newPassword: string) {
  try {
    const supabaseAdmin = getAdminClient();
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {

      password: newPassword,
    });
    if (error) return { error: error.message };
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

// ── Soldier CRUD ─────────────────────────────────────────────────────────────
export async function createSoldier(fullName: string, unit: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("soldiers")
    .insert([{ full_name: fullName, unit }])
    .select()
    .single();

  if (error) return { error: error.message };
  return { success: true, soldier: data };
}

export async function updateSoldier(id: string, fullName: string, unit: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("soldiers")
    .update({ full_name: fullName, unit })
    .eq("id", id);

  if (error) return { error: error.message };
  return { success: true };
}

export async function deleteSoldiers(ids: string[]) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("soldiers")
    .delete()
    .in("id", ids);

  if (error) return { error: error.message };
  return { success: true };
}

// ── Question CRUD ────────────────────────────────────────────────────────────
export async function createQuestion(content: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("questions")
    .insert([{ content }])
    .select()
    .single();

  if (error) return { error: error.message };
  return { success: true, question: data };
}

export async function updateQuestion(id: string, content: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("questions")
    .update({ content })
    .eq("id", id);

  if (error) return { error: error.message };
  return { success: true };
}

export async function deleteQuestions(ids: string[]) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("questions")
    .delete()
    .in("id", ids);

  if (error) return { error: error.message };
  return { success: true };
}

// ── Personal Profile & Security ──────────────────────────────────────────────
export async function updateProfileAction(formData: FormData) {
  const supabase = await createClient();
  const fullName = formData.get("full_name") as string;
  const rank = formData.get("rank") as string;

  const { error } = await supabase.auth.updateUser({
    data: { 
      full_name: fullName,
      rank: rank
    }
  });

  if (error) {
    return { success: false, error: error.message };
  }

  // Sync with admin_profiles table
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await supabase.from('admin_profiles').upsert({
      id: user.id,
      full_name: fullName,
      rank: rank,
      role: user.user_metadata?.role || 'super_admin'
    });
  }

  revalidatePath("/admin/profile");
  return { success: true };
}

export async function updatePasswordAction(formData: FormData) {
  const supabase = await createClient();
  const newPassword = formData.get("new_password") as string;

  const { error } = await supabase.auth.updateUser({
    password: newPassword
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function uploadAvatarAction(formData: FormData) {
  const supabase = await createClient();
  const file = formData.get("file") as File;
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !file) return { success: false, error: "Thiếu thông tin người dùng hoặc tệp tin." };

  const fileExt = file.name.split('.').pop();
  const fileName = `${user.id}-${Math.random()}.${fileExt}`;
  const filePath = `${fileName}`;

  // 1. Upload to Storage (Bucket: 'avatars')
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file);

  if (uploadError) return { success: false, error: uploadError.message };

  // 2. Get Public URL
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  // 3. Update Auth User Metadata & Profile Table
  const { error: updateError } = await supabase.auth.updateUser({
    data: { avatar_url: publicUrl }
  });

  if (updateError) return { success: false, error: updateError.message };

  // Also update admin_profiles table (using upsert to ensure record exists)
  await supabase.from('admin_profiles').upsert({ 
    id: user.id,
    avatar_url: publicUrl,
    full_name: user.user_metadata?.full_name,
    rank: user.user_metadata?.rank,
    role: user.user_metadata?.role || 'super_admin'
  });

  revalidatePath("/admin/profile");
  return { success: true, url: publicUrl };
}

// ── Reset Survey ─────────────────────────────────────────────────────────────
export async function resetSoldierSurvey(soldierId: string) {
  try {
    const supabaseAdmin = getAdminClient();
    
    // 1. Delete all submissions for this soldier
    const { error: deleteError } = await supabaseAdmin
      .from("submissions")
      .delete()
      .eq("soldier_id", soldierId);
    
    if (deleteError) return { error: deleteError.message };

    // 2. Reset completion status
    const { error: updateError } = await supabaseAdmin
      .from("soldiers")
      .update({ is_completed: false })
      .eq("id", soldierId);

    if (updateError) return { error: updateError.message };

    revalidatePath("/admin/soldiers");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Lỗi không xác định khi reset khảo sát." };
  }
}

// ── Units Management ─────────────────────────────────────────────────────────
export async function getUnits() {
  const supabase = await createClient();
  let units: string[] = [];

  const { data, error } = await supabase.from('app_settings').select('value').eq('id', 'units').single();
  
  if (!error && data) {
    try {
      units = JSON.parse(data.value) as string[];
    } catch (e) {}
  }

  // Auto-sync with existing soldiers' units to ensure no data is left behind
  const { data: soldiersData } = await supabase.from('soldiers').select('unit');
  let hasNewUnits = false;

  if (soldiersData && soldiersData.length > 0) {
    const existingSoldierUnits = Array.from(new Set(soldiersData.map((s) => s.unit))).filter(Boolean);
    for (const u of existingSoldierUnits) {
      if (!units.includes(u)) {
        units.push(u);
        hasNewUnits = true;
      }
    }
  }

  // If we found new units from the soldiers table, save them back to app_settings
  if (hasNewUnits || (!data && units.length > 0)) {
    await supabase.from('app_settings').upsert({ id: 'units', value: JSON.stringify(units) });
  }

  return { units };
}

export async function saveUnits(units: string[]) {
  const supabase = await createClient();
  const { error } = await supabase.from('app_settings').upsert({ id: 'units', value: JSON.stringify(units) });
  if (error) return { error: error.message };
  return { success: true };
}

// ── Feedback / Contributions ──────────────────────────────────────────────────
export async function sendFeedbackAction(content: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const userName = user?.user_metadata?.full_name || user?.email || "Một sĩ quan";

    const email = process.env.SMTP_EMAIL;
    const pass = process.env.SMTP_PASSWORD;

    if (!email || !pass) {
      return { 
        error: "Tính năng gửi mail chưa được cấu hình. Vui lòng thiết lập SMTP_EMAIL và SMTP_PASSWORD trong file .env.local"
      };
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: email,
        pass: pass,
      },
    });

    await transporter.sendMail({
      from: `Tâm Tư Chiến Sĩ <${email}>`,
      to: email, // Send directly to the configured email (the owner)
      subject: `[Tâm Tư Chiến Sĩ] Góp ý hệ thống từ ${userName}`,
      html: `
        <h2 style="color: #047857;">Có một góp ý phát triển mới cho hệ thống</h2>
        <p><strong>Người gửi:</strong> ${userName}</p>
        <p><strong>Nội dung:</strong></p>
        <div style="padding: 15px; background-color: #f8fafc; border-left: 4px solid #10b981; border-radius: 4px; font-size: 14px; line-height: 1.5;">
          ${content.replace(/\n/g, "<br />")}
        </div>
        <br />
        <p style="color: #64748b; font-size: 12px;">Email này được gửi tự động từ hệ thống Tâm Tư Chiến Sĩ.</p>
      `,
    });

    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

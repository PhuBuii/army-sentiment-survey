"use server";

import { createClient } from "@/utils/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

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
        assigned_unit: p?.assigned_unit || null
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

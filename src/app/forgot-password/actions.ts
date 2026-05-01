"use server";

import { createClient } from "@supabase/supabase-js";

// Use service role for admin tasks (like checking user existence)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function checkEmailExists(email: string) {
  try {
    // Check in auth.users via admin API
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();
    
    if (error) {
      console.error("Error listing users:", error);
      return { exists: false, error: "Lỗi hệ thống khi kiểm tra email." };
    }

    const user = data.users.find(u => u.email === email);
    
    if (!user) {
      return { exists: false, error: "Email này không tồn tại trong hệ thống quân đội." };
    }

    return { exists: true };
  } catch (err) {
    return { exists: false, error: "Lỗi không xác định." };
  }
}

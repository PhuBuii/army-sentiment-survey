"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  let errorMessage = "Đã có lỗi xảy ra. Vui lòng thử lại sau.";
  let hasError = false;

  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      errorMessage = "Vui lòng nhập đầy đủ email và mật khẩu.";
      hasError = true;
    } else {
      const supabase = await createClient();

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        hasError = true;
        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "Tài khoản hoặc mật khẩu không chính xác.";
        } else if (error.message.includes("Email rate limit exceeded") || error.status === 429) {
          errorMessage = "Bạn đã đăng nhập sai quá nhiều lần. Vui lòng đợi một lát rồi thử lại.";
        } else {
          errorMessage = "Đăng nhập thất bại. Vui lòng kiểm tra lại!";
        }
      }
    }
  } catch (err) {
    console.error("Login exception:", err);
    hasError = true;
  }

  if (hasError) {
    return redirect(`/login?message=${encodeURIComponent(errorMessage)}`);
  }

  return redirect("/admin/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/login");
}

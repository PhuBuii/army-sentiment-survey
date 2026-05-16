"use server";

import { supabase as anonSupabase } from "@/lib/supabase";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Helper for system operations
function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("⚠️ Thiếu cấu hình SUPABASE_SERVICE_ROLE_KEY.");
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function validateTokenAndGetQuestions(token: string) {
  try {
    const { data: soldier, error: soldierError } = await anonSupabase
      .from("soldiers")
      .select("*")
      .eq("token", token)
      .single();

    if (soldierError || !soldier) {
      return {
        error: "Không tìm thấy chiến sĩ hoặc link khảo sát không hợp lệ.",
      };
    }

    const { data: questions, error: qError } = await anonSupabase
      .from("questions")
      .select("id, content");

    if (qError || !questions || questions.length === 0) {
      return { error: "Chưa có danh sách câu hỏi trong hệ thống." };
    }

    let finalQuestions = [];

    if (soldier.is_completed) {
      return {
        error:
          "Đồng chí đã hoàn thành khảo sát này. Mỗi tài khoản chỉ được thực hiện một lần.",
      };
    }

    // Chọn ngẫu nhiên 5 câu hỏi
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    finalQuestions = shuffled.slice(0, 5);

    return {
      soldier: {
        id: soldier.id,
        full_name: soldier.full_name,
        unit: soldier.unit,
      },
      questions: finalQuestions,
      isCompleted: soldier.is_completed,
      previousAnswers: {},
    };
  } catch (err: any) {
    return { error: err.message || "Lỗi server." };
  }
}

export async function submitSurveyAndAnalyze(
  soldierId: string,
  responses: { question: string; answer: string }[],
) {
  try {
    const adminSupabase = getAdminClient();

    // 0. Kiểm tra tránh nộp bài lần 2
    const { data: currentSoldier } = await adminSupabase
      .from("soldiers")
      .select("is_completed")
      .eq("id", soldierId)
      .single();

    if (currentSoldier?.is_completed) {
      return { error: "Đồng chí đã hoàn thành khảo sát này rồi." };
    }

    // 1. Lưu kết quả học viên vào Database để Webhook (bất đồng bộ) tự chạy AI
    const { data: newSubmission, error: insertError } = await adminSupabase
      .from("submissions")
      .insert({
        soldier_id: soldierId,
        responses: responses,
        /* ai_score, ai_status, ai_summary... sẽ được Supabase Edge Function xử lý sau */
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Lỗi insert bài nộp:", insertError);
      return { error: "Lỗi lưu kết quả. Tính năng AI bất đồng bộ đang xử lý." };
    }

    // 2. Chuyển trạng thái chiến sĩ thành đã hoàn thành khảo sát
    await adminSupabase
      .from("soldiers")
      .update({ is_completed: true })
      .eq("id", soldierId);

    // 3. Trả về thành công lập tức (Mất chưa tới 0.5 giây!)
    return {
      success: true,
      message:
        "Gửi khảo sát thành công. Hệ thống AI đang phân tích dữ liệu ẩn ở hậu trường.",
    };
  } catch (err: any) {
    console.error("Submit Survey Error:", err);
    return { error: err.message || "Lỗi server lúc nộp bài." };
  }
}

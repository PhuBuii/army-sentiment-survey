"use server";

import { supabase as anonSupabase } from "@/lib/supabase";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";

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
      return { error: "Không tìm thấy chiến sĩ hoặc link khảo sát không hợp lệ." };
    }

    const { data: questions, error: qError } = await anonSupabase
      .from("questions")
      .select("id, content");

    if (qError || !questions || questions.length === 0) {
      return { error: "Chưa có danh sách câu hỏi trong hệ thống." };
    }

    let finalQuestions = [];
    
    if (soldier.is_completed) {
      return { error: "Đồng chí đã hoàn thành khảo sát này. Mỗi tài khoản chỉ được thực hiện một lần." };
    }
    
    // Chọn ngẫu nhiên 5 câu hỏi
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    finalQuestions = shuffled.slice(0, 5);

    return {
      soldier: { id: soldier.id, full_name: soldier.full_name, unit: soldier.unit },
      questions: finalQuestions,
      isCompleted: soldier.is_completed,
      previousAnswers: {}
    };
  } catch (err: any) {
    return { error: err.message || "Lỗi server." };
  }
}

export async function submitSurveyAndAnalyze(
  soldierId: string,
  responses: { question: string; answer: string }[]
) {
  try {
    const adminSupabase = getAdminClient();

    // 0. Check if already completed to prevent duplicate submissions
    const { data: currentSoldier } = await adminSupabase
      .from("soldiers")
      .select("is_completed")
      .eq("id", soldierId)
      .single();

    if (currentSoldier?.is_completed) {
      console.warn(`[Submit] Soldier ${soldierId} already completed. Blocking submission.`);
      return { error: "Đồng chí đã hoàn thành khảo sát này rồi." };
    }

    // 1. AI Analysis with Fallback and Retry
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { error: "Thiếu cấu hình GEMINI_API_KEY." };
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // Cập nhật danh sách model dự phòng mới nhất theo tài liệu từ Google (Tháng 4/2026)
    // Ưu tiên bản 2.5-flash vì đã có Cache, sau đó chuyển sang các bản ổn định hoặc preview mạnh mẽ.
    const modelsToTry = [
      "gemini-2.0-flash",              // Ổn định nhất (Ưu tiên số 1)
      "gemini-2.0-pro-exp-02-05",      // Siêu thông minh (Dự phòng số 2)
      "gemini-2.5-flash",              // Bản mới nhất 2.5 (Ưu tiên số 3)
      "gemini-2.5-pro",                // Bản Pro 2.5
      "gemini-3-flash-preview",        // Bản Flash 3 mới
      "gemini-3.1-pro-preview",        // Bản Pro 3.1 mới nhất
    ];
    // 2. Lấy Cache Name động từ Supabase (được cập nhật tự động bởi Cron Job)
    let cacheName: string | null = null;
    try {
      const adminClient = getAdminClient();
      const { data: setting } = await adminClient
        .from("app_settings")
        .select("value")
        .eq("id", "GEMINI_CACHE_NAME")
        .single();
      if (setting?.value) {
        cacheName = setting.value;
        console.log("[AI] Cache Name loaded from DB:", cacheName);
      }
    } catch {
      // Fallback: đọc từ env nếu DB không có
      cacheName = process.env.GEMINI_CACHE_NAME || null;
      console.warn("[AI] Không đọc được Cache từ DB, dùng env fallback.");
    }

    let aiData = null;
    let lastError = null;
    for (const modelName of modelsToTry) {
      let retries = 0;
      const maxRetries = 2;

      while (retries <= maxRetries) {
        try {
          console.log(`Trying model: ${modelName} (Attempt ${retries + 1})`);
          let model;
          
          // Kiểm tra tương thích Cache (Gemini 2.x trở lên hỗ trợ tốt)
          const isCacheCompatible = cacheName && (modelName.includes("flash") || modelName.includes("pro"));

          if (isCacheCompatible) {
            model = genAI.getGenerativeModel({ 
              model: modelName,
              cachedContent: cacheName
            } as any);
          } else {
            model = genAI.getGenerativeModel({ model: modelName });
          }
          
          const schema = {
            type: "object",
            properties: {
              score: { type: "number", description: "Điểm số từ 0 đến 100" },
              status: { type: "string", description: "Chỉ chọn 1 trong 3 trạng thái: 'An tâm' | 'Dao động' | 'Nguy cơ'" },
              summary: { type: "string", description: "Nhận xét ngắn gọn 1-2 câu" },
              advice: { type: "string", description: "Lời khuyên hướng xử lý cho chỉ huy" },
              dialogue_script: { type: "string", description: "Gợi ý 3-5 câu hỏi cụ thể để chỉ huy dùng khi trò chuyện 1-1 với chiến sĩ này" }
            },
            required: ["score", "status", "summary", "advice", "dialogue_script"]
          };

          const prompt = `Bạn là chuyên gia tâm lý quân đội. Hãy phân tích 5 câu trả lời này để đánh giá tư tưởng chiến sĩ.
Dữ liệu đầu vào:
${JSON.stringify(responses, null, 2)}

Yêu cầu bổ sung: Dựa trên những gì chiến sĩ chia sẻ, hãy soạn một "Kịch bản đối thoại" gồm các câu hỏi gợi mở để cán bộ chỉ huy có thể dùng để bắt đầu buổi trò chuyện 1-1 một cách tự nhiên và hiệu quả nhất.

Hãy xuất dữ liệu dưới dạng JSON thuần theo đúng cấu trúc yêu cầu.`;

          const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: "application/json",
              responseSchema: schema as any, // Luôn áp dụng schema vì các model 2.x/3.x đều hỗ trợ
            }
          });
          let textResult = result.response.text();
          
          // Clean potential markdown quotes
          textResult = textResult.replace(/^```json/g, '').replace(/^```/g, '').replace(/```$/g, '').trim();

          try {
            aiData = JSON.parse(textResult);
            
            // Validate required fields if schema wasn't strictly enforced
            if (aiData.score === undefined || aiData.status === undefined || aiData.summary === undefined) {
              console.error("AI missing fields:", aiData);
              throw new Error("Kết quả AI thiếu thông tin quan trọng.");
            }

            break; // Success! Exit retry loop
          } catch (e) {
            console.error(`AI parse/validate fail for ${modelName}`, textResult);
            throw new Error(`Lỗi xử lý kết quả từ AI (${modelName}).`);
          }
        } catch (err: any) {
          lastError = err;
          const isRetryable = err.message?.includes("503") || err.message?.includes("429") || err.message?.includes("high demand");
          
          if (isRetryable && retries < maxRetries) {
            retries++;
            // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000));
            continue;
          }
          break; // Not retryable or max retries reached, try next model
        }
      }
      
      if (aiData) break; // If we got data from any model, stop trying
    }

    if (!aiData) {
      console.error("All AI models failed:", lastError);
      return { error: `AI đang quá tải (503). Vui lòng thử lại sau ít phút. Chi tiết: ${lastError?.message || "Unknown error"}` };
    }

    // 2. Database Operations (System Level)
    console.log(`[DB] Saving submission for soldier: ${soldierId}`);

    // 2.1 Save submission
    let { error: insertError } = await adminSupabase.from("submissions").insert({
      soldier_id: soldierId,
      responses: responses,
      ai_score: aiData.score,
      ai_status: aiData.status,
      ai_summary: aiData.summary,
      ai_advice: aiData.advice,
      ai_dialogue_script: aiData.dialogue_script,
    });

    // Fallback: If insert fails (possibly due to missing column ai_dialogue_script), try without it
    if (insertError && insertError.message.includes("ai_dialogue_script")) {
      console.warn("Retrying insert without ai_dialogue_script column...");
      const { error: retryError } = await adminSupabase.from("submissions").insert({
        soldier_id: soldierId,
        responses: responses,
        ai_score: aiData.score,
        ai_status: aiData.status,
        ai_summary: aiData.summary,
        ai_advice: aiData.advice,
      });
      insertError = retryError;
    }

    if (insertError) {
      console.error("[DB] Insert submission failed:", insertError);
      throw insertError;
    }

    console.log(`[DB] Submission saved successfully. Marking soldier as completed.`);

    // 2.2 Mark soldier as completed
    const { error: updateError } = await adminSupabase
      .from("soldiers")
      .update({ is_completed: true })
      .eq("id", soldierId);

    if (updateError) throw updateError;

    return { success: true };
  } catch (err: any) {
    console.error("Submit Survey Error:", err);
    return { error: err.message || "Lỗi xử lý gửi bài." };
  }
}

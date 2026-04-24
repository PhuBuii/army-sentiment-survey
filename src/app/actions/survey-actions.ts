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
    // 1. AI Analysis with Fallback and Retry
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { error: "Thiếu cấu hình GEMINI_API_KEY." };
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // Ưu tiên bản 2.5-flash vì đã có Cache, sau đó mới thử các bản preview/lite nếu bị quá tải
    const modelsToTry = ["gemini-2.5-flash", "gemini-3.1-flash-lite-preview"];
    let aiData = null;
    let lastError = null;

    for (const modelName of modelsToTry) {
      let retries = 0;
      const maxRetries = 2;

      while (retries <= maxRetries) {
        try {
          console.log(`Trying model: ${modelName} (Attempt ${retries + 1})`);
          let model;
          const cacheName = process.env.GEMINI_CACHE_NAME;
          
          // CRITICAL: Context Caching only works if the model name matches exactly what was used to create the cache
          // Usually, the cache is created with a specific stable model like gemini-1.5-flash or gemini-2.5-flash.
          const isCacheCompatible = cacheName && (modelName === "gemini-2.5-flash" || modelName === "models/gemini-2.5-flash");

          if (isCacheCompatible) {
            model = genAI.getGenerativeModel({ 
              model: modelName,
              cachedContent: { name: cacheName } as any
            });
          } else {
            model = genAI.getGenerativeModel({ model: modelName });
          }
          
          const prompt = `Bạn là chuyên gia tâm lý quân đội. Hãy phân tích 5 câu trả lời này để đánh giá tư tưởng chiến sĩ.
Dữ liệu đầu vào:
${JSON.stringify(responses, null, 2)}

Luôn trả về duy nhất định dạng JSON thuần (không bọc trong markdown block), với cấu trúc chính xác sau:
{
  "score": <điểm số từ 0 đến 100, số nguyên>,
  "status": "<chỉ chọn 1 trong 3 trạng thái: 'An tâm' | 'Dao động' | 'Nguy cơ'>",
  "summary": "<nhận xét ngắn gọn 1-2 câu>",
  "advice": "<lời khuyên hướng xử lý cho chỉ huy>"
}`;

          const result = await model.generateContent(prompt);
          let textResult = result.response.text();
          
          // Clean potential markdown quotes
          textResult = textResult.replace(/^```json/g, '').replace(/^```/g, '').replace(/```$/g, '').trim();

          try {
            aiData = JSON.parse(textResult);
            break; // Success! Exit retry loop
          } catch (e) {
            console.error(`AI parse fail for ${modelName}`, textResult);
            throw new Error("Lỗi phân tích cú pháp kết quả từ AI.");
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
    const adminSupabase = getAdminClient();

    // 2.1 Save submission
    const { error: insertError } = await adminSupabase.from("submissions").insert({
      soldier_id: soldierId,
      responses: responses,
      ai_score: aiData.score,
      ai_status: aiData.status,
      ai_summary: aiData.summary,
      ai_advice: aiData.advice,
    });

    if (insertError) throw insertError;

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

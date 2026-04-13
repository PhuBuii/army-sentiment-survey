"use server";

import { supabase } from "@/lib/supabase";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function validateTokenAndGetQuestions(token: string) {
  try {
    const { data: soldier, error: soldierError } = await supabase
      .from("soldiers")
      .select("*")
      .eq("token", token)
      .single();

    if (soldierError || !soldier) {
      return { error: "Không tìm thấy chiến sĩ hoặc link khảo sát không hợp lệ." };
    }

    if (soldier.is_completed) {
      return { error: "Khảo sát này đã được hoàn thành trước đó." };
    }

    const { data: questions, error: qError } = await supabase
      .from("questions")
      .select("id, content");

    if (qError || !questions || questions.length === 0) {
      return { error: "Chưa có danh sách câu hỏi trong hệ thống." };
    }

    // Chọn ngẫu nhiên 5 câu hỏi
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 5);

    return {
      soldier: { id: soldier.id, full_name: soldier.full_name, unit: soldier.unit },
      questions: selected,
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
    // 1. AI Analysis
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { error: "Thiếu cấu hình GEMINI_API_KEY." };
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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

    let aiData;
    try {
      aiData = JSON.parse(textResult);
    } catch (e) {
      console.error("AI parse fail", textResult);
      return { error: "Lỗi phân tích cú pháp kết quả từ AI." };
    }

    // 2. Save to Supabase
    const { error: insertError } = await supabase.from("submissions").insert({
      soldier_id: soldierId,
      responses: responses,
      ai_score: aiData.score,
      ai_status: aiData.status,
      ai_summary: aiData.summary,
      ai_advice: aiData.advice,
    });

    if (insertError) throw insertError;

    // 3. Mark soldier as completed
    const { error: updateError } = await supabase
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

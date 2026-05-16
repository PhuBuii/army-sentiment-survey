// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.2.1";

serve(async (req) => {
  let submissionId = null;
  let supabase = null;

  try {
    // 1. Nhận payload từ Webhook của Supabase
    const payload = await req.json();
    const { record, type } = payload;

    // Chỉ chạy khi có dữ liệu (INSERT hoặc UPDATE) và submission chưa được chấm điểm
    if (
      (type !== "INSERT" && type !== "UPDATE") ||
      record.ai_summary !== null
    ) {
      return new Response("Bỏ qua: Không phải bài nộp mới hoặc đã xử lý.", {
        status: 200,
      });
    }

    submissionId = record.id;
    const responses = record.responses; // Mảng question, answer

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    supabase = createClient(supabaseUrl, supabaseServiceKey);

    const apiKey = Deno.env.get("GEMINI_API_KEY")!;
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // 2. Chuẩn bị Prompt cho AI
    const promptText = `Bạn là Trợ lý Tâm lý Quân đội chuyên nghiệp. Nhiệm vụ của bạn là đọc các câu trả lời khảo sát của chiến sĩ và đánh giá:
    
Câu trả lời:
${JSON.stringify(responses, null, 2)}

Hãy trả về CHÍNH XÁC một đối tượng JSON có cấu trúc sau, KHÔNG CÓ KÝ TỰ MARKDOWN (\`\`\`json):
{
  "score": <số từ 1-100, 100 là tâm lý cực tốt, 1 là cực kỳ tồi tệ>,
  "status": "<CHỈ CHỌN 1 TRONG 3 TỪ NÀY: 'An tâm' hoặc 'Dao động' hoặc 'Nguy cơ'>",
  "summary": "<Tóm tắt 1 câu ngắn gọn vấn đề tâm lý của chiến sĩ>",
  "advice": "<Gợi ý hành động ngắn gọn cho chỉ huy>",
  "dialogue": "<Gợi ý kịch bản mở lời/trò chuyện để chỉ huy nói chuyện với chiến sĩ>"
}`;

    // 3. Gọi AI
    const result = await model.generateContent(promptText);
    const aiText = result.response.text();
    const cleanJsonText = aiText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();
    const aiObject = JSON.parse(cleanJsonText);

    // 4. Cập nhật lại vào Database
    const { error: updateError } = await supabase
      .from("submissions")
      .update({
        processing_status: "completed",
        ai_score: aiObject.score,
        ai_status: aiObject.status,
        ai_summary: aiObject.summary,
        ai_advice: aiObject.advice,
        ai_dialogue_script: aiObject.dialogue,
      })
      .eq("id", submissionId);

    if (updateError) {
      console.error("Lỗi khi update database:", updateError);
      return new Response("Lỗi update DB", { status: 500 });
    }

    return new Response(
      JSON.stringify({ success: true, ai_score: aiObject.score }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("Lỗi Edge Function:", errMsg);

    // Thử cập nhật trạng thái failed nếu có thể
    if (submissionId && supabase) {
      try {
        await supabase
          .from("submissions")
          .update({ processing_status: "failed" })
          .eq("id", submissionId);
      } catch (e) {
        console.error("Lỗi khi set trạng thái failed:", e);
      }
    }

    return new Response(JSON.stringify({ error: errMsg }), {
      status: 500,
    });
  }
});

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { NextResponse } from "next/server";
import { surveyRateLimiter } from "@/lib/ratelimit";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    // 1. Phân tích Rate Limit (Upstash Redis)
    if (surveyRateLimiter) {
       const ip = req.headers.get("x-forwarded-for") || "unknown";
       const { success } = await surveyRateLimiter.limit(ip);
       if (!success) {
         return NextResponse.json({ error: "Quá tải hệ thống. Vui lòng chậm lại (Rate Limited)." }, { status: 429 });
       }
    }

    // 2. Nhận dữ liệu đầu vào
    const { question, answer, followUpCount = 0 } = await req.json();

    if (!question || !answer) {
      return NextResponse.json({ error: "Thiếu dữ liệu (question/answer)" }, { status: 400 });
    }

    // 3. Sử dụng Vercel AI SDK và Gemini 2.0 Flash để quyết định hướng phỏng vấn
    const google = createGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY || "",
    });

    const isLastChance = followUpCount === 1;
    const systemPrompt = "Bạn là trợ lý tâm lý chuyên nghiệp phục vụ trong Quân đội. Chiến sĩ vừa trả lời cho câu hỏi: \"" + question + "\".\n" +
      "Hãy phân tích cẩn trọng câu trả lời của họ.\n\n" +
      "QUY TẮC QUAN TRỌNG:\n" +
      "1. Nếu câu trả lời có chứa thông tin tiêu cực mạnh, sự bất mãn, mệt mỏi quá độ, hoặc các từ khoá nhạy cảm (VD: 'muốn bỏ cuộc', 'áp lực', 'bị phạt oan'), bạn nên đặt 1 câu hỏi phụ để đào sâu nguyên nhân.\n" +
      "2. Đây là câu hỏi phụ thứ " + (followUpCount + 1) + " cho chủ đề này.\n" +
      (isLastChance ? "3. Đây là CƠ HỘI CUỐI CÙNG để hỏi về chủ đề này. Nếu cần hỏi, hãy đưa ra câu hỏi sâu sắc và bao quát nhất.\n" : "") +
      "4. Nếu câu trả lời đã đủ rõ ràng hoặc tích cực, hãy đặt needsFollowUp = false.\n" +
      "5. Luôn ưu tiên sự thấu hiểu, động viên.";

    const { object } = await generateObject({
      model: google("models/gemini-2.5-flash"), 
      maxOutputTokens: 250, 
      maxRetries: 3, // Tự động thử lại nếu gặp lỗi 503 hoặc quá tải
      system: systemPrompt,
      schema: z.object({
        needsFollowUp: z.boolean().describe("Trả về true nếu phát hiện tâm lý bất ổn cần khơi gợi thêm."),
        followUpQuestion: z.string().describe("Nếu needsFollowUp là true, sinh ra câu hỏi phụ ở đây. Nếu false, để chuỗi rỗng.").optional(),
      }),
      prompt: `Câu trả lời của chiến sĩ: "${answer}"`,
    });

    return NextResponse.json(object);
  } catch (error: any) {
    console.error("Interview API error:", error);
    return NextResponse.json({ error: error.message || "Lỗi khi xử lý hội thoại AI" }, { status: 500 });
  }
}

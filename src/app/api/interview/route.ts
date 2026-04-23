import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { NextResponse } from "next/server";
import { surveyRateLimiter } from "@/lib/ratelimit";

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
    const { question, answer } = await req.json();

    if (!question || !answer) {
      return NextResponse.json({ error: "Thiếu dữ liệu (question/answer)" }, { status: 400 });
    }

    // 3. Sử dụng Vercel AI SDK và Gemini 2.5 Flash để quyết định hướng phỏng vấn
    const google = createGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY || "",
    });

    const { object } = await generateObject({
      model: google("models/gemini-2.5-flash"), 
      system: `Bạn là trợ lý tâm lý chuyên nghiệp phục vụ trong Quân đội. Chiến sĩ vừa trả lời cho câu hỏi: "${question}".
Hãy phân tích cẩn trọng câu trả lời của họ.
Nếu câu trả lời có chứa thông tin tiêu cực mạnh, sự bất mãn, mệt mỏi quá độ, hoặc các từ khoá nhạy cảm (VD: 'muốn bỏ cuộc', 'áp lực', 'bị phạt oan'), bạn BẮT BUỘC phải đặt ra 1 câu hỏi phụ để đào sâu nguyên nhân và khơi gợi chia sẻ.
Nếu câu trả lời ổn định, bình thường hoặc tích cực, hãy cho phép qua câu tiếp theo.`,
      schema: z.object({
        needsFollowUp: z.boolean().describe("Trả về true nếu phát hiện tâm lý bất ổn cần khơi gợi thêm."),
        followUpQuestion: z.string().describe("Nếu needsFollowUp là true, sinh ra câu hỏi phụ ở đây. Ưu tiên văn phong động viên, thấu hiểu. Ví dụ: 'Đồng chí có thể chia sẻ thêm...' Nếu false, để chuỗi rỗng.").optional(),
      }),
      prompt: `Câu trả lời của chiến sĩ: "${answer}"`,
    });

    return NextResponse.json(object);
  } catch (error: any) {
    console.error("Interview API error:", error);
    return NextResponse.json({ error: error.message || "Lỗi khi xử lý hội thoại AI" }, { status: 500 });
  }
}

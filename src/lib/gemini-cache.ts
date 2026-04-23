import { GoogleAICacheManager } from "@google/generative-ai/server";

/**
 * GEMINI CONTEXT CACHING MANAGER
 * 
 * Sử dụng tính năng này để nạp một lượng lớn Context (VD: Cuốn điều lệnh 50,000 chữ) lên Google Server một lần.
 * Bạn sẽ tránh được việc phải nạp lại 50,000 chữ này vào bộ nhớ của AI mỗi khi có một chiến sĩ làm khảo sát mới.
 * Khả năng tiết kiệm: Giảm 70% giá thành Input Token.
 * 
 * LƯU Ý TỪ GOOGLE: Để tính năng Context Caching kích hoạt, tài liệu đưa vào CẦN phải dài tối thiểu 32,768 Tokens.
 * Nếu tài liệu quá ngắn, API sẽ từ chối lưu Cache.
 */

export async function setupMilitaryContextCache(massiveStringDocument: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("⚠️ Thiếu cấu hình GEMINI_API_KEY.");
  }

  // Yêu cầu thư viện @google/generative-ai/server (tích hợp trong @google/generative-ai bản mới)
  const cacheManager = new GoogleAICacheManager(apiKey);
  
  try {
    const cache = await cacheManager.create({
      model: "models/gemini-2.5-flash",
      displayName: "military-context-cache-v1",
      systemInstruction: "Bạn là hệ thống Trí tuệ Nhân tạo Phân tích Tâm lý Quân nhân. Hãy sử dụng những tài liệu cực lớn ngay dưới đây làm căn cứ phân tích...",
      contents: [
        {
          role: "user",
          parts: [{ text: massiveStringDocument }],
        },
      ],
      ttlSeconds: 60 * 60 * 24, // Sống 24 giờ. Refresh lại mỗi ngày bằng cronjob.
    });
    
    console.log("✅ Đã tạo Cache Content thành công. Cache Name:", cache.name);
    // Ví dụ output của cache.name: "cachedContents/xyz123abc"
    return cache.name; 
  } catch (error: any) {
    console.error("❌ Lỗi tạo Cache:", error.message);
    throw error;
  }
}

/**
 * CÁCH SỬ DỤNG:
 * Tại nơi khởi tạo AI (Ví dụ trong api/interview/route.ts)
 * 
 * const genAI = new GoogleGenerativeAI(apiKey);
 * 
 * // THAY VÌ 
 * // const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
 * 
 * // BẠN DÙNG
 * // const model = genAI.getGenerativeModelFromCachedContent({ name: "cachedContents/xyz123abc" })
 */

import { GoogleAICacheManager } from '@google/generative-ai/server';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load biến môi trường từ file .env.local
dotenv.config({ path: '.env.local' });

async function createGeminiCache() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("❌ Lỗi: Không tìm thấy GEMINI_API_KEY trong .env.local");
    process.exit(1);
  }

  const cacheManager = new GoogleAICacheManager(apiKey);
  
  // Đường dẫn tới file tài liệu lớn của bạn
  const documentPath = path.join(process.cwd(), 'military-rules.txt');

  if (!fs.existsSync(documentPath)) {
    console.error(`❌ Lỗi: Không tìm thấy file tài liệu tại ${documentPath}`);
    console.log("👉 HƯỚNG DẪN: Hãy tạo một file tên 'military-rules.txt' ở thư mục gốc của dự án.");
    console.log("👉 Lưu ý: File này cần chứa khối lượng văn bản rất lớn (tương đương khoảng 30.000 chữ) để đủ điều kiện cache của Google.");
    process.exit(1);
  }

  const documentContent = fs.readFileSync(documentPath, 'utf8');

  console.log("⏳ Đang tải tài liệu lên Google Server để tạo Cache...");

  try {
    const cache = await cacheManager.create({
      model: "models/gemini-2.5-flash",
      displayName: "Quy dinh Quan doi", // Tên hiển thị tuỳ chọn
      systemInstruction: "Bạn là AI phân tích tư tưởng quân nhân dựa trên bộ quy tắc chuẩn của quân đội. Sử dụng tài liệu cực dài này làm kim chỉ nam phân tích:",
      contents: [
        {
          role: "user",
          parts: [{ text: documentContent }],
        },
      ],
      ttlSeconds: 60 * 60 * 24 * 7, // Thời gian sống: lưu 7 ngày.
    });

    console.log("✅ THÀNH CÔNG! Đã tạo xong Cache.");
    console.log("🎯 Thông tin Cache Name của bạn là:");
    console.log("-------------------------------------------------");
    console.log(`CACHE_NAME=${cache.name}`);
    console.log("-------------------------------------------------");
    console.log("👉 Bước tiếp theo: Copy dòng 'CACHE_NAME=...' bên trên dán vào file .env.local của bạn.");

  } catch (error: any) {
    console.error("❌ Xảy ra lỗi khi tạo Cache. Chi tiết:");
    console.error(error.message);
    if (error.message.includes("Token count")) {
       console.log("💡 LỜI KHUYÊN: Tài liệu của bạn quá ngắn. Google yêu cầu tài liệu phải dài tối thiểu 32,768 tokens (khoảng 30-40 trang A4) thì tính năng bộ đệm (Caching) mới kích hoạt.");
    }
  }
}

createGeminiCache();

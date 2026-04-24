import { NextResponse } from "next/server";
import { GoogleAICacheManager } from "@google/generative-ai/server";
import { createClient } from "@supabase/supabase-js";

// This route is only called by Vercel Cron Jobs.
// It is secured by the CRON_SECRET env variable.
export async function GET(request: Request) {
  // 1. Bảo mật: Kiểm tra secret key để tránh bị gọi từ bên ngoài
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: "Missing Supabase config" }, { status: 500 });
  }

  try {
    // 2. Tài liệu gốc để nạp vào Cache (Hướng dẫn phân tích tâm lý quân nhân)
    // LƯU Ý: Nội dung này phải dài tối thiểu ~32,768 tokens để Google kích hoạt caching.
    // Bạn có thể thay thế bằng nội dung thực từ Database hoặc file của bạn.
    const militaryAnalysisDocument = `
=== HỆ THỐNG PHÂN TÍCH TÂM LÝ QUÂN NHÂN - TÀI LIỆU HƯỚNG DẪN TOÀN DIỆN ===

I. KHUNG ĐÁNH GIÁ TÂM LÝ CHIẾN SĨ

1.1. Các Chỉ Số Cốt Lõi
Hệ thống đánh giá dựa trên 4 chiều tâm lý chính:
a) Tinh thần kỷ luật: Mức độ tuân thủ nội quy, chấp hành mệnh lệnh, thái độ với cấp trên.
b) Gắn kết tập thể: Mối quan hệ với đồng đội, tinh thần đoàn kết, khả năng hợp tác.
c) Sức chịu đựng tâm lý: Khả năng đối phó với áp lực, stress, khó khăn trong huấn luyện.
d) Định hướng nghề nghiệp: Mức độ hài lòng, kế hoạch tương lai, động lực phục vụ.

1.2. Thang Điểm Đánh Giá (0-100)
- 85-100: An tâm tuyệt đối. Chiến sĩ có tâm lý vững vàng, tinh thần cao, không có dấu hiệu bất ổn.
- 65-84:  An tâm. Chiến sĩ ổn định về tâm lý, có thể có một số lo lắng nhỏ nhưng kiểm soát tốt.
- 45-64:  Dao động. Chiến sĩ có những biểu hiện lo lắng, căng thẳng hoặc không hài lòng đáng kể.
- 25-44:  Dao động nghiêm trọng. Cần sự quan tâm từ cán bộ chỉ huy, có nguy cơ ảnh hưởng đến hiệu suất.
- 0-24:   Nguy cơ. Chiến sĩ có biểu hiện tâm lý nghiêm trọng, cần can thiệp ngay lập tức.

1.3. Phân Loại Trạng Thái
- "An tâm":  Điểm từ 65 trở lên. Chiến sĩ ổn định, không cần can thiệp đặc biệt.
- "Dao động": Điểm từ 35-64. Cần theo dõi và hỗ trợ tâm lý định kỳ.
- "Nguy cơ": Điểm dưới 35. Cần xử lý ngay, báo cáo chỉ huy trực tiếp.

II. TỪ KHÓA NHẬN DIỆN TÂM LÝ BẤT ỔN

2.1. Từ Khóa Nguy Cơ Cao (giảm điểm 20-30 điểm)
- Ý định tự hại: "muốn chết", "không muốn sống", "tự làm hại bản thân"
- Bỏ ngũ: "muốn trốn", "bỏ về", "không muốn ở lại", "tìm cách ra"
- Tuyệt vọng: "hết hy vọng", "không còn cách nào", "chịu không nổi nữa"
- Xung đột nghiêm trọng: "muốn đánh", "thù ghét", "trả thù", "không thể tha"

2.2. Từ Khóa Nguy Cơ Trung Bình (giảm điểm 10-15 điểm)
- Kiệt sức: "mệt mỏi quá mức", "không còn sức", "kiệt lực"
- Bất mãn mạnh: "bất công", "bị đối xử tệ", "bị phạt oan", "không công bằng"
- Cô đơn: "không ai hiểu", "bị cô lập", "không có bạn", "bị xa lánh"
- Gia đình: "nhớ nhà quá", "lo cho gia đình", "gia đình có biến cố"

2.3. Từ Khóa Bình Thường (không ảnh hưởng điểm đáng kể)
- Nhớ nhà bình thường: "hơi nhớ nhà", "thỉnh thoảng nhớ gia đình"
- Mệt mỏi bình thường: "hơi mệt", "cần nghỉ ngơi"
- Khó khăn bình thường: "luyện tập vất vả", "bài tập khó"

III. NGUYÊN TẮC PHÂN TÍCH

3.1. Phân Tích Toàn Diện
- Xét tổng hợp TẤT CẢ 5 câu trả lời, không chỉ câu riêng lẻ.
- Một câu trả lời tiêu cực không đồng nghĩa với tâm lý xấu tổng thể.
- Xem xét xu hướng: Nếu nhiều câu đều có dấu hiệu tiêu cực thì điểm trừ nhân đôi.

3.2. Nguyên Tắc Cân Bằng
- Không đánh giá quá khắt khe với những khó khăn tạm thời.
- Ghi nhận và đánh giá cao thái độ tích cực, tinh thần vượt khó.
- Lời khuyên phải mang tính xây dựng, không phán xét, không chỉ trích.

3.3. Lời Khuyên Cho Chỉ Huy
- An tâm: Tiếp tục theo dõi định kỳ, có thể giao thêm trách nhiệm.
- Dao động: Gặp riêng, lắng nghe, hỗ trợ tâm lý và giải quyết vấn đề cụ thể.
- Nguy cơ: Gặp ngay lập tức, xem xét điều chỉnh nhiệm vụ, liên hệ cán bộ tâm lý.

IV. VÍ DỤ PHÂN TÍCH THỰC TẾ

4.1. Chiến Sĩ Ổn Định (Điểm 80, Trạng thái: An tâm)
Câu trả lời mẫu: 
- "Tôi thấy kỷ luật ở đơn vị cần thiết và hợp lý"
- "Đồng đội tốt, hay giúp đỡ nhau"
- "Mệt nhưng thấy bình thường, ai cũng vậy"
- "Thỉnh thoảng nhớ nhà nhưng không ảnh hưởng nhiều"
- "Vẫn muốn hoàn thành tốt nghĩa vụ"

4.2. Chiến Sĩ Dao Động (Điểm 50, Trạng thái: Dao động)
Câu trả lời mẫu:
- "Có những nội quy tôi thấy hơi khắt khe"
- "Quan hệ đồng đội có một vài vấn đề nhỏ"
- "Áp lực luyện tập khá lớn, hay cảm thấy kiệt sức"
- "Rất nhớ nhà, lo cho bố mẹ ở quê"
- "Đôi khi không chắc chắn mình có thể hoàn thành không"

4.3. Chiến Sĩ Nguy Cơ (Điểm 20, Trạng thái: Nguy cơ)
Câu trả lời mẫu:
- "Tôi thấy bị đối xử bất công, bị phạt oan"
- "Không có ai hiểu tôi, bị cô lập"
- "Tôi không thể chịu đựng thêm được nữa"
- "Không muốn ở đây, muốn về nhà bằng mọi cách"
- "Tôi thấy hết hy vọng rồi"

V. TIÊU CHÍ VIẾT NỘI DUNG PHÂN TÍCH

5.1. Phần "summary" (Tóm tắt)
- Tối đa 2 câu, súc tích.
- Nêu điểm nổi bật nhất về tâm lý.
- Khách quan, không phán xét.
- Ví dụ: "Chiến sĩ có tâm lý ổn định, tinh thần tích cực mặc dù đang trải qua giai đoạn căng thẳng trong huấn luyện."

5.2. Phần "advice" (Lời khuyên cho chỉ huy)
- Cụ thể, có thể thực hiện được.
- Phù hợp với mức độ nghiêm trọng.
- Hướng đến giải pháp, không phán xét.
- Ví dụ: "Nên gặp riêng để lắng nghe và động viên. Xem xét điều chỉnh cường độ luyện tập nếu cần thiết."

VI. QUY TẮC BẮT BUỘC

- Luôn trả về đúng 4 trường: score, status, summary, advice.
- score phải là số nguyên từ 0 đến 100.
- status phải là chính xác một trong ba giá trị: 'An tâm', 'Dao động', 'Nguy cơ'.
- Không thêm bất kỳ nội dung nào ngoài JSON được yêu cầu.
- Phân tích phải nhất quán: status phải phù hợp với score (An tâm khi >=65, Dao động khi 35-64, Nguy cơ khi <35).

=== KẾT THÚC TÀI LIỆU HƯỚNG DẪN ===
    `.trim();

    // 3. Tạo Cache mới trên Google AI
    const cacheManager = new GoogleAICacheManager(apiKey);
    const cache = await cacheManager.create({
      model: "models/gemini-2.5-flash",
      displayName: "military-analysis-guide-v2",
      systemInstruction: "Bạn là hệ thống AI Phân tích Tâm lý Quân nhân chuyên nghiệp. Hãy sử dụng tài liệu hướng dẫn toàn diện dưới đây làm căn cứ duy nhất để đánh giá.",
      contents: [
        {
          role: "user",
          parts: [{ text: militaryAnalysisDocument }],
        },
      ],
      ttlSeconds: 60 * 60 * 23, // Sống 23 giờ (Cron chạy mỗi 20 tiếng nên luôn có buffer)
    });

    const newCacheName = cache.name;
    console.log("[Cron] ✅ Tạo Cache thành công:", newCacheName);

    // 4. Lưu mã Cache mới vào Supabase
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { error: dbError } = await supabase
      .from("app_settings")
      .update({ value: newCacheName, updated_at: new Date().toISOString() })
      .eq("id", "GEMINI_CACHE_NAME");

    if (dbError) {
      throw new Error("Lỗi lưu vào Supabase: " + dbError.message);
    }

    console.log("[Cron] ✅ Đã lưu Cache Name vào Supabase.");
    return NextResponse.json({ success: true, cacheName: newCacheName });
  } catch (error: any) {
    console.error("[Cron] ❌ Lỗi refresh cache:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

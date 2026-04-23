# KIẾN TRÚC & LUỒNG HOẠT ĐỘNG (SYSTEM ARCHITECTURE WORKFLOW)
**Dự án**: AI Army Sentiment Survey - Phiên bản SaaS Architecture

Tài liệu này tổng hợp toàn bộ luồng hoạt động của hệ thống từ góc nhìn kiến trúc phần mềm, chỉ dẫn tường minh cách tính năng AI, Database và Rate-Limiting liên kết với nhau.

---

## 1. Kiến trúc Tổng thể (Overall Architecture)

Hệ thống hoạt động theo mô hình **Client-Server Serverless**, sử dụng Next.js làm Fullstack Framework:
*   **Frontend (Client Component):** React / Tailwind CSS / Shadcn UI.
*   **Backend (Server Actions / API Routes):** Xử lý logic trên hạ tầng Node.js an toàn (không lộ API key).
*   **Database (BaaS):** Supabase PostgreSQL, bảo mật bằng Row Level Security (RLS).
*   **Bảo vệ hệ thống (Ratelimit):** Upstash Redis.
*   **Engine Trí tuệ (LLM):** Google Gemini 2.5 Flash / 3.0 Pro thông qua Vercel AI SDK.

---

## 2. Luồng Người Dùng (User Flows)

### A. Luồng Quản trị viên (Admin Flow)
1. **Đăng nhập:** Xác thực qua hệ thống Auth của Supabase. Trả về Session Token cho trình duyệt.
2. **Quản lý Dữ liệu:** Admin có thể thêm Chiến sĩ, xuất/nhập danh sách qua Excel.
3. **Giám sát:** Biểu đồ Real-time cập nhật số lượng chiến sĩ *An tâm, Dao động, Nguy cơ* lấy từ database Submissions.
4. **Cấp quyền:** Admin tạo tài khoản hoặc đổi mật khẩu qua Admin Service Role Client (bỏ qua mọi rào cản RLS).

### B. Luồng Chiến sĩ - Khảo sát Tương tác AI (Interview Mode)
1. **Truy cập Link:** Khớp `token` từ URL với bảng `soldiers`. Đảm bảo chiến sĩ chưa thi. Lấy ra ngẫu nhiên 5 câu hỏi từ bảng `questions`.
2. **Phỏng vấn thời gian thực (Interactive Real-time):**
   *   Chiến sĩ nhập câu trả lời cho Câu 1.
   *   Trước khi qua Câu 2, UI sẽ tự động đẩy đoạn text lên `/api/interview` (có bảo vệ bởi **Rate Limit**).
   *   **AI (Gemini) Đánh giá:** Dùng kĩ thuật *Structured Output* (trả về JSON bắt buộc) xem câu trả lời có chứa cờ đỏ (Red flag: chán nản, bị phạt, áp lực) không.
   *   **Rẽ nhánh:**
       *   Trường hợp bình thường: Chuyển thẳng sang Câu 2.
       *   Trường hợp có cờ đỏ: API sẽ trả về `needsFollowUp: true` kèm theo 1 câu hỏi phụ vừa được Gemini sinh ra (VD: *"Vì sao đồng chí lại nghĩ như vậy?"*). Hệ thống sẽ bắt chiến sĩ trả lời trước khi đi tiếp.
3. **Kết thúc bài:** Gom lại toàn bộ Q&A form (bao gồm cả các câu AI hỏi thêm), gửi cho Gemini đánh giá Tổng quan lần cuối.
4. **Lưu trữ:** Ghi kết quả điểm, xếp loại, nhận xét và lời khuyên vào Supabase bằng quyền Service Role. Cập nhật `is_completed = true`.

---

## 3. Hướng dẫn thiết lập Upstash Redis (Chống Spam AI)

Hiện tại có vô vàn Bot chuyên spam điền form tự động. Nếu không bị chặn, chúng có thể gọi API Gemini hàng chục nghìn lần, đốt sạch tài khoản Billing Google của bạn.
**Upstash Redis** cung cấp cơ chế giới hạn lượng Request dựa trên địa chỉ IP (Rate Limiting) hoàn toàn miễn phí.

### Cách lấy cấu hình Upstash:
1. Truy cập [Upstash Console](https://console.upstash.com/). Đăng nhập bằng tài khoản Google/GitHub.
2. Tại tab "Redis", bấm nút **Create Database**.
   *   Name: `army-ai-ratelimit`
   *   Type: `Regional` (Chọn khu vực Singapore để gần VN nhất, ping thấp).
   *   Bật tính năng `Eviction` mặc định.
3. Khi tạo xong, cuộn xuống phần **REST API**.
4. Bạn sẽ thấy 2 thông số:
   *   `UPSTASH_REDIS_REST_URL`
   *   `UPSTASH_REDIS_REST_TOKEN`
5. Copy 2 tham số này, mở file `.env.local` ở thư mục code và dán vào:
```env
UPSTASH_REDIS_REST_URL="https://magnetic-moccasin-xxxxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="AYxxASQg..."
```

---

## 4. Hướng dẫn thiết lập Gemini Context Caching (Token Optimization)

Khi hệ thống phát triển, bạn muốn AI đóng giả làm Sĩ quantheo chuẩn điều lệnh mới nhất (Rulebook nặng 100 trang PDF / 50.000 tokens). Nếu mỗi bài khảo sát của chiến sĩ đều nạp lại 50.000 tokens này, chi phí sẽ rất cao.

**Cơ chế Context Caching:**
Chúng ta sẽ "trả tiền 1 lần" để tải file đó lên kho Cache của Google. Nhận về 1 cái mã `cacheName` (Giống như thẻ thư viện).
Những lần sau chỉ cần đưa cái "thẻ thư viện" (string 50 kí tự) đó cho Gemini là nó lập tức nhớ lại cả 100 trang tài liệu trong tích tắc, **giảm tới 75% chi phí**.

### Cách hoạt động trong Code (Tham chiếu file `src/lib/gemini-cache.ts`):
Hệ thống cung cấp hàm `setupMilitaryContextCache()`. Bạn có thể:
1. Đọc file text chứa "Quy tắc Điều lệnh Bộ đội".
2. Gọi hàm upload lên Google Cache Manager, đặt thời gian sống (TTL) ví dụ 60 phút.
3. Lấy `cacheName` thu được đem vào API gọi phân tích bình thường.
*Lưu ý: Mặc định tính năng này đòi hỏi ít nhất 32,768 tokens nội dung thô để Google cho phép lập Cache. Nếu nội dung ngắn dăm ba chữ, Google sẽ từ chối Cache vì vốn chẳng cần thiết tiết kiệm lượng nhỏ như vậy.*

---
*(Xem code triển khai gốc tại các file: `ratelimit.ts`, `api/interview/route.ts`...)*

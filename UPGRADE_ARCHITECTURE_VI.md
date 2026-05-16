# 🚀 KẾ HOẠCH NÂNG CẤP KIẾN TRÚC: XỬ LÝ BẤT ĐỒNG BỘ CHO AI (ASYNC PROCESSING)

Hiện tại, khi quân nhân nộp bài, hệ thống đang phải chờ AI (Gemini) xử lý xong mới trả về thông báo thành công. Việc này có 2 rủi ro lớn:

1. **Trải nghiệm người dùng (UX) kém:** Người dùng phải chờ màn hình loading rất lâu (5-15 giây).
2. **Lỗi Timeout:** Nếu AI phản hồi chậm hoặc có hàng trăm quân nhân nộp bài cùng lúc, máy chủ web (đặc biệt là môi trường Serverless như Vercel) sẽ ngắt kết nối (Timeout), dẫn đến mất dữ liệu hoặc báo lỗi 504.

Để giải quyết, chúng ta cần chuyển đổi kiến trúc từ **Đồng bộ (Synchronous)** sang **Bất đồng bộ (Asynchronous)** sử dụng Message Queue (Hàng đợi tin nhắn) và Redis.

---

## 🏗️ 1. LỰA CHỌN CÔNG NGHỆ (TECH STACK)

Việc dùng **Kafka** là **quá nặng và phức tạp** so với quy mô của hệ thống này, nó phù hợp cho kiến trúc Microservices khổng lồ. Thay vào đó, dưới đây là các lựa chọn thông minh và tiết kiệm chi phí hơn:

### 👉 Lựa chọn 1: Redis + BullMQ (Nếu deploy trên VPS/Server riêng)

- **Redis:** Làm bộ nhớ đệm (Cache) siêu tốc và lưu trữ hàng đợi.
- **BullMQ:** Thư viện Node.js rất mạnh giúp quản lý hàng đợi trên nền Redis (quản lý job thất bại, thử lại, ưu tiên...).

### 👉 Lựa chọn 2: Upstash QStash + Redis (Nếu deploy trên Vercel/Serverless) - _[KHUYẾN NGHỊ]_

- Vì dự án đang dùng Next.js, nếu host trên Vercel, bạn không thể chạy các tiến trình ngầm (Background Worker) liên tục.
- **Upstash QStash:** Là một Message Queue dành riêng cho Serverless. Nó sẽ nhận yêu cầu, sau đó gọi ngầm vào một API của bạn (Webhook) để tự động xử lý.

### 👉 Lựa chọn 3: Tận dụng Supabase (Không cần thêm Server ngoài)

- Vì dự án đã dùng Supabase, bạn có thể tận dụng **Supabase Edge Functions** (chạy ngầm) hoặc tính năng Webhooks của Supabase để tự bắt sự kiện (Trigger) khi có bài nộp mới vào Database và gửi cho AI.

---

## 🗺️ 2. LUỒNG HOẠT ĐỘNG MỚI (NEW WORKFLOW)

Thay vì bắt người dùng đợi, tiến trình mới sẽ diễn ra trong chớp mắt:

1. **Quân nhân nộp bài:** Webapp lưu bài nộp vào Database (bảng `submissions`) với trạng thái `ai_status = 'pending'` (Đang chờ phân tích).
2. **Phản hồi tức thì:** Webapp báo ngay lập tức cho quân nhân: _"Gửi bài thành công! Hệ thống đang xử lý."_ (Mất < 1 giây).
3. **Đẩy vào Hàng đợi (Message Queue):** Webapp gửi ID của bài nộp vào hàng đợi (Redis/QStash).
4. **Xử lý ngầm (Background Worker):**
   - Một Server/Hàm ẩn sẽ bốc ID từ hàng đợi ra.
   - Trực tiếp lấy nội dung bài nộp lên và gửi cho Gemini AI.
   - Nhận kết quả từ AI và cập nhật lại vào Database.
5. **Cập nhật giao diện (Supabase Realtime):**
   - Admin Dashboard đang mở sẽ tự động nảy kết quả mới thông qua công nghệ WebSocket của Supabase mà không cần bấm F5.

---

## 🛠️ 3. CÁC BƯỚC TRIỂN KHAI CHI TIẾT (LỘ TRÌNH 4 BƯỚC)

### Giai đoạn 1: Chuẩn bị Database & UI (1 Ngày)

- Cập nhật schema database: Thêm cột trạng thái xử lý AI trong bảng `submissions` (VD: `processing_status`: `pending`, `processing`, `completed`, `failed`).
- Sửa lại hàm nộp bài API: Chỉ lưu Database và trả về ID, bỏ hoàn toàn đoạn gọi tới Gemini API.
- Cập nhật Admin Dashboard: Thêm icon "Đang xoay" (Loading) cho các thẻ bài nộp có trạng thái `pending`.

### Giai đoạn 2: Tích hợp Hàng đợi (Message Queue) (1-2 Ngày)

- Thiết lập Redis (thông qua Upstash hoặc cài trên VPS).
- Viết Logic đẩy Job (Đẩy `submission_id` vào Redis Queue ngay sau khi insert Database thành công).

### Giai đoạn 3: Viết Worker xử lý AI (Background Job) (2 Ngày)

- Chuyển toàn bộ đoạn code gọi Gemini AI cũ sang một hàm xử lý độc lập (Worker).
- Hàm này sẽ:
  1. Lấy Job từ Queue (lấy được `submission_id`).
  2. Query lấy nội dung câu trả lời của quân nhân.
  3. Gặp AI xin lời khuyên + chấm điểm.
  4. Cập nhật (Update) kết quả vào bảng `submissions` với `processing_status = 'completed'`.
  5. Nếu AI bị lỗi hoặc vượt quá giới hạn API, tính năng _Retry_ của hàng đợi sẽ tự động gọi lại sau vài phút.

### Giai đoạn 4: Realtime Dashboard (1 Ngày)

- Tận dụng `Supabase Realtime` trên Next.js (Admin Dashboard).
- Lắng nghe sự kiện: Bất cứ khi nào bảng `submissions` có thay đổi (`UPDATE`), giao diện Admin sẽ tự động render ra điểm số và lời khuyên của người đó.

---

## 💰 TỔNG KẾT

Kế hoạch này giúp trang web của bạn:

- **Nhanh hơn gấp 10 lần** ở phía người dùng.
- Trải nghiệm Admin "xịn sò" (như đang dùng app chat, nộp phát thông báo nổi lên ngay).
- **An toàn tuyệt đối:** Tránh thất thoát bài nộp do mạng yếu, AI sập, hay bị tấn công hàng loạt. Mọi bài thi chưa được chấm sẽ nằm an toàn trong hàng đợi thay vì bị rớt (drop).

# Hướng Dẫn Cài Đặt (Setup Guide)

Chào mừng bạn đến với dự án **AI Survey for Army**. Dưới đây là hướng dẫn chi tiết từng bước để khởi chạy dự án trên máy tính của bạn.

---

## Bước 1: Khởi tạo Cơ sở dữ liệu (Supabase)

Dự án này sử dụng Supabase làm Database và nền tảng Backend as a Service.

1. Đăng nhập hoặc tạo tài khoản miễn phí tại [Supabase](https://supabase.com/).
2. Tạo một **New Project**.
3. Khi Project đã sẵn sàng, vào mục **SQL Editor** ở thanh menu bên trái.
4. Copy toàn bộ nội dung từ file `schema.sql` (nằm ngoài thư mục gốc `AI_survey_for_army`) rồi dán vào SQL Editor và nhấn **Run**.
   *(Thao tác này sẽ tự động tạo bảng `questions`, `soldiers` và `submissions` cho bạn)*
5. Vào mục **Project Settings** (hình bánh răng) > **API**. Copy 2 thông tin sau:
   - **Project URL**
   - **Project API keys** (Lấy mục *anon` `public*)

---

## Bước 2: Tạo khóa API của Google Gemini

Hệ thống sử dụng AI của Google để phân tích tâm lý.

1. Truy cập [Google AI Studio](https://aistudio.google.com/).
2. Đăng nhập bằng tài khoản Google của bạn.
3. Nhấp vào nút **Get API key** ở thanh menu và tạo mới một khóa API tĩnh. Sao chép lại khóa này.

---

## Bước 3: Cấu hình mã nguồn (Môi trường)

1. Mở thư mục `army-sentiment-survey` bằng trình soạn thảo (ví dụ: VS Code).
2. Mở file có tên `.env.local` ở ngay ngoài cùng thư mục `army-sentiment-survey`.
   *(Nếu bạn không thấy file này, hãy tự tạo một file mới mang đúng tên `.env.local`)*
3. Dán các khóa vừa copy vào file với định dạng như sau:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5c...
GEMINI_API_KEY=AIzaSyB...
```
*(Hãy thay đường dẫn url, đoạn mã key từ Supabase và Google Studio trên máy bạn bỏ vào đây).*

---

## Bước 4: Chạy Website

1. Nhấn chuột phải vào thư mục `army-sentiment-survey` và chọn **Open in Integrated Terminal** trên VS Code.
2. (Tùy chọn) Chạy lệnh cài đặt lại các gói nếu mã nguồn bị khuyết:
   ```bash
   npm install
   ```
3. Khởi động server lập trình:
   ```bash
   npm run dev
   ```
4. Cuối cùng, để trải nghiệm:
   - Quản lý / Upload: **http://localhost:3000/admin/dashboard**
   - Hoặc gõ trực tiếp **http://localhost:3000** để xem!

Chúc bạn sử dụng phần mềm thành công!

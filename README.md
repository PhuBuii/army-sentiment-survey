# 🛡️ AI Survey For Army (Hệ thống Khảo sát Tư tưởng Quân đội bằng AI)

**AI Survey For Army** là một ứng dụng web chuyên nghiệp, bảo mật phân tích dữ liệu được xây dựng để hỗ trợ cấp chỉ huy trong việc đánh giá tư tưởng và tâm lý của các chiến sĩ. Hệ thống kết hợp các bộ câu hỏi khảo sát với sức mạnh phân tích ngôn ngữ tự nhiên của **Google Gemini AI**, từ đó chấm điểm và tự động đưa ra các lời khuyên thiết thực.

---

## 🚀 Các Tính Năng Chính (Features)

### 1. Dành cho Ban Chỉ huy (Admin Dashboard)
- **Quản lý danh sách chiến sĩ & câu hỏi:** Tải lên nhanh chóng định dạng `.xlsx`/`.xls` để thêm hàng loạt chiến sĩ hoặc nguồn câu hỏi vào hệ thống.
- **Trực quan hoá dữ liệu (Data Visualization):** Xem biểu đồ thống kê tổng quan toàn vùng về tâm lý quân nhân, bao gồm các mức độ: `An tâm` (Xanh), `Dao động` (Vàng) và `Nguy cơ` (Đỏ).
- **Phân tích AI tự động:** Ngay khi bài khảo sát được gửi, AI sẽ trực tiếp phân tích đánh giá: chấm điểm (trên thang 100), đưa ra trạng thái tâm lý, đoạn nhận xét ngắn và cuối cùng là **Lời khuyên xử lý cho chỉ huy**.
- **Quản lý Token truy cập:** Mỗi chiến sĩ được cấp một mã Token riêng biệt (unique link) dùng để làm bài khảo sát. Tránh tình trạng làm hộ hoặc sửa đáp án.

### 2. Dành cho Chiến sĩ (Survey Interface)
- **Bảo mật và riêng tư:** Truy cập thông qua link chứa Token bảo mật an toàn. Mỗi Token chỉ được hoàn thành 1 lần.
- **Form khảo sát tinh gọn:** Giao diện tối giản, mang phong cách quân đội (Dark mode/Military-themed aesthetics).
- **Hệ thống câu hỏi động:** Mỗi lần khảo sát hệ thống tự động chọn ngẫu nhiên 5 câu hỏi từ kho câu hỏi giúp cho các bài kiểm tra chéo luôn đa dạng.

---

## 🛠 Công Nghệ Sử Dụng (Tech Stack)

- **Framework:** [Next.js 15 (App Router)](https://nextjs.org/)
- **Ngôn ngữ:** [TypeScript](https://www.typescriptlang.org/)
- **Styling UI:** [Tailwind CSS v4](https://tailwindcss.com/), [Shadcn/ui](https://ui.shadcn.com/)
- **Biểu đồ:** [Recharts](https://recharts.org/)
- **Database / Backend as a Service:** [Supabase](https://supabase.com/)
- **Trí tuệ nhân tạo (AI):** [Google Generative AI (Gemini 2.5 Flash)](https://ai.google.dev/)
- **Tiện ích khác:** `xlsx` (đọc file excel upload).

---

## ⚙️ Hướng Dẫn Cài Đặt (Setup Guide)

Làm theo các bước sau để có thể khởi chạy ứng dụng trực tiếp tại máy tính của bạn (Local Environment).

### Bước 1: Khởi tạo Cơ sở dữ liệu (Supabase)
1. Đăng nhập / Đăng ký tài khoản miễn phí tại [Supabase](https://supabase.com/).
2. Tạo một **New Project**.
3. Khi Project đã sẵn sàng, vào mục **SQL Editor** ở thanh menu bên trái.
4. Copy nội dung từ file `schema.sql` (bạn hãy đảm bảo đã có sẵn) dán vào SQL Editor và nhấn **Run** (Chạy) để hệ thống tạo các bảng: `questions`, `soldiers` và `submissions`.
5. Vào mục **Project Settings** (hình bánh răng) > **API**. Tìm và copy 2 thông tin:
   - **Project URL**
   - **Project API keys** (Lấy mục *anon* `public`)

### Bước 2: Tạo khóa API của Google Gemini
1. Truy cập [Google AI Studio](https://aistudio.google.com/).
2. Đăng nhập bằng tài khoản Google.
3. Nhấp vào nút **Get API key** ở thanh menu, tạo mới một khóa API và copy lại khóa này.

### Bước 3: Cấu hình mã nguồn (Môi trường)
1. Mở IDE (ví dụ: VS Code) ở trong mục `army-sentiment-survey`.
2. Tạo (hoặc sửa đổi) một file tên là `.env.local` ở thư mục gốc của dự án.
3. Dán các khóa vừa copy vào file với định dạng như sau:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5c...
GEMINI_API_KEY=AIzaSyB...
```

### Bước 4: Chạy Website
1. Mở Terminal trong thư mục gốc của dự án.
2. Cài đặt các gói phụ thuộc (nếu chưa cài):
   ```bash
   npm install
   ```
3. Khởi động server cho môi trường lập trình (Development):
   ```bash
   npm run dev
   ```
4. Truy cập các đường dẫn sau trên trình duyệt (Browser):
   - **Dashboard (Ban Chỉ huy):** [http://localhost:3000/admin/dashboard](http://localhost:3000/admin/dashboard)
   - Nếu bạn có token của chiến sĩ *(ví dụ: 1234abc)*: [http://localhost:3000/survey/1234abc](http://localhost:3000/survey/1234abc)

---

## 📞 Đóng góp & Hoàn thiện

Đây là sản phẩm hỗ trợ đặc thù nhằm nâng cao khả năng quản lý thông tin quân nhân và thấu hiểu đời sống tâm lý chiến sĩ. Mọi đóng góp về bảo mật, nâng cấp UI/UX hay thuật toán sẽ rất được trân trọng.

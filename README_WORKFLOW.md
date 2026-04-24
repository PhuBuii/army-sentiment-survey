# 🪖 Army AI Sentiment Survey - Documentation & Workflow

Hệ thống khảo sát và phân tích diễn biến tư tưởng chiến sĩ ứng dụng Trí tuệ nhân tạo (AI) thế hệ mới, được thiết kế chuyên biệt cho môi trường Quân đội.

---

## 🛠 1. Công nghệ sử dụng (Tech Stack)

Hệ thống được xây dựng trên nền tảng công nghệ hiện đại, đảm bảo tính bảo mật, hiệu năng và khả năng mở rộng:

*   **Framework:** [Next.js 15+](https://nextjs.org/) (App Router) - Tối ưu hóa hiệu năng SSR/ISR và SEO.
*   **Ngôn ngữ:** [TypeScript](https://www.typescriptlang.org/) - Đảm bảo tính chặt chẽ của mã nguồn và giảm thiểu lỗi runtime.
*   **Trí tuệ nhân tạo:** [Google Gemini AI](https://ai.google.dev/) - Phân tích cảm xúc, chấm điểm tư tưởng và đưa ra lời khuyên nghiệp vụ.
*   **Cơ sở dữ liệu & Auth:** [Supabase](https://supabase.com/) (PostgreSQL) - Hệ thống lưu trữ dữ liệu thời gian thực và quản lý xác thực bảo mật.
*   **Giao diện (UI/UX):**
    *   [Tailwind CSS](https://tailwindcss.com/) - Thiết kế giao diện thích ứng (Responsive).
    *   [Lucide React](https://lucide.dev/) - Hệ thống Icon chuyên nghiệp.
    *   [Recharts](https://recharts.org/) - Biểu đồ trực quan hóa dữ liệu.
    *   [Shadcn/UI](https://ui.shadcn.com/) - Bộ thành phần giao diện cao cấp.
*   **Xử lý PDF:** Native Browser Print Engine với CSS @media print tùy chỉnh theo chuẩn văn bản hành chính Việt Nam.

---

## 🚀 2. Luồng hoạt động (Workflow)

Hệ thống vận hành theo một chu trình khép kín và bảo mật tuyệt đối:

### Bước 1: Quản lý & Cấp phát (Admin)
*   Cán bộ quản trị (Admin) tạo danh sách chiến sĩ trong hệ thống.
*   Hệ thống tạo ra một **Token bảo mật một chiều** (Single-use Token) cho mỗi chiến sĩ.
*   Token này đảm bảo: Một người chỉ làm 1 lần, không thể khai báo hộ, không thể làm lại sau khi đã nộp.

### Bước 2: Khảo sát tương tác AI (Soldier)
*   Chiến sĩ truy cập link khảo sát thông qua Token được cấp.
*   Hệ thống hiển thị giao diện khảo sát tối giản, tập trung (Cyber Defense style).
*   Trong quá trình trả lời, AI có thể đưa ra các **câu hỏi bổ sung (Follow-up Questions)** dựa trên nội dung trả lời trước đó để đào sâu tâm lý.

### Bước 3: Phân tích & Đánh giá tức thì (AI Core)
*   Ngay sau khi nộp bài, Gemini AI sẽ phân tích toàn bộ văn bản.
*   **Chấm điểm tư tưởng:** Thang điểm 1-100.
*   **Phân loại trạng thái:** 🟢 An tâm, 🟡 Dao động, 🔴 Nguy cơ.
*   **Báo cáo AI:** Tổng hợp nhận xét, đưa ra lời khuyên cho Chỉ huy và gợi ý kịch bản đối thoại 1-1.

### Bước 4: Giám sát & Xử lý (Commander)
*   Chỉ huy truy cập Dashboard để xem thống kê toàn đơn vị.
*   Nhận cảnh báo tức thì về các trường hợp "Nguy cơ".
*   Đánh dấu "Đã xử lý" sau khi đã gặp gỡ và động viên chiến sĩ.
*   Xuất báo cáo PDF chính quy để báo cáo cấp trên.

---

## ✨ 3. Các tính năng chính (Core Features)

### 📊 Dashboard Thông minh
*   Biểu đồ tỷ trọng tâm lý (Pie Chart) trực quan.
*   Thẻ thống kê quân số: Tổng số, Đã khảo sát, Cần can thiệp.
*   Bảng cập nhật kết quả khảo sát thời gian thực.

### 📝 Hệ thống Khảo sát AI-First
*   Hỗ trợ lưu nháp tự động (Auto-save) vào LocalStorage.
*   Cơ chế kiểm tra kết nối mạng (Offline/Online Detection).
*   Giao diện Chatbot-like tương tác mượt mà.

### 📜 Báo cáo PDF chuyên nghiệp
*   Thiết kế theo chuẩn văn bản hành chính Quân đội (Nghị định 30/2020/NĐ-CP).
*   Tự động lọc và trình bày các trường hợp trọng điểm.
*   Bố cục tối ưu để in ấn (A4), căn lề chuẩn xác.

### 🔐 Bảo mật & Phân quyền
*   Xác thực đa lớp qua Supabase Auth.
*   Cơ chế RBAC (Phân quyền theo cấp bậc đơn vị).
*   Token khảo sát mã hóa, ngăn chặn truy cập trái phép.

### 📱 Thiết kế Responsive (WebApp)
*   Hoạt động hoàn hảo trên mọi thiết bị: Desktop, Tablet, Smartphone.
*   Thanh điều hướng "Floating" hiện đại trên di động.
*   Giao diện Dark Mode/Light Mode tùy chỉnh theo môi trường.

---

## 📅 4. Lộ trình phát triển (Roadmap)
*   [x] Tích hợp AI Gemini phân tích chuyên sâu.
*   [x] Hệ thống xuất báo cáo PDF chính quy.
*   [x] Tối ưu hóa giao diện đa nền tảng.
*   [ ] Dự báo xu hướng tâm lý theo tháng/quý.
*   [ ] Tích hợp thông báo qua Telegram/Email cho Chỉ huy khi có ca "Nguy cơ".

---
*Tài liệu được cập nhật tự động bởi hệ thống Quản lý Tư tưởng Quân đội - 2026*

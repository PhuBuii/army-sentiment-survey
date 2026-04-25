# 🗺 Kế hoạch Nâng cấp Hệ thống (Officer-Centric Upgrade)

Dưới đây là lộ trình triển khai các tính năng mới nhằm tối ưu hóa trải nghiệm của Sĩ quan quản lý và đào sâu khả năng nắm bắt tâm lý chiến sĩ.

---

## 🟢 Giai đoạn 1: Quản trị cá nhân & Bảo mật (Ưu tiên Cao)
*Mục tiêu: Đảm bảo sĩ quan có thể quản lý tài khoản và bảo mật thông tin.*

1.  **Xây dựng trang Profile (Cá nhân):**
    *   Hiển thị thông tin: Họ tên, Cấp bậc, Chức vụ, Đơn vị quản lý.
    *   Tính năng chỉnh sửa thông tin cơ bản.
2.  **Tính năng Đổi mật khẩu:**
    *   Tích hợp vào trang Profile.
    *   Sử dụng API của Supabase Auth để đảm bảo an toàn.
3.  **Cập nhật Layout:**
    *   Thêm menu "Cài đặt tài khoản" vào Sidebar và Mobile Navbar.

---

## 🔵 Giai đoạn 2: Phân tích & Nắm bắt tâm lý chuyên sâu
*Mục tiêu: Cung cấp cái nhìn đa chiều và dự báo về tư tưởng đơn vị.*

1.  **Biểu đồ diễn biến tư tưởng (Sentiment Timeline):**
    *   Phát triển giao diện xem lịch sử điểm số của từng chiến sĩ.
    *   Sử dụng Recharts để vẽ biểu đồ đường (Line Chart) thể hiện sự thay đổi qua các đợt khảo sát.
2.  **Phân tích từ khóa (Topic Cloud):**
    *   Sử dụng AI để trích xuất các chủ đề chính từ câu trả lời của toàn đơn vị.
    *   Hiển thị các vấn đề "nóng" mà chiến sĩ đang quan tâm.
3.  **Hệ thống Nhật ký can thiệp (Intervention Tracking):**
    *   Thêm tính năng lưu ghi chú của Chỉ huy sau khi đã gặp gỡ chiến sĩ.
    *   Lưu trữ lịch sử các lần can thiệp vào cơ sở dữ liệu.

---

## 🟡 Giai đoạn 3: Tối ưu hóa Báo cáo & Tài liệu
*Mục tiêu: Giảm tải thủ tục hành chính và chuyên nghiệp hóa văn bản.*

1.  **Tính năng Xuất Excel (Export Data):**
    *   Tích hợp thư viện `xlsx` hoặc `exceljs`.
    *   Cho phép xuất danh sách chiến sĩ và kết quả khảo sát ra file Excel chuẩn.
2.  **In báo cáo hàng loạt (Bulk PDF):**
    *   Nâng cấp logic in ấn để có thể chọn nhiều chiến sĩ và in thành một tệp PDF duy nhất, tự động ngắt trang cho mỗi người.
3.  **Chữ ký số nội bộ:**
    *   Cho phép sĩ quan tải lên ảnh chữ ký cá nhân để tự động chèn vào cuối các báo cáo PDF.

---

## 🛠 Công cụ & Kỹ thuật dự kiến
*   **Frontend:** Nâng cấp thêm các Component từ `shadcn/ui` (Tabs, Form validation).
*   **Backend:** Bổ sung các Table trong Supabase: `admin_profiles`, `intervention_logs`.
*   **Logic:** Tối ưu hóa Prompt của Gemini để trích xuất từ khóa (Key themes).

---
*Kế hoạch này sẽ giúp chuyển đổi hệ thống từ một công cụ khảo sát thuần túy thành một Hệ sinh thái quản lý tư tưởng toàn diện.*

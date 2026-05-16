# 🌟 MÔ TẢ LUỒNG HOẠT ĐỘNG (WORKFLOW) - Hệ thống Khảo sát Tư tưởng Quân nhân

Tài liệu này mô tả cách hệ thống hoạt động một cách đơn giản, dễ hiểu dành cho người dùng không có chuyên môn về công nghệ thông tin. Hệ thống bao gồm 2 đối tượng sử dụng chính: **Cán bộ quản lý (Admin)** và **Quân nhân (Người làm khảo sát)**.

---

## 1. 👮 CÁN BỘ QUẢN LÝ (Admin)

Cán bộ quản lý là những người điều hành, tạo khảo sát, theo dõi kết quả và đưa ra quyết định dựa trên báo cáo của hệ thống.

### Bước 1: Đăng nhập và Quản lý tài khoản

- Cán bộ truy cập vào trang quản trị (`/login`), đăng nhập bằng email và mật khẩu an toàn.
- Cán bộ có thể cập nhật thông tin cá nhân (ảnh đại diện, cấp bậc, đơn vị quản lý) tại trang **Hồ sơ cá nhân**.
- Hệ thống hỗ trợ nhiều tài khoản quản lý khác nhau để cùng làm việc.

### Bước 2: Quản lý Bộ câu hỏi

- Trong mục **Quản lý Câu hỏi**, cán bộ có thể Thêm mới, Sửa, hoặc Xóa các câu hỏi dùng để hỏi quân nhân.
- Nội dung câu hỏi sẽ được dùng chung cho tất cả các bài khảo sát.

### Bước 3: Tạo danh sách người khảo sát (Quân nhân)

- Tại màn hình **Quản lý Quân nhân**, cán bộ thêm thông tin quân nhân (Họ tên, Đơn vị).
- Với mỗi quân nhân được thêm, hệ thống sẽ tự động tạo ra một **Đường link bí mật (Token)** dành riêng cho người đó. Phân biệt rõ ràng người nào làm bài nào, tránh việc làm bài hộ.
- Cán bộ sẽ gửi đường link này cho từng chiến sĩ để họ bắt đầu làm.

### Bước 4: Theo dõi và Xử lý Kết quả (Dashboard)

- Sau khi quân nhân hoàn thành bài khảo sát, kết quả sẽ gửi về **Bảng điều khiển (Dashboard)**.
- Tại đây, cán bộ sẽ xem danh sách phiếu làm bài cùng **Kết quả Đánh giá từ Trí tuệ Nhân tạo (AI)** (Chi tiết xem tại phần 3).
- Cán bộ có thể:
  1. Đọc chi tiết từng câu trả lời.
  2. Xem lời khuyên và kịch bản trò chuyện do AI gợi ý.
  3. Để lại **Ghi chú của Cán bộ** sau khi đã trò chuyện trực tiếp với quân nhân.
  4. Đánh dấu trạng thái **"Đã xử lý" (Resolved)** nếu vấn đề tư tưởng của quân nhân đã được giải quyết xong.

---

## 2. 🪖 QUÂN NHÂN (Người làm khảo sát)

Người làm khảo sát thao tác hoàn toàn thông qua điện thoại hoặc máy tính một cách cực kỳ đơn giản.

### Bước 1: Truy cập đường dẫn

- Người làm ấn vào **Đường link riêng tư** mà cán bộ quản lý gửi cho mình (Ví dụ: `tenweb.com/survey/chuoi-ma-bi-mat`).
- Hệ thống tự nhận diện người làm là ai mà không cần phải trải qua bước đăng ký hay đăng nhập lằng nhằng.

### Bước 2: Trả lời câu hỏi

- Dựa trên bộ câu hỏi cán bộ đã thiết lập từ trước, các câu hỏi sẽ hiện ra lần lượt.
- Người làm đọc, chọn đáp án hoặc điền câu trả lời theo cảm nghĩ cá nhân một cách trung thực.

### Bước 3: Nộp bài

- Ở bước cuối, người làm bấm nút hoàn thành phần trả lời.
- Màn hình sẽ báo thành công, và đường link đó sẽ **bị vô hiệu hóa** (nghĩa là không thể bấn vào để làm lại hoặc sửa bài nữa).

---

## 3. 🤖 VAI TRÒ CỦA TRÍ TUỆ NHÂN TẠO (AI)

Hệ thống được tích hợp Trí tuệ nhân tạo (Gemini AI) để hoạt động như một "Trợ lý Tâm lý học" đắc lực cho cán bộ.

Ngay sau khi quân nhân bấm nút "Nộp bài", AI sẽ mất vài giây để đọc toàn bộ câu trả lời và tự động đưa ra:

1. **Điểm số tư tưởng:** Chấm điểm mức độ ổn định tâm lý từ 0 đến 100.
2. **Phân loại trạng thái:**
   - 🟢 **An tâm** (Tư tưởng vững vàng, sẵn sàng nhận nhiệm vụ)
   - 🟡 **Dao động** (Đang có lo lắng nhẹ, cần được quan tâm)
   - 🔴 **Nguy cơ** (Gặp vấn đề bức xúc, tiêu cực lớn, cần can thiệp khẩn cấp)
3. **Tóm tắt tình trạng (AI Summary):** Đúc kết ngắn gọn lại vấn đề chính mà quân nhân đó đang gặp phải (nếu có).
4. **Lời khuyên (AI Advice):** Đưa ra các biện pháp hành động gợi ý cho cán bộ.
5. **Kịch bản trò chuyện (Dialogue Script):** Mách nước cho cán bộ cách tiếp cận, cách đặt câu hỏi tinh tế để tâm sự với chiến sĩ mà không làm họ tâm lý hoặc phòng thủ.

---

## 💡 TÓM TẮT LUỒNG ĐI

`Admin tạo câu hỏi` ➔ `Admin thêm tên chiến sĩ` ➔ `Hệ thống cấp Link riêng` ➔ `Gửi link cho Chiến sĩ` ➔ `Chiến sĩ điền Survey` ➔ `Chiến sĩ Nộp bài` ➔ `AI Tự động chấm điểm & Phân tích` ➔ `Kết quả trả về Dashboard` ➔ `Admin xem báo cáo, trò chuyện với chiến sĩ` ➔ `Admin đánh dấu Đã xử lý (Hoàn tất)`.

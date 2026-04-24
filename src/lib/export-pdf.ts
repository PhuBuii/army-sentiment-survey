import { toast } from "sonner";

/**
 * PHƯƠNG PHÁP XUẤT PDF HỢP LÝ: 
 * Sử dụng Engine in ấn của trình duyệt. 
 * Ưu điểm: Hỗ trợ mọi hệ màu (lab, oklch), văn bản sắc nét, tự động ngắt trang.
 */
export const exportElementToPDF = async (elementId: string, fileNameSuffix: string) => {
  try {
    // 1. Đặt tên file cho trình duyệt (một số trình duyệt sẽ dùng title làm tên file PDF)
    const originalTitle = document.title;
    document.title = `Bao_Cao_${fileNameSuffix}_${new Date().toISOString().slice(0,10)}`;

    // 2. Kích hoạt lệnh in của hệ thống
    // Toàn bộ định dạng "MẬT" và "QUÂN ĐỘI" đã được cấu hình trong CSS @media print
    window.print();

    // 3. Trả lại title cũ
    document.title = originalTitle;
    
    toast.success("Đã mở hộp thoại in báo cáo.");
  } catch (e: any) {
    console.error("Print Error:", e);
    toast.error("Không thể mở hộp thoại in.");
  }
};

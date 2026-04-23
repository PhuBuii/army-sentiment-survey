import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";

export const exportElementToPDF = async (elementId: string, fileNameSuffix: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    toast.error("Không tìm thấy dữ liệu để xuất.");
    return;
  }

  const tid = toast.loading("Quy trình xuất PDF đang chạy...");
  
  try {
    // Chụp lại giao diện bảng/dashboard hiện tại với viền chuẩn trắng (để in dễ nhìn)
    const canvas = await html2canvas(element, { 
       scale: 2, // Tăng chất lượng ảnh
       useCORS: true,
       backgroundColor: "#ffffff",
    });
    
    const imgData = canvas.toDataURL("image/jpeg", 1.0);
    
    // Tạo file PDF khổ A4
    const pdf = new jsPDF("p", "mm", "a4");
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    // Đảm bảo không bị méo tỉ lệ
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    // Gắn trực tiếp nguyên giao diện vừa chụp vào file
    // Bắt đầu từ toạ độ {x: 5, y: 10} để chừa chút lề
    pdf.addImage(imgData, "JPEG", 5, 10, pdfWidth - 10, pdfHeight);
    
    const time = new Date().toISOString().slice(0,10);
    pdf.save(`Bao_Cao_${fileNameSuffix}_${time}.pdf`);
    toast.success(`Đã in xong chứng từ PDF!`, { id: tid });
  } catch(e: any) {
    console.error("PDF Export Err:", e);
    toast.error("Không thể kết xuất PDF.", { id: tid });
  }
};

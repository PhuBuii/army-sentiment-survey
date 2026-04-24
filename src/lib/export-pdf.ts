import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";

export const exportElementToPDF = async (elementId: string, fileNameSuffix: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    toast.error("Không tìm thấy dữ liệu để xuất.");
    return;
  }

  const tid = toast.loading("Đang chuẩn bị bản in PDF...");
  
  try {
    const canvas = await html2canvas(element, { 
       scale: 2, 
       useCORS: true,
       backgroundColor: "#ffffff",
       onclone: (clonedDoc, clonedElement) => {
         // Fix lỗi kích thước biểu đồ (Charts width/height -1)
         // Ép các Recharts Container có kích thước thực tế trong bản clone
         const chartContainers = clonedDoc.querySelectorAll('.recharts-responsive-container');
         chartContainers.forEach((container: any) => {
           container.style.width = '1000px';
           container.style.height = '400px';
           container.style.visibility = 'visible';
         });

         // Đảm bảo layout bản in ổn định
         clonedElement.style.width = "1200px";
         clonedElement.style.padding = "20px";
         clonedElement.style.color = "#000000";
         clonedElement.style.backgroundColor = "#ffffff";

         // Loại bỏ các thành phần không cần thiết cho bản in
         const ignoreElements = clonedDoc.querySelectorAll('[data-html2canvas-ignore]');
         ignoreElements.forEach((el: any) => el.remove());
       }
    });
    
    const imgData = canvas.toDataURL("image/jpeg", 1.0);
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
    
    const time = new Date().toISOString().slice(0,10);
    pdf.save(`Bao_Cao_${fileNameSuffix}_${time}.pdf`);
    toast.success(`Xuất PDF thành công!`, { id: tid });
  } catch(e: any) {
    console.error("PDF Export Err:", e);
    toast.error("Lỗi xuất file. Vui lòng thử lại.", { id: tid });
  }
};

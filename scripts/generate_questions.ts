import { utils, writeFile } from 'xlsx';
import path from 'path';

const questions = [
  // Nhóm 1: Huấn luyện và Kỷ luật
  "Đồng chí đánh giá mức độ khó của các nội dung huấn luyện trong tuần qua như thế nào?",
  "Đồng chí có gặp khó khăn gì trong việc thực hiện chế độ nền nếp chính quy tại đơn vị không?",
  "Đồng chí cảm thấy thế nào về cường độ huấn luyện hiện tại của đơn vị?",
  "Đồng chí có ý kiến gì về phương pháp giảng dạy của các cán bộ huấn luyện không?",
  "Đồng chí có cảm thấy mình đang tiến bộ hơn sau mỗi buổi tập không?",
  "Kỷ luật quân đội có gây áp lực quá lớn đối với đồng chí không?",
  "Đồng chí có nắm chắc các nội dung an toàn trong huấn luyện không?",
  "Đồng chí có đề xuất gì để nâng cao chất lượng huấn luyện tại trung đội không?",
  "Đồng chí có cảm thấy hăng hái khi tham gia các buổi tập hành quân không?",
  "Việc chấp hành giờ giấc nội vụ có gây khó khăn gì cho đồng chí không?",

  // Nhóm 2: Đời sống và Sức khỏe
  "Đồng chí có hài lòng với chất lượng bữa ăn tại bếp ăn tập thể không?",
  "Chế độ nghỉ ngơi, sinh hoạt của đồng chí có được đảm bảo đúng quy định không?",
  "Đồng chí có gặp vấn đề gì về sức khỏe trong thời gian gần đây không?",
  "Môi trường sinh hoạt tại đơn vị có đảm bảo vệ sinh và thông thoáng không?",
  "Đồng chí có thường xuyên tham gia các hoạt động thể dục thể thao không?",
  "Việc cấp phát nhu yếu phẩm tại đơn vị có đầy đủ và kịp thời không?",
  "Đồng chí có cảm thấy ngủ đủ giấc trong môi trường quân ngũ không?",
  "Đồng chí có gặp khó khăn gì trong việc thích nghi với khí hậu tại nơi đóng quân không?",
  "Hoạt động tăng gia sản xuất có giúp đồng chí giải tỏa căng thẳng không?",
  "Đồng chí có nhận được sự quan tâm đúng mức từ quân y đơn vị khi ốm đau không?",

  // Nhóm 3: Gia đình và Tâm lý cá nhân
  "Hoàn cảnh gia đình hiện tại có điều gì khiến đồng chí phải lo lắng không?",
  "Đồng chí có thường xuyên liên lạc về nhà để thăm hỏi gia đình không?",
  "Đồng chí có nhận được sự ủng hộ từ gia đình khi tham gia nghĩa vụ quân sự không?",
  "Đồng chí có cảm thấy nhớ nhà quá mức ảnh hưởng đến công tác không?",
  "Trước khi nhập ngũ, đồng chí có gặp vướng mắc gì về tình cảm cá nhân chưa giải quyết không?",
  "Đồng chí có dự định gì cho gia đình sau khi hoàn thành nghĩa vụ quân sự không?",
  "Gia đình đồng chí có đang gặp khó khăn về kinh tế hay chính sách gì không?",
  "Đồng chí có cảm thấy yên tâm công tác khi biết gia đình ở quê nhà ổn định không?",
  "Đồng chí có nhận được thư từ hay quà gửi từ người thân thường xuyên không?",
  "Đồng chí có cảm thấy áp lực từ những mong đợi của gia đình đối với mình không?",

  // Nhóm 4: Mối quan hệ đồng chí, đồng đội
  "Mối quan hệ của đồng chí với các chiến sĩ cùng tiểu đội như thế nào?",
  "Đồng chí có nhận được sự giúp đỡ từ đồng đội khi gặp khó khăn không?",
  "Trong đơn vị có hiện tượng mất đoàn kết hay chia rẽ nội bộ không?",
  "Đồng chí có tin tưởng vào sự chỉ huy và dẫn dắt của tiểu đội trưởng không?",
  "Đồng chí cảm thấy cán bộ trung đội có gần gũi và sâu sát với chiến sĩ không?",
  "Khi có mâu thuẫn với đồng đội, đồng chí thường giải quyết theo cách nào?",
  "Đồng chí có cảm thấy mình là một phần quan trọng của tập thể đơn vị không?",
  "Đồng chí có sẵn sàng giúp đỡ đồng đội khác trong học tập và công tác không?",
  "Có bao giờ đồng chí cảm thấy bị cô lập trong môi trường đơn vị không?",
  "Đồng chí đánh giá thế nào về tinh thần tương thân tương ái tại đơn vị mình?",

  // Nhóm 5: Động lực và Ý chí chiến đấu
  "Đồng chí có hiểu rõ mục đích và ý nghĩa của việc thực hiện nghĩa vụ quân sự không?",
  "Đồng chí có cảm thấy tự hào khi được đứng trong hàng ngũ Quân đội nhân dân Việt Nam không?",
  "Động lực lớn nhất giúp đồng chí vượt qua những ngày huấn luyện gian khổ là gì?",
  "Đồng chí có mục tiêu phấn đấu để trở thành Đảng viên trong thời gian tại ngũ không?",
  "Đồng chí có ý định thi vào các trường quân đội hoặc phục vụ lâu dài không?",
  "Đồng chí có cảm thấy những kiến thức quân sự đang học có ích cho tương lai không?",
  "Đồng chí có tinh thần sẵn sàng nhận và hoàn thành mọi nhiệm vụ được giao không?",
  "Đồng chí có tin tưởng vào vũ khí và trang bị kỹ thuật được cấp phát không?",
  "Đồng chí có cảm nhận được sự thay đổi tích cực của bản thân từ khi nhập ngũ không?",
  "Nếu được chọn lại, đồng chí vẫn sẽ hăng hái lên đường nhập ngũ chứ?",

  // Nhóm 6: Hoạt động văn hóa, tinh thần
  "Đồng chí có yêu thích các buổi sinh hoạt văn nghệ, đọc báo tại đơn vị không?",
  "Các chương trình phát thanh nội bộ có cung cấp thông tin hữu ích cho đồng chí không?",
  "Đồng chí có thường xuyên sử dụng phòng đọc sách hay thư viện của đơn vị không?",
  "Các trò chơi quân sự và hoạt động tập thể có giúp đồng chí gắn kết hơn không?",
  "Đồng chí có cảm thấy các buổi sinh hoạt ngày chính trị văn hóa tinh thần có hiệu quả không?",

  // Nhóm 7: Tư tưởng và nguyện vọng khác
  "Đồng chí có điều gì muốn đề đạt trực tiếp với chỉ huy cấp trên không?",
  "Đồng chí có cảm thấy công tâm trong việc bình xét thi đua khen thưởng không?",
  "Có vấn đề gì trong đơn vị mà đồng chí thấy cần phải thay đổi ngay không?",
  "Đồng chí có lo lắng về việc tìm kiếm việc làm sau khi xuất ngũ không?",
  "Đồng chí có cảm thấy mình được tôn trọng khi ở trong môi trường quân ngũ không?",
  "Đồng chí có nhận xét gì về việc sử dụng thời gian rảnh rỗi tại đơn vị?",
  "Đồng chí có cảm thấy an tâm khi thực hiện các nhiệm vụ canh gác, tuần tra không?",
  "Có lúc nào đồng chí cảm thấy chán nản và muốn bỏ cuộc không?",
  "Đồng chí mong muốn đơn vị tổ chức thêm những hoạt động ngoại khóa nào?",
  "Đồng chí có cảm thấy hệ thống khảo sát này là cơ hội tốt để bày tỏ tâm tư không?",

  // Thêm câu hỏi để đạt số lượng 70+
  "Đồng chí có nhận thấy sự gương mẫu của các cán bộ đảng viên trong đơn vị không?",
  "Việc quản lý vũ khí trang bị tại đơn vị có nghiêm túc và an toàn không?",
  "Đồng chí có nắm vững 12 điều kỷ luật khi quan hệ với nhân dân không?",
  "Đồng chí có tham gia đầy đủ các buổi học chính trị trong tháng không?",
  "Đồng chí đánh giá thế nào về công tác vệ sinh môi trường quanh doanh trại?",
  "Đồng chí có cảm thấy tự tin khi thực hiện bài bắn đạn thật không?",
  "Mối quan hệ giữa đơn vị và nhân dân nơi đóng quân có tốt không?",
  "Đồng chí có ý kiến gì về việc quản lý sử dụng điện thoại tại đơn vị?",
  "Đồng chí có nhận thấy sự quan tâm của cấp trên đến đời sống chiến sĩ không?",
  "Đồng chí có thường xuyên theo dõi tin tức thời sự trên truyền hình quân đội không?",
  "Đồng chí có cảm thấy các bài học về truyền thống đơn vị có ý nghĩa không?",
  "Việc bảo quản vũ khí (lau chùi súng) có thực hiện đúng quy định hàng ngày không?",
  "Đồng chí có sẵn sàng tham gia các nhiệm vụ phòng chống thiên tai, cứu hộ không?",
  "Đồng chí có cảm thấy an toàn khi tham gia các bài tập ném lựu đạn thật không?",
  "Đồng chí có nắm vững các chức trách, nhiệm vụ của mình khi trực ban không?",
  "Việc chi trả phụ cấp hàng tháng có đúng hạn và đầy đủ không?",
  "Đồng chí có cảm thấy hãnh diện khi mặc bộ quân phục trên người không?",
  "Đồng chí có nhận xét gì về văn hóa ứng xử của các cán bộ trẻ mới về đơn vị?",
  "Các hoạt động ngày nghỉ có phong phú và hấp dẫn đồng chí không?",
  "Đồng chí có cảm nhận được sự công bằng trong việc phân công nhiệm vụ lao động không?",
  "Đồng chí có muốn học thêm một nghề nào đó trong thời gian tại ngũ không?",
  "Đồng chí có tự tin về khả năng bơi lội của mình nếu tham gia huấn luyện dưới nước không?",
  "Việc cắt tóc, xưng hô chào hỏi có được thực hiện nghiêm túc trong đơn vị không?",
  "Đồng chí có nắm chắc các dấu hiệu nhận biết về diễn biến tâm lý tiêu cực ở đồng đội không?",
  "Đồng chí có thường xuyên tự học, tự rèn thêm ngoài giờ huấn luyện không?",
  "Đồng chí có cảm thấy môi trường quân đội giúp mình trưởng thành hơn không?",
  "Đồng chí có mong muốn được thăm gia đình trong những dịp lễ đặc biệt không?",
  "Đồng chí có hiểu rõ quyền lợi và nghĩa vụ của một người chiến sĩ không?",
  "Đồng chí có cảm nhận được sự ấm áp của tình đồng chí như trong một gia đình không?",
  "Đồng chí có quyết tâm đạt danh hiệu Chiến sĩ tiên tiến trong năm nay không?"
];

const data = questions.map(q => ({ content: q }));
const worksheet = utils.json_to_sheet(data);
const workbook = utils.book_new();
utils.book_append_sheet(workbook, worksheet, "Questions");

const outputPath = path.join(process.cwd(), 'public', 'mau_cau_hoi.xlsx');
writeFile(workbook, outputPath);

console.log(`Successfully generated ${questions.length} questions to ${outputPath}`);

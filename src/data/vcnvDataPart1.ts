import type { ObstaclePuzzle } from './questionTypes.ts';
import { OBSTACLE_SVG_ILLUSTRATIONS } from '../utils/obstacleIllustrations.ts';

// ==================== PHẦN 2A: BỘ ĐỀ VƯỢT CHƯỚNG NGẠI VẬT (BỘ 1 -> BỘ 8: LIÊN KẾT BẮC CẦU GIÁN TIẾP, ĐỘ KHÓ CAO) ====================
export const OBSTACLE_PUZZLES_PART1: ObstaclePuzzle[] = [
  {
    id: 'vcnv-1',
    title: 'Địa chất & Di sản Tự nhiên',
    keywordDisplay: 'VỊNH HẠ LONG',
    charCount: 10,
    acceptedKeywords: ['Vinh Ha Long', 'Ha Long'],
    imageUrl: OBSTACLE_SVG_ILLUSTRATIONS['vcnv-1'],
    rows: [
      {
        id: 1,
        rowLabel: 'Hàng ngang số 1',
        charCount: 5,
        question:
          'Hàng ngang số 1 (5 chữ cái): Thuật ngữ địa chất học quốc tế (bắt nguồn từ tên một vùng cao nguyên đá ở Slovenia) dùng để chỉ hiện tượng phong hóa, ăn mòn hóa học của nước đối với các tầng đá cacbonat tạo nên địa hình hang động, phễu sụt và tháp đá?',
        displayWord: 'KARST',
        acceptedAnswers: ['Karst', 'Cacxto', 'Caster'],
        explanation: 'Địa hình Karst ngập nước trưởng thành là giá trị địa chất – địa mạo nổi bật toàn cầu của Vịnh Hạ Long.',
      },
      {
        id: 2,
        rowLabel: 'Hàng ngang số 2',
        charCount: 7,
        question:
          'Hàng ngang số 2 (7 chữ cái): Trong bài thơ "Đoàn thuyền đánh cá" sáng tác năm 1958 tại vùng mỏ Hồng Gai, nhà thơ Huy Cận đã miêu tả: "Mặt trời xuống biển như hòn lửa / Sóng đã cài then, đêm sập cửa". Hỏi ngọn núi thơ mộng nằm ngay bên bờ biển Hồng Gai, nơi vua Lê Thánh Tông từng đề thơ lên vách đá năm 1468, có tên là núi gì (Núi ...)?',
        displayWord: 'BÀI THƠ',
        acceptedAnswers: ['Bai Tho', 'Nui Bai Tho', 'Truyen Dang'],
        explanation: 'Núi Bài Thơ (xưa là núi Truyền Đăng) nằm ngay bên bờ Vịnh Hạ Long.',
      },
      {
        id: 3,
        rowLabel: 'Hàng ngang số 3',
        charCount: 7,
        question:
          'Hàng ngang số 3 (7 chữ cái): Nền văn hóa khảo cổ học sơ kỳ thời đại Đá mới (cách ngày nay khoảng 5.000 – 3.500 năm) của cư dân tiền sử sống trên các thung lũng đá vôi và đảo ven bờ Đông Bắc, nổi tiếng với kỹ thuật chế tác mũi khoan đá và đồ gốm xốp?',
        displayWord: 'SOI NHỤ',
        acceptedAnswers: ['Soi Nhu', 'Van hoa Soi Nhu', 'Cai Beo'],
        explanation: 'Văn hóa Soi Nhụ – Cái Bèo – Hạ Long là minh chứng cho lịch sử cư trú hàng vạn năm của người Việt cổ trên vùng vịnh.',
      },
      {
        id: 4,
        rowLabel: 'Hàng ngang số 4',
        charCount: 6,
        question:
          'Hàng ngang số 4 (6 chữ cái): Tên vị anh hùng vũ trụ người Liên Xô (Gherman ...) đã cùng Chủ tịch Hồ Chí Minh ra thăm vùng biển Đông Bắc vào tháng 01 năm 1962 và được Bác Hồ lấy tên đặt cho một hòn đảo có bãi tắm hình vầng trăng khuyết?',
        displayWord: 'TITOV',
        acceptedAnswers: ['Titov', 'Ti Top', 'Titop', 'Gherman Titov'],
        explanation: 'Đảo Ti Tốp (Titov) trên Vịnh Hạ Long được Bác Hồ đặt tên để kỷ niệm chuyến thăm của nhà du hành vũ trụ Gherman Titov.',
      },
    ],
    centerQuestion: {
      question:
        'Câu hỏi Ô Trung Tâm (8 chữ cái): Năm 2023, Ủy ban Di sản Thế giới tại kỳ họp lần thứ 45 ở Riyadh đã phê chuẩn việc mở rộng ranh giới di sản này sang quần đảo nào thuộc thành phố Hải Phòng để tạo thành Di sản Thế giới liên tỉnh đầu tiên tại Việt Nam?',
      displayWord: 'CÁT BÀ',
      acceptedAnswers: ['Cat Ba', 'Quan dao Cat Ba', 'Dao Cat Ba'],
      explanation: 'Quần thể Vịnh Hạ Long – Quần đảo Cát Bà là Di sản Thiên nhiên Thế giới liên tỉnh Quảng Ninh – Hải Phòng.',
    },
    summaryExplanation:
      'Chướng ngại vật là VỊNH HẠ LONG (10 chữ cái) — Kỳ quan địa chất Karst ngập nước với gần 2.000 hòn đảo đá vôi và bề dày văn hóa biển đảo.',
  },
  {
    id: 'vcnv-2',
    title: 'Lịch sử Giao thương & Văn hóa',
    keywordDisplay: 'PHỐ CỔ HỘI AN',
    charCount: 10,
    acceptedKeywords: ['Pho co Hoi An', 'Hoi An', 'Do thi co Hoi An'],
    imageUrl: OBSTACLE_SVG_ILLUSTRATIONS['vcnv-2'],
    rows: [
      {
        id: 1,
        rowLabel: 'Hàng ngang số 1',
        charCount: 9,
        question:
          'Hàng ngang số 1 (9 chữ cái): Tên gọi loại thuyền buôn viễn dương của Mạc phủ Tokugawa (Nhật Bản) đầu thế kỷ XVII được cấp giấy phép đóng ấn son để vượt biển sang Đông Nam Á giao thương tơ lụa, gốm sứ?',
        displayWord: 'CHâu ẤN THUYỀN',
        acceptedAnswers: ['Chau an thuyen', 'Thuyen Chau an', 'Shuinsen'],
        explanation: 'Các Châu ấn thuyền (Shuinsen) của thương nhân Nhật Bản từng cập cảng Hội An tấp nập vào thế kỷ XVII.',
      },
      {
        id: 2,
        rowLabel: 'Hàng ngang số 2',
        charCount: 5,
        question:
          'Hàng ngang số 2 (5 chữ cái): Trong các bản đồ hàng hải và ghi chép của các giáo sĩ, thương nhân Bồ Đào Nha, Hà Lan, Pháp thế kỷ XVII – XVIII, thương cảng sầm uất bậc nhất xứ Đàng Trong được ghi bằng tên gọi phương Tây gồm 5 chữ cái nào?',
        displayWord: 'FAIFO',
        acceptedAnswers: ['Faifo', 'Fai Fo', 'Hoai Pho'],
        explanation: 'Phương Tây gọi thương cảng Hội An (Hoài Phố) bằng địa danh nổi tiếng "Faifo".',
      },
      {
        id: 3,
        rowLabel: 'Hàng ngang số 3',
        charCount: 7,
        question:
          'Hàng ngang số 3 (7 chữ cái): Khu dự trữ sinh quyển thế giới nằm cách đất liền cửa biển Cửa Đại khoảng 15 km về phía Đông, gồm 8 hòn đảo nhỏ nổi tiếng với di tích giếng cổ Chăm và loài chim yến hàng?',
        displayWord: 'LÀO CHÀM',
        acceptedAnswers: ['Lao Cham', 'Cu Lao Cham', 'Dao Cu Lao Cham'],
        explanation: 'Cù Lao Chàm là tiền đồn sinh thái và hàng hải gắn liền với thương cảng Hội An.',
      },
      {
        id: 4,
        rowLabel: 'Hàng ngang số 4',
        charCount: 7,
        question:
          'Hàng ngang số 4 (7 chữ cái): Loại hình nghệ thuật diễn xướng dân gian vừa hát vừa rút thẻ bài tre trên các chòi cao vùng Trung Bộ, được UNESCO ghi danh là Di sản Văn hóa Phi vật thể Đại diện của Nhân loại năm 2017?',
        displayWord: 'BÀI CHÒI',
        acceptedAnswers: ['Bai choi', 'Nghe thuat Bai choi', 'Ho Bai choi'],
        explanation: 'Hô hát Bài chòi mỗi tối bên bờ sông Hoài là linh hồn văn hóa phi vật thể của Hội An.',
      },
    ],
    centerQuestion: {
      question:
        'Câu hỏi Ô Trung Tâm (10 chữ cái): Tên chữ Hán do chúa Nguyễn Phúc Chu ban tặng năm 1719 có nghĩa là "Chiếc cầu đón khách từ phương xa tới", được chạm khắc trên tấm biển sơn son thếp vàng trước cửa công trình kiến trúc biểu tượng nơi đây?',
      displayWord: 'LAI VIỄN KIỀU',
      acceptedAnswers: ['Lai Vien Kieu', 'Chua Cau'],
      explanation: 'Chùa Cầu mang tên chữ "Lai Viễn Kiều" (cầu đón những người bạn từ phương xa).',
    },
    summaryExplanation:
      'Chướng ngại vật là PHỐ CỔ HỘI AN (10 chữ cái) — Đô thị thương cảng cổ Faifo nơi giao thoa văn hóa Việt – Nhật – Hoa – Phương Tây.',
  },
  {
    id: 'vcnv-3',
    title: 'Khảo cổ học & Luyện kim Cổ đại',
    keywordDisplay: 'TRỐNG ĐỒNG ĐÔNG SƠN',
    charCount: 16,
    acceptedKeywords: ['Trong dong Dong Son', 'Trong dong'],
    imageUrl: OBSTACLE_SVG_ILLUSTRATIONS['vcnv-3'],
    rows: [
      {
        id: 1,
        rowLabel: 'Hàng ngang số 1',
        charCount: 6,
        question:
          'Hàng ngang số 1 (6 chữ cái): Trong bảng phân loại học quốc tế năm 1902 của học giả người Áo Franz Heger về các cổ vật bằng đồng ở Đông Nam Á (gồm 4 loại I, II, III, IV), nhóm cổ vật cổ xưa và tiêu biểu nhất của người Việt cổ thuộc loại nào?',
        displayWord: 'HEGER I',
        acceptedAnswers: ['Heger I', 'Heger 1', 'Loai I', 'Heger'],
        explanation: 'Trong phân loại của Franz Heger (1902), trống đồng Đông Sơn thuộc nhóm cổ nhất và hoàn mỹ nhất là Heger I.',
      },
      {
        id: 2,
        rowLabel: 'Hàng ngang số 2',
        charCount: 6,
        question:
          'Hàng ngang số 2 (6 chữ cái): Nguyên tố kim loại màu trắng bạc (ký hiệu hóa học Sn, số hiệu nguyên tử 50), khi pha trộn với đồng (Cu) và chì (Pb) sẽ tạo nên hợp kim đồng thau/đồng điếu có độ cứng cao và âm thanh ngân vang?',
        displayWord: 'THIẾC',
        acceptedAnswers: ['Thiec', 'Sn', 'Kim loai thiec'],
        explanation: 'Hợp kim đồng – thiếc – chì (Bronze) là thành tựu luyện kim kiệt xuất của cư dân thời đại Kim khí.',
      },
      {
        id: 3,
        rowLabel: 'Hàng ngang số 3',
        charCount: 6,
        question:
          'Hàng ngang số 3 (6 chữ cái): Phương pháp xác định niên đại tuyệt đối trong khảo cổ học do Willard Libby phát minh (Nobel Hóa học 1960), dựa trên chu kỳ bán rã 5.730 năm của đồng vị phóng xạ nào (ký hiệu nguyên tố kèm số khối)?',
        displayWord: 'CACBON',
        acceptedAnswers: ['Cacbon', 'C14', 'Cacbon 14', 'Carbon'],
        explanation: 'Phương pháp đồng vị phóng xạ Cacbon (C-14) giúp xác định niên đại các di chỉ văn hóa Đông Sơn cách nay 2.500 năm.',
      },
      {
        id: 4,
        rowLabel: 'Hàng ngang số 4',
        charCount: 6,
        question:
          'Hàng ngang số 4 (6 chữ cái): Chiếc cổ vật nặng tới 72 kg được tìm thấy tại thôn Hoàng Hạ (Phú Xuyên, Hà Nội) năm 1937, nổi tiếng với các vòng hoa văn khắc họa lễ hội giã gạo, đua thuyền và 14 con chim bay quanh ngôi sao 16 cánh?',
        displayWord: 'HOÀNG HẠ',
        acceptedAnswers: ['Hoang Ha', 'Trong dong Hoang Ha'],
        explanation: 'Cùng với Ngọc Lũ và Cổ Loa, Hoàng Hạ là một trong những chiếc trống đồng Đông Sơn đẹp nhất Việt Nam.',
      },
    ],
    centerQuestion: {
      question:
        'Câu hỏi Ô Trung Tâm (7 chữ cái): Trên các vòng hoa văn hình học đồng tâm của bảo vật này, các họa tiết người hóa trang lông chim và đàn chim bay đều chuyển động theo chiều ngược chiều kim đồng hồ — tương ứng với chiều chuyển động biểu kiến của Trái Đất quanh thiên thể nào?',
      displayWord: 'MẶT TRỜI',
      acceptedAnswers: ['Mat troi', 'Thai duong'],
      explanation: 'Chiều bay ngược chiều kim đồng hồ quanh ngôi sao trung tâm mô phỏng quỹ đạo chuyển động quanh Mặt Trời (lịch pháp nông nghiệp).',
    },
    summaryExplanation:
      'Chướng ngại vật là TRỐNG ĐỒNG ĐÔNG SƠN (16 chữ cái) — Đỉnh cao nghệ thuật đúc đồng Heger I và biểu tượng văn minh Việt cổ.',
  },
  {
    id: 'vcnv-4',
    title: 'Bước ngoặt Lịch sử Thế kỷ XX',
    keywordDisplay: 'ĐIỆN BIÊN PHỦ',
    charCount: 11,
    acceptedKeywords: ['Dien Bien Phu', 'Chien dich Dien Bien Phu'],
    imageUrl: OBSTACLE_SVG_ILLUSTRATIONS['vcnv-4'],
    rows: [
      {
        id: 1,
        rowLabel: 'Hàng ngang số 1',
        charCount: 6,
        question:
          'Hàng ngang số 1 (6 chữ cái): Mật danh chiến dịch hành quân nhảy dù bằng 6 tiểu đoàn dù tinh nhuệ xuống vùng lòng chảo Tây Bắc vào ngày 20/11/1953 của quân đội viễn chinh Pháp (đặt theo tên loài hải ly trong thần thoại Hy Lạp)?',
        displayWord: 'CASTOR',
        acceptedAnswers: ['Castor', 'Cuoc hanh quan Castor'],
        explanation: 'Cuộc hành quân Castor ngày 20/11/1953 mở đầu việc Pháp xây dựng tập đoàn cứ điểm tại Tây Bắc.',
      },
      {
        id: 2,
        rowLabel: 'Hàng ngang số 2',
        charCount: 8,
        question:
          'Hàng ngang số 2 (8 chữ cái): Phương tiện vận tải thô sơ vốn dùng trong nông nghiệp nhưng đã được cải tiến với "tay ngai" và "cọc phanh", giúp hơn 2 vạn dân công hỏa tuyến thồ hàng trăm kilôgam lương thực, đạn dược vượt đèo Pha Đin?',
        displayWord: 'XE ĐẠP THỒ',
        acceptedAnswers: ['Xe dap tho', 'Xe tho'],
        explanation: 'Đội quân xe đạp thồ với kỷ lục thồ hơn 300 kg/xe của Ma Văn Thắng là kỳ tích hậu cần làm kinh ngạc giới quân sự phương Tây.',
      },
      {
        id: 3,
        rowLabel: 'Hàng ngang số 3',
        charCount: 7,
        question:
          'Hàng ngang số 3 (7 chữ cái): Loài hoa màu trắng tinh khôi nở rộ khắp núi rừng Tây Bắc vào khoảng tháng 3 âm lịch hàng năm, gắn liền với chuyện tình nàng Ban – chàng Khum trong văn hóa dân tộc Thái?',
        displayWord: 'HOA BAN',
        acceptedAnswers: ['Hoa ban', 'Ban trang'],
        explanation: 'Mùa hoa ban nở trắng rừng Tây Bắc cũng là thời điểm mở màn chiến dịch mùa xuân năm 1954.',
      },
      {
        id: 4,
        rowLabel: 'Hàng ngang số 4',
        charCount: 7,
        question:
          'Hàng ngang số 4 (7 chữ cái): Tên vị tướng Tổng chỉ huy quân đội viễn chinh Pháp ở Đông Dương (Henri ...) đã đề ra kế hoạch quân sự 18 tháng nhằm xoay chuyển cục diện chiến tranh Đông Dương năm 1953?',
        displayWord: 'NAVARRE',
        acceptedAnswers: ['Navarre', 'Henri Navarre', 'Na Va'],
        explanation: 'Kế hoạch Navarre với "con nhím khổng lồ" đã hoàn toàn phá sản vào chiều ngày 07/05/1954.',
      },
    ],
    centerQuestion: {
      question:
        'Câu hỏi Ô Trung Tâm (8 chữ cái): Sau 11 ngày đêm trăn trở nghiên cứu thực địa tại sở chỉ huy Mường Phăng, Đại tướng Võ Nguyên Giáp đã đưa ra quyết định lịch sử khó khăn nhất cuộc đời chỉ huy của mình: chuyển từ phương châm "Đánh nhanh, thắng nhanh" sang phương châm nào (gồm 4 từ, 16 chữ cái)?',
      displayWord: 'ĐÁNH CHẮC TIẾN CHẮC',
      acceptedAnswers: ['Danh chac tien chac'],
      explanation: 'Quyết định chuyển sang phương châm "Đánh chắc, tiến chắc" ngày 26/01/1954 là nhân tố quyết định dẫn đến toàn thắng.',
    },
    summaryExplanation:
      'Chướng ngại vật là ĐIỆN BIÊN PHỦ (11 chữ cái) — Chiến thắng "lừng lẫy năm châu, chấn động địa cầu" ngày 07/05/1954.',
  },
  {
    id: 'vcnv-5',
    title: 'Kiệt tác Văn chương & Tư tưởng Nhân đạo',
    keywordDisplay: 'TRUYỆN KIỀU',
    charCount: 10,
    acceptedKeywords: ['Truyen Kieu', 'Doan truong tan thanh', 'Kim Van Kieu'],
    imageUrl: OBSTACLE_SVG_ILLUSTRATIONS['vcnv-5'],
    rows: [
      {
        id: 1,
        rowLabel: 'Hàng ngang số 1',
        charCount: 7,
        question:
          'Hàng ngang số 1 (7 chữ cái): Bút danh của học giả Phạm Quỳnh hoặc tên tờ tạp chí văn hóa - học thuật nổi tiếng đầu thế kỷ XX tại Hà Nội, nơi diễn ra cuộc tranh luận học thuật sôi nổi năm 1924 giữa Phạm Quỳnh và Ngô Đức Kế xoay quanh giá trị một kiệt tác văn học cổ điển?',
        displayWord: 'NAM PHONG',
        acceptedAnswers: ['Nam Phong', 'Tap chi Nam Phong'],
        explanation: 'Cuộc bút chiến văn học năm 1924 khởi nguồn từ bài diễn thuyết trên tạp chí Nam Phong.',
      },
      {
        id: 2,
        rowLabel: 'Hàng ngang số 2',
        charCount: 8,
        question:
          'Hàng ngang số 2 (8 chữ cái): Thủ pháp nghệ thuật cổ điển dùng cảnh vật thiên nhiên bên ngoài để gửi gắm, khắc họa tâm trạng nhân vật bên trong ("Cảnh nào cảnh chẳng đeo sầu / Người buồn cảnh có vui đâu bao giờ")?',
        displayWord: 'TẢ CẢNH NGỤ TÌNH',
        acceptedAnswers: ['Ta canh ngu tinh'],
        explanation: 'Nghệ thuật "Tả cảnh ngụ tình" đạt tới đỉnh cao mẫu mực trong thơ lục bát của Nguyễn Du.',
      },
      {
        id: 3,
        rowLabel: 'Hàng ngang số 3',
        charCount: 8,
        question:
          'Hàng ngang số 3 (8 chữ cái): Huyện ven biển thuộc tỉnh Hà Tĩnh nằm bên chân núi Hồng Lĩnh và dòng sông Lam, quê cha của nhiều dòng họ khoa bảng lớn như họ Nguyễn Tiên Điền, họ Nguyễn Huy Trường Lưu?',
        displayWord: 'NGHI XUÂN',
        acceptedAnswers: ['Nghi Xuan', 'Huyen Nghi Xuan', 'Tien Dien'],
        explanation: 'Làng Tiên Điền, huyện Nghi Xuân, tỉnh Hà Tĩnh là quê hương của Đại thi hào Nguyễn Du.',
      },
      {
        id: 4,
        rowLabel: 'Hàng ngang số 4',
        charCount: 7,
        question:
          'Hàng ngang số 4 (7 chữ cái): Bút hiệu của một văn nhân thời Minh – Thanh bên Trung Quốc (Thanh Tâm ...), tác giả cuốn tiểu thuyết chương hồi văn xuôi đã gợi cốt truyện cho kiệt tác thơ Nôm gồm 3.254 câu?',
        displayWord: 'TÀI NHÂN',
        acceptedAnswers: ['Tai Nhan', 'Thanh Tam Tai Nhan'],
        explanation: 'Từ cốt truyện văn xuôi của Thanh Tâm Tài Nhân, Nguyễn Du đã sáng tạo nên một kiệt tác thơ Nôm hoàn toàn mới về tư tưởng và nghệ thuật.',
      },
    ],
    centerQuestion: {
      question:
        'Câu hỏi Ô Trung Tâm (17 chữ cái): Tên gọi đầu tiên bằng chữ Hán gồm 4 chữ (mang ý nghĩa "Tiếng kêu mới đứt ruột") do chính tác giả đặt cho kiệt tác thơ Nôm này là gì?',
      displayWord: 'ĐOẠN TRƯỜNG TÂN THANH',
      acceptedAnswers: ['Doan truong tan thanh'],
      explanation: 'Tên gốc của tác phẩm là "Đoạn trường tân thanh" (Tiếng kêu mới đứt ruột).',
    },
    summaryExplanation:
      'Chướng ngại vật là TRUYỆN KIỀU (10 chữ cái) — Đỉnh cao chói lọi của nghệ thuật ngôn từ tiếng Việt và chủ nghĩa nhân đạo của Đại thi hào Nguyễn Du.',
  },
  {
    id: 'vcnv-6',
    title: 'Khoa học Không gian & Viễn thông',
    keywordDisplay: 'VINASAT 1',
    charCount: 8,
    acceptedKeywords: ['Vinasat 1', 'Vinasat-1', 'Ve tinh Vinasat 1', 'Vinasat'],
    imageUrl: OBSTACLE_SVG_ILLUSTRATIONS['vcnv-6'],
    rows: [
      {
        id: 1,
        rowLabel: 'Hàng ngang số 1',
        charCount: 8,
        question:
          'Hàng ngang số 1 (8 chữ cái): Trong cơ học thiên thể, quỹ đạo tròn nằm ngay trên mặt phẳng xích đạo ở độ cao khoảng 35.786 km so với mực nước biển, nơi chu kỳ quay của vật thể bằng đúng chu kỳ tự quay của Trái Đất (23 giờ 56 phút 4 giây), được gọi là quỹ đạo gì?',
        displayWord: 'ĐỊA TĨNH',
        acceptedAnswers: ['Dia tinh', 'Quy dao dia tinh'],
        explanation: 'Quỹ đạo địa tĩnh (Geostationary Orbit) giúp vệ tinh viễn thông luôn đứng yên tương đối so với một trạm thu phát trên mặt đất.',
      },
      {
        id: 2,
        rowLabel: 'Hàng ngang số 2',
        charCount: 6,
        question:
          'Hàng ngang số 2 (6 chữ cái): Sân bay vũ trụ nằm tại vùng lãnh thổ Guiana thuộc Pháp ở bờ biển Đông Bắc Nam Mỹ (gần xích đạo), nơi phóng các tên lửa đẩy Ariane của châu Âu?',
        displayWord: 'KOUROU',
        acceptedAnswers: ['Kourou', 'Guiana'],
        explanation: 'Bãi phóng vũ trụ Kourou (Guiana thuộc Pháp) là nơi tên lửa Ariane-5 rời bệ phóng sáng ngày 19/04/2008.',
      },
      {
        id: 3,
        rowLabel: 'Hàng ngang số 3',
        charCount: 6,
        question:
          'Hàng ngang số 3 (6 chữ cái): Dải tần số sóng vô tuyến viễn thông (nằm trong khoảng 12 – 18 GHz và 4 – 8 GHz, ký hiệu là C và ...) được sử dụng cho các bộ phát đáp truyền hình vệ tinh phủ sóng toàn vùng Đông Nam Á?',
        displayWord: 'BĂNG KU',
        acceptedAnswers: ['Bang Ku', 'Ku', 'Bang tan Ku'],
        explanation: 'Hệ thống 20 bộ phát đáp hoạt động trên băng tần C và băng tần Ku giúp phủ sóng toàn bộ Việt Nam và khu vực lân cận.',
      },
      {
        id: 4,
        rowLabel: 'Hàng ngang số 4',
        charCount: 7,
        question:
          'Hàng ngang số 4 (7 chữ cái): Thành phố tỉnh lỵ của tỉnh Hà Nam (nay là phường trung tâm thuộc Hà Nam), gần nơi đặt Trạm điều khiển vệ tinh mặt đất chính tại xã Thanh Nghị (huyện Thanh Liêm) và Quế Dương (Hoài Đức)?',
        displayWord: 'PHỦ LÝ',
        acceptedAnswers: ['Phu Ly', 'Que Duong'],
        explanation: 'Các trạm điều khiển mặt đất tại Quế Dương (Hà Nội) và Bình Dương đảm nhận việc vận hành vệ tinh.',
      },
    ],
    centerQuestion: {
      question:
        'Câu hỏi Ô Trung Tâm (7 chữ cái): Sự kiện lịch sử lúc 05 giờ 17 phút sáng ngày 19/04/2008 (giờ Hà Nội) đã đưa Việt Nam trở thành quốc gia thứ 93 trên thế giới và thứ 6 trong khu vực ASEAN sở hữu gì trên không gian?',
      displayWord: 'CHỦ QUYỀN',
      acceptedAnswers: ['Chu quyen', 'Ve tinh rieng', 'Ve tinh'],
      explanation: 'Sự kiện phóng thành công vệ tinh viễn thông đầu tiên khẳng định chủ quyền không gian quỹ đạo tần số quốc gia của Việt Nam.',
    },
    summaryExplanation:
      'Chướng ngại vật là VINASAT 1 (8 chữ cái) — Vệ tinh viễn thông địa tĩnh đầu tiên của Việt Nam được phóng thành công ngày 19/04/2008.',
  },
  {
    id: 'vcnv-7',
    title: 'Thiên văn học & Cơ học Thiên thể',
    keywordDisplay: 'HỆ MẶT TRỜI',
    charCount: 9,
    acceptedKeywords: ['He Mat Troi', 'Thái Dương Hệ', 'Thai Duong He'],
    imageUrl: OBSTACLE_SVG_ILLUSTRATIONS['vcnv-7'],
    rows: [
      {
        id: 1,
        rowLabel: 'Hàng ngang số 1',
        charCount: 6,
        question:
          'Hàng ngang số 1 (6 chữ cái): Nhà thiên văn học, toán học người Đức thế kỷ XVII (Johannes ...), người đã phát biểu 3 định luật toán học mô tả chuyển động của các thiên thể trên quỹ đạo elip?',
        displayWord: 'KEPLER',
        acceptedAnswers: ['Kepler', 'Johannes Kepler'],
        explanation: 'Ba định luật Kepler là nền tảng của cơ học thiên thể mô tả sự vận hành các hành tinh.',
      },
      {
        id: 2,
        rowLabel: 'Hàng ngang số 2',
        charCount: 6,
        question:
          'Hàng ngang số 2 (6 chữ cái): Vành đai gồm hàng triệu thiên thạch, băng đá và các hành tinh lùn (như Pluto, Eris, Haumea) nằm bên ngoài quỹ đạo của Sao Hải Vương (ở khoảng cách từ 30 đến 50 AU)?',
        displayWord: 'KUIPER',
        acceptedAnswers: ['Kuiper', 'Vanh dai Kuiper'],
        explanation: 'Vành đai Kuiper và đám mây Oort bao bọc vùng rìa ngoài cùng của cấu trúc thiên văn này.',
      },
      {
        id: 3,
        rowLabel: 'Hàng ngang số 3',
        charCount: 8,
        question:
          'Hàng ngang số 3 (8 chữ cái): Phản ứng hạt nhân tổng hợp các hạt nhân nhẹ (như tổng hợp Hydro thành Heli ở nhiệt độ hàng chục triệu độ K) tạo ra nguồn năng lượng bức xạ khổng lồ trong lõi các ngôi sao?',
        displayWord: 'NHIỆT HẠCH',
        acceptedAnswers: ['Nhiet hach', 'Phan ung nhiet hach', 'Tong hop hat nhan'],
        explanation: 'Phản ứng nhiệt hạch trong lõi ngôi sao trung tâm cung cấp toàn bộ quang năng và nhiệt năng.',
      },
      {
        id: 4,
        rowLabel: 'Hàng ngang số 4',
        charCount: 7,
        question:
          'Hàng ngang số 4 (7 chữ cái): Tên con tàu vũ trụ không người lái của NASA được phóng năm 1977 (mang theo Đĩa ghi Vàng chứa âm thanh và hình ảnh của Trái Đất), trở thành vật thể nhân tạo đầu tiên vượt qua nhật mãn đi vào không gian liên sao năm 2012?',
        displayWord: 'VOYAGER',
        acceptedAnswers: ['Voyager', 'Voyager 1', 'Tau Voyager'],
        explanation: 'Voyager 1 và Voyager 2 đã khám phá các hành tinh khí khổng lồ trước khi tiến ra ranh giới nhật quyển.',
      },
    ],
    centerQuestion: {
      question:
        'Câu hỏi Ô Trung Tâm (8 chữ cái): Học thuyết thiên văn do Nicolaus Copernicus công bố trong tác phẩm "De revolutionibus orbium coelestium" năm 1543, đặt Mặt Trời chứ không phải Trái Đất ở vị trí trung tâm, được gọi là thuyết gì?',
      displayWord: 'NHẬT TÂM',
      acceptedAnswers: ['Nhat tam', 'Thuyet Nhat tam'],
      explanation: 'Thuyết Nhật tâm của Copernicus đã làm thay đổi hoàn toàn nhận thức nhân loại về vũ trụ.',
    },
    summaryExplanation:
      'Chướng ngại vật là HỆ MẶT TRỜI / THÁI DƯƠNG HỆ (9 chữ cái) — Hệ hành tinh có Mặt Trời ở tâm cùng 8 hành tinh và các vành đai thiên thể quay quanh.',
  },
  {
    id: 'vcnv-8',
    title: 'Văn hóa Ẩm thực & Lịch sử Đô thị',
    keywordDisplay: 'PHỞ VIỆT NAM',
    charCount: 10,
    acceptedKeywords: ['Pho Viet Nam', 'Pho', 'Mon Pho'],
    imageUrl: OBSTACLE_SVG_ILLUSTRATIONS['vcnv-8'],
    rows: [
      {
        id: 1,
        rowLabel: 'Hàng ngang số 1',
        charCount: 8,
        question:
          'Hàng ngang số 1 (8 chữ cái): Loại quả khô hình ngôi sao 8 cánh của một loài cây thân gỗ mọc nhiều ở Lạng Sơn (chứa tinh dầu trans-anethole), tạo nên hương thơm nồng ấm đặc trưng trong nghệ thuật ninh hầm truyền thống?',
        displayWord: 'ĐẠI HỒI',
        acceptedAnswers: ['Dai hoi', 'Hoa hoi', 'Canh hoi'],
        explanation: 'Đại hồi (hoa hồi), thảo quả, quế chi và gừng nướng là những hương liệu tạo nên hồn cốt của nước dùng.',
      },
      {
        id: 2,
        rowLabel: 'Hàng ngang số 2',
        charCount: 8,
        question:
          'Hàng ngang số 2 (8 chữ cái): Tác giả của tập tùy bút nổi tiếng "Hà Nội băm sáu phố phường" (1943) và thiên tùy bút "Miếng ngon Hà Nội" của Vũ Bằng, trong đó nhà văn viết: "Đó là thứ quà suốt ngày của tất cả các hạng người"?',
        displayWord: 'THẠCH LAM',
        acceptedAnswers: ['Thach Lam', 'Vu Bang'],
        explanation: 'Nhà văn Thạch Lam (trong "Hà Nội băm sáu phố phường"), Nguyễn Tuân và Vũ Bằng đều có những trang tùy bút bất hủ về món ăn này.',
      },
      {
        id: 3,
        rowLabel: 'Hàng ngang số 3',
        charCount: 6,
        question:
          'Hàng ngang số 3 (6 chữ cái): Ngôi làng cổ thuộc xã Nam Vân, huyện Nam Trực, tỉnh Nam Định (dòng họ Cồ), nơi nghề tráng bánh gạo và gánh hàng rong theo chân người dân lên các đô thị lớn từ đầu thế kỷ XX?',
        displayWord: 'VÂN CÙ',
        acceptedAnswers: ['Van Cu', 'Lang Van Cu', 'Giao Cu'],
        explanation: 'Làng Vân Cù (Nam Định) là chiếc nôi truyền thống của nghề nấu và gánh hàng gia truyền nổi tiếng cả nước.',
      },
      {
        id: 4,
        rowLabel: 'Hàng ngang số 4',
        charCount: 6,
        question:
          'Hàng ngang số 4 (6 chữ cái): Từ điển tiếng Anh uy tín bậc nhất thế giới của Vương quốc Anh đã chính thức đưa danh từ chỉ món ăn truyền thống này của người Việt vào mục từ quốc tế từ tháng 09 năm 2007?',
        displayWord: 'OXFORD',
        acceptedAnswers: ['Oxford', 'Tu dien Oxford', 'OED'],
        explanation: 'Từ điển Oxford English Dictionary (OED) đã chính thức định danh danh từ riêng này như một đại sứ văn hóa Việt Nam.',
      },
    ],
    centerQuestion: {
      question:
        'Câu hỏi Ô Trung Tâm (8 chữ cái): Tháng 08 năm 2024, Bộ Văn hóa, Thể thao và Du lịch đã chính thức ghi danh tri thức dân gian về món ăn này tại Hà Nội và Nam Định vào Danh mục Di sản Văn hóa ... quốc gia?',
      displayWord: 'PHI VẬT THỂ',
      acceptedAnswers: ['Phi vat the', 'Di san phi vat the'],
      explanation: 'Tri thức dân gian chế biến món ăn này đã trở thành Di sản Văn hóa Phi vật thể Quốc gia năm 2024.',
    },
    summaryExplanation:
      'Chướng ngại vật là PHỞ VIỆT NAM (10 chữ cái) — Tinh hoa ẩm thực truyền thống và đại sứ văn hóa Việt Nam trên bản đồ thế giới.',
  },
];

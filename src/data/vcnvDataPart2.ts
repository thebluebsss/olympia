import type { ObstaclePuzzle } from './questionTypes.ts';
import { OBSTACLE_SVG_ILLUSTRATIONS } from '../utils/obstacleIllustrations.ts';

// ==================== PHẦN 2B: BỘ ĐỀ VƯỢT CHƯỚNG NGẠI VẬT (BỘ 9 -> BỘ 16: LIÊN KẾT BẮC CẦU GIÁN TIẾP, ĐỘ KHÓ CAO) ====================
export const OBSTACLE_PUZZLES_PART2: ObstaclePuzzle[] = [
  {
    id: 'vcnv-9',
    title: 'Sinh lý Thực vật & Năng lượng Sinh quyển',
    keywordDisplay: 'QUANG HỢP',
    charCount: 8,
    acceptedKeywords: ['Quang hop', 'Qua trinh quang hop'],
    imageUrl: OBSTACLE_SVG_ILLUSTRATIONS['vcnv-9'],
    rows: [
      {
        id: 1,
        rowLabel: 'Hàng ngang số 1',
        charCount: 5,
        question:
          'Hàng ngang số 1 (5 chữ cái): Nguyên tố kim loại kiềm thổ (ký hiệu hóa học Mg, Z = 12) nằm ở vị trí trung tâm của vòng porphyrin trong cấu trúc phân tử sắc tố màu xanh lục của lá cây?',
        displayWord: 'MAGIE',
        acceptedAnswers: ['Magie', 'Magnesium', 'Mg'],
        explanation: 'Nguyên tử Magie (Mg) là nhân trung tâm của phân tử diệp lục (Chlorophyll), tương tự như Sắt (Fe) trong Hemoglobin.',
      },
      {
        id: 2,
        rowLabel: 'Hàng ngang số 2',
        charCount: 6,
        question:
          'Hàng ngang số 2 (6 chữ cái): Họ của nhà sinh hóa học người Mỹ (Melvin ...), người nhận Giải Nobel Hóa học năm 1961 nhờ dùng đồng vị phóng xạ Cacbon-14 để làm sáng tỏ chu trình cố định CO₂ trong chất nền stroma?',
        displayWord: 'CALVIN',
        acceptedAnswers: ['Calvin', 'Melvin Calvin', 'Chu trinh Calvin'],
        explanation: 'Chu trình Calvin (pha tối) chuyển hóa CO₂ thành hợp chất hữu cơ C₆H₁₂O₆ nhờ ATP và NADPH từ pha sáng.',
      },
      {
        id: 3,
        rowLabel: 'Hàng ngang số 3',
        charCount: 9,
        question:
          'Hàng ngang số 3 (9 chữ cái): Cấu trúc túi dẹt màng nội bào xếp chồng lên nhau tạo thành các hạt Grana bên trong bào quan của tế bào thực vật, nơi diễn ra chuỗi truyền điện tử và quang phân li nước?',
        displayWord: 'THYLAKOID',
        acceptedAnswers: ['Thylakoid', 'Tilacoit', 'Mang Thylakoid'],
        explanation: 'Màng Thylakoid là nơi chứa hệ sắc tố và diễn ra pha sáng chuyển hóa quang năng thành hóa năng.',
      },
      {
        id: 4,
        rowLabel: 'Hàng ngang số 4',
        charCount: 8,
        question:
          'Hàng ngang số 4 (8 chữ cái): Cấu trúc lỗ nhỏ li ti nằm chủ yếu ở lớp biểu bì mặt dưới của phiến lá (được tạo bởi hai tế bào hình hạt đậu), đóng mở để điều tiết sự thoát hơi nước và trao đổi khí với môi trường?',
        displayWord: 'KHÍ KHỔNG',
        acceptedAnswers: ['Khi khong', 'Lo khi'],
        explanation: 'Khí khổng mở ra giúp CO₂ khuếch tán vào lá và giải phóng O₂ ra khí quyển.',
      },
    ],
    centerQuestion: {
      question:
        'Câu hỏi Ô Trung Tâm (7 chữ cái): Trong phản ứng quang phân li nước (2H₂O → 4H⁺ + 4e⁻ + O₂) ở pha sáng, toàn bộ lượng khí Oxy tự do giải phóng ra bầu khí quyển Trái Đất có nguồn gốc từ các nguyên tử Oxy của phân tử nào?',
      displayWord: 'PHÂN TỬ NƯỚC',
      acceptedAnswers: ['Phan tu nuoc', 'Nuoc', 'H2O'],
      explanation: 'Thí nghiệm đánh dấu đồng vị O¹⁸ của Ruben và Kamen chứng minh 100% O₂ giải phóng có nguồn gốc từ H₂O chứ không phải từ CO₂.',
    },
    summaryExplanation:
      'Chướng ngại vật là QUANG HỢP (8 chữ cái) — Quá trình sinh học nền tảng biến đổi năng lượng ánh sáng mặt trời thành năng lượng hóa học nuôi sống sinh quyển.',
  },
  {
    id: 'vcnv-10',
    title: 'Lịch sử Trang phục & Văn hóa Dân tộc',
    keywordDisplay: 'ÁO DÀI VIỆT NAM',
    charCount: 12,
    acceptedKeywords: ['Ao dai Viet Nam', 'Ao dai', 'Ta ao dai'],
    imageUrl: OBSTACLE_SVG_ILLUSTRATIONS['vcnv-10'],
    rows: [
      {
        id: 1,
        rowLabel: 'Hàng ngang số 1',
        charCount: 8,
        question:
          'Hàng ngang số 1 (8 chữ cái): Vị chúa Nguyễn đầu tiên được xưng là "Vũ Vương" (Nguyễn Phúc ...), người vào năm Giáp Tý 1744 tại Phú Xuân đã ban hành sắc dụ cải cách triều phục và thường phục xứ Đàng Trong, định hình kiểu áo cài khuy bên phải?',
        displayWord: 'PHÚC KHOÁT',
        acceptedAnswers: ['Phuc Khoat', 'Nguyen Phuc Khoat', 'Vo Vuong'],
        explanation: 'Chúa Võ Vương Nguyễn Phúc Khoát được lịch sử ghi nhận là người khai sinh kiểu áo ngũ thân truyền thống từ năm 1744.',
      },
      {
        id: 2,
        rowLabel: 'Hàng ngang số 2',
        charCount: 7,
        question:
          'Hàng ngang số 2 (7 chữ cái): Họa sĩ tốt nghiệp Trường Cao đẳng Mỹ thuật Đông Dương (Nguyễn ...), người vào năm 1934 trên báo Phong Hóa đã khởi xướng cuộc cách tân kiểu áo "Lemur" chỉ còn hai vạt trước – sau ôm tôn dáng?',
        displayWord: 'CÁT TƯỜNG',
        acceptedAnswers: ['Cat Tuong', 'Nguyen Cat Tuong', 'Lemur'],
        explanation: 'Họa sĩ Nguyễn Cát Tường (bút danh Lemur) đã cách tân trang phục truyền thống theo hướng hiện đại và thanh lịch.',
      },
      {
        id: 3,
        rowLabel: 'Hàng ngang số 3',
        charCount: 7,
        question:
          'Hàng ngang số 3 (7 chữ cái): Kiểu áo cổ truyền thời Nguyễn được may từ 5 khổ vải ghép lại (tượng trưng cho "tứ thân phụ mẫu" và bản thân người mặc, đồng thời biểu trưng cho đạo lý Nhân – Nghĩa – Lễ – Trí – Tín)?',
        displayWord: 'NGŨ THÂN',
        acceptedAnswers: ['Ngu than', 'Ao ngu than'],
        explanation: 'Áo ngũ thân tay chẽn hoặc tay thụng là tiền thân trực tiếp của tà áo hiện đại.',
      },
      {
        id: 4,
        rowLabel: 'Hàng ngang số 4',
        charCount: 6,
        question:
          'Hàng ngang số 4 (6 chữ cái): Ngôi làng dệt lụa cổ truyền ngàn năm nằm bên bờ sông Nhuệ (thuộc quận Hà Đông, Hà Nội), nổi tiếng với những tấm lụa tơ tằm mềm mại óng ả ("Lụa ...")?',
        displayWord: 'VẠN PHÚC',
        acceptedAnswers: ['Van Phuc', 'Lua Van Phuc', 'Lua Ha Dong'],
        explanation: 'Lụa Vạn Phúc (Hà Đông) là chất liệu thượng hạng gắn liền với vẻ đẹp thướt tha của trang phục truyền thống Việt.',
      },
    ],
    centerQuestion: {
      question:
        'Câu hỏi Ô Trung Tâm (9 chữ cái): Trong ca khúc "Một thoáng quê hương" của hai nhạc sĩ Từ Huy và Thanh Tùng, hình ảnh trang phục này được tôn vinh qua câu hát: "Đẹp biết bao quê hương cho ta chiếc áo nhiệm màu / Dù ở đâu Paris, Luân Đôn hay ở những miền xa / Thoáng thấy ... bay trên đường phố / Sẽ thấy tâm hồn quê hương ở đó, em ơi"?',
      displayWord: 'ÁO DÀI BAY',
      acceptedAnswers: ['Ao dai bay', 'Ao dai', 'Ta ao dai'],
      explanation: 'Hình ảnh tà áo bay trên đường phố đã trở thành biểu tượng văn hóa nhận diện người Việt trên khắp năm châu.',
    },
    summaryExplanation:
      'Chướng ngại vật là ÁO DÀI VIỆT NAM (12 chữ cái) — Biểu tượng văn hóa, thẩm mỹ và tâm hồn dân tộc Việt Nam qua gần ba thế kỷ lịch sử.',
  },
  {
    id: 'vcnv-11',
    title: 'Thiên văn học & Lịch sử Thám hiểm Không gian',
    keywordDisplay: 'MẶT TRĂNG',
    charCount: 8,
    acceptedKeywords: ['Mat Trang', 'Nguyet cau', 'Trang'],
    imageUrl: OBSTACLE_SVG_ILLUSTRATIONS['vcnv-11'],
    rows: [
      {
        id: 1,
        rowLabel: 'Hàng ngang số 1',
        charCount: 8,
        question:
          'Hàng ngang số 1 (8 chữ cái): Hiện tượng cơ học thiên thể (Khóa ...) giải thích vì sao chu kỳ tự quay quanh trục của thiên thể này bằng đúng chu kỳ nó quay quanh Trái Đất (~27,32 ngày), khiến người đứng trên Trái Đất chỉ luôn nhìn thấy một bán cầu duy nhất của nó?',
        displayWord: 'THỦY TRIỀU',
        acceptedAnswers: ['Thuy trieu', 'Khoa thuy trieu', 'Dong bo'],
        explanation: 'Hiện tượng "Khóa thủy triều" (Tidal locking) giữ cho thiên thể này luôn hướng một mặt cố định về phía Trái Đất.',
      },
      {
        id: 2,
        rowLabel: 'Hàng ngang số 2',
        charCount: 9,
        question:
          'Hàng ngang số 2 (9 chữ cái): Họ của vị chỉ huy trưởng (Neil ...) đã điều khiển mô-đun Đại Bàng (Eagle) hạ cánh xuống vùng "Biển Tĩnh Lặng" (Mare Tranquillitatis) ngày 20/07/1969?',
        displayWord: 'ARMSTRONG',
        acceptedAnswers: ['Armstrong', 'Neil Armstrong'],
        explanation: 'Neil Armstrong là con người đầu tiên đặt chân lên một thiên thể ngoài Trái Đất trong sứ mệnh Apollo 11.',
      },
      {
        id: 3,
        rowLabel: 'Hàng ngang số 3',
        charCount: 5,
        question:
          'Hàng ngang số 3 (5 chữ cái): Tên con tàu thăm dò tự động của Liên Xô phóng tháng 9 năm 1959 (thuộc chương trình ... 2 và ... 3) lần đầu tiên chụp được bức ảnh lịch sử về "bán cầu khuất" phía bên kia của thiên thể này?',
        displayWord: 'LUNA 3',
        acceptedAnswers: ['Luna 3', 'Luna', 'Tau Luna 3'],
        explanation: 'Tàu vũ trụ Luna 3 của Liên Xô năm 1959 lần đầu tiên cho nhân loại thấy hình ảnh mặt khuất phía xa.',
      },
      {
        id: 4,
        rowLabel: 'Hàng ngang số 4',
        charCount: 7,
        question:
          'Hàng ngang số 4 (7 chữ cái): Loại lịch pháp cổ truyền của các cư dân phương Đông được tính toán dựa trên chu kỳ biến đổi pha (Sóc – Thượng huyền – Vọng – Hạ huyền) kéo dài 29,53 ngày giữa hai lần không trăng liên tiếp?',
        displayWord: 'ÂM LỊCH',
        acceptedAnswers: ['Am lich', 'Lich am'],
        explanation: 'Chu kỳ tuần trăng 29,53 ngày (tháng giao hội) là cơ sở tính toán của Âm lịch và Nông lịch.',
      },
    ],
    centerQuestion: {
      question:
        'Câu hỏi Ô Trung Tâm (13 chữ cái): Theo định nghĩa chuẩn của Hiệp hội Thiên văn Quốc tế (IAU), thiên thể có đường kính 3.474 km và gia tốc trọng trường bằng 1/6 Trái Đất này là ... duy nhất của hành tinh chúng ta?',
      displayWord: 'VỆ TINH TỰ NHIÊN',
      acceptedAnswers: ['Ve tinh tu nhien', 'Ve tinh'],
      explanation: 'Đây là vệ tinh tự nhiên duy nhất của Trái Đất và là vệ tinh lớn thứ 5 trong Hệ Mặt Trời.',
    },
    summaryExplanation:
      'Chướng ngại vật là MẶT TRĂNG (8 chữ cái) — Vệ tinh tự nhiên duy nhất của Trái Đất, gắn liền với hiện tượng thủy triều, Âm lịch và lịch sử chinh phục vũ trụ.',
  },
  {
    id: 'vcnv-12',
    title: 'Sinh học Phân tử & Di truyền học',
    keywordDisplay: 'PHÂN TỬ ADN',
    charCount: 9,
    acceptedKeywords: ['Phan tu ADN', 'ADN', 'DNA', 'Axit Deoxyribonucleic'],
    imageUrl: OBSTACLE_SVG_ILLUSTRATIONS['vcnv-12'],
    rows: [
      {
        id: 1,
        rowLabel: 'Hàng ngang số 1',
        charCount: 8,
        question:
          'Hàng ngang số 1 (8 chữ cái): Họ của nữ nhà lý sinh học và tinh thể học người Anh (Rosalind ...), người đã chụp bức ảnh nhiễu xạ tia X số 51 ("Photo 51") nổi tiếng năm 1952, cung cấp bằng chứng thực nghiệm quyết định về cấu trúc không gian của đại phân tử di truyền?',
        displayWord: 'FRANKLIN',
        acceptedAnswers: ['Franklin', 'Rosalind Franklin'],
        explanation: 'Bức ảnh Photo 51 của Rosalind Franklin là chìa khóa thực nghiệm dẫn tới khám phá năm 1953.',
      },
      {
        id: 2,
        rowLabel: 'Hàng ngang số 2',
        charCount: 8,
        question:
          'Hàng ngang số 2 (8 chữ cái): Định luật hóa sinh do nhà khoa học người Áo Erwin ... phát biểu năm 1950, chứng minh rằng trong đại phân tử mạch kép của mọi loài sinh vật, tỷ lệ số lượng пуrin luôn bằng pyrimidin (A = T và G = X)?',
        displayWord: 'CHARGAFF',
        acceptedAnswers: ['Chargaff', 'Quy tac Chargaff', 'Erwin Chargaff'],
        explanation: 'Quy tắc Chargaff (A + G = T + X) là cơ sở cho nguyên tắc bổ sung giữa hai mạch đơn.',
      },
      {
        id: 3,
        rowLabel: 'Hàng ngang số 3',
        charCount: 7,
        question:
          'Hàng ngang số 3 (7 chữ cái): Tên gọi các đoạn mạch ngắn (gồm khoảng 1.000 – 2.000 đơn phân ở vi khuẩn) được tổng hợp gián đoạn theo chiều 5\' → 3\' trên mạch khuôn có chiều 5\' → 3\' trong quá trình tái bản (đặt theo tên nhà sinh học Nhật Bản Reiji ...)?',
        displayWord: 'OKAZAKI',
        acceptedAnswers: ['Okazaki', 'Doan Okazaki'],
        explanation: 'Các đoạn Okazaki trên mạch tổng hợp gián đoạn sau đó được nối lại nhờ enzyme Ligase.',
      },
      {
        id: 4,
        rowLabel: 'Hàng ngang số 4',
        charCount: 6,
        question:
          'Hàng ngang số 4 (6 chữ cái): Loại protein có tính kiềm nằm trong nhân tế bào nhân thực, được chuỗi đại phân tử di truyền quấn quanh 1,75 vòng (gồm 146 cặp đơn phân) để tạo nên cấu trúc đơn vị cơ bản Nucleosome của nhiễm sắc thể?',
        displayWord: 'HISTON',
        acceptedAnswers: ['Histon', 'Histone', 'Protein Histon'],
        explanation: 'Nhờ quấn quanh các lõi protein Histon, phân tử di truyền dài hàng mét có thể đóng xoắn gọn trong nhân tế bào siêu nhỏ.',
      },
    ],
    centerQuestion: {
      question:
        'Câu hỏi Ô Trung Tâm (7 chữ cái): Theo mô hình công bố trên tạp chí Nature ngày 25/04/1953 của James Watson và Francis Crick, đại phân tử này gồm hai chuỗi полиnucleotit song song ngược chiều quấn quanh một trục tưởng tượng tạo thành cấu trúc hình học gì?',
      displayWord: 'XOẮN KÉP',
      acceptedAnswers: ['Xoan kep', 'Chuoi xoan kep'],
      explanation: 'Cấu trúc xoắn kép (Double Helix) với mỗi chu kỳ xoắn dài 34 Å gồm 10 cặp nucleotit là biểu tượng của sinh học hiện đại.',
    },
    summaryExplanation:
      'Chướng ngại vật là PHÂN TỬ ADN / DNA (9 chữ cái) — Đại phân tử sinh học mang cấu trúc xoắn kép lưu giữ và truyền đạt thông tin di truyền.',
  },
  {
    id: 'vcnv-13',
    title: 'Kiến trúc & Triết lý Văn hóa Đại Việt',
    keywordDisplay: 'CHÙA MỘT CỘT',
    charCount: 10,
    acceptedKeywords: ['Chua Mot Cot', 'Dien Huu Tu', 'Chua Dien Huu', 'Lien Hoa Dai'],
    imageUrl: OBSTACLE_SVG_ILLUSTRATIONS['vcnv-13'],
    rows: [
      {
        id: 1,
        rowLabel: 'Hàng ngang số 1',
        charCount: 7,
        question:
          'Hàng ngang số 1 (7 chữ cái): Tên chữ Hán nguyên thủy của ngôi chùa được ghi trong sách "Đại Việt sử ký toàn thư" (khởi dựng mùa đông năm Kỷ Sửu 1049), mang ý nghĩa "Phước lành bền vững dài lâu"?',
        displayWord: 'DIÊN HỰU',
        acceptedAnswers: ['Dien Huu', 'Dien Huu Tu', 'Chua Dien Huu'],
        explanation: 'Diên Hựu Tự là quốc tự nổi tiếng bậc nhất của kinh thành Thăng Long thời Lý.',
      },
      {
        id: 2,
        rowLabel: 'Hàng ngang số 2',
        charCount: 9,
        question:
          'Hàng ngang số 2 (9 chữ cái): Tên gọi chiếc hồ nước hình vuông bao quanh trụ đá nâng đỡ ngôi đài gỗ, thể hiện triết lý vũ trụ quan phương Đông "Trời tròn, Đất vuông" (Tượng trưng cho Âm – Dương hòa hợp)?',
        displayWord: 'LINH CHIỂU',
        acceptedAnswers: ['Linh Chieu', 'Ho Linh Chieu'],
        explanation: 'Đài gỗ hình hoa sen nở trên mặt hồ vuông Linh Chiểu biểu trưng cho trí tuệ giác ngộ.',
      },
      {
        id: 3,
        rowLabel: 'Hàng ngang số 3',
        charCount: 9,
        question:
          'Hàng ngang số 3 (9 chữ cái): Hệ thống các thanh gỗ lim đan chéo chịu lực nâng đỡ toàn bộ phần đài phía trên trụ đá, là tuyệt kỹ kết cấu mộng gỗ không dùng đinh sắt của kiến trúc cổ truyền phương Đông (Hệ ...)?',
        displayWord: 'CỦNG ĐỠ',
        acceptedAnswers: ['Cung do', 'Đấu củng', 'Dau cung', 'He cung do'],
        explanation: 'Hệ củng đỡ (đấu củng) gồm 8 thanh gỗ vươn chéo từ trụ đá tạo dáng như những cánh sen nâng đỡ đài Phật.',
      },
      {
        id: 4,
        rowLabel: 'Hàng ngang số 4',
        charCount: 10,
        question:
          'Hàng ngang số 4 (10 chữ cái): Vị kiến trúc sư tài danh người Việt Nam (Nguyễn ...), người đã thiết kế phục dựng lại nguyên trạng công trình di tích này vào tháng 4 năm 1955 ngay sau khi tiếp quản Thủ đô?',
        displayWord: 'BÁ LĂNG',
        acceptedAnswers: ['Ba Lang', 'Nguyen Ba Lang'],
        explanation: 'Kiến trúc sư Nguyễn Bá Lăng là người chủ trì khôi phục công trình theo đúng bản vẽ cổ sau khi bị phá hủy năm 1954.',
      },
    ],
    centerQuestion: {
      question:
        'Câu hỏi Ô Trung Tâm (10 chữ cái): Theo văn bia cổ "Sùng Thiện Diên Linh" khắc năm 1121 thời vua Lý Nhân Tông đặt tại chùa Đọi Sơn (Hà Nam), tòa đài gỗ đặt trên một cột đá giữa hồ có tên gọi chính thức là gì (gồm 3 chữ)?',
      displayWord: 'LIÊN HOA ĐÀI',
      acceptedAnswers: ['Lien Hoa Dai', 'Dai Lien Hoa'],
      explanation: 'Văn bia Sùng Thiện Diên Linh (1121) mô tả chi tiết: "Đào hồ Linh Chiểu, giữa hồ vọt lên một cột đá, trên cột đá có tòa Liên Hoa Đài".',
    },
    summaryExplanation:
      'Chướng ngại vật là CHÙA MỘT CỘT / DIÊN HỰU TỰ (10 chữ cái) — Kiệt tác kiến trúc Liên Hoa Đài độc nhất vô nhị từ triều Lý năm 1049.',
  },
  {
    id: 'vcnv-14',
    title: 'Định lý Toán học Cổ điển',
    keywordDisplay: 'ĐỊNH LÝ PYTHAGORAS',
    charCount: 15,
    acceptedKeywords: ['Dinh ly Pythagoras', 'Dinh ly Pytago', 'Pythagoras', 'Pytago'],
    imageUrl: OBSTACLE_SVG_ILLUSTRATIONS['vcnv-14'],
    rows: [
      {
        id: 1,
        rowLabel: 'Hàng ngang số 1',
        charCount: 5,
        question:
          'Hàng ngang số 1 (5 chữ cái): Hòn đảo của Hy Lạp trên vùng biển Aegean (nằm gần bờ biển Tiểu Á), quê hương của nhà triết học – toán học sáng lập trường phái học thuật tôn thờ con số vào thế kỷ VI TCN, đồng thời là nơi có đường hầm dẫn nước xuyên núi Eupalinos?',
        displayWord: 'SAMOS',
        acceptedAnswers: ['Samos', 'Dao Samos'],
        explanation: 'Nhà toán học vĩ đại cổ đại sinh khoảng năm 570 TCN trên đảo Samos của Hy Lạp.',
      },
      {
        id: 2,
        rowLabel: 'Hàng ngang số 2',
        charCount: 6,
        question:
          'Hàng ngang số 2 (6 chữ cái): Trong bộ sách kinh điển "Cơ sở" (Elements) gồm 13 cuốn của nhà toán học ..., mệnh đề thứ 47 của Cuốn I (Book I, Proposition 47) là phép chứng minh hình học chặt chẽ đầu tiên cho hệ thức tam giác vuông bằng phương pháp "cối xay gió"?',
        displayWord: 'EUCLID',
        acceptedAnswers: ['Euclid', 'Ơ clit', 'Oclit'],
        explanation: 'Mệnh đề I.47 và mệnh đề đảo I.48 trong bộ "Cơ sở" của Euclid là chứng minh kinh điển nhất của hệ thức này.',
      },
      {
        id: 3,
        rowLabel: 'Hàng ngang số 3',
        charCount: 6,
        question:
          'Hàng ngang số 3 (6 chữ cái): Khi áp dụng hệ thức này cho một hình vuông có cạnh bằng 1 đơn vị, độ dài đường chéo bằng √2. Việc phát hiện ra √2 không thể biểu diễn dưới dạng tỷ số hai số nguyên của Hippasus đã khai sinh ra khái niệm số gì trong toán học (Số ...)?',
        displayWord: 'VÔ TỈ',
        acceptedAnswers: ['Vo ti', 'So vo ti', 'Vo ty'],
        explanation: 'Sự phát hiện độ dài đường chéo hình vuông đơn vị là số vô tỉ (√2) bắt nguồn trực tiếp từ hệ thức này.',
      },
      {
        id: 4,
        rowLabel: 'Hàng ngang số 4',
        charCount: 9,
        question:
          'Hàng ngang số 4 (9 chữ cái): Tên gọi cổ của hệ thức toán học này trong sách toán cổ phương Đông "Chu Bễ Toán Kinh" (thời Chu – Hán), trong đó cạnh góc vuông ngắn gọi là "Câu" (bằng 3), cạnh góc vuông dài gọi là "Cổ" (bằng 4) và cạnh huyền gọi là "Huyền" (bằng 5)?',
        displayWord: 'CÂU CỔ HUYỀN',
        acceptedAnswers: ['Cau Co Huyen', 'Dinh ly Cau Co', 'Cau Co'],
        explanation: 'Trong toán học cổ phương Đông, hệ thức 3² + 4² = 5² được gọi là quy tắc "Câu – Cổ – Huyền".',
      },
    ],
    centerQuestion: {
      question:
        'Câu hỏi Ô Trung Tâm (9 chữ cái): Một bộ ba số nguyên dương (a, b, c) thỏa mãn phương trình Đi-ô-phăng a² + b² = c² (chẳng hạn (3, 4, 5), (5, 12, 13), (8, 15, 17)) được gọi là bộ ba số nguyên thủy của định lý này. Hỏi trong mọi bộ ba số như vậy luôn có ít nhất một số chia hết cho mấy (ngoài 2 và 3)?',
      displayWord: 'CHIA HẾT CHO 5',
      acceptedAnswers: ['Chia het cho 5', '5', 'So 5'],
      explanation: 'Do tính chất số chính phương theo modulo 5 (chỉ dư 0, 1 hoặc 4), trong mọi bộ ba nguyên (a, b, c) thỏa a² + b² = c² luôn có ít nhất một số chia hết cho 5.',
    },
    summaryExplanation:
      'Chướng ngại vật là ĐỊNH LÝ PYTHAGORAS / ĐỊNH LÝ PYTAGO (15 chữ cái) — Viên ngọc nền tảng của hình học và lý thuyết số.',
  },
  {
    id: 'vcnv-15',
    title: 'Vật lý Điện từ & Cách mạng Công nghiệp',
    keywordDisplay: 'DÒNG ĐIỆN XOAY CHIỀU',
    charCount: 16,
    acceptedKeywords: ['Dong dien xoay chieu', 'Dien xoay chieu', 'AC'],
    imageUrl: OBSTACLE_SVG_ILLUSTRATIONS['vcnv-15'],
    rows: [
      {
        id: 1,
        rowLabel: 'Hàng ngang số 1',
        charCount: 12,
        question:
          'Hàng ngang số 1 (12 chữ cái): Tên công ty công nghiệp điện lực của Mỹ (do kỹ sư George ... sáng lập) đã hợp tác với Nikola Tesla trong "Cuộc chiến dòng điện" cuối thế kỷ XIX để xây dựng nhà máy thủy điện đầu tiên trên thác Niagara năm 1895?',
        displayWord: 'WESTINGHOUSE',
        acceptedAnswers: ['Westinghouse', 'George Westinghouse'],
        explanation: 'George Westinghouse và Nikola Tesla đã chứng minh ưu thế vượt trội của việc truyền tải điện năng đi xa so với hệ thống một chiều của Edison.',
      },
      {
        id: 2,
        rowLabel: 'Hàng ngang số 2',
        charCount: 7,
        question:
          'Hàng ngang số 2 (7 chữ cái): Trong mạch điện RLC mắc nối tiếp, khi cảm kháng Z_L bằng dung kháng Z_C (ω²LC = 1), cường độ hiệu dụng trong mạch đạt giá trị cực đại và hệ số công suất cos(φ) = 1. Hiện tượng vật lý đó gọi là gì?',
        displayWord: 'CỘNG HƯỞNG',
        acceptedAnswers: ['Cong huong', 'Cong huong dien'],
        explanation: 'Hiện tượng cộng hưởng điện chỉ xảy ra trong các mạch có tần số biến thiên khi Z_L = Z_C.',
      },
      {
        id: 3,
        rowLabel: 'Hàng ngang số 3',
        charCount: 8,
        question:
          'Hàng ngang số 3 (8 chữ cái): Tên gọi các dòng điện cảm ứng khép kín sinh ra trong khối vật dẫn kim loại khi đặt trong từ trường biến thiên (đặt theo tên nhà vật lý người Pháp Léon ...), gây tỏa nhiệt làm nóng lõi thép của máy biến áp?',
        displayWord: 'FOUCAULT',
        acceptedAnswers: ['Foucault', 'Phu co', 'Dong Foucault'],
        explanation: 'Để giảm hao phí do dòng điện Foucault, lõi thép của máy biến áp phải được ghép từ các lá thép kỹ thuật điện mỏng sơn cách điện.',
      },
      {
        id: 4,
        rowLabel: 'Hàng ngang số 4',
        charCount: 7,
        question:
          'Hàng ngang số 4 (7 chữ cái): Giá trị của đại lượng điện (cường độ hoặc điện áp) được xác định bằng giá trị cực đại chia cho căn bậc hai của 2 (I = I₀/√2), tương đương với công suất tỏa nhiệt của dòng không đổi có cùng độ lớn, được gọi là giá trị gì?',
        displayWord: 'HIỆU DỤNG',
        acceptedAnswers: ['Hieu dung', 'Gia tri hieu dung'],
        explanation: 'Các số chỉ trên ampe kế, vôn kế và thông số 220V trên lưới điện dân dụng đều là giá trị hiệu dụng.',
      },
    ],
    centerQuestion: {
      question:
        'Câu hỏi Ô Trung Tâm (6 chữ cái): Hệ thống máy phát và truyền tải điện năng công nghiệp phổ biến nhất trên lưới điện quốc gia hiện nay sử dụng 3 cuộn dây đặt lệch nhau một góc 120° trên stato được gọi là hệ thống điện gì?',
      displayWord: 'BA PHA',
      acceptedAnswers: ['Ba pha', '3 pha', 'He thong 3 pha'],
      explanation: 'Hệ thống điện 3 pha giúp tiết kiệm dây dẫn và tạo ra từ trường quay vận hành các động cơ không đồng bộ.',
    },
    summaryExplanation:
      'Chướng ngại vật là DÒNG ĐIỆN XOAY CHIỀU (16 chữ cái) — Trụ cột của hệ thống lưới điện truyền tải và công nghiệp hiện đại.',
  },
  {
    id: 'vcnv-16',
    title: 'Mốc son Lịch sử & Pháp quyền Dân tộc',
    keywordDisplay: 'TUYÊN NGÔN ĐỘC LẬP',
    charCount: 15,
    acceptedKeywords: ['Tuyen ngon Doc lap', 'Ban Tuyen ngon Doc lap'],
    imageUrl: OBSTACLE_SVG_ILLUSTRATIONS['vcnv-16'],
    rows: [
      {
        id: 1,
        rowLabel: 'Hàng ngang số 1',
        charCount: 9,
        question:
          'Hàng ngang số 1 (9 chữ cái): Tên con phố cổ ở khu vực 36 phố phường Hà Nội (nơi có ngôi nhà số 48 của gia đình nhà tư sản yêu nước Trịnh Văn Bô – Hoàng Thị Minh Hồ), nơi Chủ tịch Hồ Chí Minh đã ở và làm việc cuối tháng 8 năm 1945?',
        displayWord: 'HÀNG NGANG',
        acceptedAnswers: ['Hang Ngang', '48 Hang Ngang', 'Pho Hang Ngang'],
        explanation: 'Tại căn phòng tầng 2 nhà số 48 Hàng Ngang, Chủ tịch Hồ Chí Minh đã khởi thảo văn kiện lịch sử trọng đại.',
      },
      {
        id: 2,
        rowLabel: 'Hàng ngang số 2',
        charCount: 9,
        question:
          'Hàng ngang số 2 (9 chữ cái): Họ của vị Tổng thống thứ ba của Hợp chúng quốc Hoa Kỳ (Thomas ...), người chắp bút văn kiện năm 1776 mà lời bất hủ mở đầu về quyền sống, quyền tự do và quyền mưu cầu hạnh phúc đã được trích dẫn sáng tạo bằng phép suy rộng "từ quyền con người sang quyền dân tộc"?',
        displayWord: 'JEFFERSON',
        acceptedAnswers: ['Jefferson', 'Thomas Jefferson'],
        explanation: 'Chủ tịch Hồ Chí Minh đã trích dẫn văn kiện năm 1776 của Thomas Jefferson và văn kiện năm 1789 của Cách mạng Pháp để khẳng định chân lý pháp lý quốc tế.',
      },
      {
        id: 3,
        rowLabel: 'Hàng ngang số 3',
        charCount: 9,
        question:
          'Hàng ngang số 3 (9 chữ cái): Vị kiến trúc sư tốt nghiệp Trường Mỹ thuật Đông Dương (Ngô Huy ...), người được giao nhiệm vụ thiết kế và dựng gấp lễ đài bằng gỗ bọc vải đỏ – trắng tại vườn hoa Ba Đình chỉ trong vòng hơn một ngày đêm trước lễ 02/09/1945?',
        displayWord: 'HUY QUỲNH',
        acceptedAnswers: ['Huy Quynh', 'Ngo Huy Quynh'],
        explanation: 'Kiến trúc sư Ngô Huy Quỳnh đã thiết kế Lễ đài Độc lập giản dị mà trang nghiêm tại vườn hoa Ba Đình.',
      },
      {
        id: 4,
        rowLabel: 'Hàng ngang số 4',
        charCount: 8,
        question:
          'Hàng ngang số 4 (8 chữ cái): Hội nghị quốc tế của các nước Đồng minh chiến thắng phát xít (tổ chức tại San Francisco và ... năm 1945), được nhắc đến trong phần kết luận của văn kiện để khẳng định dân tộc Việt Nam đã đứng về phe Đồng minh chống phát xít nên "nước Việt Nam phải được tự do và độc lập"?',
        displayWord: 'TEHERAN',
        acceptedAnswers: ['Teheran', 'Hoi nghi Teheran', 'San Francisco'],
        explanation: 'Văn kiện viện dẫn nguyên tắc quyền dân tộc bình đẳng tại Hội nghị Teheran và Hội nghị Cựu Kim Sơn (San Francisco).',
      },
    ],
    centerQuestion: {
      question:
        'Câu hỏi Ô Trung Tâm (10 chữ cái): Kết thúc văn kiện lịch sử chiều ngày 02/09/1945 trước hơn 50 vạn đồng bào là lời thề sắt đá: "Toàn thể dân tộc Việt Nam quyết đem tất cả tinh thần và lực lượng, tính mạng và của cải để giữ vững quyền ... ấy!"?',
      displayWord: 'TỰ DO ĐỘC LẬP',
      acceptedAnswers: ['Tu do doc lap', 'Doc lap tu do'],
      explanation: 'Lời tuyên bố cuối cùng khẳng định ý chí quyết tâm bảo vệ nền tự do, độc lập của toàn thể dân tộc Việt Nam.',
    },
    summaryExplanation:
      'Chướng ngại vật là TUYÊN NGÔN ĐỘC LẬP (15 chữ cái) — Áng thiên cổ hùng văn khai sinh nước Việt Nam Dân chủ Cộng hòa ngày 02/09/1945.',
  },
];

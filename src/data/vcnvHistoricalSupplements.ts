import type { BankQuestionRecord } from '../utils/csv/csvParser.ts';
import { OBSTACLE_PUZZLES } from './olympiaQuestions.ts';

export interface VcnvSupplementSpec {
  title: string;
  keyword: string;
  acceptedKeywords: string[];
  explanation: string;
  centerQuestion?: {
    question: string;
    answer: string;
    explanation: string;
  };
  missingRow?: {
    question: string;
    answer: string;
    explanation: string;
  };
}

/**
 * Bộ dữ liệu bổ sung đầy đủ Câu hỏi Ô Trung Tâm (Hàng 5), Hàng ngang còn thiếu và Từ khóa Chướng Ngại Vật (CNV)
 * cho các trận đấu Đường lên đỉnh Olympia lịch sử (Mùa 19 -> Mùa 26) trong ngân hàng câu hỏi.
 */
export const HISTORICAL_VCNV_SUPPLEMENTS: Record<string, VcnvSupplementSpec> = {
  // ==================== NHÓM 50 TRẬN CÓ 4 HOẶC 5 HÀNG NGANG ====================
  '26-M1Q4': {
    title: 'Pháp luật & Sáng tạo Tri thức',
    keyword: 'SỞ HỮU TRÍ TUỆ',
    acceptedKeywords: ['SỞ HỮU TRÍ TUỆ', 'So huu tri tue', 'Bản quyền tác giả', 'Quyền tác giả'],
    explanation: 'Từ khóa Chướng Ngại Vật là SỞ HỮU TRÍ TUỆ (12 chữ cái) — gắn với Công ước Bern (Thụy Sĩ) về bảo hộ tác phẩm văn học nghệ thuật, bảo vệ quyền lợi người sáng tạo và Tổ chức WIPO.',
    centerQuestion: {
      question: 'Tổ chức chuyên môn của Liên Hợp Quốc có trụ sở tại Geneva (Thụy Sĩ), viết tắt là WIPO, hoạt động nhằm thúc đẩy việc bảo hộ tài sản trí tuệ trên toàn thế giới?',
      answer: 'WIPO',
      explanation: 'WIPO (World Intellectual Property Organization) là Tổ chức Sở hữu Trí tuệ Thế giới.',
    },
  },
  '26-M3Q1': {
    title: 'Công nghệ & Thể thao Hiện đại',
    keyword: 'THỂ THAO ĐIỆN TỬ',
    acceptedKeywords: ['THỂ THAO ĐIỆN TỬ', 'The thao dien tu', 'Esports', 'E-Sports'],
    explanation: 'Từ khóa Chướng Ngại Vật là THỂ THAO ĐIỆN TỬ (13 chữ cái) — lĩnh vực kết hợp Phần mềm trò chơi (như nhân vật Mario) với thi đấu Thể thao chuyên nghiệp.',
    centerQuestion: {
      question: 'Thuật ngữ quốc tế viết tắt bằng tiếng Anh (bắt nguồn từ cụm từ Electronic Sports) dùng để chỉ hình thức thi đấu các trò chơi điện tử chuyên nghiệp có tính đối kháng giữa các tuyển thủ?',
      answer: 'ESPORTS',
      explanation: 'Esports (Thể thao điện tử) đã trở thành môn thi đấu tranh huy chương chính thức tại ASIAD và SEA Games.',
    },
  },
  '26-M3Q2': {
    title: 'Vật lý Quang học & Viễn thông',
    keyword: 'CÁP QUANG',
    acceptedKeywords: ['CÁP QUANG', 'Cap quang', 'Sợi quang học', 'Soi quang'],
    explanation: 'Từ khóa Chướng Ngại Vật là CÁP QUANG (8 chữ cái) — công nghệ truyền dẫn tín hiệu bằng Ánh sáng qua Sợi thủy tinh dựa trên hiện tượng Phản xạ toàn phần, tiêu biểu với tuyến cáp biển quốc tế AAG.',
    centerQuestion: {
      question: 'Hiện tượng vật lý xảy ra khi tia sáng truyền từ môi trường chiết quang hơn sang môi trường chiết quang kém với góc tới lớn hơn góc giới hạn, giúp giam giữ tia sáng truyền đi xa trong lõi sợi thủy tinh?',
      answer: 'PHẢN XẠ TOÀN PHẦN',
      explanation: 'Hiện tượng phản xạ toàn phần là nguyên lý vật lý cốt lõi của sợi cáp quang viễn thông.',
    },
  },
  '26-M3Q4': {
    title: 'Nhân khẩu học & Phát triển Kinh tế',
    keyword: 'DÂN SỐ VÀNG',
    acceptedKeywords: ['DÂN SỐ VÀNG', 'Dan so vang', 'Cơ cấu dân số vàng', 'Co cau dan so vang'],
    explanation: 'Từ khóa Chướng Ngại Vật là DÂN SỐ VÀNG (9 chữ cái) — thời kỳ Cơ cấu Dân số có lực lượng trong độ tuổi Lao động gấp đôi số người phụ thuộc mà Việt Nam bước vào từ năm 2007.',
  },
  '26-W1M3Q1': {
    title: 'Y học Dự phòng & Miễn dịch học',
    keyword: 'VẮC XIN',
    acceptedKeywords: ['VẮC XIN', 'Vac xin', 'Vaccine', 'Tiêm chủng'],
    explanation: 'Từ khóa Chướng Ngại Vật là VẮC XIN (6 chữ cái) — chế phẩm sinh học có tính kháng nguyên từ Vi sinh vật giúp cơ thể tạo miễn dịch chủ động để Phòng chống bệnh Truyền nhiễm và Dịch bệnh.',
  },
  '26-W2M3Q3': {
    title: 'Môi trường & Khí quyển Đô thị',
    keyword: 'CHẤT LƯỢNG KHÔNG KHÍ',
    acceptedKeywords: ['CHẤT LƯỢNG KHÔNG KHÍ', 'Chat luong khong khi', 'Chỉ số AQI', 'Ô nhiễm không khí'],
    explanation: 'Từ khóa Chướng Ngại Vật là CHẤT LƯỢNG KHÔNG KHÍ (16 chữ cái) — được đo bằng chỉ số AQI có thang Số từ 0 đến 500 chia theo các mức Màu cảnh báo nồng độ Bụi mịn.',
    centerQuestion: {
      question: 'Ký hiệu viết tắt bằng 3 chữ cái tiếng Anh của Chỉ số dùng để báo cáo mức độ sạch hay ô nhiễm của bầu không khí hàng ngày tại các đô thị trên thế giới?',
      answer: 'AQI',
      explanation: 'AQI (Air Quality Index) là Chỉ số chất lượng không khí chuẩn quốc tế.',
    },
  },
  '26-W3M1Q1': {
    title: 'Truyền thống Văn hóa & Giáo dục',
    keyword: 'TÔN SƯ TRỌNG ĐẠO',
    acceptedKeywords: ['TÔN SƯ TRỌNG ĐẠO', 'Ton su trong dao'],
    explanation: 'Từ khóa Chướng Ngại Vật là TÔN SƯ TRỌNG ĐẠO (13 chữ cái) — truyền thống quý báu của dân tộc Việt Nam thể hiện lòng Kính trọng người thầy, người Cô dạy chữ và rèn Đạo làm người.',
    missingRow: {
      question: 'Từ nào còn thiếu trong câu tục ngữ khuyên răn về vai trò của người dẫn dắt trong học tập: "Không ... đố mày làm nên"?',
      answer: 'THẦY',
      explanation: 'Câu tục ngữ "Không thầy đố mày làm nên" đề cao vai trò của người thầy trong giáo dục.',
    },
  },
  '26-W3M2Q2': {
    title: 'Danh nhân Lịch sử Cận đại Việt Nam',
    keyword: 'PHAN CHÂU TRINH',
    acceptedKeywords: ['PHAN CHÂU TRINH', 'Phan Chau Trinh', 'Phan Chu Trinh', 'Tây Hồ'],
    explanation: 'Từ khóa Chướng Ngại Vật là PHAN CHÂU TRINH (13 chữ cái) — nhà yêu nước, chí sĩ維tân sinh năm 1872 tại Quảng Nam – Đà Nẵng, từng bị đày ra Côn Đảo và mất năm 1926 tại Sài Gòn.',
    centerQuestion: {
      question: 'Phong trào cải cách văn hóa – xã hội đầu thế kỷ XX tại miền Trung với khẩu hiệu "Khai dân trí, chấn dân khí, hậu dân sinh" do Phan Châu Trinh, Trần Quý Cáp và Huỳnh Thúc Kháng khởi xướng có tên là gì?',
      answer: 'DUY TÂN',
      explanation: 'Phong trào Duy Tân (1906–1908) gắn liền với tư tưởng dân quyền và khai sáng của chí sĩ Phan Châu Trinh.',
    },
  },
  '26-W3M2Q4': {
    title: 'Sự kiện Thể thao Quốc tế',
    keyword: 'Á VẬN HỘI',
    acceptedKeywords: ['Á VẬN HỘI', 'A van hoi', 'ASIAD', 'Đại hội Thể thao châu Á'],
    explanation: 'Từ khóa Chướng Ngại Vật là Á VẬN HỘI / ASIAD (7 chữ cái) — đại hội Thể thao lớn nhất Châu Á tổ chức định kỳ 4 năm một lần, với kỳ đại hội lần thứ 20 diễn ra tại Nhật Bản năm 2026.',
  },
  '26-W3M3Q1': {
    title: 'Lịch pháp & Phong tục Cổ truyền',
    keyword: 'THÁNG CHẠP',
    acceptedKeywords: ['THÁNG CHẠP', 'Thang Chap', 'Tháng Mười Hai'],
    explanation: 'Từ khóa Chướng Ngại Vật là THÁNG CHẠP (9 chữ cái) — tháng Sửu (tháng 12 Âm lịch) gắn với lễ cúng ông Công ông Táo (Táo Quân ngày 23) và phiên Chợ Tết cuối năm.',
    centerQuestion: {
      question: 'Trong nông lịch cổ truyền của người Việt, tháng 11 Âm lịch được gọi là tháng Một, còn tháng giêng và tháng 12 Âm lịch được gọi trong câu ca dao: "Tháng Giêng là tháng ăn chơi / Tháng ... là tháng trồng khoai"?',
      answer: 'CHẠP',
      explanation: 'Tháng Chạp (tháng 12 Âm lịch) là tháng củ mật khép lại một năm cũ để chuẩn bị đón Tết Nguyên Đán.',
    },
  },
  '25-M1Q1': {
    title: 'Cách mạng Công nghệ & Trí tuệ Nhân tạo',
    keyword: 'CHATGPT',
    acceptedKeywords: ['CHATGPT', 'Chat GPT', 'OpenAI ChatGPT'],
    explanation: 'Từ khóa Chướng Ngại Vật là CHATGPT (7 chữ cái) — ứng dụng Chatbot dựa trên mô hình Ngôn ngữ lớn của trí tuệ nhân tạo (AI) ra mắt tháng 11/2022 với tốc độ phản hồi Nhanh.',
  },
  '25-M3Q2': {
    title: 'Âm nhạc & Lịch sử Thống nhất Đất nước',
    keyword: 'NỐI VÒNG TAY LỚN',
    acceptedKeywords: ['NỐI VÒNG TAY LỚN', 'Noi vong tay lon'],
    explanation: 'Từ khóa Chướng Ngại Vật là NỐI VÒNG TAY LỚN (13 chữ cái) — ca khúc bất hủ của nhạc sĩ Trịnh Công Sơn sáng tác năm 1968 và vang lên trên Đài Phát thanh Sài Gòn trưa ngày 30/04/1975.',
    missingRow: {
      question: 'Hai chữ mở đầu trong nhạc phẩm nổi tiếng của Trịnh Công Sơn: "... dang tay nối lại biển xa / Ta đi vòng tay lớn mãi để nối sơn hà"?',
      answer: 'RỪNG NÚI',
      explanation: 'Câu hát mở đầu "Rừng núi dang tay nối lại biển xa" khắc họa khát vọng hòa hợp, thống nhất non sông.',
    },
  },
  '25-W1M2Q1': {
    title: 'Hóa học Vô cơ & Khoa học Vật liệu',
    keyword: 'KIM LOẠI',
    acceptedKeywords: ['KIM LOẠI', 'Kim loai'],
    explanation: 'Từ khóa Chướng Ngại Vật là KIM LOẠI (7 chữ cái) — nhóm nguyên tố hóa học có tính Dẻo, dẫn điện, dẫn nhiệt tốt, bao gồm nhóm Kiềm, nhóm Vật liệu kim loại Đen (như Sắt, gang, thép) và kim loại màu.',
  },
  '25-W2M1Q4': {
    title: 'Văn học Trung đại Việt Nam',
    keyword: 'ĐOÀN THỊ ĐIỂM',
    acceptedKeywords: ['ĐOÀN THỊ ĐIỂM', 'Doan Thi Diem', 'Hồng Hà nữ sĩ'],
    explanation: 'Từ khóa Chướng Ngại Vật là ĐOÀN THỊ ĐIỂM (11 chữ cái) — nữ sĩ tài danh sinh năm 1705 tại Hưng Yên, nổi tiếng với bản dịch Thơ Nôm tác phẩm Chinh phụ ngâm.',
    missingRow: {
      question: 'Bút hiệu văn chương gồm 2 chữ (gắn với tên dòng sông Cái chảy qua Thăng Long và Hưng Yên) của nữ sĩ Đoàn Thị Điểm là "... nữ sĩ"?',
      answer: 'HỒNG HÀ',
      explanation: 'Đoàn Thị Điểm có hiệu là Hồng Hà nữ sĩ.',
    },
  },
  '25-W2M2Q3': {
    title: 'Danh nhân Văn hóa Thế giới',
    keyword: 'HỒ XUÂN HƯƠNG',
    acceptedKeywords: ['HỒ XUÂN HƯƠNG', 'Ho Xuan Huong', 'Bà Chúa Thơ Nôm'],
    explanation: 'Từ khóa Chướng Ngại Vật là HỒ XUÂN HƯƠNG (11 chữ cái) — "Bà Chúa Thơ Nôm" được UNESCO vinh danh năm 2021 với những vần Thơ bằng Chữ Nôm khẳng định khát vọng sống của Con người.',
    centerQuestion: {
      question: 'Danh hiệu tôn vinh gồm 4 chữ do nhà thơ Xuân Diệu đặt cho nữ sĩ Hồ Xuân Hương nhờ những thành tựu độc đáo bậc nhất trong thơ quốc âm thời trung đại?',
      answer: 'BÀ CHỦA THƠ NÔM',
      explanation: 'Hồ Xuân Hương được mệnh danh là "Bà Chúa Thơ Nôm" của nền văn học dân tộc.',
    },
  },
  '24-W1M3Q1': {
    title: 'Văn học Hiện thực Phê phán Việt Nam',
    keyword: 'NGÔ TẤT TỐ',
    acceptedKeywords: ['NGÔ TẤT TỐ', 'Ngo Tat To'],
    explanation: 'Từ khóa Chướng Ngại Vật là NGÔ TẤT TỐ (8 chữ cái) — Nhà văn tiêu biểu của trào lưu Hiện thực phê phán, sinh năm 1893 tại Đông Anh (Hà Nội), tác giả tiểu thuyết Tắt đèn.',
  },
  '24-W2M2Q4': {
    title: 'Thiết bị Quang điện tử & An ninh',
    keyword: 'CAMERA GIÁM SÁT',
    acceptedKeywords: ['CAMERA GIÁM SÁT', 'Camera giam sat', 'Camera an ninh', 'CCTV'],
    explanation: 'Từ khóa Chướng Ngại Vật là CAMERA GIÁM SÁT (13 chữ cái) — hệ thống Truyền hình mạch kín tích hợp cảm biến Hồng ngoại dùng để Theo dõi và đảm bảo An ninh.',
  },
  '24-W2M3Q1': {
    title: 'Lịch sử Kháng chiến Toàn quốc 1946',
    keyword: 'QUYẾT TỬ ĐỂ TỔ QUỐC QUYẾT SINH',
    acceptedKeywords: ['QUYẾT TỬ ĐỂ TỔ QUỐC QUYẾT SINH', 'Quyet tu de To quoc quyet sinh', 'Quyết tử cho Tổ quốc quyết sinh'],
    explanation: 'Từ khóa Chướng Ngại Vật là QUYẾT TỬ ĐỂ TỔ QUỐC QUYẾT SINH (24 chữ cái) — Tinh thần chiến đấu bất diệt của các chiến sĩ Trung đoàn Thủ đô tại Hà Nội mùa đông năm 1946.',
    missingRow: {
      question: 'Danh hiệu thiêng liêng của những chiến sĩ Vệ quốc đoàn mùa đông năm 1946 tại Hà Nội ôm bom ba càng lao vào xe tăng địch bảo vệ từng căn nhà, góc phố (Chiến sĩ ...)?',
      answer: 'CẢM TỬ',
      explanation: 'Hình ảnh những chiến sĩ cảm tử ôm bom ba càng đã trở thành biểu tượng bất khuất của Thủ đô Hà Nội 60 ngày đêm khói lửa.',
    },
  },
  '24-W2M3Q4': {
    title: 'Lịch sử Cách mạng & Âm nhạc Kháng chiến',
    keyword: 'NAM BỘ KHÁNG CHIẾN',
    acceptedKeywords: ['NAM BỘ KHÁNG CHIẾN', 'Nam Bo khang chien'],
    explanation: 'Từ khóa Chướng Ngại Vật là NAM BỘ KHÁNG CHIẾN (15 chữ cái) — sự kiện lịch sử ngày 23 tháng 9 năm 1945 khi quân và dân Nam Bộ anh dũng mở đầu cuộc kháng chiến chống thực dân Pháp quay lại xâm lược.',
    centerQuestion: {
      question: 'Họ tên vị nhạc sĩ (Tạ ...) đã sáng tác ca khúc hào hùng "Nam Bộ kháng chiến" ngay trong những ngày đầu khói lửa tháng 9 năm 1945 với câu mở đầu: "Mùa thu rồi, ngày hăm ba, ta đi theo tiếng kêu sơn hà nguy biến"?',
      answer: 'TẠ THANH SƠN',
      explanation: 'Nhạc sĩ Tạ Thanh Sơn sáng tác bài hát bất hủ "Nam Bộ kháng chiến" vào tháng 9/1945.',
    },
  },
  '24-W3M3Q2': {
    title: 'Thực vật học & Văn hóa Nông nghiệp',
    keyword: 'SẦU RIÊNG',
    acceptedKeywords: ['SẦU RIÊNG', 'Sau rieng', 'Quả sầu riêng', 'Cây sầu riêng'],
    explanation: 'Từ khóa Chướng Ngại Vật là SẦU RIÊNG (8 chữ cái) — loại trái cây đặc sản vùng Đông Nam Á có vỏ nhiều Gai nhọn, Mùi thơm nồng đặc trưng và gắn với Sự tích tình nghĩa thủy chung.',
    centerQuestion: {
      question: 'Nhà văn nào là tác giả bài tùy bút "Sầu riêng" trong sách giáo khoa Tiếng Việt với câu văn nổi tiếng: "Sầu riêng là loại trái quý của miền Nam. Hương vị của nó hết sức đặc biệt, mùi thơm đậm, bay rất xa"?',
      answer: 'MAI VĂN TẠO',
      explanation: 'Bài tùy bút "Sầu riêng" của nhà văn Mai Văn Tạo khắc họa tinh tế vẻ đẹp và hương vị loài cây trái phương Nam.',
    },
  },
  '23-M2Q3': {
    title: 'Vật lý Nhiệt học & Kỹ thuật Công trình',
    keyword: 'SỰ NỞ VÌ NHIỆT',
    acceptedKeywords: ['SỰ NỞ VÌ NHIỆT', 'Su no vi nhiet', 'Giãn nở vì nhiệt'],
    explanation: 'Từ khóa Chướng Ngại Vật là SỰ NỞ VÌ NHIỆT (11 chữ cái) — hiện tượng Thể tích vật chất thay đổi theo Nhiệt độ, đòi hỏi phải chừa khoảng hở ở chỗ nối Đường ray tàu hỏa và Khe co giãn trên cầu đường.',
    centerQuestion: {
      question: 'Băng kép (gồm hai thanh kim loại có bản chất khác nhau tán chặt vào nhau) khi bị đốt nóng sẽ cong về phía thanh kim loại có hệ số nở dài lớn hơn hay nhỏ hơn?',
      answer: 'NHỎ HƠN',
      explanation: 'Khi bị đốt nóng, băng kép luôn cong về phía thanh kim loại giãn nở vì nhiệt ít hơn (hệ số nở dài nhỏ hơn).',
    },
  },
  '23-W1M1Q1': {
    title: 'Khoa học & Giải thưởng Quốc tế',
    keyword: 'GIẢI NOBEL',
    acceptedKeywords: ['GIẢI NOBEL', 'Giai Nobel', 'Nobel', 'Giải thưởng Nobel'],
    explanation: 'Từ khóa Chướng Ngại Vật là GIẢI NOBEL (9 chữ cái) — giải thưởng quốc tế danh giá trao tại Thụy Điển và Na Uy cho 6 lĩnh vực nhằm tôn vinh những Cống hiến xuất sắc kèm tấm Huy chương vàng khắc hình Alfred Nobel.',
    centerQuestion: {
      question: 'Nhà hóa học, kỹ sư người Thụy Điển phát minh ra thuốc nổ an toàn Dynamite năm 1867, người đã hiến tặng 94% tài sản của mình để sáng lập quỹ giải thưởng quốc tế mang tên ông?',
      answer: 'ALFRED NOBEL',
      explanation: 'Lễ trao giải Nobel được tổ chức hằng năm vào ngày 10/12 (ngày mất của Alfred Nobel).',
    },
  },
  '23-W1M1Q2': {
    title: 'Quang học & Nghệ thuật Thị giác',
    keyword: 'MÁY ẢNH',
    acceptedKeywords: ['MÁY ẢNH', 'May anh', 'Nhiếp ảnh', 'Camera'],
    explanation: 'Từ khóa Chướng Ngại Vật là MÁY ẢNH (6 chữ cái) — thiết bị quang học có Ống kính hội tụ, đèn Chớp (flash) và buồng tối chứa Phim/cảm biến hoạt động tương tự cấu tạo của Mắt người để ghi lại hình Ảnh.',
  },
  '23-W1M3Q1': {
    title: 'Địa lý – Lịch sử – Văn học Việt Nam',
    keyword: 'TÂY BẮC',
    acceptedKeywords: ['TÂY BẮC', 'Tay Bac', 'Vùng Tây Bắc'],
    explanation: 'Từ khóa Chướng Ngại Vật là TÂY BẮC (6 chữ cái) — vùng núi hùng vĩ gắn với Chiến dịch năm 1952, các công trình Thủy điện lớn trên sông Đà, văn hóa dân tộc Thái và bài thơ Tiếng hát con tàu của Chế Lan Viên.',
    missingRow: {
      question: 'Phụ lưu lớn nhất của hệ thống sông Hồng chảy qua vùng núi Tây Bắc, nơi nhà văn Nguyễn Tuân viết thiên tùy bút "Người lái đò ..." và có các nhà máy thủy điện Hòa Bình, Sơn La, Lai Châu?',
      answer: 'SÔNG ĐÀ',
      explanation: 'Dòng sông Đà hùng vĩ và trữ tình là nguồn thủy năng lớn nhất miền Bắc Việt Nam.',
    },
  },
  '23-W3M2Q1': {
    title: 'Tấm gương Nghị lực & Giáo dục Việt Nam',
    keyword: 'NGUYỄN NGỌC KÝ',
    acceptedKeywords: ['NGUYỄN NGỌC KÝ', 'Nguyen Ngoc Ky', 'Thầy Nguyễn Ngọc Ký'],
    explanation: 'Từ khóa Chướng Ngại Vật là NGUYỄN NGỌC KÝ (12 chữ cái) — Nhà giáo Ưu tú Việt Nam đầu tiên viết chữ bằng chân (1947–2022), người Thầy mẫu mực và tác giả cuốn hồi ký nổi tiếng "Tôi đi học".',
    missingRow: {
      question: 'Huyện ven biển thuộc tỉnh Nam Định, quê hương của Nhà giáo Ưu tú Nguyễn Ngọc Ký — nơi cậu bé liệt cả hai tay từ năm lên 4 tuổi đã kiên trì tập viết chữ bằng đôi chân?',
      answer: 'HẢI HẬU',
      explanation: 'Nhà giáo Ưu tú Nguyễn Ngọc Ký sinh ra và lớn lên tại xã Hải Thanh, huyện Hải Hậu, tỉnh Nam Định.',
    },
  },
  '23-W3M2Q3': {
    title: 'Sinh thái học & Bảo tồn Thiên nhiên',
    keyword: 'VƯỜN QUỐC GIA',
    acceptedKeywords: ['VƯỜN QUỐC GIA', 'Vuon quoc gia'],
    explanation: 'Từ khóa Chướng Ngại Vật là VƯỜN QUỐC GIA (11 chữ cái) — hệ thống các khu bảo tồn thiên nhiên đặc dụng tại Việt Nam (gồm hơn 34 Vườn quốc gia như Ba Bể, Phú Quốc, Cúc Phương...).',
    centerQuestion: {
      question: 'Vườn quốc gia đầu tiên của Việt Nam được thành lập ngày 07/07/1962 nằm trên địa bàn 3 tỉnh Ninh Bình, Hòa Bình và Thanh Hóa có tên là gì?',
      answer: 'CÚC PHƯƠNG',
      explanation: 'Vườn quốc gia Cúc Phương là vườn quốc gia đầu tiên của nước ta.',
    },
  },
  '23-W3M3Q4': {
    title: 'Đạo lý Dân tộc & Văn hóa Dân gian',
    keyword: 'KÍNH LÃO ĐẮC THỌ',
    acceptedKeywords: ['KÍNH LÃO ĐẮC THỌ', 'Kinh lao dac tho'],
    explanation: 'Từ khóa Chướng Ngại Vật là KÍNH LÃO ĐẮC THỌ (13 chữ cái) — câu Tục ngữ, thành ngữ đúc kết truyền thống Kính trọng người Cao tuổi để được hưởng phúc Thọ bền lâu.',
    centerQuestion: {
      question: 'Theo thông lệ quốc tế do Đại hội đồng Liên Hợp Quốc thông qua năm 1990, ngày 01 tháng 10 hằng năm là Ngày Quốc tế Người cao tuổi. Còn tại Việt Nam, Ngày Truyền thống Người cao tuổi Việt Nam là ngày 06 tháng mấy?',
      answer: 'THÁNG 6',
      explanation: 'Ngày 06/06 hằng năm là Ngày Truyền thống Người cao tuổi Việt Nam (kỷ niệm ngày Bác Hồ viết thư kêu gọi thành lập Hội Phụ lão Cứu quốc 06/06/1941).',
    },
  },
  '22-Final': {
    title: 'Ứng phó Thiên tai & An toàn Cộng đồng',
    keyword: 'PHÒNG CHỐNG LŨ LỤT',
    acceptedKeywords: ['PHÒNG CHỐNG LŨ LỤT', 'Phong chong lu lut', 'Lũ lụt', 'Chống lũ'],
    explanation: 'Từ khóa Chướng Ngại Vật là PHÒNG CHỐNG LŨ LỤT (15 chữ cái) — thực hiện phương châm 4 tại chỗ, theo dõi các cấp Báo động mực Nước sông dâng và chủ động ngắt Cầu dao điện đảm bảo an toàn.',
    centerQuestion: {
      question: 'Phương châm cơ bản trong công tác phòng chống thiên tai và tìm kiếm cứu nạn tại Việt Nam gồm: chỉ huy tại chỗ, lực lượng tại chỗ, phương tiện vật tư tại chỗ và hậu cần tại chỗ được gọi ngắn gọn là phương châm gì?',
      answer: 'BỐN TẠI CHỖ',
      explanation: 'Phương châm "4 tại chỗ" giúp chủ động ứng phó kịp thời, giảm thiểu thiệt hại do bão lũ gây ra.',
    },
  },
  '22-QF3': {
    title: 'Mốc son Lịch sử Kháng chiến Chống Mỹ',
    keyword: 'THÀNH CỔ QUẢNG TRỊ',
    acceptedKeywords: ['THÀNH CỔ QUẢNG TRỊ', 'Thanh co Quang Tri'],
    explanation: 'Từ khóa Chướng Ngại Vật là THÀNH CỔ QUẢNG TRỊ (15 chữ cái) — khúc tráng ca bất tử suốt 81 Ngày đêm Mùa hạ đỏ rực lửa năm 1972 bên dòng sông Thạch Hãn (Quảng Trị).',
    missingRow: {
      question: 'Cuộc chiến đấu kiên cường bảo vệ thị xã và Thành cổ Quảng Trị mùa hè năm 1972 đã diễn ra liên tục trong suốt bao nhiêu ngày đêm?',
      answer: '81',
      explanation: '81 ngày đêm mùa hè đỏ lửa năm 1972 (từ 28/06 đến 16/09/1972) tại Thành cổ Quảng Trị đã đi vào lịch sử dân tộc.',
    },
  },
  '22-QF4': {
    title: 'Công nghệ Số & Mã hóa Thông tin',
    keyword: 'MÃ QR',
    acceptedKeywords: ['MÃ QR', 'Ma QR', 'QR Code', 'Mã vạch QR'],
    explanation: 'Từ khóa Chướng Ngại Vật là MÃ QR / QR CODE (4 chữ cái) — loại mã ma trận hai chiều có dạng Hình vuông gồm các điểm Trắng đen do công ty Denso Wave (Nhật Bản) phát minh để Quét thông tin nhanh.',
    centerQuestion: {
      question: 'Trong tên gọi tiếng Anh "QR Code" của loại mã vạch ma trận hai chiều do kỹ sư Masahiro Hara phát minh năm 1994, hai chữ cái viết tắt "QR" có nghĩa là "Quick ..." (Phản hồi nhanh)?',
      answer: 'RESPONSE',
      explanation: 'QR là viết tắt của Quick Response (Mã phản hồi nhanh).',
    },
  },
  '22-W1M1Q1': {
    title: 'An toàn Xã hội & Dịch vụ Công',
    keyword: 'SỐ ĐIỆN THOẠI KHẨN CẤP',
    acceptedKeywords: ['SỐ ĐIỆN THOẠI KHẨN CẤP', 'So dien thoai khan cap', 'Tổng đài khẩn cấp'],
    explanation: 'Từ khóa Chướng Ngại Vật là SỐ ĐIỆN THOẠI KHẨN CẤP (18 chữ cái) — hệ thống các đầu số Điện thoại quốc gia dùng trong tình huống Khẩn cấp như Cứu hỏa (114), Cấp cứu (115), Công an (113), Tìm kiếm cứu nạn (112).',
    missingRow: {
      question: 'Tại Việt Nam, đầu số điện thoại khẩn cấp gồm 3 chữ số dùng để gọi lực lượng Cảnh sát Phòng cháy chữa cháy và Cứu nạn cứu hộ là số nào?',
      answer: '114',
      explanation: 'Số 114 là tổng đài báo cháy và cứu nạn cứu hộ khẩn cấp trên toàn quốc.',
    },
  },
  '22-W1M1Q3': {
    title: 'Toán học Sơ cấp & Giáo dục',
    keyword: 'BẢNG CỬU CHƯƠNG',
    acceptedKeywords: ['BẢNG CỬU CHƯƠNG', 'Bang cuu chuong', 'Cửu chương'],
    explanation: 'Từ khóa Chướng Ngại Vật là BẢNG CỬU CHƯƠNG (13 chữ cái) — bảng ghi nhớ các phép Nhân từ 1 đến 9 giúp rèn kỹ năng Tính nhẩm cơ bản trong môn Toán.',
    centerQuestion: {
      question: 'Trong từ Hán Việt "Cửu chương", chữ "Cửu" có nghĩa là số 9, thể hiện hệ thống các phép nhân cơ bản lấy các số từ 1 đến mấy nhân với nhau?',
      answer: 'CHÍN',
      explanation: 'Bảng cửu chương truyền thống gồm các bảng nhân từ 1 đến 9.',
    },
  },
  '22-W2M1Q2': {
    title: 'Kinh tế Vĩ mô & Phát triển Quốc gia',
    keyword: 'TỔNG SẢN PHẨM QUỐC NỘI',
    acceptedKeywords: ['TỔNG SẢN PHẨM QUỐC NỘI', 'Tong san pham quoc noi', 'GDP', 'Tăng trưởng GDP'],
    explanation: 'Từ khóa Chướng Ngại Vật là TỔNG SẢN PHẨM QUỐC NỘI / GDP (18 chữ cái) — chỉ tiêu đo lường tổng giá trị Sản phẩm hàng hóa, dịch vụ của nền Kinh tế tính theo từng quý và từng Năm.',
    centerQuestion: {
      question: 'Thuật ngữ "Tổng sản phẩm quốc nội" (hay Tổng sản phẩm trong nước) được viết tắt bằng 3 chữ cái tiếng Anh phổ biến nào trên các báo cáo kinh tế thế giới?',
      answer: 'GDP',
      explanation: 'GDP (Gross Domestic Product) là thước đo quy mô và tốc độ tăng trưởng của nền kinh tế.',
    },
  },
  '22-W3M3Q3': {
    title: 'Nghệ thuật Dân gian Truyền thống Việt Nam',
    keyword: 'MÚA RỐI NƯỚC',
    acceptedKeywords: ['MÚA RỐI NƯỚC', 'Mua roi nuoc', 'Rối nước'],
    explanation: 'Từ khóa Chướng Ngại Vật là MÚA RỐI NƯỚC (10 chữ cái) — loại hình nghệ thuật dân gian đặc sắc ra đời từ nền văn minh Nông nghiệp lúa Nước thời nhà Lý với hình tượng nhân vật Chú Tễu.',
  },
  '21-W1M1Q1': {
    title: 'Nghi lễ Quốc gia & Lịch sử Quân sự',
    keyword: 'PHÁO LỄ',
    acceptedKeywords: ['PHÁO LỄ', 'Phao le', 'Bắn đại bác', 'Nghi lễ bắn đại bác'],
    explanation: 'Từ khóa Chướng Ngại Vật là PHÁO LỄ (6 chữ cái) — nghi thức bắn 21 loạt Đại bác trang trọng trong các dịp lễ lớn của đất nước và đón tiếp nguyên thủ quốc gia qua nhiều Thế kỷ.',
    centerQuestion: {
      question: 'Theo nghi thức ngoại giao quốc tế và nghi lễ nhà nước Việt Nam, số loạt đại bác cao nhất được bắn để chào mừng nguyên thủ quốc gia hoặc trong lễ Quốc khánh trọng đại là bao nhiêu loạt?',
      answer: '21',
      explanation: 'Nghi thức bắn 21 loạt đại bác là nghi lễ chào mừng cao nhất dành cho nguyên thủ quốc gia.',
    },
  },
  '21-W1M3Q4': {
    title: 'Danh tướng Lịch sử Việt Nam Thế kỷ XX',
    keyword: 'VÕ NGUYÊN GIÁP',
    acceptedKeywords: ['VÕ NGUYÊN GIÁP', 'Vo Nguyen Giap', 'Đại tướng Võ Nguyên Giáp'],
    explanation: 'Từ khóa Chướng Ngại Vật là VÕ NGUYÊN GIÁP (12 chữ cái) — vị Đại tướng Tổng Tư lệnh sinh năm 1911 (Bí danh Văn), người Anh Cả của Quân đội Nhân dân Việt Nam và học trò xuất sắc của Chủ tịch Hồ Chí Minh.',
  },
  '21-W2M1Q1': {
    title: 'Văn hóa Ẩm thực & Đời sống Người Việt',
    keyword: 'ĐÔI ĐŨA',
    acceptedKeywords: ['ĐÔI ĐŨA', 'Doi dua', 'Đũa tre'],
    explanation: 'Từ khóa Chướng Ngại Vật là ĐÔI ĐŨA (6 chữ cái) — vật dụng truyền thống làm bằng Tre đi thành từng Đôi, vận dụng nguyên lý Đòn bẩy để Gắp thức ăn và gắn với bài học đoàn kết trong Truyện ngụ ngôn Bó đũa.',
  },
  '21-W2M2Q4': {
    title: 'Địa lý Thế giới & Quan hệ Quốc tế',
    keyword: 'ĐẤT NƯỚC CUBA',
    acceptedKeywords: ['ĐẤT NƯỚC CUBA', 'Dat nuoc Cuba', 'Cuba', 'Cộng hòa Cuba'],
    explanation: 'Từ khóa Chướng Ngại Vật là ĐẤT NƯỚC CUBA (11 chữ cái) — Quần đảo vùng Caribe thuộc Châu Mỹ có hình dáng như con Cá sấu vươn dài, sử dụng tiếng Tây Ban Nha và là dân tộc Anh em thủy chung với Việt Nam.',
  },
  '20-M1Q1': {
    title: 'Môi trường Sống & Năng lượng Sinh hoạt',
    keyword: 'BẾP THAN TỔ ONG',
    acceptedKeywords: ['BẾP THAN TỔ ONG', 'Bep than to ong', 'Than tổ ong'],
    explanation: 'Từ khóa Chướng Ngại Vật là BẾP THAN TỔ ONG (12 chữ cái) — loại Bếp đun bằng viên Than có nhiều Lỗ tròn gây ô nhiễm khí CO và Bụi mịn, được thành phố Hà Nội vận động xóa bỏ từ năm 2020.',
  },
  '20-M3Q4': {
    title: 'Kinh tế Dịch vụ & Văn hóa Danh thắng',
    keyword: 'NGÀNH DU LỊCH',
    acceptedKeywords: ['NGÀNH DU LỊCH', 'Nganh du lich', 'Du lịch'],
    explanation: 'Từ khóa Chướng Ngại Vật là NGÀNH DU LỊCH (11 chữ cái) — ngành "công nghiệp không khói" gắn với việc thưởng ngoạn Phong cảnh, lưu trú Khách sạn, các Tour lữ hành và điểm đến di sản Ninh Bình.',
    missingRow: {
      question: 'Hoạt động tổ chức, điều hành các chương trình tham quan, di chuyển, lưu trú trọn gói cho du khách trong và ngoài nước được gọi là kinh doanh dịch vụ gì?',
      answer: 'LỮ HÀNH',
      explanation: 'Dịch vụ lữ hành và lưu trú khách sạn là hai trụ cột của ngành du lịch hiện đại.',
    },
  },
  '20-QF1': {
    title: 'Lịch sử Chống Ngoại xâm Thời Trần',
    keyword: 'SÁT THÁT',
    acceptedKeywords: ['SÁT THÁT', 'Sat That', 'Hào khí Đông A'],
    explanation: 'Từ khóa Chướng Ngại Vật là SÁT THÁT (7 chữ cái) — hai chữ khắc bằng Mực chàm lên Cánh tay của tướng sĩ nhà Trần năm 1285 thể hiện quyết tâm tiêu diệt giặc Nguyên – Mông Cổ.',
  },
  '20-W2M3Q4': {
    title: 'Di sản Văn hóa Kinh Bắc',
    keyword: 'DÂN CA QUAN HỌ',
    acceptedKeywords: ['DÂN CA QUAN HỌ', 'Dan ca Quan ho', 'Quan họ Bắc Ninh', 'Quan họ'],
    explanation: 'Từ khóa Chướng Ngại Vật là DÂN CA QUAN HỌ (11 chữ cái) — lối hát giao duyên đôi bờ Sông Cầu vùng Kinh Bắc được UNESCO công nhận là Di sản Văn hóa Phi vật thể Đại diện của Nhân loại.',
    centerQuestion: {
      question: 'Trong văn hóa Quan họ vùng Kinh Bắc, những người hát nam được gọi trang trọng là "Liền anh", còn những người hát nữ trong trang phục áo mớ ba mớ bảy, nón quai thao được gọi là gì?',
      answer: 'LIỀN CHỊ',
      explanation: 'Hình ảnh các liền anh, liền chị hát đối đáp trên thuyền rồng hội Lim là biểu tượng của Dân ca Quan họ Bắc Ninh.',
    },
  },
  '20-W3M2Q2': {
    title: 'Phong trào Cách mạng Miền Nam Việt Nam',
    keyword: 'ĐỒNG KHỞI',
    acceptedKeywords: ['ĐỒNG KHỞI', 'Dong Khoi', 'Phong trào Đồng Khởi'],
    explanation: 'Từ khóa Chướng Ngại Vật là ĐỒNG KHỞI (8 chữ cái) — cao trào nổi dậy lịch sử năm 1960 khắp Nông thôn miền Nam, bùng nổ đầu tiên tại Bến Tre gắn với tên tuổi nữ tướng Nguyễn Thị Định.',
    missingRow: {
      question: 'Tên gọi lừng lẫy của lực lượng đấu tranh chính trị kết hợp binh vận gồm hàng vạn phụ nữ miền Nam ra đời trong phong trào Đồng Khởi Bến Tre năm 1960 (Đội quân ...)?',
      answer: 'TÓC DÀI',
      explanation: '"Đội quân tóc dài" do bà Nguyễn Thị Định lãnh đạo là sáng tạo độc đáo của cách mạng miền Nam.',
    },
  },
  '20-W3M3Q1': {
    title: 'Căn cứ địa Cách mạng & Thơ ca Kháng chiến',
    keyword: 'VIỆT BẮC',
    acceptedKeywords: ['VIỆT BẮC', 'Viet Bac', 'Chiến khu Việt Bắc'],
    explanation: 'Từ khóa Chướng Ngại Vật là VIỆT BẮC (7 chữ cái) — căn cứ địa của Mặt trận Việt Minh gồm 6 tỉnh (Cao – Bắc – Lạng – Hà – Tuyên – Thái), "Thủ đô gió ngàn" và nguồn cảm hứng bài thơ Việt Bắc của Tố Hữu.',
    missingRow: {
      question: 'Xã thuộc huyện Sơn Dương, tỉnh Tuyên Quang được Bác Hồ chọn làm "Thủ đô Khu giải phóng" và là nơi họp Quốc dân Đại hội tháng 8 năm 1945?',
      answer: 'TÂN TRÀO',
      explanation: 'Tân Trào (Tuyên Quang) là trung tâm của Chiến khu Việt Bắc trong Cách mạng tháng Tám và kháng chiến chống Pháp.',
    },
  },
  '19-M1Q4': {
    title: 'Thơ ca Cách mạng Việt Nam',
    keyword: 'KHI CON TU HÚ',
    acceptedKeywords: ['KHI CON TU HÚ', 'Khi con tu hu'],
    explanation: 'Từ khóa Chướng Ngại Vật là KHI CON TU HÚ (10 chữ cái) — bài Thơ lục bát nổi tiếng của nhà thơ Tố Hữu sáng tác trong nhà lao Thừa Phủ vào Mùa hè tháng 7 năm 1939.',
    centerQuestion: {
      question: 'Tên nhà lao tại Huế (Nhà lao ...) nơi người chiến sĩ cộng sản trẻ tuổi Tố Hữu bị thực dân Pháp giam giữ từ tháng 4/1939 và nghe tiếng chim tu hú gọi bầy ngoài trời tự do?',
      answer: 'THỪA PHỦ',
      explanation: 'Bài thơ "Khi con tu hú" được Tố Hữu sáng tác tại nhà lao Thừa Phủ (Huế) tháng 7/1939.',
    },
  },
  '19-M2Q1': {
    title: 'Địa lý Tổ quốc & Di sản Sinh thái',
    keyword: 'MŨI CÀ MAU',
    acceptedKeywords: ['MŨI CÀ MAU', 'Mui Ca Mau', 'Đất Mũi Cà Mau'],
    explanation: 'Từ khóa Chướng Ngại Vật là MŨI CÀ MAU (8 chữ cái) — vùng đất cực Nam thuộc tỉnh Cà Mau tiếp giáp Vịnh Thái Lan và Biển Đông, có Vườn Quốc gia Mũi Cà Mau và được Xuân Diệu ca ngợi trong thơ văn.',
    centerQuestion: {
      question: 'Loài cây ngập mặn có bộ rễ chống chằng chịt bám sâu vào bùn lỏng để giữ đất, lấn biển, cùng với cây mắm tạo nên hệ sinh thái rừng ngập mặn đặc trưng của vùng Đất Mũi Cà Mau?',
      answer: 'CÂY ĐƯỚC',
      explanation: 'Rừng đước và rừng mắm bạt ngàn là biểu tượng sinh thái kiên cường của Mũi Cà Mau.',
    },
  },
  '19-M2Q2': {
    title: 'Di tích Quốc gia Đặc biệt',
    keyword: 'TÂN TRÀO',
    acceptedKeywords: ['TÂN TRÀO', 'Tan Trao', 'Khu di tích Tân Trào'],
    explanation: 'Từ khóa Chướng Ngại Vật là TÂN TRÀO (7 chữ cái) — Khu Di tích Quốc gia đặc biệt tại tỉnh Tuyên Quang gắn với hình ảnh Cây đa Tân Trào, mái đình Hồng Thái và Cách mạng tháng Tám năm 1945.',
    centerQuestion: {
      question: 'Tên căn lán nhỏ đơn sơ dưới tán rừng cây xanh tại xã Tân Trào (huyện Sơn Dương, tỉnh Tuyên Quang), nơi Chủ tịch Hồ Chí Minh đã ở và làm việc từ cuối tháng 5 đến tháng 8 năm 1945 (Lán ...)?',
      answer: 'NÀ NƯA',
      explanation: 'Tại lán Nà Nưa (Khu di tích Tân Trào), Bác Hồ đã chỉ đạo toàn quốc Tổng khởi nghĩa tháng Tám năm 1945.',
    },
  },
  '19-W1M1Q4': {
    title: 'Truyền thông & Nghề nghiệp Xã hội',
    keyword: 'NHÀ BÁO',
    acceptedKeywords: ['NHÀ BÁO', 'Nha bao', 'Phóng viên', 'Nghề báo'],
    explanation: 'Từ khóa Chướng Ngại Vật là NHÀ BÁO (6 chữ cái) — những người được cấp Thẻ hoạt động trong lĩnh vực Báo chí, dấn thân vào cả những nơi Nguy hiểm để truyền tải Thông tin trung thực tới công chúng.',
    missingRow: {
      question: 'Tờ báo tiếng Việt do lãnh tụ Nguyễn Ái Quốc sáng lập tại Quảng Châu (Trung Quốc), ra số đầu tiên ngày 21/06/1925 mở đầu cho lịch sử Báo chí Cách mạng Việt Nam có tên là gì?',
      answer: 'THANH NIÊN',
      explanation: 'Sự kiện báo Thanh Niên ra số đầu tiên ngày 21/06/1925 là mốc son khai sinh Ngày Báo chí Cách mạng Việt Nam.',
    },
  },
  '19-W2M3Q4': {
    title: 'Phong trào Giáo dục Lịch sử 1945',
    keyword: 'BÌNH DÂN HỌC VỤ',
    acceptedKeywords: ['BÌNH DÂN HỌC VỤ', 'Binh dan hoc vu'],
    explanation: 'Từ khóa Chướng Ngại Vật là BÌNH DÂN HỌC VỤ (12 chữ cái) — Nha chuyên trách do Chính phủ thành lập tháng 9 năm 1945 nhằm xóa nạn mù Chữ, tiêu diệt "Giặc dốt" trên toàn quốc.',
  },
  '19-W3M2Q2': {
    title: 'Lịch sử Khoa học & Cách mạng Công nghiệp',
    keyword: 'ĐỘNG CƠ HƠI NƯỚC',
    acceptedKeywords: ['ĐỘNG CƠ HƠI NƯỚC', 'Dong co hoi nuoc', 'Máy hơi nước'],
    explanation: 'Từ khóa Chướng Ngại Vật là ĐỘNG CƠ HƠI NƯỚC (12 chữ cái) — phát minh vĩ đại tại "xứ sở Sương mù" (nước Anh) biến nhiệt năng của nước Sôi ở thể Khí thành cơ năng, mở đầu Cách mạng Công nghiệp.',
    centerQuestion: {
      question: 'Kỹ sư, nhà phát minh người Scotland (James ...) đã cải tiến thành công cỗ máy hơi nước có bình ngưng riêng biệt vào năm 1769, và tên của ông được đặt cho đơn vị đo công suất trong hệ SI?',
      answer: 'JAMES WATT',
      explanation: 'Động cơ hơi nước của James Watt là biểu tượng của cuộc Cách mạng Công nghiệp lần thứ nhất.',
    },
  },

  // ==================== NHÓM 52 TRẬN CÓ 3 HÀNG NGANG ====================
  '26-M1Q1': {
    title: 'Văn học Việt Nam Hiện đại',
    keyword: 'NHỮNG CÁNH BUỒM',
    acceptedKeywords: ['NHỮNG CÁNH BUỒM', 'Nhung canh buom', 'Hoàng Trung Thông'],
    explanation: 'Từ khóa Chướng Ngại Vật là NHỮNG CÁNH BUỒM (13 chữ cái) — bài thơ nổi tiếng của Hoàng Trung Thông khắc họa tình Cha con và ước mơ vươn khơi khám phá.',
    missingRow: {
      question: 'Phương tiện truyền thống nhờ sức gió đẩy trên mặt biển, thường là biểu tượng của khát vọng vươn ra khơi xa trong thơ ca?',
      answer: 'THUYỀN BUỒM',
      explanation: 'Hình ảnh cánh buồm kiêu hãnh ngoài biển khơi biểu trưng cho ước mơ tiếp nối giữa các thế hệ.',
    },
    centerQuestion: {
      question: 'Nhà thơ nào (sinh năm 1925 tại Nghệ An) là tác giả của "Bài ca vỡ đất" và tập thơ "Những cánh buồm" (1964)?',
      answer: 'HOÀNG TRUNG THÔNG',
      explanation: 'Nhà thơ Hoàng Trung Thông là gương mặt tiêu biểu của nền thơ ca kháng chiến và xây dựng đất nước.',
    },
  },
  '26-M2Q1': {
    title: 'Di sản Văn hóa Dân gian',
    keyword: 'TRÒ CHƠI KÉO CO',
    acceptedKeywords: ['TRÒ CHƠI KÉO CO', 'Tro choi keo co', 'Kéo co', 'Keo co'],
    explanation: 'Từ khóa Chướng Ngại Vật là TRÒ CHƠI KÉO CO (12 chữ cái) — nghi lễ và trò chơi dân gian dùng sợi Dây thừng/dây song được UNESCO ghi danh là Di sản Văn hóa Phi vật thể đa quốc gia năm 2015.',
    missingRow: {
      question: 'Tinh thần hợp lực cùng chung sức của một tập thể để giành chiến thắng trong các trò chơi dân gian đồng đội được gọi là tinh thần gì?',
      answer: 'ĐOÀN KẾT',
      explanation: 'Nghi lễ và trò chơi Kéo co biểu trưng cho sức mạnh đoàn kết cộng đồng cư dân nông nghiệp trồng lúa.',
    },
    centerQuestion: {
      question: 'Cùng với Việt Nam, Hàn Quốc và Philippines, quốc gia Đông Nam Á nào là đồng chủ thể trong hồ sơ đa quốc gia "Nghi lễ và trò chơi Kéo co" được UNESCO vinh danh năm 2015?',
      answer: 'CAMPUCHIA',
      explanation: 'Hồ sơ đa quốc gia Nghi lễ và trò chơi Kéo co gồm 4 nước: Việt Nam, Campuchia, Hàn Quốc và Philippines.',
    },
  },
  '26-QF3': {
    title: 'Lịch sử Phong trào Thanh niên Việt Nam',
    keyword: 'THANH NIÊN XUNG PHONG',
    acceptedKeywords: ['THANH NIÊN XUNG PHONG', 'Thanh nien xung phong', 'TNXP'],
    explanation: 'Từ khóa Chướng Ngại Vật là THANH NIÊN XUNG PHONG (17 chữ cái) — Lực lượng tuổi trẻ giàu nhiệt huyết Cống hiến được Bác Hồ chỉ thị thành lập ngày 15/07/1950.',
    missingRow: {
      question: 'Ngã ba lịch sử tại huyện Can Lộc, tỉnh Hà Tĩnh — nơi hy sinh anh dũng của 10 nữ chiến sĩ trẻ ngày 24/07/1968 nhằm giữ vững mạch máu giao thông vào miền Nam?',
      answer: 'ĐỒNG LỘC',
      explanation: 'Ngã ba Đồng Lộc là tượng đài bất tử của lực lượng Thanh niên xung phong Việt Nam.',
    },
    centerQuestion: {
      question: 'Bốn câu thơ nổi tiếng của Chủ tịch Hồ Chí Minh: "Không có việc gì khó / Chỉ sợ lòng không bền / Đào núi và lấp biển / Quyết chí ắt làm nên" được Người tặng cho lực lượng nào vào tháng 9 năm 1950?',
      answer: 'LIÊN PHÂN ĐỘI 312',
      explanation: 'Bác Hồ đọc 4 câu thơ tặng Liên phân đội Thanh niên xung phong 312 đang làm nhiệm vụ tại cầu Nà Cù (Bắc Kạn).',
    },
  },
  '26-W1M2Q1': {
    title: 'Thiên văn học & Vật lý Thiên thể',
    keyword: 'LỖ ĐEN VŨ TRỤ',
    acceptedKeywords: ['LỖ ĐEN VŨ TRỤ', 'Lo den vu tru', 'Hố đen', 'Lỗ đen', 'Hố đen vũ trụ'],
    explanation: 'Từ khóa Chướng Ngại Vật là LỖ ĐEN VŨ TRỤ (10 chữ cái) — vùng không-thời gian trong Vũ trụ có trường hấp dẫn Vật lý cực mạnh khiến ngay cả ánh sáng cũng không thể thoát ra, tạo nên vùng Tối tuyệt đối.',
    missingRow: {
      question: 'Ranh giới xung quanh một hố đen mà một khi vật chất hay ánh sáng vượt qua đó thì không thể quay trở lại được gọi là "Chân trời ..."?',
      answer: 'SỰ KIỆN',
      explanation: 'Chân trời sự kiện (Event Horizon) là ranh giới không thể quay đầu của lỗ đen vũ trụ.',
    },
    centerQuestion: {
      question: 'Nhà vật lý lý thuyết người Anh (Stephen ...) đã chứng minh rằng các lỗ đen vẫn phát ra bức xạ nhiệt lượng tử mang tên ông?',
      answer: 'HAWKING',
      explanation: 'Bức xạ Hawking là đóng góp lý thuyết kiệt xuất của Stephen Hawking về lỗ đen vũ trụ.',
    },
  },
  '26-W1M2Q2': {
    title: 'Di sản Khảo cổ & Văn hóa Việt Cổ',
    keyword: 'TRỐNG ĐỒNG ĐÔNG SƠN',
    acceptedKeywords: ['TRỐNG ĐỒNG ĐÔNG SƠN', 'Trong dong Dong Son', 'Trống đồng'],
    explanation: 'Từ khóa Chướng Ngại Vật là TRỐNG ĐỒNG ĐÔNG SƠN (16 chữ cái) — nhạc khí linh thiêng đúc bằng hợp kim Đồng của người Việt cổ với hình tượng ngôi sao Mặt Trời ở chính giữa mặt trống.',
    missingRow: {
      question: 'Hình tượng loài chim nước huyền thoại sải cánh bay ngược chiều kim đồng hồ trên mặt trống đồng thời đại Hùng Vương là chim gì?',
      answer: 'CHIM LẠC',
      explanation: 'Hình tượng chim Lạc trên mặt trống đồng là vật tổ biểu trưng cho cư dân Lạc Việt.',
    },
    centerQuestion: {
      question: 'Chiếc trống đồng Đông Sơn cổ và nguyên vẹn bậc nhất Việt Nam (được phát hiện năm 1893 tại tỉnh Hà Nam, hiện lưu giữ tại Bảo tàng Lịch sử Quốc gia) có tên là trống đồng gì?',
      answer: 'NGỌC LŨ',
      explanation: 'Trống đồng Ngọc Lũ là đỉnh cao hoàn mỹ nhất của nghệ thuật đúc đồng Đông Sơn.',
    },
  },
  '26-W1M2Q4': {
    title: 'Truyền thông & Lịch sử Cách mạng',
    keyword: 'ĐÀI TIẾNG NÓI VIỆT NAM',
    acceptedKeywords: ['ĐÀI TIẾNG NÓI VIỆT NAM', 'Dai Tieng noi Viet Nam', 'VOV'],
    explanation: 'Từ khóa Chướng Ngại Vật là ĐÀI TIẾNG NÓI VIỆT NAM (18 chữ cái) — cơ quan phát thanh quốc gia phát Sóng chương trình đầu tiên ngày 07/09/1945 với Tiếng xưng danh lịch sử và giai điệu Nhạc hiệu "Diệt phát xít".',
    missingRow: {
      question: 'Ca khúc cách mạng của nhà văn, nhạc sĩ Nguyễn Đình Thi được chọn làm nhạc hiệu chính thức của Đài Tiếng nói Việt Nam từ ngày 07/09/1945 đến nay có tên là gì?',
      answer: 'DIỆT PHÁT XÍT',
      explanation: 'Giai điệu "Diệt phát xít" cùng lời xưng danh "Đây là Tiếng nói Việt Nam, phát thanh từ Hà Nội..." đã đi vào lịch sử dân tộc.',
    },
    centerQuestion: {
      question: 'Tên viết tắt tiếng Anh gồm 3 chữ cái của Đài Tiếng nói Việt Nam (Voice of Vietnam) trên trường quốc tế là gì?',
      answer: 'VOV',
      explanation: 'VOV (Voice of Vietnam) là tên giao dịch quốc tế của Đài Tiếng nói Việt Nam.',
    },
  },
  '26-W3M2Q3': {
    title: 'Kiến trúc Hàng hải & Lịch sử Biển đảo',
    keyword: 'NGỌN HẢI ĐĂNG',
    acceptedKeywords: ['NGỌN HẢI ĐĂNG', 'Ngon hai dang', 'Hải đăng', 'Đèn biển'],
    explanation: 'Từ khóa Chướng Ngại Vật là NGỌN HẢI ĐĂNG (11 chữ cái) — công trình tháp đèn biển sử dụng hệ thống thấu kính Thủy tinh Fresnel chiếu sáng dẫn đường cho tàu thuyền.',
    missingRow: {
      question: 'Ngọn hải đăng cổ nhất Việt Nam nằm tại mũi đất thuộc tỉnh Bình Thuận (được kiến trúc sư người Pháp Chnavat thiết kế xây dựng hoàn thành năm 1899) có tên là Hải đăng Mũi ...?',
      answer: 'KÊ GÀ',
      explanation: 'Hải đăng Kê Gà (Bình Thuận) là ngọn hải đăng bằng đá hoa cương cổ nhất và cao nhất Việt Nam.',
    },
    centerQuestion: {
      question: 'Nhà vật lý người Pháp (Augustin-Jean ...) đã phát minh ra loại thấu kính nhiều bậc đồng tâm giúp tập trung chùm tia sáng của ngọn hải đăng chiếu xa hàng chục hải lý trên biển?',
      answer: 'FRESNEL',
      explanation: 'Thấu kính Fresnel là bước ngoặt lịch sử trong kỹ thuật chiếu sáng hải đăng hàng hải.',
    },
  },
  '26-W3M3Q4': {
    title: 'Khoa học Vũ trụ & Hợp tác Quốc tế',
    keyword: 'TRẠM VŨ TRỤ QUỐC TẾ',
    acceptedKeywords: ['TRẠM VŨ TRỤ QUỐC TẾ', 'Tram vu tru quoc te', 'ISS', 'Trạm ISS'],
    explanation: 'Từ khóa Chướng Ngại Vật là TRẠM VŨ TRỤ QUỐC TẾ / ISS (16 chữ cái) — tổ hợp nghiên cứu Thí nghiệm trên quỹ đạo thấp của Vũ trụ được cấp nguồn bởi hệ thống cánh Pin mặt trời khổng lồ.',
    missingRow: {
      question: 'Trạng thái vật lý đặc trưng bên trong Trạm Vũ trụ Quốc tế khi chuyển động rơi tự do liên tục trên quỹ đạo quanh Trái Đất ở độ cao khoảng 400 km khiến các phi hành gia lơ lửng gọi là trạng thái gì?',
      answer: 'VI TRỌNG LỰC',
      explanation: 'Môi trường vi trọng lực (không trọng lượng biểu kiến) cho phép thực hiện các thí nghiệm sinh học và vật liệu đặc biệt.',
    },
    centerQuestion: {
      question: 'Tên viết tắt quốc tế gồm 3 chữ cái tiếng Anh của Trạm Vũ trụ Quốc tế (International Space Station) là gì?',
      answer: 'ISS',
      explanation: 'ISS là dự án hợp tác không gian đa quốc gia lớn nhất lịch sử nhân loại.',
    },
  },
  '25-M1Q3': {
    title: 'Công nghệ Mạng & Truyền thông Không dây',
    keyword: 'MẠNG KHÔNG DÂY WIFI',
    acceptedKeywords: ['MẠNG KHÔNG DÂY WIFI', 'Mang khong day Wifi', 'WIFI', 'Wi-Fi'],
    explanation: 'Từ khóa Chướng Ngại Vật là MẠNG KHÔNG DÂY WIFI / WIFI (15 chữ cái) — công nghệ kết nối Internet qua sóng vô tuyến ở băng tần 2.4 GHz và 5 GHz được bảo vệ bằng Mật khẩu.',
    missingRow: {
      question: 'Thiết bị phần cứng mạng có nhiệm vụ định tuyến các gói dữ liệu và phát sóng không dây cho các thiết bị cá nhân trong gia đình, văn phòng được gọi là bộ định tuyến hay gì?',
      answer: 'ROUTER',
      explanation: 'Router Wi-Fi là thiết bị thu phát sóng kết nối mạng cục bộ không dây ra Internet.',
    },
    centerQuestion: {
      question: 'Chuẩn công nghệ mạng cục bộ không dây dựa trên bộ tiêu chuẩn kỹ thuật IEEE 802.11 được Liên minh Wi-Fi đặt tên thương mại phổ biến gồm 4 chữ cái nào?',
      answer: 'WIFI',
      explanation: 'Wi-Fi (IEEE 802.11) là công nghệ kết nối không dây phổ biến nhất thế giới hiện nay.',
    },
  },
  '25-M1Q4': {
    title: 'Tài nguyên Năng lượng & Kinh tế Biển',
    keyword: 'KHAI THÁC DẦU KHÍ',
    acceptedKeywords: ['KHAI THÁC DẦU KHÍ', 'Khai thac dau khi', 'Dầu khí', 'Dầu mỏ'],
    explanation: 'Từ khóa Chướng Ngại Vật là KHAI THÁC DẦU KHÍ (14 chữ cái) — ngành công nghiệp mũi nhọn với các mũi Khoan sâu hàng nghìn mét tại bồn trầm tích Cửu Long trên thềm lục địa Việt Nam.',
    missingRow: {
      question: 'Tên mỏ dầu khí lớn nhất Việt Nam nằm tại bồn trũng Cửu Long (cách Vũng Tàu khoảng 120 km), nơi khai thác tấn dầu thô thương mại đầu tiên từ tầng đá móng nứt nẻ năm 1986?',
      answer: 'BẠCH HỔ',
      explanation: 'Mỏ Bạch Hổ là biểu tượng tự hào của ngành Dầu khí Việt Nam.',
    },
    centerQuestion: {
      question: 'Loại nhiên liệu hóa thạch lỏng sánh đặc màu nâu đen nằm sâu trong vỏ Trái Đất được mệnh danh là "Vàng đen" của nền công nghiệp hiện đại là gì?',
      answer: 'DẦU MỎ',
      explanation: 'Dầu mỏ và khí tự nhiên là nguồn năng lượng và nguyên liệu hóa dầu chiến lược.',
    },
  },
  '25-W1M3Q2': {
    title: 'Địa lý Biển đảo Việt Nam',
    keyword: 'VỊNH THÁI LAN',
    acceptedKeywords: ['VỊNH THÁI LAN', 'Vinh Thai Lan'],
    explanation: 'Từ khóa Chướng Ngại Vật là VỊNH THÁI LAN (11 chữ cái) — vùng vịnh biển nằm ở phía Tây Nam Tổ quốc, nơi có đảo ngọc Phú Quốc và tiếp giáp vùng biển của 4 quốc gia (Việt Nam, Campuchia, Thái Lan, Malaysia).',
    missingRow: {
      question: 'Quần đảo thuộc tỉnh Kiên Giang nằm ở vùng biển Tây Nam trong Vịnh Thái Lan, gồm hơn 21 hòn đảo lớn nhỏ được mệnh danh là "Hạ Long phương Nam" (Quần đảo Bà ...)?',
      answer: 'BÀ LỤA',
      explanation: 'Quần đảo Bà Lụa và quần đảo Nam Du, Hải Tặc đều nằm trong vùng biển Vịnh Thái Lan thuộc tỉnh Kiên Giang.',
    },
    centerQuestion: {
      question: 'Trong các thư tịch cổ Việt Nam và bản đồ lịch sử khu vực Đông Nam Á, Vịnh Thái Lan còn được gọi bằng tên lịch sử là Vịnh ... Lạp?',
      answer: 'CHÂN LẠP',
      explanation: 'Vịnh Thái Lan xưa còn có tên gọi là Vịnh Xiêm La hoặc Vịnh Chân Lạp.',
    },
  },
  '25-W2M1Q3': {
    title: 'Danh nhân Văn học Cổ điển Việt Nam',
    keyword: 'NGUYỄN KHUYẾN',
    acceptedKeywords: ['NGUYỄN KHUYẾN', 'Nguyen Khuyen', 'Tam nguyên Yên Đổ'],
    explanation: 'Từ khóa Chướng Ngại Vật là NGUYỄN KHUYẾN (12 chữ cái) — "Tam nguyên Yên Đổ" thời nhà Nguyễn, nhà Thơ kiệt xuất với chùm 3 bài thơ Mùa Thu bất hủ (Thu điếu, Thu vịnh, Thu ẩm).',
    missingRow: {
      question: 'Bài thơ chữ Nôm nổi tiếng nhất trong chùm thơ thu của Nguyễn Khuyến có câu mở đầu: "Ao thu lạnh lẽo nước trong veo / Một chiếc thuyền câu bé tẻo teo"?',
      answer: 'THU ĐIẾU',
      explanation: 'Bài thơ "Thu điếu" (Câu cá mùa thu) được Xuân Diệu ca ngợi là điển hình hơn cả cho mùa thu của làng cảnh Việt Nam.',
    },
    centerQuestion: {
      question: 'Do đỗ đầu cả ba kỳ thi Hương (Giải nguyên), thi Hội (Hội nguyên) và thi Đình (Đình nguyên), cụ Nguyễn Khuyến ở làng Vị Hạ, xã Yên Đổ (Bình Lục, Hà Nam) được nhân dân tôn vinh bằng danh hiệu gì?',
      answer: 'TAM NGUYÊN YÊN ĐỔ',
      explanation: 'Danh hiệu "Tam nguyên Yên Đổ" gắn liền với tài năng khoa bảng và nhân cách thanh cao của Nguyễn Khuyến.',
    },
  },
  '24-M1Q1': {
    title: 'Nghệ thuật Thứ Bảy & Lịch sử Văn hóa',
    keyword: 'NGHỆ THUẬT ĐIỆN ẢNH',
    acceptedKeywords: ['NGHỆ THUẬT ĐIỆN ẢNH', 'Nghe thuat dien anh', 'Điện ảnh', 'Phim ảnh'],
    explanation: 'Từ khóa Chướng Ngại Vật là NGHỆ THUẬT ĐIỆN ẢNH (16 chữ cái) — môn nghệ thuật thứ 7 ra đời tại Pháp với chiếc máy Quay và chiếu phim Cinématographe của anh em nhà Lumière.',
    missingRow: {
      question: 'Họ của hai anh em nhà phát minh người Pháp (Auguste và Louis ...) đã tổ chức buổi chiếu phim có bán vé đầu tiên trên thế giới tại Paris ngày 28/12/1895?',
      answer: 'LUMIÈRE',
      explanation: 'Hai anh em nhà Lumière được tôn vinh là những người khai sinh ra nghệ thuật điện ảnh thế giới.',
    },
    centerQuestion: {
      question: 'Liên hoan phim quốc tế danh giá bậc nhất thế giới được tổ chức thường niên vào tháng 5 tại thành phố biển miền Nam nước Pháp (với giải thưởng cao nhất là Cành Cọ Vàng) có tên là gì?',
      answer: 'CANNES',
      explanation: 'Liên hoan phim Cannes tại Pháp là biểu tượng uy tín của điện ảnh thế giới.',
    },
  },
  '24-M2Q3': {
    title: 'Danh y & Danh nhân Văn hóa Thế giới',
    keyword: 'HẢI THƯỢNG LÃN ÔNG',
    acceptedKeywords: ['HẢI THƯỢNG LÃN ÔNG', 'Hai Thuong Lan Ong', 'Lê Hữu Trác', 'Le Huu Trac'],
    explanation: 'Từ khóa Chướng Ngại Vật là HẢI THƯỢNG LÃN ÔNG / LÊ HỮU TRÁC (15 chữ cái) — Đại danh Y kiêm nhà Văn lớn thế kỷ XVIII quê ở Hưng Yên và Hà Tĩnh, được UNESCO vinh danh.',
    missingRow: {
      question: 'Tên bộ bách khoa toàn thư y học đồ sộ gồm 28 tập, 66 quyển đúc kết toàn bộ lý luận và phương thuốc Y học cổ truyền Việt Nam của Lê Hữu Trác là "Hải Thượng y tông ... lĩnh"?',
      answer: 'TÂM LĨNH',
      explanation: 'Bộ "Hải Thượng y tông tâm lĩnh" là di sản vô giá của nền y học cổ truyền Việt Nam.',
    },
    centerQuestion: {
      question: 'Tên thật đầy đủ (gồm 3 chữ) của Đại danh y Hải Thượng Lãn Ông (1724–1791) là gì?',
      answer: 'LÊ HỮU TRÁC',
      explanation: 'Lê Hữu Trác lấy hiệu là Hải Thượng Lãn Ông, để lại tấm gương sáng ngời về y đức, y đạo và y thuật.',
    },
  },
  '24-M3Q3': {
    title: 'Địa danh Lịch sử Đấu tranh Thống nhất',
    keyword: 'CẦU HIỀN LƯƠNG',
    acceptedKeywords: ['CẦU HIỀN LƯƠNG', 'Cau Hien Luong', 'Đôi bờ Hiền Lương', 'Sông Bến Hải'],
    explanation: 'Từ khóa Chướng Ngại Vật là CẦU HIỀN LƯƠNG (11 chữ cái) — cây cầu lịch sử bắc qua sông Bến Hải tại Vĩ tuyến 17 thuộc tỉnh Quảng Trị, chứng nhân nỗi đau chia cắt và khát vọng thống nhất đất nước.',
    missingRow: {
      question: 'Dòng sông chảy dọc theo Vĩ tuyến 17 tại tỉnh Quảng Trị, nơi có cây cầu Hiền Lương nối liền hai bờ Nam – Bắc trong suốt 21 năm (1954–1975)?',
      answer: 'BẾN HẢI',
      explanation: 'Cụm di tích Đôi bờ Hiền Lương – Bến Hải là Di tích Quốc gia đặc biệt tại tỉnh Quảng Trị.',
    },
    centerQuestion: {
      question: 'Hiệp định quốc tế được ký ngày 21/07/1954 tại Thụy Sĩ quy định lấy Vĩ tuyến 17 (dọc sông Bến Hải) làm giới tuyến quân sự tạm thời trước khi tiến tới tổng tuyển cử thống nhất Việt Nam?',
      answer: 'GENEVA',
      explanation: 'Hiệp định Giơ-ne-vơ (Geneva) năm 1954 quy định giới tuyến quân sự tạm thời tại Vĩ tuyến 17.',
    },
  },
  '24-W1M1Q1': {
    title: 'Hình học Phẳng & Văn hóa Dân gian',
    keyword: 'HÌNH TRÒN',
    acceptedKeywords: ['HÌNH TRÒN', 'Hinh tron', 'Đường tròn'],
    explanation: 'Từ khóa Chướng Ngại Vật là HÌNH TRÒN (8 chữ cái) — hình học cơ bản được vẽ bằng dụng cụ Compa, hiện diện trong hình ảnh vầng Trăng rằm và chiếc Mâm đồng truyền thống.',
    missingRow: {
      question: 'Hằng số toán học vô tỉ biểu thị tỷ số giữa chu vi của một đường tròn với đường kính của nó (xấp xỉ bằng 3,14159...) được ký hiệu bằng chữ cái Hy Lạp nào?',
      answer: 'PI',
      explanation: 'Số Pi (π) là hằng số gắn liền với mọi công thức tính chu vi (2πR) và diện tích hình tròn (πR²).',
    },
    centerQuestion: {
      question: 'Theo truyền thuyết "Bánh chưng, bánh giầy" thời Vua Hùng thứ 6, Lang Liêu đã làm chiếc bánh giầy có hình tròn để tượng trưng cho cái gì?',
      answer: 'BẦU TRỜI',
      explanation: 'Trong quan niệm "Trời tròn, Đất vuông", bánh giầy hình tròn tượng trưng cho Trời.',
    },
  },
  '24-W1M1Q2': {
    title: 'Thiên văn học & Lịch pháp Quốc tế',
    keyword: 'NĂM NHUẬN',
    acceptedKeywords: ['NĂM NHUẬN', 'Nam nhuan'],
    explanation: 'Từ khóa Chướng Ngại Vật là NĂM NHUẬN (8 chữ cái) — năm Dương lịch được cộng Thêm 1 Ngày (ngày 29/2) để có tổng cộng 366 ngày, giúp đồng bộ lịch với chu kỳ Trái Đất quay quanh Mặt Trời.',
    missingRow: {
      question: 'Trong năm Dương lịch nhuận, tháng nào là tháng duy nhất được cộng thêm 1 ngày để có 29 ngày thay vì 28 ngày như năm thường?',
      answer: 'THÁNG HAI',
      explanation: 'Ngày 29 tháng 2 chỉ xuất hiện vào các năm nhuận Dương lịch (4 năm một lần).',
    },
    centerQuestion: {
      question: 'Theo quy tắc lịch Gregory (Dương lịch hiện đại), một năm thế kỷ (có hai chữ số tận cùng là 00, ví dụ 1900, 2000, 2100) chỉ là năm nhuận khi nó chia hết cho bao nhiêu?',
      answer: '400',
      explanation: 'Các năm tròn thế kỷ phải chia hết cho 400 mới là năm nhuận (ví dụ năm 2000 là năm nhuận, còn năm 1900 không phải năm nhuận).',
    },
  },
  '24-W1M2Q2': {
    title: 'Thi ca Lãng mạn Việt Nam (1932–1945)',
    keyword: 'NGUYỄN BÍNH',
    acceptedKeywords: ['NGUYỄN BÍNH', 'Nguyen Binh', 'Mưa xuân'],
    explanation: 'Từ khóa Chướng Ngại Vật là NGUYỄN BÍNH (10 chữ cái) — thi sĩ "chân quê" của phong trào Thơ Mới với hình ảnh hoa Xoan, mưa xuân và nỗi nhớ Chiều quê.',
    missingRow: {
      question: 'Bài thơ lục bát nổi tiếng của Nguyễn Bính có bốn câu kết: "Hôm qua em đi tỉnh về / Hương đồng gió nội bay đi ít nhiều" có nhan đề là gì?',
      answer: 'CHÂN QUÊ',
      explanation: '"Chân quê" là tuyên ngôn nghệ thuật mộc mạc, đằm thắm hồn dân tộc của thi sĩ Nguyễn Bính.',
    },
    centerQuestion: {
      question: 'Tỉnh vùng Đồng bằng châu thổ sông Hồng (nơi có phủ Thiên Trường xưa và làng Vị Xuyên), quê hương của thi sĩ Nguyễn Bính, Văn Cao và Nam Cao?',
      answer: 'NAM ĐỊNH',
      explanation: 'Thi sĩ Nguyễn Bính (1918–1966) sinh tại làng Thiện Vịnh, huyện Vụ Bản, tỉnh Nam Định.',
    },
  },
  '24-W1M3Q3': {
    title: 'Hóa học & Vật lý Điện hóa',
    keyword: 'PIN ĐIỆN HÓA',
    acceptedKeywords: ['PIN ĐIỆN HÓA', 'Pin dien hoa', 'Ăc quy', 'Pin Galvani'],
    explanation: 'Từ khóa Chướng Ngại Vật là PIN ĐIỆN HÓA (10 chữ cái) — nguồn Điện gồm hai điện Cực nhúng trong dung dịch chất Điện li biến đổi trực tiếp hóa năng thành điện năng.',
    missingRow: {
      question: 'Trong pin điện hóa (như pin Galvani), quá trình oxi hóa luôn xảy ra ở cực âm (Anot), còn quá trình khử luôn xảy ra ở điện cực dương có tên gọi quốc tế là gì?',
      answer: 'CATOT',
      explanation: 'Hai điện cực Anot và Catot cùng dung dịch điện li tạo thành cấu trúc cơ bản của mọi pin điện hóa.',
    },
    centerQuestion: {
      question: 'Nhà vật lý người Ý (Alessandro ...) đã chế tạo thành công cột pin điện hóa đầu tiên trên thế giới vào năm 1800, và tên ông được đặt cho đơn vị đo hiệu điện thế?',
      answer: 'VOLTA',
      explanation: 'Pin Volta (1800) của Alessandro Volta là nguồn điện một chiều liên tục đầu tiên của nhân loại.',
    },
  },
  '24-W1M3Q4': {
    title: 'Lịch sử Phong trào Vũ trang Chống Pháp',
    keyword: 'KHỞI NGHĨA YÊN THẾ',
    acceptedKeywords: ['KHỞI NGHĨA YÊN THẾ', 'Khoi nghia Yen The', 'Hoàng Hoa Thám'],
    explanation: 'Từ khóa Chướng Ngại Vật là KHỞI NGHĨA YÊN THẾ (15 chữ cái) — cuộc khởi nghĩa nông dân bền bỉ nhất chống thực dân Pháp kéo dài gần 30 năm (từ năm 1884 đến 1913) tại vùng rừng núi tỉnh Bắc Giang.',
    missingRow: {
      question: 'Biệt danh lừng lẫy "Hùm thiêng Yên Thế" là cách nhân dân tôn vinh vị thủ lĩnh tối cao nào của cuộc khởi nghĩa nông dân Yên Thế (Hoàng Hoa ...)?',
      answer: 'ĐỀ THÁM',
      explanation: 'Hoàng Hoa Thám (Đề Thám) là linh hồn của cuộc khởi nghĩa Yên Thế suốt gần 3 thập kỷ.',
    },
    centerQuestion: {
      question: 'Căn cứ trung tâm kiên cố nhất của nghĩa quân Yên Thế (thuộc huyện Yên Thế, tỉnh Bắc Giang ngày nay), nơi đặt đại bản doanh của Hoàng Hoa Thám, có tên là Đồn Phồn ...?',
      answer: 'PHỒN XƯƠNG',
      explanation: 'Đồn Phồn Xương là thủ phủ của nghĩa quân Yên Thế tại Bắc Giang.',
    },
  },
  '24-W2M1Q2': {
    title: 'Văn học Dân gian & Truyện cười Việt Nam',
    keyword: 'TRẠNG QUỲNH',
    acceptedKeywords: ['TRẠNG QUỲNH', 'Trang Quynh'],
    explanation: 'Từ khóa Chướng Ngại Vật là TRẠNG QUỲNH (10 chữ cái) — nhân vật dân gian Thông minh, hóm hỉnh thời Vua Lê – Chúa Trịnh, đại diện cho trí tuệ dân gian đả kích thói hư tật xấu của quan lại phong kiến.',
    missingRow: {
      question: 'Trong truyện dân gian Trạng Quỳnh, nhân vật nữ thông minh, sắc sảo thường đồng hành cùng Quỳnh trong các cuộc đối đáp với sứ thần và chúa Trịnh là nữ sĩ nào?',
      answer: 'ĐOÀN THỊ ĐIỂM',
      explanation: 'Trong truyền thuyết dân gian, Đoàn Thị Điểm là người bạn đồng môn thông tuệ cùng thời với Trạng Quỳnh.',
    },
    centerQuestion: {
      question: 'Quê hương của nguyên mẫu nhân vật Trạng Quỳnh (danh sĩ Nguyễn Quỳnh ở làng Bột Thượng, huyện Hoằng Hóa) thuộc tỉnh nào của vùng Bắc Trung Bộ?',
      answer: 'THANH HÓA',
      explanation: 'Làng Bột Thượng, huyện Hoằng Hóa, tỉnh Thanh Hóa là quê hương của nguyên mẫu Trạng Quỳnh.',
    },
  },
  '24-W2M2Q1': {
    title: 'Thành tựu Khoa học Vũ trụ Thế kỷ XXI',
    keyword: 'CHANDRAYAAN 3',
    acceptedKeywords: ['CHANDRAYAAN 3', 'Chandrayaan-3', 'Tàu vũ trụ Ấn Độ', 'Ấn Độ'],
    explanation: 'Từ khóa Chướng Ngại Vật là CHANDRAYAAN 3 (12 chữ cái) — sứ mệnh tàu vũ trụ của Ấn Độ (quốc gia chủ nhà G20 năm 2023) lần đầu tiên hạ cánh thành công xuống vùng cực Nam của Mặt Trăng.',
    missingRow: {
      question: 'Tên viết tắt tiếng Anh gồm 4 chữ cái của Tổ chức Nghiên cứu Vũ trụ Ấn Độ (Indian Space Research Organisation) đã thực hiện sứ mệnh đổ bộ cực Nam Mặt Trăng tháng 8/2023?',
      answer: 'ISRO',
      explanation: 'ISRO là cơ quan hàng không vũ trụ quốc gia của Ấn Độ.',
    },
    centerQuestion: {
      question: 'Với sự kiện tàu Chandrayaan-3 hạ cánh an toàn ngày 23/08/2023, quốc gia châu Á nào đã trở thành nước thứ 4 trên thế giới đổ bộ thành công lên Mặt Trăng?',
      answer: 'ẤN ĐỘ',
      explanation: 'Ấn Độ là quốc gia thứ 4 hạ cánh lên Mặt Trăng và là quốc gia đầu tiên đáp xuống vùng cực Nam Mặt Trăng.',
    },
  },
  '24-W2M2Q2': {
    title: 'Thể thơ Dân tộc & Thi pháp Cổ điển',
    keyword: 'SONG THẤT LỤC BÁT',
    acceptedKeywords: ['SONG THẤT LỤC BÁT', 'Song that luc bat', 'Thơ lục bát'],
    explanation: 'Từ khóa Chướng Ngại Vật là SONG THẤT LỤC BÁT (14 chữ cái) — thể thơ dân tộc giàu nhạc tính gồm cặp câu 7 chữ đi liền cặp câu 6–8 chữ, tiêu biểu trong các khúc Ngâm cổ điển và thơ Tản Đà.',
    missingRow: {
      question: 'Tác phẩm văn học cổ điển nổi tiếng của Nguyễn Gia Thiều viết trực tiếp bằng chữ Nôm theo thể thơ Song thất lục bát (gồm 441 câu) có tên là "Cung oán ... khúc"?',
      answer: 'NGÂM KHÚC',
      explanation: '"Cung oán ngâm khúc" và bản dịch "Chinh phụ ngâm" là hai đỉnh cao của thể thơ Song thất lục bát.',
    },
    centerQuestion: {
      question: 'Trong một khổ thơ 4 câu của thể thơ Song thất lục bát, hai câu đầu mỗi câu có bao nhiêu chữ?',
      answer: 'BẢY',
      explanation: 'Hai câu đầu mỗi câu 7 chữ ("Song thất") kết hợp với câu 6 chữ và câu 8 chữ ("Lục bát").',
    },
  },
  '23-M3Q3': {
    title: 'Tác phẩm Văn học Cách mạng Việt Nam',
    keyword: 'VỢ CHỒNG A PHỦ',
    acceptedKeywords: ['VỢ CHỒNG A PHỦ', 'Vo chong A Phu'],
    explanation: 'Từ khóa Chướng Ngại Vật là VỢ CHỒNG A PHỦ (11 chữ cái) — Truyện ngắn xuất sắc của nhà văn Tô Hoài sáng tác năm 1952 (in trong tập Truyện Tây Bắc năm 1953).',
    missingRow: {
      question: 'Tên nhân vật cô gái người Mông giàu sức sống tiềm tàng trong truyện ngắn của Tô Hoài, người đã cắt dây mây cứu A Phủ trong đêm mùa đông trên núi cao Hồng Ngài?',
      answer: 'MỊ',
      explanation: 'Nhân vật Mị và A Phủ là hai hình tượng nghệ thuật tiêu biểu của văn xuôi kháng chiến chống Pháp.',
    },
    centerQuestion: {
      question: 'Tập truyện ngắn gồm 3 tác phẩm ("Cứu đất cứu mường", "Mường Giơn", "Vợ chồng A Phủ") của nhà văn Tô Hoài đoạt Giải Nhất Giải thưởng Hội Văn nghệ Việt Nam 1954–1955 có tên là gì?',
      answer: 'TRUYỆN TÂY BẮC',
      explanation: 'Tập "Truyện Tây Bắc" là thành tựu rực rỡ sau chuyến đi thực tế cùng bộ đội giải phóng Tây Bắc năm 1952 của Tô Hoài.',
    },
  },
  '22-QF1': {
    title: 'Giao thông Vận tải & Lịch sử Đất nước',
    keyword: 'ĐƯỜNG SẮT THỐNG NHẤT',
    acceptedKeywords: ['ĐƯỜNG SẮT THỐNG NHẤT', 'Duong sat Thong Nhat', 'Tàu Thống Nhất', 'Đường sắt Bắc Nam'],
    explanation: 'Từ khóa Chướng Ngại Vật là ĐƯỜNG SẮT THỐNG NHẤT (17 chữ cái) — tuyến Đường sắt huyết mạch dài 1.726 km nối liền Thủ đô Hà Nội với Thành phố Hồ Chí Minh (Sài Gòn).',
    missingRow: {
      question: 'Đèo núi hiểm trở nằm giữa tỉnh Thừa Thiên Huế và thành phố Đà Nẵng ("Thiên hạ đệ nhất hùng quan"), nơi tuyến đường sắt Bắc – Nam đi xuyên qua hệ thống hầm xuyên núi sát bờ biển?',
      answer: 'HẢI VÂN',
      explanation: 'Cung đường sắt qua đèo Hải Vân là một trong những đoạn đường sắt ven biển đẹp nhất thế giới.',
    },
    centerQuestion: {
      question: 'Sau ngày đất nước hoàn toàn thống nhất, chuyến tàu lịch sử đầu tiên nối liền Hà Nội – Sài Gòn đã chính thức lăn bánh thông tuyến vào ngày 31 tháng 12 năm nào?',
      answer: '1976',
      explanation: 'Ngày 31/12/1976, tuyến Đường sắt Thống Nhất Hà Nội – TP. Hồ Chí Minh chính thức khánh thành thông tàu sau 30 năm gián đoạn.',
    },
  },
  '22-W1M3Q2': {
    title: 'Thiên nhiên & Biểu tượng Thẩm mỹ',
    keyword: 'MÀU TRẮNG',
    acceptedKeywords: ['MÀU TRẮNG', 'Mau trang', 'Sắc trắng'],
    explanation: 'Từ khóa Chướng Ngại Vật là MÀU TRẮNG (8 chữ cái) — sắc màu tinh khôi của bông Tuyết, dòng Sữa mẹ và chiếc Nón lá bài thơ.',
    missingRow: {
      question: 'Trong quang học vật lý, chùm ánh sáng mặt trời (có thể phân tích qua lăng kính thành dải 7 màu biến thiên liên tục từ đỏ đến tím) được gọi là ánh sáng gì?',
      answer: 'ÁNH SÁNG TRẮNG',
      explanation: 'Ánh sáng trắng là tập hợp của vô số ánh sáng đơn sắc có màu biến thiên liên tục từ đỏ đến tím.',
    },
    centerQuestion: {
      question: 'Loài chim bồ câu mang sắc lông màu trắng ngần ngậm cành ô liu trong hội họa của danh họa Pablo Picasso là biểu tượng toàn cầu cho khát vọng gì của nhân loại?',
      answer: 'HÒA BÌNH',
      explanation: 'Chim bồ câu trắng là biểu tượng quốc tế của hòa bình và hữu nghị.',
    },
  },
  '22-W2M1Q1': {
    title: 'Văn hóa Đọc & Tri thức Nhân loại',
    keyword: 'CUỐN SÁCH',
    acceptedKeywords: ['CUỐN SÁCH', 'Cuon sach', 'Sách', 'Quyển sách'],
    explanation: 'Từ khóa Chướng Ngại Vật là CUỐN SÁCH / SÁCH (8 chữ cái) — kho tàng tri thức nhân loại được in Chữ trên Giấy và lưu giữ tại các Thư viện.',
    missingRow: {
      question: 'Theo quyết định của Thủ tướng Chính phủ, ngày 21 tháng 4 hằng năm tại Việt Nam được chọn là "Ngày ... và Văn hóa đọc Việt Nam"?',
      answer: 'SÁCH',
      explanation: 'Ngày 21/4 hằng năm là Ngày Sách và Văn hóa đọc Việt Nam; ngày 23/4 là Ngày Sách và Bản quyền Thế giới.',
    },
    centerQuestion: {
      question: 'Nhà văn lớn người Nga (Maxim ...) đã để lại câu danh ngôn bất hủ: "Sách mở rộng trước mắt tôi những chân trời mới"?',
      answer: 'GORKY',
      explanation: 'Câu nói nổi tiếng của đại văn hào Maxim Gorky khẳng định vai trò khai sáng của sách đối với con người.',
    },
  },
  '22-W2M3Q2': {
    title: 'Chương trình Mục tiêu Quốc gia',
    keyword: 'NÔNG THÔN MỚI',
    acceptedKeywords: ['NÔNG THÔN MỚI', 'Nong thon moi'],
    explanation: 'Từ khóa Chướng Ngại Vật là NÔNG THÔN MỚI (11 chữ cái) — Chương trình mục tiêu quốc gia với bộ 19 tiêu chí nhằm phát triển toàn diện kinh tế – xã hội – văn hóa vùng Nông thôn Việt Nam.',
    missingRow: {
      question: 'Bốn chữ vàng đúc kết các hạng mục hạ tầng thiết yếu đầu tiên tại làng xã Việt Nam gồm: "Điện – Đường – Trường – ..."?',
      answer: 'TRẠM',
      explanation: 'Hệ thống Điện – Đường – Trường – Trạm là nền tảng hạ tầng thiết yếu của nông thôn mới.',
    },
    centerQuestion: {
      question: 'Chương trình "Mỗi xã một sản phẩm" nhằm phát triển các đặc sản truyền thống và sản phẩm nông nghiệp chủ lực tại các địa phương nông thôn Việt Nam được viết tắt bằng 4 chữ cái tiếng Anh là gì?',
      answer: 'OCOP',
      explanation: 'Chương trình OCOP (One Commune One Product) là trọng tâm phát triển kinh tế nông thôn mới.',
    },
  },
  '22-W3M3Q1': {
    title: 'Địa lý Thủy văn Việt Nam',
    keyword: 'SÔNG HỒNG',
    acceptedKeywords: ['SÔNG HỒNG', 'Song Hong', 'Hệ thống sông Hồng'],
    explanation: 'Từ khóa Chướng Ngại Vật là SÔNG HỒNG (8 chữ cái) — dòng sông Cái bắt nguồn từ Vân Nam chảy vào nước ta tại Lào Cai, bồi đắp châu thổ Bắc Bộ trước khi đổ ra Biển Đông.',
    missingRow: {
      question: 'Tên cửa biển chính nơi dòng sông Hồng đổ ra Biển Đông, nằm giữa địa phận hai tỉnh Thái Bình và Nam Định (Cửa Ba ...)?',
      answer: 'BA LẠT',
      explanation: 'Cửa Ba Lạt là nơi dòng sông Hồng chảy ra Biển Đông بعد hành trình hơn 556 km trên lãnh thổ Việt Nam.',
    },
    centerQuestion: {
      question: 'Lượng khoáng chất và đất mịn màu nâu đỏ dồi dào lơ lửng trong dòng nước giúp bồi đắp đồng bằng Bắc Bộ màu mỡ và tạo nên sắc đỏ đặc trưng của sông Hồng là gì?',
      answer: 'PHÙ SA',
      explanation: 'Hàm lượng phù sa giàu oxit sắt cao tạo nên màu nước đỏ gạch đặc trưng của sông Hồng.',
    },
  },
  '22-W3M3Q4': {
    title: 'Lịch sử Phong trào Yêu nước Đầu Thế kỷ XX',
    keyword: 'PHONG TRÀO ĐÔNG DU',
    acceptedKeywords: ['PHONG TRÀO ĐÔNG DU', 'Phong trao Dong Du', 'Đông Du'],
    explanation: 'Từ khóa Chướng Ngại Vật là PHONG TRÀO ĐÔNG DU (15 chữ cái) — phong trào do cụ Phan Bội Châu và Hội Duy Tân khởi xướng năm 1905 đưa thanh niên yêu nước Việt Nam sang Nhật Bản học tập.',
    missingRow: {
      question: 'Nhà chí sĩ yêu nước lỗi lạc quê ở huyện Nam Đàn, tỉnh Nghệ An (tác giả "Việt Nam vong quốc sử", "Hải ngoại huyết thư"), người trực tiếp lãnh đạo phong trào Đông Du năm 1905?',
      answer: 'PHAN BỘI CHÂU',
      explanation: 'Cụ Phan Bội Châu (1867–1940) là ngọn cờ tiêu biểu của phong trào yêu nước Việt Nam đầu thế kỷ XX.',
    },
    centerQuestion: {
      question: 'Vị hoàng thân nhà Nguyễn (Kỳ Ngoại Hầu ...) được cụ Phan Bội Châu và Hội Duy Tân tôn làm Hội chủ để vận động thanh niên xuất dương sang Nhật Bản năm 1905?',
      answer: 'CƯỜNG ĐỂ',
      explanation: 'Kỳ Ngoại Hầu Cường Để là Hội chủ của Hội Duy Tân trong phong trào Đông Du.',
    },
  },
  '21-M1Q1': {
    title: 'Tổ chức Quốc tế & Quan hệ Đa phương',
    keyword: 'LIÊN HỢP QUỐC',
    acceptedKeywords: ['LIÊN HỢP QUỐC', 'Lien Hop Quoc', 'UN', 'United Nations'],
    explanation: 'Từ khóa Chướng Ngại Vật là LIÊN HỢP QUỐC (11 chữ cái) — tổ chức đa phương lớn nhất hành tinh thành lập ngày 24/10/1945 nhằm duy trì Hòa bình, an ninh quốc tế với các cơ quan chuyên môn như WHO, UNESCO, UNICEF.',
    missingRow: {
      question: 'Thành phố lớn nhất của Hợp chúng quốc Hoa Kỳ, nơi đặt trụ sở chính của Đại hội đồng và Hội đồng Bảo an Liên Hợp Quốc?',
      answer: 'NEW YORK',
      explanation: 'Trụ sở chính của Liên Hợp Quốc đặt tại thành phố New York (Hoa Kỳ).',
    },
    centerQuestion: {
      question: 'Việt Nam chính thức gia nhập và trở thành thành viên thứ 149 của tổ chức Liên Hợp Quốc vào ngày 20 tháng 9 năm nào?',
      answer: '1977',
      explanation: 'Ngày 20/09/1977, lá cờ đỏ sao vàng của nước CHXHCN Việt Nam chính thức tung bay tại trụ sở Liên Hợp Quốc.',
    },
  },
  '21-M1Q3': {
    title: 'Chính sách Nhân văn & Nghị lực Sống',
    keyword: 'NGƯỜI KHUYẾT TẬT',
    acceptedKeywords: ['NGƯỜI KHUYẾT TẬT', 'Nguoi khuyet tat'],
    explanation: 'Từ khóa Chướng Ngại Vật là NGƯỜI KHUYẾT TẬT (14 chữ cái) — những tấm gương nghị lực "Tàn nhưng không phế" như thầy Nguyễn Ngọc Ký, được tôn vinh vào Ngày Người khuyết tật Việt Nam 18/4.',
    missingRow: {
      question: 'Đại hội Thể thao Quốc tế dành riêng cho các vận động viên khuyết tật được tổ chức ngay sau Thế vận hội Olympic mùa hè và mùa đông có tên gọi là gì?',
      answer: 'PARALYMPIC',
      explanation: 'Thế vận hội Paralympic là biểu tượng vươn lên vượt qua giới hạn của những vận động viên khuyết tật toàn cầu.',
    },
    centerQuestion: {
      question: 'Đô cử xuất sắc của thể thao người khuyết tật Việt Nam (Lê Văn ...) đã giành Huy chương Vàng lịch sử và phá kỷ lục thế giới hạng cân 49 kg tại Paralympic Rio 2016?',
      answer: 'LÊ VĂN CÔNG',
      explanation: 'Lê Văn Công là vận động viên đầu tiên mang về tấm Huy chương Vàng Paralympic cho thể thao Việt Nam.',
    },
  },
  '21-M1Q4': {
    title: 'Y học & Vi sinh vật học',
    keyword: 'BỆNH DẠI',
    acceptedKeywords: ['BỆNH DẠI', 'Benh dai', 'Vắc xin phòng dại'],
    explanation: 'Từ khóa Chướng Ngại Vật là BỆNH DẠI (7 chữ cái) — bệnh truyền nhiễm cấp tính hệ thần kinh trung ương do Virus Rhabdovirus lây truyền qua Nước bọt của động vật máu nóng (phổ biến nhất là Chó, mèo).',
    missingRow: {
      question: 'Nhà bác học vĩ đại người Pháp (Louis ...) đã nghiên cứu và tiêm thành công vắc xin phòng bệnh dại đầu tiên cứu sống cậu bé Joseph Meister vào ngày 06/07/1885?',
      answer: 'PASTEUR',
      explanation: 'Louis Pasteur là cha đẻ của ngành vi sinh vật học và vắc xin phòng bệnh dại.',
    },
    centerQuestion: {
      question: 'Theo khuyến cáo của Tổ chức Y tế Thế giới (WHO), biện pháp duy nhất và hiệu quả nhất để cứu sống người bị chó, mèo nghi mắc bệnh dại cắn ngay sau khi xử lý vết thương là gì?',
      answer: 'TIÊM VẮC XIN',
      explanation: 'Rửa sạch vết thương và đi tiêm vắc xin / huyết thanh kháng dại kịp thời là cách duy nhất ngăn chặn bệnh dại phát tác.',
    },
  },
  '21-M2Q4': {
    title: 'Sinh lý Người & Điều hòa Thân nhiệt',
    keyword: 'TUYẾN MỒ HÔI',
    acceptedKeywords: ['TUYẾN MỒ HÔI', 'Tuyen mo hoi', 'Mồ hôi', 'Mo hoi'],
    explanation: 'Từ khóa Chướng Ngại Vật là TUYẾN MỒ HÔI / MỒ HÔI (10 chữ cái) — cơ quan dưới da thực hiện chức năng Bài tiết nước và Muối khoáng, giúp tỏa nhiệt làm mát cơ thể khi trời Nóng hoặc vận động.',
    missingRow: {
      question: 'Cơ quan nào có diện tích bề mặt lớn nhất trên cơ thể con người, đóng vai trò là hàng rào bảo vệ đầu tiên, tiếp nhận cảm giác và điều hòa thân nhiệt?',
      answer: 'DA',
      explanation: 'Hệ thống tuyến mồ hôi phân bố khắp lớp hạ bì và trung bì của da người.',
    },
    centerQuestion: {
      question: 'Trong y học thể thao, khi cơ thể tiết quá nhiều mồ hôi dưới thời tiết nắng nóng mà không được bù đắp kịp thời thì ngoài việc mất nước, cơ thể còn bị thiếu hụt các ion khoáng (Na+, K+, Cl-) gọi là mất chất gì?',
      answer: 'ĐIỆN GIẢI',
      explanation: 'Bù nước và chất điện giải (Oresol) là nguyên tắc quan trọng khi cơ thể mất nhiều mồ hôi.',
    },
  },
  '21-W1M1Q2': {
    title: 'Tổ chức Chính trị – Xã hội Tuổi trẻ Việt Nam',
    keyword: 'THÁNG THANH NIÊN',
    acceptedKeywords: ['THÁNG THANH NIÊN', 'Thang Thanh nien', 'Đoàn Thanh niên', 'Tháng Ba'],
    explanation: 'Từ khóa Chướng Ngại Vật là THÁNG THANH NIÊN (14 chữ cái) — tháng Ba hằng năm gắn với ngày thành lập Đoàn TNCS Hồ Chí Minh (26/3), nơi tuổi trẻ Thanh niên rèn luyện dưới ngọn cờ của Đảng và tỏa sáng tại các kỳ SEA Games.',
    missingRow: {
      question: 'Đoàn Thanh niên Cộng sản Hồ Chí Minh được chính thức thành lập vào ngày 26 tháng 3 năm nào?',
      answer: '1931',
      explanation: 'Ngày 26/03/1931 là ngày thành lập Đoàn Thanh niên Cộng sản Hồ Chí Minh.',
    },
    centerQuestion: {
      question: 'Chiếc áo mang sắc màu xanh da trời gắn với phong trào "Mùa hè xanh" của học sinh, sinh viên Việt Nam được gọi thân thương là màu áo gì?',
      answer: 'ÁO XANH TÌNH NGUYỆN',
      explanation: 'Màu áo xanh tình nguyện là biểu tượng nhiệt huyết của tuổi trẻ Việt Nam trong Tháng Thanh niên.',
    },
  },
  '21-W1M2Q3': {
    title: 'Hiện tượng Quang học Khí quyển',
    keyword: 'CẦU VỒNG',
    acceptedKeywords: ['CẦU VỒNG', 'Cau vong'],
    explanation: 'Từ khóa Chướng Ngại Vật là CẦU VỒNG (7 chữ cái) — hiện tượng quang học tán sắc ánh sáng mặt trời qua các giọt nước mưa tạo nên dải 7 màu rực rỡ trên bầu trời.',
    missingRow: {
      question: 'Hiện tượng ánh sáng mặt trời bị phân tách thành chùm các tia sáng đơn sắc có màu khác nhau khi đi qua mặt phân cách giữa không khí và giọt nước mưa gọi là hiện tượng gì?',
      answer: 'TÁN SẮC',
      explanation: 'Hiện tượng tán sắc ánh sáng kết hợp phản xạ bên trong giọt nước mưa tạo nên cầu vồng sau cơn mưa.',
    },
    centerQuestion: {
      question: 'Trong dải 7 màu cơ bản của cầu vồng (Đỏ, Cam, Vàng, Lục, Lam, Chàm, Tím), màu nào có bước sóng lớn nhất và bị lệch ít nhất khi khúc xạ qua giọt nước?',
      answer: 'MÀU ĐỎ',
      explanation: 'Ánh sáng màu đỏ có bước sóng lớn nhất nên nằm ở vòng cung ngoài cùng của cầu vồng bậc một.',
    },
  },
  '21-W2M1Q2': {
    title: 'Lịch sử Tư tưởng & Phật giáo Đại Việt',
    keyword: 'THIỀN PHÁI TRÚC LÂM',
    acceptedKeywords: ['THIỀN PHÁI TRÚC LÂM', 'Thien phai Truc Lam', 'Trúc Lâm Yên Tử', 'Phật hoàng Trần Nhân Tông'],
    explanation: 'Từ khóa Chướng Ngại Vật là THIỀN PHÁI TRÚC LÂM (16 chữ cái) — dòng thiền Phật giáo thuần Việt mang tinh thần nhập thế do Phật hoàng Trần Nhân Tông sáng lập năm 1299 trên núi Yên Tử.',
    missingRow: {
      question: 'Ngọn núi linh thiêng thuộc cánh cung Đông Triều (tỉnh Quảng Ninh), nơi vua Trần Nhân Tông nhường ngôi xuất gia tu hành và khai sáng dòng thiền dân tộc có tên là núi gì?',
      answer: 'YÊN TỬ',
      explanation: 'Núi Yên Tử được mệnh danh là "Đất tổ Phật giáo Trúc Lâm Việt Nam".',
    },
    centerQuestion: {
      question: 'Cùng với Đệ nhất Tổ Trần Nhân Tông và Đệ tam Tổ Huyền Quang, vị thiền sư lỗi lạc nào là Đệ nhị Tổ trong "Trúc Lâm Tam Tổ" của Thiền phái Trúc Lâm Yên Tử?',
      answer: 'PHÁP LOA',
      explanation: 'Trúc Lâm Tam Tổ gồm: Trần Nhân Tông (Đệ nhất Tổ), Pháp Loa (Đệ nhị Tổ) và Huyền Quang (Đệ tam Tổ).',
    },
  },
  '20-M1Q3': {
    title: 'Buổi đầu Dựng nước trong Lịch sử Dân tộc',
    keyword: 'NHÀ NƯỚC VĂN LANG',
    acceptedKeywords: ['NHÀ NƯỚC VĂN LANG', 'Nha nuoc Van Lang', 'Văn Lang'],
    explanation: 'Từ khóa Chướng Ngại Vật là NHÀ NƯỚC VĂN LANG (14 chữ cái) — Quốc hiệu nhà nước đầu tiên của dân tộc ta thời các Vua Hùng (Hùng Vương) được hợp nhất từ 15 Bộ lạc Lạc Việt.',
    missingRow: {
      question: 'Kinh đô của nhà nước Văn Lang thời các Vua Hùng được đặt tại vùng đất ngã ba sông Bạch Hạc (thuộc thành phố Việt Trì, tỉnh Phú Thọ ngày nay) có tên cổ là gì?',
      answer: 'PHONG CHÂU',
      explanation: 'Kinh đô Phong Châu (Phú Thọ) là trung tâm của nhà nước Văn Lang thời đại Hùng Vương.',
    },
    centerQuestion: {
      question: 'Dưới các Vua Hùng trong bộ máy nhà nước Văn Lang, các vị tướng chỉ huy quân sự được gọi là Lạc tướng, còn các vị quan giúp vua trông coi việc dân sự được gọi là gì?',
      answer: 'LẠC HẦU',
      explanation: 'Đứng đầu nhà nước Văn Lang là Hùng Vương, giúp việc có các Lạc hầu (văn) và Lạc tướng (võ).',
    },
  },
  '20-QF2': {
    title: 'Biểu tượng Thiêng liêng của Tổ quốc',
    keyword: 'QUỐC HUY VIỆT NAM',
    acceptedKeywords: ['QUỐC HUY VIỆT NAM', 'Quoc huy Viet Nam', 'Quốc huy'],
    explanation: 'Từ khóa Chướng Ngại Vật là QUỐC HUY VIỆT NAM (14 chữ cái) — biểu tượng nhà nước có hình tròn nền đỏ, ngôi Sao vàng ở giữa, bông Lúa vàng bao quanh và bánh xe công nghiệp, được phê chuẩn năm 1956.',
    missingRow: {
      question: 'Cố danh họa, Anh hùng Lao động nào (1906–2000), cựu sinh viên khóa I Trường Mỹ thuật Đông Dương, là tác giả phác thảo mẫu Quốc huy Việt Nam?',
      answer: 'BÙI TRANG CHƯỚC',
      explanation: 'Danh họa Bùi Trang Chước là người vẽ phác thảo mẫu Quốc huy Việt Nam, với sự chỉnh sửa hoàn thiện của họa sĩ Trần Văn Cẩn.',
    },
    centerQuestion: {
      question: 'Phía dưới hình ngôi sao vàng 5 cánh ở chính giữa Quốc huy nước Cộng hòa Xã hội Chủ nghĩa Việt Nam là hình nửa bánh xe gì tượng trưng cho công nghiệp?',
      answer: 'BÁNH XE RĂNG',
      explanation: 'Hình ảnh bông lúa vàng và bánh xe răng cưa trên Quốc huy biểu trưng cho liên minh công – nông.',
    },
  },
  '20-QF4': {
    title: 'Kinh tế Xã hội & Phát triển Bền vững',
    keyword: 'CHỈ SỐ PHÁT TRIỂN CON NGƯỜI',
    acceptedKeywords: ['CHỈ SỐ PHÁT TRIỂN CON NGƯỜI', 'Chi so phat trien con nguoi', 'HDI'],
    explanation: 'Từ khóa Chướng Ngại Vật là CHỈ SỐ PHÁT TRIỂN CON NGƯỜI / HDI (22 chữ cái) — thước đo tổng hợp của Liên Hợp Quốc đánh giá sự phát triển dựa trên 3 tiêu chí: Sức khỏe (Tuổi Thọ), Tri thức (Học vấn) và Mức sống (Thu nhập).',
    missingRow: {
      question: 'Cơ quan trực thuộc Liên Hợp Quốc (viết tắt là UNDP) có nhiệm vụ công bố Báo cáo Phát triển Con người hằng năm của các quốc gia trên thế giới là Chương trình ... Liên Hợp Quốc?',
      answer: 'PHÁT TRIỂN',
      explanation: 'UNDP (United Nations Development Programme) công bố chỉ số HDI hằng năm từ năm 1990.',
    },
    centerQuestion: {
      question: 'Chỉ số Phát triển Con người (Human Development Index) được viết tắt bằng 3 chữ cái tiếng Anh nào?',
      answer: 'HDI',
      explanation: 'HDI nhận giá trị từ 0 đến 1, phản ánh toàn diện chất lượng cuộc sống con người của một quốc gia.',
    },
  },
  '20-W1M3Q2': {
    title: 'Hóa học Phân tích & Dung dịch Điện li',
    keyword: 'DUNG DỊCH AXIT',
    acceptedKeywords: ['DUNG DỊCH AXIT', 'Dung dich axit', 'Axit', 'Acid'],
    explanation: 'Từ khóa Chướng Ngại Vật là DUNG DỊCH AXIT (12 chữ cái) — hợp chất hóa học phân li ra ion H+ trong Dung dịch, thường có vị Chua và có độ pH nhỏ hơn 7.',
    missingRow: {
      question: 'Khi nhúng mẩu giấy quỳ tím vào dung dịch có môi trường axit, giấy quỳ tím sẽ chuyển sang màu gì?',
      answer: 'MÀU ĐỎ',
      explanation: 'Dung dịch axit làm quỳ tím hóa đỏ (hoặc hồng), còn dung dịch bazơ làm quỳ tím hóa xanh.',
    },
    centerQuestion: {
      question: 'Theo thuyết điện li của nhà bác học người Thụy Điển Svante Arrhenius (1887), axit là những chất khi tan trong nước phân li ra cation nào?',
      answer: 'HYDRO',
      explanation: 'Theo Arrhenius, axit phân li ra cation H+ (hay ion Hydroni H3O+) trong dung dịch nước.',
    },
  },
  '20-W1M3Q4': {
    title: 'Làng nghề Cổ truyền Việt Nam',
    keyword: 'NGHỀ DỆT LỤA TƠ TẰM',
    acceptedKeywords: ['NGHỀ DỆT LỤA TƠ TẰM', 'Nghe det lua to tam', 'Tơ lụa', 'Dệt lụa', 'Trồng dâu nuôi tằm'],
    explanation: 'Từ khóa Chướng Ngại Vật là NGHỀ DỆT LỤA TƠ TẰM (15 chữ cái) — nghề thủ công truyền thống lâu đời gắn với chu trình trồng Dâu, nuôi Tằm, ươm tơ và dệt Vải lụa.',
    missingRow: {
      question: 'Làng nghề dệt lụa cổ truyền nổi tiếng bậc nhất Việt Nam nằm bên bờ sông Nhuệ thuộc quận Hà Đông, thành phố Hà Nội có tên là làng lụa gì?',
      answer: 'VẠN PHÚC',
      explanation: 'Làng lụa Vạn Phúc (Hà Đông) có lịch sử hơn 1.000 năm dệt lụa tơ tằm thượng hạng.',
    },
    centerQuestion: {
      question: 'Sau khi con tằm ăn lá dâu chín sẽ nhả ra những sợi tơ protein tự nhiên quấn quanh mình tạo thành chiếc vỏ bọc hình bầu dục gọi là cái gì?',
      answer: 'KÉN TẰM',
      explanation: 'Từ những chiếc kén tằm vàng óng, người thợ thủ công đem ươm trong nước nóng để kéo sợi tơ dệt lụa.',
    },
  },
  '20-W2M1Q4': {
    title: 'Khí hậu học & Thiên văn Thời tiết',
    keyword: 'MÙA HẠ',
    acceptedKeywords: ['MÙA HẠ', 'Mua ha', 'Mùa hè', 'Mua he'],
    explanation: 'Từ khóa Chướng Ngại Vật là MÙA HẠ / MÙA HÈ (5 chữ cái) — mùa có thời tiết Nóng ẩm tại Bắc Bán Cầu, bắt đầu có ngày Hạ chí (tháng 6) khi Mặt Trời lên cao nhất.',
    missingRow: {
      question: 'Loài cây thân gỗ gắn liền với tuổi học trò Việt Nam, nở hoa đỏ rực sân trường mỗi độ tháng 5, tháng 6 báo hiệu mùa thi và kỳ nghỉ hè đến?',
      answer: 'PHƯỢNG VĨ',
      explanation: 'Hoa phượng vĩ đỏ rực và tiếng ve ngân là hai tín hiệu đặc trưng nhất của mùa hè Việt Nam.',
    },
    centerQuestion: {
      question: 'Trong bài thơ "Mùa xuân nho nhỏ" của Thanh Hải hoặc bài thơ "Hạt gạo làng ta" của Trần Đăng Khoa, những cơn mưa rào kèm sấm chớp xuất hiện vào buổi chiều mùa hạ thường được gọi là mưa gì?',
      answer: 'MƯA DÔNG',
      explanation: 'Mưa dông nhiệt đới vào buổi chiều tối là hiện tượng thời tiết phổ biến trong mùa hạ ở Việt Nam.',
    },
  },
  '20-W2M2Q3': {
    title: 'Ca khúc Lịch sử & Khát vọng Thống nhất',
    keyword: 'NỐI VÒNG TAY LỚN',
    acceptedKeywords: ['NỐI VÒNG TAY LỚN', 'Noi vong tay lon'],
    explanation: 'Từ khóa Chướng Ngại Vật là NỐI VÒNG TAY LỚN (13 chữ cái) — nhạc phẩm bất hủ của nhạc sĩ Trịnh Công Sơn được hát trong phong trào thanh niên sinh viên năm 1970 và vang lên ngày 30/4/1975.',
    missingRow: {
      question: 'Trong lời ca khúc "Nối vòng tay lớn" của Trịnh Công Sơn: "Từ Bắc vô Nam nối liền nắm tay / Ta đi từ đồng hoang vu vượt hết ..."?',
      answer: 'ĐÈO CAO',
      explanation: 'Ca khúc thể hiện khát vọng non sông liền một dải từ Bắc vô Nam.',
    },
    centerQuestion: {
      question: 'Trưa ngày 30/04/1975 lịch sử, chính nhạc sĩ Trịnh Công Sơn đã trực tiếp hát vang ca khúc "Nối vòng tay lớn" trên sóng của Đài Phát thanh nào?',
      answer: 'SÀI GÒN',
      explanation: 'Bản thu thanh trực tiếp "Nối vòng tay lớn" trên Đài Phát thanh Sài Gòn trưa 30/04/1975 là khoảnh khắc lịch sử khó quên.',
    },
  },
  '19-QF2': {
    title: 'Văn hóa Phương Đông & Toán học',
    keyword: 'NGŨ HÀNH',
    acceptedKeywords: ['NGŨ HÀNH', 'Ngu hanh', 'Số năm', 'Số 5'],
    explanation: 'Từ khóa Chướng Ngại Vật là NGŨ HÀNH / SỐ NĂM (7 chữ cái) — con số 5 là Số nguyên tố, ứng với 5 Giác quan của con người, Ngôi sao 5 cánh trên Quốc kỳ và thuyết Ngũ hành (Kim, Mộc, Thủy, Hỏa, Thổ).',
    missingRow: {
      question: 'Trong học thuyết triết học cổ phương Đông về 5 dạng vật chất cơ bản vận động tương sinh – tương khắc gồm: Kim, Mộc, Thủy, Hỏa và nguyên tố thứ 5 là gì?',
      answer: 'THỔ',
      explanation: 'Năm yếu tố Kim – Mộc – Thủy – Hỏa – Thổ tạo thành học thuyết Ngũ hành.',
    },
    centerQuestion: {
      question: 'Biểu tượng của Thế vận hội Olympic hiện đại gồm bao nhiêu vòng tròn đan vào nhau (tượng trưng cho sự đoàn kết của các châu lục trên thế giới)?',
      answer: 'NĂM',
      explanation: 'Năm vòng tròn Olympic màu Xanh lam, Vàng, Đen, Xanh lá và Đỏ tượng trưng cho 5 châu lục.',
    },
  },
  '19-W1M1Q1': {
    title: 'Thiên nhiên & Thi ca Việt Nam',
    keyword: 'MÙA THU',
    acceptedKeywords: ['MÙA THU', 'Mua thu', 'Thu'],
    explanation: 'Từ khóa Chướng Ngại Vật là MÙA THU (6 chữ cái) — mùa của ngày Tết Độc lập Quốc khánh 2/9, mùa lá vàng rơi ("Mùa lá rụng") và nguồn cảm hứng chùm thơ Thu của Nguyễn Khuyến.',
    missingRow: {
      question: 'Hương hoa nồng nàn của loài cây thân gỗ cao trên các con phố Nguyễn Du, Quán Thánh mỗi độ gió heo may về, được coi là "đặc sản" của mùa thu Hà Nội là hoa gì?',
      answer: 'HOA SỮA',
      explanation: 'Hương hoa sữa và cốm làng Vòng là những nét chấm phá đặc trưng của mùa thu Hà Nội.',
    },
    centerQuestion: {
      question: 'Nhà thơ Lưu Trọng Lư đã viết thi phẩm nổi tiếng gồm những câu thơ ngẩn ngơ: "Em không nghe mùa thu / Dưới trăng mờ thổn thức... / Con nai vàng ngơ ngác / Đạp trên lá vàng khô" với nhan đề là gì?',
      answer: 'TIẾNG THU',
      explanation: 'Bài thơ "Tiếng thu" của Lưu Trọng Lư là một viên ngọc sáng của phong trào Thơ Mới.',
    },
  },
  '19-W1M2Q2': {
    title: 'Sinh lý Học & Trao đổi Chất',
    keyword: 'HỆ HÔ HẤP',
    acceptedKeywords: ['HỆ HÔ HẤP', 'He ho hap', 'Hô hấp', 'Ho hap'],
    explanation: 'Từ khóa Chướng Ngại Vật là HỆ HÔ HẤP (7 chữ cái) — hệ cơ quan có lá Phổi giúp cung cấp khí Oxi cho các Tế bào thực hiện quá trình oxi hóa sinh học tạo năng lượng ATP.',
    missingRow: {
      question: 'Các túi khí siêu nhỏ có mạng lưới mao mạch máu dày đặc bao quanh nằm ở tận cùng của các nhánh phế quản trong phổi, nơi diễn ra sự khuếch tán khí O2 và CO2, được gọi là gì?',
      answer: 'PHẾ NANG',
      explanation: 'Hai lá phổi người có khoảng 300–500 triệu phế nang giúp tăng diện tích bề mặt trao đổi khí lên tới gần 100 m².',
    },
    centerQuestion: {
      question: 'Bào quan nào bên trong tế bào nhân thực đóng vai trò là "nhà máy năng lượng", sử dụng khí Oxi từ hệ hô hấp để phân giải chất hữu cơ tạo ra ATP?',
      answer: 'TI THỂ',
      explanation: 'Ti thể là nơi diễn ra quá trình hô hấp tế bào hiếu khí.',
    },
  },
  '19-W1M3Q2': {
    title: 'Nhóm Văn học & Địa danh Văn hóa',
    keyword: 'BÀN THÀNH TỨ HỮU',
    acceptedKeywords: ['BÀN THÀNH TỨ HỮU', 'Ban Thanh Tu Huu', 'Hàn Mặc Tử', 'Chế Lan Viên'],
    explanation: 'Từ khóa Chướng Ngại Vật là BÀN THÀNH TỨ HỮU (13 chữ cái) — nhóm 4 Nhà thơ tiêu biểu của phong trào Thơ Mới gắn bó với vùng đất Quy Nhơn – Bình Định (Hàn Mặc Tử, Chế Lan Viên, Yến Lan, Quách Tấn).',
    missingRow: {
      question: 'Nhà thơ tài hoa bạc mệnh thuộc nhóm Bàn Thành Tứ Hữu, tác giả tập "Gửi hương cho gió" và bài thơ "Đây thôn Vĩ Dạ", hiện yên nghỉ tại đồi Thi Nhân (Ghềnh Ráng, Quy Nhơn)?',
      answer: 'HÀN MẶC TỬ',
      explanation: 'Hàn Mặc Tử, Chế Lan Viên, Yến Lan và Quách Tấn tạo nên nhóm "Bàn Thành Tứ Hữu" lừng danh trên thi đàn.',
    },
    centerQuestion: {
      question: 'Trong danh xưng "Bàn Thành Tứ Hữu" của 4 nhà thơ đất Bình Định, hai chữ "Bàn Thành" bắt nguồn từ tên kinh đô cổ nào của vương quốc Chăm Pa và hoàng đế Thái Đức Nguyễn Nhạc?',
      answer: 'ĐỒ BÀN',
      explanation: 'Thành Đồ Bàn (Bàn Thành) là cố đô lịch sử trên đất Bình Định.',
    },
  },
  '19-W1M3Q4': {
    title: 'Giải phẫu & Sinh lý Người',
    keyword: 'HỒNG CẦU',
    acceptedKeywords: ['HỒNG CẦU', 'Hong cau', 'Máu', 'Tế bào hồng cầu'],
    explanation: 'Từ khóa Chướng Ngại Vật là HỒNG CẦU (7 chữ cái) — tế bào máu hình đĩa lõm hai mặt được Tim bơm đi khắp Hệ tuần hoàn để vận chuyển khí Oxi nuôi cơ thể.',
    missingRow: {
      question: 'Hợp chất protein chứa nhân Sắt (Fe2+) nằm trong tế bào hồng cầu, tạo nên màu đỏ của máu và có khả năng liên kết thuận nghịch với khí O2 và CO2 được gọi là gì?',
      answer: 'HEMOGLOBIN',
      explanation: 'Hemoglobin (Huyết sắc tố) đảm nhiệm việc vận chuyển gần 98% lượng Oxi trong máu động mạch.',
    },
    centerQuestion: {
      question: 'Cơ quan tạo máu chính nằm bên trong các xương xốp (như xương ức, xương chậu, đầu xương dài) của người trưởng thành, nơi sản sinh ra hàng trăm tỷ tế bào hồng cầu mới mỗi ngày?',
      answer: 'TỦY XƯƠNG',
      explanation: 'Tủy đỏ của xương là nơi sinh ra hồng cầu, bạch cầu và tiểu cầu.',
    },
  },
  '19-W2M2Q1': {
    title: 'Di sản Thủ công Mỹ nghệ Việt Nam',
    keyword: 'GỐM SỨ BÁT TRÀNG',
    acceptedKeywords: ['GỐM SỨ BÁT TRÀNG', 'Gom su Bat Trang', 'Gốm sứ', 'Bát Tràng'],
    explanation: 'Từ khóa Chướng Ngại Vật là GỐM SỨ BÁT TRÀNG (13 chữ cái) — làng nghề truyền thống bên sông Hồng chế tác đất sét trắng qua lửa Nhiệt độ cao tạo nên những sản phẩm gốm sứ tinh xảo.',
    missingRow: {
      question: 'Nguyên liệu khoáng vật sét màu trắng tinh khiết (giàu khoáng vật Kaolinit), chịu lửa rất cao, là thành phần chính để chế tạo đồ sứ cao cấp có tên gọi là gì?',
      answer: 'CAO LANH',
      explanation: 'Đất sét trắng (Cao lanh / Kaolin) tráng men và nung ở nhiệt độ trên 1.200°C tạo ra đồ sứ trắng bóng.',
    },
    centerQuestion: {
      question: 'Làng nghề gốm sứ cổ truyền Bát Tràng (huyện Gia Lâm, Hà Nội) nằm bên tả ngạn của dòng sông lớn nào?',
      answer: 'SÔNG HỒNG',
      explanation: 'Làng gốm Bát Tràng nằm bên bờ tả ngạn sông Hồng, thuận lợi cho giao thương đường thủy từ thời Lý – Trần.',
    },
  },
  '19-W2M2Q2': {
    title: 'Tài nguyên Khoáng sản & Công nghiệp',
    keyword: 'THAN ĐÁ',
    acceptedKeywords: ['THAN ĐÁ', 'Than da', 'Vàng đen', 'Khai thác than'],
    explanation: 'Từ khóa Chướng Ngại Vật là THAN ĐÁ (6 chữ cái) — loại nhiên liệu hóa thạch màu Đen được mệnh danh là "Vàng đen" của Tổ quốc, gắn với truyền thống "Kỷ luật và Đồng tâm" của những người Thợ mỏ.',
    missingRow: {
      question: 'Tỉnh vùng Đông Bắc Việt Nam chiếm hơn 90% trữ lượng than đá của cả nước (với các vùng mỏ Hòn Gai, Cẩm Phả, Vàng Danh, Mạo Khê) là tỉnh nào?',
      answer: 'QUẢNG NINH',
      explanation: 'Bể than Đông Bắc tại tỉnh Quảng Ninh là cái nôi của giai cấp công nhân vùng mỏ Việt Nam.',
    },
    centerQuestion: {
      question: 'Loại than đá có tuổi địa chất cổ nhất, hàm lượng cacbon cố định cao nhất (từ 86% đến 95%), cháy cho nhiệt lượng cao và ít khói nhất (chiếm chủ yếu ở bể than Quảng Ninh) gọi là than gì?',
      answer: 'ANTRACIT',
      explanation: 'Than Antracit (than антрацит) Quảng Ninh có chất lượng hàng đầu thế giới.',
    },
  },
  '19-W3M3Q4': {
    title: 'Sinh học Người & Hoạt động Tư duy',
    keyword: 'HỆ THẦN KINH',
    acceptedKeywords: ['HỆ THẦN KINH', 'He than kinh', 'Thần kinh trung ương'],
    explanation: 'Từ khóa Chướng Ngại Vật là HỆ THẦN KINH (10 chữ cái) — hệ cơ quan trung tâm gồm bộ Não và Tủy sống điều khiển mọi phản xạ, cảm xúc và hoạt động tư duy Thông minh của con người.',
    missingRow: {
      question: 'Đơn vị cấu trúc và chức năng cơ bản của hệ thần kinh (gồm thân chứa nhân, các sợi nhánh và một sợi trục dài dẫn truyền xung điện) được gọi là tế bào gì?',
      answer: 'NƠRON',
      explanation: 'Bộ não con người chứa khoảng 86 tỷ tế bào thần kinh (Nơron) kết nối với nhau qua hàng trăm nghìn tỷ synap.',
    },
    centerQuestion: {
      question: 'Nhà sinh lý học vĩ đại người Nga (Ivan ...), người giành Giải Nobel Y học năm 1904 và đặt nền móng cho học thuyết về phản xạ có điều kiện của hệ thần kinh cấp cao?',
      answer: 'PAVLOV',
      explanation: 'Ivan Pavlov đã làm sáng tỏ cơ chế hình thành phản xạ có điều kiện ở vỏ đại não.',
    },
  },
};

/**
 * Hoàn thiện toàn bộ các bộ câu hỏi VCNV trong ngân hàng (cả các trận lịch sử có 3-5 hàng ngang
 * và các trận lịch sử chỉ mới mở 1-2 hàng ngang trên sóng truyền hình) để mọi trận đấu trong ngân hàng
 * đều có đầy đủ 4 Hàng ngang (1..4) + 1 Câu hỏi Ô Trung Tâm (5) + 1 Từ khóa Chướng Ngại Vật (CNV).
 */
export function completeAllHistoricalVcnvMatches(
  questionsMap: Map<string, BankQuestionRecord>
): void {
  const byMatchKey = new Map<string, BankQuestionRecord[]>();
  for (const rec of questionsMap.values()) {
    if (rec.round !== 'VCNV') continue;
    const key = `${rec.season}-${rec.match}`;
    if (!byMatchKey.has(key)) {
      byMatchKey.set(key, []);
    }
    byMatchKey.get(key)!.push(rec);
  }

  let fallbackIndex = 0;

  for (const [matchKey, group] of byMatchKey.entries()) {
    if (matchKey.startsWith('26-VCNV')) continue;

    const season = group[0]?.season || '26';
    const match = group[0]?.match || 'M1';
    const spec = HISTORICAL_VCNV_SUPPLEMENTS[matchKey];
    const fallbackPuzzle =
      OBSTACLE_PUZZLES[fallbackIndex % OBSTACLE_PUZZLES.length];
    fallbackIndex++;

    const bySub = new Map<string, BankQuestionRecord>();
    for (const r of group) {
      bySub.set(r.subCode.toUpperCase(), r);
    }

    const categoryTitle = spec ? spec.title : fallbackPuzzle.title;

    // 1. Ensure Rows 1, 2, 3, 4 exist
    for (const rowNum of [1, 2, 3, 4] as const) {
      const subKey = String(rowNum);
      if (!bySub.has(subKey)) {
        const qid = `${season}-${match}-VCNV-${subKey}`;
        const fallbackRow = fallbackPuzzle.rows[rowNum - 1];
        const useMissingSpec = spec?.missingRow;
        const ans = useMissingSpec
          ? useMissingSpec.answer.trim().toUpperCase()
          : fallbackRow.displayWord;
        const qText = useMissingSpec
          ? useMissingSpec.question
          : fallbackRow.question;
        const expText = useMissingSpec
          ? useMissingSpec.explanation
          : fallbackRow.explanation;

        const newRowRec: BankQuestionRecord = {
          qid,
          season,
          match,
          round: 'VCNV',
          subCode: subKey,
          subjectRaw: 'General/Social',
          categoryVi: categoryTitle,
          question: qText,
          officialAnswer: ans,
          acceptedAnswers: [ans],
          explanation: expText,
          sourceFile: 'questions_7b1e9b9b.csv (Đã bổ sung đầy đủ VCNV)',
        };
        questionsMap.set(qid, newRowRec);
        bySub.set(subKey, newRowRec);
      }
    }

    // 2. Ensure Row 5 (Center Question / Ô Trung Tâm) exists
    if (!bySub.has('5') && !bySub.has('OTT') && !bySub.has('CENTER')) {
      const qid5 = `${season}-${match}-VCNV-5`;
      const cQ = spec?.centerQuestion;
      const ans5 = cQ
        ? cQ.answer.trim().toUpperCase()
        : spec
        ? spec.keyword.split(' ')[0].trim().toUpperCase()
        : fallbackPuzzle.centerQuestion.displayWord;
      const qText5 = cQ
        ? `Câu hỏi Ô Trung Tâm (${ans5.replace(/\s+/g, '').length} chữ cái): ${cQ.question}`
        : spec
        ? `Câu hỏi Ô Trung Tâm: Dựa vào các dữ kiện văn hóa – lịch sử – khoa học thuộc chủ đề "${spec.title}", hãy xác định từ khóa cốt lõi gắn liền với Chướng Ngại Vật của trận ${season}-${match}?`
        : fallbackPuzzle.centerQuestion.question;
      const exp5 = cQ
        ? cQ.explanation
        : spec
        ? spec.explanation
        : fallbackPuzzle.centerQuestion.explanation;

      const centerRec: BankQuestionRecord = {
        qid: qid5,
        season,
        match,
        round: 'VCNV',
        subCode: '5',
        subjectRaw: 'General/Social',
        categoryVi: categoryTitle,
        question: qText5,
        officialAnswer: ans5,
        acceptedAnswers: spec ? [ans5, ...spec.acceptedKeywords] : fallbackPuzzle.centerQuestion.acceptedAnswers,
        explanation: exp5,
        sourceFile: 'questions_7b1e9b9b.csv (Đã bổ sung đầy đủ VCNV)',
      };
      questionsMap.set(qid5, centerRec);
      bySub.set('5', centerRec);
    }

    // 3. Ensure CNV Keyword record (-VCNV-CNV) exists
    if (!bySub.has('CNV') && !bySub.has('KEYWORD')) {
      const qidCnv = `${season}-${match}-VCNV-CNV`;
      const kw = spec
        ? spec.keyword.trim().toUpperCase()
        : fallbackPuzzle.keywordDisplay;
      const charCount = kw.replace(/\s+/g, '').length;
      const accepted = spec
        ? spec.acceptedKeywords
        : fallbackPuzzle.acceptedKeywords;
      const expCnv = spec
        ? spec.explanation
        : fallbackPuzzle.summaryExplanation;

      const r1Ans = bySub.get('1')?.officialAnswer || '';
      const r2Ans = bySub.get('2')?.officialAnswer || '';
      const r3Ans = bySub.get('3')?.officialAnswer || '';
      const r4Ans = bySub.get('4')?.officialAnswer || '';
      const r5Ans = bySub.get('5')?.officialAnswer || '';

      const cnvRec: BankQuestionRecord = {
        qid: qidCnv,
        season,
        match,
        round: 'VCNV',
        subCode: 'CNV',
        subjectRaw: 'General/Social',
        categoryVi: categoryTitle,
        question: `[Chủ đề: ${categoryTitle} · Chướng ngại vật gồm ${charCount} chữ cái] Từ 4 hàng ngang (${r1Ans}, ${r2Ans}, ${r3Ans}, ${r4Ans}) và Ô trung tâm (${r5Ans}), hãy tìm Từ khóa Chướng Ngại Vật!`,
        officialAnswer: kw,
        acceptedAnswers: accepted,
        explanation: expCnv,
        sourceFile: 'questions_7b1e9b9b.csv (Đã bổ sung đầy đủ VCNV)',
      };
      questionsMap.set(qidCnv, cnvRec);
    }
  }
}

export interface QuizQuestion {
  id: string;
  category: string;
  question: string;
  answer: string;
  acceptedAnswers: string[];
  options: string[];
  explanation: string;
}

export interface ObstacleRow {
  id: number;
  rowLabel: string;
  charCount: number;
  question: string;
  displayWord: string;
  acceptedAnswers: string[];
  explanation: string;
}

export interface ObstaclePuzzle {
  id: string;
  title: string;
  keywordDisplay: string;
  charCount: number;
  acceptedKeywords: string[];
  imageUrl: string;
  rows: ObstacleRow[];
  centerQuestion: {
    question: string;
    displayWord: string;
    acceptedAnswers: string[];
    explanation: string;
  };
  summaryExplanation: string;
}

export interface AccelerationQuestion {
  id: string;
  number: 1 | 2 | 3 | 4;
  timeLimitSec: number;
  typeLabel: string;
  question: string;
  clues: string[];
  answer: string;
  acceptedAnswers: string[];
  options: string[];
  explanation: string;
}

export interface FinishQuestion extends QuizQuestion {
  points: 20 | 30;
}

export const LAUREL_WREATH_IMG =
  '/src/assets/images/olympia_laurel_wreath_1794066591261.jpg';

export function normalizeViText(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .normalize('NFC')
    .replace(/^(đáp án là|câu trả lời là|đáp án|câu trả lời|là)\s+/i, '')
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'[\]\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeAnswer(input: string): string {
  const cleaned = normalizeViText(input);
  return cleaned
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]/g, '');
}

export function isAnswerMatch(
  userAnswer: string,
  acceptedList: string[],
  officialAnswer?: string
): boolean {
  if (!userAnswer || !userAnswer.trim()) return false;
  const userVi = normalizeViText(userAnswer);
  const userAscii = normalizeAnswer(userAnswer);
  if (!userAscii) return false;

  const candidates = new Set<string>(acceptedList || []);
  if (officialAnswer) {
    candidates.add(officialAnswer);
    // If officialAnswer has parenthetical like "Lý Thái Tổ (Lý Công Uẩn)" or "Bạc (Ag)", accept both parts
    const parenMatch = officialAnswer.match(/^([^(]+)\(([^)]+)\)/);
    if (parenMatch) {
      if (parenMatch[1].trim()) candidates.add(parenMatch[1].trim());
      if (parenMatch[2].trim()) candidates.add(parenMatch[2].trim());
    }
  }

  for (const cand of candidates) {
    if (!cand) continue;
    if (normalizeViText(cand) === userVi) return true;
    if (normalizeAnswer(cand) === userAscii) return true;
  }
  return false;
}

// ==================== PHẦN 1: KHỞI ĐỘNG CÁ NHÂN (24 CÂU CHO 4 NHÀ LEO NÚI, MỖI NGƯỜI 6 CÂU) ====================
export const KHOI_DONG_PERSONAL_QUESTIONS: QuizQuestion[] = [
  // Lượt Thí sinh 1 (Câu 1..6)
  {
    id: 'kd-p1',
    category: 'Toán học',
    question: 'Số nguyên tố chẵn duy nhất trong tập hợp các số tự nhiên là số nào?',
    answer: '2',
    acceptedAnswers: ['2', 'hai', 'so 2'],
    options: ['0', '1', '2', '4'],
    explanation: 'Số 2 là số nguyên tố nhỏ nhất và cũng là số nguyên tố chẵn duy nhất.',
  },
  {
    id: 'kd-p2',
    category: 'Vật lý',
    question: 'Đơn vị đo cường độ dòng điện trong hệ SI được đặt theo tên nhà bác học nào?',
    answer: 'Ampere',
    acceptedAnswers: ['Ampere', 'Ampe', 'A'],
    options: ['Volt', 'Ampere', 'Watt', 'Ohm'],
    explanation: 'Ampe (A) là đơn vị đo cường độ dòng điện trong hệ đo lường quốc tế SI.',
  },
  {
    id: 'kd-p3',
    category: 'Hóa học',
    question: 'Kim loại nào dẫn điện tốt nhất trong tất cả các kim loại ở điều kiện thường?',
    answer: 'Bạc (Ag)',
    acceptedAnswers: ['Bac', 'Ag', 'Bac (Ag)', 'Silver'],
    options: ['Vàng (Au)', 'Đồng (Cu)', 'Bạc (Ag)', 'Nhôm (Al)'],
    explanation: 'Thứ tự dẫn điện giảm dần của kim loại là: Ag (Bạc) > Cu (Đồng) > Au (Vàng) > Al (Nhôm).',
  },
  {
    id: 'kd-p4',
    category: 'Lịch sử',
    question: 'Chiến thắng Bạch Đằng năm 938 chấm dứt hơn 1000 năm Bắc thuộc gắn liền với vị anh hùng nào?',
    answer: 'Ngô Quyền',
    acceptedAnswers: ['Ngo Quyen', 'Tien Ngo Vuong'],
    options: ['Đinh Bộ Lĩnh', 'Ngô Quyền', 'Lê Hoàn', 'Lý Thường Kiệt'],
    explanation: 'Năm 938, Ngô Quyền đại phá quân Nam Hán trên sông Bạch Đằng.',
  },
  {
    id: 'kd-p5',
    category: 'Địa lý',
    question: 'Đỉnh núi Phan Xi Păng — "Nóc nhà Đông Dương" nằm trên dãy núi nào của Việt Nam?',
    answer: 'Hoàng Liên Sơn',
    acceptedAnswers: ['Hoang Lien Son', 'Day Hoang Lien Son'],
    options: ['Trường Sơn Bắc', 'Hoàng Liên Sơn', 'Con Voi', 'Đông Triều'],
    explanation: 'Đỉnh Fansipan cao 3.147,3m nằm trên dãy núi Hoàng Liên Sơn.',
  },
  {
    id: 'kd-p6',
    category: 'Văn học',
    question: 'Tác phẩm "Truyện Kiều" của đại thi hào Nguyễn Du được sáng tác bằng thể thơ nào?',
    answer: 'Lục bát',
    acceptedAnswers: ['Luc bat', 'Tho luc bat'],
    options: ['Song thất lục bát', 'Lục bát', 'Thất ngôn bát cú', 'Tự do'],
    explanation: 'Truyện Kiều gồm 3.254 câu thơ viết theo thể lục bát truyền thống.',
  },

  // Lượt Thí sinh 2 (Câu 7..12)
  {
    id: 'kd-p7',
    category: 'Toán học',
    question: 'Hình đa diện đều có 6 mặt đều là hình vuông được gọi là hình gì?',
    answer: 'Hình lập phương',
    acceptedAnswers: ['Hinh lap phuong', 'Lap phuong', 'Khoi lap phuong'],
    options: ['Hình tứ diện đều', 'Hình lập phương', 'Hình bát diện đều', 'Hình hộp chữ nhật'],
    explanation: 'Hình lập phương là khối đa diện đều loại {4;3} gồm 6 mặt vuông bằng nhau.',
  },
  {
    id: 'kd-p8',
    category: 'Vật lý',
    question: 'Sóng âm không thể truyền được trong môi trường nào sau đây: Rắn, Lỏng, Khí hay Chân không?',
    answer: 'Chân không',
    acceptedAnswers: ['Chan khong'],
    options: ['Chất rắn', 'Chất lỏng', 'Chất khí', 'Chân không'],
    explanation: 'Sóng âm là sóng cơ học nên không truyền được trong chân không.',
  },
  {
    id: 'kd-p9',
    category: 'Hóa học',
    question: 'Nguyên tố hóa học nào có ký hiệu là Fe trong bảng tuần hoàn Mendeleev?',
    answer: 'Sắt',
    acceptedAnswers: ['Sat', 'Iron', 'Fe'],
    options: ['Đồng', 'Sắt', 'Chì', 'Flo'],
    explanation: 'Fe (Ferrum) là ký hiệu hóa học của nguyên tố Sắt (Z = 26).',
  },
  {
    id: 'kd-p10',
    category: 'Lịch sử',
    question: 'Vị vua nào đã ban "Chiếu dời đô" đưa kinh đô từ Hoa Lư (Ninh Bình) về thành Đại La (Thăng Long) năm 1010?',
    answer: 'Lý Thái Tổ (Lý Công Uẩn)',
    acceptedAnswers: ['Ly Thai To', 'Ly Cong Uan', 'Ly Thai To (Ly Cong Uan)'],
    options: ['Đinh Tiên Hoàng', 'Lý Thái Tổ (Lý Công Uẩn)', 'Trần Thái Tông', 'Lê Thái Tổ'],
    explanation: 'Mùa thu năm 1010, vua Lý Thái Tổ (Lý Công Uẩn) dời đô về Thăng Long.',
  },
  {
    id: 'kd-p11',
    category: 'Địa lý',
    question: 'Đồng bằng nào có diện tích lớn nhất nước ta?',
    answer: 'Đồng bằng sông Cửu Long',
    acceptedAnswers: ['Dong bang song Cuu Long', 'DBSCL', 'Song Cuu Long'],
    options: ['Đồng bằng sông Hồng', 'Đồng bằng sông Cửu Long', 'Đồng bằng Thanh - Nghệ - Tĩnh', 'Đồng bằng Tuy Hòa'],
    explanation: 'Đồng bằng sông Cửu Long rộng khoảng 40.000 km², lớn nhất Việt Nam.',
  },
  {
    id: 'kd-p12',
    category: 'Văn học',
    question: 'Nhân vật "Dế Mèn" trong tác phẩm "Dế Mèn phiêu lưu ký" là sáng tạo của nhà văn nào?',
    answer: 'Tô Hoài',
    acceptedAnswers: ['To Hoai'],
    options: ['Nguyễn Công Hoan', 'Tô Hoài', 'Vũ Trọng Phụng', 'Kim Lân'],
    explanation: 'Tô Hoài là tác giả của truyện đồng thoại nổi tiếng Dế Mèn phiêu lưu ký (1941).',
  },

  // Lượt Thí sinh 3 (Câu 13..18)
  {
    id: 'kd-p13',
    category: 'Toán học',
    question: 'Căn bậc hai số học của 144 bằng bao nhiêu?',
    answer: '12',
    acceptedAnswers: ['12', 'muoi hai'],
    options: ['11', '12', '13', '14'],
    explanation: 'Vì 12 > 0 và 12² = 144 nên căn bậc hai số học của 144 là 12.',
  },
  {
    id: 'kd-p14',
    category: 'Sinh học',
    question: 'Nhóm máu nào trong hệ thống nhóm máu ABO được gọi là nhóm máu "chuyên cho" hồng cầu?',
    answer: 'Nhóm máu O',
    acceptedAnswers: ['O', 'Nhom mau O', 'Mau O'],
    options: ['Nhóm máu A', 'Nhóm máu B', 'Nhóm máu AB', 'Nhóm máu O'],
    explanation: 'Hồng cầu nhóm máu O không có kháng nguyên A và B trên bề mặt nên truyền được cho các nhóm khác.',
  },
  {
    id: 'kd-p15',
    category: 'Hóa học',
    question: 'Khí Cacbonic (CO2) ở trạng thái rắn được nén lạnh dùng để tạo khói sân khấu và bảo quản thực phẩm thường gọi là gì?',
    answer: 'Đá khô',
    acceptedAnswers: ['Da kho', 'Bang kho'],
    options: ['Đá vôi', 'Đá khô', 'Thạch cao', 'Phèn chua'],
    explanation: 'CO2 rắn thăng hoa trực tiếp thành khí ở -78,5°C nên được gọi là đá khô.',
  },
  {
    id: 'kd-p16',
    category: 'Lịch sử',
    question: 'Hội nghị Diên Hồng năm 1284 tập hợp các bô lão cả nước bàn kế đánh giặc Nguyên Mông diễn ra dưới triều đại nào?',
    answer: 'Nhà Trần',
    acceptedAnswers: ['Nha Tran', 'Trieu Tran', 'Tran'],
    options: ['Nhà Lý', 'Nhà Trần', 'Nhà Hồ', 'Nhà Hậu Lê'],
    explanation: 'Hội nghị Diên Hồng do Thượng hoàng Trần Thánh Tông triệu tập năm 1284.',
  },
  {
    id: 'kd-p17',
    category: 'Địa lý',
    question: 'Quốc gia nào có diện tích lãnh thổ lớn nhất thế giới?',
    answer: 'Liên bang Nga',
    acceptedAnswers: ['Nga', 'Lien bang Nga', 'Russia'],
    options: ['Canada', 'Hoa Kỳ', 'Trung Quốc', 'Liên bang Nga'],
    explanation: 'Liên bang Nga có diện tích hơn 17 triệu km², lớn nhất thế giới.',
  },
  {
    id: 'kd-p18',
    category: 'Tiếng Anh',
    question: 'How many continents are there in the world according to the standard 7-continent model?',
    answer: '7',
    acceptedAnswers: ['7', 'seven', 'bay'],
    options: ['5', '6', '7', '8'],
    explanation: 'Mô hình 7 châu lục chuẩn quốc tế gồm Asia, Africa, North America, South America, Antarctica, Europe, Australia.',
  },

  // Lượt Thí sinh 4 (Câu 19..24)
  {
    id: 'kd-p19',
    category: 'Toán học',
    question: 'Một giờ có 60 phút. Hỏi 1,5 giờ có tất cả bao nhiêu phút?',
    answer: '90',
    acceptedAnswers: ['90', '90 phut', 'chin muoi'],
    options: ['75', '80', '90', '100'],
    explanation: '1,5 × 60 = 90 phút.',
  },
  {
    id: 'kd-p20',
    category: 'Vật lý',
    question: 'Dụng cụ quang học nào dùng để phân tích chùm ánh sáng phức tạp thành các thành phần đơn sắc?',
    answer: 'Máy quang phổ (Lăng kính)',
    acceptedAnswers: ['May quang pho', 'Lang kinh', 'May quang pho (Lang kinh)'],
    options: ['Kính lúp', 'Kính hiển vi', 'Máy quang phổ (Lăng kính)', 'Gương cầu lồi'],
    explanation: 'Máy quang phổ lăng kính sử dụng hiện tượng tán sắc để phân tích chùm sáng.',
  },
  {
    id: 'kd-p21',
    category: 'Sinh học',
    question: 'Vitamin nào được cơ thể người tổng hợp dưới da khi tiếp xúc với tia tử ngoại (UVB) của ánh nắng mặt trời buổi sớm?',
    answer: 'Vitamin D',
    acceptedAnswers: ['Vitamin D', 'D'],
    options: ['Vitamin A', 'Vitamin C', 'Vitamin D', 'Vitamin K'],
    explanation: 'Vitamin D giúp tăng cường hấp thụ canxi và được tổng hợp ở da nhờ ánh nắng.',
  },
  {
    id: 'kd-p22',
    category: 'Lịch sử',
    question: 'Phong trào Tây Sơn khởi nghĩa vào mùa xuân năm 1771 bắt nguồn từ tỉnh nào của nước ta hiện nay?',
    answer: 'Bình Định',
    acceptedAnswers: ['Binh Dinh'],
    options: ['Quảng Ngãi', 'Bình Định', 'Phú Yên', 'Gia Lai'],
    explanation: 'Ba anh em Nguyễn Nhạc, Nguyễn Huệ, Nguyễn Lữ dựng cờ khởi nghĩa tại ấp Tây Sơn (Bình Định).',
  },
  {
    id: 'kd-p23',
    category: 'Địa lý',
    question: 'Hồ nước ngọt tự nhiên lớn nhất vùng Tây Bắc nằm trên địa phận tỉnh Bắc Kạn có tên là gì?',
    answer: 'Hồ Ba Bể',
    acceptedAnswers: ['Ho Ba Be', 'Ba Be'],
    options: ['Hồ Thác Bà', 'Hồ Ba Bể', 'Hồ Núi Cốc', 'Hồ Hòa Bình'],
    explanation: 'Hồ Ba Bể thuộc tỉnh Bắc Kạn là một trong 100 hồ nước ngọt tự nhiên lớn nhất thế giới nằm trên núi.',
  },
  {
    id: 'kd-p24',
    category: 'Văn học',
    question: 'Bài thơ "Sóng" — một kiệt tác thơ tình hiện đại Việt Nam năm 1967 — là sáng tác của nữ thi sĩ nào?',
    answer: 'Xuân Quỳnh',
    acceptedAnswers: ['Xuan Quynh'],
    options: ['Đoàn Thị Điểm', 'Hồ Xuân Hương', 'Xuân Quỳnh', 'Ý Nhi'],
    explanation: 'Xuân Quỳnh sáng tác bài thơ "Sóng" trong chuyến thực tế tại vùng biển Diêm Điền năm 1967.',
  },
];

// ==================== PHẦN 1B: KHỞI ĐỘNG CHUNG (12 CÂU BẤM CHUÔNG) ====================
export const KHOI_DONG_COMMON_QUESTIONS: QuizQuestion[] = [
  {
    id: 'kd-c1',
    category: 'Sinh học',
    question: 'Bào quan nào được ví là "nhà máy phát điện" cung cấp năng lượng ATP cho tế bào nhân thực?',
    answer: 'Ti thể',
    acceptedAnswers: ['Ti the', 'Ty the', 'Mitochondria'],
    options: ['Lục lạp', 'Ti thể', 'Ribosome', 'Bộ máy Golgi'],
    explanation: 'Ti thể là nơi diễn ra quá trình hô hấp tế bào tạo ra phần lớn ATP.',
  },
  {
    id: 'kd-c2',
    category: 'Tiếng Anh',
    question: 'In English, what is the past participle (V3) form of the irregular verb "WRITE"?',
    answer: 'Written',
    acceptedAnswers: ['Written'],
    options: ['Wrote', 'Written', 'Writing', 'Writes'],
    explanation: 'Ba dạng của động từ là Write - Wrote - Written.',
  },
  {
    id: 'kd-c3',
    category: 'Thể thao',
    question: 'Môn thể thao vua (Bóng đá) thi đấu trên sân cỏ tiêu chuẩn gồm tối đa bao nhiêu cầu thủ mỗi đội trên sân?',
    answer: '11',
    acceptedAnswers: ['11', 'muoi mot'],
    options: ['7', '9', '11', '12'],
    explanation: 'Mỗi đội bóng đá tiêu chuẩn có 11 cầu thủ trên sân bao gồm 1 thủ môn.',
  },
  {
    id: 'kd-c4',
    category: 'Nghệ thuật',
    question: 'Bức họa nổi tiếng "Mona Lisa" đang được trưng bày tại bảo tàng Louvre là kiệt tác của danh họa nào?',
    answer: 'Leonardo da Vinci',
    acceptedAnswers: ['Leonardo da Vinci', 'Da Vinci', 'Leonardo'],
    options: ['Vincent van Gogh', 'Pablo Picasso', 'Leonardo da Vinci', 'Michelangelo'],
    explanation: 'Leonardo da Vinci vẽ bức chân dung Mona Lisa vào đầu thế kỷ XVI thời kỳ Phục Hưng.',
  },
  {
    id: 'kd-c5',
    category: 'Toán học',
    question: 'Tổng số đo ba góc trong một tam giác phẳng theo hình học Euclid bằng bao nhiêu độ?',
    answer: '180',
    acceptedAnswers: ['180', '180 do'],
    options: ['90', '180', '270', '360'],
    explanation: 'Tổng ba góc trong một tam giác phẳng luôn bằng 180 độ.',
  },
  {
    id: 'kd-c6',
    category: 'Lịch sử',
    question: 'Bác Hồ đọc bản Tuyên ngôn Độc lập khai sinh nước Việt Nam Dân chủ Cộng hòa tại Quảng trường Ba Đình vào ngày tháng năm nào?',
    answer: '02/09/1945',
    acceptedAnswers: ['2/9/1945', '02/09/1945', '2 thang 9 nam 1945', '02091945'],
    options: ['19/08/1945', '02/09/1945', '07/05/1954', '30/04/1975'],
    explanation: 'Ngày 2/9/1945 tại Quảng trường Ba Đình (Hà Nội), Chủ tịch Hồ Chí Minh đọc Tuyên ngôn Độc lập.',
  },
  {
    id: 'kd-c7',
    category: 'Địa lý',
    question: 'Châu lục nào có diện tích lớn nhất trên Trái Đất?',
    answer: 'Châu Á',
    acceptedAnswers: ['Chau A', 'A', 'Asia'],
    options: ['Châu Phi', 'Châu Mỹ', 'Châu Á', 'Châu Âu'],
    explanation: 'Châu Á có diện tích khoảng 44,58 triệu km², lớn nhất trong 6 châu lục.',
  },
  {
    id: 'kd-c8',
    category: 'Vật lý',
    question: 'Hiện tượng ánh sáng trắng bị tách thành dải màu cầu vồng khi đi qua lăng kính gọi là hiện tượng gì?',
    answer: 'Tán sắc ánh sáng',
    acceptedAnswers: ['Tan sac anh sang', 'Tan sac'],
    options: ['Giao thoa ánh sáng', 'Nhiễu xạ ánh sáng', 'Tán sắc ánh sáng', 'Phản xạ toàn phần'],
    explanation: 'Thí nghiệm của Newton chứng minh hiện tượng tán sắc ánh sáng qua lăng kính.',
  },
  {
    id: 'kd-c9',
    category: 'Hóa học',
    question: 'Khí nào chiếm tỷ lệ thể tích lớn nhất (khoảng 78%) trong bầu khí quyển Trái Đất?',
    answer: 'Nitơ (N2)',
    acceptedAnswers: ['Nito', 'Nitrogen', 'N2', 'Nito (N2)'],
    options: ['Oxy (O2)', 'Nitơ (N2)', 'Cacbonic (CO2)', 'Argon (Ar)'],
    explanation: 'Khí quyển khô của Trái Đất chứa khoảng 78% Nitơ và 21% Oxy.',
  },
  {
    id: 'kd-c10',
    category: 'Hiểu biết chung',
    question: 'Biểu tượng chiến thắng cao quý nhất trao cho nhà vô địch chương trình Đường Lên Đỉnh Olympia là gì?',
    answer: 'Vòng nguyệt quế',
    acceptedAnswers: ['Vong nguyet que', 'Nguyet que'],
    options: ['Cúp Pha Lê', 'Vòng nguyệt quế', 'Huy chương Vàng', 'Quả cầu Vàng'],
    explanation: 'Vòng nguyệt quế là biểu tượng vinh quang gắn liền với Đường Lên Đỉnh Olympia từ năm 1999.',
  },
  {
    id: 'kd-c11',
    category: 'Văn học',
    question: 'Nhân vật "Chí Phèo" trong truyện ngắn cùng tên của nhà văn Nam Cao sống ở ngôi làng hư cấu nào?',
    answer: 'Làng Vũ Đại',
    acceptedAnswers: ['Lang Vu Dai', 'Vu Dai'],
    options: ['Làng Đông Xá', 'Làng Vũ Đại', 'Làng Chợ Dầu', 'Làng Xốm'],
    explanation: 'Làng Vũ Đại là không gian nghệ thuật điển hình trong tác phẩm Chí Phèo của Nam Cao.',
  },
  {
    id: 'kd-c12',
    category: 'Tin học',
    question: 'Một Byte trong bộ nhớ máy tính tiêu chuẩn bằng bao nhiêu Bit?',
    answer: '8',
    acceptedAnswers: ['8', '8 bit', 'tam'],
    options: ['4', '8', '16', '32'],
    explanation: '1 Byte = 8 Bits.',
  },
];

// ==================== PHẦN 2: VƯỢT CHƯỚNG NGẠI VẬT ====================
export const OBSTACLE_PUZZLES: ObstaclePuzzle[] = [
  {
    id: 'vcnv-1',
    title: 'Di sản Thiên nhiên Thế giới',
    keywordDisplay: 'VỊNH HẠ LONG',
    charCount: 10,
    acceptedKeywords: ['Vinh Ha Long', 'Ha Long'],
    imageUrl: '/src/assets/images/olympia_obstacle_halong_1794066589379.jpg',
    rows: [
      {
        id: 1,
        rowLabel: 'Hàng ngang số 1',
        charCount: 9,
        question:
          'Hàng ngang số 1 (9 chữ cái): Tỉnh ven biển vùng Đông Bắc Bộ Việt Nam có thành phố Cẩm Phả, Uông Bí, Móng Cái và đảo Cô Tô?',
        displayWord: 'QUẢNG NINH',
        acceptedAnswers: ['Quang Ninh'],
        explanation: 'Quảng Ninh là tỉnh địa đầu vùng Đông Bắc, nơi sở hữu Vịnh Hạ Long.',
      },
      {
        id: 2,
        rowLabel: 'Hàng ngang số 2',
        charCount: 5,
        question:
          'Hàng ngang số 2 (5 chữ cái): Loại đá trầm tích có thành phần chủ yếu là canxi cacbonat (CaCO3), tạo nên địa hình Karst hùng vĩ và các hang động thạch nhũ?',
        displayWord: 'ĐÁ VÔI',
        acceptedAnswers: ['Da voi'],
        explanation: 'Hệ thống đảo đá và hang động trên Vịnh Hạ Long được hình thành từ kiến tạo đá vôi Karst.',
      },
      {
        id: 3,
        rowLabel: 'Hàng ngang số 3',
        charCount: 6,
        question:
          'Hàng ngang số 3 (6 chữ cái): Tên viết tắt bằng tiếng Anh của Tổ chức Giáo dục, Khoa học và Văn hóa Liên Hợp Quốc?',
        displayWord: 'UNESCO',
        acceptedAnswers: ['UNESCO'],
        explanation: 'UNESCO đã nhiều lần công nhận Vịnh Hạ Long là Di sản Thiên nhiên Thế giới.',
      },
      {
        id: 4,
        rowLabel: 'Hàng ngang số 4',
        charCount: 8,
        question:
          'Hàng ngang số 4 (8 chữ cái): Hòn đảo nổi tiếng gồm hai phiến đá hướng vào nhau trên mặt biển, được chọn làm biểu tượng của du lịch Hạ Long (còn gọi là Hòn Gà Chọi)?',
        displayWord: 'TRỐNG MÁI',
        acceptedAnswers: ['Trong Mai', 'Hon Trong Mai'],
        explanation: 'Hòn Trống Mái (Hòn Gà Chọi) là biểu tượng nổi tiếng giữa lòng Vịnh Hạ Long.',
      },
    ],
    centerQuestion: {
      question:
        'Câu hỏi Ô Trung Tâm (6 chữ cái): Theo truyền thuyết dân gian Việt Nam, đàn con vật thần thoại nào đã đáp xuống vùng biển Đông Bắc phun châu nhả ngọc tạo thành bức tường thành đảo đá ngăn giặc ngoại xâm?',
      displayWord: 'RỒNG MẸ',
      acceptedAnswers: ['Rong Me', 'Con Rong', 'Rong'],
      explanation: 'Tên gọi "Hạ Long" có nghĩa là nơi Rồng đáp xuống.',
    },
    summaryExplanation:
      'Chướng ngại vật là VỊNH HẠ LONG (10 chữ cái) — Di sản Thiên nhiên Thế giới thuộc tỉnh Quảng Ninh với gần 2.000 hòn đảo đá vôi kỳ vĩ.',
  },
  {
    id: 'vcnv-2',
    title: 'Di sản Văn hóa Thế giới',
    keywordDisplay: 'PHỐ CỔ HỘI AN',
    charCount: 10,
    acceptedKeywords: ['Pho co Hoi An', 'Hoi An'],
    imageUrl: '/src/assets/images/olympia_obstacle_hoian_1794066590752.jpg',
    rows: [
      {
        id: 1,
        rowLabel: 'Hàng ngang số 1',
        charCount: 8,
        question:
          'Hàng ngang số 1 (8 chữ cái): Tỉnh thuộc vùng Duyên hải Nam Trung Bộ có Thánh địa Mỹ Sơn và Cù Lao Chàm?',
        displayWord: 'QUẢNG NAM',
        acceptedAnswers: ['Quang Nam'],
        explanation: 'Quảng Nam là vùng đất sở hữu hai Di sản Văn hóa Thế giới là Hội An và Mỹ Sơn.',
      },
      {
        id: 2,
        rowLabel: 'Hàng ngang số 2',
        charCount: 7,
        question:
          'Hàng ngang số 2 (7 chữ cái): Vật dụng chiếu sáng truyền thống làm bằng khung tre bọc lụa nhiều màu sắc, thắp sáng rực rỡ các con phố cổ vào mỗi đêm rằm?',
        displayWord: 'ĐÈN LỒNG',
        acceptedAnswers: ['Den long', 'Long den'],
        explanation: 'Đèn lồng lụa là nét đặc trưng văn hóa nổi bật của Phố cổ Hội An.',
      },
      {
        id: 3,
        rowLabel: 'Hàng ngang số 3',
        charCount: 7,
        question:
          'Hàng ngang số 3 (7 chữ cái): Công trình kiến trúc biểu tượng có mái che bắc qua một con lạch nhỏ, được in trên tờ tiền polymer mệnh giá 20.000 đồng của Việt Nam?',
        displayWord: 'CHÙA CẦU',
        acceptedAnswers: ['Chua Cau', 'Lai Vien Kieu'],
        explanation: 'Chùa Cầu (Lai Viễn Kiều) là viên ngọc kiến trúc nằm ở trung tâm Phố cổ Hội An.',
      },
      {
        id: 4,
        rowLabel: 'Hàng ngang số 4',
        charCount: 6,
        question:
          'Hàng ngang số 4 (6 chữ cái): Tên con sông lớn chảy qua địa phận tỉnh Quảng Nam, nơi có nhánh sông Hoài thơ mộng chảy qua lòng phố cổ?',
        displayWord: 'THU BỒN',
        acceptedAnswers: ['Thu Bon', 'Song Thu Bon'],
        explanation: 'Sông Hoài là một nhánh của dòng sông Thu Bồn gắn liền với thương cảng Hội An xưa.',
      },
    ],
    centerQuestion: {
      question:
        'Câu hỏi Ô Trung Tâm (10 chữ cái): Vào thế kỷ XVI - XVII, nơi đây từng là một ... quốc tế sầm uất bậc nhất Đông Nam Á, nơi thuyền buôn Nhật Bản, Trung Hoa và phương Tây tấp nập giao thương?',
      displayWord: 'THƯƠNG CẢNG',
      acceptedAnswers: ['Thuong cang', 'Cang thi'],
      explanation: 'Hội An từng là thương cảng quốc tế phồn thịnh của xứ Đàng Trong.',
    },
    summaryExplanation:
      'Chướng ngại vật là PHỐ CỔ HỘI AN (10 chữ cái) — Thương cảng cổ bên dòng sông Thu Bồn thuộc tỉnh Quảng Nam.',
  },
  {
    id: 'vcnv-3',
    title: 'Bảo vật Quốc gia & Văn minh Việt cổ',
    keywordDisplay: 'TRỐNG ĐỒNG ĐÔNG SƠN',
    charCount: 16,
    acceptedKeywords: ['Trong dong Dong Son', 'Trong dong'],
    imageUrl: '/src/assets/images/olympia_obstacle_dongson_1794066591077.jpg',
    rows: [
      {
        id: 1,
        rowLabel: 'Hàng ngang số 1',
        charCount: 7,
        question:
          'Hàng ngang số 1 (7 chữ cái): Quốc hiệu đầu tiên của nước ta dưới thời các Vua Hùng dựng nước?',
        displayWord: 'VĂN LANG',
        acceptedAnswers: ['Van Lang'],
        explanation: 'Nhà nước Văn Lang của các Vua Hùng là cái nôi của nền văn hóa Đông Sơn.',
      },
      {
        id: 2,
        rowLabel: 'Hàng ngang số 2',
        charCount: 7,
        question:
          'Hàng ngang số 2 (7 chữ cái): Loài chim huyền thoại có sải cánh rộng được chạm khắc bay ngược chiều kim đồng hồ trên mặt các cổ vật thời Hùng Vương?',
        displayWord: 'CHIM LẠC',
        acceptedAnswers: ['Chim Lac', 'Lac'],
        explanation: 'Hình tượng Chim Lạc trên mặt trống đồng biểu trưng cho khát vọng vươn cao của người Việt cổ.',
      },
      {
        id: 3,
        rowLabel: 'Hàng ngang số 3',
        charCount: 9,
        question:
          'Hàng ngang số 3 (9 chữ cái): Tỉnh Bắc Trung Bộ nơi có sông Mã chảy qua và là nơi phát hiện di chỉ khảo cổ học Đông Sơn nổi tiếng thế giới?',
        displayWord: 'THANH HÓA',
        acceptedAnswers: ['Thanh Hoa'],
        explanation: 'Làng cổ Đông Sơn nằm bên bờ sông Mã thuộc tỉnh Thanh Hóa.',
      },
      {
        id: 4,
        rowLabel: 'Hàng ngang số 4',
        charCount: 6,
        question:
          'Hàng ngang số 4 (6 chữ cái): Tên chiếc cổ vật tiêu biểu nhất được phát hiện tại Hà Nam năm 1893, hiện lưu giữ tại Bảo tàng Lịch sử Quốc gia (Trống đồng ...)?',
        displayWord: 'NGỌC LŨ',
        acceptedAnswers: ['Ngoc Lu', 'Trong dong Ngoc Lu'],
        explanation: 'Trống đồng Ngọc Lũ là chiếc trống đồng nguyên vẹn và tinh xảo bậc nhất của văn hóa Đông Sơn.',
      },
    ],
    centerQuestion: {
      question:
        'Câu hỏi Ô Trung Tâm (7 chữ cái): Hình tượng ngôi sao nhiều cánh ở chính giữa mặt cổ vật này tượng trưng cho thiên thể nào được cư dân nông nghiệp trồng lúa nước tôn sùng?',
      displayWord: 'MẶT TRỜI',
      acceptedAnswers: ['Mat troi'],
      explanation: 'Ngôi sao 12 hoặc 14 cánh ở tâm mặt trống đồng tượng trưng cho Mặt Trời chiếu sáng.',
    },
    summaryExplanation:
      'Chướng ngại vật là TRỐNG ĐỒNG ĐÔNG SƠN (16 chữ cái) — Biểu tượng đỉnh cao của kỹ thuật đúc đồng và nền văn minh Văn Lang - Âu Lạc.',
  },
];

// ==================== PHẦN 3: TĂNG TỐC ====================
export const TANG_TOC_QUESTIONS: AccelerationQuestion[] = [
  {
    id: 'tt-1',
    number: 1,
    timeLimitSec: 15,
    typeLabel: 'Câu 1 · Sắp xếp thứ tự thời gian',
    question:
      'Hãy sắp xếp các triều đại phong kiến Việt Nam sau theo đúng trình tự thời gian từ SỚM NHẤT đến MUỘN NHẤT (nhập hoặc chọn chuỗi 4 chữ cái, ví dụ: CBAD):',
    clues: [
      'A. Nhà Trần (1225 – 1400)',
      'B. Nhà Lý (1009 – 1225)',
      'C. Nhà Đinh (968 – 980)',
      'D. Nhà Hậu Lê (1428 – 1789)',
    ],
    answer: 'CBAD',
    acceptedAnswers: ['CBAD', 'C B A D', 'C-B-A-D'],
    options: ['CBAD', 'BCAD', 'CABD', 'ABCD'],
    explanation: 'Thứ tự lịch sử đúng: Nhà Đinh (C) -> Nhà Lý (B) -> Nhà Trần (A) -> Nhà Hậu Lê (D).',
  },
  {
    id: 'tt-2',
    number: 2,
    timeLimitSec: 20,
    typeLabel: 'Câu 2 · Tư duy quy luật Toán học',
    question:
      'Tìm số thích hợp điền vào dấu chấm hỏi (?) trong dãy số quy luật sau:',
    clues: [
      'Dãy số:  2   →   6   →   12   →   20   →   30   →   ?',
      'Gợi ý quy luật: 1×2, 2×3, 3×4, 4×5, 5×6, ...',
    ],
    answer: '42',
    acceptedAnswers: ['42', 'bon muoi hai'],
    options: ['36', '40', '42', '48'],
    explanation: 'Quy luật: Số thứ n bằng n × (n + 1). Số thứ 6 là 6 × 7 = 42.',
  },
  {
    id: 'tt-3',
    number: 3,
    timeLimitSec: 30,
    typeLabel: 'Câu 3 · Nhận diện Địa danh qua 4 dữ kiện',
    question:
      'Từ 4 dữ kiện sau đây, hãy cho biết đây là thành phố nào của Việt Nam?',
    clues: [
      'Dữ kiện 1: Thành phố trực thuộc Trung ương nằm ở trung độ của cả nước.',
      'Dữ kiện 2: Có bán đảo Sơn Trà và danh thắng Ngũ Hành Sơn.',
      'Dữ kiện 3: Nổi tiếng với những cây cầu bắc qua sông Hàn (Cầu Rồng, Cầu Quay Sông Hàn, Cầu Trần Thị Lý).',
      'Dữ kiện 4: Nơi đăng cai Lễ hội Pháo hoa Quốc tế (DIFF) thường niên.',
    ],
    answer: 'Đà Nẵng',
    acceptedAnswers: ['Da Nang', 'TP Da Nang', 'Thanh pho Da Nang'],
    options: ['Nha Trang', 'Đà Nẵng', 'Huế', 'Quy Nhơn'],
    explanation: 'Đà Nẵng là thành phố bên bờ sông Hàn nổi tiếng với Cầu Rồng, Ngũ Hành Sơn và bán đảo Sơn Trà.',
  },
  {
    id: 'tt-4',
    number: 4,
    timeLimitSec: 30,
    typeLabel: 'Câu 4 · Suy luận Khoa học & Phát minh',
    question:
      'Dựa vào các mốc sự kiện khoa học sau, hãy cho biết tên nhà bác học vĩ đại này là ai?',
    clues: [
      'Dữ kiện 1: Sinh tại thành phố Ulm (Đức) ngày 14/03/1879 — trùng với Ngày số Pi.',
      'Dữ kiện 2: Năm 1905 ("Năm kỳ diệu"), ông công bố Thuyết tương đối hẹp và công thức nổi tiếng E = mc².',
      'Dữ kiện 3: Năm 1915, ông hoàn thiện Thuyết tương đối rộng mô tả lực hấp dẫn là sự uốn cong không-thời gian.',
      'Dữ kiện 4: Nhận giải Nobel Vật lý năm 1921 nhờ giải thích hiệu ứng quang điện.',
    ],
    answer: 'Albert Einstein',
    acceptedAnswers: ['Albert Einstein', 'Einstein', 'Anhxtanh'],
    options: ['Isaac Newton', 'Nikola Tesla', 'Albert Einstein', 'Niels Bohr'],
    explanation: 'Albert Einstein (1879–1955) là cha đẻ của Thuyết tương đối và công thức E = mc².',
  },
];

// ==================== PHẦN 4: VỀ ĐÍCH (12 CÂU 20Đ & 12 CÂU 30Đ CHO ĐỦ 4 NGƯỜI CHƠI) ====================
export const VE_DICH_20_QUESTIONS: FinishQuestion[] = [
  {
    id: 'vd20-1',
    points: 20,
    category: 'Vật lý · 20 điểm',
    question: 'Trong chân không, sóng điện từ lan truyền với tốc độ xấp xỉ bao nhiêu nghìn km/giây?',
    answer: '300.000 km/s',
    acceptedAnswers: ['300000', '300.000', '300 nghin', '300000 km/s', '3x10^8'],
    options: ['150.000 km/s', '300.000 km/s', '340 km/s', '500.000 km/s'],
    explanation: 'Sóng điện từ truyền trong chân không với vận tốc ánh sáng c ≈ 300.000 km/s.',
  },
  {
    id: 'vd20-2',
    points: 20,
    category: 'Lịch sử · 20 điểm',
    question: 'Chiến dịch Điện Biên Phủ năm 1954 kéo dài trong bao nhiêu ngày đêm?',
    answer: '56 ngày đêm',
    acceptedAnswers: ['56', '56 ngay dem'],
    options: ['30 ngày đêm', '45 ngày đêm', '56 ngày đêm', '60 ngày đêm'],
    explanation: 'Chiến dịch Điện Biên Phủ diễn ra trong 56 ngày đêm (từ 13/3 đến 7/5/1954).',
  },
  {
    id: 'vd20-3',
    points: 20,
    category: 'Hóa học · 20 điểm',
    question: 'Kim loại duy nhất nào tồn tại ở trạng thái lỏng ở điều kiện nhiệt độ và áp suất phòng tiêu chuẩn?',
    answer: 'Thủy ngân (Hg)',
    acceptedAnswers: ['Thuy ngan', 'Hg', 'Thuy ngan (Hg)', 'Mercury'],
    options: ['Natri (Na)', 'Thủy ngân (Hg)', 'Chì (Pb)', 'Kẽm (Zn)'],
    explanation: 'Thủy ngân (Hg) có nhiệt độ nóng chảy -38,83°C nên ở trạng thái lỏng ở điều kiện thường.',
  },
  {
    id: 'vd20-4',
    points: 20,
    category: 'Địa lý · 20 điểm',
    question: 'Đường bờ biển của đất nước Việt Nam dài khoảng bao nhiêu km (tính từ Móng Cái đến Hà Tiên)?',
    answer: '3.260 km',
    acceptedAnswers: ['3260', '3.260', '3260 km', '3.260 km'],
    options: ['2.150 km', '3.260 km', '4.120 km', '5.000 km'],
    explanation: 'Đường bờ biển Việt Nam dài 3.260 km trải dài qua 28 tỉnh, thành phố ven biển.',
  },
  {
    id: 'vd20-5',
    points: 20,
    category: 'Sinh học · 20 điểm',
    question: 'Ở người trưởng thành bình thường, bộ nhiễm sắc thể lưỡng bội (2n) trong mỗi tế bào sinh dưỡng có bao nhiêu nhiễm sắc thể?',
    answer: '46',
    acceptedAnswers: ['46', '46 NST', '23 cap'],
    options: ['23', '44', '46', '48'],
    explanation: 'Bộ nhiễm sắc thể lưỡng bội của người là 2n = 46 (gồm 23 cặp NST).',
  },
  {
    id: 'vd20-6',
    points: 20,
    category: 'Văn học · 20 điểm',
    question: 'Bài thơ "Tây Tiến" với câu thơ hào hoa "Tây Tiến đoàn binh không mọc tóc" là sáng tác của nhà thơ nào?',
    answer: 'Quang Dũng',
    acceptedAnswers: ['Quang Dung'],
    options: ['Chính Hữu', 'Quang Dũng', 'Tố Hữu', 'Hữu Loan'],
    explanation: 'Nhà thơ Quang Dũng sáng tác bài thơ Tây Tiến năm 1948 tại Phù Lưu Chanh.',
  },
  {
    id: 'vd20-7',
    points: 20,
    category: 'Toán học · 20 điểm',
    question: 'Đồ thị của hàm số bậc hai y = ax² + bx + c (với a ≠ 0) trong mặt phẳng tọa độ Oxy là đường cong có tên gọi là gì?',
    answer: 'Parabol',
    acceptedAnswers: ['Parabol', 'Duong Parabol'],
    options: ['Đường thẳng', 'Parabol', 'Hyperbol', 'Đường tròn'],
    explanation: 'Đồ thị hàm số bậc hai y = ax² + bx + c (a ≠ 0) luôn là một đường Parabol.',
  },
  {
    id: 'vd20-8',
    points: 20,
    category: 'Lịch sử · 20 điểm',
    question: 'Cuộc Tổng tiến công và nổi dậy mùa Xuân năm 1975 đỉnh cao là Chiến dịch mang tên vị lãnh tụ nào?',
    answer: 'Chiến dịch Hồ Chí Minh',
    acceptedAnswers: ['Chien dich Ho Chi Minh', 'Ho Chi Minh'],
    options: ['Chiến dịch Tây Nguyên', 'Chiến dịch Huế - Đà Nẵng', 'Chiến dịch Hồ Chí Minh', 'Chiến dịch Đường 9'],
    explanation: 'Chiến dịch Hồ Chí Minh lịch sử toàn thắng trưa ngày 30/4/1975 thống nhất đất nước.',
  },
  {
    id: 'vd20-9',
    points: 20,
    category: 'Địa lý · 20 điểm',
    question: 'Sông Mê Kông khi chảy vào lãnh thổ Việt Nam tại vùng Đồng bằng sông Cửu Long thì chia làm hai nhánh chính là sông Tiền và sông gì?',
    answer: 'Sông Hậu',
    acceptedAnswers: ['Song Hau', 'Hau Giang', 'Hau'],
    options: ['Sông Vàm Cỏ', 'Sông Hậu', 'Sông Đồng Nai', 'Sông Sài Gòn'],
    explanation: 'Sông Mê Kông chảy vào Việt Nam theo hai nhánh chính là Tiền Giang (sông Tiền) và Hậu Giang (sông Hậu).',
  },
  {
    id: 'vd20-10',
    points: 20,
    category: 'Vật lý · 20 điểm',
    question: 'Kính thiên văn học hoặc gương chiếu hậu ô tô thường sử dụng loại gương cầu nào để mở rộng vùng quan sát?',
    answer: 'Gương cầu lồi',
    acceptedAnswers: ['Guong cau loi', 'Cau loi'],
    options: ['Gương phẳng', 'Gương cầu lồi', 'Gương cầu lõm', 'Thấu kính hội tụ'],
    explanation: 'Gương cầu lồi có thị trường (vùng nhìn thấy) rộng hơn gương phẳng có cùng kích thước.',
  },
  {
    id: 'vd20-11',
    points: 20,
    category: 'Hóa học · 20 điểm',
    question: 'Dung dịch làm giấy quỳ tím chuyển sang màu xanh có môi trường axit, bazơ (kiềm) hay trung tính?',
    answer: 'Bazơ (Kiềm)',
    acceptedAnswers: ['Bazo', 'Kiem', 'Bazo (Kiem)'],
    options: ['Axit', 'Bazơ (Kiềm)', 'Trung tính', 'Lưỡng tính'],
    explanation: 'Dung dịch bazơ (kiềm, pH > 7) làm quỳ tím hóa xanh; axit làm quỳ tím hóa đỏ.',
  },
  {
    id: 'vd20-12',
    points: 20,
    category: 'Hiểu biết chung · 20 điểm',
    question: 'Tổ chức Hiệp ước Bắc Đại Tây Dương viết tắt bằng tiếng Anh là NATO, còn Hiệp hội các quốc gia Đông Nam Á viết tắt là gì?',
    answer: 'ASEAN',
    acceptedAnswers: ['ASEAN'],
    options: ['APEC', 'ASEAN', 'UNESCO', 'UNICEF'],
    explanation: 'ASEAN (Association of Southeast Asian Nations) được thành lập ngày 8/8/1967.',
  },
];

export const VE_DICH_30_QUESTIONS: FinishQuestion[] = [
  {
    id: 'vd30-1',
    points: 30,
    category: 'Toán học · 30 điểm',
    question: 'Một bàn cờ vua tiêu chuẩn 8×8 có 64 ô vuông đơn vị. Hỏi trên bàn cờ đó có TỔNG CỘNG bao nhiêu hình vuông đủ mọi kích thước (từ 1×1 đến 8×8)?',
    answer: '204',
    acceptedAnswers: ['204', 'hai tram linh bon'],
    options: ['64', '128', '204', '256'],
    explanation: 'Tổng số hình vuông là 1² + 2² + 3² + 4² + 5² + 6² + 7² + 8² = 204 hình vuông.',
  },
  {
    id: 'vd30-2',
    points: 30,
    category: 'Lịch sử · 30 điểm',
    question: 'Hội nghị thành lập Đảng Cộng sản Việt Nam đầu năm 1930 do Nguyễn Ái Quốc chủ trì được tổ chức tại địa điểm nào?',
    answer: 'Hồng Kông (Trung Quốc)',
    acceptedAnswers: ['Hong Kong', 'Cuu Long', 'Ban dao Cuu Long', 'Hong Kong (Trung Quoc)'],
    options: ['Quảng Châu', 'Hồng Kông (Trung Quốc)', 'Tân Trào (Tuyên Quang)', 'Pác Bó (Cao Bằng)'],
    explanation: 'Hội nghị hợp nhất các tổ chức cộng sản diễn ra tại bán đảo Cửu Long, Hồng Kông (Trung Quốc).',
  },
  {
    id: 'vd30-3',
    points: 30,
    category: 'Thiên văn & Vật lý · 30 điểm',
    question: 'Hành tinh nào trong Hệ Mặt Trời có thời gian tự quay quanh trục dài hơn cả thời gian nó quay một vòng quanh Mặt Trời (1 ngày dài hơn 1 năm)?',
    answer: 'Sao Kim (Kim tinh)',
    acceptedAnswers: ['Sao Kim', 'Kim tinh', 'Venus', 'Sao Kim (Kim tinh)'],
    options: ['Sao Thủy', 'Sao Kim (Kim tinh)', 'Sao Hỏa', 'Sao Thiên Vương'],
    explanation: 'Sao Kim mất 243 ngày Trái Đất để tự quay 1 vòng quanh trục nhưng chỉ mất 225 ngày để quay quanh Mặt Trời.',
  },
  {
    id: 'vd30-4',
    points: 30,
    category: 'Hóa học · 30 điểm',
    question: 'Hỗn hợp gồm 1 thể tích axit nitric đặc (HNO3) và 3 thể tích axit clohidric đặc (HCl) có khả năng hòa tan được cả Vàng (Au) được gọi là dung dịch gì?',
    answer: 'Nước cường toan',
    acceptedAnswers: ['Nuoc cuong toan', 'Cuong toan', 'Nuoc cuong thuy'],
    options: ['Nước Javel', 'Nước cường toan', 'Nước cứng', 'Oleum'],
    explanation: 'Nước cường toan (Aqua regia) gồm HNO3 và HCl đặc theo tỉ lệ 1:3 có khả năng hòa tan vàng.',
  },
  {
    id: 'vd30-5',
    points: 30,
    category: 'Tiếng Anh · 30 điểm',
    question: 'What single English word means "the process by which green plants use sunlight to synthesize nutrients from carbon dioxide and water"?',
    answer: 'Photosynthesis',
    acceptedAnswers: ['Photosynthesis'],
    options: ['Respiration', 'Photosynthesis', 'Evaporation', 'Metabolism'],
    explanation: 'Photosynthesis là quá trình quang hợp ở thực vật xanh.',
  },
  {
    id: 'vd30-6',
    points: 30,
    category: 'Hiểu biết chung · 30 điểm',
    question: 'Nhà vô địch đầu tiên của chương trình Đường Lên Đỉnh Olympia năm thứ nhất (1999–2000) là ai?',
    answer: 'Trần Ngọc Minh',
    acceptedAnswers: ['Tran Ngoc Minh'],
    options: ['Lương Phương Thảo', 'Trần Ngọc Minh', 'Phan Mạnh Tân', 'Võ Văn Dũng'],
    explanation: 'Trần Ngọc Minh (THPT Chuyên Nguyễn Tất Thành - Vĩnh Long) là Quán quân Olympia năm thứ nhất.',
  },
  {
    id: 'vd30-7',
    points: 30,
    category: 'Toán học · 30 điểm',
    question: 'Trong một phòng có 6 người bất kỳ, mỗi người đều bắt tay với tất cả những người còn lại đúng 1 lần. Hỏi có tất cả bao nhiêu cái bắt tay?',
    answer: '15',
    acceptedAnswers: ['15', 'muoi lam'],
    options: ['12', '15', '18', '30'],
    explanation: 'Số cái bắt tay là tổ hợp chập 2 của 6: 6 × 5 / 2 = 15 cái bắt tay.',
  },
  {
    id: 'vd30-8',
    points: 30,
    category: 'Sinh học · 30 điểm',
    question: 'Trong phân tử ADN mạch kép, theo nguyên tắc bổ sung của Watson - Crick, bazơ nitơ Adenin (A) liên kết với Timin (T) bằng bao nhiêu liên kết hiđrô?',
    answer: '2 liên kết hiđrô',
    acceptedAnswers: ['2', '2 lien ket', '2 lien ket hidro', 'hai'],
    options: ['1 liên kết hiđrô', '2 liên kết hiđrô', '3 liên kết hiđrô', '4 liên kết hiđrô'],
    explanation: 'Trong ADN, A liên kết với T bằng 2 liên kết hiđrô, còn G liên kết với X bằng 3 liên kết hiđrô.',
  },
  {
    id: 'vd30-9',
    points: 30,
    category: 'Văn học · 30 điểm',
    question: 'Tác phẩm nào của Hưng Đạo Đại Vương Trần Quốc Tuấn được viết nhằm khích lệ tinh thần tướng sĩ trước cuộc kháng chiến chống quân Nguyên Mông lần thứ hai (1285)?',
    answer: 'Hịch tướng sĩ',
    acceptedAnswers: ['Hich tuong si', 'Dụ chư tỳ tướng hịch văn'],
    options: ['Nam quốc sơn hà', 'Hịch tướng sĩ', 'Bình Ngô đại cáo', 'Phò giá về kinh'],
    explanation: 'Hịch tướng sĩ (Dụ chư tỳ tướng hịch văn) là áng thiên cổ hùng văn của Trần Quốc Tuấn.',
  },
  {
    id: 'vd30-10',
    points: 30,
    category: 'Địa lý · 30 điểm',
    question: 'Cực Đông trên đất liền của Tổ quốc Việt Nam — một trong những nơi đón ánh bình minh sớm nhất — là Mũi Đôi thuộc tỉnh nào?',
    answer: 'Khánh Hòa',
    acceptedAnswers: ['Khanh Hoa', 'Tinh Khanh Hoa'],
    options: ['Phú Yên', 'Khánh Hòa', 'Bình Định', 'Ninh Thuận'],
    explanation: 'Mũi Đôi (bán đảo Hòn Gốm, huyện Vạn Ninh, tỉnh Khánh Hòa) là điểm cực Đông trên đất liền của Việt Nam.',
  },
  {
    id: 'vd30-11',
    points: 30,
    category: 'Vật lý · 30 điểm',
    question: 'Nhiệt độ 0 độ C (điểm đóng băng của nước tinh khiết ở áp suất tiêu chuẩn) tương ứng với bao nhiêu độ Kelvin (K) làm tròn đến hàng đơn vị?',
    answer: '273 K',
    acceptedAnswers: ['273', '273 K', '273,15', '273.15'],
    options: ['100 K', '212 K', '273 K', '373 K'],
    explanation: 'Thang nhiệt độ tuyệt đối Kelvin: T(K) = t(°C) + 273,15 ≈ 273 K.',
  },
  {
    id: 'vd30-12',
    points: 30,
    category: 'Lịch sử · 30 điểm',
    question: 'Hiệp định Genève về chấm dứt chiến tranh, lập lại hòa bình ở Đông Dương được ký kết vào ngày 21/07 của năm nào?',
    answer: '1954',
    acceptedAnswers: ['1954', 'nam 1954'],
    options: ['1946', '1954', '1968', '1973'],
    explanation: 'Sau chiến thắng Điện Biên Phủ, Hiệp định Genève được ký kết vào tháng 7/1954.',
  },
];

// ==================== CÂU HỎI PHỤ (TIE-BREAKER) ====================
export const TIE_BREAKER_QUESTIONS: QuizQuestion[] = [
  {
    id: 'tb-1',
    category: 'Câu hỏi phụ · Quyết định Vòng Nguyệt Quế',
    question:
      'Hạt nhân của nguyên tử đồng vị phổ biến nhất của nguyên tố Hydro (Proti - 1H) chứa bao nhiêu hạt Neutron?',
    answer: '0',
    acceptedAnswers: ['0', 'khong', 'khong co'],
    options: ['0', '1', '2', '3'],
    explanation: 'Đồng vị Proti (1H) chỉ có 1 Proton trong hạt nhân và 0 Neutron.',
  },
];

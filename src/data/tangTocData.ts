import type { AccelerationQuestion } from './questionTypes.ts';

// ==================== PHẦN 3: TĂNG TỐC (10 BỘ × 4 CÂU = 40 CÂU TƯ DUY ĐỘ KHÓ CAO, KHÔNG CÓ GỢI Ý LỘ ĐÁP ÁN) ====================
export const TANG_TOC_QUESTIONS: AccelerationQuestion[] = [
  // ==================== BỘ TĂNG TỐC 1 ====================
  {
    id: 'tt-1',
    number: 1,
    timeLimitSec: 15,
    typeLabel: 'Câu 1 · Sắp xếp Trình tự Lịch sử',
    question:
      'Hãy sắp xếp 4 sự kiện ngoại giao và quân sự sau của dân tộc Việt Nam theo đúng trình tự thời gian từ SỚM NHẤT đến MUỘN NHẤT:',
    clues: [
      'A. Hội nghị Đông Dương tại Genève',
      'B. Hiệp định Sơ bộ Việt – Pháp (06/03)',
      'C. Hội nghị Bàn tròn tại Paris về Việt Nam',
      'D. Chiến dịch Biên giới Thu – Đông',
    ],
    answer: 'BDAC',
    acceptedAnswers: ['BDAC', 'B D A C', 'B-D-A-C'],
    options: ['BDAC', 'BADC', 'DBAC', 'BCDA'],
    explanation:
      'Thứ tự lịch sử: Hiệp định Sơ bộ (06/03/1946 - B) -> Chiến dịch Biên giới Thu Đông (1950 - D) -> Hội nghị Genève (1954 - A) -> Hiệp định Paris (1973 - C).',
  },
  {
    id: 'tt-2',
    number: 2,
    timeLimitSec: 20,
    typeLabel: 'Câu 2 · Tư duy Quy luật Dãy số Bậc ba',
    question:
      'Tìm số tự nhiên thích hợp điền vào dấu chấm hỏi (?) trong dãy số sau: 2, 10, 30, 68, 130, ?',
    clues: [],
    answer: '222',
    acceptedAnswers: ['222', 'hai tram hai muoi hai'],
    options: ['210', '216', '222', '240'],
    explanation:
      'Số hạng thứ n có dạng n³ + n: 1³+1=2, 2³+2=10, 3³+3=30, 4³+4=68, 5³+5=130. Số thứ 6 là 6³ + 6 = 216 + 6 = 222.',
  },
  {
    id: 'tt-3',
    number: 3,
    timeLimitSec: 25,
    typeLabel: 'Câu 3 · Nhận diện Khái niệm Khoa học qua 4 dữ kiện',
    question:
      'Dựa vào 4 dữ kiện khoa học mở dần theo thứ tự từ gián tiếp đến cụ thể sau, hãy cho biết đây là hiện tượng vật lý nào?',
    clues: [
      'Dữ kiện 1: Hiện tượng này từng được ứng dụng để chế tạo các buồng tối quan sát nhật thực từ thời học giả Ả Rập Ibn al-Haytham và sau đó được Grimaldi ghi nhận bằng thuật ngữ Latin vào thế kỷ XVII.',
      'Dữ kiện 2: Độ rõ nét của hiện tượng phụ thuộc chặt chẽ vào tỷ số giữa bước sóng λ và kích thước vật cản hoặc độ rộng khe hẹp d.',
      'Dữ kiện 3: Đây là cơ sở vật lý giải thích vì sao sóng âm tần số thấp dễ dàng vòng qua các góc tường hoặc tòa nhà, còn ánh sáng khả kiến chỉ biểu hiện rõ khi đi qua lỗ kim siêu nhỏ hoặc cách tử.',
      'Dữ kiện 4: Là hiện tượng sóng truyền sai lệch khỏi phương truyền thẳng khi gặp mép vật cản hoặc đi qua khe hẹp.',
    ],
    answer: 'Nhiễu xạ',
    acceptedAnswers: ['Nhieu xa', 'Nhieu xa anh sang', 'Nhieu xa song', 'Hien tuong nhieu xa'],
    options: ['Khúc xạ', 'Nhiễu xạ', 'Tán sắc', 'Phản xạ toàn phần'],
    explanation:
      'Nhiễu xạ (Diffraction) là hiện tượng tia sáng hoặc sóng bị lệch khỏi phương truyền thẳng khi đi gần mép vật cản hoặc qua lỗ nhỏ.',
  },
  {
    id: 'tt-4',
    number: 4,
    timeLimitSec: 30,
    typeLabel: 'Câu 4 · Toán học Tổ hợp & Lý thuyết Số',
    question:
      'Từ các chữ số 0, 1, 2, 3, 4, 5 có thể lập được bao nhiêu số tự nhiên CHẴN gồm 4 chữ số đôi một khác nhau và chia hết cho 3?',
    clues: [],
    answer: '52',
    acceptedAnswers: ['52', 'nam muoi hai'],
    options: ['48', '52', '56', '60'],
    explanation:
      'Các bộ 4 chữ số có tổng chia hết cho 3 từ {0..5} là: A={0,1,2,3}, B={0,1,3,5}, C={0,2,3,4}, D={0,3,4,5}, E={1,2,4,5}. Đếm số chẵn 4 chữ số khác nhau ở từng bộ: A có 10 số, B có 6 số, C có 14 số, D có 10 số, E có 12 số. Tổng cộng: 10 + 6 + 14 + 10 + 12 = 52 số.',
  },

  // ==================== BỘ TĂNG TỐC 2 ====================
  {
    id: 'tt-5',
    number: 1,
    timeLimitSec: 15,
    typeLabel: 'Câu 1 · Sắp xếp Địa lý Tự nhiên Việt Nam',
    question:
      'Hãy sắp xếp 4 con đèo nổi tiếng trên dải đất Việt Nam theo thứ tự vị trí địa lý từ BẮC vào NAM:',
    clues: [
      'A. Đèo Cả',
      'B. Đèo Ngang',
      'C. Đèo Ngoạn Mục',
      'D. Đèo Hải Vân',
    ],
    answer: 'BDAC',
    acceptedAnswers: ['BDAC', 'B D A C', 'B-D-A-C'],
    options: ['BDAC', 'BADC', 'DBAC', 'BCAD'],
    explanation:
      'Từ Bắc vào Nam: Đèo Ngang (Hà Tĩnh - Quảng Bình, B) -> Đèo Hải Vân (Thừa Thiên Huế - Đà Nẵng, D) -> Đèo Cả (Phú Yên - Khánh Hòa, A) -> Đèo Ngoạn Mục (Ninh Thuận - Lâm Đồng, C).',
  },
  {
    id: 'tt-6',
    number: 2,
    timeLimitSec: 20,
    typeLabel: 'Câu 2 · Tư duy Toán học Chuyển động & Thủy văn',
    question:
      'Một ca nô xuôi dòng từ bến A đến bến B mất 3 giờ và ngược dòng từ B về A mất 5 giờ (vận tốc riêng của ca nô và vận tốc dòng nước không đổi). Hỏi một cụm bèo trôi tự do theo dòng nước từ A đến B mất bao nhiêu giờ?',
    clues: [],
    answer: '15',
    acceptedAnswers: ['15', '15 gio', 'muoi lam'],
    options: ['8', '12', '15', '20'],
    explanation:
      'Gọi quãng đường là S. Vận tốc xuôi v + u = S/3, vận tốc ngược v - u = S/5. Suy ra 2u = S/3 - S/5 = 2S/15 => u = S/15. Vậy cụm bèo trôi theo vận tốc dòng nước u mất 15 giờ.',
  },
  {
    id: 'tt-7',
    number: 3,
    timeLimitSec: 25,
    typeLabel: 'Câu 3 · Nhận diện Nhân vật Lịch sử - Văn hóa qua 4 dữ kiện',
    question:
      'Từ 4 dữ kiện lịch sử sau, hãy cho biết danh nhân văn hóa – khoa học này là ai?',
    clues: [
      'Dữ kiện 1: Ông đỗ Bảng nhãn khoa Quý Mùi (1463) dưới triều vua Lê Thánh Tông và từng giữ chức Thượng thư Bộ Hình kiêm Tế tửu Quốc Tử Giám.',
      'Dữ kiện 2: Tương truyền khi đi sứ nhà Minh, ông đã dùng trí tuệ giải bài toán cân voi trên thuyền và tìm ra quy tắc đo độ dày một tờ giấy.',
      'Dữ kiện 3: Ông là tác giả của hai bộ sách toán học cổ quý giá bậc nhất Đại Việt là "Đại thành toán pháp" và "Lập thành toán pháp".',
      'Dữ kiện 4: Nhân dân đương thời tôn vinh ông là "Trạng Lường" quê ở làng Bình Vọng (Thường Tín, Hà Nội ngày nay).',
    ],
    answer: 'Lương Thế Vinh',
    acceptedAnswers: ['Luong The Vinh', 'Trang Luong', 'Bang nhan Luong The Vinh'],
    options: ['Vũ Hữu', 'Lương Thế Vinh', 'Lê Quý Đôn', 'Mạc Đĩnh Chi'],
    explanation:
      'Bảng nhãn Lương Thế Vinh (1441–1496), tục gọi là Trạng Lường, là nhà toán học, Phật học và văn hóa lớn thời Lê sơ.',
  },
  {
    id: 'tt-8',
    number: 4,
    timeLimitSec: 30,
    typeLabel: 'Câu 4 · Mật mã Logic & Suy luận Số học',
    question:
      'Một số tự nhiên N gồm 3 chữ số khi chia cho 5 dư 3, chia cho 7 dư 4 và chia cho 9 dư 5. Tìm giá trị NHỎ NHẤT của số tự nhiên N có 3 chữ số đó.',
    clues: [],
    answer: '158',
    acceptedAnswers: ['158', 'mot tram nam muoi tam'],
    options: ['143', '158', '167', '313'],
    explanation:
      'Ta thấy 2N chia 5 dư 6≡1, chia 7 dư 8≡1, chia 9 dư 10≡1. Do đó (2N - 1) chia hết cho BCNN(5,7,9) = 315. Vì N là số nhỏ nhất có 3 chữ số nên 2N - 1 = 315 => 2N = 316 => N = 158.',
  },

  // ==================== BỘ TĂNG TỐC 3 ====================
  {
    id: 'tt-9',
    number: 1,
    timeLimitSec: 15,
    typeLabel: 'Câu 1 · Sắp xếp Khám phá Khoa học Thế giới',
    question:
      'Hãy sắp xếp 4 thành tựu khoa học tự nhiên sau theo trình tự thời gian công bố từ SỚM NHẤT đến MUỘN NHẤT:',
    clues: [
      'A. Mô hình cấu trúc xoắn kép phân tử ADN của Watson và Crick',
      'B. Bảng tuần hoàn các nguyên tố hóa học của Dmitri Mendeleev',
      'C. Định luật vạn vật hấp dẫn của Isaac Newton',
      'D. Thuyết tương đối hẹp của Albert Einstein',
    ],
    answer: 'CBDA',
    acceptedAnswers: ['CBDA', 'C B D A', 'C-B-D-A'],
    options: ['CBDA', 'BCDA', 'CBAD', 'CDAB'],
    explanation:
      'Định luật vạn vật hấp dẫn (1687 - C) -> Bảng tuần hoàn Mendeleev (1869 - B) -> Thuyết tương đối hẹp (1905 - D) -> Cấu trúc xoắn kép ADN (1953 - A).',
  },
  {
    id: 'tt-10',
    number: 2,
    timeLimitSec: 20,
    typeLabel: 'Câu 2 · Tư duy Quy luật Dãy số Phân tầng',
    question:
      'Tìm số tự nhiên tiếp theo điền vào dấu chấm hỏi (?) trong dãy số sau: 3, 8, 22, 63, 185, ?',
    clues: [],
    answer: '550',
    acceptedAnswers: ['550', 'nam tram nam muoi'],
    options: ['540', '550', '555', '560'],
    explanation:
      'Quy luật truy hồi: a(n) = 3 × a(n-1) - n (với n bắt đầu từ 1): 3×3-1=8; 8×3-2=22; 22×3-3=63; 63×3-4=185; và số tiếp theo là 185×3 - 5 = 550.',
  },
  {
    id: 'tt-11',
    number: 3,
    timeLimitSec: 25,
    typeLabel: 'Câu 3 · Nhận diện Hợp chất Hóa học qua 4 dữ kiện',
    question:
      'Từ 4 dữ kiện hóa học sau đây, hãy cho biết đây là hợp chất vô cơ nào?',
    clues: [
      'Dữ kiện 1: Khoáng vật tự nhiên chứa hợp chất này được nhà giả kim người Đức Johann Glauber phát hiện trong nước suối khoáng vào năm 1625 dưới dạng tinh thể ngậm 10 phân tử nước.',
      'Dữ kiện 2: Là nguyên liệu trọng yếu trong công nghệ nấu bột giấy theo phương pháp Kraft và công nghiệp sản xuất thủy tinh trắng, chất tẩy rửa.',
      'Dữ kiện 3: Dung dịch nước của hợp chất này có môi trường trung tính (pH = 7), không làm đổi màu quỳ tím nhưng tạo kết tủa trắng bền trong axit mạnh khi tác dụng với dung dịch BaCl₂.',
      'Dữ kiện 4: Là muối trung hòa của kim loại kiềm ở chu kỳ 3 với gốc axit của axit sunfuric.',
    ],
    answer: 'Natri sunfat (Na2SO4)',
    acceptedAnswers: ['Natri sunfat', 'Na2SO4', 'Sodium sulfate', 'Muoi Glauber'],
    options: ['Natri cacbonat (Na2CO3)', 'Natri sunfat (Na2SO4)', 'Canxi sunfat (CaSO4)', 'Magie sunfat (MgSO4)'],
    explanation:
      'Natri sunfat (Na₂SO₄, dạng ngậm nước Na₂SO₄·10H₂O gọi là muối Glauber) được ứng dụng rộng rãi trong sản xuất thủy tinh, giấy Kraft và chất tẩy rửa.',
  },
  {
    id: 'tt-12',
    number: 4,
    timeLimitSec: 30,
    typeLabel: 'Câu 4 · Tư duy Hình học Không gian & Đếm Khối',
    question:
      'Một khối lập phương lớn bằng gỗ có kích thước 5×5×5 được sơn đỏ toàn bộ 6 mặt ngoài, sau đó được cắt thành 125 khối lập phương đơn vị 1×1×1. Hỏi có tất cả bao nhiêu khối lập phương đơn vị chỉ được sơn đỏ ĐÚNG 1 MẶT hoặc KHÔNG ĐƯỢC SƠN mặt nào?',
    clues: [],
    answer: '81',
    acceptedAnswers: ['81', 'tam muoi mot'],
    options: ['54', '63', '81', '98'],
    explanation:
      'Số khối sơn đúng 1 mặt nằm ở tâm 6 mặt: 6 × (5-2)² = 6 × 9 = 54 khối. Số khối không sơn mặt nào nằm hoàn toàn bên trong lõi: (5-2)³ = 27 khối. Tổng cộng: 54 + 27 = 81 khối.',
  },

  // ==================== BỘ TĂNG TỐC 4 ====================
  {
    id: 'tt-13',
    number: 1,
    timeLimitSec: 15,
    typeLabel: 'Câu 1 · Sắp xếp Khúc sông & Thủy hệ Bắc Bộ',
    question:
      'Hãy sắp xếp 4 con sông sau ở miền Bắc Việt Nam theo thứ tự độ dài phần chảy trên lãnh thổ Việt Nam từ DÀI NHẤT đến NGẮN NHẤT:',
    clues: [
      'A. Sông Lô',
      'B. Sông Đà',
      'C. Sông Đuống',
      'D. Sông Thái Bình',
    ],
    answer: 'BADC',
    acceptedAnswers: ['BADC', 'B A D C', 'B-A-D-C'],
    options: ['BADC', 'ABDC', 'BDAC', 'ABCD'],
    explanation:
      'Độ dài phần chảy trong lãnh thổ Việt Nam: Sông Đà (~527 km, B) > Sông Lô (~275 km, A) > Sông Thái Bình (~100 km, D) > Sông Đuống (~68 km, C).',
  },
  {
    id: 'tt-14',
    number: 2,
    timeLimitSec: 20,
    typeLabel: 'Câu 2 · Bài toán Đa giác Lồi & Đường chéo',
    question:
      'Một đa giác lồi có tổng số đường chéo gấp 3 lần số cạnh của nó. Hỏi tổng số đo tất cả các góc trong của đa giác lồi này bằng bao nhiêu độ?',
    clues: [],
    answer: '1260',
    acceptedAnswers: ['1260', '1260 do', '1.260'],
    options: ['1080', '1260', '1440', '1620'],
    explanation:
      'Gọi số cạnh là n. Ta có n(n - 3)/2 = 3n => n - 3 = 6 => n = 9 cạnh (cửu giác). Tổng các góc trong của đa giác 9 cạnh là (9 - 2) × 180° = 7 × 180° = 1260°.',
  },
  {
    id: 'tt-15',
    number: 3,
    timeLimitSec: 25,
    typeLabel: 'Câu 3 · Nhận diện Tác phẩm Văn học Thế giới qua 4 dữ kiện',
    question:
      'Dựa vào 4 dữ kiện văn học sau, hãy cho biết đây là kiệt tác văn học nào?',
    clues: [
      'Dữ kiện 1: Tác phẩm lấy cảm hứng từ câu chuyện có thật của một thủy thủ người Cuba tên là Gregorio Fuentes và được hoàn thành tại vùng biển Caribe năm 1951.',
      'Dữ kiện 2: Được viết theo nguyên lý nghệ thuật "Tảng băng trôi" với dung lượng cô đọng nhưng tầng nghĩa triết lý sâu sắc về sức mạnh con người trước tự nhiên.',
      'Dữ kiện 3: Hành trình kéo dài 84 ngày không bắt được cá, tiếp nối bằng cuộc vật lộn 3 ngày đêm ngoài khơi dòng hải lưu Gulf Stream với một con cá kiếm khổng lồ dài hơn chiếc thuyền.',
      'Dữ kiện 4: Tác phẩm giúp nhà văn Mỹ Ernest Hemingway nhận Giải Pulitzer năm 1953 và Giải Nobel Văn học năm 1954.',
    ],
    answer: 'Ông già và biển cả',
    acceptedAnswers: ['Ong gia va bien ca', 'The Old Man and the Sea'],
    options: ['Chuông nguyện hồn ai', 'Ông già và biển cả', 'Giã từ vũ khí', 'Mặt trời vẫn mọc'],
    explanation:
      '"Ông già và biển cả" (The Old Man and the Sea) của Ernest Hemingway khắc họa hình tượng ông lão đánh cá Santiago kiên cường.',
  },
  {
    id: 'tt-16',
    number: 4,
    timeLimitSec: 30,
    typeLabel: 'Câu 4 · Giải Hệ Phương trình Điện trở & Công suất Vật lý',
    question:
      'Khi mắc hai điện trở R₁ và R₂ nối tiếp vào một hiệu điện thế không đổi U thì công suất tiêu thụ của mạch là 16 W. Nếu mắc R₁ và R₂ song song vào cùng hiệu điện thế U đó thì công suất tiêu thụ của cả mạch là 72 W. Biết R₁ > R₂, hãy tìm tỷ số R₁ / R₂.',
    clues: [],
    answer: '2',
    acceptedAnswers: ['2', 'hai', '2 lan'],
    options: ['1,5', '2', '3', '4'],
    explanation:
      'Ta có P_ss / P_nt = (R₁ + R₂)² / (R₁·R₂) = 72 / 16 = 9 / 2. Đặt k = R₁ / R₂ (k > 1), ta có (k + 1)² / k = 9/2 <=> 2k² - 5k + 2 = 0 => k = 2 (vì k > 1). Vậy R₁ / R₂ = 2.',
  },

  // ==================== BỘ TĂNG TỐC 5 ====================
  {
    id: 'tt-17',
    number: 1,
    timeLimitSec: 15,
    typeLabel: 'Câu 1 · Sắp xếp Nhiệt độ Nóng chảy Kim loại',
    question:
      'Hãy sắp xếp 4 kim loại sau theo thứ tự NHIỆT ĐỘ NÓNG CHẢY TĂNG DẦN (từ thấp nhất đến cao nhất) ở áp suất tiêu chuẩn:',
    clues: [
      'A. Sắt (Fe)',
      'B. Vonfram (W)',
      'C. Nhôm (Al)',
      'D. Thủy ngân (Hg)',
    ],
    answer: 'DCAB',
    acceptedAnswers: ['DCAB', 'D C A B', 'D-C-A-B'],
    options: ['DCAB', 'CDAB', 'DACB', 'DCBA'],
    explanation:
      'Nhiệt độ nóng chảy tăng dần: Thủy ngân (-38,83°C, D) < Nhôm (660°C, C) < Sắt (1538°C, A) < Vonfram (3422°C, B).',
  },
  {
    id: 'tt-18',
    number: 2,
    timeLimitSec: 20,
    typeLabel: 'Câu 2 · Bài toán Sinh học Phân tử & Nhân đôi ADN',
    question:
      'Một phân tử ADN mạch kép của vi khuẩn chứa toàn bộ đồng vị phóng xạ N¹⁵ được chuyển sang môi trường chỉ chứa N¹⁴ và tiến hành tự nhân đôi liên tiếp 4 lần. Trong tổng số các phân tử ADN con được tạo thành, có bao nhiêu phân tử ADN hoàn toàn KHÔNG chứa mạch N¹⁵ nào?',
    clues: [],
    answer: '14',
    acceptedAnswers: ['14', 'muoi bon'],
    options: ['8', '12', '14', '16'],
    explanation:
      'Sau 4 lần nhân đôi theo nguyên tắc bán bảo toàn từ 1 ADN ban đầu tạo ra 2⁴ = 16 phân tử ADN con, trong đó luôn có đúng 2 phân tử mang 1 mạch cũ N¹⁵. Số phân tử chỉ chứa N¹⁴ là 16 - 2 = 14.',
  },
  {
    id: 'tt-19',
    number: 3,
    timeLimitSec: 25,
    typeLabel: 'Câu 3 · Nhận diện Hiệp ước / Văn kiện Lịch sử qua 4 dữ kiện',
    question:
      'Dựa vào 4 dữ kiện lịch sử sau, hãy cho biết đây là văn kiện / hiệp ước lịch sử nào?',
    clues: [
      'Dữ kiện 1: Được ký kết tại kinh đô Phú Xuân (Huế) vào ngày 06 tháng 06 năm Giáp Thân dưới thời vua Kiến Phúc sau khi kinh thành thất thủ ở cửa biển Thuận An.',
      'Dữ kiện 2: Đại diện phía triều đình nhà Nguyễn ký văn kiện này là Thượng thư Nguyễn Văn Tường và Phạm Thận Duật; phía Pháp là đại diện toàn quyền Jules Patenôtre.',
      'Dữ kiện 3: Theo văn kiện gồm 19 điều khoản này, lãnh thổ Việt Nam bị chia cắt làm 3 kỳ với 3 chế độ cai trị khác nhau: Bắc Kỳ (bảo hộ), Trung Kỳ (nửa bảo hộ) và Nam Kỳ (thuộc địa).',
      'Dữ kiện 4: Hiệp ước này đã chấm dứt về mặt pháp lý sự tồn tại của nhà nước phong kiến Việt Nam độc lập, mở đầu thời kỳ Pháp thuộc hoàn toàn.',
    ],
    answer: 'Hiệp ước Patenôtre (Hiệp ước Giáp Thân 1884)',
    acceptedAnswers: ['Hiep uoc Patenotre', 'Patenotre', 'Hiep uoc Giap Than', 'Hoa uoc Giap Than', 'Hoa uoc Patenotre'],
    options: ['Hiệp ước Nhâm Tuất', 'Hiệp ước Giáp Tuất', 'Hiệp ước Harmand', 'Hiệp ước Patenôtre (Hiệp ước Giáp Thân 1884)'],
    explanation:
      'Hiệp ước Patenôtre (Hòa ước Giáp Thân 06/06/1884) đặt toàn bộ Việt Nam dưới quyền bảo hộ và thuộc địa của thực dân Pháp.',
  },
  {
    id: 'tt-20',
    number: 4,
    timeLimitSec: 30,
    typeLabel: 'Câu 4 · Bài toán Công việc Chung & Năng suất',
    question:
      'Ba vòi nước A, B, C cùng chảy vào một bể cạn. Nếu mở hai vòi A và B thì đầy bể trong 12 giờ; mở hai vòi B và C thì đầy bể trong 15 giờ; mở hai vòi C và A thì đầy bể trong 20 giờ. Hỏi nếu mở cả 3 vòi A, B, C cùng một lúc thì sau bao nhiêu giờ sẽ đầy bể?',
    clues: [],
    answer: '10',
    acceptedAnswers: ['10', '10 gio', 'muoi'],
    options: ['8', '9', '10', '12'],
    explanation:
      'Trong 1 giờ: A+B chảy được 1/12 bể, B+C được 1/15 bể, C+A được 1/20 bể. Cộng vế theo vế: 2(A+B+C) = 1/12 + 1/15 + 1/20 = (5+4+3)/60 = 12/60 = 1/5 bể => A+B+C = 1/10 bể/giờ. Vậy cả 3 vòi chảy đầy bể trong 10 giờ.',
  },

  // ==================== BỘ TĂNG TỐC 6 ====================
  {
    id: 'tt-21',
    number: 1,
    timeLimitSec: 15,
    typeLabel: 'Câu 1 · Sắp xếp Hành tinh theo Khoảng cách tới Mặt Trời',
    question:
      'Hãy sắp xếp 4 hành tinh sau trong Hệ Mặt Trời theo thứ tự khoảng cách trung bình tới Mặt Trời TĂNG DẦN (từ gần đến xa):',
    clues: [
      'A. Sao Thổ (Saturn)',
      'B. Sao Hỏa (Mars)',
      'C. Sao Kim (Venus)',
      'D. Sao Thiên Vương (Uranus)',
    ],
    answer: 'CBAD',
    acceptedAnswers: ['CBAD', 'C B A D', 'C-B-A-D'],
    options: ['CBAD', 'BCAD', 'CABD', 'CBDA'],
    explanation:
      'Thứ tự từ gần Mặt Trời ra xa: Sao Kim (C - hành tinh thứ 2) -> Sao Hỏa (B - thứ 4) -> Sao Thổ (A - thứ 6) -> Sao Thiên Vương (D - thứ 7).',
  },
  {
    id: 'tt-22',
    number: 2,
    timeLimitSec: 20,
    typeLabel: 'Câu 2 · Bài toán Chuyển động Tương đối Hai Đoàn Tàu',
    question:
      'Hai đoàn tàu chạy ngược chiều nhau trên hai đường ray song song với vận tốc lần lượt là 54 km/h và 36 km/h. Một hành khách ngồi trên đoàn tàu thứ nhất nhận thấy đoàn tàu thứ hai lướt qua trước mặt mình mất đúng 8 giây. Hỏi chiều dài của đoàn tàu thứ hai là bao nhiêu mét?',
    clues: [],
    answer: '200',
    acceptedAnswers: ['200', '200m', '200 met', 'hai tram'],
    options: ['160', '180', '200', '240'],
    explanation:
      'Vận tốc tương đối của hai tàu đi ngược chiều là 54 + 36 = 90 km/h = 25 m/s. Chiều dài đoàn tàu thứ hai bằng L = v_tđ × t = 25 × 8 = 200 m.',
  },
  {
    id: 'tt-23',
    number: 3,
    timeLimitSec: 25,
    typeLabel: 'Câu 3 · Nhận diện Địa danh Lịch sử - Địa lý qua 4 dữ kiện',
    question:
      'Dựa vào 4 dữ kiện sau đây, hãy cho biết đây là quần đảo nào của Tổ quốc Việt Nam?',
    clues: [
      'Dữ kiện 1: Trong các thư tịch cổ của Việt Nam thời chúa Nguyễn và nhà Nguyễn như "Phủ biên tạp lục", "Đại Nam thực lục", vùng biển đảo này được ghi chép chung dưới tên gọi Bãi Cát Vàng hoặc Vạn Lý Trường Sa.',
      'Dữ kiện 2: Vào thế kỷ XVII – XVIII, chúa Nguyễn đã lập đội Bắc Hải do đội Hoàng Sa kiêm quản để hàng năm ra đây thu lượm hải vật và dựng bia chủ quyền.',
      'Dữ kiện 3: Về mặt hành chính hiện nay, đây là một huyện đảo thuộc tỉnh Khánh Hòa, gồm thị trấn đảo và hai xã đảo Song Tử Tây, Sinh Tồn.',
      'Dữ kiện 4: Nằm ở vùng biển phía Nam Biển Đông, nơi có ngọn hải đăng Đá Tây, đảo Trường Sa Lớn và tượng đài Quốc công Tiết chế Trần Hưng Đạo.',
    ],
    answer: 'Quần đảo Trường Sa',
    acceptedAnswers: ['Quan dao Truong Sa', 'Truong Sa', 'Huyen dao Truong Sa'],
    options: ['Quần đảo Hoàng Sa', 'Quần đảo Trường Sa', 'Quần đảo Thổ Chu', 'Quần đảo Côn Sơn'],
    explanation:
      'Quần đảo Trường Sa thuộc tỉnh Khánh Hòa là phần lãnh thổ thiêng liêng không thể tách rời của Tổ quốc Việt Nam.',
  },
  {
    id: 'tt-24',
    number: 4,
    timeLimitSec: 30,
    typeLabel: 'Câu 4 · Bài toán Hóa học Hỗn hợp Kim loại & Bảo toàn Electron',
    question:
      'Hòa tan hoàn toàn 11,9 gam hỗn hợp gồm Nhôm (Al) và Kẽm (Zn) bằng dung dịch H₂SO₄ loãng dư, sau phản ứng thu được 8,96 lít khí H₂ (ở điều kiện tiêu chuẩn 22,4 lít/mol). Hỏi khối lượng của Nhôm (Al) trong hỗn hợp ban đầu là bao nhiêu gam (biết Al = 27, Zn = 65)?',
    clues: [],
    answer: '5,4',
    acceptedAnswers: ['5,4', '5.4', '5,4 gam', '5.4 gam', '5,4g', '5.4g'],
    options: ['2,7', '5,4', '6,5', '8,1'],
    explanation:
      'Số mol H₂ = 8,96 / 22,4 = 0,4 mol. Gọi số mol Al và Zn là x, y. Ta có hệ: 27x + 65y = 11,9 và 1,5x + y = 0,4. Giải hệ được x = 0,2 mol và y = 0,1 mol. Khối lượng Al = 0,2 × 27 = 5,4 gam.',
  },

  // ==================== BỘ TĂNG TỐC 7 ====================
  {
    id: 'tt-25',
    number: 1,
    timeLimitSec: 15,
    typeLabel: 'Câu 1 · Sắp xếp Các Tác phẩm Văn học Trung đại Việt Nam',
    question:
      'Hãy sắp xếp 4 tác phẩm văn học chữ Hán và chữ Nôm sau theo trình tự thời đại ra đời từ SỚM NHẤT đến MUỘN NHẤT:',
    clues: [
      'A. Hoàng Lê nhất thống chí (Ngô gia văn phái)',
      'B. Bình Ngô đại cáo (Nguyễn Trãi)',
      'C. Chiếu dời đô (Lý Công Uẩn)',
      'D. Truyền kỳ mạn lục (Nguyễn Dữ)',
    ],
    answer: 'CBDA',
    acceptedAnswers: ['CBDA', 'C B D A', 'C-B-D-A'],
    options: ['CBDA', 'CBAD', 'BCDA', 'CDAB'],
    explanation:
      'Chiếu dời đô (thế kỷ XI - C) -> Bình Ngô đại cáo (thế kỷ XV - B) -> Truyền kỳ mạn lục (thế kỷ XVI - D) -> Hoàng Lê nhất thống chí (cuối thế kỷ XVIII đầu XIX - A).',
  },
  {
    id: 'tt-26',
    number: 2,
    timeLimitSec: 20,
    typeLabel: 'Câu 2 · Tư duy Quy luật Ma trận Số học',
    question:
      'Cho dãy số quy luật sau: 4, 18, 48, 100, 180, ?. Hãy tìm số tự nhiên thích hợp điền vào dấu chấm hỏi (?).',
    clues: [],
    answer: '294',
    acceptedAnswers: ['294', 'hai tram chin muoi tu'],
    options: ['270', '288', '294', '320'],
    explanation:
      'Số hạng thứ n (bắt đầu từ n = 1) có quy luật a(n) = (n + 1) × n²: 2×1²=2 (nếu từ n=1: 1×2²=4, 2×3²=18, 3×4²=48, 4×5²=100, 5×6²=180). Vậy số thứ 6 là 6 × 7² = 6 × 49 = 294.',
  },
  {
    id: 'tt-27',
    number: 3,
    timeLimitSec: 25,
    typeLabel: 'Câu 3 · Nhận diện Nhà bác học Thế giới qua 4 dữ kiện',
    question:
      'Từ 4 dữ kiện khoa học sau đây, hãy cho biết nhà bác học lỗi lạc này là ai?',
    clues: [
      'Dữ kiện 1: Ông sinh năm 1791 trong một gia đình thợ rèn nghèo ở ngoại ô Luân Đôn (Anh), chỉ được đi học phổ thông rất ít và tự học khoa học khi làm thợ đóng sách.',
      'Dữ kiện 2: Trong lĩnh vực hóa học, ông là người đầu tiên tìm ra hợp chất hữu cơ Benzen (C₆H₆) vào năm 1825 và thiết lập hai định luật cơ bản về điện phân.',
      'Dữ kiện 3: Ông sáng chế ra lồng chắn tĩnh điện mang tên mình và đưa ra khái niệm "đường sức từ" cùng "trường điện từ" vào vật lý học.',
      'Dữ kiện 4: Tháng 8 năm 1831, ông khám phá ra hiện tượng cảm ứng điện từ — phát minh đặt nền móng cho toàn bộ ngành kỹ thuật máy phát điện hiện đại.',
    ],
    answer: 'Michael Faraday',
    acceptedAnswers: ['Michael Faraday', 'Faraday'],
    options: ['James Clerk Maxwell', 'Michael Faraday', 'André-Marie Ampère', 'Alessandro Volta'],
    explanation:
      'Michael Faraday (1791–1867) là nhà thực nghiệm vĩ đại của vật lý điện từ học và điện hóa học.',
  },
  {
    id: 'tt-28',
    number: 4,
    timeLimitSec: 30,
    typeLabel: 'Câu 4 · Bài toán Tổ hợp Hình học & Giao điểm',
    question:
      'Trên một mặt phẳng cho 10 đường thẳng phân biệt, trong đó có đúng 4 đường thẳng song song với nhau, còn 6 đường thẳng kia không có 2 đường nào song song (và cũng không song song với 4 đường trên). Biết không có 3 đường thẳng nào đồng quy tại một điểm. Hỏi có tất cả bao nhiêu giao điểm được tạo thành?',
    clues: [],
    answer: '39',
    acceptedAnswers: ['39', 'ba muoi chin'],
    options: ['35', '39', '41', '45'],
    explanation:
      'Tổng số cặp 2 đường thẳng từ 10 đường là C(10,2) = 45. Vì 4 đường thẳng song song đôi một không cắt nhau nên mất đi C(4,2) = 6 giao điểm. Số giao điểm thực tế là 45 - 6 = 39 giao điểm.',
  },

  // ==================== BỘ TĂNG TỐC 8 ====================
  {
    id: 'tt-29',
    number: 1,
    timeLimitSec: 15,
    typeLabel: 'Câu 1 · Sắp xếp Các Kỳ Địa Chất trong Lịch sử Trái Đất',
    question:
      'Hãy sắp xếp 4 kỷ địa chất sau theo trình tự niên đại từ CỔ XƯA NHẤT đến GẦN ĐÂY NHẤT:',
    clues: [
      'A. Kỷ Phấn Trắng (Cretaceous)',
      'B. Kỷ Cambri (Cambrian)',
      'C. Kỷ Than Đá (Carboniferous)',
      'D. Kỷ Jura (Jurassic)',
    ],
    answer: 'BCDA',
    acceptedAnswers: ['BCDA', 'B C D A', 'B-C-D-A'],
    options: ['BCDA', 'BDCA', 'CBDA', 'BCAD'],
    explanation:
      'Trình tự địa tầng: Kỷ Cambri (B, ~541 triệu năm trước) -> Kỷ Than Đá (C, ~359 triệu năm) -> Kỷ Jura (D, ~201 triệu năm) -> Kỷ Phấn Trắng (A, ~145 triệu năm).',
  },
  {
    id: 'tt-30',
    number: 2,
    timeLimitSec: 20,
    typeLabel: 'Câu 2 · Bài toán Lý thuyết Số & Ước số Tự nhiên',
    question:
      'Số tự nhiên 720 có tất cả bao nhiêu ước số nguyên dương (kể cả 1 và 720)?',
    clues: [],
    answer: '30',
    acceptedAnswers: ['30', 'ba muoi'],
    options: ['24', '28', '30', '36'],
    explanation:
      'Phân tích thừa số nguyên tố: 720 = 16 × 9 × 5 = 2⁴ × 3² × 5¹. Số ước nguyên dương là (4 + 1) × (2 + 1) × (1 + 1) = 5 × 3 × 2 = 30 ước.',
  },
  {
    id: 'tt-31',
    number: 3,
    timeLimitSec: 25,
    typeLabel: 'Câu 3 · Nhận diện Di sản Văn hóa Phi vật thể qua 4 dữ kiện',
    question:
      'Dựa vào 4 dữ kiện văn hóa – nghệ thuật sau, hãy cho biết đây là loại hình nghệ thuật truyền thống nào của Việt Nam?',
    clues: [
      'Dữ kiện 1: Bắt nguồn từ nhạc lễ và cung đình Huế kết hợp với âm nhạc dân gian vùng đất phương Nam vào cuối thế kỷ XIX, gắn liền với tên tuổi các nhạc sư Nguyễn Quang Đại, Trần Quang Quờn.',
      'Dữ kiện 2: Dàn nhạc cổ truyền tiêu biểu gồm 4 nhạc cụ tạo thành bộ "Tứ tuyệt": đàn kìm (đàn nguyệt), đàn cò (đàn nhị), đàn tranh và đàn độc huyền (đàn bầu), về sau bổ sung thêm cây guitar phím lõm.',
      'Dữ kiện 3: Kho tàng bài bản tổ gồm "Nhị thập bản tổ" chia làm 4 điệu thức lớn: 6 bài Bắc, 3 bài Nam, 4 bài Oán và 7 bài Lễ, cùng bản "Dạ cổ hoài lang" nổi tiếng của nhạc sĩ Cao Văn Lầu.',
      'Dữ kiện 4: Tháng 12 năm 2013, UNESCO chính thức ghi danh loại hình nghệ thuật này của 21 tỉnh, thành phố Nam Bộ là Di sản Văn hóa Phi vật thể Đại diện của Nhân loại.',
    ],
    answer: 'Đờn ca tài tử Nam Bộ',
    acceptedAnswers: ['Don ca tai tu', 'Don ca tai tu Nam Bo', 'Nghe thuat Don ca tai tu'],
    options: ['Nhã nhạc cung đình Huế', 'Đờn ca tài tử Nam Bộ', 'Ca trù', 'Dân ca Bài chòi'],
    explanation:
      'Nghệ thuật Đờn ca tài tử Nam Bộ là dòng âm nhạc thính phòng dân gian đặc sắc của miền Nam và là tiền đề ra đời sân khấu Cải lương.',
  },
  {
    id: 'tt-32',
    number: 4,
    timeLimitSec: 30,
    typeLabel: 'Câu 4 · Bài toán Đồng hồ & Góc Kim Giờ - Kim Phút',
    question:
      'Trên một chiếc đồng hồ kim chạy chuẩn, hiện tại đang là đúng 4 giờ 00 phút. Hỏi sau ít nhất bao nhiêu phút nữa (viết dưới dạng phân số tối giản a/b) thì kim phút và kim giờ sẽ vuông góc với nhau lần đầu tiên?',
    clues: [],
    answer: '60/11',
    acceptedAnswers: ['60/11', '60 / 11', '5 5/11'],
    options: ['45/11', '60/11', '120/11', '180/11'],
    explanation:
      'Lúc 4 giờ đúng, kim giờ cách mốc 12h một góc 120°, kim phút ở 0°. Để hai kim vuông góc lần đầu tiên, góc giữa chúng phải giảm từ 120° về 90°, tức kim phút phải thu hẹp góc 30°. Vận tốc góc tương đối là 6° - 0,5° = 5,5°/phút = 11/2 độ/phút. Thời gian là 30 / (11/2) = 60/11 phút.',
  },

  // ==================== BỘ TĂNG TỐC 9 ====================
  {
    id: 'tt-33',
    number: 1,
    timeLimitSec: 15,
    typeLabel: 'Câu 1 · Sắp xếp Độ âm điện Nguyên tố Hóa học',
    question:
      'Hãy sắp xếp 4 nguyên tố hóa học sau theo thứ tự ĐỘ ÂM ĐIỆN GIẢM DẦN theo thang Pauling (từ lớn nhất đến nhỏ nhất):',
    clues: [
      'A. Nitơ (N)',
      'B. Lưu huỳnh (S)',
      'C. Oxy (O)',
      'D. Photpho (P)',
    ],
    answer: 'CABD',
    acceptedAnswers: ['CABD', 'C A B D', 'C-A-B-D'],
    options: ['CABD', 'ACBD', 'CADB', 'CBAD'],
    explanation:
      'Độ âm điện theo thang Pauling: Oxy (3,44 - C) > Nitơ (3,04 - A) > Lưu huỳnh (2,58 - B) > Photpho (2,19 - D).',
  },
  {
    id: 'tt-34',
    number: 2,
    timeLimitSec: 20,
    typeLabel: 'Câu 2 · Bài toán Nguyên lý Bao hàm - Loại trừ',
    question:
      'Trong một hội thảo khoa học quốc tế có 100 đại biểu tham dự. Có 70 người nói được tiếng Anh, 65 người nói được tiếng Pháp và 60 người nói được tiếng Nga. Hỏi có ÍT NHẤT bao nhiêu đại biểu nói được đồng thời cả 3 thứ tiếng Anh, Pháp và Nga?',
    clues: [],
    answer: '0',
    acceptedAnswers: ['0', 'khong'],
    options: ['0', '5', '15', '25'],
    explanation:
      'Gọi số người không biết tiếng Anh là 30, không biết tiếng Pháp là 35, không biết tiếng Nga là 40. Tổng số lượt "không biết ít nhất 1 thứ tiếng" tối đa là 30 + 35 + 40 = 105 ≥ 100. Do đó giá trị nhỏ nhất của giao 3 tập hợp max(0, 70 + 65 + 60 - 2×100) = max(0, -5) = 0 người.',
  },
  {
    id: 'tt-35',
    number: 3,
    timeLimitSec: 25,
    typeLabel: 'Câu 3 · Nhận diện Công trình Kiến trúc - Khoa học qua 4 dữ kiện',
    question:
      'Từ 4 dữ kiện địa lý – lịch sử sau, hãy cho biết đây là công trình giao thông hàng hải nào trên thế giới?',
    clues: [
      'Dữ kiện 1: Ý tưởng đào một tuyến đường thủy xuyên qua dải đất hẹp này đã được hoàng đế Tây Ban Nha Karl V đề xuất từ năm 1534 và kỹ sư Pháp Ferdinand de Lesseps khởi công năm 1881 nhưng phải bỏ dở vì dịch sốt vàng da và địa hình núi đồi.',
      'Dữ kiện 2: Không giống kênh đào Suez nằm ngang mực nước biển, công trình này sử dụng hệ thống âu tàu (locks) nâng tàu biển lên cao 26 mét để đi qua hồ nhân tạo Gatun rồi hạ xuống ở đầu bên kia.',
      'Dữ kiện 3: Chính thức thông tuyến vào ngày 15 tháng 08 năm 1914 với chiều dài khoảng 82 km, giúp tàu thuyền không phải đi vòng qua mũi Sừng (Cape Horn) hiểm trở ở cực Nam châu Mỹ.',
      'Dữ kiện 4: Là tuyến đường thủy nhân tạo huyết mạch nối liền Đại Tây Dương (qua biển Caribe) và Thái Bình Dương.',
    ],
    answer: 'Kênh đào Panama',
    acceptedAnswers: ['Kenh dao Panama', 'Panama'],
    options: ['Kênh đào Suez', 'Kênh đào Panama', 'Kênh đào Kiel', 'Kênh đào Corinth'],
    explanation:
      'Kênh đào Panama dài khoảng 82 km cắt ngang eo đất Panama nối liền Đại Tây Dương và Thái Bình Dương.',
  },
  {
    id: 'tt-36',
    number: 4,
    timeLimitSec: 30,
    typeLabel: 'Câu 4 · Bài toán Quy luật Chữ số Tận cùng Lũy thừa',
    question:
      'Tìm chữ số tận cùng (chữ số hàng đơn vị) của tổng biểu thức số học sau: S = 2²⁰²⁵ + 3²⁰²⁶ + 7²⁰²⁷.',
    clues: [],
    answer: '4',
    acceptedAnswers: ['4', 'bon', 'chu so 4'],
    options: ['2', '4', '6', '8'],
    explanation:
      'Chu kỳ chữ số tận cùng là 4: 2²⁰²⁵ = 2^(4×506 + 1) tận cùng là 2; 3²⁰²⁶ = 3^(4×506 + 2) tận cùng là 9; 7²⁰²⁷ = 7^(4×506 + 3) tận cùng là 3. Tổng chữ số tận cùng: 2 + 9 + 3 = 14 => tận cùng là 4.',
  },

  // ==================== BỘ TĂNG TỐC 10 ====================
  {
    id: 'tt-37',
    number: 1,
    timeLimitSec: 15,
    typeLabel: 'Câu 1 · Sắp xếp Các Chiến thắng Quân sự Cổ - Trung đại Việt Nam',
    question:
      'Hãy sắp xếp 4 trận quyết chiến chiến lược sau trong lịch sử chống ngoại xâm của dân tộc theo đúng trình tự thời gian từ SỚM NHẤT đến MUỘN NHẤT:',
    clues: [
      'A. Chiến thắng Chi Lăng – Xương Giang',
      'B. Chiến thắng phòng tuyến sông Như Nguyệt',
      'C. Chiến thắng Rạch Gầm – Xoài Mút',
      'D. Chiến thắng Chương Dương – Hàm Tử – Tây Kết',
    ],
    answer: 'BDAC',
    acceptedAnswers: ['BDAC', 'B D A C', 'B-D-A-C'],
    options: ['BDAC', 'BADC', 'DBAC', 'BCDA'],
    explanation:
      'Phòng tuyến Như Nguyệt (1077 - B) -> Chương Dương - Hàm Tử (1285 - D) -> Chi Lăng - Xương Giang (1427 - A) -> Rạch Gầm - Xoài Mút (1785 - C).',
  },
  {
    id: 'tt-38',
    number: 2,
    timeLimitSec: 20,
    typeLabel: 'Câu 2 · Bài toán Tổ hợp Chia Kẹo & Nghiệm Nguyên Dương',
    question:
      'Có bao nhiêu bộ ba số nguyên dương (x, y, z) thỏa mãn phương trình x + y + z = 10 và cả ba số x, y, z đều là các số nguyên dương LẺ?',
    clues: [],
    answer: '0',
    acceptedAnswers: ['0', 'khong', 'khong co'],
    options: ['0', '6', '10', '15'],
    explanation:
      'Tổng của 3 số nguyên lẻ bất kỳ luôn là một số lẻ (lẻ + lẻ + lẻ = lẻ), trong khi 10 là số chẵn. Do đó không tồn tại bộ 3 số nguyên dương lẻ nào có tổng bằng 10 (Đáp án: 0).',
  },
  {
    id: 'tt-39',
    number: 3,
    timeLimitSec: 25,
    typeLabel: 'Câu 3 · Nhận diện Nguyên tố Hóa học qua 4 dữ kiện',
    question:
      'Từ 4 dữ kiện khoa học sau, hãy cho biết đây là nguyên tố hóa học nào?',
    clues: [
      'Dữ kiện 1: Tên gọi quốc tế của nguyên tố này bắt nguồn từ tiếng Hy Lạp "Kroma" (Chroma) có nghĩa là "màu sắc", do nhà hóa học người Pháp Louis Nicolas Vauquelin phát hiện năm 1797 trong khoáng vật crocoite.',
      'Dữ kiện 2: Là kim loại cứng nhất trong tất cả các kim loại tự nhiên (đạt 8,5 trên thang độ cứng Mohs), có ánh kim trắng sáng và rất bền trong không khí nhờ màng oxit bảo vệ.',
      'Dữ kiện 3: Là thành phần hợp kim bắt buộc (chiếm tối thiểu 10,5% khối lượng) để chế tạo thép không gỉ (Inox) và tạo nên sắc đỏ rực của đá quý Hồng ngọc (Ruby) cũng như sắc xanh lục của Ngọc lục bảo (Emerald).',
      'Dữ kiện 4: Nằm ở ô số 24, chu kỳ 4, nhóm VIB trong bảng tuần hoàn và có hai hợp chất oxit lưỡng tính/axit đặc trưng với số oxi hóa +3 (màu lục) và +6 (màu da cam/đỏ thẫm).',
    ],
    answer: 'Crom (Cr)',
    acceptedAnswers: ['Crom', 'Chromium', 'Cr', 'Crom (Cr)'],
    options: ['Titan (Ti)', 'Crom (Cr)', 'Niken (Ni)', 'Mangan (Mn)'],
    explanation:
      'Nguyên tố Crom (Cr, Z = 24) là kim loại cứng nhất, tạo nên các hợp chất đa sắc màu và là thành phần thiết yếu của thép không gỉ.',
  },
  {
    id: 'tt-40',
    number: 4,
    timeLimitSec: 30,
    typeLabel: 'Câu 4 · Bài toán Quang Hình học & Thấu kính Hội tụ',
    question:
      'Một vật sáng AB đặt vuông góc với trục chính của một thấu kính hội tụ có tiêu cự f = 15 cm. Qua thấu kính, vật cho một ảnh thật A\'B\' cao gấp 3 lần vật. Hỏi khoảng cách từ vật AB đến màn chắn hứng ảnh A\'B\' là bao nhiêu cm?',
    clues: [],
    answer: '80',
    acceptedAnswers: ['80', '80 cm', '80cm', 'tam muoi'],
    options: ['60', '75', '80', '90'],
    explanation:
      'Ảnh thật cao gấp 3 lần vật nên d\' = 3d. Áp dụng công thức thấu kính: 1/f = 1/d + 1/d\' = 1/d + 1/(3d) = 4/(3d) => d = 4f / 3 = 4 × 15 / 3 = 20 cm. Suy ra d\' = 3 × 20 = 60 cm. Khoảng cách từ vật đến màn ảnh L = d + d\' = 20 + 60 = 80 cm.',
  },
];

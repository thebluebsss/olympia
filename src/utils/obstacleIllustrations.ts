// Hệ thống Hình ảnh Chướng Ngại Vật: MỖI CHƯỚNG NGẠI VẬT LÀ 1 BỨC ẢNH THỐNG NHẤT DUY NHẤT (1200x750)
// được che bởi 5 mảnh ghép (Góc 1, Góc 2, Góc 3, Góc 4 và Ô Trung Tâm) và mở dần từng góc khi giải đúng hàng ngang.
// Tuyệt đối KHÔNG chia thành 4 ảnh rời ở 4 góc và KHÔNG in chữ lộ đáp án trên ảnh.

export const OBSTACLE_REAL_PHOTOS: Record<string, string> = {
  'vcnv-1': '/assets/vcnv/vcnv-1.jpg', // VỊNH HẠ LONG (1 bức tranh toàn cảnh Hòn Trống Mái, thuyền buồm, hang động Karst)
  'vcnv-2': '/assets/vcnv/vcnv-2.jpg', // PHỐ CỔ HỘI AN (1 bức tranh toàn cảnh Chùa Cầu, phố đèn lồng, thuyền hoa đăng sông Hoài)
  'vcnv-3': '/assets/vcnv/vcnv-3.jpg', // TRỐNG ĐỒNG ĐÔNG SƠN (1 bức tranh mặt trống đồng Đông Sơn & khuôn đúc cổ)
  'vcnv-4': '/assets/vcnv/vcnv-4.jpg', // ĐIỆN BIÊN PHỦ (1 bức tranh chiến thắng trên hầm Đờ Cát, xe đạp thồ, pháo binh, hoa ban Tây Bắc)
  'vcnv-5': '/assets/vcnv/vcnv-5.jpg', // TRUYỆN KIỀU (1 bức tranh Đại thi hào Nguyễn Du bên trang bản thảo, đàn tỳ bà, núi Hồng sông Lam)
  'vcnv-6': '/assets/vcnv/vcnv-6.jpg', // VINASAT 1 (1 bức tranh vệ tinh viễn thông trên quỹ đạo địa tĩnh phủ sóng Đông Nam Á)
  'vcnv-7': '/assets/vcnv/vcnv-7.jpg', // HỆ MẶT TRỜI (1 bức tranh toàn cảnh Mặt Trời, 8 hành tinh, vành đai tiểu hành tinh & sao chổi)
  'vcnv-8': '/assets/vcnv/vcnv-8.jpg', // PHỞ VIỆT NAM (1 bức tranh gánh phở xưa phố cổ Hà Nội, nồi nước dùng, bát phở, hoa hồi, quế, gừng)
  'vcnv-9': '/assets/vcnv/vcnv-9.jpg', // QUANG HỢP (1 bức tranh chiếc lá xanh dưới ánh nắng mặt trời, lục lạp, nước & bọt khí Oxy)
  'vcnv-10': '/assets/vcnv/vcnv-10.jpg', // ÁO DÀI VIỆT NAM (1 bức tranh thiếu nữ mặc áo dài truyền thống bên cổng thành cổ, hồ sen & khung cửi lụa)
  'vcnv-11': '/assets/vcnv/vcnv-11.jpg', // MẶT TRĂNG (1 bức tranh toàn cảnh bề mặt Mặt Trăng, tàu Apollo, dấu chân, Trái Đất & các pha trăng)
  'vcnv-12': '/assets/vcnv/vcnv-12.jpg', // PHÂN TỬ ADN (1 bức tranh chuỗi xoắn kép ADN đang nhân đôi và đóng xoắn quanh protein Histon)
  'vcnv-13': '/assets/vcnv/vcnv-13.jpg', // CHÙA MỘT CỘT (1 bức tranh toàn cảnh Liên Hoa Đài trên cột đá giữa hồ sen vuông Linh Chiểu)
  'vcnv-14': '/assets/vcnv/vcnv-14.jpg', // ĐỊNH LÝ PYTHAGORAS (1 bức tranh nhà toán học Pythagoras cầm compa bên tam giác vuông 3-4-5 trên đảo Samos)
  'vcnv-15': '/assets/vcnv/vcnv-15.jpg', // DÒNG ĐIỆN XOAY CHIỀU (1 bức tranh Nikola Tesla bên máy phát điện xoay chiều, dao động ký 3 pha & thủy điện)
  'vcnv-16': '/assets/vcnv/vcnv-16.jpg', // TUYÊN NGÔN ĐỘC LẬP (1 bức tranh Bác Hồ đọc Tuyên ngôn Độc lập tại Quảng trường Ba Đình lịch sử)
};

export const OBSTACLE_SVG_ILLUSTRATIONS: Record<string, string> = OBSTACLE_REAL_PHOTOS;

function normalizeAsciiText(raw: string): string {
  return (raw || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

export function resolveObstacleImageByKeyword(
  keywordDisplay?: string
): string | null {
  const kw = normalizeAsciiText(keywordDisplay || '');
  if (!kw) return null;
  if (kw.includes('vinh ha long') || kw === 'ha long')
    return '/assets/vcnv/vcnv-1.jpg';
  if (kw.includes('hoi an') || kw.includes('faifo'))
    return '/assets/vcnv/vcnv-2.jpg';
  if (kw.includes('dong son') || kw.includes('trong dong'))
    return '/assets/vcnv/vcnv-3.jpg';
  if (kw.includes('dien bien phu')) return '/assets/vcnv/vcnv-4.jpg';
  if (
    kw.includes('truyen kieu') ||
    kw.includes('nguyen du') ||
    kw.includes('doan truong tan thanh')
  )
    return '/assets/vcnv/vcnv-5.jpg';
  if (kw.includes('vinasat')) return '/assets/vcnv/vcnv-6.jpg';
  if (kw.includes('he mat troi') || kw.includes('thai duong he'))
    return '/assets/vcnv/vcnv-7.jpg';
  if (kw.includes('pho viet nam') || kw.includes('mon pho') || kw === 'pho')
    return '/assets/vcnv/vcnv-8.jpg';
  if (kw.includes('quang hop')) return '/assets/vcnv/vcnv-9.jpg';
  if (kw.includes('ao dai')) return '/assets/vcnv/vcnv-10.jpg';
  if (kw === 'mat trang' || kw === 'nguyet cau')
    return '/assets/vcnv/vcnv-11.jpg';
  if (
    kw.includes('phan tu adn') ||
    kw === 'adn' ||
    kw === 'dna' ||
    kw.includes('deoxyribonucleic')
  )
    return '/assets/vcnv/vcnv-12.jpg';
  if (
    kw.includes('chua mot cot') ||
    kw.includes('dien huu') ||
    kw.includes('lien hoa dai')
  )
    return '/assets/vcnv/vcnv-13.jpg';
  if (kw.includes('pythagoras') || kw.includes('pytago'))
    return '/assets/vcnv/vcnv-14.jpg';
  if (kw.includes('xoay chieu')) return '/assets/vcnv/vcnv-15.jpg';
  if (kw.includes('tuyen ngon doc lap')) return '/assets/vcnv/vcnv-16.jpg';
  if (kw.includes('bang tuan hoan') || kw.includes('mendeleev'))
    return '/assets/vcnv/vcnv-bangtuanhoan.jpg';
  if (kw.includes('truong sa') || kw.includes('hoang sa'))
    return '/assets/vcnv/vcnv-truongsa.jpg';
  if (kw.includes('tri tue nhan tao') || kw.includes('chatgpt'))
    return '/assets/vcnv/vcnv-trituenhantao.jpg';
  if (kw.includes('co do hue') || kw.includes('kinh thanh hue'))
    return '/assets/vcnv/vcnv-codohue.jpg';
  return null;
}

type UnifiedSceneType =
  | 'MARITIME_SHIP'
  | 'LIGHTHOUSE_ISLAND'
  | 'MOUNTAIN_PEAK'
  | 'RIVER_BRIDGE'
  | 'ANCIENT_TEMPLE'
  | 'BAMBOO_LOTUS'
  | 'BRONZE_DRUM'
  | 'HISTORICAL_VICTORY'
  | 'LITERATURE_SCROLL'
  | 'TRADITIONAL_MUSIC'
  | 'CULINARY_COFFEE'
  | 'SILK_CRAFT'
  | 'SPACE_COSMOS'
  | 'OPTICS_PRISM'
  | 'ELECTRIC_WAVE'
  | 'MECHANICS_GRAVITY'
  | 'CHEMISTRY_CRYSTAL'
  | 'BIOLOGY_HEART'
  | 'MEDICINE_MICROSCOPE'
  | 'DIGITAL_CHIP'
  | 'SPORTS_STADIUM'
  | 'GLOBAL_SOCIETY'
  | 'GEOMETRY_COMPASS'
  | 'RENEWABLE_ENERGY';

function classifyToUnifiedScene(rawText: string): UnifiedSceneType {
  const t = normalizeAsciiText(rawText);

  if (
    /\b(thuyen buom|nhung canh buom|bach dang|coc go|nha rong|latouche|tau|cang|shuinsen)\b/.test(
      t
    )
  ) {
    return 'MARITIME_SHIP';
  }
  if (
    /\b(hai dang|ke ga|dao phu quoc|con dao|mui ca mau|dat mui|truong sa|hoang sa|cu lao|vinh thai lan)\b/.test(
      t
    )
  ) {
    return 'LIGHTHOUSE_ISLAND';
  }
  if (
    /\b(phan xi pang|fansipan|hoang lien|sa pa|dong van|ha giang|lung cu|ma pi leng|tay bac|trang an|tam coc|nui)\b/.test(
      t
    )
  ) {
    return 'MOUNTAIN_PEAK';
  }
  if (
    /\b(cau long bien|cau hien luong|song hong|song da|ben hai|duong sat thong nhat|tau hoa)\b/.test(
      t
    )
  ) {
    return 'RIVER_BRIDGE';
  }
  if (
    /\b(van mieu|quoc tu giam|khue van cac|my son|cham pa|hoa lu|thanh nha ho|tay do|co do|yen tu|truc lam|tran nhan tong|nha nuoc van lang|hung vuong)\b/.test(
      t
    )
  ) {
    return 'ANCIENT_TEMPLE';
  }
  if (
    /\b(hoa sen|dong thap|cay tre|tre viet nam|can gio|rung sac|ngap man|vuon quoc gia|cuc phuong|mua thu|mua ha|nong thon moi)\b/.test(
      t
    )
  ) {
    return 'BAMBOO_LOTUS';
  }
  if (/\b(trong dong|dong son|sat that|tran hung dao|ngo quyen)\b/.test(t)) {
    return 'BRONZE_DRUM';
  }
  if (
    /\b(cu chi|dia dao|vo nguyen giap|thanh co|quang tri|dong khoi|ben tre|tan trao|viet bac|nam bo khang chien|quyet tu|thanh nien xung phong|dong loc|yen the|de tham|phao le|thang thanh nien|quoc huy)\b/.test(
      t
    )
  ) {
    return 'HISTORICAL_VICTORY';
  }
  if (
    /\b(de men|to hoai|vo chong a phu|nguyen khuyen|doan thi diem|chinh phu ngam|ho xuan huong|chu nom|nguyen binh|ngo tat to|tat den|khi con tu hu|to huu|ban thanh tu huu|binh dan hoc vu|cuon sach|trang quynh|ton su trong dao|kinh lao|nguyen ngoc ky|phong trao dong du|phan boi chau|phan chau trinh|song that luc bat)\b/.test(
      t
    )
  ) {
    return 'LITERATURE_SCROLL';
  }
  if (
    /\b(dan bau|doc huyen cam|don ca tai tu|vong co|cai luong|quan ho|bac ninh|hoi lim|mua roi nuoc|chu teu|noi vong tay lon|trinh cong son|dai tieng noi|vov|dien anh|lumiere)\b/.test(
      t
    )
  ) {
    return 'TRADITIONAL_MUSIC';
  }
  if (
    /\b(ca phe|buon ma thuot|robusta|phin|pho|sau rieng|tet nguyen dan|banh chung|thang chap|tao quan|doi dua|bep than)\b/.test(
      t
    )
  ) {
    return 'CULINARY_COFFEE';
  }
  if (
    /\b(ao dai|lua|van phuc|to tam|ken tam|gom su|bat trang)\b/.test(t)
  ) {
    return 'SILK_CRAFT';
  }
  if (
    /\b(lo den|ho den|hawking|tram vu tru|iss|mat trang|he mat troi|ve tinh|vinasat|chandrayaan|vu tru)\b/.test(
      t
    )
  ) {
    return 'SPACE_COSMOS';
  }
  if (
    /\b(thau kinh|hoi tu|khuc xa|cap quang|phan xa|cau vong|tan sac|may anh|ong kinh|camera)\b/.test(
      t
    )
  ) {
    return 'OPTICS_PRISM';
  }
  if (
    /\b(dien|xoay chieu|pin dien hoa|volta|no vi nhiet|dong co hoi nuoc|james watt)\b/.test(
      t
    )
  ) {
    return 'ELECTRIC_WAVE';
  }
  if (
    /\b(luc hap dan|newton|qua tao|thuyet tuong doi|einstein)\b/.test(t)
  ) {
    return 'MECHANICS_GRAVITY';
  }
  if (
    /\b(kim cuong|cacbon|than da|antracit|kim loai|sat|dung dich axit|ngu hanh)\b/.test(
      t
    )
  ) {
    return 'CHEMISTRY_CRYSTAL';
  }
  if (
    /\b(he tuan hoan|trai tim|hong cau|he ho hap|phoi|phe nang|he than kinh|noron|tuyen mo hoi)\b/.test(
      t
    )
  ) {
    return 'BIOLOGY_HEART';
  }
  if (
    /\b(thuoc khang sinh|fleming|penicillin|vac xin|benh dai|pasteur|hai thuong lan ong|le huu trac)\b/.test(
      t
    )
  ) {
    return 'MEDICINE_MICROSCOPE';
  }
  if (
    /\b(mang internet|wifi|vi mach|ban dan|silic|ma qr|the thao dien tu|esports|chatgpt|ai)\b/.test(
      t
    )
  ) {
    return 'DIGITAL_CHIP';
  }
  if (
    /\b(bong da|world cup|the van hoi|olympic|a van hoi|tro choi keo co|nguoi khuyet tat|paralympic)\b/.test(
      t
    )
  ) {
    return 'SPORTS_STADIUM';
  }
  if (
    /\b(lien hop quoc|so huu tri tue|wipo|tong san pham quoc noi|gdp|dan so vang|chi so phat trien con nguoi|hdi|nganh du lich|nha bao|so dien thoai khan cap|phong chong lu lut|dat nuoc cuba)\b/.test(
      t
    )
  ) {
    return 'GLOBAL_SOCIETY';
  }
  if (
    /\b(hinh tron|compa|pi|pythagoras|bang cuu chuong|nam nhuan|van ly truong thanh|kim tu thap|màu trắng|mau trang)\b/.test(
      t
    )
  ) {
    return 'GEOMETRY_COMPASS';
  }
  if (
    /\b(nang luong tai tao|tua bin|khai thac dau khi|bach ho|chat luong khong khi|aqi)\b/.test(
      t
    )
  ) {
    return 'RENEWABLE_ENERGY';
  }

  return 'ANCIENT_TEMPLE';
}

/**
 * Vẽ 1 BỨC TRANH TOÀN CẢNH THỐNG NHẤT DUY NHẤT (1200x750) — KHÔNG chia 4 khung rời, KHÔNG in chữ lộ đáp án.
 * Bố cục bức tranh trải rộng từ trung tâm ra cả 4 góc để khi mở từng góc 1, 2, 3, 4 sẽ lộ dần các phần của cùng 1 bức tranh.
 */
export function buildContextual5PanelObstacleSvg(params: {
  keywordDisplay?: string;
  title?: string;
  rowWords?: string[];
  rowQuestions?: string[];
  centerWord?: string;
  summaryExplanation?: string;
}): string {
  const kw = (params.keywordDisplay || '').trim();
  const title = (params.title || '').trim();
  const centerWord = (params.centerWord || '').trim();
  const summary = (params.summaryExplanation || '').trim();
  const scene = classifyToUnifiedScene(`${kw} ${centerWord} ${title} ${summary}`);

  const w = 1200;
  const h = 750;
  let body = '';

  switch (scene) {
    case 'MARITIME_SHIP':
      body = `
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#0f172a"/><stop offset="55%" stop-color="#1e3a8a"/><stop offset="100%" stop-color="#f59e0b"/>
          </linearGradient>
        </defs>
        <rect width="${w}" height="${h}" fill="url(#sky)"/>
        <!-- Sun & clouds in upper corners -->
        <circle cx="960" cy="170" r="95" fill="#fde047" opacity="0.9"/>
        <path d="M120 160 Q200 110 290 150 Q360 120 430 165 Z" fill="#fef3c7" opacity="0.35"/>
        <!-- Distant coastal mountains spanning left & right -->
        <polygon points="0,470 180,290 390,470" fill="#1e293b"/>
        <polygon points="820,470 1030,310 1200,470" fill="#1e293b"/>
        <!-- Ocean waves spanning bottom-left, center, bottom-right -->
        <rect y="465" width="${w}" height="285" fill="#0369a1"/>
        <path d="M0 530 Q180 490 360 530 T720 530 T1080 530 T1200 530 L1200 750 L0 750 Z" fill="#0284c7"/>
        <path d="M0 620 Q200 580 400 620 T800 620 T1200 620 L1200 750 L0 750 Z" fill="#0c4a6e"/>
        <!-- Grand Sailing Vessel spanning center and extending into all 4 quadrants -->
        <polygon points="290,485 910,485 810,605 390,605" fill="#78350f" stroke="#fde68a" stroke-width="5"/>
        <line x1="600" y1="120" x2="600" y2="485" stroke="#fde68a" stroke-width="10"/>
        <line x1="410" y1="190" x2="410" y2="485" stroke="#fde68a" stroke-width="8"/>
        <line x1="780" y1="180" x2="780" y2="485" stroke="#fde68a" stroke-width="8"/>
        <!-- Full Sails reaching into Top-Left, Center, and Top-Right -->
        <path d="M608 135 Q760 250 608 440 Z" fill="#dc2626" stroke="#fef08a" stroke-width="4"/>
        <path d="M592 150 Q435 265 592 440 Z" fill="#ea580c" stroke="#fef08a" stroke-width="4"/>
        <path d="M402 200 Q260 300 402 445 Z" fill="#f59e0b" stroke="#fef08a" stroke-width="4"/>
        <path d="M788 195 Q935 295 788 445 Z" fill="#f59e0b" stroke="#fef08a" stroke-width="4"/>
        <!-- Seagulls & Foam Waves in Corners -->
        <path d="M180 230 Q205 205 230 230 Q255 205 280 230" fill="none" stroke="#f8fafc" stroke-width="4" stroke-linecap="round"/>
        <path d="M140 660 Q260 630 380 660 M820 665 Q940 635 1060 665" fill="none" stroke="#bae6fd" stroke-width="5" stroke-linecap="round"/>
      `;
      break;

    case 'LIGHTHOUSE_ISLAND':
      body = `
        <rect width="${w}" height="${h}" fill="#082f49"/>
        <!-- Wide sweeping lighthouse beams across top-left and top-right corners -->
        <polygon points="600,210 0,30 0,340" fill="#fef08a" opacity="0.28"/>
        <polygon points="600,210 1200,30 1200,340" fill="#fef08a" opacity="0.28"/>
        <circle cx="210" cy="140" r="55" fill="#fde047" opacity="0.85"/>
        <!-- Turquoise Sea & Coral Reef Islands across bottom-left, center, bottom-right -->
        <rect y="480" width="${w}" height="270" fill="#0284c7"/>
        <path d="M60 560 Q230 450 410 560 Z" fill="#15803d" stroke="#86efac" stroke-width="3"/>
        <path d="M790 575 Q960 465 1140 575 Z" fill="#15803d" stroke="#86efac" stroke-width="3"/>
        <path d="M310 540 Q600 370 890 540 Z" fill="#166534" stroke="#bbf7d0" stroke-width="4"/>
        <!-- Central Lighthouse rising from island -->
        <polygon points="545,455 655,455 630,220 570,220" fill="#f8fafc" stroke="#334155" stroke-width="4"/>
        <polygon points="556,365 644,365 636,295 564,295" fill="#dc2626"/>
        <rect x="565" y="175" width="70" height="45" fill="#fef08a" stroke="#ca8a04" stroke-width="4"/>
        <polygon points="550,175 650,175 600,120" fill="#b91c1c"/>
        <circle cx="600" cy="198" r="18" fill="#ffffff"/>
      `;
      break;

    case 'MOUNTAIN_PEAK':
      body = `
        <rect width="${w}" height="${h}" fill="#172554"/>
        <circle cx="240" cy="165" r="85" fill="#fde047" opacity="0.88"/>
        <!-- Continuous Mountain Range spanning all 4 corners and center -->
        <polygon points="0,750 230,210 520,750" fill="#1e3a8a"/>
        <polygon points="680,750 970,195 1200,750" fill="#1d4ed8"/>
        <polygon points="220,750 600,95 980,750" fill="#0f766e" stroke="#5eead4" stroke-width="4"/>
        <polygon points="600,95 505,260 555,235 600,275 645,235 695,260" fill="#f8fafc" opacity="0.92"/>
        <!-- Golden terraced rice fields sweeping across bottom-left, center, bottom-right -->
        <path d="M80 560 Q600 450 1120 560" fill="none" stroke="#fde047" stroke-width="6"/>
        <path d="M40 630 Q600 520 1160 630" fill="none" stroke="#86efac" stroke-width="6"/>
        <path d="M0 700 Q600 590 1200 700" fill="none" stroke="#fbbf24" stroke-width="6"/>
      `;
      break;

    case 'RIVER_BRIDGE':
      body = `
        <rect width="${w}" height="${h}" fill="#2e1534"/>
        <circle cx="600" cy="220" r="120" fill="#fb923c" opacity="0.85"/>
        <rect y="470" width="${w}" height="280" fill="#0369a1"/>
        <!-- Continuous Multi-Span Steel Truss Bridge from Left Edge to Right Edge -->
        <path d="M0 430 Q200 180 400 430 Q600 160 800 430 Q1000 180 1200 430" fill="none" stroke="#e2e8f0" stroke-width="10"/>
        <line x1="0" y1="430" x2="1200" y2="430" stroke="#f8fafc" stroke-width="14"/>
        <line x1="200" y1="305" x2="200" y2="430" stroke="#cbd5e1" stroke-width="6"/>
        <line x1="600" y1="295" x2="600" y2="430" stroke="#cbd5e1" stroke-width="6"/>
        <line x1="1000" y1="305" x2="1000" y2="430" stroke="#cbd5e1" stroke-width="6"/>
        <rect x="382" y="430" width="36" height="220" fill="#94a3b8"/>
        <rect x="782" y="430" width="36" height="220" fill="#94a3b8"/>
        <path d="M120 590 Q600 530 1080 590 M200 670 Q600 610 1000 670" fill="none" stroke="#fde68a" stroke-width="4"/>
      `;
      break;

    case 'ANCIENT_TEMPLE':
      body = `
        <rect width="${w}" height="${h}" fill="#261418"/>
        <circle cx="600" cy="340" r="260" fill="#f59e0b" opacity="0.16"/>
        <!-- Ancient Banyan Foliage & Stone Walls in Left & Right Corners -->
        <circle cx="130" cy="210" r="140" fill="#14532d" opacity="0.85"/>
        <circle cx="1070" cy="210" r="140" fill="#14532d" opacity="0.85"/>
        <rect x="70" y="490" width="1060" height="90" rx="8" fill="#78350f" stroke="#fbbf24" stroke-width="4"/>
        <rect x="0" y="580" width="1200" height="170" fill="#0f5156"/>
        <!-- Grand Imperial Pavilion in Center with Side Gate Towers in Corners -->
        <rect x="420" y="310" width="40" height="180" fill="#b45309"/>
        <rect x="740" y="310" width="40" height="180" fill="#b45309"/>
        <circle cx="600" cy="395" r="62" fill="#fef3c7" stroke="#f59e0b" stroke-width="10"/>
        <path d="M310 315 Q600 215 890 315 L830 265 Q600 185 370 265 Z" fill="#dc2626" stroke="#fde68a" stroke-width="4"/>
        <path d="M390 225 Q600 125 810 225 L750 175 Q600 105 450 175 Z" fill="#b91c1c" stroke="#fde68a" stroke-width="4"/>
      `;
      break;

    case 'BAMBOO_LOTUS':
      body = `
        <rect width="${w}" height="${h}" fill="#06392f"/>
        <circle cx="960" cy="150" r="75" fill="#fef08a" opacity="0.85"/>
        <rect y="470" width="${w}" height="280" fill="#0f5156"/>
        <!-- Bamboo Groves in Left and Right Corners -->
        <g stroke="#4ade80" stroke-width="14" stroke-linecap="round">
          <line x1="120" y1="750" x2="160" y2="40"/><line x1="210" y1="750" x2="240" y2="70"/>
          <line x1="1080" y1="750" x2="1040" y2="40"/><line x1="990" y1="750" x2="960" y2="70"/>
        </g>
        <!-- Lotus Pads & Blooming Pink Lotuses across Center and Bottom Corners -->
        <ellipse cx="310" cy="610" rx="130" ry="32" fill="#15803d" stroke="#86efac" stroke-width="3"/>
        <ellipse cx="890" cy="610" rx="130" ry="32" fill="#15803d" stroke="#86efac" stroke-width="3"/>
        <ellipse cx="600" cy="560" rx="210" ry="48" fill="#166534" stroke="#86efac" stroke-width="4"/>
        <path d="M600 250 C535 330 540 440 600 475 C660 440 665 330 600 250 Z" fill="#f472b6" stroke="#fbcfe8" stroke-width="4"/>
        <path d="M485 315 C475 410 535 465 600 475 C575 395 545 345 485 315 Z" fill="#ec4899" stroke="#fbcfe8" stroke-width="4"/>
        <path d="M715 315 C725 410 665 465 600 475 C625 395 655 345 715 315 Z" fill="#ec4899" stroke="#fbcfe8" stroke-width="4"/>
        <circle cx="600" cy="425" r="34" fill="#facc15"/>
      `;
      break;

    case 'BRONZE_DRUM':
      body = `
        <rect width="${w}" height="${h}" fill="#291d12"/>
        <!-- Continuous Dong Son Bronze Drum Tympanum spanning the canvas -->
        <circle cx="600" cy="375" r="335" fill="#78350f" stroke="#f59e0b" stroke-width="10"/>
        <circle cx="600" cy="375" r="270" fill="none" stroke="#fbbf24" stroke-width="5" stroke-dasharray="18 10"/>
        <circle cx="600" cy="375" r="200" fill="none" stroke="#fde68a" stroke-width="4"/>
        <circle cx="600" cy="375" r="130" fill="none" stroke="#fbbf24" stroke-width="4" stroke-dasharray="12 8"/>
        <polygon points="600,265 624,342 702,318 644,375 702,432 624,408 600,485 576,408 498,432 556,375 498,318 576,342" fill="#fbbf24"/>
        <!-- Corner ceremonial flames & bronze vessels -->
        <circle cx="140" cy="150" r="65" fill="#f59e0b" opacity="0.35"/>
        <circle cx="1060" cy="150" r="65" fill="#f59e0b" opacity="0.35"/>
        <circle cx="140" cy="600" r="65" fill="#f59e0b" opacity="0.35"/>
        <circle cx="1060" cy="600" r="65" fill="#f59e0b" opacity="0.35"/>
      `;
      break;

    case 'HISTORICAL_VICTORY':
      body = `
        <rect width="${w}" height="${h}" fill="#3b0a11"/>
        <!-- Radiant golden rays extending from center into all 4 corners -->
        <g stroke="#f59e0b" stroke-width="18" opacity="0.22">
          <line x1="600" y1="375" x2="0" y2="0"/><line x1="600" y1="375" x2="1200" y2="0"/>
          <line x1="600" y1="375" x2="0" y2="750"/><line x1="600" y1="375" x2="1200" y2="750"/>
          <line x1="600" y1="375" x2="600" y2="0"/><line x1="600" y1="375" x2="600" y2="750"/>
          <line x1="600" y1="375" x2="0" y2="375"/><line x1="600" y1="375" x2="1200" y2="375"/>
        </g>
        <circle cx="600" cy="375" r="240" fill="#dc2626" stroke="#fde047" stroke-width="8"/>
        <polygon points="600,210 640,325 760,325 664,395 700,510 600,440 500,510 536,395 440,325 560,325" fill="#fde047"/>
        <path d="M220 620 Q600 710 980 620" fill="none" stroke="#fde68a" stroke-width="8" stroke-linecap="round"/>
      `;
      break;

    case 'LITERATURE_SCROLL':
      body = `
        <rect width="${w}" height="${h}" fill="#1e1b2e"/>
        <circle cx="210" cy="155" r="75" fill="#fef08a" opacity="0.88"/>
        <!-- Large Open Scroll/Book spanning center and corners -->
        <path d="M180 210 Q390 155 600 220 Q810 155 1020 210 L1020 580 Q810 525 600 590 Q390 525 180 580 Z" fill="#fef3c7" stroke="#d97706" stroke-width="8"/>
        <line x1="600" y1="220" x2="600" y2="590" stroke="#b45309" stroke-width="6"/>
        <g stroke="#78350f" stroke-width="6" stroke-linecap="round">
          <line x1="250" y1="300" x2="520" y2="300"/><line x1="250" y1="365" x2="500" y2="365"/><line x1="250" y1="430" x2="480" y2="430"/>
          <line x1="680" y1="300" x2="950" y2="300"/><line x1="680" y1="365" x2="930" y2="365"/><line x1="680" y1="430" x2="910" y2="430"/>
        </g>
        <!-- Calligraphy Brush & Inkstone -->
        <line x1="830" y1="95" x2="635" y2="385" stroke="#92400e" stroke-width="16" stroke-linecap="round"/>
        <polygon points="635,385 608,432 652,412" fill="#0f172a"/>
      `;
      break;

    case 'TRADITIONAL_MUSIC':
      body = `
        <rect width="${w}" height="${h}" fill="#1f1638"/>
        <!-- Concentric acoustic sound waves reaching all 4 corners -->
        <circle cx="600" cy="375" r="190" fill="none" stroke="#f59e0b" stroke-width="4" stroke-dasharray="14 10" opacity="0.7"/>
        <circle cx="600" cy="375" r="290" fill="none" stroke="#38bdf8" stroke-width="4" stroke-dasharray="12 12" opacity="0.55"/>
        <circle cx="600" cy="375" r="390" fill="none" stroke="#f472b6" stroke-width="4" stroke-dasharray="16 12" opacity="0.4"/>
        <!-- Traditional Lute & Monochord spanning across frame -->
        <circle cx="490" cy="430" r="115" fill="#d97706" stroke="#fde68a" stroke-width="6"/>
        <circle cx="490" cy="430" r="36" fill="#451a03"/>
        <line x1="490" y1="430" x2="885" y2="145" stroke="#fde68a" stroke-width="18" stroke-linecap="round"/>
        <line x1="490" y1="430" x2="885" y2="145" stroke="#ffffff" stroke-width="4"/>
      `;
      break;

    case 'CULINARY_COFFEE':
      body = `
        <rect width="${w}" height="${h}" fill="#2b1810"/>
        <!-- Warm tabletop & spices in corners -->
        <rect y="485" width="${w}" height="265" fill="#451a03"/>
        <circle cx="220" cy="590" r="55" fill="#78350f" stroke="#f59e0b" stroke-width="4"/>
        <circle cx="980" cy="590" r="55" fill="#78350f" stroke="#f59e0b" stroke-width="4"/>
        <!-- Large Steaming Ceramic Bowl / Cup in Center -->
        <ellipse cx="600" cy="560" rx="240" ry="45" fill="#78350f" stroke="#f59e0b" stroke-width="5"/>
        <path d="M410 380 L790 380 Q760 550 600 550 Q440 550 410 380 Z" fill="#fef3c7" stroke="#f59e0b" stroke-width="6"/>
        <path d="M510 330 Q475 230 525 130 M600 320 Q635 215 590 110 M690 330 Q725 230 675 130" fill="none" stroke="#fde68a" stroke-width="8" stroke-linecap="round"/>
      `;
      break;

    case 'SILK_CRAFT':
      body = `
        <rect width="${w}" height="${h}" fill="#2e1028"/>
        <!-- Flowing Silk Ribbons sweeping from Top-Left & Bottom-Left across Center to Right Corners -->
        <path d="M0 240 Q320 90 600 260 T1200 190" fill="none" stroke="#f472b6" stroke-width="42" stroke-linecap="round" opacity="0.82"/>
        <path d="M0 510 Q320 360 600 530 T1200 460" fill="none" stroke="#fbbf24" stroke-width="34" stroke-linecap="round" opacity="0.86"/>
        <polygon points="600,165 375,395 825,395" fill="#fde68a" stroke="#d97706" stroke-width="6"/>
        <ellipse cx="600" cy="395" rx="225" ry="30" fill="none" stroke="#b45309" stroke-width="6"/>
      `;
      break;

    case 'SPACE_COSMOS':
      body = `
        <rect width="${w}" height="${h}" fill="#050816"/>
        <!-- Stars, Nebula & Orbiting Bodies in all 4 corners -->
        <circle cx="190" cy="155" r="42" fill="#f59e0b" opacity="0.85"/>
        <circle cx="1020" cy="175" r="52" fill="#38bdf8" opacity="0.85"/>
        <circle cx="210" cy="585" r="36" fill="#a855f7" opacity="0.85"/>
        <circle cx="995" cy="575" r="44" fill="#fb7185" opacity="0.85"/>
        <ellipse cx="600" cy="375" rx="440" ry="155" transform="rotate(-16 600 375)" fill="none" stroke="#f59e0b" stroke-width="8"/>
        <ellipse cx="600" cy="375" rx="310" ry="105" transform="rotate(-16 600 375)" fill="none" stroke="#38bdf8" stroke-width="5" stroke-dasharray="16 10"/>
        <circle cx="600" cy="375" r="115" fill="#1d4ed8" stroke="#93c5fd" stroke-width="6"/>
      `;
      break;

    case 'OPTICS_PRISM':
      body = `
        <rect width="${w}" height="${h}" fill="#090d16"/>
        <!-- White Light Beam entering from Left Corners & Rainbow Spectrum expanding across Right Corners -->
        <line x1="0" y1="470" x2="515" y2="375" stroke="#ffffff" stroke-width="16" stroke-linecap="round"/>
        <line x1="670" y1="340" x2="1200" y2="140" stroke="#ef4444" stroke-width="14"/>
        <line x1="675" y1="358" x2="1200" y2="230" stroke="#f59e0b" stroke-width="14"/>
        <line x1="680" y1="376" x2="1200" y2="320" stroke="#eab308" stroke-width="14"/>
        <line x1="685" y1="394" x2="1200" y2="410" stroke="#22c55e" stroke-width="14"/>
        <line x1="690" y1="412" x2="1200" y2="500" stroke="#3b82f6" stroke-width="14"/>
        <line x1="695" y1="430" x2="1200" y2="590" stroke="#a855f7" stroke-width="14"/>
        <polygon points="600,195 435,515 765,515" fill="#38bdf8" fill-opacity="0.35" stroke="#bae6fd" stroke-width="8"/>
      `;
      break;

    case 'ELECTRIC_WAVE':
      body = `
        <rect width="${w}" height="${h}" fill="#081c24"/>
        <line x1="0" y1="375" x2="1200" y2="375" stroke="#1e293b" stroke-width="4"/>
        <line x1="600" y1="0" x2="600" y2="750" stroke="#1e293b" stroke-width="4"/>
        <!-- Continuous Multi-Phase Sine Waves spanning from Left Edge across Center to Right Edge -->
        <path d="M 0 375 Q 150 95 300 375 T 600 375 T 900 375 T 1200 375" fill="none" stroke="#38bdf8" stroke-width="12"/>
        <path d="M 0 375 Q 150 655 300 375 T 600 375 T 900 375 T 1200 375" fill="none" stroke="#fbbf24" stroke-width="9" stroke-dasharray="18 10"/>
        <polygon points="620,195 545,365 610,365 570,555 675,345 608,345" fill="#fde047"/>
      `;
      break;

    case 'MECHANICS_GRAVITY':
      body = `
        <rect width="${w}" height="${h}" fill="#111827"/>
        <circle cx="600" cy="375" r="310" fill="none" stroke="#38bdf8" stroke-width="4" stroke-dasharray="16 10"/>
        <circle cx="600" cy="375" r="210" fill="none" stroke="#f59e0b" stroke-width="5" stroke-dasharray="12 8"/>
        <circle cx="600" cy="405" r="95" fill="#dc2626" stroke="#fca5a5" stroke-width="5"/>
        <path d="M600 310 Q645 245 685 280 Q640 325 600 310 Z" fill="#22c55e"/>
        <circle cx="240" cy="200" r="45" fill="#3b82f6"/>
        <circle cx="960" cy="550" r="55" fill="#f59e0b"/>
      `;
      break;

    case 'CHEMISTRY_CRYSTAL':
      body = `
        <rect width="${w}" height="${h}" fill="#0b192c"/>
        <ellipse cx="600" cy="375" rx="420" ry="150" transform="rotate(28 600 375)" fill="none" stroke="#38bdf8" stroke-width="6"/>
        <ellipse cx="600" cy="375" rx="420" ry="150" transform="rotate(-28 600 375)" fill="none" stroke="#38bdf8" stroke-width="6"/>
        <circle cx="240" cy="185" r="24" fill="#fde047"/>
        <circle cx="960" cy="185" r="24" fill="#fde047"/>
        <circle cx="240" cy="565" r="24" fill="#fde047"/>
        <circle cx="960" cy="565" r="24" fill="#fde047"/>
        <polygon points="495,275 705,275 775,355 600,545 425,355" fill="#67e8f9" fill-opacity="0.78" stroke="#ecfeff" stroke-width="6"/>
      `;
      break;

    case 'BIOLOGY_HEART':
      body = `
        <rect width="${w}" height="${h}" fill="#2a0a18"/>
        <!-- Vascular network & cells extending into all 4 corners -->
        <circle cx="210" cy="180" r="55" fill="#e11d48" opacity="0.65"/>
        <circle cx="990" cy="180" r="55" fill="#e11d48" opacity="0.65"/>
        <circle cx="210" cy="570" r="55" fill="#e11d48" opacity="0.65"/>
        <circle cx="990" cy="570" r="55" fill="#e11d48" opacity="0.65"/>
        <path d="M600 535 C405 405 380 235 505 235 C565 235 600 295 600 295 C600 295 635 235 695 235 C820 235 795 405 600 535 Z" fill="#e11d48" stroke="#fda4af" stroke-width="6"/>
        <polyline points="40,395 430,395 495,265 555,485 625,315 675,395 1160,395" fill="none" stroke="#fef08a" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
      `;
      break;

    case 'MEDICINE_MICROSCOPE':
      body = `
        <rect width="${w}" height="${h}" fill="#06283d"/>
        <circle cx="600" cy="375" r="265" fill="#0f172a" stroke="#38bdf8" stroke-width="8"/>
        <circle cx="210" cy="175" r="65" fill="#22c55e" opacity="0.45"/>
        <circle cx="990" cy="175" r="65" fill="#38bdf8" opacity="0.45"/>
        <circle cx="210" cy="575" r="65" fill="#f59e0b" opacity="0.45"/>
        <circle cx="990" cy="575" r="65" fill="#a855f7" opacity="0.45"/>
        <rect x="572" y="225" width="56" height="300" rx="10" fill="#f8fafc"/>
        <rect x="450" y="347" width="300" height="56" rx="10" fill="#f8fafc"/>
      `;
      break;

    case 'DIGITAL_CHIP':
      body = `
        <rect width="${w}" height="${h}" fill="#091326"/>
        <!-- Circuit traces radiating from Center Silicon Die to all 4 corners -->
        <g stroke="#38bdf8" stroke-width="6" fill="none">
          <polyline points="440,300 240,300 120,160"/><polyline points="440,375 100,375"/><polyline points="440,450 240,450 120,590"/>
          <polyline points="760,300 960,300 1080,160"/><polyline points="760,375 1100,375"/><polyline points="760,450 960,450 1080,590"/>
          <polyline points="525,215 525,110 340,60"/><polyline points="675,215 675,110 860,60"/>
          <polyline points="525,535 525,640 340,690"/><polyline points="675,535 675,640 860,690"/>
        </g>
        <rect x="440" y="215" width="320" height="320" rx="28" fill="#1e3a8a" stroke="#60a5fa" stroke-width="8"/>
        <rect x="515" y="290" width="170" height="170" rx="16" fill="#fbbf24"/>
      `;
      break;

    case 'SPORTS_STADIUM':
      body = `
        <rect width="${w}" height="${h}" fill="#064e3b"/>
        <!-- Full-bleed Green Stadium Pitch spanning all 4 corners and center -->
        <rect x="70" y="55" width="1060" height="640" rx="20" fill="none" stroke="#a7f3d0" stroke-width="7"/>
        <line x1="600" y1="55" x2="600" y2="695" stroke="#a7f3d0" stroke-width="6"/>
        <rect x="70" y="215" width="170" height="320" fill="none" stroke="#a7f3d0" stroke-width="6"/>
        <rect x="960" y="215" width="170" height="320" fill="none" stroke="#a7f3d0" stroke-width="6"/>
        <circle cx="600" cy="375" r="135" fill="none" stroke="#a7f3d0" stroke-width="7"/>
        <circle cx="600" cy="375" r="55" fill="#fbbf24" stroke="#ffffff" stroke-width="6"/>
      `;
      break;

    case 'GLOBAL_SOCIETY':
      body = `
        <rect width="${w}" height="${h}" fill="#0c2340"/>
        <circle cx="600" cy="375" r="260" fill="#0284c7" stroke="#bae6fd" stroke-width="7"/>
        <ellipse cx="600" cy="375" rx="130" ry="260" fill="none" stroke="#bae6fd" stroke-width="5"/>
        <line x1="340" y1="375" x2="860" y2="375" stroke="#bae6fd" stroke-width="5"/>
        <line x1="375" y1="245" x2="825" y2="245" stroke="#bae6fd" stroke-width="4"/>
        <line x1="375" y1="505" x2="825" y2="505" stroke="#bae6fd" stroke-width="4"/>
        <circle cx="600" cy="375" r="330" fill="none" stroke="#fbbf24" stroke-width="5" stroke-dasharray="18 10"/>
      `;
      break;

    case 'GEOMETRY_COMPASS':
      body = `
        <rect width="${w}" height="${h}" fill="#1c1917"/>
        <circle cx="600" cy="375" r="275" fill="none" stroke="#f59e0b" stroke-width="6" stroke-dasharray="16 10"/>
        <polygon points="390,515 810,515 390,195" fill="#fbbf24" fill-opacity="0.26" stroke="#fde047" stroke-width="8"/>
        <rect x="390" y="465" width="50" height="50" fill="none" stroke="#fde047" stroke-width="5"/>
      `;
      break;

    case 'RENEWABLE_ENERGY':
      body = `
        <rect width="${w}" height="${h}" fill="#0c4a6e"/>
        <circle cx="230" cy="175" r="85" fill="#facc15"/>
        <rect y="520" width="${w}" height="230" fill="#15803d"/>
        <!-- Three Wind Turbines across Left, Center, and Right -->
        <g stroke="#f8fafc" stroke-width="12" stroke-linecap="round">
          <line x1="600" y1="265" x2="600" y2="555"/><line x1="600" y1="265" x2="600" y2="95"/><line x1="600" y1="265" x2="745" y2="355"/><line x1="600" y1="265" x2="455" y2="355"/>
          <line x1="260" y1="335" x2="260" y2="555"/><line x1="260" y1="335" x2="260" y2="215"/><line x1="260" y1="335" x2="365" y2="395"/><line x1="260" y1="335" x2="155" y2="395"/>
          <line x1="940" y1="335" x2="940" y2="555"/><line x1="940" y1="335" x2="940" y2="215"/><line x1="940" y1="335" x2="1045" y2="395"/><line x1="940" y1="335" x2="835" y2="395"/>
        </g>
      `;
      break;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${body}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function resolveObstacleImageUrl(
  puzzleId: string,
  currentImageUrl?: string,
  keywordDisplay?: string,
  title?: string,
  rowWords?: string[],
  centerWord?: string,
  summaryExplanation?: string,
  rowQuestions?: string[]
): string {
  // 1. Check direct vcnv-1..vcnv-16 ID match (single unified panoramic paintings)
  if (puzzleId && OBSTACLE_REAL_PHOTOS[puzzleId]) {
    return OBSTACLE_REAL_PHOTOS[puzzleId];
  }
  // 2. Check if keyword matches one of our 20 local high-res single unified illustrations
  const byKeyword = resolveObstacleImageByKeyword(keywordDisplay);
  if (byKeyword) {
    return byKeyword;
  }
  // 3. Check if currentImageUrl is a local /assets/vcnv/ file or a Wikimedia Commons single photo
  if (currentImageUrl) {
    if (currentImageUrl.startsWith('/assets/vcnv/')) {
      return currentImageUrl;
    }
    if (currentImageUrl.startsWith('https://thumb.wikimedia.org/')) {
      return currentImageUrl.replace(
        'https://thumb.wikimedia.org/',
        'https://upload.wikimedia.org/'
      );
    }
    if (currentImageUrl.startsWith('https://upload.wikimedia.org/')) {
      return currentImageUrl;
    }
  }
  // 4. Build a single unified full-canvas (1200x750) panoramic illustration of the obstacle
  return buildContextual5PanelObstacleSvg({
    keywordDisplay,
    title,
    rowWords,
    rowQuestions,
    centerWord,
    summaryExplanation,
  });
}

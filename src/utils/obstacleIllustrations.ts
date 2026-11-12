// Bộ tranh gợi ý suy luận 1 bước (5 mảnh ghép: 4 góc + Ô Trung Tâm) cho Vòng 2: Vượt Chướng Ngại Vật
// Kết hợp 20 tranh sơn dầu/minh họa 5 mảnh ghép chất lượng cao trong /assets/vcnv/ và bộ sinh tranh SVG 5 mảnh ghép theo ngữ cảnh cho hơn 150 bộ đề VCNV lịch sử & nâng cao.

export const OBSTACLE_REAL_PHOTOS: Record<string, string> = {
  'vcnv-1': '/assets/vcnv/vcnv-1.jpg', // VỊNH HẠ LONG
  'vcnv-2': '/assets/vcnv/vcnv-2.jpg', // PHỐ CỔ HỘI AN
  'vcnv-3': '/assets/vcnv/vcnv-3.jpg', // TRỐNG ĐỒNG ĐÔNG SƠN
  'vcnv-4': '/assets/vcnv/vcnv-4.jpg', // ĐIỆN BIÊN PHỦ
  'vcnv-5': '/assets/vcnv/vcnv-5.jpg', // TRUYỆN KIỀU (Đại thi hào Nguyễn Du)
  'vcnv-6': '/assets/vcnv/vcnv-6.jpg', // VINASAT 1
  'vcnv-7': '/assets/vcnv/vcnv-7.jpg', // HỆ MẶT TRỜI
  'vcnv-8': '/assets/vcnv/vcnv-8.jpg', // PHỞ VIỆT NAM (Gánh phở xưa & hoa hồi, quế, thảo quả)
  'vcnv-9': '/assets/vcnv/vcnv-9.jpg', // QUANG HỢP
  'vcnv-10': '/assets/vcnv/vcnv-10.jpg', // ÁO DÀI VIỆT NAM
  'vcnv-11': '/assets/vcnv/vcnv-11.jpg', // MẶT TRĂNG
  'vcnv-12': '/assets/vcnv/vcnv-12.jpg', // PHÂN TỬ ADN
  'vcnv-13': '/assets/vcnv/vcnv-13.jpg', // CHÙA MỘT CỘT
  'vcnv-14': '/assets/vcnv/vcnv-14.jpg', // ĐỊNH LÝ PYTHAGORAS
  'vcnv-15': '/assets/vcnv/vcnv-15.jpg', // DÒNG ĐIỆN XOAY CHIỀU
  'vcnv-16': '/assets/vcnv/vcnv-16.jpg', // TUYÊN NGÔN ĐỘC LẬP
};

export const OBSTACLE_SVG_ILLUSTRATIONS: Record<string, string> = OBSTACLE_REAL_PHOTOS;

function normalizeAsciiKeyword(raw: string): string {
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
  const kw = normalizeAsciiKeyword(keywordDisplay || '');
  if (!kw) return null;
  if (kw.includes('ha long')) return '/assets/vcnv/vcnv-1.jpg';
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
  if (kw.includes('ao dai') || kw.includes('lua to tam'))
    return '/assets/vcnv/vcnv-10.jpg';
  if (kw.includes('mat trang') || kw.includes('chandrayaan'))
    return '/assets/vcnv/vcnv-11.jpg';
  if (
    kw.includes('adn') ||
    kw.includes('dna') ||
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
  if (kw.includes('xoay chieu') || kw.includes('tesla'))
    return '/assets/vcnv/vcnv-15.jpg';
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

function escapeXml(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function redactKeywordFromHint(hint: string, keyword: string): string {
  let cleaned = (hint || '')
    .replace(/^Từ khóa Chướng Ngại Vật là[^—\-]+([—\-]\s*)?/i, '')
    .replace(/^Chướng ngại vật là[^—\-]+([—\-]\s*)?/i, '')
    .trim();
  if (keyword && keyword.length >= 2) {
    const escapedKw = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    cleaned = cleaned.replace(new RegExp(escapedKw, 'gi'), '•••');
  }
  return cleaned || 'Suy luận từ mối liên hệ giao thoa giữa 4 góc gợi ý và Ô Trung Tâm.';
}

function wrapTextLines(text: string, maxCharsPerLine: number, maxLines: number): string[] {
  const words = (text || '').split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';
  for (const w of words) {
    if ((current + ' ' + w).trim().length <= maxCharsPerLine) {
      current = (current + ' ' + w).trim();
    } else {
      if (current) lines.push(current);
      current = w;
      if (lines.length >= maxLines - 1) break;
    }
  }
  const consumedWords = lines.join(' ').split(/\s+/).filter(Boolean).length;
  const remaining = words.slice(consumedWords).join(' ');
  if (remaining) {
    lines.push(
      remaining.length > maxCharsPerLine
        ? remaining.slice(0, maxCharsPerLine - 1) + '…'
        : remaining
    );
  }
  return lines.slice(0, maxLines);
}

/**
 * Tạo tranh minh họa 5 mảnh ghép (4 góc + Ô Trung Tâm) chuyên biệt cho từng bộ câu hỏi VCNV
 * để khi mở bất kỳ góc nào (1, 2, 3, 4) hoặc Ô Trung Tâm, người chơi luôn nhìn thấy hình vẽ
 * và dữ kiện gợi ý bắc cầu sát với đáp án của đúng bộ đề đó.
 */
export function buildContextual5PanelObstacleSvg(params: {
  keywordDisplay?: string;
  title?: string;
  rowWords?: string[];
  centerWord?: string;
  summaryExplanation?: string;
}): string {
  const kw = (params.keywordDisplay || '').trim().toUpperCase();
  const charCount = kw.replace(/\s+/g, '').length;
  const title = (params.title || 'Vượt Chướng Ngại Vật Olympia').trim();
  const r1 = (params.rowWords?.[0] || 'Dữ kiện 1').trim().toUpperCase();
  const r2 = (params.rowWords?.[1] || 'Dữ kiện 2').trim().toUpperCase();
  const r3 = (params.rowWords?.[2] || 'Dữ kiện 3').trim().toUpperCase();
  const r4 = (params.rowWords?.[3] || 'Dữ kiện 4').trim().toUpperCase();
  const centerClue = (params.centerWord || '').trim().toUpperCase();

  const indirectHint = redactKeywordFromHint(
    params.summaryExplanation || '',
    kw
  );
  const hintLines = wrapTextLines(indirectHint, 42, 3);
  const titleLines = wrapTextLines(title, 34, 2);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 750" width="1200" height="750">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#071326"/>
      <stop offset="50%" stop-color="#0d2240"/>
      <stop offset="100%" stop-color="#09172b"/>
    </linearGradient>
    <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fde68a"/>
      <stop offset="50%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>
    <radialGradient id="centerGlow" cx="50%" cy="50%" r="55%">
      <stop offset="0%" stop-color="#1e3a8a" stop-opacity="0.92"/>
      <stop offset="100%" stop-color="#0a1628" stop-opacity="0.98"/>
    </radialGradient>
  </defs>

  <rect width="1200" height="750" fill="url(#bgGrad)"/>

  <!-- Decorative Grid & Connecting Lines -->
  <g stroke="#38bdf8" stroke-opacity="0.16" stroke-width="2">
    <line x1="600" y1="0" x2="600" y2="750"/>
    <line x1="0" y1="375" x2="1200" y2="375"/>
    <line x1="250" y1="160" x2="600" y2="375" stroke="url(#goldGrad)" stroke-opacity="0.45" stroke-dasharray="8 6"/>
    <line x1="950" y1="160" x2="600" y2="375" stroke="url(#goldGrad)" stroke-opacity="0.45" stroke-dasharray="8 6"/>
    <line x1="250" y1="590" x2="600" y2="375" stroke="url(#goldGrad)" stroke-opacity="0.45" stroke-dasharray="8 6"/>
    <line x1="950" y1="590" x2="600" y2="375" stroke="url(#goldGrad)" stroke-opacity="0.45" stroke-dasharray="8 6"/>
  </g>

  <!-- QUADRANT 1 (Top-Left) -->
  <g transform="translate(28, 24)">
    <rect width="540" height="320" rx="20" fill="#0f2547" stroke="#38bdf8" stroke-opacity="0.5" stroke-width="2.5"/>
    <circle cx="95" cy="115" r="52" fill="#173766" stroke="#38bdf8" stroke-width="2.5"/>
    <path d="M72 115 L95 82 L118 115 L95 148 Z" fill="none" stroke="#fde68a" stroke-width="3"/>
    <circle cx="95" cy="115" r="12" fill="#38bdf8"/>
    <text x="172" y="82" fill="#7dd3fc" font-family="sans-serif" font-size="18" font-weight="800" letter-spacing="1.5">MẢNH GHÉP GÓC 1 · LIÊN KẾT HÀNG NGANG 1</text>
    <text x="172" y="132" fill="#ffffff" font-family="sans-serif" font-size="31" font-weight="900">${escapeXml(r1)}</text>
    <text x="172" y="172" fill="#cbd5e1" font-family="sans-serif" font-size="17" font-weight="600">Chủ đề: ${escapeXml(titleLines[0] || title)}</text>
    <rect x="40" y="212" width="460" height="72" rx="12" fill="#09172e" stroke="#1e3a5f" stroke-width="1.5"/>
    <text x="60" y="255" fill="#fde68a" font-family="sans-serif" font-size="18" font-weight="700">${escapeXml(hintLines[0] || '')}</text>
  </g>

  <!-- QUADRANT 2 (Top-Right) -->
  <g transform="translate(632, 24)">
    <rect width="540" height="320" rx="20" fill="#0f2547" stroke="#38bdf8" stroke-opacity="0.5" stroke-width="2.5"/>
    <circle cx="445" cy="115" r="52" fill="#173766" stroke="#38bdf8" stroke-width="2.5"/>
    <circle cx="445" cy="115" r="30" fill="none" stroke="#fde68a" stroke-width="3" stroke-dasharray="10 6"/>
    <circle cx="445" cy="115" r="9" fill="#fde68a"/>
    <text x="40" y="82" fill="#7dd3fc" font-family="sans-serif" font-size="18" font-weight="800" letter-spacing="1.5">MẢNH GHÉP GÓC 2 · LIÊN KẾT HÀNG NGANG 2</text>
    <text x="40" y="132" fill="#ffffff" font-family="sans-serif" font-size="31" font-weight="900">${escapeXml(r2)}</text>
    <text x="40" y="172" fill="#cbd5e1" font-family="sans-serif" font-size="17" font-weight="600">CNV gồm ${charCount} chữ cái</text>
    <rect x="40" y="212" width="460" height="72" rx="12" fill="#09172e" stroke="#1e3a5f" stroke-width="1.5"/>
    <text x="60" y="255" fill="#fde68a" font-family="sans-serif" font-size="18" font-weight="700">${escapeXml(hintLines[1] || hintLines[0] || '')}</text>
  </g>

  <!-- QUADRANT 3 (Bottom-Left) -->
  <g transform="translate(28, 406)">
    <rect width="540" height="320" rx="20" fill="#0f2547" stroke="#38bdf8" stroke-opacity="0.5" stroke-width="2.5"/>
    <circle cx="95" cy="205" r="52" fill="#173766" stroke="#38bdf8" stroke-width="2.5"/>
    <polygon points="95,168 128,225 62,225" fill="none" stroke="#fde68a" stroke-width="3"/>
    <text x="40" y="70" fill="#fde68a" font-family="sans-serif" font-size="18" font-weight="700">${escapeXml(hintLines[2] || hintLines[0] || '')}</text>
    <text x="172" y="175" fill="#7dd3fc" font-family="sans-serif" font-size="18" font-weight="800" letter-spacing="1.5">MẢNH GHÉP GÓC 3 · LIÊN KẾT HÀNG NGANG 3</text>
    <text x="172" y="225" fill="#ffffff" font-family="sans-serif" font-size="31" font-weight="900">${escapeXml(r3)}</text>
    <text x="172" y="265" fill="#cbd5e1" font-family="sans-serif" font-size="17" font-weight="600">Gợi ý bắc cầu suy luận Chướng Ngại Vật</text>
  </g>

  <!-- QUADRANT 4 (Bottom-Right) -->
  <g transform="translate(632, 406)">
    <rect width="540" height="320" rx="20" fill="#0f2547" stroke="#38bdf8" stroke-opacity="0.5" stroke-width="2.5"/>
    <circle cx="445" cy="205" r="52" fill="#173766" stroke="#38bdf8" stroke-width="2.5"/>
    <rect x="420" y="180" width="50" height="50" rx="8" fill="none" stroke="#fde68a" stroke-width="3"/>
    <text x="40" y="70" fill="#fde68a" font-family="sans-serif" font-size="18" font-weight="700">${escapeXml(centerClue ? `Mắt xích trung tâm: ${centerClue}` : (hintLines[0] || ''))}</text>
    <text x="40" y="175" fill="#7dd3fc" font-family="sans-serif" font-size="18" font-weight="800" letter-spacing="1.5">MẢNH GHÉP GÓC 4 · LIÊN KẾT HÀNG NGANG 4</text>
    <text x="40" y="225" fill="#ffffff" font-family="sans-serif" font-size="31" font-weight="900">${escapeXml(r4)}</text>
    <text x="40" y="265" fill="#cbd5e1" font-family="sans-serif" font-size="17" font-weight="600">Kết nối 4 góc để suy ra CNV (${charCount} chữ cái)</text>
  </g>

  <!-- CENTER PIECE (Ô Trung Tâm) -->
  <g transform="translate(340, 195)">
    <rect width="520" height="360" rx="26" fill="url(#centerGlow)" stroke="url(#goldGrad)" stroke-width="4"/>
    <circle cx="260" cy="82" r="40" fill="#172554" stroke="#f59e0b" stroke-width="2.5"/>
    <polygon points="260,50 270,72 294,72 275,86 282,108 260,94 238,108 245,86 226,72 250,72" fill="#fbbf24"/>
    <text x="260" y="152" text-anchor="middle" fill="#fde68a" font-family="sans-serif" font-size="17" font-weight="800" letter-spacing="2">GỢI Ý Ô TRUNG TÂM · CHỦ ĐỀ</text>
    <text x="260" y="190" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="25" font-weight="900">${escapeXml(titleLines[0] || title)}</text>
    ${
      titleLines[1]
        ? `<text x="260" y="222" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="23" font-weight="900">${escapeXml(titleLines[1])}</text>`
        : `<text x="260" y="226" text-anchor="middle" fill="#38bdf8" font-family="sans-serif" font-size="22" font-weight="800">${escapeXml(centerClue ? `Từ khóa Ô Trung Tâm: ${centerClue}` : `Chướng ngại vật: ${charCount} chữ cái`)}</text>`
    }
    <text x="260" y="274" text-anchor="middle" fill="#e2e8f0" font-family="sans-serif" font-size="16" font-weight="600">${escapeXml(hintLines[0] || '')}</text>
    <text x="260" y="302" text-anchor="middle" fill="#e2e8f0" font-family="sans-serif" font-size="16" font-weight="600">${escapeXml(hintLines[1] || '')}</text>
    <text x="260" y="335" text-anchor="middle" fill="#fbbf24" font-family="sans-serif" font-size="16" font-weight="800">${escapeXml(`${r1}  •  ${r2}  •  ${r3}  •  ${r4}`)}</text>
  </g>
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function resolveObstacleImageUrl(
  puzzleId: string,
  currentImageUrl?: string,
  keywordDisplay?: string,
  title?: string,
  rowWords?: string[],
  centerWord?: string,
  summaryExplanation?: string
): string {
  // 1. Check direct vcnv-1..vcnv-16 ID match
  if (puzzleId && OBSTACLE_REAL_PHOTOS[puzzleId]) {
    return OBSTACLE_REAL_PHOTOS[puzzleId];
  }
  // 2. Check if keyword matches one of our 20 local high-res illustrations
  const byKeyword = resolveObstacleImageByKeyword(keywordDisplay);
  if (byKeyword) {
    return byKeyword;
  }
  // 3. Check if currentImageUrl is already a local /assets/vcnv/ illustration or a contextual SVG
  if (
    currentImageUrl &&
    (currentImageUrl.startsWith('/assets/vcnv/') ||
      currentImageUrl.startsWith('data:image/svg+xml'))
  ) {
    return currentImageUrl;
  }
  // 4. Build a dedicated 5-panel contextual SVG clue board for this specific puzzle
  return buildContextual5PanelObstacleSvg({
    keywordDisplay,
    title,
    rowWords,
    centerWord,
    summaryExplanation,
  });
}

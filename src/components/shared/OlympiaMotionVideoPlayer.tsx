import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Film, Lock, Eye } from 'lucide-react';

export interface OlympiaMotionVideoPlayerProps {
  clipId?: string;
  category?: string;
  questionText: string;
  clues?: string[];
  durationSec: number;
  roundLabel: string;
  isHost: boolean;
  timerStarted?: boolean;
  isTimerRunning?: boolean;
  externalElapsedSec?: number;
  syncWithTimer?: boolean;
}

export type ResolvedSimTheme =
  | 'OPTICS_DIFFRACTION'
  | 'PHYSICS_WAVES_DOPPLER'
  | 'CHEMISTRY_LAB'
  | 'BIOLOGY_DNA'
  | 'HISTORY_CHRONICLE'
  | 'GEOGRAPHY_HYDROLOGY'
  | 'MATH_COORDINATE'
  | 'ASTRONOMY_ORBIT';

export function resolveSimTheme(
  clipId: string | undefined,
  category: string | undefined,
  questionText: string
): { theme: ResolvedSimTheme; badgeTitle: string; subtitle: string } {
  const raw = `${clipId || ''} ${category || ''} ${questionText}`.toLowerCase();

  if (
    raw.includes('nhiễu xạ') ||
    raw.includes('khúc xạ') ||
    raw.includes('tán sắc') ||
    raw.includes('phản xạ toàn phần') ||
    raw.includes('cáp quang') ||
    raw.includes('gương cầu') ||
    raw.includes('thấu kính') ||
    raw.includes('ánh sáng') ||
    raw.includes('optics')
  ) {
    return {
      theme: 'OPTICS_DIFFRACTION',
      badgeTitle: 'MÔ PHỎNG QUANG HỌC & SÓNG ÁNH SÁNG',
      subtitle: 'Quan sát đường truyền tia sáng và mặt sóng qua hệ quang học',
    };
  }

  if (
    raw.includes('doppler') ||
    raw.includes('sóng điện từ') ||
    raw.includes('dao động') ||
    raw.includes('con lắc') ||
    raw.includes('tần số') ||
    raw.includes('vận tốc') ||
    raw.includes('vật lý') ||
    raw.includes('physics')
  ) {
    return {
      theme: 'PHYSICS_WAVES_DOPPLER',
      badgeTitle: 'BĂNG HÌNH THÍ NGHIỆM VẬT LÝ',
      subtitle: 'Mô phỏng lan truyền sóng, tần số và chuyển động cơ – điện từ',
    };
  }

  if (
    raw.includes('hóa học') ||
    raw.includes('benzen') ||
    raw.includes('quỳ tím') ||
    raw.includes('axit') ||
    raw.includes('bazơ') ||
    raw.includes('thủy ngân') ||
    raw.includes('kết tủa') ||
    raw.includes('nguyên tố') ||
    raw.includes('phân tử') ||
    raw.includes('chemistry')
  ) {
    return {
      theme: 'CHEMISTRY_LAB',
      badgeTitle: 'BĂNG HÌNH THỰC NGHIỆM HÓA HỌC',
      subtitle: 'Quan sát cấu trúc phân tử và sự biến đổi trạng thái trong bình phản ứng',
    };
  }

  if (
    raw.includes('adn') ||
    raw.includes('dna') ||
    raw.includes('nhiễm sắc thể') ||
    raw.includes('tế bào') ||
    raw.includes('sinh học') ||
    raw.includes('quang hợp') ||
    raw.includes('hô hấp') ||
    raw.includes('biology')
  ) {
    return {
      theme: 'BIOLOGY_DNA',
      badgeTitle: 'MÔ PHỎNG SINH HỌC PHÂN TỬ & TẾ BÀO',
      subtitle: 'Cấu trúc xoắn kép ADN và động học phân bào trong cơ thể sống',
    };
  }

  if (
    raw.includes('hệ mặt trời') ||
    raw.includes('hành tinh') ||
    raw.includes('thiên văn') ||
    raw.includes('nhật thực') ||
    raw.includes('nguyệt thực') ||
    raw.includes('vũ trụ')
  ) {
    return {
      theme: 'ASTRONOMY_ORBIT',
      badgeTitle: 'MÔ PHỎNG THIÊN VĂN & QUỸ ĐẠO VŨ TRỤ',
      subtitle: 'Chuyển động quỹ đạo elip và tương tác hấp dẫn giữa các thiên thể',
    };
  }

  if (
    raw.includes('địa lý') ||
    raw.includes('kênh đào') ||
    raw.includes('panama') ||
    raw.includes('sông') ||
    raw.includes('mê kông') ||
    raw.includes('biển') ||
    raw.includes('đèo') ||
    raw.includes('geography')
  ) {
    return {
      theme: 'GEOGRAPHY_HYDROLOGY',
      badgeTitle: 'BĂNG HÌNH ĐỊA LÝ & THỦY VĂN',
      subtitle: 'Bản đồ động học dòng chảy tự nhiên và công trình hàng hải',
    };
  }

  if (
    raw.includes('toán') ||
    raw.includes('parabol') ||
    raw.includes('dãy số') ||
    raw.includes('hàm số') ||
    raw.includes('hình vuông') ||
    raw.includes('chữ số') ||
    raw.includes('math')
  ) {
    return {
      theme: 'MATH_COORDINATE',
      badgeTitle: 'MÔ PHỎNG HÌNH HỌC & QUY LUẬT TOÁN HỌC',
      subtitle: 'Biểu diễn trực quan quỹ đạo đồ thị và cấu trúc số học trên mặt phẳng tọa độ',
    };
  }

  return {
    theme: 'HISTORY_CHRONICLE',
    badgeTitle: 'BĂNG HÌNH TƯ LIỆU LỊCH SỬ – VĂN HÓA',
    subtitle: 'Dòng thời gian diễn biến sự kiện và dữ kiện nhân vật lịch sử',
  };
}

export const OlympiaMotionVideoPlayer: React.FC<OlympiaMotionVideoPlayerProps> = ({
  clipId,
  category,
  questionText,
  clues = [],
  durationSec,
  roundLabel,
  isHost,
  timerStarted = true,
  isTimerRunning = false,
  externalElapsedSec,
  syncWithTimer = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [localPlaying, setLocalPlaying] = useState<boolean>(false);
  const [localElapsedSec, setLocalElapsedSec] = useState<number>(0);
  const [mcPreviewUnlocked, setMcPreviewUnlocked] = useState<boolean>(false);
  const lastFramePerfRef = useRef<number>(performance.now());

  const safeDuration = Math.max(10, durationSec || 20);
  const { theme, badgeTitle, subtitle } = resolveSimTheme(clipId, category, questionText);

  const filteredClues = clues.filter((c) => {
    const lower = c.toLowerCase().trim();
    return (
      !lower.includes('gợi ý') &&
      !lower.startsWith('quy luật') &&
      !lower.startsWith('công thức') &&
      !lower.startsWith('áp dụng')
    );
  });

  // Reset local playback when question changes
  useEffect(() => {
    setLocalElapsedSec(0);
    setMcPreviewUnlocked(false);
    setLocalPlaying(!syncWithTimer);
  }, [questionText, clipId, syncWithTimer]);

  // Auto-start local playback when room timer starts
  useEffect(() => {
    if (timerStarted && isTimerRunning) {
      setLocalPlaying(true);
    }
  }, [timerStarted, isTimerRunning]);

  // Local timer loop when not strictly driven by externalElapsedSec or when MC previews
  useEffect(() => {
    if (syncWithTimer && isTimerRunning && typeof externalElapsedSec === 'number') {
      return;
    }
    if (!localPlaying) return;

    lastFramePerfRef.current = performance.now();
    let rafId = 0;

    const tick = (now: number) => {
      const dt = Math.max(0, (now - lastFramePerfRef.current) / 1000);
      lastFramePerfRef.current = now;
      setLocalElapsedSec((prev) => {
        const next = prev + dt;
        if (next >= safeDuration) {
          setLocalPlaying(false);
          return safeDuration;
        }
        return next;
      });
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [localPlaying, safeDuration, syncWithTimer, isTimerRunning, externalElapsedSec]);

  const activeElapsedSec =
    syncWithTimer && isTimerRunning && typeof externalElapsedSec === 'number'
      ? Math.min(safeDuration, Math.max(0, externalElapsedSec))
      : syncWithTimer && timerStarted && !isTimerRunning && !localPlaying
      ? safeDuration
      : localElapsedSec;

  const progressRatio = Math.min(1, Math.max(0, activeElapsedSec / safeDuration));

  // Canvas 60fps scientific/historical animation renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    const render = (nowMs: number) => {
      const w = canvas.width;
      const h = canvas.height;
      const t = activeElapsedSec + (nowMs % 1000) * 0.0004;

      // Studio dark navy gradient backdrop
      const bgGrad = ctx.createLinearGradient(0, 0, w, h);
      bgGrad.addColorStop(0, '#040d1a');
      bgGrad.addColorStop(0.5, '#0a192f');
      bgGrad.addColorStop(1, '#071324');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Subtle coordinate grid
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
      ctx.lineWidth = 1;
      const gridStep = 36;
      for (let x = 0; x < w; x += gridStep) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridStep) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      const cx = w * 0.5;
      const cy = h * 0.44;

      if (theme === 'OPTICS_DIFFRACTION') {
        // Incident planar waves on left + barrier with slit + circular Huygens diffracted waves + spectrum rays
        const barrierX = w * 0.38;
        const slitHalf = 22;

        // Planar wave fronts approaching barrier
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.55)';
        ctx.lineWidth = 2;
        const waveSpacing = 26;
        const phaseShift = (nowMs * 0.06) % waveSpacing;
        for (let x = 40 + phaseShift; x < barrierX - 6; x += waveSpacing) {
          ctx.beginPath();
          ctx.moveTo(x, cy - 95);
          ctx.lineTo(x, cy + 95);
          ctx.stroke();
        }

        // Slit barrier wall
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(barrierX, cy - 115);
        ctx.lineTo(barrierX, cy - slitHalf);
        ctx.moveTo(barrierX, cy + slitHalf);
        ctx.lineTo(barrierX, cy + 115);
        ctx.stroke();

        // Diffracted circular wave fronts expanding to the right
        for (let r = phaseShift; r < w * 0.55; r += waveSpacing) {
          if (r < 6) continue;
          const alpha = Math.max(0.12, 0.75 - r / (w * 0.6));
          ctx.strokeStyle = `rgba(52, 211, 153, ${alpha})`;
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.arc(barrierX, cy, r, -Math.PI * 0.42, Math.PI * 0.42);
          ctx.stroke();
        }

        // Interference intensity curve on far-right screen
        const screenX = w * 0.84;
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.85)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let dy = -105; dy <= 105; dy += 3) {
          const beta = dy * 0.065;
          const sinc = beta === 0 ? 1 : Math.sin(beta) / beta;
          const intensity = Math.pow(sinc, 2) * 55;
          const px = screenX + intensity;
          const py = cy + dy;
          if (dy === -105) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      } else if (theme === 'PHYSICS_WAVES_DOPPLER') {
        // Moving wave source + pendulum harmonic motion + live sinusoidal trace
        const srcX = w * 0.35 + Math.sin(nowMs * 0.0018) * 55;
        const srcY = cy;
        for (let i = 1; i <= 6; i++) {
          const r = ((nowMs * 0.05 + i * 24) % 140) + 8;
          const offset = (r / 140) * 38;
          ctx.strokeStyle = `rgba(56, 189, 248, ${Math.max(0.15, 0.8 - r / 155)})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(srcX - offset, srcY, r, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(srcX, srcY, 8, 0, Math.PI * 2);
        ctx.fill();

        // Harmonic sine wave on right
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let x = w * 0.56; x < w - 35; x += 3) {
          const y = cy + Math.sin((x - w * 0.56) * 0.055 - nowMs * 0.006) * 48;
          if (x === w * 0.56) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      } else if (theme === 'CHEMISTRY_LAB') {
        // Rotating hexagonal molecular ring (left) + titration flask with color shift (right)
        const hexX = w * 0.32;
        const hexY = cy;
        const radius = 58;
        const rot = nowMs * 0.0009;

        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const ang = rot + (i * Math.PI) / 3;
          const vx = hexX + Math.cos(ang) * radius;
          const vy = hexY + Math.sin(ang) * radius;
          if (i === 0) ctx.moveTo(vx, vy);
          else ctx.lineTo(vx, vy);
        }
        ctx.closePath();
        ctx.stroke();

        // Inner delocalized ring
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.7)';
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.arc(hexX, hexY, radius * 0.62, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        for (let i = 0; i < 6; i++) {
          const ang = rot + (i * Math.PI) / 3;
          const vx = hexX + Math.cos(ang) * radius;
          const vy = hexY + Math.sin(ang) * radius;
          ctx.fillStyle = '#0ea5e9';
          ctx.beginPath();
          ctx.arc(vx, vy, 9, 0, Math.PI * 2);
          ctx.fill();
        }

        // Reaction Erlenmeyer beaker on right
        const bx = w * 0.68;
        const by = cy + 10;
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(bx - 52, by - 55, 104, 105);

        // Liquid level with dynamic indicator color
        const hue = Math.round(200 + progressRatio * 120);
        ctx.fillStyle = `hsla(${hue}, 85%, 55%, 0.45)`;
        ctx.fillRect(bx - 50, by - 5, 100, 53);

        // Rising bubbles
        for (let b = 0; b < 7; b++) {
          const bubbleY = by + 40 - (((nowMs * 0.04 + b * 19) % 45));
          const bubbleX = bx - 35 + b * 12 + Math.sin(nowMs * 0.004 + b) * 4;
          ctx.fillStyle = 'rgba(255,255,255,0.65)';
          ctx.beginPath();
          ctx.arc(bubbleX, bubbleY, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (theme === 'BIOLOGY_DNA') {
        // Animated 3D-projected double helix DNA across the stage
        const startX = w * 0.14;
        const endX = w * 0.86;
        const pairs = 22;
        const stepX = (endX - startX) / pairs;

        for (let i = 0; i <= pairs; i++) {
          const x = startX + i * stepX;
          const phase = i * 0.42 - nowMs * 0.0032;
          const y1 = cy + Math.sin(phase) * 56;
          const y2 = cy - Math.sin(phase) * 56;

          // Hydrogen bond rung
          ctx.strokeStyle =
            i % 2 === 0 ? 'rgba(251, 191, 36, 0.55)' : 'rgba(52, 211, 153, 0.55)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x, y1);
          ctx.lineTo(x, y2);
          ctx.stroke();

          // Strand 1 node
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(x, y1, 5.5, 0, Math.PI * 2);
          ctx.fill();

          // Strand 2 node
          ctx.fillStyle = '#f43f5e';
          ctx.beginPath();
          ctx.arc(x, y2, 5.5, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (theme === 'ASTRONOMY_ORBIT') {
        // Heliocentric elliptical orbits with planets & Kepler area sweep
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(cx, cy, 20, 0, Math.PI * 2);
        ctx.fill();

        const orbits = [
          { rx: 85, ry: 48, speed: 0.0022, color: '#38bdf8', r: 6 },
          { rx: 145, ry: 82, speed: 0.0013, color: '#34d399', r: 8 },
          { rx: 210, ry: 112, speed: 0.0008, color: '#f43f5e', r: 7 },
        ];
        orbits.forEach((orb) => {
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.28)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.ellipse(cx, cy, orb.rx, orb.ry, 0, 0, Math.PI * 2);
          ctx.stroke();

          const ang = nowMs * orb.speed;
          const px = cx + Math.cos(ang) * orb.rx;
          const py = cy + Math.sin(ang) * orb.ry;
          ctx.fillStyle = orb.color;
          ctx.beginPath();
          ctx.arc(px, py, orb.r, 0, Math.PI * 2);
          ctx.fill();
        });
      } else if (theme === 'GEOGRAPHY_HYDROLOGY') {
        // River bifurcation / canal lock elevation diagram
        ctx.strokeStyle = '#0ea5e9';
        ctx.lineWidth = 18;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(w * 0.12, cy);
        ctx.quadraticCurveTo(w * 0.38, cy, w * 0.48, cy);
        ctx.stroke();

        // Upper branch (Sông Tiền / Canal chamber 1)
        ctx.beginPath();
        ctx.moveTo(w * 0.46, cy);
        ctx.quadraticCurveTo(w * 0.65, cy - 58, w * 0.88, cy - 42);
        ctx.stroke();

        // Lower branch (Sông Hậu / Canal chamber 2)
        ctx.beginPath();
        ctx.moveTo(w * 0.46, cy);
        ctx.quadraticCurveTo(w * 0.65, cy + 58, w * 0.88, cy + 42);
        ctx.stroke();

        // Moving flow particles along river branches
        for (let p = 0; p < 10; p++) {
          const u = ((nowMs * 0.00035 + p * 0.1) % 1);
          const px = w * 0.12 + u * (w * 0.76);
          const branchOffset =
            u < 0.45 ? 0 : (p % 2 === 0 ? -1 : 1) * Math.sin(((u - 0.45) / 0.55) * Math.PI * 0.7) * 48;
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(px, cy + branchOffset, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (theme === 'MATH_COORDINATE') {
        // Coordinate axes Oxy + dynamic Parabola & geometric sequence bars
        const ox = w * 0.34;
        const oy = cy + 45;
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(ox - 120, oy);
        ctx.lineTo(ox + 120, oy);
        ctx.moveTo(ox, oy - 135);
        ctx.lineTo(ox, oy + 35);
        ctx.stroke();

        // Parabola y = a*x^2
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let dx = -95; dx <= 95; dx += 3) {
          const py = oy - 15 - (dx * dx) * 0.011;
          if (dx === -95) ctx.moveTo(ox + dx, py);
          else ctx.lineTo(ox + dx, py);
        }
        ctx.stroke();

        // Moving tangent point on parabola
        const sweepX = Math.sin(nowMs * 0.002) * 80;
        const sweepY = oy - 15 - sweepX * sweepX * 0.011;
        ctx.fillStyle = '#34d399';
        ctx.beginPath();
        ctx.arc(ox + sweepX, sweepY, 6.5, 0, Math.PI * 2);
        ctx.fill();

        // Sequence progression bars on the right
        const baseRightX = w * 0.58;
        const heights = [24, 42, 68, 98, 132];
        heights.forEach((bh, idx) => {
          const bx = baseRightX + idx * 38;
          const activeBar = progressRatio >= idx * 0.18;
          ctx.fillStyle = activeBar ? 'rgba(56, 189, 248, 0.75)' : 'rgba(51, 65, 85, 0.6)';
          ctx.fillRect(bx, oy - bh, 24, bh);
        });
      } else {
        // HISTORY_CHRONICLE: Radar compass + progressive historical timeline nodes
        const radarX = w * 0.25;
        const radarY = cy;
        [32, 62, 92].forEach((r) => {
          ctx.strokeStyle = 'rgba(251, 191, 36, 0.28)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(radarX, radarY, r, 0, Math.PI * 2);
          ctx.stroke();
        });

        const sweepAng = nowMs * 0.0022;
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(radarX, radarY);
        ctx.lineTo(radarX + Math.cos(sweepAng) * 92, radarY + Math.sin(sweepAng) * 92);
        ctx.stroke();

        // 4 timeline nodes on right
        const tlStartX = w * 0.46;
        const tlEndX = w * 0.88;
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(tlStartX, cy);
        ctx.lineTo(tlEndX, cy);
        ctx.stroke();

        for (let i = 0; i < 4; i++) {
          const nx = tlStartX + (i / 3) * (tlEndX - tlStartX);
          const unlocked = progressRatio >= i * 0.24;
          ctx.fillStyle = unlocked ? '#fbbf24' : '#1e293b';
          ctx.beginPath();
          ctx.arc(nx, cy, 12, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = unlocked ? '#fef08a' : '#475569';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      // Bottom progressive caption overlay inside the video canvas
      ctx.fillStyle = 'rgba(2, 6, 23, 0.84)';
      ctx.fillRect(0, h - 78, w, 78);
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.35)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, h - 78);
      ctx.lineTo(w, h - 78);
      ctx.stroke();

      // Determine active caption based on progressRatio and clues
      let captionHeader = subtitle;
      let captionBody = questionText;
      if (filteredClues.length > 0) {
        const clueIdx = Math.min(
          filteredClues.length - 1,
          Math.floor(progressRatio * filteredClues.length)
        );
        captionHeader = `MỐC BĂNG HÌNH ${clueIdx + 1}/${filteredClues.length} (Đã mở ${Math.min(
          filteredClues.length,
          clueIdx + 1
        )} dữ kiện)`;
        captionBody = filteredClues[clueIdx];
      } else {
        const stageNum = Math.min(4, Math.floor(progressRatio * 4) + 1);
        captionHeader = `PHÂN CẢNH MÔ PHỎNG ${stageNum}/4 · ${badgeTitle}`;
        captionBody = subtitle;
      }

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(captionHeader, 18, h - 52);

      ctx.fillStyle = '#f8fafc';
      ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
      const maxChars = 92;
      const cleanLine =
        captionBody.length > maxChars
          ? captionBody.slice(0, maxChars).trim() + '...'
          : captionBody;
      ctx.fillText(cleanLine, 18, h - 26);

      void t;
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [theme, activeElapsedSec, progressRatio, badgeTitle, subtitle, questionText, filteredClues]);

  const isLockedForContestant =
    syncWithTimer && !timerStarted && !isTimerRunning && (!isHost || !mcPreviewUnlocked);

  const visibleClueCount =
    filteredClues.length > 0
      ? timerStarted || !syncWithTimer || (isHost && mcPreviewUnlocked)
        ? Math.max(
            1,
            Math.min(
              filteredClues.length,
              Math.floor((activeElapsedSec / safeDuration) * filteredClues.length) + 1
            )
          )
        : 0
      : 0;

  return (
    <div className="rounded-2xl overflow-hidden border-2 border-amber-400/60 bg-slate-950 shadow-2xl">
      {/* Top Broadcast Studio Bar */}
      <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-extrabold text-amber-300">
          <Film className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{badgeTitle}</span>
          <span className="text-slate-500">·</span>
          <span className="text-sky-300 font-semibold">{roundLabel}</span>
        </div>

        <div className="flex items-center gap-3">
          {syncWithTimer && !timerStarted && isHost && (
            <button
              type="button"
              onClick={() => {
                setMcPreviewUnlocked((v) => !v);
                setLocalElapsedSec(0);
                setLocalPlaying(true);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/50 text-sky-200 text-[11px] font-bold cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              {mcPreviewUnlocked ? '[MC] Ẩn xem trước' : '[MC] Xem thử băng hình'}
            </button>
          )}
          <span className="font-mono text-xs font-bold text-emerald-300 tabular-nums">
            {activeElapsedSec.toFixed(1)}s / {safeDuration.toFixed(1)}s
          </span>
        </div>
      </div>

      {/* Main 16:9 Video Viewport */}
      <div className="relative aspect-16/7 sm:aspect-16/6 w-full bg-[#040d1a]">
        <canvas
          ref={canvasRef}
          width={860}
          height={320}
          className="w-full h-full object-cover block"
        />

        {isLockedForContestant && (
          <div className="absolute inset-0 bg-slate-950/92 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/15 border border-amber-400/50 flex items-center justify-center text-amber-300">
              <Lock className="w-6 h-6" />
            </div>
            <div className="text-sm sm:text-base font-extrabold text-white">
              BĂNG HÌNH CÂU HỎI ĐANG CHỜ MC PHÁT ĐỒNG BỘ
            </div>
            <p className="text-xs text-slate-300 max-w-md">
              Ngay khi MC Chủ Phòng bấm <strong>"Bắt Đầu Chạy Đồng Hồ"</strong>, băng hình chuyển động và các mốc dữ kiện sẽ tự động phát đồng bộ trên màn hình của cả 4 Nhà Leo Núi.
            </p>
          </div>
        )}
      </div>

      {/* Bottom Video Timeline Scrubber & Controls */}
      <div className="px-4 py-2.5 bg-slate-900/95 border-t border-slate-800 space-y-2">
        <div className="flex items-center gap-3">
          {(!syncWithTimer || !isTimerRunning) && !isLockedForContestant && (
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (localElapsedSec >= safeDuration) {
                    setLocalElapsedSec(0);
                  }
                  setLocalPlaying((p) => !p);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold cursor-pointer"
              >
                {localPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5" /> Tạm dừng
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-slate-950" /> Phát video
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setLocalElapsedSec(0);
                  setLocalPlaying(true);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Xem lại
              </button>
            </div>
          )}

          {/* Timeline Progress Track */}
          <div className="relative flex-1 h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-sky-400 via-emerald-400 to-amber-400 transition-all duration-75"
              style={{ width: `${Math.round(progressRatio * 100)}%` }}
            />
          </div>

          <span className="text-[11px] font-mono text-slate-400 shrink-0 tabular-nums">
            {Math.round(progressRatio * 100)}%
          </span>
        </div>

        {/* Progressive Clue Cards Synchronized with Video Playback */}
        {filteredClues.length > 0 && !isLockedForContestant && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {filteredClues.map((clue, idx) => {
              const isRevealed = idx < visibleClueCount || isHost;
              const unlockSec = Math.round((idx / filteredClues.length) * safeDuration);
              return (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl border text-xs transition-all ${
                    idx < visibleClueCount
                      ? 'bg-slate-950 border-amber-400/50 text-slate-100'
                      : isHost
                      ? 'bg-slate-950/60 border-slate-800 text-slate-400'
                      : 'bg-slate-950/40 border-slate-900 text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold text-amber-300 mb-0.5">
                    <span>MỐC BĂNG HÌNH #{idx + 1} (00:{String(unlockSec).padStart(2, '0')}s)</span>
                    <span>
                      {idx < visibleClueCount
                        ? '● ĐÃ MỞ'
                        : isHost
                        ? '👁 MC XEM TRƯỚC'
                        : '🔒 CHỜ ĐẾN GIÂY ' + unlockSec + 's'}
                    </span>
                  </div>
                  <div className="font-medium leading-relaxed">
                    {isRevealed ? clue : 'Dữ kiện trên băng hình sẽ tự động hé lộ tại mốc thời gian này...'}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

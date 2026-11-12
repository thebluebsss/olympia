# 🏆 Đường Lên Đỉnh Olympia - Real-time Multiplayer Game

[![Status](https://img.shields.io/badge/status-running-success)](http://localhost:3000)
[![Questions](https://img.shields.io/badge/questions-21,649-blue)](./questions.csv)
[![Node](https://img.shields.io/badge/node-%3E%3D18-green)](https://nodejs.org)
[![License](https://img.shields.io/badge/license-MIT-orange)](./LICENSE)

Hệ thống thi đấu Olympia trực tuyến 4 người với **21,649+ câu hỏi**, hỗ trợ real-time multiplayer qua WebSocket và cross-device sync.

## 🎯 Tính năng chính

### 🎮 Game Features
- ✅ **Real-time Multiplayer**: 4 người chơi cùng lúc với WebSocket
- ✅ **4 Vòng Thi Chuẩn**: Khởi Động, VCNV, Tăng Tốc, Về Đích
- ✅ **Cross-Device Sync**: Chơi trên nhiều thiết bị, đồng bộ tức thì
- ✅ **Bot AI**: Chế độ Demo với 3 bot thông minh
- ✅ **Âm thanh hiệu ứng**: Buzzer, chuông, tiếng vỗ tay
- ✅ **Tie-breaker**: Xử lý hòa điểm tự động

### 📚 Question Management
- ✅ **21,649 câu hỏi** từ file CSV
- ✅ **11 chủ đề**: Toán, Lý, Hóa, Sinh, Văn, Sử, Địa, Anh, Nghệ thuật, Logic, Hiểu biết chung
- ✅ **Tìm kiếm & lọc** theo vòng thi, chủ đề
- ✅ **Export JSON** cho câu hỏi đã chọn
- ✅ **Auto-normalize** đáp án (có dấu, không dấu)

## 🚀 Quick Start

### 1. Cài đặt (Lần đầu)
```bash
cd c:\file\hoc\olympia
npm install --legacy-peer-deps
```

### 2. Chạy Server
```bash
npm run dev
```

Server sẽ chạy tại **http://localhost:3000**

### 3. Truy cập

**Option 1**: Mở file `OPEN_APP.html` (đã tự động mở trong trình duyệt)

**Option 2**: Truy cập trực tiếp:
- 🎮 **Game**: http://localhost:3000
- 📚 **Quản lý câu hỏi**: http://localhost:3000/questions-manager.html

## 📖 Hướng dẫn chơi

### Tạo phòng mới
1. Nhập **Họ tên** và **Trường**
2. Nhấn **🎮 Tạo Phòng Mới**
3. Chia sẻ **Mã phòng 6 ký tự** cho bạn bè
4. Đợi đủ 4 người → Chủ phòng nhấn **Bắt đầu**

### Tham gia phòng
1. Nhập **Họ tên** và **Trường**
2. Nhấn **🚪 Tham Gia Phòng**
3. Nhập **Mã phòng** từ bạn bè
4. Nhấn **Tham gia ngay**

### Chơi Demo nhanh
Nhấn **⚡ Khởi Động Trận Đấu Demo** để chơi ngay với 3 bot!

## 🎯 Luật chơi 4 vòng

### Vòng 1: Khởi Động
- **Cá nhân** (24 câu): Lần lượt 4 người × 6 câu (+10đ/đúng)
- **Chung** (12 câu): Bấm chuông giành quyền trả lời (+10đ đúng, -5đ sai)

### Vòng 2: Vượt Chướng Ngại Vật
- 4 Hàng ngang + Từ khóa chính
- Mở hàng ngang: +10đ/người trả lời đúng
- Giải CNV: +60đ → +50đ → +40đ → +30đ → +20đ

### Vòng 3: Tăng Tốc
- 4 câu hỏi tự luận, chấm thời gian 0.01s
- Nhanh nhất: +40đ | Thứ 2: +30đ | Thứ 3: +20đ | Thứ 4: +10đ

### Vòng 4: Về Đích
- Lần lượt chọn gói 3 câu (20đ hoặc 30đ)
- ⭐ **Ngôi Sao Hy Vọng**: Đúng x2, sai trừ điểm câu
- Cướp điểm: Người khác sai → 3 người còn lại bấm chuông

## 📊 Thống kê dữ liệu

| Vòng thi | Số câu | Tỷ lệ |
|----------|--------|-------|
| Khởi Động (KD) | 16,604 | 76.7% |
| VCNV | 806 | 3.7% |
| Về Đích (VD) | 4,239 | 19.6% |
| **TỔNG** | **21,649** | **100%** |

### Phân bổ theo chủ đề
- 🔢 Toán học
- ⚛️ Vật lý
- 🧪 Hóa học
- 🧬 Sinh học
- 📖 Văn học
- 📜 Lịch sử
- 🌍 Địa lý
- 🇬🇧 Tiếng Anh
- 🎨 Nghệ thuật & Thể thao
- 💡 Hiểu biết chung
- 🧩 Tư duy logic

## 🏗️ Kiến trúc kỹ thuật

### Frontend
- **React 19** + **TypeScript**
- **Tailwind CSS 4** + **Framer Motion**
- **WebSocket Client** + **Broadcast Channel API**

### Backend
- **Express.js** server
- **WebSocket (ws)** cho real-time
- **In-memory room storage**
- **Server-authoritative game logic**

### Build Tools
- **Vite 8** - Lightning fast HMR
- **esbuild** - Ultra-fast bundling
- **tsx** - TypeScript execution

## 📁 Cấu trúc Project

```
c:\file\hoc\olympia\
├── 📄 OPEN_APP.html          ← Mở đây để truy cập nhanh!
├── 📄 SETUP_GUIDE.md         ← Hướng dẫn chi tiết
├── 📄 QUESTIONS_README.md    ← Chi tiết về câu hỏi
├── 📄 questions.csv          ← 21,649 câu gốc
│
├── 📂 src/
│   ├── 📄 App.tsx            ← Main React app
│   ├── 📂 components/        ← React components
│   │   ├── QuestionManager.tsx
│   │   ├── Round1KhoiDong.tsx
│   │   ├── Round2VCNV.tsx
│   │   ├── Round3TangToc.tsx
│   │   └── Round4VeDich.tsx
│   ├── 📂 data/
│   │   ├── olympiaQuestions.ts
│   │   └── olympiaQuestionsFromCsv.ts  ← 21,649 câu đã convert
│   ├── 📂 utils/
│   │   ├── olympiaEngine.ts        ← Game logic
│   │   ├── browserClusterSync.ts   ← Real-time sync
│   │   └── soundEffects.ts
│   └── 📂 types/
│       └── olympia.ts
│
├── 📂 scripts/
│   └── convertCsv.cjs        ← Convert CSV → TypeScript
│
├── 📄 server.ts              ← Express + WebSocket server
├── 📄 vite.config.ts
├── 📄 tailwind.config.ts
└── 📄 package.json
```

## 🛠️ Scripts NPM

```bash
# Development
npm run dev          # Start dev server (Port 3000)

# Production
npm run build        # Build for production
npm run preview      # Preview production build

# Maintenance
npm run lint         # TypeScript type check
npm run clean        # Clean build artifacts

# Data
node scripts/convertCsv.cjs   # Convert CSV to TypeScript
```

## 🔧 Configuration

### Environment Variables (Optional)
Create `.env` file:
```env
PORT=3000
NODE_ENV=development
```

### Ports
- **HTTP/WS**: 3000 (configurable)
- **Vite HMR**: Auto-assigned

## 📡 API Reference

### REST Endpoints

#### Create Room
```http
POST /api/rooms/create
Content-Type: application/json

{
  "name": "Nguyễn Văn A",
  "school": "THPT Chuyên KHTN",
  "clientId": "climber-xxx"
}

Response: { "roomCode": "ABC123", "state": {...} }
```

#### Get Room State
```http
GET /api/rooms/:roomCode

Response: { "state": {...}, "lastUpdated": 1234567890 }
```

#### Send Action
```http
POST /api/rooms/:roomCode/action
Content-Type: application/json

{
  "action": {
    "type": "SUBMIT_ANSWER",
    "position": 1,
    "answer": "Paris",
    ...
  }
}
```

### WebSocket

```javascript
const ws = new WebSocket('ws://localhost:3000/ws-olympia?room=ABC123');

// Send state sync
ws.send(JSON.stringify({
  type: 'SYNC_STATE',
  roomCode: 'ABC123',
  state: {...}
}));

// Send action
ws.send(JSON.stringify({
  type: 'ACTION',
  roomCode: 'ABC123',
  action: {...}
}));

// Receive updates
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'ROOM_STATE') {
    // Update local state
  }
};
```

## 🐛 Troubleshooting

### ❌ Port 3000 already in use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or change port in server.ts
```

### ❌ Dependencies conflict
```bash
# Always use --legacy-peer-deps
npm install --legacy-peer-deps
```

### ❌ WebSocket not connecting
- Check firewall settings
- Disable antivirus temporarily
- Use `localhost` instead of `127.0.0.1`

### ❌ Questions not loading
```bash
# Regenerate from CSV
node scripts/convertCsv.cjs
```

## 🎨 Customization

### Add more questions
1. Edit `questions.csv`
2. Run: `node scripts/convertCsv.cjs`
3. Restart server

### Change theme
- Edit Tailwind config in `tailwind.config.ts`
- Customize colors in `src/index.css`

### Modify game rules
- Edit logic in `src/utils/olympiaEngine.ts`
- Adjust scoring in type definitions

## 🔒 Security Notes

⚠️ **Development Only** - Not production-ready!

For production deployment:
- [ ] Add authentication & authorization
- [ ] Implement rate limiting
- [ ] Add input validation & sanitization
- [ ] Use HTTPS/WSS
- [ ] Add session management
- [ ] Implement proper error handling
- [ ] Add logging & monitoring

## 📈 Performance

- **Room capacity**: ~100 concurrent rooms
- **Players**: 4 per room
- **WebSocket latency**: <50ms (local network)
- **State sync**: ~1.2s polling + instant WS

## 🤝 Contributing

Contributions welcome! Areas to improve:
- [ ] More question types (multiple choice, true/false)
- [ ] Leaderboard & statistics
- [ ] Replay system
- [ ] Admin dashboard
- [ ] Mobile app (React Native)
- [ ] Voice chat integration

## 📝 License

MIT License - Free to use and modify

## 📧 Contact & Support

- **Repository**: [Local project at c:\file\hoc\olympia]
- **Issues**: Check logs in terminal
- **Questions**: See documentation files

## 🎓 Credits

- **Original Game**: VTV - Đường Lên Đỉnh Olympia
- **Questions Source**: Community-contributed CSV
- **Framework**: React + Express + WebSocket
- **UI Design**: Tailwind CSS + Custom components

---

## 🚀 Current Status

✅ **Server Running**: http://localhost:3000  
✅ **Questions Loaded**: 21,649 from CSV  
✅ **WebSocket**: Active  
✅ **Cross-Device Sync**: Enabled  

**Ready to play!** 🎮

---

**Made with ❤️ for Vietnamese students**  
**Version**: 1.0.0 | **Last Updated**: 2026-11-08

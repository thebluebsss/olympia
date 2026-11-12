# PowerShell script để deploy lên Vercel

Write-Host "🚀 Bắt đầu deploy lên Vercel..." -ForegroundColor Green
Write-Host ""

# Check if vercel CLI is installed
if (!(Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Vercel CLI chưa được cài đặt!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Cài đặt bằng lệnh:" -ForegroundColor Yellow
    Write-Host "  npm install -g vercel" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

# Check if git is initialized
if (!(Test-Path ".git")) {
    Write-Host "📦 Khởi tạo Git repository..." -ForegroundColor Yellow
    git init
    git add .
    git commit -m "Initial commit for Vercel deployment"
}

# Regenerate questions from CSV
Write-Host "📚 Tạo lại câu hỏi từ CSV..." -ForegroundColor Yellow
node scripts/convertCsv.cjs

# Build locally to check for errors
Write-Host "🔨 Build local để kiểm tra..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Build thất bại! Vui lòng sửa lỗi trước khi deploy." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build thành công!" -ForegroundColor Green
Write-Host ""

# Ask for confirmation
Write-Host "Bạn có muốn deploy lên Vercel production không? (Y/N)" -ForegroundColor Cyan
$confirm = Read-Host

if ($confirm -ne 'Y' -and $confirm -ne 'y') {
    Write-Host "❌ Hủy deploy." -ForegroundColor Yellow
    exit 0
}

# Deploy
Write-Host ""
Write-Host "🚀 Deploying to Vercel..." -ForegroundColor Green
vercel --prod

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Deploy thành công!" -ForegroundColor Green
    Write-Host "🎉 Ứng dụng của bạn đã lên web!" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Chia sẻ URL với bạn bè để cùng chơi! 🎮" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "❌ Deploy thất bại. Check logs ở trên để biết nguyên nhân." -ForegroundColor Red
}

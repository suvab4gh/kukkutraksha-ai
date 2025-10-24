# Poultry Disease Monitoring System - Setup Script
# Run this script with: .\setup.ps1

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  🐔 Poultry Disease Monitoring System - Setup Wizard  ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check Node.js installation
Write-Host "📦 Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check npm installation
try {
    $npmVersion = npm --version
    Write-Host "✅ npm is installed: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is not installed. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📥 Installing Frontend Dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend installation failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green

Write-Host ""
Write-Host "📥 Installing Backend Dependencies..." -ForegroundColor Yellow
Set-Location backend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Backend installation failed" -ForegroundColor Red
    exit 1
}
Set-Location ..
Write-Host "✅ Backend dependencies installed" -ForegroundColor Green

Write-Host ""
Write-Host "📝 Setting up environment files..." -ForegroundColor Yellow

# Create .env.local if it doesn't exist
if (-not (Test-Path ".env.local")) {
    Copy-Item ".env.local.example" ".env.local"
    Write-Host "✅ Created .env.local - Please configure it with your Firebase credentials" -ForegroundColor Green
} else {
    Write-Host "⚠️  .env.local already exists - skipping" -ForegroundColor Yellow
}

# Create backend/.env if it doesn't exist
if (-not (Test-Path "backend\.env")) {
    Copy-Item "backend\.env.example" "backend\.env"
    Write-Host "✅ Created backend/.env - Please configure it with your credentials" -ForegroundColor Green
} else {
    Write-Host "⚠️  backend/.env already exists - skipping" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                  ✅ Setup Complete!                      ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Configure .env.local with your Firebase credentials" -ForegroundColor White
Write-Host "2. Configure backend/.env with MongoDB, HiveMQ, and Firebase Admin credentials" -ForegroundColor White
Write-Host "3. Create Firebase project and enable Email/Password authentication" -ForegroundColor White
Write-Host "4. Create MongoDB Atlas cluster and get connection string" -ForegroundColor White
Write-Host "5. Create HiveMQ Cloud account and get broker credentials" -ForegroundColor White
Write-Host ""
Write-Host "🚀 To start the application:" -ForegroundColor Yellow
Write-Host "   Backend:  cd backend && npm start" -ForegroundColor White
Write-Host "   Frontend: npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Yellow
Write-Host "   Quick Start:  SETUP_GUIDE.md" -ForegroundColor White
Write-Host "   Architecture: ARCHITECTURE.md" -ForegroundColor White
Write-Host "   Full Docs:    README.md" -ForegroundColor White
Write-Host ""
Write-Host "Happy Monitoring! 🎉" -ForegroundColor Green

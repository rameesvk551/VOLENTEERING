# NomadicNook Homepage Redesign - Installation Script (PowerShell)
# This script will install dependencies and prepare your project

Write-Host "🎨 NomadicNook Homepage Redesign - Installation" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found!" -ForegroundColor Red
    Write-Host "Please run this script from the shell directory:" -ForegroundColor Yellow
    Write-Host "cd travel-ecosystem\shell" -ForegroundColor Yellow
    exit 1
}

Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

Write-Host ""
Write-Host "✅ Installation complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Next steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Start the development server:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "2. Open your browser to the URL shown (usually http://localhost:5173)" -ForegroundColor White
Write-Host ""
Write-Host "3. See your new Viator-inspired homepage!" -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "   - Full guide: VIATOR_REDESIGN_DOCUMENTATION.md" -ForegroundColor White
Write-Host "   - Quick start: VIATOR_REDESIGN_QUICKSTART.md" -ForegroundColor White
Write-Host "   - Summary: VIATOR_REDESIGN_SUMMARY.md" -ForegroundColor White
Write-Host "   - Component map: VIATOR_REDESIGN_COMPONENT_MAP.md" -ForegroundColor White
Write-Host ""
Write-Host "🎯 What's new:" -ForegroundColor Cyan
Write-Host "   ✨ New hero section with clean search" -ForegroundColor Green
Write-Host "   ✨ Benefits section with trust icons" -ForegroundColor Green
Write-Host "   ✨ Rewards/login CTA section" -ForegroundColor Green
Write-Host "   ✨ Redesigned destination cards" -ForegroundColor Green
Write-Host "   ✨ Tours carousel with pricing" -ForegroundColor Green
Write-Host "   ✨ Comprehensive footer" -ForegroundColor Green
Write-Host "   ✨ Complete design system" -ForegroundColor Green
Write-Host ""
Write-Host "Happy coding! 🎉" -ForegroundColor Magenta

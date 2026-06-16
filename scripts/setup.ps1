# StyleMatch - Local Development Quick Setup (Windows PowerShell)
# Run this from the project root:  .\scripts\setup.ps1

Write-Host "=== StyleMatch Local Setup ===" -ForegroundColor Cyan

if (-not (Test-Path ".env.local")) {
    Write-Host "Copying .env.example -> .env.local ..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env.local" -Force
    Write-Host "Created .env.local. Please edit it with your real keys." -ForegroundColor Green
} else {
    Write-Host ".env.local already exists. Skipping copy." -ForegroundColor Gray
}

Write-Host ""
Write-Host "REQUIRED for real AI generations:" -ForegroundColor Cyan
Write-Host "  ANTHROPIC_API_KEY from https://console.anthropic.com/" -ForegroundColor White
Write-Host ""
Write-Host "OPTIONAL (for accounts + saved history):" -ForegroundColor Cyan
Write-Host "  1. Create a Supabase project at https://supabase.com/dashboard" -ForegroundColor White
Write-Host "  2. Run supabase/schema.sql in the SQL Editor" -ForegroundColor White
Write-Host "  3. Copy URL, anon key, and service_role key into .env.local" -ForegroundColor White
Write-Host ""
Write-Host "Then run:" -ForegroundColor Green
Write-Host "   npm run dev" -ForegroundColor Green
Write-Host ""
Write-Host "Open http://localhost:3000/dashboard — no account required." -ForegroundColor Green
Write-Host ""
Write-Host "Deploy to Vercel:" -ForegroundColor Cyan
Write-Host "  1. Push to GitHub" -ForegroundColor White
Write-Host "  2. Import on vercel.com" -ForegroundColor White
Write-Host "  3. Add ANTHROPIC_API_KEY (+ optional Supabase vars)" -ForegroundColor White
Write-Host ""

$open = Read-Host "Open .env.local in Notepad now? (y/n)"
if ($open -eq 'y') {
    Start-Process notepad ".env.local"
}
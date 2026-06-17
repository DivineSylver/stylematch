# StyleMatch - Local Development Quick Setup (Windows PowerShell)
# Run from project root:  .\scripts\setup.ps1

Write-Host "=== StyleMatch Local Setup ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "This app costs $0 to run — no API keys required." -ForegroundColor Green
Write-Host ""

if (-not (Test-Path ".env.local")) {
    Copy-Item ".env.example" ".env.local" -Force
    Write-Host "Created .env.local" -ForegroundColor Green
}

Write-Host "OPTIONAL (accounts + saved history):" -ForegroundColor Cyan
Write-Host "  1. Create free Supabase project: https://supabase.com/dashboard" -ForegroundColor White
Write-Host "  2. Run supabase/schema.sql in SQL Editor" -ForegroundColor White
Write-Host "  3. Copy URL, anon key, service_role key into .env.local" -ForegroundColor White
Write-Host ""
Write-Host "Then run:  npm run dev" -ForegroundColor Green
Write-Host "Open:      http://localhost:3000/dashboard" -ForegroundColor Green
Write-Host ""
Write-Host "Deploy free on Vercel:" -ForegroundColor Cyan
Write-Host "  Push to GitHub -> Import on vercel.com -> Deploy (no env vars required)" -ForegroundColor White
Write-Host ""
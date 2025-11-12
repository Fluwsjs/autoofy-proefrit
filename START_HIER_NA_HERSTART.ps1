# Autoofy Git Setup Script
# Voer dit uit in PowerShell NA het herstarten

Write-Host "`n🚀 Autoofy Git Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Check of Git werkt
Write-Host "`n1. Git versie controleren..." -ForegroundColor Yellow
git --version
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Git werkt nog niet. Herstart PowerShell opnieuw!" -ForegroundColor Red
    exit
}
Write-Host "✅ Git werkt!" -ForegroundColor Green

# Check of we in de juiste folder zijn
Write-Host "`n2. Huidige folder controleren..." -ForegroundColor Yellow
$currentPath = Get-Location
Write-Host "Huidige folder: $currentPath" -ForegroundColor White

if ($currentPath -notlike "*proefritautoofy*") {
    Write-Host "⚠️  Je bent niet in de project folder!" -ForegroundColor Yellow
    Write-Host "Ga naar: cd C:\Users\Gebruiker\Desktop\JS\proefritautoofy" -ForegroundColor Cyan
    exit
}

# Git configureren (als nog niet gedaan)
Write-Host "`n3. Git configureren..." -ForegroundColor Yellow
$userName = git config --global user.name
$userEmail = git config --global user.email

if (-not $userName) {
    Write-Host "⚠️  Git user.name is nog niet ingesteld" -ForegroundColor Yellow
    $name = Read-Host "Voer je naam in"
    git config --global user.name $name
    Write-Host "✅ user.name ingesteld" -ForegroundColor Green
} else {
    Write-Host "✅ user.name: $userName" -ForegroundColor Green
}

if (-not $userEmail) {
    Write-Host "⚠️  Git user.email is nog niet ingesteld" -ForegroundColor Yellow
    $email = Read-Host "Voer je e-mail in"
    git config --global user.email $email
    Write-Host "✅ user.email ingesteld" -ForegroundColor Green
} else {
    Write-Host "✅ user.email: $userEmail" -ForegroundColor Green
}

# Git init
Write-Host "`n4. Git repository initialiseren..." -ForegroundColor Yellow
if (Test-Path ".git") {
    Write-Host "✅ Git repository bestaat al" -ForegroundColor Green
} else {
    git init
    Write-Host "✅ Git repository geïnitialiseerd" -ForegroundColor Green
}

# Git add
Write-Host "`n5. Bestanden toevoegen..." -ForegroundColor Yellow
git add .
$status = git status --short
if ($status) {
    Write-Host "✅ Bestanden toegevoegd:" -ForegroundColor Green
    git status --short | Select-Object -First 10
} else {
    Write-Host "⚠️  Geen nieuwe bestanden om toe te voegen" -ForegroundColor Yellow
}

# Git commit
Write-Host "`n6. Commit maken..." -ForegroundColor Yellow
$hasChanges = git diff --cached --quiet
if (-not $hasChanges) {
    Write-Host "⚠️  Geen wijzigingen om te committen" -ForegroundColor Yellow
} else {
    git commit -m "Autoofy Proefrit App - Ready for Netlify"
    Write-Host "✅ Commit gemaakt!" -ForegroundColor Green
}

Write-Host "`n✅ Klaar!" -ForegroundColor Green
Write-Host "`n📋 Volgende stappen:" -ForegroundColor Cyan
Write-Host "1. Maak een GitHub repository aan op github.com" -ForegroundColor White
Write-Host "2. Voeg remote toe: git remote add origin <URL>" -ForegroundColor White
Write-Host "3. Push: git push -u origin main" -ForegroundColor White
Write-Host "`nZie GIT_SETUP_COMMANDS.md voor details!" -ForegroundColor Yellow


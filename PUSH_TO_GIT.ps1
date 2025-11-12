# PowerShell script om naar Git te pushen
# Voer uit in PowerShell: .\PUSH_TO_GIT.ps1

Write-Host "🚀 Git Push Script" -ForegroundColor Cyan
Write-Host "==================" -ForegroundColor Cyan
Write-Host ""

# Check of git beschikbaar is
try {
    $gitVersion = git --version 2>&1
    Write-Host "✅ Git gevonden: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git is niet geïnstalleerd of niet in PATH!" -ForegroundColor Red
    Write-Host "   Installeer Git van: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

# Check of we al in een git repo zitten
if (-not (Test-Path ".git")) {
    Write-Host "📦 Git repository initialiseren..." -ForegroundColor Yellow
    git init
    Write-Host "✅ Repository geïnitialiseerd" -ForegroundColor Green
    Write-Host ""
}

# Check remote
$remoteUrl = git remote get-url origin 2>&1
if ($LASTEXITCODE -ne 0) {
    $remoteUrl = $null
}

if ([string]::IsNullOrEmpty($remoteUrl)) {
    Write-Host "⚠️  Geen remote repository gevonden!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Voeg eerst een remote toe met:" -ForegroundColor White
    Write-Host "  git remote add origin https://github.com/JOUW-USERNAME/JOUW-REPO-NAAM.git" -ForegroundColor Cyan
    Write-Host ""
    $continue = Read-Host "Wil je doorgaan zonder remote? (y/n)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        exit 1
    }
} else {
    Write-Host "✅ Remote gevonden: $remoteUrl" -ForegroundColor Green
}

Write-Host ""
Write-Host "📋 Huidige status:" -ForegroundColor Yellow
git status --short
Write-Host ""

# Bestanden toevoegen
Write-Host "➕ Bestanden toevoegen..." -ForegroundColor Yellow
git add .
Write-Host "✅ Bestanden toegevoegd" -ForegroundColor Green
Write-Host ""

# Commit maken
Write-Host "💾 Commit maken..." -ForegroundColor Yellow
git commit -m "Verbeter handtekening en time picker - iPhone-stijl time picker en auto-save handtekening"
Write-Host "✅ Commit gemaakt" -ForegroundColor Green
Write-Host ""

# Branch checken
$currentBranch = git branch --show-current
if ([string]::IsNullOrEmpty($currentBranch)) {
    Write-Host "🌿 Main branch aanmaken..." -ForegroundColor Yellow
    git branch -M main
    $currentBranch = "main"
}

Write-Host "🌿 Huidige branch: $currentBranch" -ForegroundColor Cyan
Write-Host ""

# Pushen (als remote bestaat)
if (-not [string]::IsNullOrEmpty($remoteUrl)) {
    Write-Host "📤 Naar GitHub pushen..." -ForegroundColor Yellow
    git push -u origin $currentBranch
    Write-Host ""
    Write-Host "✅ Klaar! Code is naar GitHub gepusht." -ForegroundColor Green
    Write-Host "🌐 Netlify zal automatisch deployen als de integratie is ingesteld." -ForegroundColor Cyan
} else {
    Write-Host "⚠️  Geen remote gevonden. Code is lokaal gecommit." -ForegroundColor Yellow
    Write-Host "   Voeg een remote toe en push handmatig:" -ForegroundColor White
    Write-Host "   git remote add origin https://github.com/JOUW-USERNAME/JOUW-REPO-NAAM.git" -ForegroundColor Cyan
    Write-Host "   git push -u origin $currentBranch" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "🎉 Klaar!" -ForegroundColor Green


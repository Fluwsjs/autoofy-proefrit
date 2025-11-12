#!/bin/bash

# Script om wijzigingen naar Git te pushen
# Voer dit uit in Git Bash

echo "🚀 Git Push Script"
echo "=================="
echo ""

# Check of git is geïnstalleerd
if ! command -v git &> /dev/null; then
    echo "❌ Git is niet geïnstalleerd!"
    exit 1
fi

# Check of we al in een git repo zitten
if [ ! -d ".git" ]; then
    echo "📦 Git repository initialiseren..."
    git init
    echo "✅ Repository geïnitialiseerd"
    echo ""
fi

# Check remote
REMOTE_URL=$(git remote get-url origin 2>/dev/null)

if [ -z "$REMOTE_URL" ]; then
    echo "⚠️  Geen remote repository gevonden!"
    echo ""
    echo "Voeg eerst een remote toe met:"
    echo "  git remote add origin https://github.com/JOUW-USERNAME/JOUW-REPO-NAAM.git"
    echo ""
    read -p "Wil je doorgaan zonder remote? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Status tonen
echo "📋 Huidige status:"
git status --short
echo ""

# Bestanden toevoegen
echo "➕ Bestanden toevoegen..."
git add .
echo "✅ Bestanden toegevoegd"
echo ""

# Commit maken
echo "💾 Commit maken..."
git commit -m "Fix time picker, terug knop en voeg handelaarskenteken modal toe"
echo "✅ Commit gemaakt"
echo ""

# Branch checken
CURRENT_BRANCH=$(git branch --show-current)
if [ -z "$CURRENT_BRANCH" ]; then
    echo "🌿 Main branch aanmaken..."
    git branch -M main
    CURRENT_BRANCH="main"
fi

echo "🌿 Huidige branch: $CURRENT_BRANCH"
echo ""

# Pushen (als remote bestaat)
if [ ! -z "$REMOTE_URL" ]; then
    echo "📤 Naar GitHub pushen..."
    git push -u origin $CURRENT_BRANCH
    echo ""
    echo "✅ Klaar! Code is naar GitHub gepusht."
    echo "🌐 Netlify zal automatisch deployen als de integratie is ingesteld."
else
    echo "⚠️  Geen remote gevonden. Code is lokaal gecommit."
    echo "   Voeg een remote toe en push handmatig:"
    echo "   git remote add origin https://github.com/JOUW-USERNAME/JOUW-REPO-NAAM.git"
    echo "   git push -u origin $CURRENT_BRANCH"
fi

echo ""
echo "🎉 Klaar!"


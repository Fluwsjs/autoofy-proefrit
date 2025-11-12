# Git Bash Commando's - Kopieer en Plak

## 📋 Stap 1: Git Bash Openen

1. Klik met rechts op je project folder: `C:\Users\Gebruiker\Desktop\JS\proefritautoofy`
2. Kies **"Git Bash Here"** (of open Git Bash en navigeer naar de folder)

## 📋 Stap 2: Git Configureren (eenmalig)

**Vervang "Jouw Naam" en "jouw@email.com" met je eigen gegevens!**

```bash
git config --global user.name "Jouw Naam"
git config --global user.email "jouw@email.com"
```

## 📋 Stap 3: Git Repository Initialiseren

```bash
git init
```

## 📋 Stap 4: Bestanden Toevoegen

```bash
git add .
```

## 📋 Stap 5: Eerste Commit

```bash
git commit -m "Autoofy Proefrit App - Ready for Netlify"
```

## 📋 Stap 6: GitHub Repository Aanmaken

1. Ga naar [github.com](https://github.com) en log in
2. Klik **"+"** → **"New repository"**
3. Naam: `autoofy-proefrit` (of andere naam)
4. **NIET** "Initialize with README" aanvinken
5. Klik **"Create repository"**

## 📋 Stap 7: Code naar GitHub Pushen

**Vervang JOUW-USERNAME en JOUW-REPO-NAAM met je eigen gegevens!**

```bash
git remote add origin https://github.com/JOUW-USERNAME/JOUW-REPO-NAAM.git
git branch -M main
git push -u origin main
```

**Als je wordt gevraagd om in te loggen:**
- Gebruikersnaam: je GitHub gebruikersnaam
- Wachtwoord: gebruik een **Personal Access Token** (niet je GitHub wachtwoord!)
  - Ga naar: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
  - Generate new token (classic)
  - Selecteer scope: **repo** (alle repo opties)
  - Generate token
  - Kopieer token en gebruik als wachtwoord

## ✅ Klaar!

Na deze stappen is je code op GitHub. Volg dan `DEPLOYMENT_START_HIER.md` voor Netlify setup!


# Git Setup Commando's

## ⚠️ BELANGRIJK: Herstart PowerShell eerst!

Na het installeren van Git moet je PowerShell **herstarten** zodat Git herkend wordt.

1. Sluit deze PowerShell
2. Open een **nieuwe** PowerShell
3. Ga naar je project folder:
   ```powershell
   cd C:\Users\Gebruiker\Desktop\JS\proefritautoofy
   ```

## Stap 1: Git Configureren (eenmalig)

```powershell
git config --global user.name "Jouw Naam"
git config --global user.email "jouw@email.com"
```

**Vervang "Jouw Naam" en "jouw@email.com" met je eigen gegevens!**

## Stap 2: Git Repository Initialiseren

```powershell
git init
```

## Stap 3: Bestanden Toevoegen

```powershell
git add .
```

## Stap 4: Eerste Commit

```powershell
git commit -m "Autoofy Proefrit App - Ready for Netlify"
```

## Stap 5: GitHub Repository Aanmaken

1. Ga naar [github.com](https://github.com) en log in
2. Klik **"+"** → **"New repository"**
3. Naam: `autoofy-proefrit` (of andere naam)
4. **NIET** "Initialize with README" aanvinken
5. Klik **"Create repository"**

## Stap 6: Code naar GitHub Pushen

**Vervang JOUW-USERNAME en JOUW-REPO-NAAM:**

```powershell
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

## Stap 7: Netlify Setup

Zie `DEPLOYMENT_START_HIER.md` voor de volgende stappen!


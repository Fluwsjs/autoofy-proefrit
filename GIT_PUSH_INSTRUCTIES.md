# 🚀 Git Push Instructies

## ✅ Snelste manier: Gebruik Git Bash

### Stap 1: Open Git Bash
1. Rechtsklik op de folder: `C:\Users\Gebruiker\Desktop\JS\proefritautoofy`
2. Kies **"Git Bash Here"**

### Stap 2: Voer deze commands uit

```bash
# Als je nog geen git repo hebt:
git init

# Bestanden toevoegen
git add .

# Commit maken
git commit -m "Verbeter handtekening en time picker - iPhone-stijl time picker en auto-save handtekening"

# Branch naam instellen
git branch -M main

# Als je AL een GitHub repo hebt, voeg remote toe:
git remote add origin https://github.com/JOUW-USERNAME/JOUW-REPO-NAAM.git

# Push naar GitHub
git push -u origin main
```

### OF gebruik het script:
```bash
bash PUSH_TO_GIT.sh
```

---

## 📋 Als je nog GEEN GitHub repo hebt:

### Stap 1: Maak een nieuwe repo op GitHub
1. Ga naar [github.com](https://github.com) en log in
2. Klik **"+"** → **"New repository"**
3. Naam: `autoofy-proefrit` (of andere naam)
4. **NIET** "Initialize with README" aanvinken
5. Klik **"Create repository"**

### Stap 2: Kopieer de repository URL
- Je krijgt een URL zoals: `https://github.com/JOUW-USERNAME/autoofy-proefrit.git`

### Stap 3: Voeg remote toe en push
```bash
git remote add origin https://github.com/JOUW-USERNAME/autoofy-proefrit.git
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

---

## ✅ Klaar!

Na deze stappen is je code op GitHub. Netlify zal automatisch deployen als de integratie is ingesteld!


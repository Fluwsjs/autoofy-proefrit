# 🚀 START HIER - Netlify Deployment

## ⚠️ Eerst: Git Installeren

Git is nodig om code naar GitHub te pushen. Kies een optie:

### Optie A: Git Command Line (Aanbevolen)
1. Download: https://git-scm.com/download/win
2. Installeer (gebruik standaard instellingen)
3. Herstart PowerShell
4. Test: `git --version`
5. Zie `GIT_INSTALLATIE.md` voor details

### Optie B: GitHub Desktop (Makkelijker, visueel)
1. Download: https://desktop.github.com
2. Installeer en log in met GitHub account
3. Gebruik de GUI om repository aan te maken en te pushen

---

## 📋 Na Git Installatie - Volg deze stappen:

### Stap 1: Git Repository Initialiseren

Open PowerShell in je project folder:

```powershell
cd C:\Users\Gebruiker\Desktop\JS\proefritautoofy
git init
git add .
git commit -m "Autoofy Proefrit App - Ready for Netlify"
```

### Stap 2: GitHub Repository Aanmaken

1. Ga naar [github.com](https://github.com) en log in
2. Klik **"+"** → **"New repository"**
3. Naam: `autoofy-proefrit` (of andere naam)
4. **NIET** "Initialize with README" aanvinken
5. Klik **"Create repository"**

### Stap 3: Code naar GitHub Pushen

GitHub geeft je commando's, gebruik deze:

```powershell
git remote add origin https://github.com/JOUW-USERNAME/JOUW-REPO-NAAM.git
git branch -M main
git push -u origin main
```

**Als je wordt gevraagd om in te loggen:**
- Gebruik je GitHub gebruikersnaam
- Voor wachtwoord: gebruik een **Personal Access Token**
  - Ga naar GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
  - Generate new token → Selecteer "repo" scope → Generate
  - Kopieer token en gebruik als wachtwoord

### Stap 4: Netlify Project Aanmaken

1. Ga naar [netlify.com](https://netlify.com) en log in
2. **Add new site** → **Import an existing project**
3. Kies **GitHub** en autoriseer
4. Selecteer je repository
5. Build instellingen zijn al goed (automatisch gedetecteerd)
6. Klik **"Deploy site"**

### Stap 5: Environment Variables Instellen

**BELANGRIJK**: Doe dit direct na het aanmaken van het project!

1. In Netlify dashboard → **Site settings** → **Environment variables**
2. Voeg deze toe (zie `ENV_VARIABLES_FOR_NETLIFY.txt` voor exacte waarden):

```
DATABASE_URL = postgresql://postgres:Italy024!@@db.cttgctesyubfmhxwzfez.supabase.co:5432/postgres
NEXTAUTH_URL = https://jouw-site.netlify.app (tijdelijk!)
NEXTAUTH_SECRET = a5515096fd53df882c00e422a08dcdb8
CRON_SECRET = cron-secret-key-2024
```

3. Klik **"Save"** voor elke variable

### Stap 6: Wachten op Build

- Build duurt 2-5 minuten
- Check build logs voor errors
- Als build klaar is, krijg je een URL zoals: `https://random-12345.netlify.app`

### Stap 7: NEXTAUTH_URL Aanpassen

**NA de eerste deployment:**

1. Kopieer je echte Netlify URL (bijv. `https://jouw-app-12345.netlify.app`)
2. Ga naar **Site settings** → **Environment variables**
3. Edit `NEXTAUTH_URL` → Verander naar je echte URL
4. Klik **"Save"**
5. Ga naar dashboard → **Trigger deploy** → **Deploy site**

### Stap 8: Testen! 🎉

1. Ga naar je Netlify URL
2. Test registratie
3. Test login
4. Test proefrit aanmaken
5. **Deel URL met vrienden!**

---

## 📝 Handige Bestanden

- `STAP_VOOR_STAP_DEPLOY.md` - Uitgebreide gids
- `ENV_VARIABLES_FOR_NETLIFY.txt` - Environment variables om te kopiëren
- `QUICK_DEPLOY.md` - Snelle referentie

## ✅ Klaar!

Na deze stappen is je app live op Netlify! 🚀


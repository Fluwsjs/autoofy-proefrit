# 🚀 Stap-voor-Stap Netlify Deployment

## Stap 1: Git Installeren (als nog niet geïnstalleerd)

1. Download Git voor Windows: https://git-scm.com/download/win
2. Installeer Git (gebruik standaard instellingen)
3. Herstart je terminal/PowerShell na installatie
4. Test of Git werkt:
   ```bash
   git --version
   ```

## Stap 2: Git Repository Initialiseren

Open PowerShell in je project folder en voer uit:

```powershell
# Ga naar je project folder (als je er nog niet bent)
cd C:\Users\Gebruiker\Desktop\JS\proefritautoofy

# Initialiseer Git
git init

# Voeg alle bestanden toe
git add .

# Maak eerste commit
git commit -m "Autoofy Proefrit App - Ready for Netlify"
```

## Stap 3: GitHub Repository Aanmaken

1. Ga naar [github.com](https://github.com) en log in (of maak account aan)
2. Klik op het **"+"** icoon rechtsboven → **"New repository"**
3. Vul in:
   - **Repository name**: `autoofy-proefrit` (of een andere naam)
   - **Description**: "Proefrittenbeheer app voor Autoofy"
   - **Public** of **Private** (kies wat je wilt)
   - **NIET** "Initialize with README" aanvinken
4. Klik **"Create repository"**

## Stap 4: Code naar GitHub Pushen

GitHub geeft je commando's, maar gebruik deze:

```powershell
# Voeg GitHub remote toe (vervang JOUW-USERNAME en JOUW-REPO-NAAM)
git remote add origin https://github.com/JOUW-USERNAME/JOUW-REPO-NAAM.git

# Zet branch naar main
git branch -M main

# Push naar GitHub
git push -u origin main
```

**Als je wordt gevraagd om in te loggen:**
- Gebruik je GitHub gebruikersnaam en wachtwoord
- Of gebruik een Personal Access Token (zie GitHub → Settings → Developer settings → Personal access tokens)

## Stap 5: Netlify Project Aanmaken

1. Ga naar [netlify.com](https://netlify.com)
2. Log in (of maak gratis account aan)
3. Klik op **"Add new site"** → **"Import an existing project"**
4. Kies **"GitHub"** en autoriseer Netlify
5. Selecteer je repository (`autoofy-proefrit` of hoe je het hebt genoemd)
6. Netlify detecteert automatisch:
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Node version: `20`
7. Klik **"Deploy site"** (of "Show advanced" als je iets wilt aanpassen)

## Stap 6: Environment Variables Instellen

**BELANGRIJK**: Doe dit VOORDAT de build klaar is, of direct erna:

1. In Netlify dashboard, ga naar je site
2. Klik op **"Site settings"** (rechtsboven)
3. Klik op **"Environment variables"** (in het menu links)
4. Klik **"Add variable"** en voeg deze toe (één voor één):

### Variable 1:
- **Key**: `DATABASE_URL`
- **Value**: `postgresql://postgres:Italy024!@@db.cttgctesyubfmhxwzfez.supabase.co:5432/postgres`
- **Scopes**: Alle (Production, Deploy previews, Branch deploys)

### Variable 2:
- **Key**: `NEXTAUTH_URL`
- **Value**: `https://jouw-site.netlify.app` (tijdelijk, pas aan na eerste deploy!)
- **Scopes**: Alle

### Variable 3:
- **Key**: `NEXTAUTH_SECRET`
- **Value**: `a5515096fd53df882c00e422a08dcdb8`
- **Scopes**: Alle

### Variable 4 (Optioneel):
- **Key**: `CRON_SECRET`
- **Value**: `cron-secret-key-2024`
- **Scopes**: Alle

5. Klik **"Save"** voor elke variable

## Stap 7: Wachten op Build

1. Ga terug naar je site dashboard
2. Je ziet de build status
3. Wacht tot de build klaar is (2-5 minuten)
4. Check de build logs als er errors zijn

## Stap 8: NEXTAUTH_URL Aanpassen

**NA de eerste deployment:**

1. Netlify geeft je een URL zoals: `https://random-name-12345.netlify.app`
2. Kopieer deze URL
3. Ga naar **Site settings** → **Environment variables**
4. Zoek `NEXTAUTH_URL` en klik op **"Edit"**
5. Verander de waarde naar je echte Netlify URL:
   ```
   https://jouw-actuele-netlify-url.netlify.app
   ```
6. Klik **"Save"**
7. Ga terug naar je site dashboard
8. Klik op **"Trigger deploy"** → **"Deploy site"** (of wacht tot Netlify automatisch redeployt)

## Stap 9: Testen!

1. Ga naar je Netlify URL
2. Test registratie van een nieuw account
3. Test inloggen
4. Test het aanmaken van een proefrit
5. Test admin dashboard (login met `adminjvh@admin.local` / `Italy024!@`)

## Stap 10: Deel met Vrienden! 🎉

Geef je vrienden de Netlify URL en laat ze:
- Een account aanmaken
- Proefritten toevoegen
- Handtekeningen toevoegen
- Alles testen!

## 🔧 Troubleshooting

### Git niet gevonden
- Installeer Git: https://git-scm.com/download/win
- Herstart terminal na installatie

### Build faalt
- Check build logs in Netlify
- Zorg dat alle environment variables zijn ingesteld
- Check of `DATABASE_URL` correct is

### NextAuth errors
- Controleer of `NEXTAUTH_URL` exact overeenkomt met je Netlify URL
- Controleer of `NEXTAUTH_SECRET` is ingesteld
- Clear browser cache

### Database errors
- Controleer of Supabase database publiek toegankelijk is
- Check `DATABASE_URL` format

## ✅ Klaar!

Je app is nu live! 🚀


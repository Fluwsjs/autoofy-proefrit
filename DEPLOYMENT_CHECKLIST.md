# 🚀 Netlify Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Code is klaar
- [x] Logo geïmplementeerd
- [x] Autoofy styling toegepast
- [x] Admin dashboard werkt
- [x] Database schema is up-to-date
- [x] Alle features werken lokaal

### 2. Database
- [x] Database schema is gepusht (`npx prisma db push`)
- [x] Super admin account is aangemaakt
- [x] Database is toegankelijk vanaf internet (Supabase)

### 3. Bestanden controleren
- [x] `.env` staat in `.gitignore` (NIET committen!)
- [x] `netlify.toml` is aanwezig
- [x] `package.json` heeft `postinstall` script
- [x] Logo staat in `/public/autoofy.png`

## 📋 Deployment Stappen

### Stap 1: Code naar GitHub pushen

```bash
# Initialiseer Git (als nog niet gedaan)
git init

# Voeg alle bestanden toe (behalve .env)
git add .

# Commit
git commit -m "Ready for Netlify deployment - Autoofy branding"

# Maak GitHub repository aan op github.com
# Dan:
git remote add origin https://github.com/JOUW-USERNAME/JOUW-REPO.git
git branch -M main
git push -u origin main
```

### Stap 2: Netlify Setup

1. Ga naar [netlify.com](https://netlify.com) en log in
2. Klik op **"Add new site"** → **"Import an existing project"**
3. Kies **GitHub** en autoriseer Netlify
4. Selecteer je repository
5. Build instellingen worden automatisch gedetecteerd (zou moeten zijn):
   - Build command: `npm run build`
   - Publish directory: `.next` (automatisch)
   - Node version: `20`

### Stap 3: Environment Variables instellen

**BELANGRIJK**: Voeg deze toe in Netlify → Site settings → Environment variables:

```
DATABASE_URL=postgresql://postgres:Italy024!@@db.cttgctesyubfmhxwzfez.supabase.co:5432/postgres
NEXTAUTH_URL=https://jouw-site-naam.netlify.app
NEXTAUTH_SECRET=a5515096fd53df882c00e422a08dcdb8
CRON_SECRET=cron-secret-key-2024
```

**⚠️ BELANGRIJK**: 
- `NEXTAUTH_URL` moet je **NA de eerste deployment** aanpassen naar je echte Netlify URL!
- Netlify geeft je een URL zoals: `https://random-name-12345.netlify.app`
- Update dan `NEXTAUTH_URL` met die exacte URL

### Stap 4: Eerste Deployment

1. Netlify start automatisch de build na het koppelen van GitHub
2. Wacht tot de build klaar is (2-5 minuten)
3. Check de build logs voor errors

### Stap 5: NEXTAUTH_URL aanpassen

**NA de eerste deployment:**

1. Ga naar Netlify dashboard
2. Site settings → Environment variables
3. Update `NEXTAUTH_URL` naar je echte Netlify URL:
   ```
   NEXTAUTH_URL=https://jouw-actuele-netlify-url.netlify.app
   ```
4. Trigger een nieuwe deployment (of wacht tot Netlify automatisch redeployt)

### Stap 6: Testen

1. Ga naar je Netlify URL
2. Test registratie van een nieuw account
3. Test inloggen
4. Test het aanmaken van een proefrit
5. Test admin dashboard (login met adminjvh@admin.local)

## 🔧 Troubleshooting

### Build faalt
- Check build logs in Netlify dashboard
- Zorg dat `DATABASE_URL` is ingesteld
- Check of Prisma generate werkt

### NextAuth errors na deployment
- Controleer of `NEXTAUTH_URL` exact overeenkomt met je Netlify URL
- Controleer of `NEXTAUTH_SECRET` is ingesteld
- Clear browser cache en cookies

### Database connection errors
- Controleer of Supabase database publiek toegankelijk is
- Check of `DATABASE_URL` correct is
- Overweeg Supabase connection pooling

### Logo niet zichtbaar
- Check of `/public/autoofy.png` bestaat
- Check build logs voor image errors
- Ververs browser cache

## 📝 Na Deployment

### Voor je vrienden om te testen:

1. **Geef ze de Netlify URL** (bijv. `https://jouw-app.netlify.app`)
2. **Laat ze een account aanmaken** via de registratiepagina
3. **Ze kunnen dan:**
   - Inloggen
   - Proefritten aanmaken
   - Handtekeningen toevoegen
   - Proefritten bekijken en verwijderen

### Admin toegang:
- E-mail: `adminjvh@admin.local`
- Wachtwoord: `Italy024!@`
- Geeft toegang tot admin dashboard op `/admin`

## ✅ Klaar!

Na deze stappen is je app live en kunnen je vrienden het testen! 🎉


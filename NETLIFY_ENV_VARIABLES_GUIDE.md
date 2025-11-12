# 📋 Netlify Environment Variables Setup Guide

## ⚠️ BELANGRIJK: Upload GEEN .env file naar Netlify!

Netlify gebruikt **niet** een `.env` file. Je moet environment variables **handmatig instellen** via het Netlify dashboard.

## 📝 Stap-voor-Stap Instructies

### Stap 1: Ga naar Netlify Dashboard

1. Log in op [netlify.com](https://netlify.com)
2. Selecteer je site (`proefrit-autoofy` of hoe je het hebt genoemd)
3. Ga naar **Site settings** (rechtsboven)
4. Klik op **Environment variables** (in het menu links)

### Stap 2: Voeg Environment Variables Toe

Klik op **"Add variable"** en voeg deze één voor één toe:

#### Variable 1: DATABASE_URL
- **Key**: `DATABASE_URL`
- **Value**: `postgresql://postgres:Italy024!@@db.cttgctesyubfmhxwzfez.supabase.co:5432/postgres`
- **Scopes**: ✅ Production, ✅ Deploy previews, ✅ Branch deploys
- Klik **"Save"**

#### Variable 2: NEXTAUTH_URL
- **Key**: `NEXTAUTH_URL`
- **Value**: `https://jouw-exacte-netlify-url.netlify.app`
  - ⚠️ **BELANGRIJK**: Vervang dit met je ECHTE Netlify URL!
  - Kopieer je exacte URL uit het Netlify dashboard
  - Zorg dat er **GEEN** trailing slash is (`/` aan het eind)
  - Voorbeeld: `https://proefrit-autoofy-12345.netlify.app` (GOED)
  - Fout: `https://proefrit-autoofy-12345.netlify.app/` (FOUT)
- **Scopes**: ✅ Production, ✅ Deploy previews, ✅ Branch deploys
- Klik **"Save"**

#### Variable 3: NEXTAUTH_SECRET
- **Key**: `NEXTAUTH_SECRET`
- **Value**: `a5515096fd53df882c00e422a08dcdb8`
- **Scopes**: ✅ Production, ✅ Deploy previews, ✅ Branch deploys
- Klik **"Save"**

#### Variable 4: CRON_SECRET (Optioneel)
- **Key**: `CRON_SECRET`
- **Value**: `cron-secret-key-2024`
- **Scopes**: ✅ Production, ✅ Deploy previews, ✅ Branch deploys
- Klik **"Save"**

### Stap 3: Check je Netlify URL

1. Ga terug naar je site dashboard
2. Kopieer je site URL (staat bovenaan, bijv. `https://proefrit-autoofy-12345.netlify.app`)
3. Ga terug naar Environment variables
4. Edit `NEXTAUTH_URL` en zet de exacte URL
5. Save

### Stap 4: Trigger Nieuwe Deploy

1. Ga terug naar je site dashboard
2. Klik op **"Trigger deploy"** → **"Deploy site"**
3. Wacht tot de deploy klaar is (2-5 minuten)

## ✅ Checklist

- [ ] DATABASE_URL is ingesteld
- [ ] NEXTAUTH_URL is ingesteld met je ECHTE Netlify URL (zonder trailing slash)
- [ ] NEXTAUTH_SECRET is ingesteld
- [ ] CRON_SECRET is ingesteld (optioneel)
- [ ] Alle variables hebben "Production" scope
- [ ] Nieuwe deploy is getriggerd

## 🔍 Hoe Check je je Netlify URL?

1. Ga naar je Netlify dashboard
2. Je site URL staat bovenaan, naast de site naam
3. Het ziet eruit als: `https://random-name-12345.netlify.app`
4. Kopieer deze exact (zonder `/` aan het eind)

## 🚨 Veelvoorkomende Fouten

### ❌ Fout 1: NEXTAUTH_URL heeft trailing slash
- Fout: `https://jouw-site.netlify.app/`
- Goed: `https://jouw-site.netlify.app`

### ❌ Fout 2: NEXTAUTH_URL is placeholder
- Fout: `https://jouw-site.netlify.app` (placeholder)
- Goed: `https://proefrit-autoofy-12345.netlify.app` (echte URL)

### ❌ Fout 3: Variables niet in Production scope
- Zorg dat alle variables "Production" scope hebben

## 📄 Referentie

Zie `.env.example` voor een overzicht van alle benodigde variables.

## ✅ Klaar!

Na het instellen van alle variables en een nieuwe deploy, zou je app moeten werken!


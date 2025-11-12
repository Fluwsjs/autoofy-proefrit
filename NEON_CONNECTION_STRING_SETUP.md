# 🔧 Neon Connection String Setup

## ✅ Je Neon Connection String

Je hebt deze connection string:
```
postgresql://neondb_owner:npg_oX7Vq3eDkFbP@ep-polished-bread-aezc0ht4-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

## 📋 Stap-voor-Stap Setup

### Stap 1: Format Connection String voor Netlify

Voor Netlify environment variables, gebruik deze format (zonder `channel_binding`):

```
postgresql://neondb_owner:npg_oX7Vq3eDkFbP@ep-polished-bread-aezc0ht4-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require
```

**Belangrijk:**
- ✅ Gebruik `sslmode=require` (verplicht)
- ⚠️ Laat `channel_binding=require` weg (kan problemen geven in Netlify)
- ✅ Kopieer exact (geen extra spaties)

### Stap 2: Sync Database Schema naar Neon

**Lokaal in Git Bash:**

```bash
# Ga naar je project folder
cd C:\Users\Gebruiker\Desktop\JS\proefritautoofy

# Maak .env file (lokaal, NIET committen!)
# Open .env in editor en zet erin:
# DATABASE_URL="postgresql://neondb_owner:npg_oX7Vq3eDkFbP@ep-polished-bread-aezc0ht4-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Sync schema naar Neon
npx prisma db push
```

**Wat dit doet:**
- Maakt alle tabellen aan in Neon:
  - `Tenant`
  - `User`
  - `Testride`
  - `SuperAdmin`
- Duurt 10-30 seconden

**Na het commando:**
- Je ziet: `✔ Your database is now in sync with your Prisma schema`
- Tabellen zijn nu aangemaakt in Neon!

### Stap 3: Update Netlify Environment Variables

1. **Ga naar Netlify Dashboard:**
   - https://app.netlify.com
   - Selecteer site: `proefrit-autoofy`

2. **Ga naar Environment Variables:**
   - **Site settings** → **Environment variables**

3. **Update DATABASE_URL:**
   - Zoek `DATABASE_URL`
   - Klik **"Edit"**
   - Plak deze waarde:
     ```
     postgresql://neondb_owner:npg_oX7Vq3eDkFbP@ep-polished-bread-aezc0ht4-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require
     ```
   - ⚠️ **Zonder** `&channel_binding=require` aan het eind!
   - **Save**

4. **Check andere variables:**
   - `NEXTAUTH_URL` = `https://proefrit-autoofy.netlify.app`
   - `NEXTAUTH_SECRET` = `a5515096fd53df882c00e422a08dcdb8`
   - `CRON_SECRET` = `cron-secret-key-2024` (optioneel)

### Stap 4: Trigger Nieuwe Deploy

1. Ga terug naar site dashboard
2. Klik **"Trigger deploy"** → **"Deploy site"**
3. Wacht 2-5 minuten tot deploy klaar is

### Stap 5: Test!

1. **Test database connectie:**
   - Ga naar: `https://proefrit-autoofy.netlify.app/api/test-db`
   - Moet tonen: `{"success": true, "counts": {...}}`

2. **Test registratie:**
   - Ga naar: `https://proefrit-autoofy.netlify.app`
   - Probeer een account aan te maken
   - Zou nu moeten werken! 🎉

## 🔍 Troubleshooting

### Als `npx prisma db push` faalt:

**Error: "Can't reach database server"**
- Check of connection string correct is
- Check of Neon project actief is (niet gepauzeerd)

**Error: "Authentication failed"**
- Check of wachtwoord correct is: `npg_oX7Vq3eDkFbP`
- Check of username correct is: `neondb_owner`

**Error: "SSL required"**
- Zorg dat `?sslmode=require` in connection string staat

### Als Netlify nog steeds errors geeft:

1. **Check Netlify Function Logs:**
   - Functions → `/api/auth/register` → Logs
   - Kijk naar specifieke errors

2. **Check build logs:**
   - Deploys → Laatste deploy → View deploy log
   - Zoek naar Prisma errors

3. **Test connection string lokaal:**
   - Zet in `.env` file
   - Run `npx prisma db pull`
   - Als dit werkt → connection string is correct

## ✅ Checklist

- [ ] Database schema gesynct naar Neon (`npx prisma db push`)
- [ ] DATABASE_URL is correct in Netlify (zonder `channel_binding`)
- [ ] NEXTAUTH_URL is correct in Netlify
- [ ] NEXTAUTH_SECRET is ingesteld
- [ ] Nieuwe deploy is getriggerd
- [ ] Test `/api/test-db` geeft `{"success": true}`
- [ ] Registratie werkt!

## 🎯 Connection String voor Netlify

**Gebruik deze exacte waarde in Netlify:**

```
postgresql://neondb_owner:npg_oX7Vq3eDkFbP@ep-polished-bread-aezc0ht4-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require
```

**Niet gebruiken:**
- ❌ Met `&channel_binding=require` (kan problemen geven)
- ❌ Met extra spaties
- ❌ Met quotes eromheen (Netlify voegt die zelf toe)

## ✅ Klaar!

Na deze stappen zou alles moeten werken met Neon! 🚀


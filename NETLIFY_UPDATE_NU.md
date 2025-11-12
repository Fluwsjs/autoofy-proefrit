# ✅ Database Schema Gesynct! Nu Netlify Updaten

## ✅ Stap 1: Klaar!
- ✅ .env file aangemaakt (lokaal)
- ✅ Database schema gesynct naar Neon
- ✅ Tabellen zijn aangemaakt in Neon!

## 🎯 Stap 2: Update Netlify Environment Variables

**Dit moet je zelf doen in Netlify Dashboard:**

### Stap 2.1: Ga naar Netlify
1. Ga naar: https://app.netlify.com
2. Log in
3. Selecteer je site: `proefrit-autoofy`

### Stap 2.2: Update DATABASE_URL
1. Klik op **"Site settings"** (rechtsboven)
2. Klik op **"Environment variables"** (in linker menu)
3. Zoek `DATABASE_URL` in de lijst
4. Klik op **"Edit"** (of "..." → "Edit")
5. **Verwijder de oude Supabase URL**
6. **Plak deze nieuwe Neon URL:**
   ```
   postgresql://neondb_owner:npg_oX7Vq3eDkFbP@ep-polished-bread-aezc0ht4-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
7. ⚠️ **Zorg dat er GEEN** `&channel_binding=require` aan het eind staat!
8. Klik **"Save"**

### Stap 2.3: Check andere Variables
Zorg dat deze ook correct zijn:
- ✅ `NEXTAUTH_URL` = `https://proefrit-autoofy.netlify.app`
- ✅ `NEXTAUTH_SECRET` = `a5515096fd53df882c00e422a08dcdb8`
- ✅ `CRON_SECRET` = `cron-secret-key-2024` (optioneel)

### Stap 2.4: Trigger Nieuwe Deploy
1. Ga terug naar je site dashboard
2. Klik op **"Trigger deploy"** (rechtsboven)
3. Kies **"Deploy site"**
4. Wacht 2-5 minuten tot deploy klaar is

## ✅ Stap 3: Test!

### Test 1: Database Connectie
1. Ga naar: `https://proefrit-autoofy.netlify.app/api/test-db`
2. Moet tonen: `{"success": true, "counts": {...}}`
3. Als je een error ziet → check Netlify function logs

### Test 2: Registratie
1. Ga naar: `https://proefrit-autoofy.netlify.app`
2. Klik op **"Registreren"**
3. Vul formulier in
4. Klik **"Registreren"**
5. Zou nu moeten werken! 🎉

## 🔍 Als het nog steeds niet werkt:

### Check Netlify Function Logs:
1. Netlify → **Functions** tab
2. Klik op `/api/auth/register`
3. Kijk naar **Logs** voor specifieke errors

### Check Build Logs:
1. Netlify → **Deploys** → Laatste deploy
2. Klik op deploy → **View deploy log**
3. Zoek naar errors

## ✅ Checklist

- [x] Database schema gesynct naar Neon
- [ ] DATABASE_URL geüpdatet in Netlify (met Neon URL)
- [ ] NEXTAUTH_URL is correct in Netlify
- [ ] Nieuwe deploy getriggerd
- [ ] Test `/api/test-db` geeft `{"success": true}`
- [ ] Registratie werkt!

## 🎯 Connection String voor Netlify

**Kopieer deze exacte waarde:**

```
postgresql://neondb_owner:npg_oX7Vq3eDkFbP@ep-polished-bread-aezc0ht4-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require
```

**Plak in Netlify → Environment variables → DATABASE_URL**

## ✅ Klaar!

Na het updaten van Netlify zou alles moeten werken! 🚀


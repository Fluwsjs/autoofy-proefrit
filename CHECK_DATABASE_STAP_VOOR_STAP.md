# ✅ Database Check - Stap voor Stap

## ✅ Stap 1: Firewall is OK!
Je ziet: "Your database can be accessed by all IP addresses"
→ Dit betekent dat Netlify toegang heeft. **Geen actie nodig!**

## 📋 Stap 2: Check of Tabellen Bestaan

### In Supabase Dashboard:

1. **Klik op "Table Editor"** in het linker menu (tweede item, grid icoon)

2. **Check of je deze tabellen ziet:**
   - `Tenant`
   - `User` 
   - `Testride`
   - `SuperAdmin`

### Scenario A: Tabellen BESTAAN al ✅
- Dan is schema al gesynct
- Probleem is waarschijnlijk DATABASE_URL in Netlify
- Ga naar Stap 3

### Scenario B: Tabellen BESTAAN NIET ❌
- Schema is niet gesynct
- Je moet tabellen aanmaken
- Ga naar Stap 4

## 🔧 Stap 3: Check DATABASE_URL in Netlify

Als tabellen al bestaan, check dan DATABASE_URL:

1. Ga naar **Netlify Dashboard** → je site
2. **Site settings** → **Environment variables**
3. Check `DATABASE_URL`:
   - Moet exact zijn: `postgresql://postgres:Italy024!@@db.cttgctesyubfmhxwzfez.supabase.co:5432/postgres`
   - Geen extra spaties
   - Correct wachtwoord
4. **Save** als je iets hebt aangepast
5. **Trigger nieuwe deploy**

## 🚀 Stap 4: Sync Database Schema (als tabellen ontbreken)

Als tabellen **NIET** bestaan, sync het schema:

### In Git Bash (lokaal):

```bash
# Ga naar je project folder
cd C:\Users\Gebruiker\Desktop\JS\proefritautoofy

# Sync database schema naar Supabase
npx prisma db push
```

**Wat dit doet:**
- Maakt alle tabellen aan in Supabase
- Sync het schema uit `prisma/schema.prisma`
- Duurt 10-30 seconden

**Na het commando:**
- Je ziet: "✔ Your database is now in sync with your Prisma schema"
- Ga terug naar Supabase → Table Editor
- Je zou nu de tabellen moeten zien!

## ✅ Stap 5: Test Database Connectie

Na het syncen:

1. **Push naar GitHub** (als je fixes hebt):
   ```bash
   git add .
   git commit -m "Sync database schema"
   git push
   ```

2. **Wacht op Netlify deploy** (2-5 minuten)

3. **Test database connectie:**
   - Ga naar: `https://jouw-site.netlify.app/api/test-db`
   - Moet tonen: `{"success": true, ...}`

4. **Test registratie:**
   - Probeer een nieuw account aan te maken
   - Zou nu moeten werken!

## 🎯 Samenvatting

1. ✅ Firewall is OK (geen actie)
2. 📋 Check Table Editor → zijn tabellen er?
3. 🔧 Als tabellen er zijn → check DATABASE_URL in Netlify
4. 🚀 Als tabellen er NIET zijn → run `npx prisma db push`
5. ✅ Test opnieuw

## ❓ Wat zie je in Table Editor?

Laat me weten wat je ziet in Table Editor, dan help ik je verder!


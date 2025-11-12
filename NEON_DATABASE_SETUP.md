# 🚀 Neon Database Setup voor Netlify

## ✅ Ja, Neon werkt perfect met Netlify!

Neon is een serverless PostgreSQL database die speciaal gemaakt is voor moderne apps. Het heeft enkele voordelen ten opzichte van Supabase voor Netlify deployments.

## 🎯 Voordelen van Neon

- ✅ **Automatische connection pooling** - werkt beter met serverless
- ✅ **Snellere cold starts** - database is altijd beschikbaar
- ✅ **Betere Netlify integratie** - gemaakt voor serverless
- ✅ **Gratis tier** - 0.5 GB storage, perfect voor testen
- ✅ **Eenvoudigere setup** - minder configuratie nodig

## 📋 Stap-voor-Stap Setup

### Stap 1: Maak Neon Database Aan

1. **Ga naar Neon:**
   - https://neon.tech
   - Klik **"Sign Up"** (gratis account)

2. **Maak nieuw project:**
   - Klik **"Create a project"**
   - Project name: `autoofy-proefrit` (of andere naam)
   - Region: Kies dichtstbijzijnde (bijv. `Europe (Frankfurt)`)
   - PostgreSQL version: `16` (of nieuwste)
   - Klik **"Create project"**

3. **Kopieer Connection String:**
   - Na het aanmaken zie je je connection string
   - Ziet eruit als: `postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require`
   - **Kopieer deze!**

### Stap 2: Sync Database Schema naar Neon

1. **Lokaal in je project:**
   ```bash
   # Maak .env file (lokaal, niet committen!)
   # Zet Neon connection string erin
   DATABASE_URL="postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require"
   ```

2. **Sync schema:**
   ```bash
   cd C:\Users\Gebruiker\Desktop\JS\proefritautoofy
   npx prisma db push
   ```

3. **Dit maakt alle tabellen aan in Neon:**
   - Tenant
   - User
   - Testride
   - SuperAdmin

### Stap 3: Update Netlify Environment Variables

1. **Ga naar Netlify Dashboard:**
   - Je site → **Site settings** → **Environment variables**

2. **Update DATABASE_URL:**
   - Zoek `DATABASE_URL`
   - Klik **"Edit"**
   - Plak je Neon connection string
   - **Save**

3. **Trigger nieuwe deploy:**
   - Ga terug naar dashboard
   - **Trigger deploy** → **Deploy site**

### Stap 4: Test!

1. **Test database connectie:**
   - Ga naar: `https://proefrit-autoofy.netlify.app/api/test-db`
   - Moet tonen: `{"success": true, ...}`

2. **Test registratie:**
   - Probeer een account aan te maken
   - Zou nu moeten werken!

## 🔄 Migratie van Supabase naar Neon

Als je al data in Supabase hebt:

### Optie A: Start Fresh (Aanbevolen voor testen)
- Maak nieuwe Neon database
- Sync schema met `npx prisma db push`
- Start opnieuw (geen data migratie nodig voor testen)

### Optie B: Migreer Data
1. Export data uit Supabase
2. Import in Neon
3. Complexer, alleen nodig als je bestaande data hebt

## 📝 Neon Connection String Format

Neon connection string ziet eruit als:
```
postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require
```

**Belangrijk:**
- ✅ `?sslmode=require` is verplicht
- ✅ Gebruik de connection string die Neon geeft
- ✅ Kopieer exact (geen extra spaties)

## 🔐 Neon Environment Variables in Netlify

In Netlify → Environment variables:

1. **DATABASE_URL**
   - Value: Je Neon connection string
   - Format: `postgresql://user:pass@host/db?sslmode=require`

2. **NEXTAUTH_URL**
   - Value: `https://proefrit-autoofy.netlify.app`

3. **NEXTAUTH_SECRET**
   - Value: `a5515096fd53df882c00e422a08dcdb8`

4. **CRON_SECRET** (optioneel)
   - Value: `cron-secret-key-2024`

## ✅ Voordelen voor Jouw Situatie

- **Minder connectie problemen** - Neon is gemaakt voor serverless
- **Automatische pooling** - geen extra configuratie
- **Snellere setup** - minder stappen
- **Betere error messages** - duidelijker wat er mis gaat

## 🎯 Aanbeveling

**Voor jouw situatie:** Neon is waarschijnlijk een betere keuze omdat:
1. Je hebt nu connectie problemen met Supabase
2. Neon werkt beter met Netlify serverless functions
3. Setup is eenvoudiger
4. Minder configuratie nodig

## 📋 Quick Start Commando's

```bash
# 1. Maak Neon account en project op neon.tech
# 2. Kopieer connection string
# 3. Lokaal:

# Maak .env (lokaal, niet committen!)
echo 'DATABASE_URL="jouw-neon-connection-string"' > .env

# Sync schema
npx prisma db push

# Test lokaal (optioneel)
npm run dev

# Push naar GitHub
git add .
git commit -m "Switch to Neon database"
git push

# 4. Update DATABASE_URL in Netlify environment variables
# 5. Trigger deploy
```

## ✅ Klaar!

Na deze stappen zou alles moeten werken met Neon!


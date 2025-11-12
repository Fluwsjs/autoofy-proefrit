# 🔧 Database Connectie Probleem Fix

## Probleem
Je krijgt errors bij registreren en inloggen. Dit wijst meestal op een **database connectie probleem**.

## Oorzaken & Oplossingen

### 1. DATABASE_URL niet correct ingesteld ⚠️ MEEST WAARSCHIJNLIJK

**Check:**
1. Ga naar Netlify → Site settings → Environment variables
2. Zoek `DATABASE_URL`
3. Check of de waarde exact is:
   ```
   postgresql://postgres:Italy024!@@db.cttgctesyubfmhxwzfez.supabase.co:5432/postgres
   ```

**Problemen:**
- ❌ Extra spaties voor/na de URL
- ❌ Verkeerde wachtwoord
- ❌ Verkeerde hostname
- ❌ Verkeerde poort (moet 5432 zijn)

**Oplossing:**
- Kopieer de exacte DATABASE_URL hierboven
- Plak in Netlify environment variables
- Save
- Trigger nieuwe deploy

### 2. Supabase Database niet publiek toegankelijk

**Check Supabase:**
1. Ga naar [supabase.com](https://supabase.com) en log in
2. Selecteer je project
3. Ga naar **Settings** → **Database**
4. Check **Connection string** → **URI**
5. Zorg dat **Connection pooling** is ingeschakeld (aanbevolen)

**Voor Netlify gebruik je:**
- **Direct connection** (niet connection pooling URL)
- Format: `postgresql://postgres:PASSWORD@HOST:5432/postgres`

### 3. Supabase Firewall blokkeert Netlify

**Check:**
1. Ga naar Supabase → Settings → Database
2. Check **Network Restrictions**
3. Zorg dat **"Allow all IPs"** is ingeschakeld (voor development)
   - Of voeg Netlify IP ranges toe (complexer)

**Voor development:**
- Zet tijdelijk "Allow all IPs" aan
- Dit maakt je database publiek toegankelijk (OK voor testen)

### 4. Database Schema niet gesynct

**Probleem:** Database tabellen bestaan nog niet in Supabase.

**Oplossing - Database Schema Deployen:**

**Optie A: Via Prisma (Aanbevolen)**
1. Lokaal in je project:
   ```bash
   npx prisma db push
   ```
2. Dit sync de schema naar Supabase

**Optie B: Via Supabase SQL Editor**
1. Ga naar Supabase → SQL Editor
2. Kopieer de SQL uit `prisma/schema.prisma`
3. Run de SQL queries

**Optie C: Via Prisma Migrate**
1. Lokaal:
   ```bash
   npx prisma migrate dev --name init
   ```
2. Dit maakt migrations aan en pusht naar database

### 5. Prisma Client niet gegenereerd tijdens build

**Check Netlify Build Logs:**
1. Ga naar Netlify → Deploys → Laatste deploy
2. Kijk naar build logs
3. Zoek naar "Prisma Client generated"

**Als Prisma Client niet wordt gegenereerd:**
- Check of `postinstall` script in `package.json` staat:
  ```json
  "postinstall": "prisma generate"
  ```
- Dit zou automatisch moeten werken

## Debug Stappen

### Stap 1: Check Netlify Function Logs
1. Ga naar Netlify dashboard → je site
2. Klik op **"Functions"** tab
3. Klik op een function (bijv. `/api/auth/register`)
4. Kijk naar **"Logs"** voor specifieke errors

### Stap 2: Test Database Connectie Lokaal
1. Maak een `.env` file lokaal (niet committen!)
2. Zet `DATABASE_URL` erin
3. Test connectie:
   ```bash
   npx prisma db pull
   ```
4. Als dit werkt lokaal, dan is DATABASE_URL correct

### Stap 3: Check Supabase Dashboard
1. Ga naar Supabase → Table Editor
2. Check of deze tabellen bestaan:
   - `Tenant`
   - `User`
   - `Testride`
   - `SuperAdmin`
3. Als ze niet bestaan → database schema niet gesynct

### Stap 4: Test Database Connectie vanuit Netlify
Maak een test API route om database connectie te testen:

```typescript
// app/api/test-db/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    await prisma.$connect()
    const count = await prisma.tenant.count()
    return NextResponse.json({ 
      success: true, 
      message: "Database connected!",
      tenantCount: count 
    })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 })
  }
}
```

Test deze route op: `https://jouw-site.netlify.app/api/test-db`

## Snelle Fix Checklist

- [ ] DATABASE_URL is exact correct in Netlify (geen extra spaties)
- [ ] Supabase database is publiek toegankelijk (Allow all IPs)
- [ ] Database schema is gesynct (tabellen bestaan in Supabase)
- [ ] Prisma Client wordt gegenereerd tijdens build (check build logs)
- [ ] Nieuwe deploy is getriggerd na het aanpassen van DATABASE_URL

## Meest Waarschijnlijke Oplossing

**99% kans**: DATABASE_URL is niet correct of database schema is niet gesynct.

1. **Check DATABASE_URL** in Netlify environment variables
2. **Sync database schema** lokaal: `npx prisma db push`
3. **Trigger nieuwe deploy** in Netlify
4. **Test opnieuw**

## Test Database Connectie

Na het fixen, test de database connectie:
1. Ga naar: `https://jouw-site.netlify.app/api/test-db`
2. Als je `{"success": true}` ziet → database werkt!
3. Als je een error ziet → check de error message

## ✅ Klaar!

Na deze stappen zou registratie en login moeten werken!


# 🔍 Andere Mogelijke Problemen (DATABASE_URL is correct)

## ✅ DATABASE_URL staat goed - Check andere dingen:

### 1. Database Tabellen Bestaan Niet ⚠️ MEEST WAARSCHIJNLIJK

**Probleem:** Database schema is niet gesynct - tabellen bestaan niet in Supabase.

**Check:**
1. Ga naar **Supabase** → **Table Editor**
2. Check of je deze tabellen ziet:
   - `Tenant`
   - `User`
   - `Testride`
   - `SuperAdmin`

**Als tabellen NIET bestaan:**
```bash
# In Git Bash, in je project folder:
cd C:\Users\Gebruiker\Desktop\JS\proefritautoofy
npx prisma db push
```

Dit maakt alle tabellen aan in Supabase.

### 2. Prisma Client Niet Gegenereerd Tijdens Build

**Probleem:** Prisma Client wordt niet gegenereerd tijdens Netlify build.

**Check Netlify Build Logs:**
1. Ga naar Netlify → **Deploys** → Laatste deploy
2. Klik op deploy → **View deploy log**
3. Zoek naar: `"Prisma Client generated"` of `"Generated Prisma Client"`

**Als je dit NIET ziet:**
- Check of `postinstall` script in `package.json` staat
- Dit zou automatisch moeten werken

**Fix:**
Check `package.json` - moet bevatten:
```json
"scripts": {
  "postinstall": "prisma generate",
  "build": "prisma generate && next build"
}
```

### 3. Supabase Connection Pooling

**Probleem:** Supabase connection pooling kan problemen veroorzaken.

**Check:**
1. Ga naar Supabase → **Settings** → **Database**
2. Check **Connection Pooling** settings
3. Voor Netlify gebruik je **Direct connection** (niet pooling URL)

**DATABASE_URL moet zijn:**
```
postgresql://postgres:WACHTWOORD@HOST:5432/postgres
```

**NIET:**
```
postgresql://postgres:WACHTWOORD@HOST:6543/postgres?pgbouncer=true
```

### 4. Environment Variables Niet Beschikbaar Tijdens Build

**Probleem:** Environment variables zijn niet beschikbaar tijdens build.

**Check:**
1. Netlify → **Site settings** → **Environment variables**
2. Check dat alle variables **"Production"** scope hebben
3. Check dat variables **"All scopes"** hebben (Production, Deploy previews, Branch deploys)

**Variables die moeten staan:**
- ✅ `DATABASE_URL`
- ✅ `NEXTAUTH_URL`
- ✅ `NEXTAUTH_SECRET`
- ✅ `CRON_SECRET` (optioneel)

### 5. Database Schema Verschillen

**Probleem:** Database schema in Supabase komt niet overeen met Prisma schema.

**Fix:**
```bash
# Sync schema naar Supabase
npx prisma db push

# Of maak een migration
npx prisma migrate dev --name sync_schema
```

### 6. Supabase Database Niet Actief

**Probleem:** Supabase project is gepauzeerd of niet actief.

**Check:**
1. Ga naar Supabase dashboard
2. Check of project status **"Active"** is
3. Free tier projecten kunnen na inactiviteit pauzeren

**Fix:**
- Activeer project opnieuw in Supabase dashboard

### 7. Netlify Function Timeout

**Probleem:** Database connectie duurt te lang (timeout).

**Check Netlify Function Logs:**
1. Netlify → **Functions** tab
2. Klik op `/api/auth/register`
3. Kijk naar **Logs** voor timeout errors

**Fix:**
- Check Supabase database performance
- Check of database niet overbelast is

## 🔍 Debug Stappen

### Stap 1: Test Database Connectie Direct

Maak een test API route (al gemaakt: `/api/test-db`):

1. **Test via browser:**
   - Ga naar: `https://proefrit-autoofy.netlify.app/api/test-db`
   - Moet tonen: `{"success": true, ...}`

2. **Als je een error ziet:**
   - Kopieer de exacte error message
   - Dit geeft aan wat er mis is

### Stap 2: Check Netlify Function Logs

1. Netlify → **Functions** → `/api/auth/register`
2. Klik op **Logs**
3. Kijk naar errors tijdens registratie poging
4. Kopieer error messages

### Stap 3: Check Supabase Logs

1. Supabase → **Logs**
2. Kijk naar database connection attempts
3. Check of er errors zijn

### Stap 4: Test Database Connectie Lokaal

1. Maak lokaal een `.env` file (niet committen!):
   ```
   DATABASE_URL=postgresql://postgres:Italy024!@@db.cttgctesyubfmhxwzfez.supabase.co:5432/postgres
   ```

2. Test connectie:
   ```bash
   npx prisma db pull
   ```

3. Als dit werkt lokaal → DATABASE_URL is correct
4. Als dit niet werkt → DATABASE_URL of Supabase probleem

## ✅ Snelle Checklist

- [ ] Database tabellen bestaan in Supabase (check Table Editor)
- [ ] Prisma Client wordt gegenereerd tijdens build (check build logs)
- [ ] Alle environment variables hebben "Production" scope
- [ ] Supabase project is actief (niet gepauzeerd)
- [ ] Test `/api/test-db` geeft specifieke error (als het faalt)
- [ ] Netlify function logs tonen specifieke errors

## 🎯 Meest Waarschijnlijke Oplossing

**90% kans**: Database tabellen bestaan niet in Supabase.

**Fix:**
```bash
npx prisma db push
```

Dit maakt alle tabellen aan en sync het schema.

## 📋 Wat Moet Je Nu Doen?

1. **Check Supabase Table Editor** → zijn tabellen er?
2. **Als niet** → run `npx prisma db push`
3. **Test** → `/api/test-db` endpoint
4. **Check Netlify function logs** voor specifieke errors

Laat me weten wat je ziet!


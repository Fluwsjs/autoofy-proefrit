# 🔧 Netlify Server Error Fix

## Mogelijke Oorzaken

### 1. NEXTAUTH_URL niet correct ingesteld ⚠️ MEEST WAARSCHIJNLIJK
- **Probleem**: NEXTAUTH_URL komt niet overeen met je echte Netlify URL
- **Oplossing**: 
  1. Ga naar Netlify → Site settings → Environment variables
  2. Check `NEXTAUTH_URL` - moet exact zijn: `https://jouw-actuele-url.netlify.app`
  3. Zorg dat er GEEN trailing slash is: `https://jouw-url.netlify.app` (niet `https://jouw-url.netlify.app/`)
  4. Save en trigger nieuwe deploy

### 2. Database Connectie Probleem
- **Probleem**: Netlify kan niet verbinden met Supabase
- **Oplossing**:
  1. Check `DATABASE_URL` in environment variables
  2. Zorg dat Supabase database publiek toegankelijk is
  3. Check Supabase dashboard → Settings → Database → Connection pooling

### 3. Prisma Client niet gegenereerd
- **Probleem**: Prisma Client wordt niet goed gegenereerd tijdens build
- **Oplossing**: Dit zou automatisch moeten werken via `postinstall` script, maar check build logs

### 4. NextAuth Secret Probleem
- **Probleem**: NEXTAUTH_SECRET ontbreekt of is incorrect
- **Oplossing**: Check of `NEXTAUTH_SECRET` is ingesteld in environment variables

## Debug Stappen

### Stap 1: Check Netlify Logs
1. Ga naar Netlify dashboard → je site
2. Klik op **"Functions"** tab
3. Kijk naar function logs voor errors
4. Of ga naar **"Deploys"** → klik op laatste deploy → **"View deploy log"**

### Stap 2: Check Environment Variables
Zorg dat deze allemaal zijn ingesteld:
- ✅ `DATABASE_URL`
- ✅ `NEXTAUTH_URL` (exact je Netlify URL!)
- ✅ `NEXTAUTH_SECRET`
- ✅ `CRON_SECRET` (optioneel)

### Stap 3: Test Database Connectie
Check of Supabase database bereikbaar is vanaf Netlify servers.

### Stap 4: Check Build Logs
Kijk of er warnings zijn tijdens de build over Prisma of NextAuth.

## Snelle Fix Checklist

- [ ] NEXTAUTH_URL is exact je Netlify URL (zonder trailing slash)
- [ ] DATABASE_URL is correct
- [ ] NEXTAUTH_SECRET is ingesteld
- [ ] Alle environment variables hebben "Production" scope
- [ ] Nieuwe deploy getriggerd na het aanpassen van variables

## Meest Waarschijnlijke Oplossing

**99% kans**: NEXTAUTH_URL is niet correct ingesteld of komt niet overeen met je echte Netlify URL.

1. Kopieer je exacte Netlify URL (bijv. `https://proefrit-autoofy-12345.netlify.app`)
2. Ga naar Site settings → Environment variables
3. Edit `NEXTAUTH_URL` → verander naar exact die URL
4. Save
5. Trigger nieuwe deploy: Dashboard → "Trigger deploy" → "Deploy site"


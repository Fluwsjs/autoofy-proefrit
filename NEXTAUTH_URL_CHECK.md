# ✅ NEXTAUTH_URL Check voor proefrit-autoofy.netlify.app

## 🎯 Je Netlify URL
**https://proefrit-autoofy.netlify.app**

## ⚠️ BELANGRIJK: Waar moet dit staan?

**NEXTAUTH_URL moet in Netlify Environment Variables staan, NIET in code files!**

### ✅ Correct: In Netlify Environment Variables
1. Ga naar Netlify Dashboard → je site
2. **Site settings** → **Environment variables**
3. Zoek `NEXTAUTH_URL`
4. Waarde moet zijn: `https://proefrit-autoofy.netlify.app`
   - ⚠️ **ZONDER** trailing slash (`/`) aan het eind!
   - ✅ Goed: `https://proefrit-autoofy.netlify.app`
   - ❌ Fout: `https://proefrit-autoofy.netlify.app/`

### ❌ NIET in code files
- `.env` files worden NIET gebruikt door Netlify
- Code files hebben geen NEXTAUTH_URL nodig
- Alleen Netlify environment variables!

## 📋 Check Checklist

### Stap 1: Check Netlify Environment Variables
1. Ga naar: https://app.netlify.com
2. Selecteer je site: `proefrit-autoofy`
3. **Site settings** → **Environment variables**
4. Check `NEXTAUTH_URL`:
   - Key: `NEXTAUTH_URL`
   - Value: `https://proefrit-autoofy.netlify.app` (zonder `/`)
   - Scopes: All scopes

### Stap 2: Als NEXTAUTH_URL niet correct is
1. Edit `NEXTAUTH_URL`
2. Zet waarde op: `https://proefrit-autoofy.netlify.app`
3. **Save**
4. Ga terug naar dashboard
5. **Trigger deploy** → **Deploy site**

### Stap 3: Test
Na nieuwe deploy:
1. Ga naar: https://proefrit-autoofy.netlify.app
2. Probeer in te loggen
3. Zou nu moeten werken!

## 🔍 Alle Environment Variables die moeten staan:

In Netlify → Environment variables:

1. **DATABASE_URL**
   - Value: `postgresql://postgres:Italy024!@@db.cttgctesyubfmhxwzfez.supabase.co:5432/postgres`

2. **NEXTAUTH_URL** ⚠️
   - Value: `https://proefrit-autoofy.netlify.app` (zonder `/`)

3. **NEXTAUTH_SECRET**
   - Value: `a5515096fd53df882c00e422a08dcdb8`

4. **CRON_SECRET** (optioneel)
   - Value: `cron-secret-key-2024`

## ✅ Klaar!

Als NEXTAUTH_URL correct is ingesteld in Netlify, zou alles moeten werken!


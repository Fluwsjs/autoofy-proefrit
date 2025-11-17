# Netlify Login Probleem - Checklist

## ✅ Check deze dingen in Netlify Dashboard

### 1. Environment Variables
Ga naar: **Site settings** → **Environment variables**

Zorg dat deze variabelen zijn ingesteld:

#### ✅ DATABASE_URL
```
postgresql://[jouw-neondb-connection-string]
```
- Moet exact hetzelfde zijn als lokaal
- Check of dit correct is ingesteld

#### ✅ NEXTAUTH_URL
```
https://proefrit-autoofy.netlify.app
```
- ⚠️ **BELANGRIJK**: Moet exact je Netlify URL zijn
- Check je site URL in Netlify dashboard
- Moet beginnen met `https://`
- Geen trailing slash `/`

#### ✅ NEXTAUTH_SECRET
```
[jouw-secret-key]
```
- Moet een lange random string zijn (minimaal 32 karakters)
- Kan hetzelfde zijn als lokaal OF een nieuwe voor productie
- Genereer met: `openssl rand -base64 32`

#### ✅ RESEND_API_KEY
```
re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### ✅ RESEND_FROM_EMAIL
```
onboarding@resend.dev
```

### 2. Deploy Status
- Check of de laatste deploy succesvol was
- Check build logs voor errors
- Als er errors zijn, fix deze eerst

### 3. Test Database Connectie
De gebruiker `jordy.vhr@gmail.com` bestaat in de database en is geverifieerd ✅

## 🔧 Oplossing

### Stap 1: Check NEXTAUTH_URL
1. Ga naar Netlify Dashboard
2. Site settings → General → Site details
3. Kopieer de exacte URL (bijv. `https://proefrit-autoofy.netlify.app`)
4. Ga naar Environment variables
5. Check of `NEXTAUTH_URL` exact deze URL is (zonder trailing slash)

### Stap 2: Check NEXTAUTH_SECRET
1. Ga naar Environment variables
2. Check of `NEXTAUTH_SECRET` is ingesteld
3. Als niet, genereer een nieuwe:
   ```bash
   openssl rand -base64 32
   ```
4. Voeg toe aan Netlify environment variables

### Stap 3: Trigger Nieuwe Deploy
1. Na het aanpassen van environment variables
2. Ga naar Deploys
3. Klik "Trigger deploy" → "Deploy site"
4. Wacht tot deploy klaar is

### Stap 4: Test Opnieuw
1. Probeer opnieuw in te loggen
2. Check browser console (F12) voor errors
3. Check Netlify function logs voor [AUTH] messages

## 🐛 Debugging

Als het nog steeds niet werkt:

1. **Check Netlify Function Logs:**
   - Ga naar Functions tab in Netlify
   - Kijk naar logs van `/api/auth/callback/credentials`
   - Zoek naar `[AUTH]` messages

2. **Check Browser Console:**
   - Open Developer Tools (F12)
   - Kijk naar Network tab
   - Check de response van `/api/auth/callback/credentials`
   - Kijk naar de error message

3. **Test Database Connectie:**
   - De gebruiker bestaat en is geverifieerd ✅
   - Wachtwoord is correct ✅
   - Probleem is waarschijnlijk in Netlify configuratie

## 📝 Meest Waarschijnlijke Oorzaak

**NEXTAUTH_URL is niet correct ingesteld op Netlify**

Dit is de meest voorkomende oorzaak van 401 errors op Netlify. Zorg dat:
- `NEXTAUTH_URL` exact je Netlify URL is
- Begint met `https://`
- Geen trailing slash
- Exact zoals getoond in Netlify dashboard


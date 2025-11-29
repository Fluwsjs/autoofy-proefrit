# 🔧 Fix Login Probleem na Domein Wijziging naar proefrit-autoofy.nl

## ⚠️ Wat is er aan de hand?

Na de domein wijziging naar `proefrit-autoofy.nl` werkt de login niet meer. Dit komt omdat:
1. NextAuth environment variabelen nog niet correct zijn ingesteld
2. Cookie configuratie moet aangepast worden voor het nieuwe domein
3. Netlify environment variabelen moeten geupdatet worden

---

## ✅ Stap 1: Update Netlify Environment Variabelen

### Ga naar Netlify Dashboard

1. Open [Netlify Dashboard](https://app.netlify.com)
2. Selecteer je site
3. Ga naar **Site settings** → **Environment variables**

### Update/Voeg toe deze variabelen:

#### NEXTAUTH_URL (KRITIEK!)
```
NEXTAUTH_URL=https://proefrit-autoofy.nl
```

⚠️ **BELANGRIJK:**
- Gebruik `https://` (niet `http://`)
- GEEN trailing slash (niet `https://proefrit-autoofy.nl/`)
- Exact het domein zoals je het in de browser ziet

**Als je een custom domain hebt gekoppeld:**
- Als je site bijvoorbeeld via `proefrit-autoofy.netlify.app` én `proefrit-autoofy.nl` bereikbaar is
- Gebruik dan je HOOFD domein: `https://proefrit-autoofy.nl`

#### NEXTAUTH_SECRET (Check of deze bestaat)
```
NEXTAUTH_SECRET=[genereer een nieuwe secret - zie hieronder]
```

Als deze nog niet bestaat, genereer dan een nieuwe:
- Online: https://generate-secret.vercel.app/32
- Of via terminal: `openssl rand -base64 32`

#### Andere Variabelen (Check of deze correct zijn)
```
DATABASE_URL=postgresql://postgres:Italy024!@@db.cttgctesyubfmhxwzfez.supabase.co:5432/postgres
RESEND_API_KEY=[je bestaande key]
RESEND_FROM_EMAIL=support@proefrit-autoofy.nl
RESEND_FROM_NAME=Autoofy
```

---

## ✅ Stap 2: Check Netlify Domein Configuratie

### In Netlify Dashboard:

1. Ga naar **Domain settings**
2. Check welk domein je als **Primary domain** hebt ingesteld
3. Zorg dat `proefrit-autoofy.nl` het primary domain is

### HTTPS Force Redirect:
1. In **Domain settings** → **HTTPS**
2. Zorg dat **Force HTTPS** is ingeschakeld
3. Dit is essentieel voor de cookie beveiliging

---

## ✅ Stap 3: Redeploy de Site

Na het updaten van environment variabelen:

1. Ga naar **Deploys** tab
2. Klik op **Trigger deploy** → **Deploy site**
3. Wacht tot de deploy compleet is (check de logs)

⚠️ **Environment variabelen worden ALLEEN geladen bij een nieuwe deploy!**

---

## ✅ Stap 4: Test de Login

### Clear Browser Cache & Cookies:
1. Open je site: https://proefrit-autoofy.nl
2. Open Developer Tools (F12)
3. Ga naar **Application** → **Cookies**
4. Delete alle cookies voor `proefrit-autoofy.nl`
5. Hard refresh: `Ctrl+Shift+R` (Windows) of `Cmd+Shift+R` (Mac)

### Probeer in te loggen:
1. Gebruik bestaande account
2. Check browser console voor errors (F12 → Console tab)
3. Check Network tab voor failed requests

---

## 🐛 Als het nog steeds niet werkt

### Check 1: Netlify Function Logs

1. In Netlify Dashboard → **Functions** tab
2. Kijk naar de logs van recente requests
3. Zoek naar errors bij `/api/auth/callback/credentials`
4. Let op `[AUTH]` log messages

### Check 2: Browser Console Errors

Open Developer Tools (F12) en check:
- **Console tab**: Kijk naar error messages
- **Network tab**: Filter op `auth`, kijk naar failed requests (rode items)
- Status codes: `401` = unauthorized, `500` = server error

### Check 3: Database Connectie

Test of je database bereikbaar is:
```bash
# Lokaal testen (als je de DATABASE_URL hebt)
npx prisma db pull
```

### Check 4: Verify Environment Variables zijn geladen

Voeg tijdelijk debug logging toe in Netlify:

1. Ga naar **Deploys** → **Deploy log**
2. Check of er geen errors zijn tijdens build
3. Check of Prisma client correct gegenereerd wordt

---

## 🔍 Veelvoorkomende Problemen & Oplossingen

### Probleem: "Invalid credentials" error
**Oorzaak:** NEXTAUTH_URL is niet correct  
**Oplossing:** Check Stap 1, exact domein gebruiken

### Probleem: "CSRF token mismatch"
**Oorzaak:** Cookie domain niet correct  
**Oplossing:** Code is al geupdate, redeploy nodig

### Probleem: Login lijkt te werken maar meteen weer uitgelogd
**Oorzaak:** Cookie wordt niet opgeslagen (domain mismatch)  
**Oplossing:** Check NEXTAUTH_URL, clear cookies, probeer opnieuw

### Probleem: "Failed to fetch" in browser console
**Oorzaak:** API route niet bereikbaar  
**Oplossing:** Check Netlify Functions logs, mogelijk timeout

### Probleem: Database connection error
**Oorzaak:** DATABASE_URL niet correct of database niet bereikbaar  
**Oplossing:** Check DATABASE_URL in Netlify environment variables

---

## 📋 Checklist Samenvatting

Vink af wat je gedaan hebt:

- [ ] NEXTAUTH_URL ingesteld op Netlify naar `https://proefrit-autoofy.nl`
- [ ] NEXTAUTH_SECRET bestaat en is minimaal 32 karakters
- [ ] DATABASE_URL is correct ingesteld
- [ ] Primary domain is ingesteld op `proefrit-autoofy.nl`
- [ ] Force HTTPS is ingeschakeld
- [ ] Site opnieuw gedeployed
- [ ] Browser cookies gecleared
- [ ] Login getest

---

## 🆘 Hulp Nodig?

Als het nog steeds niet werkt, verzamel deze informatie:

1. **Netlify Function Logs:**
   - Screenshot van `/api/auth/callback/credentials` logs
   - Check op `[AUTH]` messages

2. **Browser Console:**
   - Screenshot van Console tab (errors)
   - Screenshot van Network tab (failed auth requests)

3. **Environment Variables:**
   - Bevestig dat NEXTAUTH_URL correct is (zonder de waarde te tonen)
   - Bevestig dat NEXTAUTH_SECRET bestaat

4. **Test Account:**
   - Welk email adres gebruik je?
   - Is het account email geverifieerd? (check database)

---

## 🎯 Verwacht Resultaat

Na deze stappen zou je:
- ✅ In kunnen loggen op https://proefrit-autoofy.nl
- ✅ Ingelogd blijven na page refresh
- ✅ Correct naar dashboard geredirect worden
- ✅ Geen console errors meer zien


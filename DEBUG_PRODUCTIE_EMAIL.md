# 🔍 Debug: Geen Email Op Productie

## Situatie
- ✅ Registreren via `https://proefrit-autoofy.nl`
- ❌ Geen email ontvangen

---

## 📋 Checklist

### 1. Is de App Gedeployed?
```bash
# SSH naar server
ssh user@proefrit-autoofy.nl

# Check of app draait
pm2 status
pm2 logs autoofy --lines 50
```

### 2. Check `.env` op Server
```bash
# Op server:
cat .env | grep RESEND
cat .env | grep NEXTAUTH_URL
```

**Moet zijn:**
```bash
NEXTAUTH_URL=https://proefrit-autoofy.nl
RESEND_API_KEY=re_h24fbdsy_GPvz9XBayug59c1QA7WF4wSm
RESEND_FROM_EMAIL=support@proefrit-autoofy.nl
RESEND_FROM_NAME=Autoofy
```

### 3. Check Server Logs
```bash
# Kijk naar logs tijdens registratie
pm2 logs autoofy --lines 0

# Zoek naar:
# - "✅ Resend service geconfigureerd"
# - "Sending email via Resend to: ..."
# - Errors
```

### 4. Test Email Endpoint Op Productie
```
https://proefrit-autoofy.nl/api/test-email?to=jouw@email.com
```

**Expected Response:**
```json
{
  "success": true,
  "message": "✅ Test email verzonden..."
}
```

### 5. Check Resend Dashboard
- Ga naar: [resend.com/emails](https://resend.com/emails)
- Filter op laatste uur
- Zie je emails?
- Wat is de status?

---

## 🐛 Meest Voorkomende Problemen

### Probleem 1: .env Niet Op Server
**Symptoom:** Geen email verzonden, geen logs

**Fix:**
```bash
# SSH naar server
cd /pad/naar/autoofy
nano .env

# Plak ALLE environment variables
# Save: Ctrl+O, Enter, Ctrl+X

# Herstart
pm2 restart autoofy
```

### Probleem 2: Build Verouderd
**Symptoom:** Oude code draait

**Fix:**
```bash
# Op server
git pull origin main
npm install
npm run build
npx prisma generate
pm2 restart autoofy
```

### Probleem 3: NEXTAUTH_URL Verkeerd
**Symptoom:** Links in email wijzen naar localhost

**Fix:**
```bash
# Check .env op server
cat .env | grep NEXTAUTH_URL

# Moet zijn:
NEXTAUTH_URL=https://proefrit-autoofy.nl

# Herstart
pm2 restart autoofy
```

### Probleem 4: Resend API Key Niet Ingesteld
**Symptoom:** Error in logs "No email service configured"

**Fix:**
```bash
# Check .env
cat .env | grep RESEND_API_KEY

# Moet zijn:
RESEND_API_KEY=re_h24fbdsy_GPvz9XBayug59c1QA7WF4wSm

# Herstart
pm2 restart autoofy
```

---

## 🧪 Quick Debug Commands

```bash
# SSH naar server
ssh user@proefrit-autoofy.nl

# Check app status
pm2 status

# Check logs (real-time)
pm2 logs autoofy --lines 50

# Check .env
cat .env

# Herstart app
pm2 restart autoofy

# Check of app responsive is
curl https://proefrit-autoofy.nl/api/test-email?to=test@test.com
```

---

## 📊 Expected Server Logs

**Bij opstarten:**
```
✅ Resend service geconfigureerd
```

**Bij registratie:**
```
[AUTH] Authorize called
Sending email via Resend to: user@example.com
```

**Als dit NIET verschijnt:**
- Environment variables niet geladen
- App niet herstart na .env update

---

## 🚀 Quick Fix Procedure

```bash
# 1. SSH naar server
ssh user@proefrit-autoofy.nl

# 2. Ga naar project
cd /pad/naar/autoofy

# 3. Pull laatste code
git pull origin main

# 4. Install dependencies
npm install

# 5. Build
npm run build

# 6. Update Prisma
npx prisma generate

# 7. Check .env
nano .env
# Zorg dat alle variabelen kloppen!

# 8. Herstart
pm2 restart autoofy

# 9. Check logs
pm2 logs autoofy --lines 20

# 10. Test
curl "https://proefrit-autoofy.nl/api/test-email?to=jouw@email.com"
```

---

## ✅ Verification

**Na fix, test dit:**
1. Ga naar `https://proefrit-autoofy.nl/api/test-email?to=jouw@email.com`
2. Moet response geven: `"success": true`
3. Check inbox → test email ontvangen?
4. Registreer nieuw account
5. Check inbox → verificatie email ontvangen?

---

**Vertel me: Heb je de app al gedeployed naar de server?** 🤔












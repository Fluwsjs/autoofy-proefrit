# 🚨 FIX: Geen Emails Op Productie

## Probleem
Je registreert via `https://proefrit-autoofy.nl` maar ontvangt geen emails.

---

## ✅ Oplossing: Update Server `.env`

### Stap 1: SSH naar Je Server

```bash
ssh user@proefrit-autoofy.nl
# Of via Hostinger SSH terminal
```

### Stap 2: Ga naar Project Directory

```bash
cd /home/u123456789/domains/proefrit-autoofy.nl/public_html
# Of waar je project staat
```

### Stap 3: Check Huidige `.env`

```bash
cat .env
```

**Kijk of deze regels er in staan:**
```bash
RESEND_API_KEY=re_h24fbdsy_GPvz9XBayug59c1QA7WF4wSm
RESEND_FROM_EMAIL=support@proefrit-autoofy.nl
NEXTAUTH_URL=https://proefrit-autoofy.nl
```

### Stap 4: Update `.env` File

```bash
nano .env
```

**Zorg dat deze regels erin staan:**

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# NextAuth - PRODUCTIE
NEXTAUTH_URL=https://proefrit-autoofy.nl
NEXTAUTH_SECRET=jouw-super-secure-secret-min-32-chars

# Resend Email - KRITISCH!
RESEND_API_KEY=re_h24fbdsy_GPvz9XBayug59c1QA7WF4wSm
RESEND_FROM_EMAIL=support@proefrit-autoofy.nl
RESEND_FROM_NAME=Autoofy

# Optional
CRON_SECRET=your-cron-secret
ADMIN_CREATE_SECRET=your-admin-secret
```

**Save:**
- Druk `Ctrl+O`
- Druk `Enter`
- Druk `Ctrl+X`

### Stap 5: Herstart Applicatie

**Als je PM2 gebruikt:**
```bash
pm2 restart autoofy
# Of
pm2 restart all
```

**Als je Node.js app via Hostinger gebruikt:**
- Ga naar Hostinger Panel
- Klik op je Node.js app
- Klik "Restart"

**Als je direct Node draait:**
```bash
# Stop huidige proces
pkill -f "node"

# Start opnieuw
npm start
# Of
node server.js
# Of
npm run start:prod
```

### Stap 6: Test!

Open in browser:
```
https://proefrit-autoofy.nl/api/test-email?to=jouw@email.com
```

**Expected:**
```json
{
  "success": true,
  "message": "✅ Test email verzonden naar jouw@email.com!"
}
```

**Check je inbox!**

---

## 🐛 Als Het Nog Niet Werkt

### Check 1: Server Logs

```bash
# PM2
pm2 logs autoofy --lines 50

# Of
tail -f /var/log/nodejs/app.log

# Zoek naar:
# - "✅ Resend service geconfigureerd"
# - "Sending email via Resend to: ..."
# - Errors
```

### Check 2: Environment Variables Geladen?

Maak test file:
```bash
nano test-env.js
```

Plak:
```javascript
console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? 'SET ✅' : 'NOT SET ❌')
console.log('RESEND_FROM_EMAIL:', process.env.RESEND_FROM_EMAIL)
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL)
```

Run:
```bash
node test-env.js
```

**Expected:**
```
RESEND_API_KEY: SET ✅
RESEND_FROM_EMAIL: support@proefrit-autoofy.nl
NEXTAUTH_URL: https://proefrit-autoofy.nl
```

### Check 3: Rebuild App

```bash
# Pull laatste code
git pull origin main

# Install
npm install

# Build
npm run build

# Prisma
npx prisma generate
npx prisma db push

# Herstart
pm2 restart autoofy
```

---

## 🎯 Meest Waarschijnlijke Oorzaak

**`.env` file mist `RESEND_API_KEY` op de server!**

Dit is de meest voorkomende oorzaak. De `.env` file op je server is waarschijnlijk:
- Niet aangemaakt
- Heeft oude waarden
- Mist de Resend configuratie

---

## ✅ Snel Commando Script

Plak dit in je server terminal (update paden!):

```bash
# Ga naar project
cd /pad/naar/je/project

# Backup oude .env
cp .env .env.backup 2>/dev/null || true

# Maak nieuwe .env
cat > .env << 'EOF'
DATABASE_URL=postgresql://user:pass@host:5432/db
NEXTAUTH_URL=https://proefrit-autoofy.nl
NEXTAUTH_SECRET=jouw-32-char-secret-hier
RESEND_API_KEY=re_h24fbdsy_GPvz9XBayug59c1QA7WF4wSm
RESEND_FROM_EMAIL=support@proefrit-autoofy.nl
RESEND_FROM_NAME=Autoofy
EOF

# Herstart
pm2 restart autoofy

# Test
curl "https://proefrit-autoofy.nl/api/test-email?to=test@test.com"
```

**Vergeet niet DATABASE_URL en NEXTAUTH_SECRET aan te passen!**

---

## 📞 Hostinger Specifiek

**Als je Hostinger's Node.js App Manager gebruikt:**

1. Log in op [hpanel.hostinger.com](https://hpanel.hostinger.com)
2. Ga naar je Node.js applicatie
3. Klik "Environment Variables"
4. Voeg toe:
   ```
   RESEND_API_KEY = re_h24fbdsy_GPvz9XBayug59c1QA7WF4wSm
   RESEND_FROM_EMAIL = support@proefrit-autoofy.nl
   RESEND_FROM_NAME = Autoofy
   NEXTAUTH_URL = https://proefrit-autoofy.nl
   ```
5. Klik "Save"
6. Klik "Restart Application"

---

## 🧪 Test Procedure

1. ✅ Update `.env` op server
2. ✅ Herstart applicatie
3. ✅ Test: `https://proefrit-autoofy.nl/api/test-email?to=jouw@email.com`
4. ✅ Check inbox (ook spam!)
5. ✅ Registreer nieuw account
6. ✅ Check verificatie email
7. ✅ Klik link in email
8. ✅ Moet inloggen + redirect naar dashboard

---

**Ga nu naar je server en update de `.env` file!** 🚀

Vertel me wanneer je dit gedaan hebt, dan testen we samen!








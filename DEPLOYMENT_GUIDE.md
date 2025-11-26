# 🚀 Deployment Guide - Productie Setup

## 📋 Overzicht

Deze guide helpt je om Autoofy naar productie te deployen met:
- ✅ Email verificatie via Resend
- ✅ Wachtwoord reset functionaliteit
- ✅ ID foto beveiliging (watermerk + zwarte balk)
- ✅ Correcte email links naar je domein

---

## 🎯 Productie Environment Variables

### **`.env` File op Productie Server**

Maak een `.env` file op je productie server met deze waarden:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# NextAuth - ⚠️ BELANGRIJK: Gebruik je echte domein!
NEXTAUTH_URL=https://proefrit-autoofy.nl
NEXTAUTH_SECRET=super-secure-production-secret-min-32-characters-long-random-string

# Resend Email Service
RESEND_API_KEY=re_h24fbdsy_GPvz9XBayug59c1QA7WF4wSm
RESEND_FROM_EMAIL=support@proefrit-autoofy.nl
RESEND_FROM_NAME=Autoofy

# Optional (alleen als je deze hebt)
CRON_SECRET=your-production-cron-secret
ADMIN_CREATE_SECRET=your-production-admin-secret
```

---

## ⚠️ Kritieke Verschillen Development vs Productie

| Variable | Development | Production |
|----------|------------|------------|
| `NEXTAUTH_URL` | `http://localhost:3000` | `https://proefrit-autoofy.nl` |
| `NEXTAUTH_SECRET` | Simpele string | 32+ chars random string |
| `DATABASE_URL` | Lokale database | Productie database |

**Let op:**
- ✅ Productie gebruikt `https://` (niet `http://`)
- ✅ Geen trailing slash: `https://proefrit-autoofy.nl` (niet `https://proefrit-autoofy.nl/`)
- ✅ Email links in productie wijzen naar `https://proefrit-autoofy.nl/api/auth/verify-email?token=...`

---

## 🔐 NEXTAUTH_SECRET Genereren

Voor productie heb je een **sterke random string** nodig:

### Optie 1: Node.js
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Optie 2: OpenSSL
```bash
openssl rand -base64 32
```

### Optie 3: Online Generator
Gebruik: https://generate-secret.vercel.app/32

**Kopieer de output en gebruik als `NEXTAUTH_SECRET`**

---

## 📦 Deployment Stappen

### **Stap 1: Build de Applicatie**

```bash
# Installeer dependencies
npm install

# Build voor productie
npm run build

# Test de productie build lokaal (optioneel)
npm start
```

---

### **Stap 2: Database Setup**

```bash
# Push database schema
npx prisma db push

# Of gebruik migrations
npx prisma migrate deploy

# Genereer Prisma client
npx prisma generate
```

---

### **Stap 3: Upload naar Server**

**Optie A: Via Git (Aanbevolen)**
```bash
# Op je lokale machine
git push origin main

# Op je server
git pull origin main
npm install
npm run build
npx prisma generate
npx prisma db push
```

**Optie B: FTP/SFTP**
- Upload alle files BEHALVE `node_modules`, `.env`, `.git`
- Run `npm install` op server
- Run `npm run build` op server

---

### **Stap 4: Maak `.env` File op Server**

```bash
# SSH naar je server
ssh user@proefrit-autoofy.nl

# Ga naar project directory
cd /pad/naar/autoofy

# Maak .env file
nano .env

# Plak de productie environment variables (zie boven)
# Save: Ctrl+O, Enter, Ctrl+X
```

**Belangrijk:**
```bash
NEXTAUTH_URL=https://proefrit-autoofy.nl  # ← Je echte domein!
```

---

### **Stap 5: Start de Applicatie**

**Optie A: PM2 (Aanbevolen)**
```bash
# Installeer PM2 (indien nodig)
npm install -g pm2

# Start applicatie
pm2 start npm --name "autoofy" -- start

# Auto-start bij reboot
pm2 startup
pm2 save

# Check status
pm2 status
pm2 logs autoofy
```

**Optie B: Direct**
```bash
npm start
```

**Optie C: Met Hostinger Node.js App**
- Gebruik Hostinger's Node.js applicatie manager
- Set entry point: `npm start`
- Set environment variables in panel

---

### **Stap 6: Nginx/Apache Configuratie**

**Nginx (Aanbevolen)**
```nginx
server {
    listen 80;
    server_name proefrit-autoofy.nl www.proefrit-autoofy.nl;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name proefrit-autoofy.nl www.proefrit-autoofy.nl;

    # SSL certificates
    ssl_certificate /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

### **Stap 7: SSL Certificaat (HTTPS)**

**Let's Encrypt (Gratis)**
```bash
# Installeer Certbot
sudo apt install certbot python3-certbot-nginx

# Verkrijg certificaat
sudo certbot --nginx -d proefrit-autoofy.nl -d www.proefrit-autoofy.nl

# Auto-renewal test
sudo certbot renew --dry-run
```

---

## ✅ Productie Checklist

### Pre-Deployment
- [ ] Code is getest lokaal
- [ ] `npm run build` werkt zonder errors
- [ ] Database migrations zijn klaar
- [ ] `.env.example` is up-to-date

### Server Setup
- [ ] `.env` file gemaakt op server
- [ ] `NEXTAUTH_URL=https://proefrit-autoofy.nl` (met HTTPS!)
- [ ] `NEXTAUTH_SECRET` is 32+ chars random string
- [ ] `DATABASE_URL` wijst naar productie database
- [ ] `RESEND_API_KEY` is correct
- [ ] `RESEND_FROM_EMAIL=support@proefrit-autoofy.nl`

### Deployment
- [ ] Code geüpload naar server
- [ ] `npm install` uitgevoerd
- [ ] `npm run build` succesvol
- [ ] `npx prisma generate` uitgevoerd
- [ ] `npx prisma db push` uitgevoerd
- [ ] Applicatie gestart (PM2 of andere process manager)

### DNS & SSL
- [ ] Domain wijst naar server IP
- [ ] SSL certificaat geïnstalleerd
- [ ] HTTPS werkt (groene hangslot in browser)
- [ ] HTTP redirect naar HTTPS werkt

### Resend Email
- [ ] Domain `proefrit-autoofy.nl` verified in Resend
- [ ] DNS records toegevoegd (resend._domainkey)
- [ ] Test email werkt: `https://proefrit-autoofy.nl/api/test-email?to=jouw@email.com`

### Functionaliteit Test
- [ ] Website bereikbaar via `https://proefrit-autoofy.nl`
- [ ] Registratie werkt
- [ ] Email verificatie email ontvangen
- [ ] Email link wijst naar `https://proefrit-autoofy.nl/...` (niet localhost!)
- [ ] Email verificatie werkt (klik link)
- [ ] Auto-login na verificatie werkt
- [ ] Login werkt
- [ ] Dashboard bereikbaar
- [ ] Wachtwoord vergeten werkt
- [ ] Password reset email ontvangen
- [ ] Password reset werkt
- [ ] ID foto upload werkt (watermerk + zwarte balk)

---

## 🔍 Testing in Productie

### Test 1: Email Verificatie Flow
```
1. Ga naar https://proefrit-autoofy.nl
2. Klik "Registreren"
3. Vul gegevens in met ECHT email adres
4. Check inbox
5. Verificatie email ontvangen?
6. Email link bevat https://proefrit-autoofy.nl? (niet localhost!)
7. Klik link
8. Automatisch ingelogd?
9. Dashboard zichtbaar?
```

### Test 2: Wachtwoord Reset Flow
```
1. Ga naar https://proefrit-autoofy.nl
2. Klik "Wachtwoord vergeten?"
3. Vul email in
4. Check inbox
5. Reset email ontvangen?
6. Email link bevat https://proefrit-autoofy.nl?
7. Klik link
8. Nieuw wachtwoord invoeren werkt?
9. Login met nieuw wachtwoord werkt?
```

### Test 3: ID Foto Beveiliging
```
1. Login
2. Ga naar "Nieuwe Proefrit"
3. Upload rijbewijs foto
4. Zie je watermerk "AUTOOFY - ALLEEN VERIFICATIE"?
5. Zie je zwarte balk onderaan (onderste 25%)?
6. BSN/rijbewijsnummer niet zichtbaar?
```

---

## 🆘 Troubleshooting Productie

### Email Links Wijzen Nog Naar Localhost

**Probleem:** Email link is `http://localhost:3000/api/auth/verify-email?token=...`

**Oorzaak:** `NEXTAUTH_URL` staat niet correct in productie `.env`

**Fix:**
```bash
# SSH naar server
ssh user@server

# Check .env
cat .env | grep NEXTAUTH_URL

# Moet zijn:
NEXTAUTH_URL=https://proefrit-autoofy.nl

# Update indien nodig
nano .env

# Herstart applicatie
pm2 restart autoofy
```

---

### Email Wordt Niet Verzonden

**Check 1: Resend API Key**
```bash
# Check of API key in .env staat
cat .env | grep RESEND_API_KEY

# Test met curl
curl https://proefrit-autoofy.nl/api/test-email?to=jouw@email.com
```

**Check 2: FROM_EMAIL Domain**
```bash
# Moet eindigen op @proefrit-autoofy.nl
cat .env | grep RESEND_FROM_EMAIL

# Moet zijn:
RESEND_FROM_EMAIL=support@proefrit-autoofy.nl
```

**Check 3: Resend Dashboard**
- Ga naar [resend.com/emails](https://resend.com/emails)
- Zie je de emails daar?
- Wat is de status? (Delivered/Bounced/Failed)

---

### "Cannot GET /" Error

**Probleem:** Applicatie niet correct gestart

**Fix:**
```bash
# Check of build bestaat
ls -la .next

# Rebuild indien nodig
npm run build

# Herstart
pm2 restart autoofy

# Check logs
pm2 logs autoofy
```

---

### Database Connection Error

**Probleem:** `DATABASE_URL` incorrect

**Fix:**
```bash
# Check connection string
cat .env | grep DATABASE_URL

# Test database connection
npx prisma db push

# Check Prisma client
npx prisma generate
```

---

## 📊 Monitoring

### Check Application Status
```bash
# PM2 status
pm2 status

# Logs
pm2 logs autoofy

# Real-time logs
pm2 logs autoofy --lines 100
```

### Check Email Logs
- Resend Dashboard: [resend.com/emails](https://resend.com/emails)
- Zie alle verzonden emails + status

### Check Application Logs
```bash
# Laatste 100 regels
pm2 logs autoofy --lines 100

# Zoek naar errors
pm2 logs autoofy --err

# Real-time
pm2 logs autoofy --lines 0
```

---

## 🔄 Updates Deployen

```bash
# Lokaal: commit changes
git add .
git commit -m "Update beschrijving"
git push origin main

# Server: pull updates
ssh user@server
cd /pad/naar/autoofy
git pull origin main
npm install  # Als package.json gewijzigd
npm run build
npx prisma generate  # Als schema gewijzigd
npx prisma db push  # Als schema gewijzigd
pm2 restart autoofy
```

---

## 🎉 Productie Ready!

Als alle tests slagen:
✅ Email verificatie werkt in productie
✅ Wachtwoord reset werkt in productie
✅ ID foto beveiliging werkt
✅ Alle links wijzen naar je echte domein
✅ HTTPS werkt
✅ SSL certificaat geldig

**Je applicatie is productie-ready!** 🚀

---

## 📞 Support

**Issues met:**
- Resend: [resend.com/support](https://resend.com/support)
- Let's Encrypt: [community.letsencrypt.org](https://community.letsencrypt.org/)
- Hostinger: [hostinger.com/support](https://hostinger.com/support)

**Documentatie:**
- `EMAIL_VERIFICATIE_FLOW.md` - Complete email flow
- `EMAIL_LINKS_UITLEG.md` - Email links uitleg
- `CHECK_EMAIL_CONFIG.md` - Email configuratie troubleshooting


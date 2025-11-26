# 📧 Email Links & NEXTAUTH_URL

## 🎯 Het Probleem

Je email links wijzen naar `localhost` in plaats van je echte domein!

**Voorbeeld email link:**
```
http://localhost:3000/api/auth/verify-email?token=abc123...
```

---

## 🔍 Waarom Gebeurt Dit?

In `lib/email.ts`:
```typescript
const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000"
```

Alle email links gebruiken deze `BASE_URL`:
- ✅ Email verificatie link
- ✅ Wachtwoord reset link
- ✅ Resend verificatie link

**Als `NEXTAUTH_URL=http://localhost:3000`** → emails bevatten localhost links
**Als `NEXTAUTH_URL=https://proefrit-autoofy.nl`** → emails bevatten productie links

---

## ✅ Oplossing: 2 Scenarios

### **Scenario 1: Development (Lokaal Testen)** 💻

**Je `.env` file:**
```bash
NEXTAUTH_URL=http://localhost:3000
```

**Hoe het werkt:**
1. ✅ Registreer account (lokaal op `localhost:3000`)
2. ✅ Ontvang email met link: `http://localhost:3000/api/auth/verify-email?token=...`
3. ✅ Klik op link
4. ✅ Browser opent: `http://localhost:3000/api/auth/verify-email?token=...`
5. ✅ **Je lokale server (`npm run dev`) handelt de verificatie af**
6. ✅ Auto-login werkt!

**✅ Dit is CORRECT voor development!**

**Voorwaarde:**
- 🔥 Je lokale server **MOET** draaien (`npm run dev`)
- 🔥 Anders krijg je "This site can't be reached"

---

### **Scenario 2: Productie (Gedeployed op Hostinger)** 🌍

**Je `.env` file (op server):**
```bash
NEXTAUTH_URL=https://proefrit-autoofy.nl
```

**Hoe het werkt:**
1. ✅ Gebruiker registreert op `https://proefrit-autoofy.nl`
2. ✅ Ontvang email met link: `https://proefrit-autoofy.nl/api/auth/verify-email?token=...`
3. ✅ Klik op link
4. ✅ Browser opent: `https://proefrit-autoofy.nl/api/auth/verify-email?token=...`
5. ✅ **Je productie server handelt de verificatie af**
6. ✅ Auto-login werkt!

**✅ Dit is CORRECT voor productie!**

---

## 🧪 Test Nu (Development)

### Stap 1: Check je `.env`
```bash
NEXTAUTH_URL=http://localhost:3000
```

### Stap 2: Herstart Server
```powershell
# Stop server (Ctrl+C)
npm run dev
```

### Stap 3: Registreer Nieuw Account
1. Ga naar `http://localhost:3000`
2. Registreer met NIEUW email adres
3. Check je inbox

### Stap 4: Klik Email Link
**Let op:** Je server moet draaien!

**Expected:**
1. Klik "Verifieer e-mailadres" button
2. Browser opent `http://localhost:3000/api/auth/verify-email?token=...`
3. ✅ Redirect naar auto-login page
4. ✅ Automatisch ingelogd
5. ✅ Redirect naar `/dashboard`

**Als dit werkt:** ✅ EMAIL VERIFICATIE WERKT LOKAAL!

---

## 🚀 Productie Deployment (Later)

### Stap 1: Update `.env` op Server
```bash
# Op je productie server (Hostinger)
NEXTAUTH_URL=https://proefrit-autoofy.nl
```

### Stap 2: Herstart Applicatie
```bash
# Op server
npm run build
pm2 restart autoofy  # of je process manager
```

### Stap 3: Test in Productie
1. Ga naar `https://proefrit-autoofy.nl`
2. Registreer nieuw account
3. Check email - link moet naar `https://proefrit-autoofy.nl` wijzen
4. Klik link → werkt!

---

## 🔧 Environment Variables Samenvatting

### Development (`.env` lokaal)
```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=development-secret-min-32-chars
RESEND_API_KEY=re_h24fbdsy_GPvz9XBayug59c1QA7WF4wSm
RESEND_FROM_EMAIL=support@proefrit-autoofy.nl
RESEND_FROM_NAME=Autoofy
DATABASE_URL=postgresql://...  # lokale database
```

### Production (`.env` op server)
```bash
NEXTAUTH_URL=https://proefrit-autoofy.nl
NEXTAUTH_SECRET=super-secure-production-secret-min-32-chars
RESEND_API_KEY=re_h24fbdsy_GPvz9XBayug59c1QA7WF4wSm
RESEND_FROM_EMAIL=support@proefrit-autoofy.nl
RESEND_FROM_NAME=Autoofy
DATABASE_URL=postgresql://...  # productie database
```

**Belangrijke verschillen:**
- ✅ `NEXTAUTH_URL`: `http://localhost` vs `https://domein`
- ✅ `NEXTAUTH_SECRET`: andere secret voor productie
- ✅ `DATABASE_URL`: andere database voor productie

---

## 🆘 Troubleshooting

### "This site can't be reached" na email link klikken

**Probleem:** Email link wijst naar `localhost` maar je server draait niet

**Oplossing:**
1. Start je server: `npm run dev`
2. Klik link opnieuw
3. Of kopieer link en plak in browser terwijl server draait

---

### "Link werkt niet in productie"

**Probleem:** `NEXTAUTH_URL` staat nog op `localhost` in productie `.env`

**Oplossing:**
1. SSH naar server
2. Update `.env`: `NEXTAUTH_URL=https://proefrit-autoofy.nl`
3. Herstart applicatie
4. Test met nieuwe registratie

---

### "Token expired" error

**Probleem:** Te lang gewacht met klikken (>24 uur voor verificatie, >1 uur voor reset)

**Oplossing:**
1. Ga naar login page
2. Klik "Email opnieuw versturen"
3. Ontvang nieuwe email met nieuwe token
4. Klik binnen tijdslimiet

---

## ✅ Checklist

### Development Test
- [ ] `.env` heeft `NEXTAUTH_URL=http://localhost:3000`
- [ ] Server draait (`npm run dev`)
- [ ] Registreer nieuw account
- [ ] Email ontvangen
- [ ] Email link bevat `localhost:3000`
- [ ] Klik link (terwijl server draait)
- [ ] Verificatie succesvol
- [ ] Automatisch ingelogd
- [ ] Zie dashboard

### Productie Deploy
- [ ] `.env` op server heeft `NEXTAUTH_URL=https://proefrit-autoofy.nl`
- [ ] `https://` (niet `http://`)
- [ ] Geen trailing slash
- [ ] Applicatie herstart na `.env` update
- [ ] Test registratie in productie
- [ ] Email link bevat `https://proefrit-autoofy.nl`
- [ ] Link werkt
- [ ] Verificatie succesvol

---

## 🎯 Samenvatting

**De link in je email is ALTIJD gelijk aan `NEXTAUTH_URL`:**

```
NEXTAUTH_URL=http://localhost:3000
  ↓
Email link: http://localhost:3000/api/auth/verify-email?token=...

NEXTAUTH_URL=https://proefrit-autoofy.nl
  ↓
Email link: https://proefrit-autoofy.nl/api/auth/verify-email?token=...
```

**Voor nu (development):**
✅ `localhost` links zijn OK als je lokaal test!

**Voor later (productie):**
✅ Update naar `https://proefrit-autoofy.nl` bij deployment!

---

**Test nu lokaal met de localhost link - het moet werken als je server draait!** 🚀


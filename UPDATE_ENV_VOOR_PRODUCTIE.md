# 🚀 Update Je .env File Voor Productie

## ⚠️ ACTIE VEREIST!

Je code is nu klaar voor productie, maar je moet **zelf je `.env` file updaten**.

---

## 📝 Update Je Lokale `.env` File

### Stap 1: Open je `.env` file

```powershell
notepad .env
```

### Stap 2: Update Deze Regel

**❌ VOOR (localhost):**
```bash
NEXTAUTH_URL=http://localhost:3000
```

**✅ NA (productie):**
```bash
NEXTAUTH_URL=https://proefrit-autoofy.nl
```

### Stap 3: Save & Close

---

## ✅ Wat Er Is Veranderd In De Code

### 1. `lib/email.ts`
**Fallback URL geüpdatet:**
```typescript
// VOOR:
const BASE_URL = ... || "http://localhost:3000"

// NA:
const BASE_URL = ... || "https://proefrit-autoofy.nl"
```

### 2. `next.config.js`
**Productie domein toegevoegd aan Next.js Image domains:**
```javascript
// VOOR:
domains: ['localhost']

// NA:
domains: ['localhost', 'proefrit-autoofy.nl']
```

### 3. `ENV_EXAMPLE.txt`
**Default waarde nu productie domein:**
```bash
# VOOR:
NEXTAUTH_URL=http://localhost:3000

# NA:
NEXTAUTH_URL=https://proefrit-autoofy.nl
```

---

## 🧪 Test Na Update

### 1. Herstart Server
```powershell
# Stop server (Ctrl+C)
npm run dev
```

### 2. Registreer Nieuw Account
```
http://localhost:3000
```
(App draait nog lokaal, dat is OK!)

### 3. Check Email
Email link moet nu zijn:
```
https://proefrit-autoofy.nl/api/auth/verify-email?token=...
```

✅ **Niet meer localhost!**

---

## ⚠️ Belangrijk!

**Als je lokaal test:**
- App draait op `http://localhost:3000`
- Email links wijzen naar `https://proefrit-autoofy.nl`
- **Links werken NIET lokaal** (wijzen naar productie)

**Dit is CORRECT!**
- Je ziet nu hoe productie emails eruit zien
- Na deployment werken de links op productie

---

## 🚀 Volgende Stappen

1. ✅ Update `.env` file (zie boven)
2. ✅ Test registratie → check email links
3. ✅ Deploy naar productie (zie `DEPLOYMENT_GUIDE.md`)
4. ✅ Test verificatie op productie

---

## 📋 Je Complete `.env` File Moet Zijn:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# NextAuth - PRODUCTIE URL
NEXTAUTH_URL=https://proefrit-autoofy.nl
NEXTAUTH_SECRET=your-secret-key-here-min-32-chars

# Resend Email Service
RESEND_API_KEY=re_h24fbdsy_GPvz9XBayug59c1QA7WF4wSm
RESEND_FROM_EMAIL=support@proefrit-autoofy.nl
RESEND_FROM_NAME=Autoofy

# Optional
CRON_SECRET=your-cron-secret-here
ADMIN_CREATE_SECRET=your-admin-secret-here
```

**Kritisch:**
- ✅ `NEXTAUTH_URL=https://proefrit-autoofy.nl` (met HTTPS!)
- ✅ `RESEND_FROM_EMAIL=support@proefrit-autoofy.nl`
- ✅ `RESEND_API_KEY=re_h24fbdsy_...`

---

## ✅ Checklist

- [ ] `.env` file geopend
- [ ] `NEXTAUTH_URL=https://proefrit-autoofy.nl` ingesteld
- [ ] File opgeslagen
- [ ] Server herstart (`npm run dev`)
- [ ] Test registratie gedaan
- [ ] Email ontvangen
- [ ] Email link bevat `https://proefrit-autoofy.nl` ✅
- [ ] Klaar voor productie deployment!

---

**Nu je `.env` updaten, dan pushen we alles naar git!** 🚀


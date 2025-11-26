# 🔍 Email Configuratie Checklist

## ❌ Probleem: Geen Email Ontvangen

Je hebt:
- ✅ Domain verified in Resend
- ✅ API key in .env
- ✅ DNS records toegevoegd (resend._domainkey)
- ❌ Geen email ontvangen na registratie

---

## 🎯 Meest Voorkomende Oorzaak

### **VERKEERDE FROM_EMAIL!**

Resend **VEREIST** dat je FROM_EMAIL:
1. ✅ Eindigt op je geverifieerde domein
2. ✅ Bestaat in je domein (of wildcard is toegestaan)
3. ✅ **MOET** `@proefrit-autoofy.nl` zijn (niet `@resend.dev`!)

---

## 🔧 Fix: Check Je `.env` File

Open je `.env` file en **check deze regel:**

```bash
RESEND_FROM_EMAIL=support@proefrit-autoofy.nl
```

### ❌ FOUT (werkt NIET):
```bash
RESEND_FROM_EMAIL=onboarding@resend.dev   # ← FOUT!
```

### ✅ GOED (werkt WEL):
```bash
RESEND_FROM_EMAIL=support@proefrit-autoofy.nl   # ← GOED!
RESEND_FROM_EMAIL=noreply@proefrit-autoofy.nl   # ← Ook goed
RESEND_FROM_EMAIL=info@proefrit-autoofy.nl      # ← Ook goed
```

---

## 🧪 Test Nu Met Test Endpoint

### Stap 1: Check of server draait

De server is gestart! Nu testen:

### Stap 2: Test Email

Open in browser:
```
http://localhost:3000/api/test-email?to=JOUW_EMAIL@gmail.com
```

**Vervang `JOUW_EMAIL@gmail.com` met je echte email!**

---

## 📊 Verwachte Response

### ✅ Als het WERKT:
```json
{
  "success": true,
  "message": "✅ Test email verzonden naar jouw@email.com!",
  "details": "Check je inbox (en spam folder)"
}
```

→ **Check je inbox!** (ook spam folder)

### ❌ Als het NIET werkt:

**Response 1: API Key Error**
```json
{
  "success": false,
  "error": "Invalid API key"
}
```
→ Check `RESEND_API_KEY` in `.env`

**Response 2: Domain Error**
```json
{
  "success": false,
  "error": "Domain not verified"
}
```
→ FROM_EMAIL heeft verkeerd domein!

**Response 3: Email Address Error**
```json
{
  "success": false,
  "error": "The from address must be verified or you need to add the domain"
}
```
→ **FROM_EMAIL is NIET `@proefrit-autoofy.nl`!**

---

## 🔍 Debug: Server Logs

Kijk naar je terminal waar `npm run dev` draait.

**Zoek naar deze regels:**

### ✅ GOED:
```
✅ Resend service geconfigureerd
Sending email via Resend to: jouw@email.com
```

### ❌ FOUT:
```
⚠️ Geen e-mail service geconfigureerd
```
→ API key niet geladen

---

## 🛠️ Stappen Om Te Fixen

### 1. Open `.env` File
```powershell
notepad .env
```

### 2. Check/Update Deze Regels:
```bash
RESEND_API_KEY=re_h24fbdsy_GPvz9XBayug59c1QA7WF4wSm
RESEND_FROM_EMAIL=support@proefrit-autoofy.nl
RESEND_FROM_NAME=Autoofy
```

**LET OP:** 
- Geen spaties voor/na `=`
- Geen quotes nodig
- `FROM_EMAIL` **MOET** eindigen op `@proefrit-autoofy.nl`

### 3. Herstart Server
Stop de server (Ctrl+C) en start opnieuw:
```powershell
npm run dev
```

### 4. Check Console Output
Moet zien:
```
✅ Resend service geconfigureerd
```

### 5. Test Opnieuw
```
http://localhost:3000/api/test-email?to=JOUW@EMAIL.com
```

---

## 📧 Resend Dashboard Checken

Ga naar: [resend.com/emails](https://resend.com/emails)

**Check:**
- Zie je de email daar staan?
- Wat is de status?
  - ✅ "Delivered" → Check spam folder
  - ❌ "Bounced" → Email adres ongeldig
  - ❌ "Failed" → Kijk naar error message

**Click op de email** om details te zien!

---

## 🎯 Meest Waarschijnlijke Fix

**99% kans dat dit je probleem is:**

```bash
# In je .env file, check deze regel:
RESEND_FROM_EMAIL=support@proefrit-autoofy.nl
```

**Niet:**
- ❌ `onboarding@resend.dev`
- ❌ `support@autoofy.nl` 
- ❌ Iets anders

**Wel:**
- ✅ `support@proefrit-autoofy.nl`
- ✅ `noreply@proefrit-autoofy.nl`
- ✅ `info@proefrit-autoofy.nl`

---

## ✅ Na de Fix

1. ✅ `.env` geüpdatet
2. ✅ Server herstart
3. ✅ Test endpoint werkt
4. ✅ Email ontvangen in inbox
5. ✅ Registreer nieuw account
6. ✅ Verificatie email ontvangen!

🎉 **KLAAR!**


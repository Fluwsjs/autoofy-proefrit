# 🚨 Fix: Geen Verificatie Emails Ontvangen

## ❌ Probleem
Je registreert een account maar ontvangt geen verificatie email.

---

## 🔍 Diagnose Stap 1: Check Email Configuratie

### A. Test op Productie (proefrit-autoofy.nl)

Open in je browser:
```
https://proefrit-autoofy.nl/api/check-email-config
```

Dit toont je huidige configuratie.

### B. Test op Localhost

Als je lokaal test:
```
http://localhost:3000/api/check-email-config
```

### Verwachte Output:

```json
{
  "status": "✅ OK",
  "config": {
    "emailServiceConfigured": true,
    "providers": {
      "resend": {
        "configured": true,
        "apiKeyPreview": "re_h24f..."
      }
    },
    "emailSettings": {
      "fromEmail": "support@proefrit-autoofy.nl",
      "fromName": "Autoofy",
      "baseUrl": "https://proefrit-autoofy.nl"
    }
  }
}
```

---

## 🔴 Meest Voorkomende Problemen

### Probleem 1: RESEND_API_KEY niet ingesteld op Netlify ⚠️

**Symptoom:**
```json
{
  "providers": {
    "resend": {
      "configured": false,
      "apiKeyPreview": "NOT SET"
    }
  }
}
```

**Oplossing:**

1. Ga naar [Netlify Dashboard](https://app.netlify.com)
2. Selecteer je site
3. **Site settings** → **Environment variables**
4. Voeg toe:
   ```
   RESEND_API_KEY=re_h24fbdsy_GPvz9XBayug59c1QA7WF4wSm
   ```
5. **Trigger deploy** (Environment variables worden ALLEEN bij nieuwe deploy geladen!)

---

### Probleem 2: Verkeerde FROM_EMAIL ⚠️

**Symptoom:**
```json
{
  "validation": {
    "isProefritDomain": false,
    "fromEmailDomain": "resend.dev"  // ← FOUT!
  }
}
```

**Waarom is dit fout?**
Resend vereist dat je FROM_EMAIL eindigt op je geverifieerde domein: `@proefrit-autoofy.nl`

**Oplossing:**

In Netlify environment variables:
```bash
# ❌ FOUT:
RESEND_FROM_EMAIL=onboarding@resend.dev

# ✅ GOED:
RESEND_FROM_EMAIL=support@proefrit-autoofy.nl
```

**Andere goede opties:**
- `noreply@proefrit-autoofy.nl`
- `info@proefrit-autoofy.nl`  
- `team@proefrit-autoofy.nl`

---

### Probleem 3: Domein niet geverifieerd in Resend ⚠️

**Check Resend Dashboard:**

1. Ga naar [resend.com/domains](https://resend.com/domains)
2. Check of `proefrit-autoofy.nl` staat in de lijst
3. Status moet **"Verified"** zijn (groen vinkje)

**Als niet geverifieerd:**
- Check DNS records in je domein registrar
- Resend SPF, DKIM records moeten toegevoegd zijn
- Kan 24-48 uur duren (meestal binnen 10 minuten)

---

## 🧪 Diagnose Stap 2: Test Email Verzenden

### Test of email sending werkt:

**Productie:**
```
https://proefrit-autoofy.nl/api/test-email?to=JOUW@EMAIL.com
```

**Localhost:**
```
http://localhost:3000/api/test-email?to=JOUW@EMAIL.com
```

**⚠️ Vervang `JOUW@EMAIL.com` met je echte email adres!**

### ✅ Verwachte Response (als het werkt):

```json
{
  "success": true,
  "message": "✅ Test email verzonden naar jouw@email.com!",
  "details": "Check je inbox (en spam folder)",
  "config": {
    "fromEmail": "support@proefrit-autoofy.nl",
    "provider": "Resend"
  }
}
```

→ **Check je inbox!** (ook spam/junk folder)

### ❌ Error Responses:

**Error 1: No email service configured**
```json
{
  "error": "No email service configured",
  "details": {
    "hasResendKey": false,
    "message": "Set RESEND_API_KEY in environment variables"
  }
}
```
→ RESEND_API_KEY niet ingesteld (zie Probleem 1)

**Error 2: Invalid API key**
```json
{
  "error": "Invalid API key"
}
```
→ RESEND_API_KEY is verkeerd of verlopen

**Error 3: Domain not verified**
```json
{
  "error": "The from address must be verified or you need to add the domain"
}
```
→ FROM_EMAIL gebruikt verkeerd domein (zie Probleem 2)

---

## 📧 Diagnose Stap 3: Check Resend Dashboard

Ga naar [resend.com/emails](https://resend.com/emails)

**Zie je je test email daar staan?**

✅ **JA, status "Delivered"**
- Email is verzonden!
- Check je spam folder
- Check of email adres correct is

✅ **JA, status "Bounced"**
- Ontvangend email adres bestaat niet
- Of email server blokkeert emails van Resend
- Probeer ander email adres

❌ **NEE, geen emails**
- Resend API key niet correct
- Email wordt niet verstuurd door applicatie
- Check Netlify Function Logs

---

## 🛠️ Stap-voor-Stap Fix (Netlify)

### Stap 1: Check Environment Variables

1. Ga naar [Netlify Dashboard](https://app.netlify.com)
2. Selecteer je site: **proefrit-autoofy**
3. **Site settings** → **Environment variables**

### Stap 2: Zorg dat deze variabelen bestaan:

| Variable | Value | Opmerking |
|----------|-------|-----------|
| `RESEND_API_KEY` | `re_h24fbdsy_GPvz9XBayug59c1QA7WF4wSm` | Jouw Resend API key |
| `RESEND_FROM_EMAIL` | `support@proefrit-autoofy.nl` | MOET eindigen op @proefrit-autoofy.nl |
| `RESEND_FROM_NAME` | `Autoofy` | Naam in email |
| `NEXTAUTH_URL` | `https://proefrit-autoofy.nl` | Geen trailing slash! |
| `NEXTAUTH_SECRET` | [32+ chars] | Voor sessie encryptie |
| `DATABASE_URL` | `postgresql://...` | Supabase connectie |

### Stap 3: Trigger Deploy

⚠️ **KRITIEK:** Environment variabelen worden ALLEEN geladen bij nieuwe deploy!

1. Ga naar **Deploys** tab
2. Klik **Trigger deploy** → **Deploy site**
3. Wacht tot deploy compleet (2-3 minuten)

### Stap 4: Test Opnieuw

Na deploy:
```
https://proefrit-autoofy.nl/api/check-email-config
```

Check of:
- ✅ `configured: true`
- ✅ `fromEmail: support@proefrit-autoofy.nl`
- ✅ `isProefritDomain: true`

### Stap 5: Test Email Verzenden

```
https://proefrit-autoofy.nl/api/test-email?to=JOUW@EMAIL.com
```

✅ Zou email moeten ontvangen!

### Stap 6: Test Registratie

1. Clear browser cookies
2. Registreer nieuw account met NIEUW email
3. Check inbox (en spam!)
4. ✅ Moet verificatie email ontvangen!

---

## 🔍 Debug: Netlify Function Logs

Als emails nog steeds niet werken:

1. Ga naar **Netlify Dashboard** → **Functions**
2. Klik op een recente function execution
3. Zoek naar deze log messages:

**✅ Goed:**
```
✅ Resend service geconfigureerd
Sending email via Resend to: user@example.com
```

**❌ Fout:**
```
⚠️ Geen e-mail service geconfigureerd
```
→ Environment variabelen niet geladen (herstart deploy nodig)

```
Resend API error: Invalid API key
```
→ API key is verkeerd

```
Resend API error: Domain not verified
```
→ FROM_EMAIL gebruikt verkeerd domein

---

## 💡 Pro Tips

### Tip 1: Gmail+ Trick voor Testing
```
jouw.email+test1@gmail.com
jouw.email+test2@gmail.com
```
Alle komen in dezelfde inbox, maar zijn uniek voor de app!

### Tip 2: Check Spam Folder
Verificatie emails komen soms in spam. Check:
- Gmail: Promotions/Spam tab
- Outlook: Junk folder
- Andere: Spam/Ongewenst

### Tip 3: Whitelist Resend
Voeg `support@proefrit-autoofy.nl` toe aan contacten om te voorkomen dat emails in spam komen.

### Tip 4: Resend Testing Domain
Voor TESTEN kun je tijdelijk gebruiken:
```
RESEND_FROM_EMAIL=onboarding@resend.dev
```
Dit werkt zonder domein verificatie, MAAR:
- ❌ Emails komen vaak in spam
- ❌ Lage deliverability
- ❌ Niet voor productie!

**Voor PRODUCTIE altijd:**
```
RESEND_FROM_EMAIL=support@proefrit-autoofy.nl
```

---

## 📊 Checklist

- [ ] RESEND_API_KEY ingesteld op Netlify
- [ ] RESEND_FROM_EMAIL eindigt op @proefrit-autoofy.nl
- [ ] Domein proefrit-autoofy.nl geverifieerd in Resend
- [ ] Netlify deploy getriggered na env var wijziging
- [ ] /api/check-email-config toont ✅ OK
- [ ] /api/test-email werkt en email ontvangen
- [ ] Test registratie werkt
- [ ] Verificatie email ontvangen
- [ ] Auto-login na verificatie werkt

---

## 🆘 Nog Steeds Geen Emails?

Verzamel deze info:

1. **Check email config response:**
   ```
   https://proefrit-autoofy.nl/api/check-email-config
   ```
   Screenshot of kopieer de JSON output

2. **Test email response:**
   ```
   https://proefrit-autoofy.nl/api/test-email?to=JOUW@EMAIL.com
   ```
   Screenshot of kopieer de JSON output

3. **Resend Dashboard:**
   - Ga naar [resend.com/emails](https://resend.com/emails)
   - Zie je emails daar staan?
   - Wat is de status?

4. **Netlify Function Logs:**
   - Screenshot van recente function logs
   - Zoek naar email-gerelateerde errors

---

**Met deze test endpoints kunnen we precies zien wat er mis is!** 🎯


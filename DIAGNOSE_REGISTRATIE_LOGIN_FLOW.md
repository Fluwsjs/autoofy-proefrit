# 🔍 Diagnose: Registratie & Login Flow na Domein Wijziging

## ❌ Gevonden Problemen

### 1. KRITIEKE BUG: Auto-login provider naam mismatch ✅ GEFIXED
**Locatie:** `app/auth/auto-login/page.tsx`  
**Probleem:** Code roept `signIn("EmailLink")` aan, maar provider heet `"email-link"` in auth.ts  
**Impact:** Auto-login na email verificatie werkt niet  
**Status:** ✅ **GEFIXED**

### 2. NextAuth Cookie Configuratie ✅ GEFIXED
**Locatie:** `lib/auth.ts`  
**Probleem:** Cookie domain was niet correct ingesteld voor productie  
**Impact:** Login sessies werden niet opgeslagen  
**Status:** ✅ **GEFIXED** - Cookie configuratie toegevoegd met debug mode

### 3. Netlify Environment Variabelen ⚠️ ACTIE VEREIST
**Locatie:** Netlify Dashboard  
**Probleem:** NEXTAUTH_URL moet exact `https://proefrit-autoofy.nl` zijn  
**Impact:** Callbacks en redirects werken niet correct  
**Status:** ⚠️ **CHECK VEREIST**

---

## ✅ Wat er GOED staat

### 1. Email Configuration (lib/email.ts)
```typescript
const BASE_URL = process.env.NEXTAUTH_URL || 
                 process.env.NEXT_PUBLIC_APP_URL || 
                 "https://proefrit-autoofy.nl"  // ✅ Correct fallback
```

✅ Alle email links gebruiken BASE_URL  
✅ Verificatie URLs: `${BASE_URL}/api/auth/verify-email?token=...`  
✅ Reset URLs: `${BASE_URL}/auth/reset-password?token=...`  
✅ Resend configuratie correct

### 2. API Routes
✅ `/api/auth/register` - Maakt account + stuurt verificatie email  
✅ `/api/auth/verify-email` - Verifieert token + redirect naar auto-login  
✅ `/api/auth/resend-verification` - Stuurt nieuwe verificatie email  
✅ `/api/auth/[...nextauth]` - NextAuth endpoints

### 3. Frontend Calls
✅ Alle API calls gebruiken relative URLs (`/api/...`)  
✅ Geen hardcoded localhost URLs in productie code  
✅ next.config.js heeft correct domein in images: `proefrit-autoofy.nl`

---

## 📋 Complete Flow Analyse

### REGISTRATIE FLOW

#### Stap 1: Gebruiker vult formulier in
**Locatie:** `app/page.tsx` (HomePageForm component)
- ✅ Form validatie correct
- ✅ POST naar `/api/auth/register`

#### Stap 2: Backend verwerkt registratie
**Locatie:** `app/api/auth/register/route.ts`
```typescript
1. ✅ Valideer input (Zod schema)
2. ✅ Check of email al bestaat
3. ✅ Hash wachtwoord
4. ✅ Genereer verification token
5. ✅ Create tenant + user in database (transaction)
6. ✅ Stuur verification email via Resend
7. ✅ Return success message
```

#### Stap 3: Verificatie email wordt verstuurd
**Locatie:** `lib/email.ts` → `sendVerificationEmail()`
```typescript
const verificationUrl = `${BASE_URL}/api/auth/verify-email?token=${token}`
```
- ✅ BASE_URL komt van NEXTAUTH_URL of fallback
- ✅ Email template is mooi en professioneel
- ⚠️ **Check:** Resend API key moet correct zijn in Netlify

#### Stap 4: Gebruiker klikt op email link
**URL:** `https://proefrit-autoofy.nl/api/auth/verify-email?token=abc123`

#### Stap 5: Verificatie endpoint verwerkt token
**Locatie:** `app/api/auth/verify-email/route.ts`
```typescript
1. ✅ Find verification token in database
2. ✅ Check of token niet expired is (24 uur geldig)
3. ✅ Update user.emailVerified = true
4. ✅ Keep token for auto-login
5. ✅ Redirect naar /auth/auto-login?token=...&userId=...
```

#### Stap 6: Auto-login poging
**Locatie:** `app/auth/auto-login/page.tsx`
```typescript
// ❌ VOOR (BUG):
signIn("EmailLink", { token, userId })  // ← Verkeerde provider naam!

// ✅ NA (GEFIXED):
signIn("email-link", { token, userId })  // ← Correcte provider naam
```

#### Stap 7: NextAuth verwerkt auto-login
**Locatie:** `lib/auth.ts` → email-link provider
```typescript
1. ✅ Find verification token
2. ✅ Verify user email
3. ✅ Delete token
4. ✅ Return user object voor sessie
5. ✅ Set cookies
6. ✅ Redirect naar /dashboard
```

---

### LOGIN FLOW (Bestaande gebruiker)

#### Stap 1: Gebruiker vult login formulier in
**Locatie:** `app/page.tsx`
```typescript
signIn("credentials", {
  email: loginData.email,
  password: loginData.password,
  redirect: false,
})
```

#### Stap 2: NextAuth credentials provider
**Locatie:** `lib/auth.ts` → credentials provider
```typescript
1. ✅ Normalize email (lowercase)
2. ✅ Check SuperAdmin table eerst
3. ✅ Check User table
4. ✅ Verify email is verified (emailVerified = true)
5. ✅ Compare password hash
6. ✅ Return user object
7. ✅ JWT callback → session callback
8. ✅ Set cookies
```

#### Stap 3: Redirect naar dashboard
**Locatie:** `app/page.tsx` handleLogin()
```typescript
if (result?.error) {
  setError(result.error)
} else {
  router.push("/dashboard")  // ✅ Success
}
```

---

## 🚨 ACTIE VEREIST: Netlify Configuratie

### Check deze environment variabelen in Netlify:

1. **NEXTAUTH_URL** (KRITIEK!)
   ```
   ✅ MOET: https://proefrit-autoofy.nl
   ❌ NIET: https://proefrit-autoofy.nl/
   ❌ NIET: https://proefrit-autoofy.netlify.app
   ```

2. **NEXTAUTH_SECRET**
   ```
   ✅ Minimaal 32 karakters
   ✅ Random gegenereerd
   ```

3. **RESEND_API_KEY**
   ```
   ✅ Begint met "re_"
   ✅ Geldig en actief in Resend dashboard
   ```

4. **RESEND_FROM_EMAIL**
   ```
   ✅ Optie 1: support@proefrit-autoofy.nl (vereist domein verificatie)
   ✅ Optie 2: onboarding@resend.dev (werkt direct voor testing)
   ```

5. **DATABASE_URL**
   ```
   ✅ postgresql://...
   ✅ Verbinding naar Supabase werkt
   ```

---

## 🧪 Test Stappen na Deploy

### Stap 1: Deploy nieuwe code
```bash
git push origin main
```
Wacht tot Netlify deploy compleet is.

### Stap 2: Clear browser data
1. Open https://proefrit-autoofy.nl
2. F12 → Application → Storage → Clear site data
3. Hard refresh: Ctrl+Shift+R

### Stap 3: Test registratie flow
1. Registreer NIEUW account met NIEUW email adres
2. ✅ Success message moet verschijnen
3. ✅ Check je inbox (ook spam folder!)
4. ✅ Email moet linken naar https://proefrit-autoofy.nl/api/auth/verify-email?token=...
5. ✅ Klik op link → moet redirecten naar auto-login
6. ✅ Automatisch ingelogd → doorsturen naar dashboard
7. ✅ Na refresh nog steeds ingelogd

### Stap 4: Test login flow (als auto-login faalt)
1. Als auto-login niet werkt, redirect je naar /?verified=true
2. ✅ Success message: "Uw e-mailadres is geverifieerd!"
3. ✅ Email veld moet al ingevuld zijn
4. ✅ Voer wachtwoord in en klik "Inloggen"
5. ✅ Moet inloggen en naar dashboard gaan

---

## 🐛 Debugging Tips

### Check Netlify Function Logs
1. Ga naar Netlify Dashboard → Functions
2. Filter op `auth`
3. Zoek naar:
   - `[AUTH] Authorize called`
   - `[AUTH] User found: email@example.com`
   - `[AUTH] Login successful`
   - Errors met `[AUTH] ❌`

### Check Browser Console
1. F12 → Console tab
2. Zoek naar:
   - `Auto-login error:` (moet nu weg zijn!)
   - NextAuth errors
   - Network errors (401, 500)

### Check Network Tab
1. F12 → Network tab
2. Filter op `auth`
3. Check `/api/auth/callback/credentials`
   - Status 200 = success
   - Status 401 = unauthorized (credentials fout)
   - Status 500 = server error

### Test Email Sending Lokaal (optioneel)
Als je lokaal wilt testen of emails verstuurd worden:
```bash
node scripts/check-env.js
```
Dit check of alle environment variabelen correct zijn.

---

## 📊 Samenvatting

### Gefixte Bugs
✅ **Auto-login provider naam** - `"EmailLink"` → `"email-link"`  
✅ **NextAuth cookie configuratie** - Productie cookies correct ingesteld  
✅ **Debug logging** - Extra logging in productie mode

### Vereiste Configuratie
⚠️ **Netlify NEXTAUTH_URL** - Moet `https://proefrit-autoofy.nl` zijn  
⚠️ **Resend API key** - Check of deze geldig is  
⚠️ **Resend FROM email** - Gebruik `onboarding@resend.dev` of geverifieerd domein

### Test Checklist
- [ ] Code gedeployed naar Netlify
- [ ] Environment variabelen gecheckt
- [ ] Browser cache gecleared
- [ ] Nieuwe registratie getest
- [ ] Email ontvangen en geklikt
- [ ] Auto-login getest
- [ ] Handmatige login getest (fallback)
- [ ] Session blijft bestaan na refresh

---

## 🆘 Als het nog steeds niet werkt

Verzamel deze informatie:

1. **Netlify Function Logs**
   - Screenshot van auth-gerelateerde logs
   - Specifieke error messages

2. **Browser Console**
   - Screenshot van Console tab (errors in rood)
   - Screenshot van Network tab (failed requests)

3. **Email Test**
   - Wordt de verificatie email ontvangen?
   - Wat is de exacte URL in de email?
   - Werkt de link als je erop klikt?

4. **Database Check**
   - Is de user aangemaakt in de database?
   - Is `emailVerified` true na verificatie?
   - Bestaat de verification token?

---

**Verwachte Resultaat:**  
Na deze fixes moet de hele registratie → email verificatie → auto-login → dashboard flow vlekkeloos werken! 🎉


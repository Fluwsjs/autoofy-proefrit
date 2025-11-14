# Netlify Environment Variables Setup

## 🔧 Environment Variables voor Netlify

Voeg deze toe in je Netlify dashboard:
**Site settings** → **Environment variables** → **Add a variable**

### 1. Database (AL BESTAAT)
```
DATABASE_URL=postgresql://postgres:Italy024!@@db.cttgctesyubfmhxwzfez.supabase.co:5432/postgres
```

### 2. Resend Email Service (NIEUW)
```
RESEND_API_KEY=re_4dP3PcaH_Lk2N6dJWygte3oUwdue3a4oY
RESEND_FROM_EMAIL=onboarding@resend.dev
```

### 3. NextAuth (NIEUW - Belangrijk!)
```
NEXTAUTH_URL=https://jouw-site-naam.netlify.app
```
⚠️ **VERANDER DIT** naar jouw echte Netlify URL (bijv. `https://proefrit-autoofy.netlify.app`)

```
NEXTAUTH_SECRET=a5515096fd53df882c00e422a08dcdb8bc5f7e9a1d2b3c4d5e6f7a8b9c0d1e2f
```
ℹ️ Dit is een voorbeeld secret. Genereer een nieuwe voor productie (zie hieronder).

### 4. Cron Secret (AL BESTAAT - optioneel)
```
CRON_SECRET=cron-secret-key-2024
```

## 🔑 NEXTAUTH_SECRET genereren

Je kunt een veilige secret genereren met:
```bash
openssl rand -base64 32
```

Of online op: https://generate-secret.vercel.app/32

## ✅ Stap voor stap in Netlify

1. **Ga naar Netlify Dashboard**
2. **Selecteer je site**
3. **Site settings** → **Environment variables**
4. **Voeg toe:**

| Key | Value | Opmerking |
|-----|-------|-----------|
| `RESEND_API_KEY` | `re_4dP3PcaH_Lk2N6dJWygte3oUwdue3a4oY` | Jouw Resend API key |
| `RESEND_FROM_EMAIL` | `onboarding@resend.dev` | Gebruik voor nu, later eigen domein |
| `NEXTAUTH_URL` | `https://jouw-site.netlify.app` | **VERANDER** naar jouw Netlify URL |
| `NEXTAUTH_SECRET` | [generated secret] | Genereer een nieuwe (zie boven) |

5. **Klik "Save"**
6. **Trigger een nieuwe deploy** (of wacht tot de volgende deploy)

## ⚠️ Belangrijke Opmerkingen

1. **NEXTAUTH_URL**: 
   - Moet exact je Netlify URL zijn (met https://)
   - Check je Netlify site URL in de site settings
   - Bijvoorbeeld: `https://proefrit-autoofy.netlify.app`

2. **RESEND_FROM_EMAIL**:
   - Voor nu: gebruik `onboarding@resend.dev` (werkt direct)
   - Later: verifieer je eigen domein in Resend en gebruik bijv. `noreply@jouwdomein.nl`

3. **Na het toevoegen**:
   - Trigger een nieuwe deploy (of push een commit)
   - Check build logs voor errors
   - Test email verificatie met een test account

4. **Testen**:
   - Maak een test account
   - Check of verificatie email wordt verzonden
   - Check spam folder als email niet aankomt


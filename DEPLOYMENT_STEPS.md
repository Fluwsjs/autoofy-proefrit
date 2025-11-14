# Deployment Stappen - Netlify met Email Verificatie

## ✅ Stap 1: Environment Variables ingesteld
Je hebt al de environment variables ingesteld in Netlify! Goed gedaan! 🎉

## 🔧 Stap 2: Database Schema Migratie

Je moet de database schema updaten om de nieuwe tabellen toe te voegen.

### Optie A: Via Prisma Studio (Lokaal - Aanbevolen voor testen)

1. **Update je lokale `.env` file** met de Netlify DATABASE_URL (tijdelijk voor migratie)
2. Run:
```bash
npx prisma db push
```
Dit voegt toe:
- `emailVerified` en `emailVerifiedAt` velden aan User tabel
- `VerificationToken` tabel
- `PasswordResetToken` tabel

### Optie B: Via Netlify Build

Netlify doet dit automatisch bij de volgende deploy omdat `prisma generate` in de build script staat. Je hoeft alleen te deployen!

## 🚀 Stap 3: Deploy naar Netlify

### Option 1: Push naar Git (Aanbevolen)
```bash
git add .
git commit -m "Add email verification and password reset functionality"
git push
```

Netlify deployt automatisch als je Git integratie hebt ingesteld.

### Option 2: Trigger Manual Deploy
- Ga naar Netlify dashboard
- Klik op "Trigger deploy" → "Deploy site"
- Of klik op "Publish deploy" als er al een build is

## ✅ Stap 4: Bestaande Gebruikers Verifiëren (BELANGRIJK!)

Oude gebruikers kunnen nu niet inloggen omdat ze niet geverifieerd zijn. Je moet ze verifiëren:

### Optie A: Script Lokaal Draaien

1. **Update je lokale `.env`** met Netlify DATABASE_URL (tijdelijk)
2. Run het script:
```bash
node scripts/verify-existing-users.js
```

Dit verifieert automatisch alle bestaande gebruikers.

### Optie B: Handmatig in Database

Ga naar je database (via Prisma Studio of database tool) en update:
```sql
UPDATE "User" SET "emailVerified" = true, "emailVerifiedAt" = NOW() WHERE "emailVerified" = false;
```

### Optie C: Via Prisma Studio

1. Run: `npx prisma studio`
2. Ga naar User model
3. Update alle gebruikers:
   - `emailVerified` = true
   - `emailVerifiedAt` = [huidige datum/tijd]

## 🧪 Stap 5: Testen

### Test Email Verificatie:
1. Maak een **nieuw test account** aan op je Netlify site
2. Check je email (en spam folder)
3. Klik op de verificatie link
4. Probeer in te loggen

### Test Wachtwoord Reset:
1. Klik op "Wachtwoord vergeten?" op login pagina
2. Vul je email in
3. Check je email
4. Klik op reset link
5. Stel nieuw wachtwoord in
6. Log in met nieuw wachtwoord

## ⚠️ Belangrijk!

1. **Bestaande gebruikers**: Verifieer ze eerst voordat je live gaat, anders kunnen ze niet inloggen
2. **Email service**: Test of emails worden verzonden (check Resend dashboard)
3. **NEXTAUTH_URL**: Moet exact je Netlify URL zijn (met https://)
4. **Database URL**: Gebruik dezelfde DATABASE_URL in Netlify als je nu hebt

## 📧 Email Troubleshooting

Als emails niet aankomen:
1. Check Resend dashboard → "Emails" → zie je failed emails?
2. Check spam folder
3. Check RESEND_API_KEY in Netlify environment variables
4. Check RESEND_FROM_EMAIL (moet `onboarding@resend.dev` zijn voor development)

## 🎯 Quick Checklist

- [ ] Environment variables ingesteld in Netlify
- [ ] Database schema gemigreerd (via deploy of lokaal)
- [ ] Bestaande gebruikers geverifieerd (BELANGRIJK!)
- [ ] Nieuwe deploy getriggerd in Netlify
- [ ] Email verificatie getest
- [ ] Wachtwoord reset getest


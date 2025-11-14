# Authenticatie Setup - Email Verificatie & Wachtwoord Reset

## ✅ Wat is geïmplementeerd

### 1. Email Verificatie
- ✅ Database schema bijgewerkt met `emailVerified` en `VerificationToken`
- ✅ Automatische verificatie email bij registratie
- ✅ Verificatie pagina met success/error states
- ✅ Account pas actief na email verificatie
- ✅ Gebruikers kunnen niet inloggen zonder verificatie

### 2. Wachtwoord Reset
- ✅ "Wachtwoord vergeten?" functionaliteit
- ✅ Reset token systeem (1 uur geldig)
- ✅ Reset pagina met wachtwoord sterkte checker
- ✅ Veilige wachtwoord reset flow

### 3. Wachtwoord Validatie
- ✅ Wachtwoord sterkte indicator (visual feedback)
- ✅ Minimum 8 tekens
- ✅ Hoofdletters en kleine letters verplicht
- ✅ Cijfers en speciale tekens verplicht
- ✅ Realtime feedback tijdens invoer

### 4. UI/UX Verbeteringen
- ✅ Betere error messages
- ✅ Success states na acties
- ✅ Loading states
- ✅ Mooie email templates met Autoofy branding

## 🔧 Environment Variables

Voeg deze toe aan je `.env` bestand:

```env
# Resend Email Service (VERPLICHT)
RESEND_API_KEY="re_4dP3PcaH_Lk2N6dJWygte3oUwdue3a4oY"
RESEND_FROM_EMAIL="onboarding@resend.dev"

# NextAuth (VERPLICHT)
NEXTAUTH_URL="http://localhost:3000"  # Of je productie URL
NEXTAUTH_SECRET="uw-willekeurige-secret-minimaal-32-karakters"

# Database (VERPLICHT)
DATABASE_URL="postgresql://..."
```

## 📧 Resend Setup

1. **Account**: Je hebt al een Resend account met API key: `re_4dP3PcaH_Lk2N6dJWygte3oUwdue3a4oY`

2. **Verzendend domein** (voor productie):
   - In Resend dashboard: "Domains" → "Add Domain"
   - Volg de DNS instructies om je domein te verifiëren
   - Update `RESEND_FROM_EMAIL` naar je eigen email (bijv. `noreply@jouwdomein.nl`)

3. **Testen**:
   - Gebruik `onboarding@resend.dev` voor development (werkt direct)
   - Voor productie: gebruik je eigen geverifieerde domein

## 🗄️ Database Migratie

Voer deze commando's uit om de database schema te updaten:

```bash
npx prisma generate
npx prisma db push
```

Dit voegt toe:
- `emailVerified` en `emailVerifiedAt` velden aan User model
- `VerificationToken` model voor email verificatie
- `PasswordResetToken` model voor wachtwoord reset

## 🚀 Nieuwe Routes

### API Routes
- `POST /api/auth/register` - Registratie (verzendt nu verificatie email)
- `GET /api/auth/verify-email?token=...` - Email verificatie
- `POST /api/auth/forgot-password` - Wachtwoord reset aanvragen
- `POST /api/auth/reset-password` - Wachtwoord resetten

### Pages
- `/auth/verify-email` - Email verificatie pagina
- `/auth/forgot-password` - Wachtwoord vergeten pagina
- `/auth/reset-password?token=...` - Wachtwoord reset pagina

## 🔐 Wachtwoord Vereisten

Nieuw wachtwoord moet bevatten:
- ✅ Minimaal 8 tekens
- ✅ Minimaal één hoofdletter
- ✅ Minimaal één kleine letter
- ✅ Minimaal één cijfer
- ✅ Minimaal één speciaal teken (!@#$%^&* etc.)

## 📝 Workflow

### Registratie Flow:
1. Gebruiker vult registratie formulier in
2. Account wordt aangemaakt (met `emailVerified: false`)
3. Verificatie email wordt verzonden
4. Gebruiker wordt doorgestuurd naar verificatie pagina
5. Gebruiker klikt op link in email
6. Account wordt geverifieerd (`emailVerified: true`)
7. Gebruiker kan nu inloggen

### Wachtwoord Reset Flow:
1. Gebruiker klikt op "Wachtwoord vergeten?"
2. Vult emailadres in
3. Reset email wordt verzonden (token geldig 1 uur)
4. Gebruiker klikt op link in email
5. Gebruiker stelt nieuw wachtwoord in (met sterkte checker)
6. Wachtwoord wordt bijgewerkt
7. Gebruiker kan inloggen met nieuw wachtwoord

## ⚠️ Belangrijke Opmerkingen

1. **Oude accounts**: Bestaande gebruikers zonder `emailVerified` kunnen niet inloggen
   - Oplossing: Maak een script om alle bestaande gebruikers te verifiëren, of update ze handmatig in de database

2. **Email verzending**: Als email verzending faalt, wordt dit gelogd maar blokkeert registratie niet
   - Check je Resend dashboard voor failed emails

3. **Development**: Gebruik `onboarding@resend.dev` voor testing
   - Deze werkt direct zonder domein verificatie

4. **Productie**: Verifieer je eigen domein in Resend
   - Dit voorkomt spam issues en geeft betere deliverability

## 🧪 Testen

1. **Test registratie**:
   - Maak een nieuw account aan
   - Check je email (en spam folder)
   - Klik op verificatie link
   - Probeer in te loggen

2. **Test wachtwoord reset**:
   - Klik op "Wachtwoord vergeten?"
   - Vul je email in
   - Check je email
   - Klik op reset link
   - Stel nieuw wachtwoord in

3. **Test validatie**:
   - Probeer zwak wachtwoord (alleen cijfers)
   - Zie de sterkte indicator
   - Maak wachtwoord sterker
   - Zie realtime feedback

## 🔄 Volgende Stappen (Optioneel)

- [ ] Resend email opnieuw verzenden functionaliteit
- [ ] Account verificatie reminder na X dagen
- [ ] Rate limiting op login/reset endpoints
- [ ] 2FA authenticatie (twee-factor authenticatie)
- [ ] Email change functionaliteit


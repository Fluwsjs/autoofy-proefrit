# SendGrid Email Service Migratie

## Overzicht

Het project is gemigreerd van Resend naar SendGrid voor email verificatie en andere transactional emails. Deze migratie biedt betere deliverability, meer features en een professionelere email service.

## Wat is veranderd?

### 1. Email Service
- **Oud**: Resend (`resend` package)
- **Nieuw**: SendGrid (`@sendgrid/mail` package)

### 2. Environment Variables

**Oude variabelen (verwijderd):**
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

**Nieuwe variabelen (vereist):**
- `SENDGRID_API_KEY` - Je SendGrid API key
- `SENDGRID_FROM_EMAIL` - Het email adres waarvan emails worden verzonden (moet geverifieerd zijn in SendGrid)
- `SENDGRID_FROM_NAME` - (Optioneel) Display naam voor de sender, default: "Autoofy"

### 3. Nieuwe Features

#### Verbeterde Email Templates
- Modern, responsive email design
- Betere visuele hiërarchie
- Professionele styling met gradient headers
- Betere leesbaarheid op mobiele apparaten

#### Resend Verificatie Email Functionaliteit
- Gebruikers kunnen nu zelf een nieuwe verificatie email aanvragen
- Beschikbaar op de verify-email pagina
- Rate limiting toegepast voor beveiliging

#### Verbeterde Registratie UX
- Betere feedback tijdens registratie
- Email wordt doorgegeven aan verify-email pagina voor resend functionaliteit
- Duidelijke error messages

## Setup Instructies

### 1. SendGrid Account Aanmaken

1. Ga naar [SendGrid](https://sendgrid.com/)
2. Maak een gratis account aan (100 emails/dag gratis)
3. Verifieer je email adres

### 2. API Key Aanmaken

1. Ga naar Settings → API Keys
2. Klik op "Create API Key"
3. Geef een naam (bijv. "Autoofy Production")
4. Selecteer "Full Access" of "Restricted Access" met alleen "Mail Send" permissions
5. Kopieer de API key (je ziet deze maar één keer!)

### 3. Email Adres Verifiëren

Voor development:
- Je kunt je eigen email adres verifiëren in SendGrid
- Ga naar Settings → Sender Authentication
- Klik op "Verify a Single Sender"
- Volg de verificatie stappen

Voor productie:
- Verifieer je eigen domein in SendGrid
- Dit geeft betere deliverability
- Ga naar Settings → Sender Authentication → Domain Authentication

### 4. Environment Variables Instellen

Voeg toe aan je `.env.local` of deployment environment:

```env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@autoofy.nl
SENDGRID_FROM_NAME=Autoofy
```

**Belangrijk:**
- `SENDGRID_FROM_EMAIL` moet een geverifieerd email adres zijn in SendGrid
- Voor development kun je je eigen email gebruiken
- Voor productie gebruik je een email van je eigen domein

### 5. Dependencies Installeren

De dependencies zijn al geïnstalleerd, maar als je lokaal werkt:

```bash
npm install
```

Dit installeert automatisch `@sendgrid/mail` en verwijdert `resend`.

## API Endpoints

### Nieuwe Endpoint: Resend Verification Email

**POST** `/api/auth/resend-verification`

Request body:
```json
{
  "email": "user@example.com"
}
```

Response:
```json
{
  "message": "Als dit e-mailadres bij ons geregistreerd is en nog niet geverifieerd, ontvangt u een nieuwe verificatie e-mail."
}
```

## Email Templates

Alle email templates zijn verbeterd met:
- Modern, responsive design
- Betere visuele hiërarchie
- Professionele styling
- Betere leesbaarheid

### Verificatie Email
- Welkomstbericht
- Duidelijke call-to-action button
- Alternatieve link voor als button niet werkt
- Verloop informatie (24 uur)

### Password Reset Email
- Duidelijke instructies
- Veiligheidsinformatie
- Verloop informatie (1 uur)

## Veiligheid

- Rate limiting toegepast op alle email endpoints
- Email enumeration prevention (altijd success response)
- Tokens verlopen automatisch
- Input sanitization

## Troubleshooting

### Emails worden niet verzonden

1. Check of `SENDGRID_API_KEY` correct is ingesteld
2. Check of `SENDGRID_FROM_EMAIL` geverifieerd is in SendGrid
3. Check SendGrid dashboard voor errors
4. Check server logs voor specifieke error messages

### "Email service not configured" error

- Zorg dat `SENDGRID_API_KEY` is ingesteld
- Check of de API key geldig is in SendGrid dashboard

### Emails komen in spam terecht

- Verifieer je domein in SendGrid (Domain Authentication)
- Gebruik een professioneel email adres (noreply@jouwdomein.nl)
- Check SendGrid reputation in dashboard

## Migratie Checklist

- [x] Resend vervangen door SendGrid
- [x] Email templates verbeterd
- [x] Resend verificatie email functionaliteit toegevoegd
- [x] Registratie UX verbeterd
- [x] Environment validation bijgewerkt
- [x] Dependencies bijgewerkt
- [ ] SendGrid account aangemaakt
- [ ] API key geconfigureerd
- [ ] Email adres geverifieerd
- [ ] Environment variables ingesteld
- [ ] Test emails verzonden
- [ ] Productie deployment getest

## Support

Voor vragen over SendGrid:
- [SendGrid Documentation](https://docs.sendgrid.com/)
- [SendGrid Support](https://support.sendgrid.com/)

Voor vragen over de implementatie:
- Check de code comments in `lib/email.ts`
- Check de API routes in `app/api/auth/`


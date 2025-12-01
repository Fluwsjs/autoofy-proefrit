# 📧 Automatische Feedback E-mail met Reply-To Functionaliteit

## Overzicht

Wanneer een proefrit wordt afgetekend/afgerond, stuurt het systeem **automatisch** een feedback e-mail naar de klant met vragen over hun ervaring.

**Nieuw:** De e-mail heeft nu een **Reply-To header** ingesteld op het e-mailadres van de dealer die de proefrit heeft afgerond. Dit betekent dat wanneer de klant antwoordt op de feedback e-mail, het antwoord automatisch naar de dealer gaat in plaats van naar het systeem e-mailadres.

---

## 🎯 Hoe Het Werkt

### 1. **Proefrit Afronden**
Wanneer een dealer een proefrit afrondt:
- De dealer tekent af in het systeem
- De klant tekent af in het systeem
- De proefrit krijgt status `COMPLETED`

### 2. **Automatische E-mail**
Direct na het afronden:
- Systeem stuurt een feedback e-mail naar `klant@example.com`
- **Van:** `support@proefrit-autoofy.nl` (of geconfigureerd FROM_EMAIL)
- **Reply-To:** `bedrijf@example.com` (hoofdaccount e-mailadres van het bedrijf/tenant)

### 3. **Klant Antwoordt**
Wanneer de klant op "Reply" / "Antwoorden" klikt:
- Het e-mailprogramma gebruikt automatisch de **Reply-To** header
- Het antwoord gaat naar: `bedrijf@example.com` (het hoofdaccount e-mailadres)
- Het bedrijf ontvangt het antwoord direct in de bedrijfsinbox

---

## 📋 Vragen in de Feedback E-mail

De klant krijgt de volgende vragen:

1. **Hoe was de testrit?**
   - Verliep alles volgens verwachting?

2. **Waren er bijzonderheden?**
   - Opmerkingen over het voertuig of de service?

3. **Heeft u de auto gekocht?**
   - Of overweegt u dit nog?

4. **Hoe bent u bij [Bedrijfsnaam] gekomen?**
   - Online, via een bekende, of op een andere manier?

5. **Hoe beoordeelt u onze service?**
   - Een cijfer of korte feedback is al voldoende

---

## 🧪 Testen

### Test de Reply-To Functionaliteit

**Optie 1: Via Test Endpoint**

```
https://proefrit-autoofy.nl/api/test-feedback-email?to=jouw@email.com&replyTo=dealer@example.com
```

**Parameters:**
- `to` - Het e-mailadres waar de test e-mail naartoe moet (verplicht)
- `replyTo` - Het e-mailadres dat als Reply-To moet worden ingesteld (optioneel)

**Voorbeeld:**
```
http://localhost:3000/api/test-feedback-email?to=klant@gmail.com&replyTo=dealer@autobedrijf.nl
```

**Verwacht Resultaat:**
```json
{
  "success": true,
  "message": "✅ Test feedback email verzonden naar klant@gmail.com",
  "replyTo": "dealer@autobedrijf.nl",
  "note": "Controleer je inbox en test of de Reply-To functionaliteit werkt door op de email te antwoorden."
}
```

### Test Procedure

1. **Verstuur test e-mail:**
   ```
   /api/test-feedback-email?to=jouw@email.com&replyTo=dealer@email.com
   ```

2. **Controleer inbox:**
   - Open de ontvangen e-mail
   - Controleer dat de e-mail is ontvangen

3. **Test Reply-To:**
   - Klik op "Antwoorden" / "Reply" in je e-mailprogramma
   - Controleer dat het "Aan" veld automatisch is ingevuld met `dealer@email.com`
   - Stuur een test antwoord
   - Controleer of het antwoord aankomt bij `dealer@email.com`

---

## 🔧 Technische Details

### Implementatie

**1. Email Interface (`lib/email.ts`)**
```typescript
interface EmailOptions {
  to: string
  subject: string
  html: string
  text: string
  replyTo?: string  // Nieuwe parameter
}
```

**2. sendEmail Functie**
- Ondersteunt zowel **SMTP** als **Resend**
- Beide services ontvangen de `replyTo` parameter
- Als `replyTo` niet is ingesteld, wordt geen Reply-To header toegevoegd

**3. sendFeedbackEmail Functie**
```typescript
export async function sendFeedbackEmail(
  customerEmail: string, 
  customerName: string,
  companyName: string,
  carType: string,
  dealerEmail?: string  // Nieuwe parameter
)
```

**4. Complete Endpoint (`app/api/testrides/[id]/complete/route.ts`)**
```typescript
const tenantEmail = testride.tenant?.email // Bedrijf hoofdaccount e-mail

await sendFeedbackEmail(
  testride.customerEmail,
  testride.customerName,
  companyName,
  testride.carType,
  tenantEmail  // Tenant/bedrijf e-mail als Reply-To
)
```

### E-mail Providers

**SMTP (Nodemailer):**
```typescript
await transporter.sendMail({
  from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
  to,
  subject,
  html,
  text,
  replyTo: replyTo || undefined,  // Reply-To header
})
```

**Resend API:**
```typescript
await resend.emails.send({
  from: `${FROM_NAME} <${FROM_EMAIL}>`,
  to: [to],
  subject,
  html,
  text,
  replyTo: replyTo || undefined,  // Reply-To header
})
```

---

## ✅ Voordelen

1. **Directe Communicatie**
   - Klantantwoorden komen direct bij het bedrijf
   - Geen tussenkomst van het systeem nodig

2. **Persoonlijk Contact**
   - Bedrijf kan direct reageren op feedback
   - Betere klantrelatie

3. **Geen Configuratie Nodig**
   - Werkt automatisch met het hoofdaccount e-mailadres van het bedrijf
   - Geen extra setup vereist na registratie

4. **Flexibel**
   - Werkt met SMTP én Resend
   - Backward compatible (werkt ook zonder Reply-To)

---

## 📝 Notities

- De Reply-To functionaliteit is **optioneel** - als geen tenant e-mail beschikbaar is, werkt de e-mail nog steeds
- De functionaliteit werkt met **alle e-mail providers** (SMTP en Resend)
- Antwoorden van klanten komen **automatisch** bij het hoofdaccount e-mailadres van het bedrijf
- Het systeem logt wanneer een feedback e-mail wordt verzonden inclusief de Reply-To informatie
- Het tenant e-mailadres is het account waarmee het bedrijf zich heeft geregistreerd

---

## 🐛 Troubleshooting

### Antwoorden komen niet aan bij het bedrijf

**Controleer:**
1. Is het bedrijf e-mailadres correct ingesteld bij registratie?
2. Heeft het bedrijf een geldig e-mailadres?
3. Controleer de spam/junk folder van het bedrijf
4. Controleer of het tenant/bedrijf e-mailadres up-to-date is in de database

**Debug:**
```
# Check console logs bij het afronden van een proefrit:
✅ Feedback email sent to klant@example.com (Reply-To: bedrijf@example.com)
```

**Bedrijf e-mailadres controleren/wijzigen:**
Het tenant e-mailadres is het account waarmee het bedrijf zich heeft geregistreerd. Dit kan alleen via de database worden gewijzigd als het nodig is.

### Test e-mail wordt niet ontvangen

**Controleer:**
1. E-mail configuratie: `/api/check-email-config`
2. SMTP of Resend credentials in `.env`
3. Spam/junk folder

---

## 🔄 Flow Diagram

```
┌─────────────────┐
│ Dealer rondt    │
│ proefrit af     │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│ Systeem stuurt e-mail       │
│ FROM: support@...           │
│ TO: klant@...               │
│ REPLY-TO: bedrijf@...       │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────┐
│ Klant ontvangt  │
│ feedback e-mail │
└────────┬────────┘
         │
         ▼
┌──────────────────┐
│ Klant klikt op   │
│ "Antwoorden"     │
└────────┬─────────┘
         │
         ▼
┌────────────────────────┐
│ E-mail gaat naar:      │
│ bedrijf@... (Reply-To) │
│ NIET naar support@...  │
└────────┬───────────────┘
         │
         ▼
┌─────────────────────┐
│ Bedrijf ontvangt    │
│ antwoord in inbox   │
└─────────────────────┘
```

---

## 📌 Conclusie

De Reply-To functionaliteit zorgt ervoor dat klantfeedback **automatisch** bij de juiste dealer terechtkomt, zonder extra configuratie of tussenkomst. Dit verbetert de communicatie en klanttevredenheid.


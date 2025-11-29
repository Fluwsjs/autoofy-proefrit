# 📧 Email Deliverability Verbeteringen

## Probleem: Emails Komen in Spam

Verificatie emails worden verstuurd maar komen in spam/junk folder terecht.

---

## ✅ Oplossingen (3 Stappen)

### Stap 1: DMARC Policy Toevoegen (5 minuten)

DMARC vertelt email providers dat je domein legitiem is.

#### In Hostinger DNS Editor:

```
Type: TXT
Name: _dmarc
Content: v=DMARC1; p=none; rua=mailto:dmarc@proefrit-autoofy.nl
TTL: 14400
```

**Klik "Add Record"**

**Uitleg:**
- `p=none` = Monitor mode (blokkeer niet)
- `rua=` = Waar rapporten naartoe gaan
- Verbetert email reputatie

---

### Stap 2: Check SPF & DKIM Records

#### Check of alles correct is:

**Tool:** https://mxtoolbox.com/SuperTool.aspx

**Test 1: SPF**
```
spf:proefrit-autoofy.nl
```
**Moet zien:** ✅ SPF record found

**Test 2: DKIM**
```
dkim:resend._domainkey.proefrit-autoofy.nl
```
**Moet zien:** ✅ DKIM record found

**Test 3: DMARC**
```
dmarc:proefrit-autoofy.nl
```
**Moet zien:** ✅ DMARC record found

---

### Stap 3: Email Content Optimalisatie

Sommige woorden/patterns triggeren spam filters.

#### ✅ GOED (in onze emails):
- Professionele template
- Bedrijfsnaam duidelijk
- Geen ALL CAPS
- Geen spammy woorden
- Persoonlijke aanspreekvorm

#### ❌ VERMIJD:
- "KLIK HIER!!!"
- "GRATIS!!!"
- Te veel uitroeptekens!!!
- Alleen afbeeldingen, geen text
- Shortened URLs (bit.ly etc.)

---

## 🎯 Extra Verbeteringen

### A. Reply-To Adres Instellen

Laat gebruikers kunnen antwoorden op emails.

**In Netlify environment variables, voeg toe:**
```
REPLY_TO_EMAIL=info@proefrit-autoofy.nl
```

Dan passen we de email code aan om reply-to te gebruiken.

---

### B. Gebruikers Helpen

**Voeg instructies toe op de pagina na registratie:**

```
✅ Account aangemaakt!

📧 Controleer je inbox voor de verificatie email.

Niet ontvangen? Check je spam/junk folder:
• Gmail: Tab "Promotions" of "Spam"
• Outlook: Map "Ongewenste e-mail"
• Apple Mail: Map "Ongewenst"

💡 Voorkom spam: Voeg support@proefrit-autoofy.nl toe aan je contacten!
```

---

### C. Email Warm-up Strategie

Nieuwe domeinen hebben tijd nodig om reputatie op te bouwen.

**Week 1-2:**
- Verstuur beperkt aantal emails per dag
- Target: gebruikers die actief zijn
- Voorkom bounces (ongeldige emails)

**Week 3-4:**
- Geleidelijk volume verhogen
- Monitor spam complaints
- Check Resend analytics

**Na 1 maand:**
- Domein reputatie verbeterd
- Minder emails in spam
- Betere deliverability

---

## 📊 Monitor Email Reputatie

### Check Domain Reputation:

**Tool 1: Google Postmaster Tools**
https://postmaster.google.com

1. Voeg `proefrit-autoofy.nl` toe
2. Verifieer ownership (DNS record)
3. Zie spam rate, reputatie, delivery errors

**Tool 2: Microsoft SNDS**
https://sendersupport.olc.protection.outlook.com/snds/

- Monitor Outlook/Hotmail deliverability
- Zie complaints

**Tool 3: Resend Analytics**
- Check open rates
- Check bounce rates
- Check spam complaints

---

## 🚀 Quick Wins (Direct Effect)

### 1. Voeg Sender Name Toe

In emails, gebruik volledige naam:
```
From: Autoofy Team <support@proefrit-autoofy.nl>
```
In plaats van alleen:
```
From: support@proefrit-autoofy.nl
```

### 2. Add Footer met Adres

Professionele emails hebben bedrijfsinfo:
```
Autoofy
Proefrit Beheer Systeem
support@proefrit-autoofy.nl

Deze email is automatisch gegenereerd.
```

### 3. Plain Text Versie

Onze emails hebben al HTML + plain text versie ✅

---

## 📋 Implementatie Checklist

**DNS Records:**
- [x] SPF record (via Resend) ✅
- [x] DKIM record (via Resend) ✅
- [ ] DMARC record → **TOE TE VOEGEN**
- [ ] MX record (optioneel)

**Email Setup:**
- [x] FROM: support@proefrit-autoofy.nl ✅
- [x] FROM NAME: Autoofy ✅
- [ ] REPLY-TO: (optioneel maar aanbevolen)
- [x] HTML + Text versie ✅
- [x] Professionele template ✅

**Content:**
- [x] Duidelijke subject line ✅
- [x] Persoonlijke aanspreking ✅
- [x] Duidelijke call-to-action ✅
- [x] Footer met bedrijfsinfo ✅
- [ ] Instructies voor gebruikers

**Monitoring:**
- [ ] Google Postmaster Tools setup
- [ ] Check Resend analytics wekelijks
- [ ] Monitor spam complaints

---

## 📧 Gebruikers Instructies

### Voeg dit toe aan je app (na registratie):

```jsx
<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
  <h3 className="font-semibold text-blue-900 mb-2">
    📧 Email niet ontvangen?
  </h3>
  <ul className="text-sm text-blue-800 space-y-1">
    <li>✓ Check je <strong>spam/junk folder</strong></li>
    <li>✓ Zoek naar emails van <code>support@proefrit-autoofy.nl</code></li>
    <li>✓ Markeer als "Geen spam" om toekomstige emails te ontvangen</li>
    <li>✓ Voeg ons toe aan je contacten</li>
  </ul>
</div>
```

---

## ⏰ Verwachtingen

**Direct (na DMARC toevoegen):**
- Kleine verbetering (10-20%)
- Sommige providers respecteren DMARC meteen

**Na 1 week:**
- Duidelijke verbetering (30-50%)
- Domain warming in gang

**Na 1 maand:**
- Grote verbetering (70-90%)
- Domain heeft reputatie opgebouwd
- Meeste emails komen in inbox

**Blijvend:**
- Monitor open rates
- Lage bounce rate houden
- Snelle response op complaints

---

## 🎯 Realistische Verwachting

**⚠️ Belangrijk te weten:**

Zelfs grote bedrijven (Google, Facebook, etc.) hebben soms emails in spam. 100% inbox delivery is bijna onmogelijk.

**Goede targets:**
- 70-80% inbox rate = Uitstekend
- 80-90% inbox rate = Excellent
- 90%+ inbox rate = Bijna perfect

**Huidige situatie:**
- Nieuw domein = vaak 50-60% spam
- Na optimalisaties = 70-80% inbox
- Na 1 maand warming = 80-90% inbox

---

## 💡 Tips Voor Gebruikers

### Email Whitelisting Instructies

**Gmail:**
1. Open de email (in spam)
2. Klik "Geen spam" bovenaan
3. Of: Sleep naar Inbox
4. Voeg toe aan contacten

**Outlook/Hotmail:**
1. Klik rechtermuisknop op email
2. "Ongewenste e-mail" → "Geen ongewenste e-mail"
3. Voeg toe aan Veilige afzenders

**Apple Mail:**
1. Open email in Ongewenst
2. Klik "Geen ongewenste e-mail"
3. Voeg toe aan contacten

**Algemeen:**
- Voeg `support@proefrit-autoofy.nl` toe aan contacten
- Dit helpt voor alle toekomstige emails

---

## ✅ Actie Items

**JIJ (Netlify/DNS):**
1. [ ] Voeg DMARC DNS record toe in Hostinger
2. [ ] Wacht 10-30 min op DNS propagatie
3. [ ] Verifieer met mxtoolbox.com

**CODE (Optioneel - voor betere UX):**
1. [ ] Voeg "Email niet ontvangen?" instructies toe na registratie
2. [ ] Voeg REPLY_TO_EMAIL env var toe
3. [ ] Update email templates met reply-to

**MONITORING:**
1. [ ] Setup Google Postmaster Tools
2. [ ] Check Resend dashboard wekelijks
3. [ ] Monitor gebruiker feedback

---

**Start met het toevoegen van DMARC record!** Dit is de belangrijkste quick win. 🚀


# 🔧 Fix "Te veel verzoeken" Error bij Registratie

## ❌ Wat is het probleem?

Je krijgt de foutmelding: **"Te veel verzoeken. Probeer het later opnieuw."**

Dit komt door rate limiting die te streng was ingesteld:
- **VOOR:** 3 registraties per uur
- **NA:** 10 registraties per uur ✅

---

## ✅ Fix Toegepast

De rate limit voor registratie is verhoogd in `lib/rate-limit.ts`:

```typescript
// VOOR:
export const registerRateLimit = rateLimitByIp({
  maxRequests: 3,  // ❌ Te streng
  windowMs: 60 * 60 * 1000, // 1 hour
})

// NA:
export const registerRateLimit = rateLimitByIp({
  maxRequests: 10,  // ✅ Beter voor development/testing
  windowMs: 60 * 60 * 1000, // 1 hour
})
```

---

## 🚀 Hoe Los Je Het Nu Op?

### Optie 1: Herstart Development Server (Snelst)

Als je **lokaal** test:
```bash
# Stop server
Ctrl+C

# Start opnieuw
npm run dev
```

De in-memory rate limit cache wordt automatisch gecleared! ✅

### Optie 2: Wacht tot Rate Limit Window Verloopt

De registratie rate limit reset na **1 uur**.

Check hoeveel tijd je nog moet wachten in de error response:
- Header: `Retry-After` geeft aantal seconden aan

### Optie 3: Gebruik Andere Browser/IP

**A. Incognito Mode:**
- Open een incognito/private window
- Rate limit is per IP, dus dit helpt niet echt
- Maar cookies zijn schoon, wat helpt bij andere issues

**B. Andere Netwerk:**
- Gebruik mobiele hotspot
- Dit geeft je een ander IP adres
- Rate limit wordt gereset voor dat IP

**C. Clear Browser Data:**
```
F12 → Application → Storage → Clear site data
```
Dit helpt niet met rate limit (die zit server-side), maar wel met andere caching issues.

### Optie 4: Wacht op Netlify Deployment

Als je op **productie** test (proefrit-autoofy.nl):
1. Wacht tot de nieuwe code gedeployed is (enkele minuten)
2. De nieuwe rate limit (10 per uur) wordt actief
3. Maar je oude rate limit blijft tot die vervalt
4. **Beste oplossing:** Wacht 1 uur of test vanaf ander IP/netwerk

---

## 📊 Huidige Rate Limits

| Actie | Limiet | Window | Opmerking |
|-------|--------|--------|-----------|
| **Registratie** | 10 pogingen | 1 uur | ✅ Net verhoogd (was 3) |
| **Login** | 5 pogingen | 15 minuten | Voor beveiliging |
| **Email verificatie** | 10 pogingen | 1 uur | Resend email link |
| **Password reset** | 3 pogingen | 1 uur | Per email adres |

---

## 🔍 Rate Limit Details

### Hoe Werkt Het?

Rate limiting is **per IP adres** (voor registratie en login):
```typescript
const forwarded = request.headers.get("x-forwarded-for")
const ip = forwarded?.split(",")[0] || "unknown"
```

**Dit betekent:**
- ✅ Verschillende gebruikers vanaf hetzelfde netwerk delen de limit
- ✅ Je hele kantoor/huis heeft 10 registraties per uur
- ✅ Dit is normaal gedrag voor brute-force bescherming
- ⚠️ Kan hinderlijk zijn tijdens development/testing

### In-Memory vs Redis

**Huidige situatie (In-Memory):**
- ✅ Simpel, geen extra services nodig
- ✅ Werkt perfect voor één server
- ❌ Cache wordt gereset bij server restart
- ❌ Werkt niet goed met meerdere server instances (Netlify Functions)

**Voor Productie (Redis):**
Als je veel verkeer hebt of meerdere servers, overweeg:
- Upstash Redis (serverless Redis)
- `@upstash/ratelimit` package
- Persistent rate limiting over alle instances

---

## 🧪 Test Na Fix

### Als je lokaal test:

1. **Herstart server:**
   ```bash
   npm run dev
   ```

2. **Test registratie:**
   - Ga naar http://localhost:3000
   - Vul registratie formulier in
   - ✅ Zou moeten werken!

3. **Check rate limit headers** (F12 → Network):
   ```
   X-RateLimit-Limit: 10
   X-RateLimit-Remaining: 9
   X-RateLimit-Reset: 2024-11-29T...
   ```

### Als je op productie test:

1. **Wacht op Netlify deploy** (enkele minuten)

2. **Check deploy status:**
   - Netlify Dashboard → Deploys
   - Wacht tot groene vinkje ✅

3. **Test registratie:**
   - Clear browser cache
   - Probeer opnieuw te registreren

4. **Als het nog steeds niet werkt:**
   - Wacht 1 uur (of tot `X-RateLimit-Reset` tijd)
   - Of test vanaf ander netwerk/IP

---

## 💡 Development Tips

### Tip 1: Gebruik Verschillende Email Adressen

Voor testing:
- Gmail trick: `jouw.email+test1@gmail.com`
- Elke `+test1`, `+test2` etc. is uniek voor de app
- Maar alle emails komen in dezelfde inbox!

### Tip 2: Test Accounts Script

Gebruik het cleanup script als je veel test accounts hebt:
```bash
node scripts/cleanup-all-accounts.js
```
⚠️ **PAS OP:** Dit verwijdert ALLE accounts in de database!

### Tip 3: Check Rate Limit Status

Run het diagnostic script:
```bash
node scripts/test-auth-flow.js
```

Dit toont alle environment variabelen en database status.

---

## 🔒 Waarom Rate Limiting?

Rate limiting beschermt tegen:
- 🛡️ **Brute force aanvallen** (iemand probeert duizenden keer in te loggen)
- 🛡️ **Account enumeration** (checken welke emails geregistreerd zijn)
- 🛡️ **Spam registraties** (bots die duizenden accounts maken)
- 🛡️ **DDoS aanvallen** (server overbelasten met requests)

**Het is een goede security practice!** ✅

Tijdens development/testing kan het hinderlijk zijn, maar in productie is het essentieel.

---

## 📋 Checklist

Na deze fix:

- [x] Rate limit verhoogd van 3 naar 10 per uur
- [x] Script toegevoegd om rate limits te clearen (herstart server)
- [x] Documentatie toegevoegd
- [ ] Test registratie na herstart server
- [ ] Deploy naar Netlify
- [ ] Test op productie (na deploy)

---

## 🆘 Nog Steeds Problemen?

Als je na deze fix nog steeds "Te veel verzoeken" krijgt:

1. **Check dat de nieuwe code actief is:**
   - Lokaal: herstart server
   - Productie: check Netlify deploy status

2. **Check rate limit headers in response:**
   - F12 → Network → registratie request
   - Kijk naar `X-RateLimit-*` headers
   - Als limit nog steeds 3 is, is oude code actief

3. **Wacht of gebruik ander netwerk:**
   - Je oude rate limit blijft tot het window vervalt (1 uur)
   - Test vanaf mobiele hotspot of ander netwerk

4. **Check Netlify Function Logs:**
   - Mogelijk is er een andere error
   - Rate limit error maskeert soms andere problemen

---

**De rate limit is nu veel redelijker voor development en testing!** 🎉


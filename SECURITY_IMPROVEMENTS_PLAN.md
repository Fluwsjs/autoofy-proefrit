# 🔒 Security Improvements Implementatie Plan

## Overzicht
Dit document bevat een stap-voor-stap implementatieplan voor alle security verbeteringen van het Proefrit Platform.

**Schatting totale tijd:** 6-8 uur ontwikkeling  
**Prioriteit:** Kritiek → Hoog → Medium → Laag

---

## 📋 Fase 1: Kritieke Security Fixes (Prioriteit: KRITIEK)

### 1.1 Rate Limiting Implementatie
**Impact:** Voorkomt brute force aanvallen, account spam, email spam  
**Tijd:** 1-2 uur  
**Complexiteit:** Medium

#### Technische Details:
- **Package:** `@upstash/ratelimit` + `@upstash/redis` (of `next-rate-limit` voor simpelere oplossing)
- **Alternatief zonder Redis:** In-memory rate limiting (minder ideaal voor distributed systems)

#### Endpoints te beveiligen:
1. `/api/auth/[...nextauth]` - Login: 5 pogingen per 15 minuten per IP
2. `/api/auth/register` - Registratie: 3 registraties per uur per IP
3. `/api/auth/forgot-password` - Password reset: 3 pogingen per uur per email
4. `/api/auth/verify-email` - Email verificatie: 10 pogingen per uur per email

#### Bestanden aan te passen:
- `lib/rate-limit.ts` (nieuw bestand)
- `app/api/auth/[...nextauth]/route.ts`
- `app/api/auth/register/route.ts`
- `app/api/auth/forgot-password/route.ts`
- `app/api/auth/verify-email/route.ts`
- `package.json` (dependencies toevoegen)

#### Environment Variables:
```
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```
Of alternatief (geen Redis nodig):
```
RATE_LIMIT_ENABLED=true
```

#### Implementatie stappen:
1. Installeer rate limiting package
2. Maak `lib/rate-limit.ts` utility
3. Wrap rate limiter in API routes
4. Test met verschillende scenarios
5. Configureer Netlify environment variables

---

### 1.2 Test Database Endpoint Beveiligen
**Impact:** Voorkomt informatie lek  
**Tijd:** 15 minuten  
**Complexiteit:** Laag

#### Bestanden aan te passen:
- `app/api/test-db/route.ts`

#### Opties:
**Optie A:** Alleen in development (aanbevolen)
```typescript
if (process.env.NODE_ENV !== 'development') {
  return NextResponse.json({ error: "Not found" }, { status: 404 })
}
```

**Optie B:** Volledig verwijderen (als niet meer nodig)
- Verwijder `app/api/test-db/route.ts`

**Optie C:** Beveiligen met authentication + IP whitelist
- Super admin alleen
- Extra IP whitelist check

#### Implementatie stappen:
1. Kies optie (A aanbevolen)
2. Pas code aan
3. Test in development
4. Verifieer dat endpoint niet werkt in production

---

### 1.3 Admin Creation Security Verbeteren
**Impact:** Voorkomt ongeautoriseerde admin creatie  
**Tijd:** 20 minuten  
**Complexiteit:** Laag

#### Bestanden aan te passen:
- `app/api/admin/create-super-admin/route.ts`

#### Verbeteringen:
1. Verwijder default secret → throw error als env var ontbreekt
2. Alleen in development mode beschikbaar maken
3. Of: volledig verwijderen na eerste setup (aanbevolen voor production)

#### Environment Variables:
```
ADMIN_CREATE_SECRET=<sterke-random-secret>
```

#### Implementatie stappen:
1. Verwijder default secret fallback
2. Check voor `NODE_ENV === 'production'` → return 404
3. Valideer dat secret aanwezig is, throw error anders
4. Documenteer: deze route is alleen voor initial setup
5. Update Netlify environment variables

---

### 1.4 Server-side File Upload Validatie
**Impact:** Voorkomt malafide file uploads  
**Tijd:** 1-2 uur  
**Complexiteit:** Medium

#### Bestanden aan te passen:
- `lib/file-validation.ts` (nieuw bestand)
- `app/api/testrides/route.ts` (POST)
- `app/api/user/seller-signature/route.ts` (POST)
- `components/IdPhotoUpload.tsx` (client-side blijft, server-side validatie toevoegen)

#### Validatie regels:
1. **MIME Type Check:**
   - Alleen: `image/jpeg`, `image/png`, `image/webp`, `image/gif`
   - Geen executables, scripts, etc.

2. **File Size:**
   - Max 5MB per file
   - Max 10MB totaal (meerdere files)

3. **Base64 Format:**
   - Valide base64 string
   - Check data URI format: `data:image/{type};base64,{data}`

4. **Image Dimensions (optioneel):**
   - Min: 100x100px
   - Max: 5000x5000px

5. **Magic Number Check:**
   - Valideer file header (eerste bytes) om fake extensions te detecteren

#### Implementatie stappen:
1. Maak `lib/file-validation.ts` met validation functions
2. Valideer base64 images in testride creation
3. Valideer seller signature uploads
4. Gooi specifieke errors bij validatie failures
5. Test met verschillende file types en sizes
6. Overweeg: externe storage (Cloudinary/S3) voor grote files

---

### 1.5 Logging Verbeteringen
**Impact:** Voorkomt informatie lek via logs  
**Tijd:** 1-2 uur  
**Complexiteit:** Medium

#### Bestanden aan te passen:
- `lib/logger.ts` (nieuw bestand)
- Alle API routes (vervang `console.log/error`)

#### Features:
1. **Structured Logging:**
   - Log levels: error, warn, info, debug
   - JSON format in production
   - Human-readable in development

2. **Data Masking:**
   - Mask emails: `user@example.com` → `u***@example.com`
   - Mask tokens: `abc123...` → `abc***`
   - Mask passwords: altijd `***`

3. **Context:**
   - User ID (als beschikbaar)
   - Request ID (voor tracing)
   - Timestamp
   - Environment

4. **Error Logging:**
   - Stack traces alleen in development
   - In production: generieke messages
   - Sanitize error messages (geen sensitive data)

#### Packages:
- `pino` of `winston` (optioneel, kan ook custom)
- Of: simpele custom logger utility

#### Implementatie stappen:
1. Maak `lib/logger.ts` utility
2. Vervang alle `console.log` → `logger.info`
3. Vervang alle `console.error` → `logger.error`
4. Implementeer data masking
5. Test logging in verschillende scenarios
6. Verifieer dat gevoelige data niet gelogd wordt

---

## 📋 Fase 2: Hoge Prioriteit Verbeteringen

### 2.1 Query Result Limiting & Paginatie
**Impact:** Voorkomt performance issues en DoS  
**Tijd:** 1-2 uur  
**Complexiteit:** Medium

#### Endpoints aan te passen:
- `app/api/testrides/route.ts` (GET)
- `app/api/admin/users/route.ts` (GET)
- `app/api/dealer-plates/route.ts` (GET)

#### Features:
1. **Default Limits:**
   - Max 100 records per request
   - Default: 50 records

2. **Paginatie:**
   - Query params: `?page=1&limit=50`
   - Response: `{ data: [...], pagination: { page, limit, total, hasMore } }`

3. **Cursor-based Paginatie (optioneel, beter voor grote datasets):**
   - Query params: `?cursor={id}&limit=50`
   - Response: `{ data: [...], nextCursor: "..." | null }`

#### Bestanden aan te passen:
- `app/api/testrides/route.ts`
- `app/api/admin/users/route.ts`
- `app/api/dealer-plates/route.ts`
- `components/DataTable.tsx` (frontend paginatie)
- `app/dashboard/page.tsx` (paginatie state)

#### Implementatie stappen:
1. Update API routes met paginatie logic
2. Valideer `limit` parameter (max 100)
3. Update frontend om paginatie te ondersteunen
4. Test met grote datasets
5. Update API responses met paginatie metadata

---

### 2.2 Security Headers
**Impact:** Voorkomt XSS, clickjacking, etc.  
**Tijd:** 30 minuten  
**Complexiteit:** Laag

#### Bestanden aan te passen:
- `next.config.js`
- `middleware.ts` (voor extra headers)

#### Headers toe te voegen:
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

#### Implementatie stappen:
1. Voeg headers toe in `next.config.js`
2. Of: gebruik `next.config.js` headers configuratie
3. Test headers met browser dev tools
4. Verifieer CSP werkt (pas aan indien nodig voor externe resources)
5. Test op Netlify

---

### 2.3 CORS Configuratie
**Impact:** Voorkomt CSRF aanvallen  
**Tijd:** 30 minuten  
**Complexiteit:** Laag

#### Bestanden aan te passen:
- `next.config.js`
- `middleware.ts` (indien nodig voor API routes)

#### Configuratie:
- Alleen toegestane origins (bijv. je main WordPress platform)
- Specifieke headers toestaan
- Credentials: indien nodig

#### Implementatie stappen:
1. Identificeer alle toegestane origins
2. Configureer CORS in `next.config.js`
3. Test met verschillende origins
4. Verifieer dat onbevoegde origins worden geblokkeerd

---

### 2.4 Token Expiry & Cleanup
**Impact:** Voorkomt token reuse attacks  
**Tijd:** 1 uur  
**Complexiteit:** Medium

#### Features:
1. **Extra Expiry Check:**
   - Check expiry bij token verificatie
   - Gooi 401 als expired

2. **Auto Cleanup:**
   - Cron job voor expired tokens verwijderen
   - Run dagelijks/weekelijks

#### Bestanden aan te passen:
- `app/api/auth/verify-email/route.ts`
- `app/api/auth/reset-password/route.ts`
- `app/api/testrides/cleanup/route.ts` (uitbreiden)
- Of: nieuw cleanup endpoint

#### Implementatie stappen:
1. Voeg expiry check toe bij token gebruik
2. Maak cleanup endpoint voor expired tokens
3. Configureer cron job (Netlify Cron of externe service)
4. Test cleanup logic

---

## 📋 Fase 3: Medium Prioriteit Verbeteringen

### 3.1 Password Strength Backend Validatie
**Impact:** Consistente password requirements  
**Tijd:** 30 minuten  
**Complexiteit:** Laag

#### Bestanden aan te passen:
- `lib/password-validation.ts` (nieuw bestand)
- `app/api/auth/register/route.ts`
- `app/api/auth/reset-password/route.ts`
- `app/api/admin/reset-password/route.ts`

#### Validatie:
- Gebruik bestaande Zod schema's
- Optioneel: password strength score (0-100)
- Minimum score: 60/100

#### Implementatie stappen:
1. Extract password validation logic naar utility
2. Hergebruik in alle password-gerelateerde endpoints
3. Test met verschillende password scenarios

---

### 3.2 Input Sanitization
**Impact:** Voorkomt XSS aanvallen  
**Tijd:** 1-2 uur  
**Complexiteit:** Medium

#### Packages:
- `dompurify` (voor HTML sanitization)
- Of: `isomorphic-dompurify` (voor server-side)

#### Velden te sanitiseren:
- Alle tekstvelden (name, notes, etc.)
- Bij opslag: sanitize input
- Bij output: escape HTML (Next.js doet dit al, maar extra veiligheid)

#### Bestanden aan te passen:
- `lib/sanitize.ts` (nieuw bestand)
- Alle API routes die input ontvangen
- Frontend components (voor client-side sanitization)

#### Implementatie stappen:
1. Installeer sanitization package
2. Maak `lib/sanitize.ts` utility
3. Sanitize alle user input
4. Test met XSS payloads
5. Verifieer dat HTML wordt ge-escaped

---

### 3.3 Environment Variables Validatie
**Impact:** Voorkomt runtime errors  
**Tijd:** 30 minuten  
**Complexiteit:** Laag

#### Bestanden aan te passen:
- `lib/env-validation.ts` (nieuw bestand)
- `app/layout.tsx` of startup check

#### Required Variables:
```
DATABASE_URL
NEXTAUTH_SECRET
NEXTAUTH_URL
RESEND_API_KEY
RESEND_FROM_EMAIL
```

#### Optional (met defaults):
```
NODE_ENV
ADMIN_CREATE_SECRET
CRON_SECRET
```

#### Implementatie stappen:
1. Maak `lib/env-validation.ts` met Zod schema
2. Valideer bij startup (throw error als required vars ontbreken)
3. Test met missing variables
4. Documenteer alle required variables

---

## 📋 Fase 4: Lage Prioriteit Verbeteringen

### 4.1 Audit Logging
**Impact:** Traceerbaarheid van acties  
**Tijd:** 2-3 uur  
**Complexiteit:** Hoog

#### Database Schema:
```prisma
model AuditLog {
  id        String   @id @default(cuid())
  userId    String?
  user      User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  action    String   // "LOGIN", "CREATE_TESTRIDE", "DELETE_TESTRIDE", etc.
  resource  String?  // "testride", "user", etc.
  resourceId String? // ID van het resource
  ipAddress String?
  userAgent String?
  metadata  Json?    // Extra data
  createdAt DateTime @default(now())
}
```

#### Events te loggen:
- Login/Logout
- Account creatie
- Testride creatie/wijziging/verwijdering
- Admin acties
- Password reset
- Email verificatie

#### Bestanden aan te passen:
- `prisma/schema.prisma`
- `lib/audit-log.ts` (nieuw bestand)
- Alle relevante API routes

#### Implementatie stappen:
1. Voeg AuditLog model toe aan schema
2. Run migration
3. Maak `lib/audit-log.ts` utility
4. Log belangrijke acties in API routes
5. Maak admin UI om logs te bekijken (optioneel)

---

### 4.2 Session Management Verbeteringen
**Impact:** Betere security voor sessies  
**Tijd:** 1 uur  
**Complexiteit:** Medium

#### Features:
1. **Max Session Duration:**
   - 24 uur standaard
   - 7 dagen met "Remember me" optie

2. **Session Refresh:**
   - Refresh bij activiteit
   - Auto-logout na inactiviteit (optioneel)

3. **Concurrent Sessions:**
   - Limiteer aantal gelijktijdige sessies (optioneel)

#### Bestanden aan te passen:
- `lib/auth.ts` (NextAuth configuratie)

#### Implementatie stappen:
1. Configureer session maxAge in NextAuth
2. Voeg "Remember me" functionaliteit toe
3. Test session expiry
4. Documenteer session behavior

---

### 4.3 Two-Factor Authentication (2FA)
**Impact:** Extra beveiligingslaag  
**Tijd:** 3-4 uur  
**Complexiteit:** Hoog

#### Packages:
- `otplib` (TOTP generatie/verificatie)
- `qrcode` (QR code generatie voor authenticator apps)

#### Features:
- Optionele 2FA voor admin accounts
- TOTP-based (Google Authenticator, Authy compatible)
- Backup codes

#### Bestanden aan te passen:
- `prisma/schema.prisma` (2FA fields toevoegen)
- `app/api/auth/2fa/` (nieuwe routes)
- `lib/auth.ts` (2FA check in login flow)
- Frontend: 2FA setup/enable UI

#### Implementatie stappen:
1. Design 2FA flow
2. Voeg database fields toe
3. Implementeer TOTP generatie/verificatie
4. Update login flow
5. Maak UI voor 2FA setup
6. Test met authenticator apps

---

### 4.4 Password Rotation Policy
**Impact:** Voorkomt gebruik van oude wachtwoorden  
**Tijd:** 1-2 uur  
**Complexiteit:** Medium

#### Features:
1. **Password History:**
   - Sla laatste 5 wachtwoorden op (hashed)
   - Voorkom hergebruik

2. **Expiry Reminders:**
   - Email reminder na 90 dagen
   - Waarschuwing in dashboard

#### Database Schema:
```prisma
model PasswordHistory {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  passwordHash String
  createdAt DateTime @default(now())
}
```

#### Bestanden aan te passen:
- `prisma/schema.prisma`
- `lib/password-history.ts` (nieuw bestand)
- `app/api/auth/reset-password/route.ts`
- Cron job voor expiry reminders

#### Implementatie stappen:
1. Voeg PasswordHistory model toe
2. Implementeer password history check
3. Voeg expiry reminder cron job toe
4. Test password reuse prevention

---

## 📊 Implementatie Checklist

### Fase 1: Kritiek (Week 1)
- [ ] 1.1 Rate Limiting
- [ ] 1.2 Test DB Endpoint Beveiligen
- [ ] 1.3 Admin Creation Security
- [ ] 1.4 Server-side File Upload Validatie
- [ ] 1.5 Logging Verbeteringen

### Fase 2: Hoog (Week 2)
- [ ] 2.1 Query Result Limiting & Paginatie
- [ ] 2.2 Security Headers
- [ ] 2.3 CORS Configuratie
- [ ] 2.4 Token Expiry & Cleanup

### Fase 3: Medium (Week 3)
- [ ] 3.1 Password Strength Backend Validatie
- [ ] 3.2 Input Sanitization
- [ ] 3.3 Environment Variables Validatie

### Fase 4: Laag (Week 4+)
- [ ] 4.1 Audit Logging
- [ ] 4.2 Session Management Verbeteringen
- [ ] 4.3 Two-Factor Authentication
- [ ] 4.4 Password Rotation Policy

---

## 🧪 Testing Checklist

Voor elke verbetering:
- [ ] Unit tests (waar van toepassing)
- [ ] Integration tests
- [ ] Manual testing
- [ ] Security testing (probeer aanvallen)
- [ ] Performance testing
- [ ] Netlify deployment test

---

## 📝 Dependencies Toevoegen

```json
{
  "dependencies": {
    "@upstash/ratelimit": "^2.x",  // Rate limiting
    "@upstash/redis": "^1.x",      // Rate limiting (alternatief: in-memory)
    "dompurify": "^3.x",           // Input sanitization
    "isomorphic-dompurify": "^2.x", // Server-side sanitization
    "otplib": "^12.x",             // 2FA (optioneel)
    "qrcode": "^1.x"               // 2FA QR codes (optioneel)
  },
  "devDependencies": {
    "pino": "^8.x",                // Structured logging (optioneel)
    "@types/dompurify": "^3.x"
  }
}
```

---

## 🔐 Environment Variables Documentatie

### Required (Production):
```
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
```

### Optional:
```
NODE_ENV=production
UPSTASH_REDIS_REST_URL=        # Voor rate limiting
UPSTASH_REDIS_REST_TOKEN=      # Voor rate limiting
ADMIN_CREATE_SECRET=           # Alleen voor initial setup
CRON_SECRET=                   # Voor cleanup cron jobs
```

---

## 📚 Resources & Documentatie

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)
- [NextAuth.js Security](https://next-auth.js.org/configuration/options#security)
- [Rate Limiting Best Practices](https://cloud.google.com/architecture/rate-limiting-strategies-techniques)

---

## 🎯 Prioriteiten Samenvatting

**Kritiek (Nu implementeren):**
1. Rate Limiting
2. Test DB Endpoint Beveiligen
3. Admin Creation Security
4. Server-side File Upload Validatie
5. Logging Verbeteringen

**Hoog (Deze week):**
6. Query Result Limiting
7. Security Headers
8. CORS Configuratie
9. Token Expiry & Cleanup

**Medium (Volgende week):**
10. Password Strength Backend
11. Input Sanitization
12. Environment Variables Validatie

**Laag (Later):**
13. Audit Logging
14. Session Management
15. 2FA
16. Password Rotation

---

**Geschatte totale implementatie tijd:** 16-22 uur  
**Aanbevolen aanpak:** Fase-voor-fase, testen na elke fase


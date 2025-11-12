# Setup Instructies

## Stap 1: Dependencies installeren

```bash
npm install
```

## Stap 2: Database configureren

1. Maak een PostgreSQL database aan (lokaal of via een service zoals Supabase, Railway, of Neon)

2. Maak een `.env` bestand in de root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/proefrit?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="uw-willekeurige-secret-key-hier"

# Optioneel: Voor cron job authenticatie
CRON_SECRET="uw-cron-secret-hier"
```

3. Genereer Prisma Client en push schema naar database:

```bash
npx prisma generate
npx prisma db push
```

## Stap 3: Development server starten

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in je browser.

## Stap 4: Eerste account aanmaken

1. Ga naar de registratiepagina
2. Vul de gegevens in:
   - Bedrijfsnaam
   - Bedrijf e-mailadres
   - Uw naam
   - Uw e-mailadres
   - Wachtwoord (minimaal 6 tekens)

3. Na registratie wordt u automatisch ingelogd

## Optionele configuratie

### Handtekeningopslag (AWS S3)

Voeg toe aan `.env`:

```env
AWS_ACCESS_KEY_ID="uw-access-key"
AWS_SECRET_ACCESS_KEY="uw-secret-key"
AWS_REGION="eu-west-1"
AWS_S3_BUCKET="uw-bucket-naam"
```

### Handtekeningopslag (Supabase Storage)

Voeg toe aan `.env`:

```env
SUPABASE_URL="https://uw-project.supabase.co"
SUPABASE_ANON_KEY="uw-anon-key"
SUPABASE_BUCKET="signatures"
```

**Let op:** Momenteel worden handtekeningen opgeslagen als base64 in de database. Voor productie wordt aanbevolen om cloud storage te gebruiken.

## Cron Job Setup (Automatische dataverwijdering)

### Vercel

De `vercel.json` is al geconfigureerd. Zorg ervoor dat de `CRON_SECRET` environment variable is ingesteld in Vercel.

### Andere platforms

Stel een cron job in die dagelijks (bijv. om 2:00) een POST request naar `/api/testrides/cleanup` stuurt met de `CRON_SECRET` in de Authorization header:

```
Authorization: Bearer <CRON_SECRET>
```

## Database migraties

Voor productie, gebruik Prisma migrations:

```bash
npx prisma migrate dev --name init
```

## Productie deployment

1. **Vercel** (aanbevolen):
   - Push code naar GitHub
   - Importeer project in Vercel
   - Voeg environment variables toe
   - Deploy

2. **Render**:
   - Maak een nieuwe Web Service
   - Verbind met GitHub repository
   - Voeg environment variables toe
   - Deploy

Zorg ervoor dat alle environment variables zijn ingesteld in je deployment platform.


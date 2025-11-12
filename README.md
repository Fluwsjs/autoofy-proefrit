# Proefrit Webapp

Multi-tenant SaaS webapp voor het beheren van proefritten voor autobedrijven.

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL met Prisma ORM
- **Authenticatie**: NextAuth.js
- **Storage**: AWS S3 of Supabase Storage (voor handtekeningen)

## Setup

1. **Installeer dependencies:**
   ```bash
   npm install
   ```

2. **Configureer database:**
   - Maak een PostgreSQL database aan
   - Kopieer `.env.example` naar `.env`
   - Vul `DATABASE_URL` in met je database connection string
   - Vul `NEXTAUTH_SECRET` in (genereer een willekeurige string)

3. **Setup database:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Features

- ✅ Multi-tenant architectuur (één platform, aparte omgevingen per autobedrijf)
- ✅ Authenticatie met NextAuth.js
- ✅ Proefrittenbeheer (CRUD)
- ✅ Handtekeningcapture
- ✅ Automatische dataverwijdering na 6 maanden
- ✅ AVG-compliant dataopslag

## Database Schema

- **Tenant**: Autobedrijf
- **User**: Gebruikers binnen een tenant
- **Testride**: Proefrit registratie

## API Routes

- `POST /api/auth/register` - Nieuw autobedrijf + beheerder aanmaken
- `POST /api/auth/login` - Inloggen
- `POST /api/auth/logout` - Uitloggen
- `GET /api/testrides` - Alle proefritten ophalen
- `POST /api/testrides` - Nieuwe proefrit opslaan
- `GET /api/testrides/[id]` - Eén proefrit ophalen
- `DELETE /api/testrides/[id]` - Proefrit verwijderen

## Deployment

De app kan worden gedeployed op:
- **Vercel** (aanbevolen voor Next.js)
- **Render**
- Andere platforms die Next.js ondersteunen

Zorg ervoor dat je environment variables correct zijn ingesteld in je deployment platform.


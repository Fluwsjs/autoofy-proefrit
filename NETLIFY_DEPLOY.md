# Netlify Deployment Instructies

## Stap 1: Code naar GitHub pushen

1. **Initialiseer Git repository** (als je dat nog niet hebt gedaan):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Maak een nieuwe repository op GitHub**:
   - Ga naar [github.com](https://github.com)
   - Klik op "New repository"
   - Geef het een naam (bijv. "proefrit-webapp")
   - Maak de repository aan

3. **Push je code naar GitHub**:
   ```bash
   git remote add origin https://github.com/JOUW-GEBRUIKERSNAAM/JOUW-REPO-NAAM.git
   git branch -M main
   git push -u origin main
   ```

## Stap 2: Netlify Setup

1. **Maak een Netlify account**:
   - Ga naar [netlify.com](https://netlify.com)
   - Meld je aan (gratis account is voldoende)

2. **Importeer je project**:
   - Klik op "Add new site" → "Import an existing project"
   - Kies "GitHub" en autoriseer Netlify
   - Selecteer je repository

3. **Build instellingen** (zou automatisch moeten zijn):
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
   - **Node version**: `20` (of laat Netlify dit automatisch detecteren)

## Stap 3: Environment Variables instellen

**BELANGRIJK**: Voeg deze environment variables toe in Netlify:

1. Ga naar je site in Netlify dashboard
2. Ga naar **Site settings** → **Environment variables**
3. Voeg de volgende variabelen toe:

### Verplicht:
```
DATABASE_URL=postgresql://postgres:Italy024!@@db.cttgctesyubfmhxwzfez.supabase.co:5432/postgres
NEXTAUTH_URL=https://jouw-site-naam.netlify.app
NEXTAUTH_SECRET=een-zeer-lange-willekeurige-string-minimaal-32-karakters
```

### Optioneel:
```
CRON_SECRET=een-willekeurige-secret-voor-cron-jobs
```

**Tip voor NEXTAUTH_SECRET**: Genereer een veilige secret:
```bash
openssl rand -base64 32
```

Of gebruik een online generator zoals: https://generate-secret.vercel.app/32

## Stap 4: Database Schema Deployen

Na de eerste deployment moet je het database schema pushen:

1. **Via Netlify CLI** (aanbevolen):
   ```bash
   npm install -g netlify-cli
   netlify login
   netlify env:get DATABASE_URL
   npx prisma db push
   ```

2. **Of lokaal** (als je DATABASE_URL al hebt):
   ```bash
   npx prisma db push
   ```

## Stap 5: Deploy!

1. Netlify zal automatisch deployen na elke push naar GitHub
2. Of klik op "Trigger deploy" → "Deploy site" in het Netlify dashboard
3. Wacht tot de build klaar is (ongeveer 2-5 minuten)

## Stap 6: Test je deployment

1. Ga naar je Netlify URL (bijv. `https://jouw-site.netlify.app`)
2. Test registratie van een nieuw account
3. Test inloggen
4. Test het aanmaken van een proefrit

## Belangrijke Notities

### ⚠️ NEXTAUTH_URL aanpassen
Na de deployment moet je `NEXTAUTH_URL` aanpassen naar je Netlify URL:
- Ga naar Netlify dashboard → Site settings → Environment variables
- Update `NEXTAUTH_URL` naar: `https://jouw-actuele-netlify-url.netlify.app`

### 🔒 Beveiliging
- Zorg dat je `.env` bestand NIET in Git staat (staat al in `.gitignore`)
- Gebruik sterke secrets voor productie
- Overweeg om Prisma migrations te gebruiken in plaats van `db push` voor productie

### 📊 Database
- Je Supabase database is al geconfigureerd
- Zorg dat je database publiek toegankelijk is (of gebruik connection pooling)
- Voor productie: overweeg Supabase connection pooling

### 🚀 Performance
- Netlify heeft goede Next.js support
- De eerste build kan wat langer duren (Prisma generate)
- Volgende builds zijn sneller door caching

## Troubleshooting

### Build faalt met Prisma error
- Zorg dat `postinstall` script in package.json staat
- Check of `DATABASE_URL` correct is ingesteld

### NextAuth errors
- Controleer of `NEXTAUTH_URL` exact overeenkomt met je Netlify URL
- Controleer of `NEXTAUTH_SECRET` is ingesteld

### Database connection errors
- Controleer of je Supabase database publiek toegankelijk is
- Check je DATABASE_URL format
- Overweeg Supabase connection pooling voor betere performance

## Custom Domain (Optioneel)

1. Ga naar **Site settings** → **Domain management**
2. Klik op **Add custom domain**
3. Volg de instructies om je domein te koppelen

## Support

Als je problemen hebt:
- Check de Netlify build logs
- Check de browser console voor errors
- Zorg dat alle environment variables correct zijn ingesteld


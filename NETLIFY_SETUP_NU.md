# 🚀 Netlify Setup - Stap voor Stap

## ✅ Je code staat op GitHub! Nu naar Netlify:

### Stap 1: Netlify Account Aanmaken (als je nog geen account hebt)

1. Ga naar [netlify.com](https://netlify.com)
2. Klik op **"Sign up"**
3. Kies **"GitHub"** om in te loggen met je GitHub account
4. Autoriseer Netlify om toegang te krijgen tot je GitHub repositories

### Stap 2: Nieuw Site Aanmaken

1. In Netlify dashboard, klik op **"Add new site"**
2. Kies **"Import an existing project"**
3. Klik op **"GitHub"** (of de Git provider die je gebruikt)
4. Autoriseer Netlify als dat nodig is
5. Zoek en selecteer je repository (`autoofy-proefrit` of hoe je het hebt genoemd)

### Stap 3: Build Instellingen Controleren

Netlify detecteert automatisch Next.js, maar controleer dit:

- **Build command**: `npm run build`
- **Publish directory**: `.next`
- **Node version**: `20` (staat al in `netlify.toml`)

**Als dit niet automatisch wordt gedetecteerd:**
- Klik op **"Show advanced"**
- Vul handmatig in:
  - Build command: `npm run build`
  - Publish directory: `.next`

### Stap 4: Environment Variables Instellen ⚠️ BELANGRIJK!

**DOE DIT VOORDAT JE OP "DEPLOY SITE" KLIKT!**

1. Klik op **"Show advanced"** → **"New variable"**
2. Voeg deze variables toe (één voor één):

#### Variable 1: DATABASE_URL
- **Key**: `DATABASE_URL`
- **Value**: `postgresql://postgres:Italy024!@@db.cttgctesyubfmhxwzfez.supabase.co:5432/postgres`
- **Scopes**: ✅ Production, ✅ Deploy previews, ✅ Branch deploys

#### Variable 2: NEXTAUTH_URL
- **Key**: `NEXTAUTH_URL`
- **Value**: `https://jouw-site.netlify.app` (tijdelijk - pas aan na eerste deploy!)
- **Scopes**: ✅ Production, ✅ Deploy previews, ✅ Branch deploys

#### Variable 3: NEXTAUTH_SECRET
- **Key**: `NEXTAUTH_SECRET`
- **Value**: `a5515096fd53df882c00e422a08dcdb8`
- **Scopes**: ✅ Production, ✅ Deploy previews, ✅ Branch deploys

#### Variable 4: CRON_SECRET (Optioneel)
- **Key**: `CRON_SECRET`
- **Value**: `cron-secret-key-2024`
- **Scopes**: ✅ Production, ✅ Deploy previews, ✅ Branch deploys

3. Klik **"Deploy site"** na het toevoegen van alle variables

### Stap 5: Wachten op Build

1. Je ziet de build status in het dashboard
2. Build duurt meestal 2-5 minuten
3. Je kunt de build logs bekijken door op de build te klikken
4. Als de build klaar is, krijg je een URL zoals: `https://random-name-12345.netlify.app`

### Stap 6: NEXTAUTH_URL Aanpassen (NA eerste deployment!)

**BELANGRIJK**: Dit moet je doen nadat de eerste build klaar is!

1. Kopieer je echte Netlify URL (bijv. `https://jouw-app-12345.netlify.app`)
2. Ga naar **Site settings** → **Environment variables**
3. Zoek `NEXTAUTH_URL` en klik op **"Edit"**
4. Verander de waarde naar je echte Netlify URL:
   ```
   https://jouw-actuele-netlify-url.netlify.app
   ```
5. Klik **"Save"**
6. Ga terug naar je site dashboard
7. Klik op **"Trigger deploy"** → **"Deploy site"** (of wacht tot Netlify automatisch redeployt)

### Stap 7: Testen! 🎉

1. Ga naar je Netlify URL
2. Test registratie van een nieuw account
3. Test inloggen
4. Test het aanmaken van een proefrit
5. Test admin dashboard:
   - Login met: `adminjvh@admin.local`
   - Wachtwoord: `Italy024!@`
   - Ga naar `/admin` voor admin dashboard

### Stap 8: Deel met Vrienden! 🚀

Geef je vrienden de Netlify URL en laat ze:
- Een account aanmaken
- Proefritten toevoegen
- Handtekeningen toevoegen
- Alles testen!

## 🔧 Troubleshooting

### Build faalt
- Check build logs in Netlify dashboard
- Zorg dat alle environment variables zijn ingesteld
- Check of `DATABASE_URL` correct is
- Check of Prisma Client wordt gegenereerd (zou automatisch moeten via `postinstall` script)

### NextAuth errors
- Controleer of `NEXTAUTH_URL` exact overeenkomt met je Netlify URL (inclusief `https://`)
- Controleer of `NEXTAUTH_SECRET` is ingesteld
- Clear browser cache

### Database errors
- Controleer of Supabase database publiek toegankelijk is
- Check `DATABASE_URL` format
- Check of database schema is gepusht (Prisma zou dit automatisch moeten doen)

### 404 errors op routes
- Dit is normaal voor Next.js op Netlify
- Netlify Next.js plugin zou dit moeten oplossen
- Check of `@netlify/plugin-nextjs` wordt gebruikt (staat in `netlify.toml`)

## ✅ Klaar!

Je app is nu live op Netlify! 🎉


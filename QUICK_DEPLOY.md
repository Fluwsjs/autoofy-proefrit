# ⚡ Snelle Netlify Deployment Gids

## 🎯 In 5 stappen live!

### 1️⃣ Code naar GitHub
```bash
git init
git add .
git commit -m "Autoofy Proefrit App - Ready for Netlify"
# Maak repo op GitHub, dan:
git remote add origin https://github.com/JOUW-USERNAME/JOUW-REPO.git
git branch -M main
git push -u origin main
```

### 2️⃣ Netlify Setup
1. Ga naar [netlify.com](https://netlify.com)
2. **Add new site** → **Import from Git** → **GitHub**
3. Selecteer je repository
4. Klik **Deploy** (instellingen zijn al goed)

### 3️⃣ Environment Variables
In Netlify → **Site settings** → **Environment variables**, voeg toe:

```
DATABASE_URL=postgresql://postgres:Italy024!@@db.cttgctesyubfmhxwzfez.supabase.co:5432/postgres
NEXTAUTH_URL=https://jouw-site.netlify.app
NEXTAUTH_SECRET=a5515096fd53df882c00e422a08dcdb8
CRON_SECRET=cron-secret-key-2024
```

**⚠️ BELANGRIJK**: Na eerste deploy, update `NEXTAUTH_URL` met je echte Netlify URL!

### 4️⃣ Wacht op Build
- Eerste build duurt 2-5 minuten
- Check build logs voor errors

### 5️⃣ Test!
- Ga naar je Netlify URL
- Test registratie en login
- Deel de URL met je vrienden! 🎉

## 🔑 Admin Login (voor jou)
- E-mail: `adminjvh@admin.local`
- Wachtwoord: `Italy024!@`
- Geeft toegang tot `/admin` dashboard

## ✅ Klaar!
Je app is nu live en testbaar! 🚀


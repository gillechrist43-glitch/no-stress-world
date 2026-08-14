# 🚀 Guide de Déploiement - NO STRESS WORLD

Ce guide explique comment déployer votre plateforme en ligne avec une URL partageable.

## Architecture de Déploiement

```
┌─────────────────────────────────┐
│   Frontend (Expo Web)           │
│   Déployé sur Vercel ✓          │
│   URL: https://your-app.vercel.app
└──────────────┬──────────────────┘
               │
               │ API calls
               ▼
┌─────────────────────────────────┐
│   Backend (Node.js + Express)   │
│   Déployé sur Railway/Heroku    │
│   URL: https://your-api.railway.app
└─────────────────────────────────┘
```

---

## Option A: Déployer sur Vercel + Railway (Recommandé)

### Étape 1: Préparer le repo GitHub

```bash
# 1. Créer un compte sur github.com (si pas encore)

# 2. Créer un nouveau repository public nommé "no-stress-world"

# 3. Initialize git localement
git config --global user.name "Your Name"
git config --global user.email "your@email.com"

cd c:\Users\kpeho\Downloads\no-stress-world

# 4. Initialize et push
git init
git add .
git commit -m "Initial commit: NO STRESS WORLD platform"
git remote add origin https://github.com/YOUR_USERNAME/no-stress-world.git
git branch -M main
git push -u origin main
```

### Étape 2: Déployer le Frontend sur Vercel

1. **Aller sur [vercel.com](https://vercel.com)**
2. **Cliquer "New Project"**
3. **Importer le repo GitHub:**
   - Sélectionner "no-stress-world"
   - Laisser les paramètres par défaut
4. **Ajouter les variables d'environnement:**
   - Cliquer "Environment Variables"
   - Ajouter:
     ```
     REACT_APP_REMOTE_API = true
     REACT_APP_REMOTE_API_URL = https://your-backend-url.railway.app
     ```
5. **Déployer!**
   - Vercel construit automatiquement
   - URL: `https://your-project-name.vercel.app`

### Étape 3: Déployer le Backend sur Railway

1. **Aller sur [railway.app](https://railway.app)**
2. **Créer un nouveau projet:**
   - Cliquer "New Project"
   - Sélectionner "GitHub Repo"
   - Connecter et sélectionner "no-stress-world"
3. **Configurer les variables d'environnement:**
   - Railway → "Variablesenvies" → Add:
     ```
     EMAILJS_USER=JsbOdljB-zSYfbcGs
     EMAILJS_SERVICE=service_dji4avl
     EMAILJS_TEMPLATE=template_kxv3da
     SURVEY_TO=your@email.com
     JWT_SECRET=your_random_secret_key
     PORT=3000
     ```
4. **Lancer le service backend:**
   - Railway → "Deploy"
   - Domain: `https://your-project-railway.app`

### Étape 4: Mettre à jour le Frontend avec l'URL Backend

1. **Sur Vercel:**
   - Settings → Environment Variables
   - Modifier `REACT_APP_REMOTE_API_URL = https://your-backend-railway.app`
   - Redéployer

2. **Tester:**
   - Ouvrir `https://your-project.vercel.app`
   - Essayer login: `admin@local` / `admin123`
   - Test survey et export

---

## Option B: Déployer Localement avec Docker

### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000 4004

CMD ["sh", "-c", "npm run start:server & npm run web"]
```

### Déployer

```bash
docker build -t no-stress-world .
docker run -p 3000:3000 -p 4004:4004 \
  -e EMAILJS_USER=YOUR_KEY \
  -e SURVEY_TO=your@email.com \
  no-stress-world
```

---

## Option C: Heroku + Vercel

### Backend sur Heroku

1. **Créer un compte [heroku.com](https://heroku.com)**
2. **Créer une nouvelle app:**
   ```bash
   heroku login
   heroku create your-app-name
   heroku config:set EMAILJS_USER=xxx
   heroku config:set SURVEY_TO=your@email.com
   ```
3. **Déployer:**
   ```bash
   git push heroku main
   ```
4. **URL Backend:** `https://your-app-name.herokuapp.com`

---

## Troubleshooting

### 401 Unauthorized (Frontend → Backend)

```
Cause: REACT_APP_REMOTE_API_URL incorrecte
Fix: Vérifier l'URL du backend sur Vercel settings
```

### CORS Error

```
Cause: Backend CORS mal configuré
Fix: 
  - Server: ajouter header 'Access-Control-Allow-Origin: *'
  - Client: utiliser fetch avec credentials
```

### Email non envoyé

```
Cause: EmailJS keys incorrectes
Fix:
  - Vérifier EMAILJS_USER, SERVICE, TEMPLATE
  - Tester avec les defaults (fournis dans .env.example)
  - Vérifier SURVEY_TO = email valide
```

### SQLite database error

```
Cause: Database pas accessible en serverless (Railway/Heroku)
Fix: Utiliser PostgreSQL ou MongoDB au lieu de SQLite
  - Modifier server/index.js pour utiliser pg ou mongoose
```

---

## URLs de Test

Après déploiement:

```
Frontend: https://your-app.vercel.app

Admin Login:
  Email: admin@local
  Password: admin123

Test Features:
  1. Login/Register
  2. Remplir formulaire de demande → Email reçu?
  3. Admin Dashboard → Stats visibles?
  4. Export CSV/JSON → Téléchargé?
```

---

## Maintenance

### Mises à jour

```bash
# Local changes
git add .
git commit -m "Update features"
git push origin main

# Vercel/Railway redéploient automatiquement
```

### Logs

```bash
# Vercel (Frontend)
vercel logs

# Railway (Backend)
railway logs
```

### Backup Database

```bash
# Télécharger la DB SQLite
railway exec "cat db.sqlite" > backup.sqlite
```

---

## Support

- **Vercel Docs:** https://vercel.com/docs
- **Railway Docs:** https://docs.railway.app
- **Expo Web Docs:** https://docs.expo.dev/clients/expo-web

**Questions?** Ouvrir une issue GitHub ou contacter le support.

---

**Good luck! 🚀**

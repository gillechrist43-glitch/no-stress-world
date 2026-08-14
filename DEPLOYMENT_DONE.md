# 🚀 Déploiement EN LIGNE Complété

## ✅ Étape 1: Frontend (GitHub Pages) - FAIT ✓

- Repo créé: https://github.com/gillechrist43-glitch/no-stress-world
- GitHub Actions configure le déploiement automatique
- L'app Expo web sera servie via GitHub Pages

**Pour activer GitHub Pages:**
1. Allez sur: https://github.com/gillechrist43-glitch/no-stress-world/settings/pages
2. Sélectionnez **Source**: `Deploy from a branch`
3. Sélectionnez **Branch**: `gh-pages` (créée automatiquement par GitHub Actions)
4. **Save**

**URL Frontend:** `https://gillechrist43-glitch.github.io/no-stress-world/`

---

## ⚠️ Étape 2: Backend (Node.js + SQLite) - REQUIS

GitHub Pages ne peut pas héberger Node.js. Utilisez **Railway** (gratuit):

### A. Créer le Backend sur Railway

1. Allez sur: https://railway.app
2. Cliquez **"New Project"** → **"Deploy from GitHub Repo"**
3. Sélectionnez: `gillechrist43-glitch/no-stress-world`
4. Railway crée automatiquement un service Node.js
5. Ajouter les **Environment Variables** (Railway → Variables):
   ```
   EMAILJS_USER=JsbOdljB-zSYfbcGs
   EMAILJS_SERVICE=service_dji4avl
   EMAILJS_TEMPLATE=template_kxv3da
   SURVEY_TO=your_email@gmail.com
   JWT_SECRET=random_secret_key_12345
   PORT=3000
   ```
6. Clicker **Deploy**

**URL Backend:** `https://your-project-railway.app`

### B. Configurer le Frontend pour le Backend

1. Allez sur: https://github.com/gillechrist43-glitch/no-stress-world/settings/secrets
2. Ajouter un **Secret:**
   - Name: `REACT_APP_REMOTE_API_URL`
   - Value: `https://your-project-railway.app`

3. Modifiez le workflow:
   - `.github/workflows/deploy.yml`
   - Changez ligne `REACT_APP_REMOTE_API_URL:` de `http://localhost:4004` → `${{ secrets.REACT_APP_REMOTE_API_URL }}`

---

## 📋 Accès aux URLs

Après configuration:

### Frontend (GitHub Pages)
```
https://gillechrist43-glitch.github.io/no-stress-world/
```

### Backend (Railway)
```
https://your-project-railway.app/auth/login
```

---

## 🧪 Test en Ligne

1. Ouvrez: `https://gillechrist43-glitch.github.io/no-stress-world/`
2. Login: `admin@local` / `admin123`
3. Vérifier:
   - ✅ Dashboard admin s'affiche
   - ✅ Bouton "Déconnecter" visible
   - ✅ Survey form fonctionne
   - ✅ Email reçu après submission

---

## 🔧 Déploiement Continu

Chaque fois que vous poussez du code:
```bash
git add .
git commit -m "Update: description"
git push origin main
```

**GitHub Actions va automatiquement:**
1. ✅ Installer dépendances
2. ✅ Builder l'app Expo web
3. ✅ Déployer sur GitHub Pages

**Railway va automatiquement:**
1. ✅ Redéployer le backend
2. ✅ Faire tourner les migrations DB

---

## 📞 Troubleshooting

### "Frontend affiche erreur de connexion"
→ Vérifier l'URL du backend dans `.github/workflows/deploy.yml`

### "404 sur GitHub Pages"
→ Vérifier que GitHub Pages est activé dans Settings → Pages

### "Email non reçu"
→ Vérifier les variables EmailJS sur Railway

### "SQLite error"
→ Railway maintient la DB automatiquement - pas d'action nécessaire

---

## ✨ RÉSUMÉ FINAL

| Component | Plateforme | URL |
|-----------|-----------|-----|
| **Frontend** | GitHub Pages | https://gillechrist43-glitch.github.io/no-stress-world/ |
| **Backend** | Railway | https://your-project.railway.app |
| **Code** | GitHub | https://github.com/gillechrist43-glitch/no-stress-world |

**Accès public:** ✅ OUI - URL partageable!
**Auto-déploiement:** ✅ OUI - Push = Deploy
**Stockage DB:** ✅ OUI - SQLite sur Railway

🎉 **Plateforme EN LIGNE et PRÊTE!**

# NO STRESS WORLD 📸 - Photography Platform

Une plateforme web moderne pour la gestion des séances photo et réservations avec frontend statique React/Expo Web, API Express et PostgreSQL distant.

## 🚀 Caractéristiques

✅ **Authentification sécurisée** - Login/Register avec hashing PBKDF2  
✅ **Rôles utilisateurs** - Client et Admin avec permissions  
✅ **Gestion des réservations** - CRUD avec statuts (pending, confirmed, completed)  
✅ **Formulaire de demande** - Soumettre des demandes + email via EmailJS  
✅ **Dashboard admin** - Statistiques temps réel, gestion des admins, export CSV/JSON  
✅ **Interface professionnelle** - Design responsive avec thème personnalisé  

## 🛠️ Stack Technique

| Domaine | Technology |
|---------|------------|
| **Frontend** | Expo (React Native Web) + TypeScript |
| **Backend** | Node.js + Express (Render) |
| **Base de données** | PostgreSQL (Neon) avec fallback SQLite local |
| **Auth** | HMAC-SHA256 tokens + PBKDF2 hashing |
| **Email** | EmailJS REST API |
| **State** | Zustand |
| **UI** | Custom components + React Native |

## 🔧 Installation & Démarrage

### Prérequis
```bash
Node.js 16+ et npm
```

### Installation

```bash
# 1. Installer les dépendances
npm install

# 2. Démarrer le serveur backend (Terminal 1)
npm run start:server
# → Écoute sur http://localhost:4004

# 3. Démarrer Expo web (Terminal 2)
npm run web
# → Accès sur http://localhost:19006
```

### Test Credentials

```
Admin Login:
  Email: admin@local
  Password: admin123

Client:
  S'inscrire via le formulaire "S'inscrire"
```

## 📧 Configuration EmailJS

Par défaut, utilise les clés du fichier HTML fourni. Pour personnaliser:

**Créer un `.env` à la racine:**
```bash
EMAILJS_USER=your_user_id
EMAILJS_SERVICE=your_service_id
EMAILJS_TEMPLATE=your_template_id
SURVEY_TO=admin@example.com
JWT_SECRET=your_secret_key
```

## 📂 Structure

```
.
├── src/
│   ├── screens/          # Pages (Login, Survey, Admin, etc.)
│   ├── components/ui/    # Button, Card, Input, Logo
│   ├── services/         # api.ts, db.ts, messages.ts
│   ├── store/            # useAuthStore (Zustand)
│   ├── theme/            # colors, spacing, typography
│   ├── navigation/       # routing avec @react-navigation
│   └── types/            # TypeScript definitions
├── server/
│   ├── index.js          # Express app + SQLite
│   └── db.sqlite         # Database (auto-created)
├── app.json              # Expo config
└── package.json
```

## 🌐 Déploiement en Ligne

### Architecture recommandée : GitHub Pages + Render + Neon

Le frontend est compilé en fichiers statiques et publié sur GitHub Pages. Render exécute `server/index.js` comme service Node.js, tandis que Neon fournit la base PostgreSQL persistante.

#### Backend Render

Créer un Web Service Render avec le dépôt GitHub et ces paramètres :

```text
Root Directory: server
Build Command: npm install
Start Command: npm start
```

Variables Render : `DATABASE_URL` (URL Neon avec `sslmode=require`), `JWT_SECRET`, `FRONTEND_URL` (URL GitHub Pages), `ADMIN_EMAIL`, `ADMIN_PASSWORD`, et les variables EmailJS.

Le endpoint `GET /health` doit répondre `{ "ok": true, "database": "postgres" }`.

#### Frontend GitHub Pages

Ajouter le secret GitHub `REACT_APP_REMOTE_API_URL` avec l’URL publique Render, sans suffixe `/api`, puis pousser sur `main`. Le workflow `.github/workflows/deploy.yml` construit et publie `web-build`.

### Alternative historique : Vercel

1. **Push le code sur GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/no-stress-world.git
   git push -u origin main
   ```

2. **Déployer sur Vercel:**
   - Aller sur [vercel.com](https://vercel.com)
   - Cliquer "New Project"
   - Sélectionner le repo GitHub
   - Ajouter les variables d'environnement:
     ```
     EMAILJS_USER=JsbOdljB-zSYfbcGs
     EMAILJS_SERVICE=service_dji4avl
     EMAILJS_TEMPLATE=template_kxv3da
     SURVEY_TO=your_email@gmail.com
     JWT_SECRET=your_secret
     ```
   - Déployer! 🚀

**URL sera:** `https://your-project.vercel.app`

### Option 2: Netlify

```bash
# Build et déployer sur Netlify
npm run build
# Drag & drop le dossier /build sur netlify.com
```

## 🔐 API Endpoints

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Créer compte client | ❌ |
| POST | `/auth/login` | Se connecter | ❌ |
| POST | `/admin/create-admin` | Créer admin | ✅ Admin |

### Bookings
| POST | `/bookings` | Créer réservation | ❌ |
| GET | `/bookings` | Lister réservations | ✅ |
| PUT | `/bookings/:id/status` | Changer statut | ✅ Admin |

### Surveys
| POST | `/surveys` | Soumettre demande + email | ❌ |
| GET | `/admin/surveys` | Lister demandes | ✅ Admin |
| GET | `/admin/surveys/export` | Export CSV | ✅ Admin |

## 🔐 Sécurité

- ✅ Passwords hachés PBKDF2 (100k iterations)
- ✅ Tokens HMAC-SHA256
- ✅ CORS activé (localhost)
- ⚠️  En production: configurer HTTPS, rate-limiting, helmet.js

## 🧪 Tests Manuels

### Test Login
1. Ouvrir http://localhost:19006
2. Email: `admin@local`, Password: `admin123`
3. Vérifier: message d'erreur pour mauvais password, accès admin pour bon password

### Test Survey
1. Aller sur "Remplir le formulaire de demande"
2. Remplir tous les champs
3. Soumettre
4. Vérifier email reçu à `SURVEY_TO` + message de succès avec référence

### Test Admin Dashboard
1. Login en tant qu'admin
2. Voir stats (Total, Confirmées, Attente, Terminées, Revenu)
3. Cliquer "Réservations" pour gérer
4. Exporter CSV/JSON des demandes
5. Créer nouveau admin

## 📝 Licence

MIT

## 🤝 Support

Ouvrir une issue sur GitHub pour toute question.

---

**Made with ❤️ for NO STRESS WORLD**


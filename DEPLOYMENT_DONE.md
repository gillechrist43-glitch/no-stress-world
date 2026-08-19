# Mise en production

Architecture retenue :

```text
GitHub Pages -> Render (Express) -> Neon (PostgreSQL)
```

## 1. Neon

Créer une base PostgreSQL et copier son URL `DATABASE_URL` avec `sslmode=require`.

## 2. Render

Créer un Web Service depuis le dépôt GitHub, ou utiliser [render.yaml](render.yaml) :

```text
Root Directory: server
Build Command: npm install
Start Command: npm start
Health Check: /health
```

Variables obligatoires :

```text
DATABASE_URL=<URL Neon>
JWT_SECRET=<secret long et aléatoire>
FRONTEND_URL=https://<utilisateur>.github.io/<depot>
ADMIN_EMAIL=<email admin>
ADMIN_PASSWORD=<mot de passe admin>
NODE_ENV=production
```

Ajouter aussi `EMAILJS_USER`, `EMAILJS_SERVICE`, `EMAILJS_TEMPLATE` et `SURVEY_TO` pour les demandes de séance.

Vérifier que `GET https://<api-render>/health` renvoie `ok: true` et `database: postgres`.

## 3. GitHub Pages

Dans les secrets du dépôt, ajouter :

```text
REACT_APP_REMOTE_API_URL=https://<api-render>
```

Pousser sur `main`. Le workflow [.github/workflows/deploy.yml](.github/workflows/deploy.yml) construit `web-build` et publie la branche `gh-pages`. Dans les réglages Pages, sélectionner `gh-pages` comme source.

## 4. Vérification finale

1. Ouvrir l’URL GitHub Pages.
2. Créer un compte client et effectuer une réservation.
3. Se connecter avec le compte administrateur.
4. Vérifier le dashboard, la galerie, la messagerie et l’envoi d’une demande.

SQLite reste disponible uniquement pour le développement local. En production, `DATABASE_URL` est obligatoire et l’API refuse les secrets de développement.

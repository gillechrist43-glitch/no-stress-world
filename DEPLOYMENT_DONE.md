# Deploiement Netlify

La plateforme peut etre deployee entierement sur Netlify :

```text
Netlify (frontend + fonctions API) -> Neon PostgreSQL
```

## Configuration Netlify

Importer le depot GitHub `gillechrist43-glitch/no-stress-world` dans Netlify. Le fichier `netlify.toml` configure automatiquement :

```text
Build command: npm install && npm install --prefix server && npm run build
Publish directory: web-build
Functions directory: netlify/functions
```

Ajouter dans les variables d'environnement Netlify :

```text
DATABASE_URL=<URL Neon avec sslmode=require>
JWT_SECRET=<secret long et aleatoire>
ADMIN_EMAIL=<email administrateur>
ADMIN_PASSWORD=<mot de passe administrateur>
EMAILJS_USER=<identifiant EmailJS>
EMAILJS_SERVICE=<service EmailJS>
EMAILJS_TEMPLATE=<template EmailJS>
SURVEY_TO=<email de reception>
NODE_ENV=production
```

Ne pas definir `REACT_APP_REMOTE_API_URL` en production Netlify : le frontend utilise automatiquement `/api`, redirige vers la fonction Netlify dans `netlify.toml`.

## Verification

Apres le premier deploiement :

1. Ouvrir l'URL Netlify.
2. Verifier `https://<site>.netlify.app/api/health`.
3. Verifier que la reponse indique `ok: true`.
4. Creer un compte client avec une adresse unique.
5. Se connecter avec l'administrateur.
6. Publier une image depuis l'appareil dans la galerie.
7. Verifier que l'image apparait cote client.
8. Tester une reservation, un message, le changement de mot de passe et la suppression de compte.

La base Neon est necessaire en production pour conserver les comptes, reservations, messages et images entre les executions serverless. SQLite reste uniquement disponible pour le developpement local.

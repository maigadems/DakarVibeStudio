# Westaf Records — site et espaces de gestion

Application React 18 + Vite + Tailwind CSS + React Router. Elle consomme l'API du dépôt `back-westaf`.

## Démarrage

```bash
npm install
cp .env.example .env    # VITE_API_URL=https://api.westafrecords.com
npm run dev             # http://localhost:5173
npm run build           # génère dist/
```

`VITE_API_URL` est la seule variable : aucune clé secrète n'est présente dans le frontend
(l'ID client Google, public, est fourni par l'API).

## Pages

| URL | Contenu |
|---|---|
| `/` | Accueil |
| `/services` | Services et tarifs (gérés depuis l'administration) |
| `/studio` | Galerie photo (lightbox) |
| `/equipements` | Matériel du studio |
| `/contact` | Coordonnées, horaires, message WhatsApp |
| `/reservation` | Tunnel de réservation (service → date → créneau → paiement) |
| `/connexion`, `/inscription`, `/mot-de-passe-oublie`, `/reinitialiser-mot-de-passe` | Comptes |
| `/mon-espace`, `/mon-espace/reservations`, `/mon-espace/factures`, `/mon-espace/profil` | Espace client |
| `/paiement/retour` | Retour PayTech |
| `/paiement/:jeton`, `/presence/:jeton` | Pages ouvertes depuis les messages WhatsApp |
| `/admin` | Connexion de l'équipe, puis `/admin/dashboard`, `reservations`, `calendrier`, `paiements`, `factures`, `clients`, `ingenieurs`, `services`, `equipements`, `galerie`, `disponibilites`, `parametres`, `administrateurs` (super admin) |
| `/ingenieur` | Espace ingénieur : sessions, `calendrier`, `disponibilites`, `profil` |

Les anciennes adresses `/#reservation`, `/tarifs` et `/?payment=…` sont redirigées.
Les routes protégées redirigent vers la connexion, puis vers la page demandée si le rôle l'autorise ;
l'API applique de son côté les mêmes règles.

## Déploiement : routes au rechargement

Toutes les URL doivent renvoyer `index.html`. Les fichiers sont fournis :

- **Netlify** : `public/_redirects` (copié dans `dist/`) ;
- **Hostinger / Apache** : `public/.htaccess` (copié dans `dist/`) — envoyer le contenu de `dist/` dans `public_html/` ;
- **Vercel** : `vercel.json`.

## Applications installables (PWA) et notifications

Deux applications distinctes s'installent depuis le même site :

| Application | Pages | Fiche | Couleur |
|---|---|---|---|
| **Westaf Records** (clients) | site, `/mon-espace` | `public/manifest-client.webmanifest` | blanche |
| **Westaf Admin** (équipe) | `/admin`, `/ingenieur` | `public/manifest-admin.webmanifest` | noire |

Pour installer l'application admin, ouvrez `/admin` puis « Installer » (Android / ordinateur) ou
Partager → « Sur l'écran d'accueil » (iPhone). Un bandeau propose ensuite d'**activer les notifications** ;
le réglage existe aussi dans Profil → « Notifications sur cet appareil ».
`public/sw.js` gère le cache et l'affichage des notifications. La clé publique push vient de l'API
(`/public/config`) : aucune clé dans le frontend.

## Mode maintenance

`MAINTENANCE` dans `src/App.tsx`.

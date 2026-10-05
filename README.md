# QR Creator v2

QR Creator, par UNIVERS10, est une plateforme pour créer des **QR codes dynamiques** au design personnalisé, modifier leur destination après impression et **mesurer chaque scan**. Elle s'inspire des leaders du secteur (QR Code Generator Pro, Uniqode, QR Tiger, Bitly, Flowcode).

![Next.js](https://img.shields.io/badge/Next.js-16-black) ![React](https://img.shields.io/badge/React-19-149eca) ![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8) ![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6)

## Fonctionnalités

### Générateur et design
- **11 types de contenu** : site web, **menu de restaurant**, carte de visite (vCard), Wi-Fi, WhatsApp, email, appel, SMS, événement (iCalendar), localisation, texte.
- **Validation en direct** de chaque champ (zod) et encodage au format standard reconnu par les smartphones (`WIFI:`, `mailto:`, `tel:`, `SMSTO:`, vCard 3.0, VEVENT…).
- **Design** : 8 modèles, 6 formes de modules, styles des repères, couleurs, dégradés linéaires ou radiaux, fond transparent.
- **Logo** : import par glisser-déposer, redimensionné automatiquement côté client, taille et marge réglables, modules masqués sous le logo.
- **Cadres d'appel à l'action** : bandeau haut ou bas, bulle, texte personnalisable (« SCANNEZ-MOI », « MENU »…).
- **Analyse de lisibilité** : un score (contraste WCAG, logo par rapport au niveau de correction, marge, motif inversé) et des conseils.
- **Exports HD** : PNG ou JPG jusqu'à 4096 px, SVG vectoriel, PDF A4 prêt à imprimer, copie dans le presse-papiers.
- **Générateur public sans compte** (QR statiques). Le brouillon est conservé si l'on crée un compte ensuite.

### Menu de restaurant
- **Trois mises en page, cinq styles** :
  - **Fast-food** : appli de livraison avec commande en ligne (voir ci-dessous) ;
  - **Moderne** : grandes photos, carrousel « Coups de cœur », façon appli de livraison ;
  - **Classique, Bistrot, Élégant** : carte gastronomique imprimée, avec typographie serif, prix alignés en pointillés et couverture en arche.
- **Éditeur de carte** :
  - trois onglets : Carte, Établissement, Apparence ;
  - catégories et plats réordonnables par glisser-déposer, lignes compactes qui se déplient ;
  - déclinaisons de prix (verre ou bouteille, tailles, formules) ;
  - 8 étiquettes (régimes, allergènes, coups de cœur), disponibilité « Épuisé » ;
  - annulation après suppression.
- **Aperçu en direct** dans un smartphone, à côté du QR code, mis à jour à chaque frappe.
- **Page client** :
  - onglets de catégories collants avec soulignement animé ;
  - recherche et filtres par régime ;
  - fiche plat avec photo bord à bord ;
  - horaires, appel, itinéraire, Wi-Fi ;
  - légende des pictogrammes.
- **Devises** : 16, regroupées par région. Le franc CFA (XOF) est la devise par défaut, sans décimales. Le sélecteur est en tête de l'onglet Carte. Entre XOF, XAF et EUR, les prix peuvent être convertis automatiquement à la parité fixe (1 € = 655,957 F CFA).
- **Menus d'exemple** (« Fast-food » et « Bistrot ») avec de vraies photos libres de droits (licence Unsplash), servies depuis `public/menu-demo/` (voir `CREDITS.md`).
- **Photos des restaurateurs** :
  - recompressées en WEBP dans le navigateur, stockées dans la table `asset` ;
  - servies par `/api/assets/{id}` avec un cache CDN d'un an ;
  - type vérifié par signature binaire, SVG refusé ;
  - quotas par compte et nettoyage automatique des images orphelines.

### Commande en ligne (style « Fast-food »)
- **Côté client**, une interface façon appli de livraison :
  - grille de produits avec bouton « + », « Les plus commandés » ;
  - fiche produit avec tailles, options et suppléments (obligatoires ou facultatifs, choix unique ou multiple) et quantité ;
  - panier flottant conservé dans le navigateur ;
  - livraison, à emporter ou sur place, avec frais de livraison, minimum de commande et délai affichés.
- **Envoi** : la commande est enregistrée, puis un message WhatsApp formaté s'ouvre vers le numéro du restaurant. Le client reçoit un lien de suivi `/o/{jeton}`, qui se met à jour automatiquement.
- **Sécurité** :
  - le serveur recalcule chaque prix à partir de la carte enregistrée et vérifie les options obligatoires, la disponibilité et le minimum ;
  - numérotation séquentielle par menu ;
  - limite de 5 commandes par expéditeur et par tranche de 10 minutes.
- **Tableau de bord « Commandes »** :
  - colonnes Nouvelles, En préparation, Prêtes / en livraison, Terminées ;
  - actualisation toutes les 10 secondes, alerte sonore et compteur dans l'onglet ;
  - chiffre d'affaires, panier moyen ;
  - appel ou WhatsApp vers le client, annulation.

### QR codes dynamiques
- Lien court `/r/{code}` avec une **redirection 302 instantanée**. Le scan est enregistré après l'envoi de la réponse (`after()`).
- Destination **modifiable à tout moment**, sans changer le motif imprimé.
- **Pause et réactivation**, duplication, suppression avec confirmation.
- **Pages mobiles** pour les types non-web : la vCard s'ajoute aux contacts (`.vcf`), l'événement à l'agenda (`.ics` et Google Agenda), le Wi-Fi affiche un mot de passe à copier, la localisation une carte OpenStreetMap.

### Analytique
- Scans et visiteurs uniques, avec leur variation par rapport à la période précédente.
- Courbe d'évolution sur 7 jours, 30 jours, 90 jours ou 12 mois (regroupée par semaine au-delà de 90 jours).
- Répartition par appareil, système, navigateur, pays et ville.
- Scans par heure et **carte de chaleur jour × heure**.
- Flux d'activité récente, classement des QR les plus scannés et **export CSV** prêt pour Excel (BOM UTF-8, séparateur `;`, protection contre l'injection de formules).
- **Vie privée** : aucune IP n'est stockée. Seule une empreinte salée, renouvelée chaque jour, est conservée. Les robots et aperçus de liens sont exclus.

### Compte et interface
- Inscription et connexion par email et mot de passe (Better Auth). Les sessions sont sécurisées, les redirections `next` vérifiées.
- Paramètres : profil, thème, changement de mot de passe (avec déconnexion des autres sessions), suppression du compte.
- Interface en français, **modes clair et sombre**, responsive du mobile au grand écran, animations sobres qui respectent `prefers-reduced-motion`.
- SEO : métadonnées, image Open Graph générée, `sitemap.xml`, `robots.txt`, manifeste PWA.

## Stack

| Domaine | Choix |
|---|---|
| Framework | Next.js 16 (App Router, Server Components, Server Actions, `proxy.ts`) |
| UI | React 19, Tailwind CSS 4, shadcn/ui (Radix), lucide, motion |
| Données | Drizzle ORM sur **libSQL** : SQLite en local, **Turso** en production |
| Auth | Better Auth (adaptateur Drizzle) |
| QR | `qr-code-styling` (rendu SVG), cadres composés en SVG, `jspdf` pour le PDF |
| Graphiques | Recharts via `components/ui/chart`, palette validée pour le daltonisme et le contraste |

## Démarrage

Prérequis : Node.js 20.12 ou plus récent.

```bash
npm install
cp .env.example .env.local      # puis renseignez BETTER_AUTH_SECRET
npm run dev                     # applique les migrations puis lance http://localhost:3000
```

Pour générer un secret :

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Données de démonstration

```bash
npm run db:seed
```

Cette commande crée un compte de démo avec 9 QR codes et environ 2 500 scans répartis sur 90 jours. Les identifiants sont dans l'en-tête de [`scripts/seed.ts`](scripts/seed.ts). La commande est idempotente : le compte de démo est recréé à chaque exécution.

### Scripts

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur de développement (migrations automatiques) |
| `npm run build` | Migrations puis build de production |
| `npm run lint` / `npm run typecheck` | ESLint et TypeScript strict |
| `npm run db:generate` | Génère une migration après modification de `src/lib/db/schema.ts` |
| `npm run db:migrate` | Applique les migrations |
| `npm run db:studio` | Explorateur de base Drizzle Studio |

## Déploiement (Vercel + Turso)

1. Dans le projet Vercel, ouvrez **Storage → Marketplace → Turso** et créez une base. L'intégration injecte `TURSO_DATABASE_URL` et `TURSO_AUTH_TOKEN`, reconnues automatiquement. Vous pouvez aussi définir vous-même `DATABASE_URL` et `DATABASE_AUTH_TOKEN`.
2. Ajoutez `BETTER_AUTH_SECRET`, une valeur aléatoire de 32 octets ou plus. `NEXT_PUBLIC_APP_URL` est facultative : sans elle, l'URL de production Vercel est utilisée. Si vous avez un domaine personnalisé, renseignez-le ici, car c'est cette URL qui est encodée dans les QR dynamiques.
3. Déployez. Le build applique les migrations. Sur Vercel, il échoue volontairement si aucune base distante n'est configurée.

> ⚠️ Le système de fichiers de Vercel est éphémère : une base fichier `file:` ne convient qu'au développement local.

La géolocalisation des scans s'appuie sur les en-têtes `x-vercel-ip-country` et `x-vercel-ip-city`, ou sur leurs équivalents Cloudflare. En local, le pays apparaît donc comme « Inconnu ».

## Architecture

```
src/
├── app/
│   ├── (marketing)/        Landing, générateur public, pages légales
│   ├── (auth)/             Connexion et inscription
│   ├── dashboard/          Vue d'ensemble, QR codes, détail + analytique, édition, paramètres
│   ├── r/[code]/           Redirection des QR dynamiques + enregistrement du scan
│   ├── p/[code]/           Pages mobiles (vCard, Wi-Fi, événement…) + téléchargements .vcf/.ics
│   └── api/                Better Auth, export CSV
├── components/
│   ├── editor/             Éditeur : types, formulaires, design, lisibilité
│   ├── analytics/          Tuiles, graphiques, classements
│   ├── dashboard/          Barre latérale, liste, actions
│   └── qr/                 Rendu QR (<img> isolée) et panneau d'export
├── lib/
│   ├── qr/                 Contenus (zod + encodage), design, rendu et exports
│   ├── server/             Service QR, suivi des scans, requêtes analytiques
│   ├── db/                 Schéma Drizzle et client libSQL
│   ├── auth/               Configuration Better Auth (serveur et client)
│   └── actions.ts          Server Actions authentifiées
└── proxy.ts                Protection optimiste des routes /dashboard
```

Quelques choix notables :
- Le SVG des QR codes est affiché dans une `<img>` (URL blob), ce qui isole ses identifiants internes (dégradés, masques). Des dizaines de vignettes peuvent ainsi cohabiter sur une page sans conflit.
- Chaque action serveur revérifie la session et la propriété de la ressource, et revalide ses entrées avec zod.
- Les dates d'événement sont des heures « murales », encodées en heure flottante iCalendar.

## Licence

© UNIVERS10. Tous droits réservés.

# Documentation des Fonctionnalités - QR Creator

## Vue d'ensemble

QR Creator est une application web complète de création et de gestion de codes QR. Elle permet aux utilisateurs de créer, personnaliser, gérer et suivre des codes QR de manière intuitive et professionnelle.

---

## 1. Page d'Accueil (Landing Page)

### 1.1 En-tête (Header)
- **Logo et nom de l'application** : "QR Creator" avec icône QR code
- **Navigation principale** :
  - Lien vers "Tableau de bord"
  - Lien vers page de connexion (si implémenté)

### 1.2 Section Héro
- **Titre principal** : Message accrocheur sur la création de QR codes
- **Sous-titre** : Description des avantages de l'application
- **Call-to-Action** : Bouton "Créer un QR code" menant à `/create`
- **Image/Illustration** : Représentation visuelle des QR codes

### 1.3 Fonctionnalités principales
- **Présentation des types de QR codes** :
  - URL
  - Texte
  - Email
  - Téléphone
  - SMS
  - Wi-Fi
- **Avantages clés** :
  - Création rapide et facile
  - Personnalisation avancée
  - Suivi des statistiques (pour QR codes dynamiques)
  - Téléchargement en plusieurs formats

### 1.4 Section de démonstration
- **Exemple de QR code** : Aperçu d'un QR code personnalisé
- **Options de personnalisation** : Showcase des possibilités de design

### 1.5 Pied de page (Footer)
- **Logo et nom**
- **Copyright** : "© 2025 QR Creator | UNIVERS10. Tous droits réservés."
- **Liens légaux** :
  - Conditions d'utilisation
  - Politique de confidentialité

---

## 2. Création de QR Code (`/create`)

### 2.1 Navigation
- **Bouton retour** : Retour à la page d'accueil
- **Logo cliquable** : Retour à l'accueil
- **Lien "Tableau de bord"** : Accès rapide au dashboard

### 2.2 Section de configuration

#### 2.2.1 Type de QR code
- **Sélection par onglets** :
  - URL : Pour liens web
  - Texte : Pour texte simple
  - Email : Pour adresse email avec sujet et corps optionnels
  - Téléphone : Pour numéro de téléphone
  - SMS : Pour numéro avec message optionnel
  - Wi-Fi : Pour connexion réseau avec SSID, mot de passe et type de sécurité

#### 2.2.2 Champs de contenu
- **Champ principal** : Input pour le contenu selon le type sélectionné
  - Validation en temps réel
  - Placeholder adapté au type
  - Message d'erreur si format incorrect

- **Champs additionnels** (selon le type) :
  - **Email** : Sujet et corps du message
  - **SMS** : Message optionnel
  - **Wi-Fi** : Mot de passe et type de sécurité (WPA/WPA2, WEP, Aucun)

#### 2.2.3 Type de QR code (Statique/Dynamique)
- **Radio buttons** :
  - **Statique** : Contenu fixe, non modifiable après création
  - **Dynamique** : Contenu modifiable, avec suivi des scans

### 2.3 Personnalisation

#### 2.3.1 Onglet Couleurs
- **Couleur des points** : Sélecteur de couleur pour les modules du QR code
- **Couleur de fond** : Sélecteur de couleur pour l'arrière-plan
- **Couleur des coins carrés** : Couleur des trois carrés de positionnement
- **Couleur des points de coin** : Couleur des points centraux des carrés de positionnement

#### 2.3.2 Onglet Style
- **Style des points** :
  - Carré (par défaut)
  - Rond
  - Arrondi
  - Élégant
  - Élégant arrondi

- **Style des coins carrés** :
  - Carré (par défaut)
  - Rond
  - Extra arrondi

- **Style des points de coin** :
  - Carré (par défaut)
  - Rond

#### 2.3.3 Onglet Logo
- **Upload de logo** :
  - Sélection de fichier image (PNG, JPG, SVG)
  - Prévisualisation du logo
  - Ajustement de la taille :
    - Largeur : 20-150 pixels
    - Hauteur : 20-150 pixels
  - Positionnement automatique au centre du QR code

### 2.4 Aperçu en temps réel
- **Canvas interactif** : Affichage du QR code avec toutes les personnalisations appliquées
- **Mise à jour instantanée** : Changements reflétés immédiatement

### 2.5 Téléchargement et partage

#### 2.5.1 Options de téléchargement
- **Format** :
  - PNG (par défaut)
  - SVG
  - JPEG
  - PDF

- **Taille** :
  - 500 x 500 px
  - 1000 x 1000 px (par défaut)
  - 2000 x 2000 px

- **Bouton "Télécharger"** :
  - Génération du fichier selon les paramètres choisis
  - Téléchargement automatique du fichier

#### 2.5.2 Options de partage
- **Bouton "Partager"** :
  - Utilisation de l'API Web Share (si disponible)
  - Copie du lien de scan dans le presse-papiers (fallback)
  - Toast de confirmation

### 2.6 Sauvegarde
- **Bouton "Sauvegarder"** :
  - Génération automatique du nom (basé sur l'URL ou la date)
  - Stockage dans localStorage
  - Redirection vers le tableau de bord
  - Toast de confirmation
  - Désactivé si contenu vide

---

## 3. Tableau de bord (`/dashboard`)

### 3.1 En-tête
- **Logo et nom** : Cliquable pour retour à l'accueil
- **Barre de recherche** :
  - Recherche par nom, type ou contenu de QR code
  - Filtrage en temps réel
- **Bouton "Accueil"** : Retour à la landing page

### 3.2 Titre et actions
- **Titre principal** : "Tableau de bord"
- **Bouton "Créer un QR code"** : Accès rapide à `/create`

### 3.3 Statistiques globales

#### 3.3.1 Carte "Total QR codes"
- Nombre total de QR codes créés
- Description : "Tous vos QR codes"

#### 3.3.2 Carte "Total scans"
- Somme de tous les scans (QR codes dynamiques uniquement)
- Description : "Tous QR codes confondus"

#### 3.3.3 Carte "QR codes dynamiques"
- Nombre de QR codes dynamiques
- Ratio par rapport au total

### 3.4 Options d'affichage
- **Toggle vue grille/liste** :
  - **Mode grille** : Cartes avec aperçu visuel
  - **Mode liste** : Tableau avec informations condensées

### 3.5 Onglets de filtrage

#### 3.5.1 Onglet "Tous"
- Affichage de tous les QR codes
- Ordre : Plus récents en premier (par défaut)

#### 3.5.2 Onglet "Dynamiques"
- Filtrage des QR codes dynamiques uniquement
- Affichage du nombre de scans

#### 3.5.3 Onglet "Statiques"
- Filtrage des QR codes statiques uniquement

#### 3.5.4 Onglet "Récents"
- Affichage des 6 QR codes les plus récents
- Tri par date de création décroissante

### 3.6 Affichage des QR codes

#### 3.6.1 Mode Grille
Pour chaque QR code :
- **Carte avec** :
  - Nom du QR code (titre)
  - Type et nature (ex: "url • Statique")
  - Aperçu visuel du QR code (image)
  - Date de création
  - Nombre de scans (si dynamique)
  - Menu d'actions (trois points)

#### 3.6.2 Mode Liste
- **Tableau avec colonnes** :
  - Nom (avec miniature et badge Statique/Dynamique)
  - Type
  - Date de création
  - Scans (ou "-" si statique)
  - Actions (boutons d'icônes)

### 3.7 Actions sur les QR codes

#### 3.7.1 Menu déroulant (ou boutons directs)
- **Modifier** :
  - Redirection vers `/edit/[id]`
  - Icône : Crayon

- **Télécharger** :
  - Téléchargement de l'image PNG du QR code
  - Nom de fichier basé sur le nom du QR code
  - Toast de confirmation
  - Icône : Télécharger

- **Partager** :
  - Utilisation de l'API Web Share ou copie du lien
  - Lien de scan : `/scan/[id]`
  - Toast de confirmation
  - Icône : Partager

- **Supprimer** :
  - Suppression du QR code du localStorage
  - Mise à jour de la liste
  - Toast de confirmation
  - Texte en rouge
  - Icône : Corbeille

### 3.8 États vides
- **Aucun QR code** : Message et bouton "Créer un QR code"
- **Aucun résultat de recherche** : Message "Aucun QR code trouvé"
- **Aucun QR code dynamique** : Message et bouton "Créer un QR code dynamique"
- **Aucun QR code statique** : Message et bouton "Créer un QR code statique"
- **Aucun QR code récent** : Message et bouton "Créer un QR code"

---

## 4. Édition de QR Code (`/edit/[id]`)

### 4.1 Navigation
- **Bouton retour** : Retour au tableau de bord
- **Logo cliquable** : Retour à l'accueil
- **Bouton "Enregistrer"** : Sauvegarde des modifications (en-tête)

### 4.2 Titre
- "Modifier le QR code"

### 4.3 Informations générales

#### 4.3.1 Nom du QR code
- **Champ modifiable** : Input pour changer le nom
- Sauvegardé lors de la modification

#### 4.3.2 Type de QR code
- **Affichage en lecture seule** : Texte avec type et nature (Statique/Dynamique)
- Non modifiable après création

#### 4.3.3 Contenu
- **Champ modifiable** : Input pour changer le contenu
- Validation selon le type de QR code
- Champs additionnels selon le type (comme dans la création)

### 4.4 Personnalisation
- **Onglets identiques à la création** :
  - Couleurs
  - Style
  - Logo
- Valeurs pré-remplies avec les données existantes

### 4.5 Aperçu en temps réel
- Identique à la page de création
- Mise à jour instantanée des modifications

### 4.6 Statistiques (si dynamique)
- **Carte "Statistiques"** :
  - Affichage du nombre de scans
  - Lien potentiel vers la page de statistiques détaillées

### 4.7 Sauvegarde
- **Bouton "Enregistrer"** (en-tête et/ou en bas) :
  - Mise à jour du QR code dans localStorage
  - Ajout d'un timestamp `updatedAt`
  - Redirection vers le tableau de bord
  - Toast de confirmation

---

## 5. Scan de QR Code (`/scan/[id]`)

### 5.1 Fonctionnement
- **Page de redirection automatique**
- Pas d'interface utilisateur visible (sauf message de chargement)

### 5.2 Processus

#### 5.2.1 Chargement
- Récupération du QR code par ID depuis localStorage
- Affichage temporaire : "Redirection en cours..."

#### 5.2.2 Vérification
- Si QR code non trouvé : Redirection vers la page d'accueil

#### 5.2.3 Enregistrement du scan (si dynamique)
- Incrémentation du compteur de scans dans localStorage
- Mise à jour immédiate

#### 5.2.4 Redirection
- **Si type "url"** : Redirection vers l'URL contenue (window.location.href)
- **Si autre type** : Redirection vers `/content/[id]` pour affichage du contenu

---

## 6. Affichage du Contenu (`/content/[id]`)

### 6.1 Navigation
- **Bouton retour** : Retour au tableau de bord
- **Logo cliquable** : Retour à l'accueil

### 6.2 Affichage du contenu

#### 6.2.1 Titre
- Nom du QR code

#### 6.2.2 Informations
- Type de QR code
- Nature (Statique/Dynamique)

#### 6.2.3 Contenu principal
- Affichage formaté selon le type :
  - **Texte** : Affichage direct du texte
  - **Email** : Lien mailto: avec sujet et corps si fournis
  - **Téléphone** : Lien tel: pour appel direct
  - **SMS** : Lien sms: avec message si fourni
  - **Wi-Fi** : Instructions de connexion et informations du réseau

### 6.3 Actions
- **Bouton "Copier"** : Copie du contenu dans le presse-papiers
- **Bouton "Partager"** : Partage du lien de scan

---

## 7. Statistiques Détaillées (`/stats/[id]`)

### 7.1 Navigation
- **Bouton retour** : Retour au tableau de bord
- **Logo cliquable** : Retour à l'accueil

### 7.2 En-tête de la page

#### 7.2.1 Titre et informations
- Titre : "Statistiques"
- Sous-titre : Nom du QR code et ID

#### 7.2.2 Contrôles
- **Sélecteur de période** :
  - 7 derniers jours (par défaut)
  - 30 derniers jours
  - 90 derniers jours
  - Cette année
  - Tout le temps

- **Bouton "Exporter"** :
  - Export des données (CSV, PDF)

### 7.3 Cartes de statistiques globales

#### 7.3.1 Total scans
- Nombre total de scans
- Pourcentage de variation par rapport à la période précédente

#### 7.3.2 Scans uniques
- Estimation des scans uniques (76% du total pour simulation)
- Pourcentage de variation

#### 7.3.3 Scans aujourd'hui
- Nombre de scans du jour
- Variation par rapport à hier

#### 7.3.4 Taux de conversion
- Pourcentage de conversion (simulé à 24.8%)
- Variation par rapport à la période précédente

### 7.4 Onglets d'analyse

#### 7.4.1 Vue d'ensemble
- **Graphique linéaire** : Scans quotidiens
  - Axe X : Dates
  - Axe Y : Nombre de scans
  - Période : Selon sélection
  - Type : Ligne avec courbe lissée

#### 7.4.2 Appareils
- **Graphique à barres** : Répartition par type d'appareil
  - Mobile
  - Desktop
  - Tablet
  - Affichage horizontal

#### 7.4.3 Localisations
- **Graphique à barres horizontales** : Scans par pays
  - Top 5 des pays
  - Catégorie "Autres" pour le reste
  - Données géolocalisées (simulées)

#### 7.4.4 Heures
- **Graphique à barres** : Scans par tranche horaire
  - Tranches de 2 heures
  - Identification des heures de pointe

### 7.5 Données simulées
Note : Actuellement, les statistiques détaillées utilisent des données fictives pour la démonstration. Les fonctionnalités suivantes sont prévues pour l'implémentation réelle :
- Tracking réel des scans avec timestamp
- Détection du type d'appareil (user-agent)
- Géolocalisation par IP
- Enregistrement de l'heure de scan

---

## 8. Gestion du Stockage (localStorage)

### 8.1 Structure de données

#### 8.1.1 Clé de stockage
- **Clé principale** : `qr_codes`
- Format : Tableau JSON d'objets QRCodeData

#### 8.1.2 Structure d'un QR code
\`\`\`typescript
interface QRCodeData {
  id: string                    // ID unique généré
  name: string                  // Nom du QR code
  type: string                  // Type: url, text, email, phone, sms, wifi
  content: string               // Contenu principal
  isDynamic: boolean            // Statique ou dynamique
  foregroundColor: string       // Couleur des points (hex)
  backgroundColor: string       // Couleur de fond (hex)
  cornerSquareColor: string     // Couleur des coins carrés (hex)
  cornerDotColor: string        // Couleur des points de coin (hex)
  logoImage?: string            // Logo en base64 (optionnel)
  logoWidth: number             // Largeur du logo
  logoHeight: number            // Hauteur du logo
  dotStyle: string              // Style des points
  cornerSquareStyle: string     // Style des coins carrés
  cornerDotStyle: string        // Style des points de coin
  createdAt: string             // Date de création (ISO)
  updatedAt?: string            // Date de modification (ISO)
  scans: number                 // Nombre de scans (dynamiques)
}
\`\`\`

### 8.2 Opérations CRUD

#### 8.2.1 Create (createQRCode)
- Génération d'un ID unique
- Ajout du timestamp de création
- Initialisation du compteur de scans à 0
- Ajout au tableau et sauvegarde

#### 8.2.2 Read (getQRCodes, getQRCodeById)
- Récupération de tous les QR codes ou d'un seul par ID
- Parsing du JSON
- Gestion des erreurs si données corrompues

#### 8.2.3 Update (updateQRCode)
- Recherche du QR code par ID
- Fusion des données existantes avec les nouvelles
- Ajout du timestamp de mise à jour
- Sauvegarde

#### 8.2.4 Delete (deleteQRCode)
- Filtrage du tableau pour retirer le QR code
- Sauvegarde du tableau mis à jour
- Confirmation de la suppression

### 8.3 Fonctions utilitaires

#### 8.3.1 generateId()
- Génération d'un ID aléatoire unique
- Combinaison de deux chaînes aléatoires base36

#### 8.3.2 recordScan(id)
- Incrémentation du compteur de scans pour un QR code dynamique
- Mise à jour dans localStorage

#### 8.3.3 initializeStorage()
- Initialisation du localStorage si vide
- Création du tableau vide initial

### 8.4 Migration de données
- Vérification de l'ancienne clé `qrCodes`
- Migration automatique vers `qr_codes`
- Conservation de toutes les données existantes

---

## 9. Composants Réutilisables

### 9.1 QRCodePreview
- **Props** : qrData (toutes les propriétés du QR code)
- **Fonctionnalités** :
  - Génération du QR code avec la librairie qrcode.react
  - Application des couleurs personnalisées
  - Application des styles de points et coins
  - Intégration du logo (si fourni)
  - Rendu sur canvas

### 9.2 ColorPicker
- **Props** :
  - color : Couleur actuelle (hex)
  - onChange : Callback de changement
- **Fonctionnalités** :
  - Sélecteur de couleur natif (input type="color")
  - Affichage de la couleur sélectionnée
  - Preview en temps réel

### 9.3 Toast/Notification
- **Fonctionnalités** :
  - Notifications de succès (vert)
  - Notifications d'erreur (rouge)
  - Notifications d'information (bleu)
  - Auto-disparition après 3-5 secondes
  - Possibilité de fermeture manuelle

---

## 10. Fonctionnalités Techniques

### 10.1 Responsiveness
- **Design responsive** :
  - Mobile first
  - Breakpoints : sm (640px), md (768px), lg (1024px)
  - Navigation adaptée sur mobile
  - Grille responsive (1 colonne mobile, 2-3 desktop)
  - Tableaux scrollables sur mobile

### 10.2 Accessibilité
- **Labels** : Tous les champs ont des labels associés
- **Alt text** : Toutes les images ont un texte alternatif
- **Contraste** : Respect des ratios de contraste WCAG
- **Navigation au clavier** : Tous les éléments interactifs sont accessibles
- **ARIA labels** : Utilisation appropriée des attributs ARIA

### 10.3 Performance
- **Lazy loading** : Images chargées à la demande
- **Optimisation des images** : Compression et formats adaptés
- **Code splitting** : Chargement des pages à la demande (Next.js)
- **Memoization** : Utilisation de React.memo pour composants purs

### 10.4 Sécurité
- **Validation côté client** : Vérification des formats de données
- **Échappement XSS** : Sanitisation des inputs utilisateur
- **LocalStorage** : Stockage local sécurisé (pas de données sensibles)

### 10.5 SEO
- **Titres de pages** : Titres descriptifs et uniques
- **Meta descriptions** : Descriptions pour chaque page
- **Structure HTML sémantique** : Utilisation correcte des balises

---

## 11. Fonctionnalités Futures (Prévues)

### 11.1 Authentification
- Création de compte utilisateur
- Connexion/Déconnexion
- Gestion de profil
- Synchronisation cloud des QR codes

### 11.2 Analytics avancés
- Tracking réel des scans avec détails :
  - Géolocalisation précise
  - Type d'appareil détecté
  - Système d'exploitation
  - Navigateur
  - Heure exacte
- Graphiques avancés et insights

### 11.3 Fonctionnalités premium
- QR codes en batch
- Templates de QR codes
- API pour intégration
- Exports avancés (SVG vectoriel, EPS)
- Retargeting marketing

### 11.4 Collaboration
- Partage de QR codes entre utilisateurs
- Équipes et espaces de travail
- Permissions et rôles

### 11.5 Intégrations
- Zapier
- Google Analytics
- CRM (Salesforce, HubSpot)
- Réseaux sociaux

---

## 12. Technologies Utilisées

### 12.1 Frontend
- **Framework** : Next.js 14 (App Router)
- **Langage** : TypeScript
- **UI Library** : React 18
- **Styling** : Tailwind CSS
- **Composants** : shadcn/ui
- **Icônes** : Lucide React
- **QR Code Generation** : qrcode.react
- **Graphiques** : Recharts

### 12.2 Stockage
- **Client-side** : localStorage (API Web)
- **Futur** : Base de données cloud (Supabase/Firebase)

### 12.3 Build & Deploy
- **Build** : Next.js
- **Hosting** : Vercel (recommandé)
- **Git** : GitHub

---

## 13. Gestion des Erreurs

### 13.1 Erreurs utilisateur
- **Champs vides** : Message "Veuillez remplir le contenu du QR code"
- **Format incorrect** : Validation en temps réel avec messages d'erreur
- **QR code non trouvé** : Redirection avec toast d'erreur

### 13.2 Erreurs système
- **localStorage plein** : Message d'erreur et suggestions
- **Données corrompues** : Réinitialisation avec confirmation
- **Erreurs de génération** : Message d'erreur et options de retry

### 13.3 Fallbacks
- **API Web Share non disponible** : Copie du lien dans le presse-papiers
- **Image non chargée** : Placeholder avec icône QR code
- **Pas de données** : États vides avec CTAs

---

## 14. Performance et Limites

### 14.1 Limites localStorage
- **Taille maximale** : ~5-10 MB selon le navigateur
- **Nombre recommandé de QR codes** : < 100 pour performances optimales
- **Taille des logos** : Recommandé < 200 KB

### 14.2 Optimisations
- **Compression des images** : Logos convertis en base64 optimisé
- **Lazy loading** : Chargement différé des QR codes
- **Pagination** : Prévue pour grande quantité de QR codes

---

## 15. Support et Compatibilité

### 15.1 Navigateurs supportés
- **Chrome** : Version 90+
- **Firefox** : Version 88+
- **Safari** : Version 14+
- **Edge** : Version 90+

### 15.2 Appareils
- **Desktop** : Windows, macOS, Linux
- **Mobile** : iOS 13+, Android 8+
- **Tablette** : iPad, Android tablets

### 15.3 Features non supportées sur certains navigateurs
- **Web Share API** : Fallback sur copie du lien
- **localStorage** : Mode privé peut limiter l'accès

---

## Conclusion

QR Creator offre une solution complète et intuitive pour la création, la personnalisation et la gestion de codes QR. L'application combine simplicité d'utilisation et fonctionnalités avancées, tout en restant performante et accessible.

Cette documentation décrit l'état actuel de l'application ainsi que les fonctionnalités prévues pour les versions futures. Le développement continue avec un focus sur l'expérience utilisateur et l'ajout de fonctionnalités demandées par la communauté.

---

**Version** : 1.0  
**Dernière mise à jour** : 1er Octobre 2024  
**Développé par** : UNIVERS10

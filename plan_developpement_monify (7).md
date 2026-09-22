# Plan de Développement — MONIFY

**Plateforme intelligente d'optimisation et de pilotage financier personnel destinée aux petits commerçants**

Ce document découpe le développement de Monify en phases successives, chacune livrant un incrément fonctionnel testable. Il s'appuie sur le cahier des charges (besoins fonctionnels, besoins non fonctionnels, choix technologiques) et sur les diagrammes UML déjà réalisés (diagramme de classes, diagramme de séquence « Enregistrer une dépense »).

---

## 1. Vue d'ensemble

| Élément | Choix retenu (issu du cahier des charges) |
|---|---|
| Frontend | React native(SPA), HTML/CSS, responsive (Media Queries) |
| Backend | Node.js / Express.js |
| Base de données | MySQL |
| Authentification | JWT (JSON Web Token) |
| Architecture | MVC (Model — Vue — Contrôleur), API REST |
|
| Acteurs | Visiteur, Utilisateur (commerçant), Administrateur|

### Principe MVC appliqué au projet

- **Model** : couche d'accès aux données MySQL (Sequelize/Prisma ou requêtes SQL natives). Un fichier modèle par entité du diagramme de classes : `User`, `Compte`, `Transaction` (base commune à `Depense`/`Revenu`), `Categorie`, `Budget`, `Notification`, `RapportFinancier`.
- **Contrôleur** : logique métier côté Express (`controllers/`). Reçoit les requêtes des routes, appelle les modèles, applique les règles de gestion (calcul de solde, catégorisation, déclenchement d'alertes, etc.), renvoie une réponse JSON.
- **Vue** : côté React (`views`/`pages`/`components`), consommée via l'API REST. Dans une architecture mobile découplée, la « vue » MVC classique est portée par le frontend React native qui consomme les données exposées par le contrôleur.

### Arborescence cible du backend

```
monify-backend/
├── config/          # connexion MySQL, variables d'environnement, config JWT
├── models/          # User, Compte, Transaction, Depense, Revenu, Categorie, Notification, RapportFinancier
├── controllers/      # authController, transactionController, categorieController, dashboardController, iaController, adminController
├── routes/           # authRoutes, transactionRoutes, categorieRoutes, dashboardRoutes, notificationRoutes, adminRoutes
├── middlewares/       # authMiddleware (JWT), roleMiddleware, errorHandler, validation
├── services/         
├── utils/              # helpers (formatage montants, dates, réponses standardisées)
└── server.js
```

### Arborescence cible du frontend

```
monify-frontend/
├── src/
│   ├── api/            # appels axios/fetch vers l'API REST
│   ├── components/      # composants réutilisables (formulaires, cartes, graphiques)
│   ├── pages/            # Login, Register, Dashboard, Transactions, Rapports, Admin
│   ├── context/           # AuthContext (JWT, utilisateur connecté)
│   ├── hooks/
│   └── styles/
```

---

## 2. Modèle de données (Model) — récapitulatif

D'après le diagramme de classes déjà établi :

- **Utilisateur** (id, nom, email, motDePasse, rôle)
- **Compte** (solde, lié à un Utilisateur)
- **Transaction** (id, montant, date, modeDePaiement, description) — classe mère de :
  - **Depense**
  - **Revenu**
- **Categorie** (nom, type) — liée aux transactions
- 
- **Notification** (type, message, date, statut lu/non lu)
- **RapportFinancier** (période, contenu généré)

Ce modèle sert de base directe aux tables MySQL et aux fichiers `models/` du backend.

---

## 3. Phasage du développement

Chaque phase est autonome et livre un résultat observable (endpoints testables via Postman, écran fonctionnel dans l'interface). L'ordre suit la logique de dépendance : on ne peut pas gérer de transactions sans authentification, ni afficher de statistiques sans transactions enregistrées.

### Phase 0 — Initialisation du projet
**Objectif** : poser les fondations techniques avant tout développement fonctionnel.

- Créer les dépôts backend et frontend.
- Initialiser Node.js/Express et la structure MVC (`models/`, `controllers/`, `routes/`, `middlewares/`).
- Configurer la connexion à MySQL (fichier `config/db.js`) et créer la base `monify_db`.
- Initialiser le projet React (Vite ou CRA) avec le routeur (`react-router-dom`).
- Mettre en place les variables d'environnement (`.env` : port, secret JWT, identifiants MySQL).
- Configurer un dépôt Git avec branches (`main`, `develop`).

**Livrable / critère de validation** : le serveur Express répond sur une route `GET /api/health`, l'application React s'affiche dans le navigateur, la connexion MySQL est confirmée en console.

---

### Phase 1 — Authentification et gestion des utilisateurs
**Objectif** : couvrir les besoins « s'inscrire », « se connecter », « gérer son profil ».

**Model**
- Table/modèle `Utilisateur` (nom, email, motDePasse, rôle : utilisateur/administrateur).

**Contrôleur**
- `authController` : `register`, `login` (génération JWT), `getProfile`, `updateProfile`.
- `authMiddleware` : vérification du token JWT sur les routes protégées.
- Hashage des mots de passe (bcrypt).

**Vue (React native)**
- Pages : Inscription, Connexion, Profil (modification des informations personnelles).
- `AuthContext` pour stocker le token et l'utilisateur courant.

**Livrable / critère de validation** : un utilisateur peut créer un compte, se connecter et recevoir un token JWT, consulter/modifier son profil ; les routes protégées rejettent les requêtes sans token valide.

---

### Phase 2 — Gestion des transactions (revenus et dépenses)
**Objectif** : cœur métier de l'application — enregistrer, modifier, supprimer, consulter les transactions.

**Model**
- Modèles `Transaction`, `Depense`, `Revenu`, `Categorie`, `Compte` (mise à jour du solde à chaque opération).

**Contrôleur**
- `transactionController` : `createTransaction` (revenu ou dépense), `updateTransaction`, `deleteTransaction`, `getTransactions` (avec recherche et filtres par date/catégorie/montant).
- `categorieController` : CRUD des catégories (accessible utilisateur pour la consultation, administrateur pour la gestion complète).
- Mise à jour automatique du solde du `Compte` à chaque création/suppression de transaction.

**Vue (React native)**
- Formulaire « Enregistrer un revenu / une dépense » (avec sélection du mode de paiement et de la catégorie).
- Liste des transactions avec recherche et filtres.
- Actions de modification/suppression.

**Livrable / critère de validation** : un utilisateur enregistre une dépense et un revenu, voit son solde se mettre à jour, retrouve, filtre, modifie et supprime une transaction — conforme au diagramme de séquence « Enregistrer une dépense » déjà réalisé.

---

### Phase 3 — Tableau de bord et consultation financière
**Objectif** : donner une vue globale et en temps réel de la situation financière (besoin non fonctionnel « suivi en temps réel »).

**Contrôleur**
- `dashboardController` : agrégation des données (solde courant, total revenus/dépenses sur une période, répartition par catégorie).

**Vue (React native)**
- Page Tableau de bord : solde, résumé des dernières transactions, indicateurs clés.
- Historique complet des opérations, consultable et filtrable.

**Livrable / critère de validation** : le tableau de bord affiche des données cohérentes avec les transactions enregistrées en phase 2, mise à jour après chaque nouvelle opération.

---

### Phase 4 — Analyse financière : statistiques, graphiques et rapports
**Objectif** : répondre aux besoins « consulter les statistiques et graphiques », « générer des rapports financiers ».

**Model**
- Modèle `RapportFinancier` (génération et stockage/export d'un rapport sur une période).

**Contrôleur**
- `dashboardController` (extension) ou `rapportController` : calcul des statistiques (évolution mensuelle, répartition par catégorie, comparaison revenus/dépenses), génération de rapports (PDF ou export structuré).

**Vue (React native)**
- Graphiques (bibliothèque type Chart.js ou Recharts) : évolution du solde, répartition des dépenses par catégorie.
- Bouton d'export/génération de rapport.

**Livrable / critère de validation** : les graphiques reflètent fidèlement les données réelles ; un rapport financier peut être généré et consulté pour une période donnée.

---


**Vue (React native)**
- Bloc « Recommandations » sur le tableau de bord.



### Phase 6 — Notifications et alertes
**Objectif** : couvrir le besoin « recevoir des notifications et des alertes ».

**Model**
- Modèle `Notification` (type, message, date, statut lu/non lu, utilisateur associé).

**Contrôleur**
- `notificationController` : création automatique de notifications (dépense inhabituelle détectée, rappel de suivi), marquage comme lue, listing.
- `notificationService` : règles de déclenchement (ex. dépense au-delà d'un seuil défini).

**Vue (React native)**
- Centre de notifications (icône + liste), badge de notifications non lues.

**Livrable / critère de validation** : une dépense dépassant un seuil déclenche automatiquement une notification visible par l'utilisateur.

---

### Phase 7 — Espace administrateur
**Objectif** : couvrir les besoins « gérer les comptes utilisateurs », « gérer les catégories », « consulter les statistiques générales ».

**Contrôleur**
- `adminController` : lister/consulter/modifier/activer/désactiver/supprimer des comptes utilisateurs, gestion complète des catégories, statistiques globales de la plateforme.
- `roleMiddleware` : restriction des routes admin au rôle « administrateur ».

**Vue (React)**
- Interface d'administration : gestion des utilisateurs, gestion des catégories, statistiques globales.

**Livrable / critère de validation** : un compte administrateur peut gérer les utilisateurs et les catégories ; ces actions sont inaccessibles à un utilisateur standard.

---

### Phase 8 — Sécurité, ergonomie et responsive design
**Objectif** : consolider les besoins non fonctionnels (sécurité, confidentialité, ergonomie, accessibilité multiplateforme).

- Renforcement de la validation des entrées (backend et frontend).
- Contrôle des accès par rôle sur toutes les routes sensibles.
- Vérification du responsive design (Media Queries) sur mobile, tablette.
- Revue de l'ergonomie de l'interface (navigation, cohérence visuelle avec la charte graphique).
- Mise en place de sauvegardes régulières de la base MySQL.

**Livrable / critère de validation** : l'application est utilisable sans dysfonctionnement majeur sur différents formats d'écran ; les tentatives d'accès non autorisé sont bloquées.

---

### Phase 9 — Tests et déploiement
**Objectif** : valider la conformité aux exigences avant mise en production.

- Tests fonctionnels de bout en bout pour chaque cas d'utilisation du cahier des charges.
- Tests des cas limites (transactions invalides, tentative d'accès non autorisé, etc.).
- Déploiement du backend et de la base de données (hébergement au choix).
- Déploiement du frontend.
- Vérification finale des besoins non fonctionnels (performance, disponibilité).

**Livrable / critère de validation** : l'application est accessible en ligne, l'ensemble des cas d'utilisation du cahier des charges fonctionne de bout en bout.

---

## 4. Suivi de l'avancement

Pour visualiser la progression, cocher chaque phase au fur et à mesure :

- [ ] Phase 0 — Initialisation du projet
- [ ] Phase 1 — Authentification et gestion des utilisateurs
- [ ] Phase 2 — Gestion des transactions
- [ ] Phase 3 — Tableau de bord
- [ ] Phase 4 — Statistiques et rapports
- [ ] Phase 6 — Notifications et alertes
- [ ] Phase 7 — Espace administrateur
- [x] Phase 8 — Sécurité et responsive design
- [ ] Phase 9 — Tests et déploiement

---

## 5. Correspondance avec le cahier des charges

| Besoin fonctionnel (cahier des charges) | Phase de développement |
|---|---|
| S'inscrire / se connecter, gérer son profil | Phase 1 |
| Enregistrer une vente/une dépense, préciser le mode de paiement | Phase 2 |
| Modifier, supprimer, consulter une transaction | Phase 2 |
| Rechercher et filtrer les transactions | Phase 2 |
| Consulter le tableau de bord, le solde | Phase 3 |
| Consulter statistiques et graphiques, générer des rapports | Phase 4 |
| Recevoir des notifications et alertes | Phase 6 |
| Gérer les comptes utilisateurs et les catégories (administrateur) | Phase 7 |
| Sécurité, ergonomie, accessibilité multiplateforme | Phase 8 |

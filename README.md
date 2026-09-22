# 🏪 Monify – Caisse & Gestion de Proximité

> **L'allié financier des commerçants africains** – Gérez vos ventes, dépenses et encaissements en FCFA simplement au quotidien.

---

## 📁 Structure du projet

```
monify/
├── backend/          # API Node.js / Express / MySQL
├── frontend/         # Application React (Vite)
└── database/         # Scripts SQL
```

---

## 🚀 Démarrage rapide

### Prérequis

| Outil | Version minimale |
|---|---|
| Node.js | v18+ |
| npm | v9+ |
| MySQL | v8.0+ |

---

### 1. Base de données

```bash
# Créer la base de données et les tables
mysql -u root -p < database/schema.sql
```

---

### 2. Backend (API Express)

```bash
cd backend

# Copier et configurer les variables d'environnement
cp .env.example .env
# → Ouvrez .env et remplissez DB_PASSWORD avec votre mot de passe MySQL

# Installer les dépendances
npm install

# Démarrer le serveur (développement avec rechargement automatique)
npm run dev
```

Le serveur démarre sur **http://localhost:5000**

Vérifier que tout fonctionne :
```
GET http://localhost:5000/api/health
```

---

### 3. Frontend (React / Vite)

```bash
cd frontend

# Installer les dépendances
npm install

# Démarrer l'application
npm run dev
```

L'application s'ouvre sur **http://localhost:5173**

---

## 🗂️ Phases de développement

| Phase | Contenu | Statut |
|---|---|---|
| **Phase 0** | Initialisation du projet | ✅ **En cours** |
| **Phase 1** | Authentification (Inscription / Connexion / JWT) | ⬜ À venir |
| **Phase 2** | Gestion des transactions (Ventes / Dépenses) | ⬜ À venir |
| **Phase 3** | Tableau de bord & consultation financière | ⬜ À venir |
| **Phase 4** | Statistiques, graphiques et rapports | ⬜ À venir |
| **Phase 6** | Notifications et alertes | ⬜ À venir |
| **Phase 7** | Espace administrateur | ⬜ À venir |
| **Phase 8** | Sécurité & responsive design | ⬜ À venir |
| **Phase 9** | Tests & déploiement | ⬜ À venir |

---

## 🛠️ Stack technique

### Backend
- **Runtime** : Node.js
- **Framework** : Express.js (architecture MVC)
- **Base de données** : MySQL 8 via `mysql2/promise`
- **Authentification** : JSON Web Tokens (`jsonwebtoken`) + `bcryptjs`
- **Variables d'env** : `dotenv`

### Frontend
- **Framework** : React 18 + Vite
- **Routing** : `react-router-dom` v6
- **Styles** : Vanilla CSS (Design System Monify)
- **Typographie** : Inter (Google Fonts)

---

## 🎨 Charte graphique Monify

| Élément | Valeur |
|---|---|
| Couleur primaire | `#C4622D` (marron orangé) |
| Couleur or | `#E8A838` |
| Devise | FCFA / XAF |
| Police | Inter (Google Fonts) |

---

## 📝 Variables d'environnement (backend)

| Variable | Description | Exemple |
|---|---|---|
| `PORT` | Port du serveur Express | `5000` |
| `DB_HOST` | Hôte MySQL | `localhost` |
| `DB_PORT` | Port MySQL | `3306` |
| `DB_USER` | Utilisateur MySQL | `root` |
| `DB_PASSWORD` | Mot de passe MySQL | `*****` |
| `DB_NAME` | Nom de la base | `monify_db` |
| `JWT_SECRET` | Clé secrète JWT | `change_me_in_prod` |
| `JWT_EXPIRES_IN` | Durée des tokens JWT | `7d` |

---

## 👥 Équipe

**Monify Technologies Inc.** – *Caisse & Gestion de proximité*

© 2025 Monify Technologies Inc.

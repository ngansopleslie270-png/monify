# I. Guide d'installation

Ce projet est une application mobile de finance (Monify), composée de :
* **Frontend** : Application mobile (React Native avec Expo).
* **Backend** : Node.js (API REST avec Express).
* **Base de données** : MySQL.

### Pré-requis :
Assurez-vous d'avoir les outils suivants installés :
* Node.js v18+ (recommandé)
* npm v9+
* Expo CLI : (optionnel, cmd : `npm install -g expo-cli`)
* MySQL 8+

---

### Installation du frontend (React Native / Expo)

1- Clonez le dépôt (si ce n'est pas déjà fait)
**cmd :** `git clone <URL_DU_DEPOT_MONIFY>`

2- Accédez au dossier du frontend
**cmd :** `cd monify/frontend`

3- Installez les dépendances
**cmd :** `npm install`

4- (Optionnel) Harmonisez les versions des paquets si vous rencontrez des conflits
**cmd :** `rm -rf node_modules package-lock.json` *(ou `rmdir /s /q node_modules` sous Windows)*
**cmd :** `npm install`

---

### Installation du backend (Node.js / Express)

1- Accédez au dossier backend
**cmd :** `cd ../backend`

2- Installez les dépendances
**cmd :** `npm install`

3- Configurez la base de données
Dans le dossier backend, créez un fichier `.env` (vous pouvez vous baser sur `.env.example`) et mettez ces infos :
* `PORT=5000`
* `NODE_ENV=development`
* `DB_HOST=localhost`
* `DB_PORT=3306`
* `DB_USER=monify_user`
* `DB_PASSWORD=your_password`
* `DB_NAME=monify_db`
* `JWT_SECRET=monify_super_secret_key_change_in_production`

4- Lancez l'API
**cmd :** `npm run dev` (mode développement avec rechargement automatique) ou `npm start`

L'API démarre sur `http://localhost:5000`

---

### Installation de la base de données MySQL

1- Créer un utilisateur et une base
Dans votre console MySQL (`mysql -u root -p`), exécutez les commandes SQL suivantes :

**Cmd SQL :**
* `CREATE DATABASE monify_db;`
* `CREATE USER 'monify_user'@'localhost' IDENTIFIED BY 'your_password';`
* `GRANT ALL PRIVILEGES ON monify_db.* TO 'monify_user'@'localhost';`
* `FLUSH PRIVILEGES;`

2- Vérifier la connexion
**cmd :** `mysql -u monify_user -p -D monify_db -h localhost`

---

### Lancement de l'application complète

**1- Lancer le backend Node.js (API) :**
Ouvrez un terminal, placez-vous dans le dossier `backend` et tapez :
**Cmd :** `npm run dev`

**2- Lancer le frontend React Native :**
Ouvrez un deuxième terminal, placez-vous dans le dossier `frontend` et tapez :
**Cmd :** `npm start` *(ou `npx expo start`)*

Vous pourrez ensuite scanner le QR code généré avec l'application "Expo Go" sur votre smartphone pour tester l'application Monify !

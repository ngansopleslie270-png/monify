const fs = require("fs");
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = require("docx");

const doc = new Document({
  creator: "Monify",
  title: "Guide d'installation Monify",
  description: "Guide d'installation pour le projet Monify",
  sections: [
    {
      properties: {},
      children: [
        new Paragraph({
          text: "I. Guide d'installation",
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        }),
        new Paragraph({
          children: [
            new TextRun("Ce projet est une application mobile de finance (Monify), composée de :"),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Frontend : ", bold: true }),
            new TextRun("Application mobile (React Native avec Expo)."),
          ],
          bullet: { level: 0 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Backend : ", bold: true }),
            new TextRun("Node.js (API REST avec Express)."),
          ],
          bullet: { level: 0 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Base de données : ", bold: true }),
            new TextRun("MySQL."),
          ],
          bullet: { level: 0 }
        }),
        new Paragraph({ text: "", spacing: { after: 200 } }),
        
        new Paragraph({
          text: "Pré-requis :",
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({
          text: "Assurez-vous d'avoir les outils suivants installés :",
        }),
        new Paragraph({ text: "Node.js v18+ (recommandé)", bullet: { level: 0 } }),
        new Paragraph({ text: "npm v9+", bullet: { level: 0 } }),
        new Paragraph({ text: "Expo CLI : (optionnel, cmd : npm install -g expo-cli)", bullet: { level: 0 } }),
        new Paragraph({ text: "MySQL 8+", bullet: { level: 0 } }),
        new Paragraph({ text: "", spacing: { after: 200 } }),
        
        new Paragraph({
          text: "Installation du frontend (React Native / Expo)",
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({ text: "1- Clonez le dépôt (si ce n'est pas déjà fait)" }),
        new Paragraph({
          children: [
            new TextRun({ text: "cmd : ", bold: true }),
            new TextRun("git clone <URL_DU_DEPOT_MONIFY>"),
          ],
        }),
        new Paragraph({ text: "2- Accédez au dossier du frontend", spacing: { before: 100 } }),
        new Paragraph({
          children: [
            new TextRun({ text: "cmd : ", bold: true }),
            new TextRun("cd monify/frontend"),
          ],
        }),
        new Paragraph({ text: "3- Installez les dépendances", spacing: { before: 100 } }),
        new Paragraph({
          children: [
            new TextRun({ text: "cmd : ", bold: true }),
            new TextRun("npm install"),
          ],
        }),
        new Paragraph({ text: "4- (Optionnel) Harmonisez les versions des paquets si vous rencontrez des conflits", spacing: { before: 100 } }),
        new Paragraph({
          children: [
            new TextRun({ text: "cmd : ", bold: true }),
            new TextRun("rm -rf node_modules package-lock.json (ou rmdir /s /q node_modules sous Windows)"),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "cmd : ", bold: true }),
            new TextRun("npm install"),
          ],
        }),
        new Paragraph({ text: "", spacing: { after: 200 } }),

        new Paragraph({
          text: "Installation du backend (Node.js / Express)",
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({ text: "1- Accédez au dossier backend" }),
        new Paragraph({
          children: [
            new TextRun({ text: "cmd : ", bold: true }),
            new TextRun("cd ../backend"),
          ],
        }),
        new Paragraph({ text: "2- Installez les dépendances", spacing: { before: 100 } }),
        new Paragraph({
          children: [
            new TextRun({ text: "cmd : ", bold: true }),
            new TextRun("npm install"),
          ],
        }),
        new Paragraph({ text: "3- Configurez la base de données", spacing: { before: 100 } }),
        new Paragraph({
          text: "Dans le dossier backend, créez un fichier .env (vous pouvez vous baser sur .env.example) et mettez ces infos :"
        }),
        new Paragraph({ text: "PORT=5000", bullet: { level: 0 } }),
        new Paragraph({ text: "NODE_ENV=development", bullet: { level: 0 } }),
        new Paragraph({ text: "DB_HOST=localhost", bullet: { level: 0 } }),
        new Paragraph({ text: "DB_PORT=3306", bullet: { level: 0 } }),
        new Paragraph({ text: "DB_USER=monify_user", bullet: { level: 0 } }),
        new Paragraph({ text: "DB_PASSWORD=your_password", bullet: { level: 0 } }),
        new Paragraph({ text: "DB_NAME=monify_db", bullet: { level: 0 } }),
        new Paragraph({ text: "JWT_SECRET=monify_super_secret_key_change_in_production", bullet: { level: 0 } }),
        new Paragraph({ text: "4- Lancez l'API", spacing: { before: 100 } }),
        new Paragraph({
          children: [
            new TextRun({ text: "cmd : ", bold: true }),
            new TextRun("npm run dev (mode développement avec rechargement automatique) ou npm start"),
          ],
        }),
        new Paragraph({ text: "L'API démarre sur http://localhost:5000" }),
        new Paragraph({ text: "", spacing: { after: 200 } }),

        new Paragraph({
          text: "Installation de la base de données MySQL",
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({ text: "1- Créer un utilisateur et une base" }),
        new Paragraph({ text: "Dans votre console MySQL (mysql -u root -p), exécutez les commandes SQL suivantes :" }),
        new Paragraph({
          children: [
            new TextRun({ text: "Cmd SQL :", bold: true }),
          ],
          spacing: { before: 100 }
        }),
        new Paragraph({ text: "CREATE DATABASE monify_db;", bullet: { level: 0 } }),
        new Paragraph({ text: "CREATE USER 'monify_user'@'localhost' IDENTIFIED BY 'your_password';", bullet: { level: 0 } }),
        new Paragraph({ text: "GRANT ALL PRIVILEGES ON monify_db.* TO 'monify_user'@'localhost';", bullet: { level: 0 } }),
        new Paragraph({ text: "FLUSH PRIVILEGES;", bullet: { level: 0 } }),
        new Paragraph({ text: "2- Vérifier la connexion", spacing: { before: 100 } }),
        new Paragraph({
          children: [
            new TextRun({ text: "cmd : ", bold: true }),
            new TextRun("mysql -u monify_user -p -D monify_db -h localhost"),
          ],
        }),
        new Paragraph({ text: "", spacing: { after: 200 } }),

        new Paragraph({
          text: "Lancement de l'application complète",
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "1- Lancer le backend Node.js (API) :", bold: true }),
          ],
        }),
        new Paragraph({ text: "Ouvrez un terminal, placez-vous dans le dossier backend et tapez :" }),
        new Paragraph({
          children: [
            new TextRun({ text: "Cmd : ", bold: true }),
            new TextRun("npm run dev"),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "2- Lancer le frontend React Native :", bold: true }),
          ],
          spacing: { before: 100 }
        }),
        new Paragraph({ text: "Ouvrez un deuxième terminal, placez-vous dans le dossier frontend et tapez :" }),
        new Paragraph({
          children: [
            new TextRun({ text: "Cmd : ", bold: true }),
            new TextRun("npm start (ou npx expo start)"),
          ],
        }),
        new Paragraph({ 
          text: "Vous pourrez ensuite scanner le QR code généré avec l'application 'Expo Go' sur votre smartphone pour tester l'application Monify !",
          spacing: { before: 100 }
        }),
      ],
    },
  ],
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync("Guide_Installation_Monify.docx", buffer);
  console.log("Document Guide_Installation_Monify.docx généré avec succès.");
});

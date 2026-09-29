const fs = require("fs");
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = require("docx");

const doc = new Document({
  creator: "Monify",
  title: "Webographie Monify",
  description: "Webographie pour le projet Monify",
  sections: [
    {
      properties: {},
      children: [
        new Paragraph({
          text: "WEBOGRAPHIE",
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Node.js Documentation Officielle. ", bold: true }),
            new TextRun({ text: "https://nodejs.org/fr/docs/", underline: { type: "single" }, color: "0000FF" }),
            new TextRun("\nEnvironnement d'exécution JavaScript côté serveur utilisé comme base pour construire l'architecture backend de l'application."),
          ],
          bullet: { level: 0 },
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Express.js Documentation. ", bold: true }),
            new TextRun({ text: "https://expressjs.com/fr/", underline: { type: "single" }, color: "0000FF" }),
            new TextRun("\nFramework web rapide, flexible et minimaliste pour Node.js, utilisé pour la conception et la gestion des routes de l'API RESTful de Monify."),
          ],
          bullet: { level: 0 },
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "MySQL Documentation. ", bold: true }),
            new TextRun({ text: "https://dev.mysql.com/doc/", underline: { type: "single" }, color: "0000FF" }),
            new TextRun("\nSystème de gestion de base de données relationnelle (SGBDR) utilisé pour gérer la persistance et les requêtes SQL complexes (utilisateurs, transactions, clôtures journalières)."),
          ],
          bullet: { level: 0 },
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "React Native Documentation. ", bold: true }),
            new TextRun({ text: "https://reactnative.dev/docs/getting-started", underline: { type: "single" }, color: "0000FF" }),
            new TextRun("\nFramework utilisé pour le développement de l'application mobile native (Android/iOS) à partir d'une base de code unique en JavaScript."),
          ],
          bullet: { level: 0 },
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Expo Documentation. ", bold: true }),
            new TextRun({ text: "https://docs.expo.dev/", underline: { type: "single" }, color: "0000FF" }),
            new TextRun("\nPlateforme et framework facilitant le développement, la compilation et le déploiement de l'application mobile React Native."),
          ],
          bullet: { level: 0 },
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Expo Router Documentation. ", bold: true }),
            new TextRun({ text: "https://docs.expo.dev/router/introduction/", underline: { type: "single" }, color: "0000FF" }),
            new TextRun("\nSystème de navigation basé sur l'arborescence des fichiers, utilisé pour gérer le routage entre les différents écrans de l'application (tableaux de bord, rapports, formulaires)."),
          ],
          bullet: { level: 0 },
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "JSON Web Token (JWT) Introduction. ", bold: true }),
            new TextRun({ text: "https://jwt.io/introduction", underline: { type: "single" }, color: "0000FF" }),
            new TextRun("\nStandard ouvert de sécurité utilisé pour gérer l'authentification, l'autorisation et la sécurisation des échanges entre l'application mobile et l'API REST."),
          ],
          bullet: { level: 0 },
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Express Validator Documentation. ", bold: true }),
            new TextRun({ text: "https://express-validator.github.io/docs/", underline: { type: "single" }, color: "0000FF" }),
            new TextRun("\nMiddleware utilisé sur le backend pour valider, nettoyer et sécuriser les données entrantes (ex: format strict des mots de passe, requêtes de transactions)."),
          ],
          bullet: { level: 0 },
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "PDFKit Documentation. ", bold: true }),
            new TextRun({ text: "https://pdfkit.org/docs/getting_started.html", underline: { type: "single" }, color: "0000FF" }),
            new TextRun("\nBibliothèque JavaScript utilisée côté serveur pour la génération dynamique de documents et l'exportation des rapports financiers au format PDF."),
          ],
          bullet: { level: 0 },
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Scrum Guide. ", bold: true }),
            new TextRun({ text: "https://www.scrum.org/resources/scrum-guide", underline: { type: "single" }, color: "0000FF" }),
            new TextRun("\nGuide complet sur Scrum, ressource essentielle pour la gestion de projet et l'organisation du cycle de développement agile."),
          ],
          bullet: { level: 0 },
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "UML (Unified Modeling Language). ", bold: true }),
            new TextRun({ text: "https://www.uml.org/", underline: { type: "single" }, color: "0000FF" }),
            new TextRun("\nRessources UML utilisées pour la conception du système, la modélisation de la base de données et l'architecture logicielle de la plateforme."),
          ],
          bullet: { level: 0 },
          spacing: { after: 200 },
        }),
      ],
    },
  ],
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync("Webographie_Monify.docx", buffer);
  console.log("Document Webographie_Monify.docx généré avec succès.");
});

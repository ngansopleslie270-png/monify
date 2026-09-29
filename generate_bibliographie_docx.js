const fs = require("fs");
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = require("docx");

const doc = new Document({
  creator: "Monify",
  title: "Bibliographie Monify",
  description: "Bibliographie pour le projet Monify",
  sections: [
    {
      properties: {},
      children: [
        new Paragraph({
          text: "BIBLIOGRAPHIE",
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        }),
        new Paragraph({
          children: [
            new TextRun("Support de cours Implémentation des bases de données, Institut africain d'Informatique-Centre d'Excellence Paul BIYA, 2023 de Mme BELINGA Estelle."),
          ],
          bullet: { level: 0 },
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun("Mme ANGA Orcéine, support de cours UML IIe année, Institut africain d'Informatique-Centre d'Excellence Paul BIYA, 2024."),
          ],
          bullet: { level: 0 },
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun("Support de cours d'Ingénierie Logicielle et Programmation Web/Mobile, Institut africain d'Informatique-Centre d'Excellence Paul BIYA, 2023."),
          ],
          bullet: { level: 0 },
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun("Rapport de stage IIIe année sur la << CONCEPTION ET RÉALISATION D'UNE APPLICATION MOBILE DE GESTION DE CAISSE ET DE SUIVI FINANCIER POUR PME >> Institut africain d'Informatique-Centre d'Excellence Paul BIYA, 2023."),
          ],
          bullet: { level: 0 },
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun("Rapport de stage IIe année sur la << MISE EN PLACE D'UNE PLATEFORME DE GESTION COMMERCIALE ET D'INVENTAIRE >> Institut africain d'Informatique-Centre d'Excellence Paul BIYA, 2022."),
          ],
          bullet: { level: 0 },
          spacing: { after: 200 },
        }),
      ],
    },
  ],
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync("Bibliographie_Monify.docx", buffer);
  console.log("Document Bibliographie_Monify.docx généré avec succès.");
});

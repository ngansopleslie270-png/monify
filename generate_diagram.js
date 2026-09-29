const fs = require('fs');
const https = require('https');
const path = require('path');

const plantumlCode = `@startuml
skinparam style strictuml
title Diagramme d'activité - Ajouter une vente

start

:Accéder à la fonctionnalité "Enregistrer une vente";
:Afficher le formulaire d'enregistrement;

repeat :Renseigner et soumettre le formulaire\\n(produit, quantité, montant, date, catégorie, etc.);
  
  :Vérifier la conformité des informations;
  
  if (Format des informations ?) then (Format OK)
    
    if (Connexion et Serveur OK ?) then (Oui)
      :Envoi des données de la vente;
      :Traitement (DB);
      :Vérification du résultat de l'enregistrement;
      
      if (Données enregistrées ?) then (Succès)
        :Affiche message de succès\\n& actualise l'historique;
        stop
      else (Échec)
        :Affiche message d'échec\\n& demande de réessayer;
      endif
      
    else (Interruption / Indisponibilité)
      :Informer l'utilisateur que l'opération\\nn'a pas pu être effectuée;
      stop
    endif
    
  else (Format NON OK)
    :Afficher un message d'erreur\\net demander de corriger;
    note right: Retour à la saisie (étape 3)
  endif
  
repeat while (Réessayer ?) is (Oui)
stop

@enduml`;

const options = {
  hostname: 'kroki.io',
  port: 443,
  path: '/plantuml/png',
  method: 'POST',
  headers: {
    'Content-Type': 'text/plain',
    'Content-Length': Buffer.byteLength(plantumlCode)
  }
};

const req = https.request(options, (res) => {
  if (res.statusCode === 200) {
    const file = fs.createWriteStream(path.join(__dirname, 'diagramme_activite.png'));
    res.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log('Image saved successfully!');
    });
  } else {
    console.error(`Error: ${res.statusCode}`);
  }
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(plantumlCode);
req.end();

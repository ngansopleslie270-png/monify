const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

require('dotenv').config();

const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'monify_db';

const BACKUP_DIR = path.join(__dirname, '../backups');

// Créer le dossier backups s'il n'existe pas
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR);
}

const date = new Date();
const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}_${date.getHours().toString().padStart(2, '0')}-${date.getMinutes().toString().padStart(2, '0')}-${date.getSeconds().toString().padStart(2, '0')}`;
const fileName = `monify_backup_${formattedDate}.sql`;
const filePath = path.join(BACKUP_DIR, fileName);

// Note: mysql/mysqldump needs to be in the PATH.
const dumpCommand = `mysqldump -u ${DB_USER} ${DB_PASSWORD ? `-p${DB_PASSWORD}` : ''} ${DB_NAME} > "${filePath}"`;

console.log(`Démarrage de la sauvegarde de la base de données ${DB_NAME}...`);

exec(dumpCommand, (error, stdout, stderr) => {
  if (error) {
    console.error(`Erreur lors de la sauvegarde: ${error.message}`);
    return;
  }
  if (stderr) {
    console.warn(`Avertissement (peut être normal avec mysqldump): ${stderr}`);
  }
  console.log(`Sauvegarde réussie ! Fichier : ${filePath}`);
});

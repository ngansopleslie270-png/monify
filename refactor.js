const fs = require('fs');
const path = require('path');

// Write .env file
fs.writeFileSync('frontend/.env', 'EXPO_PUBLIC_API_URL=http://10.63.33.80:5000/api\n');

const replaceInDir = (dir) => {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Match something like const API_URL = 'http://10.63.33.80:5000/api';
      // and replace the string literal with process.env.EXPO_PUBLIC_API_URL
      if (content.includes('http://10.63.33.80:5000/api')) {
        content = content.replace(/['"`]http:\/\/10\.63\.33\.80:5000\/api['"`]/g, 'process.env.EXPO_PUBLIC_API_URL');
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Updated ' + fullPath);
      }
    }
  });
};

replaceInDir('frontend');

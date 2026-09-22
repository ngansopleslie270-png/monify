const fs = require('fs');
const path = require('path');

const files = [
  'app/add-multiple.jsx',
  'app/(tabs)/sales.jsx',
  'app/(tabs)/reports.jsx',
  'app/(tabs)/profile.jsx',
  'app/(tabs)/index.jsx',
  'app/(tabs)/categories.jsx',
  'app/(tabs)/add.jsx',
  'app/(tabs)/add-purchase.jsx',
  'app/(tabs)/add-expense.jsx',
  'app/(auth)/register.jsx',
  'app/(auth)/login.jsx'
];

files.forEach(f => {
  const p = path.join('c:/Users/user/.gemini/antigravity-ide/scratch/monify/frontend', f);
  if (fs.existsSync(p)) {
    let c = fs.readFileSync(p, 'utf8');
    if (c.includes('react-native')) {
      c = c.replace(/,\s*SafeAreaView/g, '').replace(/SafeAreaView,\s*/g, '');
      if (!c.includes('react-native-safe-area-context')) {
        c = c.replace(/from\s*'react-native';/g, "from 'react-native';\nimport { SafeAreaView } from 'react-native-safe-area-context';");
      }
      fs.writeFileSync(p, c, 'utf8');
    }
  }
});

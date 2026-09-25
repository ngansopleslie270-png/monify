const db = require('./backend/config/db');

const seedCategories = async () => {
  try {
    const categories = [
      { id: 1, nom: 'Alimentation & Vivres', icon: 'food-variant', color: '#2E7D32', bg: '#E8F5E9', type: 'vente' },
      { id: 2, nom: 'Textile & Habillement', icon: 'tshirt-crew-outline', color: '#1565C0', bg: '#E3F2FD', type: 'vente' },
      { id: 3, nom: 'Electronique', icon: 'cellphone', color: '#6A1B9A', bg: '#F3E5F5', type: 'vente' },
      { id: 4, nom: 'Beaute & Cosmetique', icon: 'lipstick', color: '#AD1457', bg: '#FCE4EC', type: 'vente' },
      { id: 5, nom: 'Services', icon: 'wrench-outline', color: '#EF6C00', bg: '#FFF3E0', type: 'vente' },
      { id: 6, nom: 'Divers', icon: 'dots-horizontal-circle-outline', color: '#546E7A', bg: '#ECEFF1', type: 'vente' },
    ];

    for (const cat of categories) {
      await db.execute(
        'INSERT IGNORE INTO categories (id, nom, type, color, icon) VALUES (?, ?, ?, ?, ?)',
        [cat.id, cat.nom, cat.type, cat.color, cat.icon]
      );
    }
    console.log('Categories seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedCategories();

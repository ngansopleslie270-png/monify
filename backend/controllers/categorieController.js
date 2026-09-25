const Categorie = require('../models/Categorie');

const getCategories = async (req, res) => {
  try {
    const utilisateur_id = req.user.id;
    // On pourrait filtrer par utilisateur_id :
    const [rows] = await require('../config/db').execute(
      'SELECT * FROM categories WHERE utilisateur_id IS NULL OR utilisateur_id = ? ORDER BY type, nom', 
      [utilisateur_id]
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};

const createCategory = async (req, res) => {
  try {
    const { nom, type, color, icon } = req.body;
    const utilisateur_id = req.user.id;

    if (!nom) {
      return res.status(400).json({ message: 'Le nom de la catégorie est requis.' });
    }

    const id = await Categorie.create({ utilisateur_id, nom, type, color, icon });
    const [rows] = await require('../config/db').execute('SELECT * FROM categories WHERE id = ?', [id]);
    
    res.status(201).json({ message: 'Catégorie créée', categorie: rows[0] });
  } catch (error) {
    console.error('Erreur création catégorie:', error);
    res.status(500).json({ message: 'Erreur interne.' });
  }
};

module.exports = {
  getCategories,
  createCategory
};

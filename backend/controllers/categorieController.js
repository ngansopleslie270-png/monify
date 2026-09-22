const Categorie = require('../models/Categorie');

const getCategories = async (req, res) => {
  try {
    // Ensure default categories are created if table is empty
    await Categorie.createDefaultCategories();

    const categories = await Categorie.findAll();
    res.status(200).json(categories);
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};

module.exports = {
  getCategories
};

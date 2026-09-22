const { body, validationResult } = require('express-validator');

// Middleware pour vérifier les erreurs de validation
const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const validateRegister = [
  body('nom_complet').notEmpty().withMessage('Le nom complet est requis'),
  body('nom_commerce').notEmpty().withMessage('Le nom du commerce est requis'),
  body('email').isEmail().withMessage('Adresse email invalide'),
  body('telephone').notEmpty().withMessage('Le numéro de téléphone est requis'),
  body('mot_de_passe').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
  checkValidation
];

const validateLogin = [
  body('email').notEmpty().withMessage('L\'identifiant est requis'),
  body('mot_de_passe').notEmpty().withMessage('Le mot de passe est requis'),
  checkValidation
];

const validateTransaction = [
  body('type').isIn(['vente', 'depense']).withMessage('Le type doit être "vente" ou "depense"'),
  body('montant_total').isNumeric().withMessage('Le montant doit être un nombre valide'),
  body('produit_service').notEmpty().withMessage('La description du produit/service est requise'),
  body('categorie_id').isInt().withMessage('L\'ID de catégorie est requis'),
  checkValidation
];

module.exports = {
  validateRegister,
  validateLogin,
  validateTransaction
};

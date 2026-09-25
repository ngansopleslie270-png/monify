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
  body('nom').notEmpty().withMessage('Le nom complet est requis'),
  body('commerce').notEmpty().withMessage('Le nom du commerce est requis'),
  body('typeActivite').notEmpty().withMessage('Le type d\'activité est requis'),
  body('email').isEmail().withMessage('Adresse email invalide'),
  body('telephone').notEmpty().withMessage('Le numéro de téléphone est requis'),
  body('motDePasse').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
  checkValidation
];

const validateLogin = [
  body('email').isEmail().withMessage('Veuillez fournir une adresse email valide'),
  body('motDePasse').notEmpty().withMessage('Le mot de passe est requis'),
  checkValidation
];

const validateTransaction = [
  body('type').isIn(['vente', 'achat', 'depense', 'revenu']).withMessage('Le type doit être valide'),
  body('quantite').isNumeric().withMessage('La quantité doit être un nombre valide'),
  body('prix_unitaire').isNumeric().withMessage('Le prix unitaire doit être un nombre valide'),
  body('produit_service').notEmpty().withMessage('La description du produit/service est requise'),
  body('categorie_id').optional(),
  checkValidation
];

module.exports = {
  validateRegister,
  validateLogin,
  validateTransaction
};

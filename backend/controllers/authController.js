const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Utilisateur = require('../models/Utilisateur');

const register = async (req, res) => {
  try {
    const { nom, commerce, email, telephone, motDePasse } = req.body;

    if (!nom || !commerce || !email || !telephone || !motDePasse) {
      return res.status(400).json({ message: 'Veuillez remplir tous les champs obligatoires.' });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await Utilisateur.findByEmailOrPhone(email); // Or check both
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email ou ce téléphone est déjà utilisé.' });
    }

    // Hacher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(motDePasse, salt);

    // Créer l'utilisateur
    const userId = await Utilisateur.create(nom, commerce, telephone, email, hashedPassword, 'commerçant');

    // Générer le token JWT
    const token = jwt.sign(
      { id: userId, role: 'commerçant' },
      process.env.JWT_SECRET || 'monify_secret_key_123',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Utilisateur créé avec succès.',
      token,
      utilisateur: { id: userId, nom, commerce, email, telephone, role: 'commerçant' }
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};

const login = async (req, res) => {
  try {
    const { email, motDePasse } = req.body;

    if (!email || !motDePasse) {
      return res.status(400).json({ message: 'Veuillez fournir un email et un mot de passe.' });
    }

    // Vérifier l'utilisateur
    const user = await Utilisateur.findByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'Aucun compte associé à cette adresse email.' });
    }

    // Vérifier le mot de passe
    const isMatch = await bcrypt.compare(motDePasse, user.mot_de_passe);
    if (!isMatch) {
      return res.status(401).json({ message: 'Mot de passe incorrect.' });
    }

    // Générer le token JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'monify_secret_key_123',
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Connexion réussie.',
      token,
      utilisateur: { id: user.id, nom: user.nom, commerce: user.commerce, email: user.email, telephone: user.telephone, role: user.role }
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await Utilisateur.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};

module.exports = {
  register,
  login,
  getProfile
};

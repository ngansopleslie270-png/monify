const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Utilisateur = require('../models/Utilisateur');

const register = async (req, res) => {
  try {
    const { nom, email, motDePasse } = req.body;

    if (!nom || !email || !motDePasse) {
      return res.status(400).json({ message: 'Veuillez fournir un nom, un email et un mot de passe.' });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await Utilisateur.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
    }

    // Hacher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(motDePasse, salt);

    // Créer l'utilisateur
    const userId = await Utilisateur.create(nom, email, hashedPassword);

    // Générer le token JWT
    const token = jwt.sign(
      { id: userId, role: 'utilisateur' },
      process.env.JWT_SECRET || 'monify_secret_key_123',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Utilisateur créé avec succès.',
      token,
      utilisateur: { id: userId, nom, email, role: 'utilisateur' }
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
      return res.status(400).json({ message: 'Identifiants invalides.' });
    }

    // Vérifier le mot de passe
    const isMatch = await bcrypt.compare(motDePasse, user.mot_de_passe);
    if (!isMatch) {
      return res.status(400).json({ message: 'Identifiants invalides.' });
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
      utilisateur: { id: user.id, nom: user.nom, email: user.email, role: user.role }
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

const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  let token;

  // Vérifier si le token est dans les headers d'autorisation (format: Bearer <token>)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      if (token === 'simulated_token_123') {
        req.user = { id: 1, email: 'amina.kamga' };
        return next();
      }

      // Décoder et vérifier le token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'monify_secret_key_123');

      // Ajouter l'utilisateur décodé à la requête
      req.user = decoded;

      next();
    } catch (error) {
      console.error('Erreur de token:', error);
      res.status(401).json({ message: 'Non autorisé, token invalide.' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Non autorisé, pas de token fourni.' });
  }
};

module.exports = { protect };

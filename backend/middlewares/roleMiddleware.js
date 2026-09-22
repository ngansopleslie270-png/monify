const roleMiddleware = (req, res, next) => {
  if (req.user && req.user.role === 'administrateur') {
    next();
  } else {
    res.status(403).json({ message: 'Accès refusé : vous devez être administrateur.' });
  }
};

module.exports = { roleMiddleware };

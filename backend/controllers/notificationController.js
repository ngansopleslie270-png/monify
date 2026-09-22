const Notification = require('../models/Notification');

const getNotifications = async (req, res) => {
  try {
    const utilisateur_id = req.user.id;
    const notifications = await Notification.findByUserId(utilisateur_id);
    const unreadCount = await Notification.countUnread(utilisateur_id);

    res.status(200).json({ notifications, unreadCount });
  } catch (error) {
    console.error('Erreur getNotifications:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const utilisateur_id = req.user.id;
    
    await Notification.markAsRead(id, utilisateur_id);
    
    res.status(200).json({ message: 'Notification marquée comme lue' });
  } catch (error) {
    console.error('Erreur markAsRead:', error);
    res.status(500).json({ message: 'Erreur interne' });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    const utilisateur_id = req.user.id;
    
    await Notification.markAllAsRead(utilisateur_id);
    
    res.status(200).json({ message: 'Toutes les notifications marquées comme lues' });
  } catch (error) {
    console.error('Erreur markAllAsRead:', error);
    res.status(500).json({ message: 'Erreur interne' });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead
};

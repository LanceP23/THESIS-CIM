const jwt = require('jsonwebtoken');
const Notification = require('../models/notification')
const User = require('../models/user'); // Adjust the path as needed

// Function to get notifications for the logged-in user
const getNotifications = async (req, res) => {
  try {
    const authToken = req.headers.authorization;

    // Check if the authorization header is present
    if (!authToken) {
      return res.status(401).json({ error: 'Authorization header missing' });
    }

    // Extract the token from the authorization header
    const token = authToken.split(' ')[1];

    // Verify and decode the token to get user information
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    if (!decodedToken || !decodedToken.email) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Find the user associated with the token
    const user = await User.findOne({ studentemail: decodedToken.email });
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Find notifications where the user is a recipient
    const notifications = await Notification.find({ recipientIds: user._id })
      .sort({ timestamp: -1 }) // Sort by the most recent notifications
      .exec();

    res.json(notifications);
  } catch (error) {
    console.error('Error retrieving notifications:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getNotificationDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json(notification);
  } catch (error) {
    console.error('Error fetching notification details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    const authToken = req.headers.authorization;
    const notificationId = req.params.notificationId;

    // Check if the authorization header is present
    if (!authToken) {
      return res.status(401).json({ error: 'Authorization header missing' });
    }

    // Extract the token from the authorization header
    const token = authToken.split(' ')[1];

    // Verify and decode the token to get user information
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    if (!decodedToken || !decodedToken.email) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Find the user associated with the token
    const user = await User.findOne({ studentemail: decodedToken.email });
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Update the notification's "read" status for the current user
    await Notification.findByIdAndUpdate(notificationId, { $addToSet: { recipientIds: user._id } }, { new: true });

    res.status(200).json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const markAllNotificationsAsRead = async (req, res) => {
  try {
    const authToken = req.headers.authorization;

    if (!authToken) {
      return res.status(401).json({ error: 'Authorization header missing' });
    }

    const token = authToken.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    if (!decodedToken || !decodedToken.email) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const user = await User.findOne({ studentemail: decodedToken.email });
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    await Notification.updateMany({ recipientIds: user._id }, { read: true });

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


module.exports = {
  getNotifications,
  getNotificationDetails,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};

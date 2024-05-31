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

module.exports = {
  getNotifications,
};

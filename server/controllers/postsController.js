const Announcement = require('../models/announcement');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const axios = require('axios');




// req auth
const authenticate = async (req, res, next) => {
  try {
    // Check if authentication token exists in request headers
    const authToken = req.headers.authorization;

    if (!authToken) {
      return res.status(401).json({ error: 'Unauthorized: Missing authentication token' });
    }

    
    const token = authToken.split(' ')[1]; 
    console.log('Received token:', token);
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    
    if (!decodedToken || !decodedToken.email) {
      return res.status(401).json({ error: 'Unauthorized: Invalid authentication token' });
    }

    
    const user = await User.findOne({ email: decodedToken.email });

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: User not found' });
    }

    
    req.user = user;
r
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Create Announcement
const createAnnouncement = async (req, res) => {
  try {
    const { header, body, mediaUrl, visibility, postingDate, expirationDate } = req.body;
    let contentType = null;

    let status = 'pending';

    if (req.user.adminType === 'School Owner' && postingDate && new Date(postingDate) > new Date()) {
      status = 'scheduled'; // Set status to 'scheduled' if posting date is in the future
    } else {
      status = 'approved'; // Set status to 'approved' if no posting date provided or for other user roles
    }

    // Extract contentType from uploaded file
    if (req.file && req.file.mimetype) {
      contentType = req.file.mimetype;
    }

    // Extract contentType from mediaUrl
    if (mediaUrl) {
      const response = await axios.head(mediaUrl);
      const contentTypeFromUrl = response.headers['content-type'];
      if (contentTypeFromUrl) {
        contentType = contentTypeFromUrl;
      }
    }

    console.log('Inferred contentType:', contentType);

    const announcement = new Announcement({
      header,
      body,
      mediaUrl,
      contentType,
      status,
      postedBy: req.user.name,
      visibility: JSON.parse(visibility),
      postingDate,
      expirationDate
    });

    await announcement.save();

    res.status(201).json(announcement);
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};




//fetch pending announcement
const getPendingAnnouncements = async (req, res) => {
  try {
    const pendingAnnouncements = await Announcement.find({ status: 'pending' });
    res.json(pendingAnnouncements);
  } catch (error) {
    console.error('Error fetching pending announcements:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

//update Status upon approval
const updateAnnouncementStatus = async (req, res) => {
  try {
    const { announcementId } = req.params; 
    const { status } = req.body;
    console.log('Received Announcement ID:', announcementId);
    console.log('Received Status:', status);

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

    const announcement = await Announcement.findById(announcementId).exec();
    console.log(announcementId);
    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    announcement.status = status;
    await announcement.save();

    res.json(announcement);
  } catch (error) {
    console.error('Error updating announcement status:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getApprovedAnnouncements = async (req, res) => {
  try {
    const approvedAnnouncements = await Announcement.find({ status: 'approved' })
      .sort({ createdAt: -1 }) 
      .limit(3); 
    res.json(approvedAnnouncements);
  } catch (error) {
    console.error('Error fetching approved announcements:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  createAnnouncement,
  authenticate, 
  getPendingAnnouncements,
  updateAnnouncementStatus,
  getApprovedAnnouncements
};

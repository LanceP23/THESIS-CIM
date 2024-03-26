const Announcement = require('../models/announcement');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Multer configuration for file upload
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage: storage });

// req auth
const authenticate = async (req, res, next) => {
  try {
    // Check if authentication token exists in request headers
    const authToken = req.headers.authorization;

    if (!authToken) {
      return res.status(401).json({ error: 'Unauthorized: Missing authentication token' });
    }

    
    const token = authToken.split(' ')[1]; 
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
    const { header, body } = req.body;

    // Check if file is included in the request
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Create the announcement
    const announcement = new Announcement({
      header,
      body,
      media: {
        data: req.file.buffer, // Store the binary data of the uploaded file
        contentType: req.file.mimetype // Store the MIME type for file type
      }
    });

    // Save announcement to the database
    await announcement.save();

    res.status(201).json(announcement);
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  createAnnouncement,
  upload,
  authenticate // Export the authenticate middleware for use in routes
};

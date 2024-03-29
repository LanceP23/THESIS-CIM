const express = require('express');
const router = express.Router();
const multer = require('multer');
const cors = require('cors');
const { test, registerUser, loginUser, getProfile, logoutUser, checkAuth } = require('../controllers/authController');
const { createOrganization, authenticateUser, getOrganization, approveOfficer } = require('../controllers/organizationController');
const { createAnnouncement,getPendingAnnouncements,updateAnnouncementStatus } = require('../controllers/postsController'); // Import the createAnnouncement function
const upload = multer(); // Initialize multer

router.use(
    cors({
        credentials: true,
        origin: 'http://localhost:5173'
    })
);



router.get('/', test);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/check-auth',checkAuth);
router.get('/profile', getProfile);
router.post('/create_organization', authenticateUser, createOrganization);
router.post('/logout', logoutUser);
router.get('/organization', getOrganization);
router.put('/approve_officer/:orgId/:officerId', authenticateUser, approveOfficer); 

// Define the route for creating announcements with file upload
router.post('/announcements', authenticateUser, upload.single('media'), createAnnouncement);
router.get('/pending-announcements', authenticateUser, getPendingAnnouncements);
router.put('/update-announcement-status/:announcementId', authenticateUser, updateAnnouncementStatus);

module.exports = router;

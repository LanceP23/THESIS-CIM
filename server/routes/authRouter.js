const express = require('express');
const router = express.Router();
const cors = require('cors');
const { test, registerUser, loginUser, getProfile, logoutUser } = require('../controllers/authController');
const { createOrganization, authenticateUser, getOrganization, approveOfficer } = require('../controllers/organizationController');

router.use(
    cors({
        credentials: true,
        origin: 'http://localhost:5173'
    })
);

router.get('/', test);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', getProfile);
router.post('/create_organization', authenticateUser, createOrganization);
router.post('/logout', logoutUser);
router.get('/organization', getOrganization);
router.put('/approve_officer/:orgId/:officerId', authenticateUser, approveOfficer); 

module.exports = router;

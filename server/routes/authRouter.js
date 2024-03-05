const express = require('express');
const router = express.Router();
const cors = require('cors');
const {test, registerUser, loginUser,getProfile} = require('../controllers/authController')
const{createOrganization, authenticateUser} = require('../controllers/organizationController')


router.use(
    cors({
        credentials: true,
        origin: 'http://localhost:5173'
    })
)

router.get('/', test)
router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/profile', getProfile)
router.post('/create_organization', authenticateUser, createOrganization)

module.exports = router
const express = require('express');
const { authenticateUser } = require('../controllers/organizationController');
const { getUsersForSidebar, getUserById } = require('../controllers/userController');
const router = express.Router();

router.get("/", authenticateUser,getUsersForSidebar)
router.get('/:userId',getUserById);

module.exports = router;
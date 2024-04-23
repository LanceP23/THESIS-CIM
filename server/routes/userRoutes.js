const express = require('express');
const { authenticateUser } = require('../controllers/organizationController');
const { getUsersForSidebar } = require('../controllers/userController');
const router = express.Router();

router.get("/", authenticateUser,getUsersForSidebar)

module.exports = router;
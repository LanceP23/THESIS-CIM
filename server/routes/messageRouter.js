const express = require('express');
const router = express.Router();
const {sendMessage,getMessages} = require('../controllers/messageController')
const {authenticateUser} = require('../controllers/organizationController');

router.post("/send/:id", authenticateUser,sendMessage)
router.get("/:id", authenticateUser,getMessages)

module.exports = router;
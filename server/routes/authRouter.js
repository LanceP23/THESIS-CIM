const express = require('express');
const router = express.Router();
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const { test, registerUser, loginUser, getProfile, logoutUser, checkAuth } = require('../controllers/authController');
const { createOrganization, authenticateUser, getOrganization, approveOfficer } = require('../controllers/organizationController');
const { createAnnouncement, getPendingAnnouncements, updateAnnouncementStatus } = require('../controllers/postsController');
const { getApprovedAnnouncements } = require('../controllers/postsController');
const { getAllStaff, getAllFaculty, getAllStudents, updateUser, deleteUser } = require('../controllers/adminAccountController');
const {postEventController,getEventsController} = require('../controllers/postEventController');
const { 
  createChatRoom,
  sendMessage,
  getChatHistory,
  getAllChatsForUser,
  addParticipantsToChat,
  leaveChat,
  deleteChatRoom,
  getUsers,
  checkChatRoomExists
} = require('../controllers/chatController');

router.use(
    cors({
        credentials: true,
        origin:'http://localhost:5173'
    })
);

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "assets");
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, `${uniqueSuffix}-${file.originalname}`);
    },
  });
  
  const upload = multer({ storage });


router.get('/', test);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/check-auth', checkAuth);
router.get('/profile', getProfile);
router.post('/create_organization', authenticateUser, createOrganization);
router.post('/logout', logoutUser);
router.get('/organization', getOrganization);
router.put('/approve_officer/:orgId/:officerId', authenticateUser, approveOfficer);

// Define the route for creating announcements with file upload
router.post('/announcements', authenticateUser, upload.single('media'), createAnnouncement);
//announcement approval
router.get('/pending-announcements', authenticateUser, getPendingAnnouncements);
router.put('/update-announcement-status/:announcementId', authenticateUser, updateAnnouncementStatus);
router.get('/approved-announcements', authenticateUser, getApprovedAnnouncements);

//fetchingAdminAccounts
router.get('/staff', getAllStaff);
router.get('/faculty', getAllFaculty);
router.get('/students', getAllStudents);

//updateAdminAccount
router.put('/users/:id/update', updateUser);

//deleteAdminAccount
router.delete('/users/:id/delete', deleteUser);

//event creation
router.post('/events', authenticateUser, postEventController);
router.get('/fetch-event', getEventsController);


//Chat related
router.get('/users', getUsers);
router.post('/create-chat-room',authenticateUser, createChatRoom);
router.post('/send-message', authenticateUser,sendMessage);
router.get('/chat-history/:chatId', getChatHistory);
router.get('/all-chats', getAllChatsForUser);
router.post('/add-participants', addParticipantsToChat);
router.post('/leave-chat', leaveChat);
router.delete('/delete-chat-room/:chatRoomId',authenticateUser, deleteChatRoom);
router.get('/chat-room/:userId/:adminId', checkChatRoomExists);

module.exports = router;

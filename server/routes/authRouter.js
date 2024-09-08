const express = require('express');
const router = express.Router();
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const { test, registerUser, loginUser, getProfile, logoutUser, checkAuth, registerMobileUser } = require('../controllers/authController');
const { createOrganization, authenticateUser, getOrganization, approveOfficer, getPotentialMembers, addPotentialMembers, getAddedMembers, updateOrganizationMember, deleteOrganizationMember, fetchOrganizationData, getOrganizationId,getAnnouncementsByOrganizationName } = require('../controllers/organizationController');
const { createAnnouncement, getPendingAnnouncements, updateAnnouncementStatus, getUserAnnouncements, updateAnnouncement, deleteAnnouncement } = require('../controllers/postsController');
const { getApprovedAnnouncements } = require('../controllers/postsController');
const { getAllStaff, getAllFaculty, getAllStudents, updateUser, deleteUser } = require('../controllers/adminAccountController');
const {postEventController,getEventsController, putEventController, deleteEventController} = require('../controllers/postEventController');


const{updateAcademicSettingsAndArchiveAccounts, archiveAccounts, unarchiveAccounts} = require('../controllers/schoolSettingController');
const { getMobileUserById, getAllMobileUsers, updateMobileUserById, deleteMobileUserById } = require('../controllers/mobileUserController');
const { buildCommunity, fetchMobileUsers, fetchUsers, getAllCommunities, getCommunityById, getCommunityForRP, getCommunityNamesForRP, getCommunityName, getAnnouncementsByCommunityId, getRandomAnnouncementsByAdminCommunities, getAnnouncementCommunityMembers } = require('../controllers/communityController');
const{getNotifications, getNotificationDetails, markNotificationAsRead, markAllNotificationsAsRead}  = require('../controllers/notificationController');
const{getLikesDislikesandReactions,countUserReactionsByEducationLevel, countReactionsByDate, getUserReactionsWithDate} = require('../controllers/analyticsController');
const DailyLogin = require('../models/dailylogin'); 

router.use(
    cors({
        credentials: true,
        origin:['http://localhost:5173', 'http://192.168.1.5:5173']
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

//auth related
router.get('/', test);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/check-auth', checkAuth);
router.get('/profile', getProfile);
router.post('/create_organization', authenticateUser, createOrganization);
router.post('/logout', logoutUser);
router.get('/admin-logins-today', async (req, res) => {
  try {
      const today = new Date(new Date().setHours(0, 0, 0, 0)); // set time to midnight of the current day
      const dailyLogin = await DailyLogin.findOne({ date: today });

      const loginCount = dailyLogin ? dailyLogin.loginCount : 0;
      res.json({ loginCount });
  } catch (error) {
      console.error('Error fetching daily login count:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

//org
router.get('/organization', getOrganization);
router.put('/approve_officer/:orgId/:officerId', authenticateUser, approveOfficer);
router.get('/organization/:orgName/potential_members', authenticateUser, getPotentialMembers);
router.post('/organization/:orgName/add_members',addPotentialMembers);
router.get('/organization/:orgName/members', getAddedMembers);
router.put('/organizations/:orgId/members/:memberId', updateOrganizationMember);
router.delete('/organizations/:orgId/members/:memberId', deleteOrganizationMember);
router.get('/organization-data/:userId',authenticateUser, fetchOrganizationData);
router.get('/organization-id/:userId', authenticateUser, getOrganizationId);
router.get('/organization/:organizationId/announcements', getAnnouncementsByOrganizationName);



// Define the route for creating announcements with file upload
router.post('/announcements', authenticateUser, upload.single('media'), createAnnouncement);
//announcement approval
router.get('/pending-announcements', authenticateUser, getPendingAnnouncements);
router.put('/update-announcement-status/:announcementId', authenticateUser, updateAnnouncementStatus);
router.get('/approved-announcements', authenticateUser, getApprovedAnnouncements);
router.get('/fetch-user-announcements', authenticateUser,getUserAnnouncements);
router.put('/update-post/:postId', authenticateUser, updateAnnouncement);
router.delete('/delete-post/:postId', authenticateUser,deleteAnnouncement);

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
router.put('/update-event/:id', authenticateUser, putEventController);
router.delete('/delete-event/:id', authenticateUser, deleteEventController);


//school year/ semester update temporary archival of accounts
router.put('/update-settings',updateAcademicSettingsAndArchiveAccounts,archiveAccounts);
router.put('/unarchive-accounts',unarchiveAccounts);

//mobileusers
router.post('/register-mobile-user', registerMobileUser);
router.get('/mobile-users/:userId', getMobileUserById);
router.get('/mobile-users', getAllMobileUsers);
router.put('/update-mobile-users/:userId',updateMobileUserById);
router.delete('/delete-mobile-users/:userId',deleteMobileUserById);

//community
router.post('/build-community',authenticateUser,upload.none(), buildCommunity);
router.get('/get-mobile-users', fetchMobileUsers);
router.get('/get-users', fetchUsers);
router.get('/view-community', authenticateUser, getAllCommunities);
router.get('/view-community/:id', authenticateUser, getCommunityById);
router.get('/get-community-name/:communityId', getCommunityName);
router.get('/announcements/:communityId', authenticateUser, getAnnouncementsByCommunityId);
router.get('/random-announcements',authenticateUser, getRandomAnnouncementsByAdminCommunities);
router.get('/member-announcements',authenticateUser, getAnnouncementCommunityMembers);


//notification
router.get('/notifications', getNotifications);
router.get('/notifications/:id', getNotificationDetails);
router.patch('/notifications/:id/read', markNotificationAsRead);
router.patch('/notifications/markAllAsRead', markAllNotificationsAsRead);

//analytics
router.get('/announcements/:id/details', getLikesDislikesandReactions);
router.get('/user/:id/demographics',countUserReactionsByEducationLevel);
router.get('/count-reactions-date/:id', countReactionsByDate);
router.get('/reactions-with-date/:id', getUserReactionsWithDate);
module.exports = router;


const cron = require('node-cron');
const Announcement = require('../models/announcement');
const ArchiveAnnouncement = require('../models/archiveAnnouncement');
const MobileUser = require('../models/mobileUser');
const User = require('../models/user');
const Notification = require('../models/notification');

const { getReceiverSocketId, io } = require('../socketManager');

// Define a function to run periodically
const startBackgroundTasks = () => {
    // Schedule a task to run every minute
    cron.schedule('* * * * *', async () => {
        console.log('Cron job started at', new Date().toISOString());
        try {
            // Get the current UTC time
            const now = new Date(); // Local system time (current time on your system)
            const nowUTC = new Date(now.toISOString()); // Convert to UTC
        
            // Add 8 hours to convert to Philippines time (UTC+8)
            const philippinesTime = new Date(nowUTC.getTime() + 8 * 60 * 60 * 1000);
        
            console.log('Current Time in Philippines (UTC+8):', philippinesTime.toISOString());
        
            // Find scheduled announcements where the postingDate is already in the past or exactly now in the Philippines timezone
            const missedAnnouncements = await Announcement.find({
                status: 'scheduled',  // Filter only those that are scheduled
                postingDate: { $lte: philippinesTime } // Find announcements where postingDate is <= current time in the Philippines timezone
            });
        
            console.log('Found missed announcements to approve:', missedAnnouncements);
        
            // If there are missed announcements, approve them
            if (missedAnnouncements.length > 0) {
                const result = await Announcement.updateMany(
                    { _id: { $in: missedAnnouncements.map(a => a._id) } },
                    { $set: { status: 'approved' } } // Approve the missed announcements
                );
                console.log('Missed announcements approved:', result);
                missedAnnouncements.forEach(async (announcement) => {
                    let targetUsers = [];
                    let recipientIds = new Set();  // Using Set to avoid duplicates
            
                    const parsedVisibility = announcement.visibility;  // Visibility settings from the announcement
                    const allMobileUsers = await MobileUser.find();
            
                    // Determine target users based on visibility settings
                    if (parsedVisibility.everyone) {
                      const allUsers = await User.find();
                      targetUsers.push(...allUsers, ...allMobileUsers);
                    } else {
                      if (parsedVisibility.staff) {
                        const staffUsers = await User.find({ position: { $exists: false }, organization: { $exists: false }, department: { $exists: false } });
                        targetUsers.push(...staffUsers);
                      }
                      if (parsedVisibility.faculty) {
                        const facultyUsers = await User.find({ department: { $exists: true } });
                        targetUsers.push(...facultyUsers);
                      }
                      if (parsedVisibility.students) {
                        const studentUsers = await User.find({ position: { $exists: true }, organization: { $exists: true } });
                        targetUsers.push(...studentUsers, ...allMobileUsers);
                      }
                    }
            
                    // Add target users to recipientIds (unique users)
                    targetUsers.forEach(user => recipientIds.add(user._id.toString()));
            
                    // Notification template for the announcement
                    const notificationDataTemplate = {
                      type: 'announcement',
                      message: 'New announcement posted',
                      posterName: announcement.postedBy,
                      announcementHeader: announcement.header,
                      announcementBody: announcement.body,
                      timestamp: new Date().toISOString(),
                      recipientIds: Array.from(recipientIds),  // Convert Set to Array to prevent duplicates
                    };
            
                    // Create and save the notification
                    const notification = new Notification(notificationDataTemplate);
                    await notification.save();
            
                    // Emit notifications to connected users
                    targetUsers.forEach(user => {
                      const receiverSocketId = getReceiverSocketId(user._id);
                      if (receiverSocketId) {
                        io.to(receiverSocketId).emit("newAnnouncement", notificationDataTemplate);
                      }
                    });
                  });
            
            } else {
                console.log('No missed announcements to approve.');
            }
        } catch (error) {
            console.error('Error in cron job:', error); // Log any errors that occur during the process
        }
        
        

        try {
          console.log('Archival process started at', new Date());
      
          // Find announcements with expiration dates that have been reached
          const expiredAnnouncements = await Announcement.find({
              status: 'approved', // Only consider approved announcements for expiration
              expirationDate: { $lte: new Date() }
          });
      
          if (expiredAnnouncements.length === 0) {
              console.log('No expired announcements found for archival.');
              return;
          }
      
          // Archive announcements with better handling of errors
          const archivedSuccessfully = [];
          const failedToArchive = [];
      
          for (const announcement of expiredAnnouncements) {
              try {
                  const archiveAnnouncement = new ArchiveAnnouncement({
                      _id: announcement._id, // Preserve original announcement's ID
                      header: announcement.header,
                      body: announcement.body,
                      mediaUrl: announcement.mediaUrl,
                      contentType: announcement.contentType,
                      postedBy: announcement.postedBy,
                      posterId: announcement.posterId,
                      visibility: announcement.visibility,
                      postingDate: announcement.postingDate,
                      expirationDate: announcement.expirationDate,
                      likes: announcement.likes,
                      dislikes: announcement.dislikes,
                      minigame: announcement.minigame,
                      minigameWord: announcement.minigameWord
                  });
                  await archiveAnnouncement.save();
                  archivedSuccessfully.push(announcement._id);
              } catch (err) {
                  console.error(`Failed to archive announcement with ID: ${announcement._id}`, err);
                  failedToArchive.push(announcement._id);
              }
          }
      
          // Remove successfully archived announcements from the main announcements collection
          if (archivedSuccessfully.length > 0) {
              const deleteResult = await Announcement.deleteMany({
                  _id: { $in: archivedSuccessfully }
              });
              console.log(`Archived and deleted ${deleteResult.deletedCount} announcements.`);
          }
      
          // Log or handle any failed archival attempts for retry
          if (failedToArchive.length > 0) {
              console.warn(
                  `Archival process completed with failures. Failed to archive the following IDs: ${failedToArchive.join(
                      ', '
                  )}`
              );
              // Optionally log these failures to a separate database or file for retrying
          }
      
          console.log('Archival process finished at', new Date());
      } catch (error) {
          console.error('Critical error during archival process:', error);
      }
      
      
    });
};

module.exports = { startBackgroundTasks };

const cron = require('node-cron');
const Announcement = require('../models/announcement');
const ArchiveAnnouncement = require('../models/archiveAnnouncement');

// Define a function to run periodically
const startBackgroundTasks = () => {
    // Schedule a task to run every hour
    cron.schedule('0 * * * *', async () => {
        try {
            // Find announcements with pending or scheduled status and posting dates that have been reached
            const announcementsToApprove = await Announcement.find({
                $or: [
                    { status: 'scheduled', postingDate: { $lte: new Date() } }
                ]
            });

            // Update status to "approved" for announcements that meet the criteria
            await Announcement.updateMany(
                { _id: { $in: announcementsToApprove.map(announcement => announcement._id) } },
                { $set: { status: 'approved' } }
            );

            console.log('Announcements approved:', announcementsToApprove.length);
        } catch (error) {
            console.error('Error approving announcements:', error);
        }

        try {
            // Find announcements with expiration dates that have been reached
            const expiredAnnouncements = await Announcement.find({
                status: 'approved', // Only consider approved announcements for expiration
                expirationDate: { $lte: new Date() }
            });

            // Move expired announcements to the archive
            for (const announcement of expiredAnnouncements) {
                const archiveAnnouncement = new ArchiveAnnouncement({
                    header: announcement.header,
                    body: announcement.body,
                    mediaUrl: announcement.mediaUrl,
                    contentType: announcement.contentType,
                    postedBy: announcement.postedBy,
                    visibility: announcement.visibility,
                    postingDate: announcement.postingDate,
                    expirationDate: announcement.expirationDate
                });
                await archiveAnnouncement.save();
            }

            // Remove expired announcements from the main announcements collection
            await Announcement.deleteMany({ _id: { $in: expiredAnnouncements.map(announcement => announcement._id) } });

            console.log('Announcements archived:', expiredAnnouncements.length);
        } catch (error) {
            console.error('Error archiving announcements:', error);
        }
    });
};

module.exports = { startBackgroundTasks };

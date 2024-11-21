const cron = require('node-cron');
const Announcement = require('../models/announcement');
const ArchiveAnnouncement = require('../models/archiveAnnouncement');

// Define a function to run periodically
const startBackgroundTasks = () => {
    // Schedule a task to run every minute
    cron.schedule('* * * * *', async () => {
        console.log('Cron job started at', new Date().toISOString());

        try {
            const now = new Date();
            const bufferStart = new Date(now.getTime() - 60000); // 1 minute before now
            const bufferEnd = new Date(now.getTime() + 60000); // 1 minute after now

            // Find announcements with scheduled status and posting dates that have been reached within buffer time
            const announcementsToApprove = await Announcement.find({
                status: 'scheduled',
                postingDate: { $lte: bufferEnd, $gte: bufferStart }
            });
            console.log('Found announcements to approve:', announcementsToApprove);

            // Update status to "approved" for announcements that meet the criteria
            const result = await Announcement.updateMany(
                { _id: { $in: announcementsToApprove.map(announcement => announcement._id) } },
                { $set: { status: 'approved' } }
            );
            console.log('Announcements approved:', result);
            const missedAnnouncements = await Announcement.find({
                status: 'scheduled',
                postingDate: { $lte: now } // Catch-up logic for missed announcements
            });
    
            if (missedAnnouncements.length > 0) {
                const missedResult = await Announcement.updateMany(
                    {
                        _id: { $in: missedAnnouncements.map(a => a._id) },
                        status: 'scheduled' // Ensure status is still 'scheduled'
                    },
                    { $set: { status: 'approved' } }
                );
                console.log('Missed announcements approved:', missedResult);
            }
            
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
            const archivedCount = await Announcement.deleteMany({
                _id: { $in: expiredAnnouncements.map(announcement => announcement._id) }
            });
            console.log('Announcements archived:', archivedCount.deletedCount);
        } catch (error) {
            console.error('Error archiving announcements:', error);
        }
    });
};

module.exports = { startBackgroundTasks };

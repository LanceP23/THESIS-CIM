const mongoose = require('mongoose');
const User = require('../models/user');
const MobileUser = require('../models/mobileUser'); 
const Announcement = mongoose.model('Announcement');
const UserReaction = require('../models/userreactions');



// Function to generate random dates within a specified range
const generateRandomDates = () => {
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    const range = today.getTime() - lastMonth.getTime();

    return { lastMonth, range };
};

// Generate random dates once when the file is imported
const { lastMonth, range } = generateRandomDates();

const countUserReactionsByEducationLevel = async (req, res) => {
    try {
        const userId = req.params.id;
       

        // Find the user by userId to get their name
        const user = await User.findById(userId);
        if (!user) {
           
            return res.status(404).send({ message: 'User not found' });
        }

        const userName = user.name;
        

        // Fetch all reactions where the postedBy field in Announcement matches the user's name
        const reactions = await UserReaction.aggregate([
            {
                $lookup: {
                    from: 'announcements',
                    localField: 'announcementId',
                    foreignField: '_id',
                    as: 'announcementDetails'
                }
            },
            {
                $unwind: '$announcementDetails'
            },
            {
                $match: {
                    'announcementDetails.postedBy': userName
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'adminDetails'
                }
            },
            {
                $lookup: {
                    from: 'mobileusers',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'mobileUserDetails'
                }
            },
            {
                $addFields: {
                    userDetails: {
                        $cond: {
                            if: { $gt: [{ $size: '$adminDetails' }, 0] },
                            then: { $arrayElemAt: ['$adminDetails', 0] },
                            else: { $arrayElemAt: ['$mobileUserDetails', 0] }
                        }
                    },
                    userType: {
                        $cond: {
                            if: { $gt: [{ $size: '$adminDetails' }, 0] },
                            then: 'admin',
                            else: 'mobile'
                        }
                    }
                }
            }
        ]);

        const educationLevelCounters = {
            gradeSchool: 0,
            highSchool: 0,
            seniorHighSchool: 0,
            college: 0,
            admin: 0
        };

        for (const reaction of reactions) {
            const userType = reaction.userType;
            const userDetail = reaction.userDetails;

            if (userType === 'admin') {
                educationLevelCounters.admin++;
            } else if (userType === 'mobile') {
                switch (userDetail.educationLevel) {
                    case 'Grade School':
                        educationLevelCounters.gradeSchool++;
                        break;
                    case 'High School':
                        educationLevelCounters.highSchool++;
                        break;
                    case 'Senior High School':
                        educationLevelCounters.seniorHighSchool++;
                        break;
                    case 'College':
                        educationLevelCounters.college++;
                        break;
                    default:
                        break;
                }
            }
        }
        

        const allZero = Object.values(educationLevelCounters).every(count => count === 0);
        if (allZero) {
            res.status(200).send({ message: 'No reactions found for this user\'s posts.' });
        } else {
            res.status(200).send({ educationLevelCounters });
        }
    } catch (error) {
        console.error('Error counting user reactions by education level', error);
        res.status(500).send({ message: 'Error counting user reactions by education level', error });
    }
};

const countReactionsByDate = async (req, res) => {
    try {
        const userId = req.params.id;

        // Find the user by userId to get their name
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        const userName = user.name;

        // Fetch reactions from UserReactions and ArchivedAnnouncements for the specified user
        const userReactions = await UserReaction.aggregate([
            {
                $lookup: {
                    from: 'announcements',
                    localField: 'announcementId',
                    foreignField: '_id',
                    as: 'announcementDetails'
                }
            },
            {
                $lookup: {
                    from: 'archiveannouncements',
                    localField: 'announcementId',
                    foreignField: '_id',
                    as: 'archivedAnnouncementDetails'
                }
            },
            {
                $unwind: {
                    path: '$announcementDetails',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $unwind: {
                    path: '$archivedAnnouncementDetails',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $match: {
                    $or: [
                        { 'announcementDetails.postedBy': userName },
                        { 'archivedAnnouncementDetails.postedBy': userName }
                    ],
                    dateReacted: { $exists: true, $ne: null }
                }
            },
            {
                $project: {
                    reaction: 1,
                    dateReacted: 1
                }
            }
        ]);

        // Aggregate reactions by date
        const reactionsByDate = {};

        userReactions.forEach(reaction => {
            const date = reaction.dateReacted.toISOString().split('T')[0]; // Format date to 'YYYY-MM-DD'

            if (!reactionsByDate[date]) {
                reactionsByDate[date] = { likes: 0, dislikes: 0 };
            }

            if (reaction.reaction === 'like') {
                reactionsByDate[date].likes += 1;
            } else if (reaction.reaction === 'dislike') {
                reactionsByDate[date].dislikes += 1;
            }
        });

        // Format the data for the graph
        const formattedData = Object.keys(reactionsByDate).map(date => ({
            date,
            likes: reactionsByDate[date].likes,
            dislikes: reactionsByDate[date].dislikes
        }));

        res.status(200).send({ formattedData });
    } catch (error) {
        console.error('Error counting reactions by date', error);
        res.status(500).send({ message: 'Error counting reactions by date', error });
    }
};


const getUserReactionsWithDate = async (req, res) => {
    try {
        const userId = req.params.id;

        // Find the user by userId to get their name
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        const userName = user.name;

        const reactionsWithDate = await UserReaction.aggregate([
            {
                $lookup: {
                    from: 'announcements',
                    localField: 'announcementId',
                    foreignField: '_id',
                    as: 'announcementDetails'
                }
            },
            {
                $lookup: {
                    from: 'archiveannouncements',
                    localField: 'announcementId',
                    foreignField: '_id',
                    as: 'archiveAnnouncementDetails'
                }
            },
            {
                $unwind: {
                    path: '$announcementDetails',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $unwind: {
                    path: '$archiveAnnouncementDetails',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $match: {
                    $and: [
                        { dateReacted: { $exists: true, $ne: null } }, // only fetch the ones that has dateReacted kasi wala yung iba
                        {
                            $or: [
                                { 'announcementDetails.postedBy': userName },
                                { 'archiveAnnouncementDetails.postedBy': userName }
                            ]
                        }
                    ]
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'adminDetails'
                }
            },
            {
                $lookup: {
                    from: 'mobileusers',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'mobileUserDetails'
                }
            },
            {
                $addFields: {
                    userDetails: {
                        $cond: {
                            if: { $gt: [{ $size: '$adminDetails' }, 0] },
                            then: { $arrayElemAt: ['$adminDetails', 0] },
                            else: { $arrayElemAt: ['$mobileUserDetails', 0] }
                        }
                    },
                    userType: {
                        $cond: {
                            if: { $gt: [{ $size: '$adminDetails' }, 0] },
                            then: 'admin',
                            else: 'mobile'
                        }
                    }
                }
            }
        ]);

        if (!reactionsWithDate.length) {
            return res.status(404).send({ message: 'No reactions with dates found for this user\'s posts.' });
        }
        res.status(200).send({ reactionsWithDate });
    } catch (error) {
        console.error('Error fetching reactions with dates', error);
        res.status(500).send({ message: 'Error fetching reactions with dates', error });
    }
};


const getLikesDislikesandReactions = async (req, res) => {
    try {
        const userId = req.params.id;

        // Find the user by userId to get their name
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        const userName = user.name;

        // Fetch announcements belonging to the specified user
        const announcements = await Announcement.find({ postedBy: userName });

        if (!announcements || announcements.length === 0) {
            return res.status(404).send({ message: 'No announcements found for this user' });
        }

        // Initialize total likes and dislikes
        let totalLikes = 0;
        let totalDislikes = 0;

        // Array to store reactions with random dates
        const reactionsWithDates = [];

        announcements.forEach(announcement => {
            // Sum up the actual likes and dislikes from the announcement
            totalLikes += announcement.likes;
            totalDislikes += announcement.dislikes;

            // Generate random dates for likes and dislikes
            const randomLikeDates = Array.from({ length: announcement.likes }, () => new Date(lastMonth.getTime() + Math.random() * range));
            const randomDislikeDates = Array.from({ length: announcement.dislikes }, () => new Date(lastMonth.getTime() + Math.random() * range));

            // Push likes and dislikes with random dates to the array
            reactionsWithDates.push(...randomLikeDates.map(date => ({ date, reaction: 'like' })));
            reactionsWithDates.push(...randomDislikeDates.map(date => ({ date, reaction: 'dislike' })));
        });

        // Send the response
        res.status(200).send({
            likes: totalLikes,
            dislikes: totalDislikes,
            reactionsWithDates
        });
    } catch (error) {
        res.status(500).send({ message: 'Error fetching announcement details', error });
    }
};

module.exports = {
    getLikesDislikesandReactions,
    countUserReactionsByEducationLevel,
    countReactionsByDate,
    getUserReactionsWithDate
};

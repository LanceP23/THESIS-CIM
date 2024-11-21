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
            return res.status(404).send({ message: 'User not found, possibly deleted' });
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
            },
            // Ensure that we only process reactions for users that still exist
            {
                $match: {
                    $or: [
                        { 'adminDetails': { $ne: [] } },
                        { 'mobileUserDetails': { $ne: [] } }
                    ]
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

        // Prepare to include section and year level info
        const sectionYearLevelCounters = {};

        for (const reaction of reactions) {
            const userType = reaction.userType;
            const userDetail = reaction.userDetails;

            if (userType === 'admin') {
                educationLevelCounters.admin++;
            } else if (userType === 'mobile') {
                // Count reactions by education level
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

                // Track reactions by section and year level, including education level
                const sectionKey = userDetail.section;
                let yearLevelKey;

                // Conditionally assign year level based on education level
                if (userDetail.educationLevel === 'College') {
                    yearLevelKey = `${userDetail.educationLevel} - Year ${userDetail.collegeYearLevel}`;
                } else if (userDetail.educationLevel === 'Senior High School') {
                    yearLevelKey = `${userDetail.educationLevel} - Year ${userDetail.seniorHighSchoolYearLevel}`;
                } else if (userDetail.educationLevel === 'High School') {
                    yearLevelKey = `${userDetail.educationLevel} - Year ${userDetail.highSchoolYearLevel}`;
                } else if (userDetail.educationLevel === 'Grade School') {
                    yearLevelKey = `${userDetail.educationLevel} - Year ${userDetail.gradeLevel}`;
                } else {
                    yearLevelKey = 'Unknown Year Level';
                }

                // Create the combined key including both section and year level with education
                const combinedKey = `${sectionKey} - ${yearLevelKey}`;

                if (sectionYearLevelCounters[combinedKey]) {
                    sectionYearLevelCounters[combinedKey]++;
                } else {
                    sectionYearLevelCounters[combinedKey] = 1;
                }
            }
        }

        const allZero = Object.values(educationLevelCounters).every(count => count === 0);
        if (allZero) {
            res.status(200).send({ message: 'No reactions found for this user\'s posts.' });
        } else {
            res.status(200).send({
                educationLevelCounters,
                sectionYearLevelCounters // Include section and year level data
            });
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
            return res.status(404).send({ message: 'User not found, possibly deleted' });
        }

        const userName = user.name;

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
                $project: {
                    reaction: 1,
                    dateReacted: 1,
                    announcementInfo: {
                        $cond: {
                            if: { $gt: [{ $size: "$announcementDetails" }, 0] },
                            then: { $arrayElemAt: ["$announcementDetails", 0] },
                            else: { $arrayElemAt: ["$archivedAnnouncementDetails", 0] }
                        }
                    },
                    userId: 1 // Ensure userId is included
                }
            },
            {
                // Match only reactions where the user exists in 'users' or 'mobileusers'
                $match: {
                    'announcementInfo.postedBy': userName,
                    dateReacted: { $exists: true, $ne: null },
                    $or: [
                        { userId: { $in: await User.distinct('_id') } },  // Check against all existing users
                        { userId: { $in: await MobileUser.distinct('_id') } } // Check against all existing mobile users
                    ]
                }
            }
        ]);

        // Aggregate reactions by date and include announcement details
        const reactionsByDate = {};

        userReactions.forEach(reaction => {
            const date = reaction.dateReacted.toISOString().split('T')[0];
            const announcementInfo = reaction.announcementInfo;

            if (!reactionsByDate[date]) {
                reactionsByDate[date] = { likes: 0, dislikes: 0, announcements: [] };
            }

            // Increment like/dislike counts
            if (reaction.reaction === 'like') {
                reactionsByDate[date].likes += 1;
            } else if (reaction.reaction === 'dislike') {
                reactionsByDate[date].dislikes += 1;
            }

            // Add unique announcement to the date's announcements list
            if (announcementInfo) {
                const announcementExists = reactionsByDate[date].announcements.some(
                    ann => ann.announcementId.toString() === announcementInfo._id.toString()
                );
                if (!announcementExists) {
                    reactionsByDate[date].announcements.push({
                        announcementId: announcementInfo._id,
                        header: announcementInfo.header,
                        body: announcementInfo.body,
                        contentType: announcementInfo.contentType,
                        posterId: announcementInfo.postedBy,
                        likes: 0,  // Initialize likes and dislikes
                        dislikes: 0
                    });
                }

                // Update likes/dislikes for the announcement itself
                const announcementIndex = reactionsByDate[date].announcements.findIndex(
                    ann => ann.announcementId.toString() === announcementInfo._id.toString()
                );
                if (announcementIndex !== -1) {
                    if (reaction.reaction === 'like') {
                        reactionsByDate[date].announcements[announcementIndex].likes += 1;
                    } else if (reaction.reaction === 'dislike') {
                        reactionsByDate[date].announcements[announcementIndex].dislikes += 1;
                    }
                }
            }
        });

        // Format the data for the response
        const formattedData = Object.keys(reactionsByDate).map(date => ({
            date,
            likes: reactionsByDate[date].likes,
            dislikes: reactionsByDate[date].dislikes,
            announcements: reactionsByDate[date].announcements
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

const mongoose = require('mongoose');
const User = require('../models/user');
const MobileUser = require('../models/mobileUser');
const Announcement = mongoose.model('Announcement');
const UserReaction = require('../models/userreactions');

const countCommunityTotalReactions = async (req, res) => {
    try {
        const { communityId } = req.params;

        // Fetch announcements related to the community
        const announcements = await Announcement.find({ communityId });

        if (!announcements.length) {
            return res.status(404).send({ message: 'No announcements found for this community' });
        }

        const announcementIds = announcements.map(announcement => announcement._id);

        // Count reactions grouped by type (like/dislike)
        const reactions = await UserReaction.aggregate([
            {
                $match: {
                    announcementId: { $in: announcementIds }
                }
            },
            {
                $group: {
                    _id: '$reaction', // Group by reaction type
                    total: { $sum: 1 } // Count total reactions
                }
            }
        ]);

        // Prepare the response object
        const totalReactions = {
            totalLikes: 0,
            totalDislikes: 0
        };

        reactions.forEach(reaction => {
            if (reaction._id === 'like') {
                totalReactions.totalLikes = reaction.total;
            } else if (reaction._id === 'dislike') {
                totalReactions.totalDislikes = reaction.total;
            }
        });

        res.status(200).send(totalReactions);
    } catch (error) {
        console.error('Error counting community total reactions:', error);
        res.status(500).send({ message: 'Error counting community total reactions', error });
    }
};

const getReactionsByEducationLevelForCommunity = async (req,res) => {
    try{
        const{communityId} = req.params;

        const reactions = await UserReaction.aggregate([
            {
                $lookup:{
                    from:'announcements',
                    localField:'postId',
                    foreignField: '_id',
                    as:'announcementDetails'
                }
            },
            {
                $unwind:'$announcementDetails'
            },
            {
                $match:{
                    'announcementDetails.commnunityId':mongoose.Types.ObjectId(communityId)
                }
            },
            {
                $lookup:{
                    from:'users',
                    localField:'userId',
                    foreignField:'_id',
                    as: 'userDetails'
                }
            },
            {
                $lookup:{
                    from:'mobileusers',
                    localField:'userId',
                    foreignField: '_id',
                    as: 'mobileUserDetails'
                }
            },
            {
                $addFields:{
                    userType:{
                        $cond:{
                            if:{$gt:[{$size:'$userDetails'}, 0]},
                            then:'admin',
                            else:'mobile'

                        }
                    },
                    user:{
                        $cond:{
                            if:{$gt:[{$size:'userDetails'}, 0]},
                            then:{$arrayElemAt: ['$userDetails', 0]},
                            else:{$arrayElemAt:['$mobileUserDetails',0]}
                        }
                    }
                }
            },
            {
                $group:{
                    _id:'$user.educationLevel',
                    totalReactions:{$sum:1}
                }   
            }
        ]);

        res.status(200).send(reactions);
    }
    catch(error){
        console.error('Error fetching reaction by education level', error);
        res.status(500).send({message: 'Error fetching reactions by education level', error})
    }
};

const getReactionsOverTimeForCommunity = async (req, res) => {
    try {
        const { communityId } = req.params;
        const startDate = new Date(req.query.startDate);
        const endDate = new Date(req.query.endDate || new Date());

        const reactions = await UserReaction.aggregate([
            {
                $lookup: {
                    from: 'announcements',
                    localField: 'postId',
                    foreignField: '_id',
                    as: 'announcementDetails'
                }
            },
            {
                $unwind: '$announcementDetails'
            },
            {
                $match: {
                    'announcementDetails.communityId': mongoose.Types.ObjectId(communityId),
                    dateReacted: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: {
                        day: { $dayOfMonth: '$dateReacted' },
                        month: { $month: '$dateReacted' },
                        year: { $year: '$dateReacted' }
                    },
                    totalLikes: {
                        $sum: {
                            $cond: [{ $eq: ['$reaction', 'like'] }, 1, 0]
                        }
                    },
                    totalDislikes: {
                        $sum: {
                            $cond: [{ $eq: ['$reaction', 'dislike'] }, 1, 0]
                        }
                    }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
            }
        ]);

        res.status(200).send(reactions);
    } catch (error) {
        console.error('Error fetching reactions over time', error);
        res.status(500).send({ message: 'Error fetching reactions over time', error });
    }
};

const countCommunityReactionsByEducationLevel = async (req, res) => {
    try {
        const communityId = req.params.communityId;

        // Fetch announcements related to the community
        const announcements = await Announcement.find({ communityId });

        if (!announcements.length) {
            return res.status(404).send({ message: 'No announcements found for this community' });
        }

        const announcementIds = announcements.map(announcement => announcement._id);

        // Fetch reactions with user details for the community
        const reactions = await UserReaction.aggregate([
            {
                $match: {
                    announcementId: { $in: announcementIds }
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

        // Loop through each reaction to count based on education level
        reactions.forEach(reaction => {
            const { userType, userDetails } = reaction;

            if (userType === 'admin') {
                educationLevelCounters.admin++;
            } else if (userType === 'mobile') {
                switch (userDetails.educationLevel) {
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
        });

        const allZero = Object.values(educationLevelCounters).every(count => count === 0);
        if (allZero) {
            return res.status(200).send({ message: 'No reactions found for this community.' });
        }

        res.status(200).send({ educationLevelCounters });
    } catch (error) {
        console.error('Error counting community reactions by education level:', error);
        res.status(500).send({ message: 'Error counting community reactions by education level', error });
    }
};
const countCommunityReactionsByDate = async (req, res) => {
    try {
        const communityId = req.params.communityId;

        // Fetch announcements for the specific community
        const announcements = await Announcement.find({ communityId });

        if (!announcements.length) {
            return res.status(404).send({ message: 'No announcements found for this community' });
        }

        const announcementIds = announcements.map(announcement => announcement._id);

        // Fetch reactions grouped by date
        const reactionsByDate = await UserReaction.aggregate([
            {
                $match: {
                    announcementId: { $in: announcementIds },
                    dateReacted: { $exists: true, $ne: null }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$dateReacted' } },
                    likes: {
                        $sum: {
                            $cond: [{ $eq: ['$reaction', 'like'] }, 1, 0]
                        }
                    },
                    dislikes: {
                        $sum: {
                            $cond: [{ $eq: ['$reaction', 'dislike'] }, 1, 0]
                        }
                    }
                }
            },
            {
                $sort: { _id: 1 } // Sort by date
            }
        ]);

        // Format data for the response
        const formattedData = reactionsByDate.map(item => ({
            date: item._id,
            likes: item.likes,
            dislikes: item.dislikes
        }));

        res.status(200).send({ formattedData });
    } catch (error) {
        console.error('Error counting community reactions by date:', error);
        res.status(500).send({ message: 'Error counting community reactions by date', error });
    }
};


module.exports = {
    countCommunityTotalReactions,
    getReactionsByEducationLevelForCommunity,
    getReactionsOverTimeForCommunity,
    countCommunityReactionsByEducationLevel,
    countCommunityReactionsByDate
};
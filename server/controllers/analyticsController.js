const mongoose = require('mongoose');
const User = require('../models/user'); // Assuming you have a User model
const Announcement = mongoose.model('Announcement'); // Assuming you have an Announcement model

// Function to generate random dates within a specified range
const generateRandomDates = () => {
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    const range = today.getTime() - lastMonth.getTime();

    return { lastMonth, range };
};

// Generate random dates once when the file is imported
const { lastMonth, range } = generateRandomDates();

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
    getLikesDislikesandReactions
};

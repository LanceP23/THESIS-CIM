const mongoose = require('mongoose');

const userReactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    announcementId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Announcement'
    },
    reaction: {
        type: String,
        required: true
    },
    dateReacted: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('UserReaction', userReactionSchema);

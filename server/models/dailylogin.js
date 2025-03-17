const mongoose = require('mongoose');
const { Schema } = mongoose;

const dailyLoginSchema = new Schema({
    date: {
        type: Date,
        required: true,
        unique: true,
        default: () => new Date(new Date().setHours(0, 0, 0, 0)) // sets time to midnight of the current day
    },
    loginCount: {
        type: Number,
        required: true,
        default: 0
    },
    loggedInUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
});

const DailyLogin = mongoose.model('DailyLogin', dailyLoginSchema);

module.exports = DailyLogin;

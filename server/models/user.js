const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    name: String,
    studentemail: {
        type: String,
        unique: true
    },
    password: String,
    adminType: String,
    position: {
        type: String,
        required: function() {
            return this.adminType === 'Organization Officer'; // Require position if adminType is 'Organization Officer'
        }
    },
    organization: {
        type: String,
        required: function() {
            return this.adminType === 'Organization Officer'; // Require organization if adminType is 'Organization Officer'
        }
    },
    status: {
        type: String,
        default: 'pending', // Default status for all users
        enum: ['pending', 'approved', 'rejected'] // Possible status values
    }
});

const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;

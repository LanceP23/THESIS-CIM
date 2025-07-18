const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    studentemail: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    adminType: {
        type: String,
        required: true
    },
    position: {
        type: String,
        required: function() {
            return this.adminType === 'Organization Officer'; // required only for 'Organization Officer' and 'Student Government'
        }
    },
    organization: {
        type: String,
        required: function() {
            return this.adminType === 'Organization Officer'; // required only for 'Organization Officer'
        }
    },
    schoolYear: {
        type: String, // staff and faculty registration
        required: function() {
            return this.adminType === 'School Owner' || this.adminType === 'President' || this.adminType === 'School Executive Admin' || this.adminType === 'School Executive Dean' || this.adminType === 'Program Head' || this.adminType === 'Instructor'; // required for staff and faculty
        }
    },
    department: {
        type: String, // Added field for faculty registration
        required: function() {
            return this.adminType === 'Program Head' || this.adminType === 'Instructor'; // required for faculty
        }
    },
    profilePicture: {
        type: String, // URL for the profile picture (optional)
        required: false
    },
    notifications: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Notification'
      }],
      currentToken: { type: String },
},);

const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;

const mongoose = require('mongoose');
const {Schema} = mongoose


const organizationSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    schoolYear: {
        type: String,
        required: true
    },
    semester: {
        type: String,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],

});


const Organization = mongoose.model('Organization', organizationSchema);

module.exports = Organization;

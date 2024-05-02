const mongoose = require('mongoose');
const { Schema } = mongoose;

const mobileUserSchema = new Schema({
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
    section: {
        type: String,
        required: true
    },
    educationLevel: {
        type: String,
        enum: ['Grade School', 'High School', 'Senior High School', 'College'],
        required: true
    },
    gradeLevel: {
        type: Number,
        default: null // Default value is null
    },
    highSchoolYearLevel: {
        type: Number,
        default: null // Default value is null
    },
    shsStrand: {
        type: String,
        default: null // Default value is null
    },
    seniorHighSchoolYearLevel: {
        type: Number,
        default: null // Default value is null
    },
    collegeCourse: {
        type: String,
        default: null // Default value is null
    },
    collegeYearLevel: {
        type: Number,
        default: null // Default value is null
    },
    subjects: {
        type: [String],
        required: true
    },
    profilePicture: {
        type: String,
        required: false
    }
});

// Update the virtual field to include 'strand' when educationLevel is 'Senior High School'
mobileUserSchema.virtual('relevantFields').get(function() {
    switch(this.educationLevel) {
        case 'Grade School':
            return { gradeLevel: this.gradeLevel };
        case 'High School':
            return { highSchoolYearLevel: this.highSchoolYearLevel };
        case 'Senior High School':
            return { shsStrand: this.shsStrand, seniorHighSchoolYearLevel: this.seniorHighSchoolYearLevel, strand: this.shsStrand };
        case 'College':
            return { collegeCourse: this.collegeCourse, collegeYearLevel: this.collegeYearLevel };
        default:
            return {};
    }
});

const MobileUser = mongoose.model('MobileUser', mobileUserSchema);

module.exports = MobileUser;

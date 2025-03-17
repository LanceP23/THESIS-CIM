const mongoose = require('mongoose');
const AcademicYear = require('./academicYear');

const schoolSemesterSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    academicYear:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AcademicYear',
        required: true,
    },
});

const SchoolSemester = mongoose.model('SchoolSemester', schoolSemesterSchema);

module.exports = SchoolSemester;
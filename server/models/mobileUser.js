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
})
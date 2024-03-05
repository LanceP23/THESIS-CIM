const mongoose = require('mongoose')
const {Schema} = mongoose

const userSchema = new Schema({
    name:String,
    studentemail:{
        type: String,
        unique: true
    },
    password: String,
    adminType: String
})

const UserModel = mongoose.model('User', userSchema)

module.exports = UserModel;
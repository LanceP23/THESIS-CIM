const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    participants:{
        type:[{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
        required: true
    },
    messages:{
        type:[{
            sender:{type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
            content:{
                type: String,
                required: true
            },
            media:{
                type: String
            },
            file:{
                type: String
            },
            timestamp:{
                type: Date,
                default: Date.now
            }
        }],
        default:[]
    }
});

const Chat = mongoose.model('Chat', chatSchema);
module.exports = Chat;
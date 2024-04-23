const Conversation = require('../models/conversationModel')
const Message = require('../models/messageModel')
const User = require('../models/user')
const { getReceiverSocketId, io } = require('../socketManager')

const sendMessage = async (req,res) =>{
    try {
        const {message} = req.body
        const {id: receiverId} = req.params
        const senderId = req.user.id

        let conversation = await Conversation.findOne({
            participants:{$all:[senderId,receiverId]}
        })

        if(!conversation){
            conversation = await Conversation.create({
                participants:[senderId, receiverId],
            })
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            message,
        })

        if(newMessage){
            conversation.messages.push(newMessage._id);
        }
        await Promise.all([conversation.save(), newMessage.save()]);

         //socket io realtime function
         const receiverSocketId = getReceiverSocketId(receiverId);
         if(receiverSocketId){
            console.log("Emitting newMessage event to receiver:", receiverSocketId);
            io.to(receiverSocketId).emit("newMessage", newMessage)
         }

        res.status(201).json(newMessage);
    } catch (error) {
        console.log(error)
        res.status(500).json({error: "Internal server error"});
    }
}

const getMessages = async(req,res)=>{
    try {
        const{id:userToChatId} = req.params;
        const senderId = req.user.id;

        const conversation = await Conversation.findOne({
            participants:{$all: [senderId, userToChatId]},
        }).populate("messages")

        if(!conversation) return res.status(200).json([]);

        const messages = conversation.messages;

        res.status(200).json(messages);
    } catch (error) {
        console.log(error)
        res.status(500).json({error: "Internal server error"});
    }
}


module.exports = {
    sendMessage,
    getMessages
}
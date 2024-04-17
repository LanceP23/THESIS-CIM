const Chat = require('../models/chat');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const {getIoInstance} = require('../socketManager');

const authenticateUser = (req, res, next) => {
    // Check if the authorization header exists
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ error: 'Authorization header missing' });
    }

    // Extract the token from the authorization header
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Token missing' });
    }

    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
        if (err) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        // Store the decoded token in the request object
        req.user = decodedToken;
        next();
    });
};

const createChatRoom = async (req, res) => {
    try {
        const { userId, adminId } = req.body;

        // Check if the chat room already exists between the sender and receiver
        const existingChatRoom = await Chat.findOne({
            participants: { $all: [userId, adminId] }
        });

        if (existingChatRoom) {
            // Chat room already exists, return the existing chat room ID
            return res.status(200).json({ chatId: existingChatRoom._id });
        }

        // Create a new chat room with the sender and receiver as participants
        const newChatRoom = new Chat({
            participants: [userId, adminId]
        });

        // Save the new chat room to the database
        await newChatRoom.save();

        // Emit a socket.io event to inform clients about the new chat room
        const io = getIoInstance();
        io.emit('chatRoomCreated', newChatRoom);

        // Send the new chat room as a response
        res.status(201).json({ chatId: newChatRoom._id });
    } catch (error) {
        console.error('Error creating chat room: ', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};



const sendMessage = async (req, res) => {
    try {
        const { chatId, content, recipientId } = req.body;
        const userId = req.user ? req.user.id : null;
        const io = getIoInstance();

        let chat;
        // If chatId is provided, try to find the chat room
        if (chatId) {
            chat = await Chat.findById(chatId);
            if (!chat) {
                return res.status(404).json({ error: 'Chat room not found' });
            }
        } else {
            // If chatId is not provided, create a new chat room
            if (!userId || !recipientId) {
                return res.status(400).json({ error: 'senderId and recipientId are required to create a new chat room' });
            }
            // Create a new chat room
            chat = new Chat({
                participants: [userId, recipientId] // Use userId and recipientId here
            });
            await chat.save();
            io.to(userId).emit('joinRoom', chat._id);
            io.to(recipientId).emit('joinRoom',chat._id);
        }

        // Create the message object
        const message = {
            sender: userId,
            content,
            timestamp: new Date()
        };

        // Save the message to the chat room
        chat.messages.push(message);
        await chat.save();

        // Emit a socket.io event to inform clients about the new message
        io.to(chat._id).emit('newMessage', message);
        io.to(userId).emit('messageSentConfirmation');

        res.status(200).json({ message: 'Message sent successfully', data: message });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};




const getChatHistory = async (req, res) =>{
    try {
        const chatId = req.params.chatId;
        console.log(chatId)
        const chat = await Chat.findById(chatId)
        

        if (!chat) {
            return res.status(404).json({ error: 'Chat room not found' });
        }

        // Check if chat has messages
        if (!chat.messages || chat.messages.length === 0) {
            return res.status(200).json({ message: 'No chat history yet' });
        }

        
        res.json(chat.messages);
    } catch (error) {
        console.error('Error fetching chat history: ', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


const getAllChatsForUser = async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch all chats for the user and populate the 'participants' and 'messages' fields
        const chats = await Chat.find({ participants: userId })
            .populate('participants', 'name')
            .populate('messages.sender', 'name'); 

        res.json(chats);
    } catch (error) {
        console.error('Error fetching chats for user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


const addParticipantsToChat = async (req, res) =>{
    try{
        const{chatId, participants} = req.body

        const chat = await Chat.findById(chatId);

        if(!chatId){
            return res.status(404).json({error: 'Chat not found'});
        }

        chat.participants.push(...participants);

        await chat.save();

        res.json({message: 'Participants added to the chat successfully', chat});
    } catch (error){
        console.error('Error adding participants to chat:', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
};

const leaveChat = async (req, res) => {
    try{
        const{chatId,  userId} = req.body;
        
        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({ error: 'Chat not found' });
        }

        const isParticipant = chat.participants.some(participant => participant.toString() === userId);
        if (!isParticipant) {
            return res.status(400).json({ error: 'User is not a participant of this chat' });
        }

        chat.participants = chat.participants.filter(participant => participant.toString() !== userId);

        await chat.save();

        res.json({ message: 'User left the chat successfully', chat });
    } catch (error) {
        console.error('Error leaving chat:', error);
        res.status(500).json({ error: 'Internal Server Error' });

    }
};

const deleteChatRoom = async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.user._id; 

        // Find the chat room by ID
        const chatRoom = await Chat.findById(chatId);
        if (!chatRoom) {
            return res.status(404).json({ error: 'Chat room not found' });
        }

        //security measure
        const isParticipant = chatRoom.participants.some(participant => participant.equals(userId));
        if (!isParticipant) {
            return res.status(403).json({ error: 'You are not a participant of this chat room' });
        }

        // delete chat for deleter's side only
        if (chatRoom.participants.length === 2) {
            await Chat.findByIdAndDelete(chatId);
            return res.status(200).json({ message: 'Chat room deleted successfully' });
        }

        // leave gc
        chatRoom.participants = chatRoom.participants.filter(participant => !participant.equals(userId));
        await chatRoom.save();
        
        res.status(200).json({ message: 'You have left the chat room' });
    } catch (error) {
        console.error('Error deleting chat room: ', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getUsers = async (req, res) => {
    try {
      const users = await User.find(); 

      // Send the list of users as a response
      res.json({ users });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  const checkChatRoomExists = async (req, res) => {
    try {
        const { userId, adminId } = req.params;

        // Find a chat room where both userId and adminId are participants
        const existingChatRoom = await Chat.findOne({
            participants: { $all: [userId, adminId] }
        });

        if (existingChatRoom) {
            return res.status(200).json({ exists: true, chatRoom: existingChatRoom._id });
        } else {
            return res.status(200).json({ exists: false });
        }
    } catch (error) {
        console.error('Error checking chat room existence:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    createChatRoom,
    sendMessage,
    getChatHistory,
    getAllChatsForUser,
    addParticipantsToChat,
    leaveChat,
    deleteChatRoom,
    getUsers,
    checkChatRoomExists
};

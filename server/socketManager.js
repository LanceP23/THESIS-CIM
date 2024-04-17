const socketIo = require('socket.io');

let io;

const initializeSocket = (server) => {
    io = socketIo(server, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('A user connected');

        // Join a specific room
        socket.on('joinRoom', (chatId) => {
            socket.join(chatId);
            console.log(`User joined room ${chatId}`);
        });

        socket.on('sendMessage', ({ chatId, message }) => {
            // Emit message only to users in the specific room
            io.to(chatId).emit('newMessage', message);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });
};


const getIoInstance = () => {
    if (!io) {
        throw new Error('Socket.io has not been initialized');
    }
    return io;
};

module.exports = {
    initializeSocket,
    getIoInstance
};

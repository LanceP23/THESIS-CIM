const socketIo = require('socket.io');

let io;

const initializeSocket = (server) => {
    io = socketIo(server);

    io.on('connection', (socket) => {
        console.log('A user connected');

        socket.on('sendMessage', (message) => {
            io.emit('message', message);
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

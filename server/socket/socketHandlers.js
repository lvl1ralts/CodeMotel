const Message = require('../models/Message');
const Room = require('../models/Room');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticateSocket = async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        const user = await User.findById(decoded.userId).select('-password');
        socket.userId = user._id;
        socket.user = user;
        next();
    } catch (error) {
        next(new Error('Authentication error'));
    }
};

module.exports = (io) => {
    io.use(authenticateSocket);

    io.on('connection', (socket) => {
        console.log(`User ${socket.user.username} connected`);

        // Join room
        socket.on('join-room', async (roomId) => {
            try {
                const room = await Room.findById(roomId);
                if (!room) {
                    socket.emit('error', { message: 'Room not found' });
                    return;
                }

                socket.join(roomId);
                socket.currentRoom = roomId;

                // Notify others in the room
                socket.to(roomId).emit('user-joined', {
                    userId: socket.userId,
                    username: socket.user.username
                });

                socket.emit('room-joined', { roomId });
            } catch (error) {
                socket.emit('error', { message: 'Failed to join room' });
            }
        });

        // Leave room
        socket.on('leave-room', (roomId) => {
            socket.leave(roomId);
            socket.to(roomId).emit('user-left', {
                userId: socket.userId,
                username: socket.user.username
            });
            socket.currentRoom = null;
        });

        // Chat message
        socket.on('chat-message', async (data) => {
            try {
                const { roomId, content, messageType = 'text', codeSnippet } = data;

                const message = new Message({
                    room: roomId,
                    user: socket.userId,
                    content,
                    messageType,
                    codeSnippet
                });

                await message.save();
                await message.populate('user', 'username');

                io.to(roomId).emit('new-message', message);
            } catch (error) {
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        // Code sharing
        socket.on('share-code', (data) => {
            const { roomId, code, language } = data;
            socket.to(roomId).emit('code-shared', {
                userId: socket.userId,
                username: socket.user.username,
                code,
                language
            });
        });

        // Real-time code collaboration
        socket.on('code-change', (data) => {
            const { roomId, code, cursorPosition } = data;
            socket.to(roomId).emit('code-updated', {
                userId: socket.userId,
                code,
                cursorPosition
            });
        });

        // Disconnect
        socket.on('disconnect', () => {
            console.log(`User ${socket.user.username} disconnected`);
            if (socket.currentRoom) {
                socket.to(socket.currentRoom).emit('user-left', {
                    userId: socket.userId,
                    username: socket.user.username
                });
            }
        });
    });
};

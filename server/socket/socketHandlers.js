const Message = require('../models/Message');
const Room = require('../models/Room');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticateSocket = async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('No token provided'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
            return next(new Error('User not found'));
        }

        socket.userId = user._id;
        socket.user = user;
        next();
    } catch (error) {
        console.error('Socket authentication error:', error.message);
        next(new Error('Authentication failed'));
    }
};

// Rate limiting for socket events
const createRateLimit = (maxEvents = 10, windowMs = 60000) => {
    const userLimits = new Map();
    
    return (socket, eventName) => {
        const userId = socket.userId.toString();
        const now = Date.now();
        const windowStart = now - windowMs;
        
        if (!userLimits.has(userId)) {
            userLimits.set(userId, []);
        }
        
        const userEvents = userLimits.get(userId);
        
        // Remove old events
        while (userEvents.length > 0 && userEvents[0] < windowStart) {
            userEvents.shift();
        }
        
        if (userEvents.length >= maxEvents) {
            socket.emit('error', { 
                message: `Rate limit exceeded for ${eventName}. Please slow down.` 
            });
            return false;
        }
        
        userEvents.push(now);
        return true;
    };
};

module.exports = (io) => {
    io.use(authenticateSocket);
    
    const messageRateLimit = createRateLimit(30, 60000); // 30 messages per minute
    const roomRateLimit = createRateLimit(5, 60000);     // 5 room actions per minute
    const codeRateLimit = createRateLimit(50, 60000);    // 50 code changes per minute

    io.on('connection', (socket) => {
        console.log(`User ${socket.user.username} connected (${socket.id})`);

        // Join room
        socket.on('join-room', async (roomId) => {
            if (!roomRateLimit(socket, 'join-room')) return;
            
            try {
                // Validate roomId format
                if (!roomId || !roomId.match(/^[0-9a-fA-F]{24}$/)) {
                    socket.emit('error', { message: 'Invalid room ID format' });
                    return;
                }

                const room = await Room.findById(roomId);
                if (!room) {
                    socket.emit('error', { message: 'Room not found' });
                    return;
                }

                // Check if room is full
                if (room.participants.length >= room.maxParticipants) {
                    socket.emit('error', { message: 'Room is full' });
                    return;
                }

                socket.join(roomId);
                socket.currentRoom = roomId;

                // Update room participants in database
                const isAlreadyParticipant = room.participants.some(
                    p => p.user.toString() === socket.userId.toString()
                );

                if (!isAlreadyParticipant) {
                    await Room.findByIdAndUpdate(roomId, {
                        $addToSet: { 
                            participants: { 
                                user: socket.userId,
                                joinedAt: new Date()
                            }
                        }
                    });
                }

                // Notify others in the room
                socket.to(roomId).emit('user-joined', {
                    userId: socket.userId,
                    username: socket.user.username
                });

                socket.emit('room-joined', { roomId });
                console.log(`User ${socket.user.username} joined room ${roomId}`);
            } catch (error) {
                console.error('Join room error:', error);
                socket.emit('error', { message: 'Failed to join room' });
            }
        });

        // Leave room
        socket.on('leave-room', async (roomId) => {
            try {
                socket.leave(roomId);
                
                // Remove from database
                await Room.findByIdAndUpdate(roomId, {
                    $pull: { participants: { user: socket.userId } }
                });

                socket.to(roomId).emit('user-left', {
                    userId: socket.userId,
                    username: socket.user.username
                });
                
                socket.currentRoom = null;
                console.log(`User ${socket.user.username} left room ${roomId}`);
            } catch (error) {
                console.error('Leave room error:', error);
            }
        });

        // Chat message
        socket.on('chat-message', async (data) => {
            if (!messageRateLimit(socket, 'chat-message')) return;
            
            try {
                const { roomId, content, messageType = 'text', codeSnippet } = data;

                // Validate input
                if (!content || content.trim().length === 0) {
                    socket.emit('error', { message: 'Message content is required' });
                    return;
                }

                if (content.length > 1000) {
                    socket.emit('error', { message: 'Message too long (max 1000 characters)' });
                    return;
                }

                const message = new Message({
                    room: roomId,
                    user: socket.userId,
                    content: content.trim(),
                    messageType,
                    codeSnippet
                });

                await message.save();
                await message.populate('user', 'username');

                io.to(roomId).emit('new-message', message);
            } catch (error) {
                console.error('Chat message error:', error);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        // Code sharing
        socket.on('share-code', (data) => {
            if (!codeRateLimit(socket, 'share-code')) return;
            
            const { roomId, code, language } = data;
            
            // Validate input
            if (!code || code.length > 50000) {
                socket.emit('error', { message: 'Invalid code length' });
                return;
            }

            socket.to(roomId).emit('code-shared', {
                userId: socket.userId,
                username: socket.user.username,
                code,
                language,
                timestamp: new Date()
            });
        });

        // Real-time code collaboration
        socket.on('code-change', (data) => {
            if (!codeRateLimit(socket, 'code-change')) return;
            
            const { roomId, code, cursorPosition } = data;
            
            // Validate input
            if (code && code.length > 50000) {
                socket.emit('error', { message: 'Code too long' });
                return;
            }

            socket.to(roomId).emit('code-updated', {
                userId: socket.userId,
                code,
                cursorPosition,
                timestamp: Date.now()
            });
        });

        // Disconnect
        socket.on('disconnect', async () => {
            console.log(`User ${socket.user.username} disconnected (${socket.id})`);
            
            if (socket.currentRoom) {
                try {
                    // Remove from room participants
                    await Room.findByIdAndUpdate(socket.currentRoom, {
                        $pull: { participants: { user: socket.userId } }
                    });

                    socket.to(socket.currentRoom).emit('user-left', {
                        userId: socket.userId,
                        username: socket.user.username
                    });
                } catch (error) {
                    console.error('Disconnect cleanup error:', error);
                }
            }
        });

        // Handle socket errors
        socket.on('error', (error) => {
            console.error(`Socket error for user ${socket.user.username}:`, error);
        });
    });

    // Handle server-level socket errors
    io.on('connect_error', (error) => {
        console.error('Socket.IO connection error:', error);
    });
};

const Room = require('../models/Room');
const Message = require('../models/Message');

exports.getAllRooms = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        
        const rooms = await Room.find({ isPrivate: false })
            .populate('createdBy', 'username')
            .populate('participants.user', 'username')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Room.countDocuments({ isPrivate: false });

        // Make sure to return data in the expected format
        res.json({
            success: true,
            rooms: rooms || [], // Always return an array
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        console.error('Get rooms error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error',
            rooms: [] // Return empty array on error
        });
    }
};

exports.createRoom = async (req, res) => {
    try {
        const { name, description, isPrivate, maxParticipants, tags } = req.body;

        const room = new Room({
            name,
            description,
            createdBy: req.userId,
            isPrivate,
            maxParticipants,
            tags,
            participants: [{
                user: req.userId
            }]
        });

        await room.save();
        await room.populate('createdBy', 'username');

        res.status(201).json({
            message: 'Room created successfully',
            room
        });
    } catch (error) {
        console.error('Create room error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getRoomById = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id)
            .populate('createdBy', 'username')
            .populate('participants.user', 'username')
            .populate('currentProblem');
        
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        res.json(room);
    } catch (error) {
        console.error('Get room error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.joinRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const userId = req.userId;

        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        const isAlreadyParticipant = room.participants.some(
            p => p.user.toString() === userId
        );

        if (isAlreadyParticipant) {
            return res.status(400).json({ message: 'Already a participant' });
        }

        if (room.participants.length >= room.maxParticipants) {
            return res.status(400).json({ message: 'Room is full' });
        }

        room.participants.push({ user: userId });
        await room.save();

        res.json({ message: 'Joined room successfully' });
    } catch (error) {
        console.error('Join room error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getRoomMessages = async (req, res) => {
    try {
        const { roomId } = req.params;
        const { page = 1, limit = 50 } = req.query;

        const messages = await Message.find({ room: roomId })
            .populate('user', 'username')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        res.json(messages.reverse());
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

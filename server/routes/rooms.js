const express = require('express');
const roomController = require('../controllers/roomController');
const auth = require('../middleware/auth');
const {
    validateRoom,
    validateObjectId,
    validatePagination
} = require('../middleware/validation');

const router = express.Router();

// Get all public rooms
router.get('/', roomController.getAllRooms);

// Create new room
router.post('/', auth, validateRoom, roomController.createRoom);

// Get room by ID
router.get('/:id', auth, validateObjectId('id'), roomController.getRoomById);

// Join room
router.post('/:roomId/join', auth, validateObjectId('roomId'), roomController.joinRoom);

// Get room messages
router.get('/:roomId/messages', auth, validateObjectId('roomId'), roomController.getRoomMessages);

// Add this route to your existing routes
router.post('/:roomId/leave', auth, validateObjectId('roomId'), async (req, res) => {
    try {
        const { roomId } = req.params;
        const userId = req.userId;

        const Room = require('../models/Room');
        await Room.findByIdAndUpdate(roomId, {
            $pull: { participants: { user: userId } }
        });

        res.json({ message: 'Left room successfully' });
    } catch (error) {
        console.error('Leave room error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


// // Leave room
// router.post('/:roomId/leave', auth, validateObjectId('roomId'), async (req, res) => {
//     try {
//         const { roomId } = req.params;
//         const userId = req.userId;

//         const Room = require('../models/Room');
//         await Room.findByIdAndUpdate(roomId, {
//             $pull: { participants: { user: userId } }
//         });

//         res.json({ message: 'Left room successfully' });
//     } catch (error) {
//         console.error('Leave room error:', error);
//         res.status(500).json({ message: 'Server error' });
//     }
// });

// Delete room (only room creator can delete)
router.delete('/:roomId', auth, validateObjectId('roomId'), async (req, res) => {
    try {
        const { roomId } = req.params;
        const userId = req.userId;

        const Room = require('../models/Room');
        const room = await Room.findById(roomId);

        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        if (room.createdBy.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized to delete this room' });
        }

        await Room.findByIdAndDelete(roomId);
        res.json({ message: 'Room deleted successfully' });
    } catch (error) {
        console.error('Delete room error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

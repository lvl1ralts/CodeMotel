const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Room name is required'],
        trim: true,
        minlength: [3, 'Room name must be at least 3 characters'],
        maxlength: [100, 'Room name cannot exceed 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Room creator is required']
    },
    participants: [{
        user: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User',
            required: true
        },
        joinedAt: { 
            type: Date, 
            default: Date.now 
        },
        isActive: { 
            type: Boolean, 
            default: true 
        }
    }],
    isPrivate: {
        type: Boolean,
        default: false
    },
    maxParticipants: {
        type: Number,
        default: 10,
        min: [2, 'Room must allow at least 2 participants'],
        max: [100, 'Room cannot exceed 100 participants']
    },
    tags: [{
        type: String,
        trim: true,
        maxlength: [20, 'Each tag cannot exceed 20 characters']
    }],
    currentProblem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem'
    }
}, {
    timestamps: true
});

// Add index for better query performance
RoomSchema.index({ isPrivate: 1, createdAt: -1 });
RoomSchema.index({ 'participants.user': 1 });

module.exports = mongoose.model('Room', RoomSchema);

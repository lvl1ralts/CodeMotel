const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    messageType: {
        type: String,
        enum: ['text', 'code', 'system'],
        default: 'text'
    },
    codeSnippet: {
        language: String,
        code: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Message', MessageSchema);

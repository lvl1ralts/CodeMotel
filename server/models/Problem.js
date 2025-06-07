const mongoose = require('mongoose');

const ProblemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        required: true
    },
    tags: [String],
    category: {
        type: String,
        required: true
    },
    examples: [{
        input: String,
        output: String,
        explanation: String
    }],
    constraints: [String],
    starterCode: {
        javascript: String,
        python: String,
        java: String,
        cpp: String
    },
    testCases: [{
        input: String,
        expectedOutput: String,
        isHidden: { type: Boolean, default: false }
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    solutions: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        code: String,
        language: String,
        explanation: String,
        likes: { type: Number, default: 0 },
        comments: [{
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            content: String,
            createdAt: { type: Date, default: Date.now }
        }],
        createdAt: { type: Date, default: Date.now }
    }],
    stats: {
        totalAttempts: { type: Number, default: 0 },
        successfulSubmissions: { type: Number, default: 0 },
        bookmarks: { type: Number, default: 0 }
    },
    // NEW FIELDS FOR IMPORTED PROBLEMS
    externalLink: {
        type: String,
        trim: true
    },
    platform: {
        type: String,
        trim: true
    },
    isImported: {
        type: Boolean,
        default: false
    },
    source: {
        type: String,
        trim: true
    },
    limits: {
        timeLimit: { type: Number, default: 1000 }, // milliseconds
        memoryLimit: { type: Number, default: 256 } // MB
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Problem', ProblemSchema);

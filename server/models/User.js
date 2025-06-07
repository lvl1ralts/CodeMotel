const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 30
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    profile: {
        firstName: { type: String, trim: true },
        lastName: { type: String, trim: true },
        bio: { type: String, maxlength: 500 },
        skills: [String],
        experience: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'] },
        avatar: { type: String }
    },
    bookmarkedProblems: [{
        problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem' },
        dateBookmarked: { type: Date, default: Date.now }
    }],
    solvedProblems: [{
        problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem' },
        solution: { type: String },
        language: { type: String },
        dateSolved: { type: Date, default: Date.now }
    }],
    contributions: {
        problemsCreated: { type: Number, default: 0 },
        solutionsShared: { type: Number, default: 0 },
        commentsPosted: { type: Number, default: 0 }
    }
}, {
    timestamps: true
});

UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

UserSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);

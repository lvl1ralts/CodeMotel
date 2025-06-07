const User = require('../models/User');
const Problem = require('../models/Problem');

exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId)
            .select('-password')
            .populate('bookmarkedProblems.problem', 'title difficulty category')
            .populate('solvedProblems.problem', 'title difficulty');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateUserProfile = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            bio,
            skills,
            experience
        } = req.body;

        const user = await User.findByIdAndUpdate(
            req.userId,
            {
                $set: {
                    'profile.firstName': firstName,
                    'profile.lastName': lastName,
                    'profile.bio': bio,
                    'profile.skills': skills,
                    'profile.experience': experience
                }
            },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            message: 'Profile updated successfully',
            user
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getUserBookmarks = async (req, res) => {
    try {
        const user = await User.findById(req.userId)
            .populate({
                path: 'bookmarkedProblems.problem',
                select: 'title description difficulty category tags createdAt stats',
                populate: {
                    path: 'createdBy',
                    select: 'username'
                }
            });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Sort bookmarks by date (newest first)
        const sortedBookmarks = user.bookmarkedProblems.sort((a, b) => 
            new Date(b.dateBookmarked) - new Date(a.dateBookmarked)
        );

        res.json(sortedBookmarks);
    } catch (error) {
        console.error('Get bookmarks error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getUserSolutions = async (req, res) => {
    try {
        const user = await User.findById(req.userId)
            .populate({
                path: 'solvedProblems.problem',
                select: 'title difficulty category'
            });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Sort solutions by date (newest first)
        const sortedSolutions = user.solvedProblems.sort((a, b) => 
            new Date(b.dateSolved) - new Date(a.dateSolved)
        );

        res.json(sortedSolutions);
    } catch (error) {
        console.error('Get solutions error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getUserStats = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Calculate user statistics
        const stats = {
            totalProblemsBookmarked: user.bookmarkedProblems.length,
            totalProblemsSolved: user.solvedProblems.length,
            totalContributions: user.contributions.problemsCreated + 
                               user.contributions.solutionsShared + 
                               user.contributions.commentsPosted,
            difficultyBreakdown: {
                easy: 0,
                medium: 0,
                hard: 0
            },
            languageStats: {},
            recentActivity: []
        };

        // Get difficulty breakdown for solved problems
        await User.populate(user, {
            path: 'solvedProblems.problem',
            select: 'difficulty'
        });

        user.solvedProblems.forEach(solved => {
            if (solved.problem && solved.problem.difficulty) {
                const difficulty = solved.problem.difficulty.toLowerCase();
                if (stats.difficultyBreakdown[difficulty] !== undefined) {
                    stats.difficultyBreakdown[difficulty]++;
                }
            }

            // Count language usage
            if (solved.language) {
                stats.languageStats[solved.language] = (stats.languageStats[solved.language] || 0) + 1;
            }
        });

        // Get recent activity (last 10 solved problems)
        stats.recentActivity = user.solvedProblems
            .sort((a, b) => new Date(b.dateSolved) - new Date(a.dateSolved))
            .slice(0, 10)
            .map(solved => ({
                type: 'solved',
                problemTitle: solved.problem?.title || 'Problem',
                language: solved.language,
                date: solved.dateSolved
            }));

        res.json(stats);
    } catch (error) {
        console.error('Get user stats error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.searchUsers = async (req, res) => {
    try {
        const { query, page = 1, limit = 20 } = req.query;
        
        if (!query || query.trim().length < 2) {
            return res.status(400).json({ message: 'Search query must be at least 2 characters' });
        }

        const searchRegex = new RegExp(query.trim(), 'i');
        
        const users = await User.find({
            $or: [
                { username: searchRegex },
                { 'profile.firstName': searchRegex },
                { 'profile.lastName': searchRegex },
                { 'profile.skills': { $in: [searchRegex] } }
            ]
        })
        .select('username profile.firstName profile.lastName profile.skills profile.experience')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ username: 1 });

        const total = await User.countDocuments({
            $or: [
                { username: searchRegex },
                { 'profile.firstName': searchRegex },
                { 'profile.lastName': searchRegex },
                { 'profile.skills': { $in: [searchRegex] } }
            ]
        });

        res.json({
            users,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        console.error('Search users error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.followUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.userId;

        if (userId === currentUserId) {
            return res.status(400).json({ message: 'Cannot follow yourself' });
        }

        const userToFollow = await User.findById(userId);
        if (!userToFollow) {
            return res.status(404).json({ message: 'User not found' });
        }

        const currentUser = await User.findById(currentUserId);
        
        // Check if already following
        const isFollowing = currentUser.following && 
                           currentUser.following.includes(userId);

        if (isFollowing) {
            // Unfollow
            await User.findByIdAndUpdate(currentUserId, {
                $pull: { following: userId }
            });
            await User.findByIdAndUpdate(userId, {
                $pull: { followers: currentUserId }
            });
            res.json({ message: 'User unfollowed', isFollowing: false });
        } else {
            // Follow
            await User.findByIdAndUpdate(currentUserId, {
                $addToSet: { following: userId }
            });
            await User.findByIdAndUpdate(userId, {
                $addToSet: { followers: currentUserId }
            });
            res.json({ message: 'User followed', isFollowing: true });
        }
    } catch (error) {
        console.error('Follow user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteAccount = async (req, res) => {
    try {
        const { password } = req.body;
        
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify password before deletion
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        // Delete user account
        await User.findByIdAndDelete(req.userId);
        
        // TODO: Clean up user data from other collections
        // - Remove user from room participants
        // - Delete user's problems or transfer ownership
        // - Remove user from problem solutions

        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

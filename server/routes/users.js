const express = require('express');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const {
    validateProfileUpdate,
    validateObjectId,
    validatePagination,
    validateSearch,
    validateRateLimit
} = require('../middleware/validation');

const router = express.Router();

// Apply rate limiting to all user routes
router.use(validateRateLimit(50, 15 * 60 * 1000)); // 50 requests per 15 minutes

// Get current user profile
router.get('/profile', auth, userController.getUserProfile);

// Update user profile
router.put('/profile', auth, validateProfileUpdate, userController.updateUserProfile);

// Get user bookmarks
router.get('/bookmarks', auth, userController.getUserBookmarks);

// Get user solutions
router.get('/solutions', auth, userController.getUserSolutions);

// Get user statistics
router.get('/stats', auth, userController.getUserStats);

// Search users
router.get('/search', validateSearch, validatePagination, userController.searchUsers);

// Get user by ID (public profile)
router.get('/:userId', validateObjectId('userId'), async (req, res) => {
    try {
        const user = await require('../models/User')
            .findById(req.params.userId)
            .select('username profile createdAt contributions')
            .populate('solvedProblems.problem', 'title difficulty')
            .lean();

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Calculate public stats
        const publicStats = {
            totalProblemsSolved: user.solvedProblems?.length || 0,
            totalContributions: user.contributions?.problemsCreated || 0,
            memberSince: user.createdAt,
            difficultyBreakdown: {
                easy: 0,
                medium: 0,
                hard: 0
            }
        };

        // Count difficulty breakdown
        if (user.solvedProblems) {
            user.solvedProblems.forEach(solved => {
                if (solved.problem && solved.problem.difficulty) {
                    const difficulty = solved.problem.difficulty.toLowerCase();
                    if (publicStats.difficultyBreakdown[difficulty] !== undefined) {
                        publicStats.difficultyBreakdown[difficulty]++;
                    }
                }
            });
        }

        res.json({
            user: {
                id: user._id,
                username: user.username,
                profile: user.profile,
                memberSince: user.createdAt
            },
            stats: publicStats
        });
    } catch (error) {
        console.error('Get user by ID error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Follow/unfollow user
router.post('/:userId/follow', auth, validateObjectId('userId'), userController.followUser);

// Delete user account
router.delete('/account', auth, async (req, res) => {
    try {
        const { password } = req.body;
        
        if (!password) {
            return res.status(400).json({ message: 'Password is required to delete account' });
        }

        await userController.deleteAccount(req, res);
    } catch (error) {
        console.error('Delete account route error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user's activity feed
router.get('/activity/feed', auth, async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const userId = req.userId;

        // Get user's recent activities
        const user = await require('../models/User')
            .findById(userId)
            .populate({
                path: 'solvedProblems.problem',
                select: 'title difficulty category',
                options: { sort: { 'solvedProblems.dateSolved': -1 } }
            })
            .populate({
                path: 'bookmarkedProblems.problem',
                select: 'title difficulty category',
                options: { sort: { 'bookmarkedProblems.dateBookmarked': -1 } }
            });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const activities = [];

        // Add solved problems to activity feed
        user.solvedProblems.forEach(solved => {
            activities.push({
                type: 'solved_problem',
                date: solved.dateSolved,
                problem: solved.problem,
                language: solved.language
            });
        });

        // Add bookmarked problems to activity feed
        user.bookmarkedProblems.forEach(bookmark => {
            activities.push({
                type: 'bookmarked_problem',
                date: bookmark.dateBookmarked,
                problem: bookmark.problem
            });
        });

        // Sort by date (newest first)
        activities.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Paginate results
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const paginatedActivities = activities.slice(startIndex, endIndex);

        res.json({
            activities: paginatedActivities,
            totalPages: Math.ceil(activities.length / limit),
            currentPage: parseInt(page),
            total: activities.length
        });
    } catch (error) {
        console.error('Get activity feed error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

const Problem = require('../models/Problem');
const User = require('../models/User');

exports.getAllProblems = async (req, res) => {
    try {
        const { page = 1, limit = 20, difficulty, category, tags } = req.query;
        
        let filter = {};
        if (difficulty) filter.difficulty = difficulty;
        if (category) filter.category = category;
        if (tags) filter.tags = { $in: tags.split(',') };

        const problems = await Problem.find(filter)
            .populate('createdBy', 'username')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Problem.countDocuments(filter);

        res.json({
            problems,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        console.error('Get problems error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getProblemById = async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id)
            .populate('createdBy', 'username')
            .populate('solutions.user', 'username');
        
        if (!problem) {
            return res.status(404).json({ message: 'Problem not found' });
        }

        res.json(problem);
    } catch (error) {
        console.error('Get problem error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createProblem = async (req, res) => {
    try {
        console.log('Received problem data:', req.body); // DEBUG LOG

        const {
            title,
            description,
            difficulty,
            tags = [],
            category,
            examples = [],
            constraints = [],
            starterCode = {},
            testCases = [],
            // NEW FIELDS for imported problems
            externalLink,
            platform,
            isImported = false,
            source = 'original',
            limits = { timeLimit: 1000, memoryLimit: 256 }
        } = req.body;

        // Set default category if not provided
        const finalCategory = category || platform || 'General';

        const problem = new Problem({
            title,
            description,
            difficulty,
            tags,
            category: finalCategory,
            examples,
            constraints,
            starterCode,
            testCases,
            createdBy: req.userId,
            // NEW FIELDS
            externalLink,
            platform,
            isImported,
            source,
            limits
        });

        await problem.save();
        
        // Update user contributions
        await User.findByIdAndUpdate(req.userId, {
            $inc: { 'contributions.problemsCreated': 1 }
        });

        res.status(201).json({
            message: 'Problem created successfully',
            problem
        });
    } catch (error) {
        console.error('Create problem error:', error);
        
        // Handle specific validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => ({
                field: err.path,
                message: err.message
            }));
            return res.status(400).json({ 
                message: 'Validation failed', 
                errors 
            });
        }
        
        res.status(500).json({ message: 'Server error during problem creation' });
    }
};


exports.bookmarkProblem = async (req, res) => {
    try {
        const { problemId } = req.params;
        const userId = req.userId;

        const user = await User.findById(userId);
        const isBookmarked = user.bookmarkedProblems.some(
            bookmark => bookmark.problem.toString() === problemId
        );

        if (isBookmarked) {
            // Remove bookmark
            user.bookmarkedProblems = user.bookmarkedProblems.filter(
                bookmark => bookmark.problem.toString() !== problemId
            );
            await Problem.findByIdAndUpdate(problemId, {
                $inc: { 'stats.bookmarks': -1 }
            });
        } else {
            // Add bookmark
            user.bookmarkedProblems.push({ problem: problemId });
            await Problem.findByIdAndUpdate(problemId, {
                $inc: { 'stats.bookmarks': 1 }
            });
        }

        await user.save();
        
        res.json({
            message: isBookmarked ? 'Bookmark removed' : 'Problem bookmarked',
            isBookmarked: !isBookmarked
        });
    } catch (error) {
        console.error('Bookmark error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.submitSolution = async (req, res) => {
    try {
        const { problemId } = req.params;
        const { code, language, explanation } = req.body;

        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ message: 'Problem not found' });
        }

        // Add solution to problem
        problem.solutions.push({
            user: req.userId,
            code,
            language,
            explanation
        });

        await problem.save();

        // Update user's solved problems
        await User.findByIdAndUpdate(req.userId, {
            $push: {
                solvedProblems: {
                    problem: problemId,
                    solution: code,
                    language
                }
            },
            $inc: { 'contributions.solutionsShared': 1 }
        });

        res.json({ message: 'Solution submitted successfully' });
    } catch (error) {
        console.error('Submit solution error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

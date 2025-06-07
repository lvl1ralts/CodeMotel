const express = require('express');
const problemController = require('../controllers/problemController');
const auth = require('../middleware/auth');
const {
    validateProblem,
    validateSolution,
    validateObjectId,
    validatePagination
} = require('../middleware/validation');

const router = express.Router();

// Get all problems
router.get('/', validatePagination, problemController.getAllProblems);

// Get problem by ID
router.get('/:id', validateObjectId('id'), problemController.getProblemById);

// Create new problem
router.post('/', auth, validateProblem, problemController.createProblem);

// Update problem (only creator can update)
router.put('/:id', auth, validateObjectId('id'), validateProblem, async (req, res) => {
    try {
        const Problem = require('../models/Problem');
        const problem = await Problem.findById(req.params.id);

        if (!problem) {
            return res.status(404).json({ message: 'Problem not found' });
        }

        if (problem.createdBy.toString() !== req.userId) {
            return res.status(403).json({ message: 'Not authorized to update this problem' });
        }

        const updatedProblem = await Problem.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('createdBy', 'username');

        res.json({
            message: 'Problem updated successfully',
            problem: updatedProblem
        });
    } catch (error) {
        console.error('Update problem error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete problem (only creator can delete)
router.delete('/:id', auth, validateObjectId('id'), async (req, res) => {
    try {
        const Problem = require('../models/Problem');
        const problem = await Problem.findById(req.params.id);

        if (!problem) {
            return res.status(404).json({ message: 'Problem not found' });
        }

        if (problem.createdBy.toString() !== req.userId) {
            return res.status(403).json({ message: 'Not authorized to delete this problem' });
        }

        await Problem.findByIdAndDelete(req.params.id);
        res.json({ message: 'Problem deleted successfully' });
    } catch (error) {
        console.error('Delete problem error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Bookmark/unbookmark problem
router.post('/:problemId/bookmark', auth, validateObjectId('problemId'), problemController.bookmarkProblem);

// Submit solution
router.post('/:problemId/solution', auth, validateObjectId('problemId'), validateSolution, problemController.submitSolution);

// Get problem solutions
router.get('/:problemId/solutions', validateObjectId('problemId'), async (req, res) => {
    try {
        const Problem = require('../models/Problem');
        const problem = await Problem.findById(req.params.problemId)
            .populate('solutions.user', 'username')
            .select('solutions');

        if (!problem) {
            return res.status(404).json({ message: 'Problem not found' });
        }

        res.json(problem.solutions);
    } catch (error) {
        console.error('Get solutions error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

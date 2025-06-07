const { body, param, query, validationResult } = require('express-validator');

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};

// User validation rules
const validateUserRegistration = [
    body('username')
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be between 3 and 30 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),
    
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email address')
        .normalizeEmail(),
    
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    
    body('firstName')
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('First name must be between 1 and 50 characters'),
    
    body('lastName')
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Last name must be between 1 and 50 characters'),
    
    handleValidationErrors
];

const validateUserLogin = [
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email address')
        .normalizeEmail(),
    
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    
    handleValidationErrors
];

const validateProfileUpdate = [
    body('firstName')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('First name must be between 1 and 50 characters'),
    
    body('lastName')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Last name must be between 1 and 50 characters'),
    
    body('bio')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Bio must not exceed 500 characters'),
    
    body('skills')
        .optional()
        .isArray()
        .withMessage('Skills must be an array'),
    
    body('skills.*')
        .optional()
        .trim()
        .isLength({ min: 1, max: 30 })
        .withMessage('Each skill must be between 1 and 30 characters'),
    
    body('experience')
        .optional()
        .isIn(['Beginner', 'Intermediate', 'Advanced'])
        .withMessage('Experience must be Beginner, Intermediate, or Advanced'),
    
    handleValidationErrors
];

// Problem validation rules
// Problem validation rules - RELAXED VERSION
const validateProblem = [
    body('title')
        .trim()
        .isLength({ min: 3, max: 100 }) // CHANGED: Reduced from 5 to 3
        .withMessage('Title must be between 3 and 100 characters'),
    
    body('description')
        .trim()
        .isLength({ min: 10, max: 5000 }) // CHANGED: Reduced from 20 to 10
        .withMessage('Description must be between 10 and 5000 characters'),
    
    body('difficulty')
        .isIn(['Easy', 'Medium', 'Hard'])
        .withMessage('Difficulty must be Easy, Medium, or Hard'),
    
    body('category')
        .optional() // CHANGED: Made optional with default
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Category must not exceed 50 characters'),
    
    body('tags')
        .optional()
        .isArray()
        .withMessage('Tags must be an array'),
    
    body('tags.*')
        .optional()
        .trim()
        .isLength({ min: 1, max: 20 })
        .withMessage('Each tag must be between 1 and 20 characters'),
    
    body('examples')
        .optional()
        .isArray()
        .withMessage('Examples must be an array'),
    
    body('constraints')
        .optional()
        .isArray()
        .withMessage('Constraints must be an array'),
    
    // NEW: Add validation for imported problem fields
    body('externalLink')
        .optional()
        .isURL()
        .withMessage('External link must be a valid URL'),
    
    body('platform')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Platform must not exceed 50 characters'),
    
    body('isImported')
        .optional()
        .isBoolean()
        .withMessage('isImported must be a boolean'),
    
    handleValidationErrors
];


const validateSolution = [
    body('code')
        .trim()
        .isLength({ min: 1, max: 10000 })
        .withMessage('Code must be between 1 and 10000 characters'),
    
    body('language')
        .isIn(['javascript', 'python', 'java', 'cpp', 'c'])
        .withMessage('Language must be javascript, python, java, cpp, or c'),
    
    body('explanation')
        .optional()
        .trim()
        .isLength({ max: 2000 })
        .withMessage('Explanation must not exceed 2000 characters'),
    
    handleValidationErrors
];

// Room validation rules
const validateRoom = [
    body('name')
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('Room name must be between 3 and 100 characters'),
    
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description must not exceed 500 characters'),
    
    body('maxParticipants')
        .optional()
        .isInt({ min: 2, max: 100 })
        .withMessage('Max participants must be between 2 and 100'),
    
    body('isPrivate')
        .optional()
        .isBoolean()
        .withMessage('isPrivate must be a boolean'),
    
    body('tags')
        .optional()
        .isArray()
        .withMessage('Tags must be an array'),
    
    body('tags.*')
        .optional()
        .trim()
        .isLength({ min: 1, max: 20 })
        .withMessage('Each tag must be between 1 and 20 characters'),
    
    handleValidationErrors
];

const validateMessage = [
    body('content')
        .trim()
        .isLength({ min: 1, max: 1000 })
        .withMessage('Message content must be between 1 and 1000 characters'),
    
    body('messageType')
        .optional()
        .isIn(['text', 'code', 'system'])
        .withMessage('Message type must be text, code, or system'),
    
    handleValidationErrors
];

// Parameter validation
const validateObjectId = (paramName) => [
    param(paramName)
        .isMongoId()
        .withMessage(`${paramName} must be a valid ObjectId`),
    
    handleValidationErrors
];

// Query validation
const validatePagination = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    
    handleValidationErrors
];

const validateSearch = [
    query('query')
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Search query must be between 1 and 100 characters'),
    
    handleValidationErrors
];

// Code execution validation
const validateCodeExecution = [
    body('code')
        .trim()
        .isLength({ min: 1, max: 10000 })
        .withMessage('Code must be between 1 and 10000 characters'),
    
    body('language')
        .isIn(['javascript', 'python', 'java', 'cpp'])
        .withMessage('Language must be javascript, python, java, or cpp'),
    
    body('input')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Input must not exceed 1000 characters'),
    
    handleValidationErrors
];

// Rate limiting validation
const validateRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
    const requests = new Map();
    
    return (req, res, next) => {
        const key = req.ip + (req.userId || '');
        const now = Date.now();
        const windowStart = now - windowMs;
        
        if (!requests.has(key)) {
            requests.set(key, []);
        }
        
        const userRequests = requests.get(key);
        
        // Remove old requests
        while (userRequests.length > 0 && userRequests[0] < windowStart) {
            userRequests.shift();
        }
        
        if (userRequests.length >= maxRequests) {
            return res.status(429).json({
                message: 'Too many requests, please try again later.',
                retryAfter: Math.ceil((userRequests[0] + windowMs - now) / 1000)
            });
        }
        
        userRequests.push(now);
        next();
    };
};

module.exports = {
    validateUserRegistration,
    validateUserLogin,
    validateProfileUpdate,
    validateProblem,
    validateSolution,
    validateRoom,
    validateMessage,
    validateObjectId,
    validatePagination,
    validateSearch,
    validateCodeExecution,
    validateRateLimit,
    handleValidationErrors
};

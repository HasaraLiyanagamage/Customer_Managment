const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { 
  getUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser,
  updateProfile
} = require('../controllers/user.controller');
const { auth, authorize } = require('../middleware/auth.middleware');

// Apply auth middleware to all routes
router.use(auth);

// @route   GET /api/users
// @desc    Get all users with pagination and search
// @access  Private/Admin
router.get('/', authorize('admin'), getUsers);

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private/Admin
router.get('/:id', authorize('admin'), getUserById);

// @route   POST /api/users
// @desc    Create a new user
// @access  Private/Admin
router.post(
  '/',
  [
    authorize('admin'),
    [
      check('username', 'Username is required').not().isEmpty(),
      check('email', 'Please include a valid email').isEmail(),
      check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
      check('first_name', 'First name is required').not().isEmpty(),
      check('last_name', 'Last name is required').not().isEmpty(),
      check('role_id', 'Role ID is required').isInt()
    ]
  ],
  createUser
);

// @route   PUT /api/users/:id
// @desc    Update a user
// @access  Private/Admin
router.put(
  '/:id',
  [
    authorize('admin'),
    [
      check('email', 'Please include a valid email').optional().isEmail(),
      check('password', 'Please enter a password with 6 or more characters').optional().isLength({ min: 6 }),
      check('role_id', 'Role ID must be an integer').optional().isInt()
    ]
  ],
  updateUser
);

// @route   DELETE /api/users/:id
// @desc    Delete a user
// @access  Private/Admin
router.delete('/:id', authorize('admin'), deleteUser);

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put(
  '/profile',
  [
    check('email', 'Please include a valid email').optional().isEmail(),
    check('currentPassword', 'Current password is required when changing password').if(
      (req) => req.body.newPassword
    ).notEmpty(),
    check('newPassword', 'New password must be at least 6 characters long').if(
      (req) => req.body.currentPassword
    ).isLength({ min: 6 })
  ],
  updateProfile
);

module.exports = router;

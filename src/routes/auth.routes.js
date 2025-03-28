const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const {
  registerUser,
  loginUser,
  getUserProfile,
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

// Register user
router.post(
  '/register',
  [
    check('fullName', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('walletAddress', 'Wallet address is required').not().isEmpty(),
  ],
  registerUser
);

// Login user
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('walletAddress', 'Wallet Address is required').exists(),
  ],
  loginUser
);

// Get user profile
router.get('/profile', protect, getUserProfile);

module.exports = router;
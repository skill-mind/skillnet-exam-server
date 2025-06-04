import express from 'express';
import { check } from 'express-validator';
import {
  registerUser,
  loginUser,
  getUserProfile,
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

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

export default router;
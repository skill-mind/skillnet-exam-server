import express from 'express';
import { check } from 'express-validator';
import * as userController from '../controllers/user.controller.js';
import { protect, admin } from '../middleware/auth.middleware.js';

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, userController.getUserProfile);

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, userController.updateUserProfile);

// @route   GET /api/users/wallet/:address
// @desc    Get user by wallet address
// @access  Public
router.get('/wallet/:address', userController.getUserByWallet);

// @route   GET /api/users
// @desc    Get all users
// @access  Private/Admin
router.get('/', [protect, admin], userController.getUsers);

export default router;
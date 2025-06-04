import { User } from '../models/index.js';
import asyncHandler from 'express-async-handler';

// @desc    Get user profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ['password'] }
  });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.status(200).json(user);
});

// @desc    Update user profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  try {
    if (!req.body) {
      res.status(400);
      return res.json({ message: 'Request body is required' });
    }
    const user = await User.findByPk(req.user.id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const { fullName, email } = req.body;

    // Update fields if provided
    if (fullName) user.fullName = fullName;
    if (email) user.email = email;

    await user.save();

    res.status(200).json({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      walletAddress: user.walletAddress,
      role: user.role
    });
  } catch (error) {
    res.status(500);
    throw new Error('Error updating user profile: ' + error.message);
  }
});

// @desc    Get user by wallet address
// @access  Public
const getUserByWallet = asyncHandler(async (req, res) => {
  const user = await User.findOne({
    where: { walletAddress: req.params.address },
    attributes: { exclude: ['password'] }
  });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.status(200).json(user);
});

// @desc    Get all users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.findAll({
    attributes: { exclude: ['password'] }
  });

  res.status(200).json(users);
});

export {
  getUserProfile,
  updateUserProfile,
  getUserByWallet,
  getUsers
};
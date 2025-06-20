import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import { User } from '../models/index.js';
import asyncHandler from 'express-async-handler';
import { Op } from 'sequelize';

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Remove role from destructuring
  const { fullName, email, walletAddress } = req.body;

  // Check if user exists
  const userExists = await User.findOne({
    where: {
      [Op.or]: [
        { email },
        ...(walletAddress ? [{ walletAddress }] : [])
      ]
    }
  });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Always assign default role 'user', ignore any provided role
  const user = await User.create({
    fullName,
    email,
    walletAddress,
    role: 'user',
  });

  if (user) {
    res.status(201).json({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      walletAddress: user.walletAddress,
      role: user.role,
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, walletAddress } = req.body;

  // Check for user email
  const user = await User.findOne({ where: { email, walletAddress } });

  if (user && walletAddress) {
    res.json({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      walletAddress: user.walletAddress,
      role: user.role,
      token: generateToken(user.id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid credentials');
  }
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ['password'] }
  });

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

export {
  registerUser,
  loginUser,
  getUserProfile,
};
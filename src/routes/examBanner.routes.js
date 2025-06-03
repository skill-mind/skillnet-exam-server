import express from 'express';
import { check } from 'express-validator';
import * as examBannerController from '../controllers/examBanner.controller.js';
import { protect, admin } from '../middleware/auth.middleware.js';

const router = express.Router();

// @route   GET /api/exam-banners
// @desc    Get all exam banners
// @access  Public
router.get('/', examBannerController.getExamBanners);

// @route   GET /api/exam-banners/:id
// @desc    Get exam banner by ID
// @access  Public
router.get('/:id', examBannerController.getExamBannerById);

// @route   POST /api/exam-banners
// @desc    Create a new exam banner
// @access  Private/Admin
router.post('/', [
  protect,
  admin,
  [
    check('title', 'Title is required').not().isEmpty(),
    check('startDate', 'Start date is required').not().isEmpty(),
    check('endDate', 'End date is required').not().isEmpty(),
  ]
], examBannerController.createExamBanner);

// @route   PUT /api/exam-banners/:id
// @desc    Update an exam banner
// @access  Private/Admin
router.put('/:id', [protect, admin], examBannerController.updateExamBanner);

// @route   DELETE /api/exam-banners/:id
// @desc    Delete an exam banner
// @access  Private/Admin
router.delete('/:id', [protect, admin], examBannerController.deleteExamBanner);

export default router;

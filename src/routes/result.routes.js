const express = require('express');
const router = express.Router();
const resultController = require('../controllers/result.controller');
const { protect } = require('../middleware/auth.middleware');

// @route   POST /api/results
// @desc    Submit exam and create result
// @access  Private
router.post('/', protect, resultController.submitExam);

// @route   GET /api/results/user
// @desc    Get user's results
// @access  Private
router.get('/user', protect, resultController.getUserResults);

// @route   GET /api/results/:id
// @desc    Get result by ID
// @access  Private
router.get('/:id', protect, resultController.getResultById);

// @route   GET /api/results/certificate/:id
// @desc    Generate certificate for a result
// @access  Private
router.get('/certificate/:id', protect, resultController.generateCertificate);

module.exports = router;
const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const registrationController = require('../controllers/registration.controller');
const { protect } = require('../middleware/auth.middleware');

// @route   POST /api/registrations
// @desc    Register for an exam
// @access  Private
router.post('/', [
  protect,
  [
    check('examId', 'Exam ID is required').not().isEmpty()
  ]
], registrationController.registerForExam);

// @route   PUT /api/registrations/:id/payment
// @desc    Update payment status
// @access  Private
router.put('/:id/payment', protect, registrationController.updatePaymentStatus);

// @route   GET /api/registrations/user
// @desc    Get user's registrations
// @access  Private
router.get('/user', protect, registrationController.getUserRegistrations);

// @route   POST /api/registrations/validate
// @desc    Validate exam code
// @access  Public
router.post('/validate', [
  check('email', 'Email is required').isEmail(),
  check('examCode', 'Exam code is required').not().isEmpty()
], registrationController.validateExamCode);

module.exports = router;
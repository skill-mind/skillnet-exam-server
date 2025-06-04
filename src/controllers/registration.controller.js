import { Registration, User, Exam } from '../models/index.js';
import { validationResult } from 'express-validator';
import asyncHandler from 'express-async-handler';

// @desc    Register for an exam
// @access  Private
const registerForExam = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { examId } = req.body;
  const userId = req.user.id;

  // Check if exam exists
  const exam = await Exam.findByPk(examId);
  if (!exam) {
    res.status(404);
    throw new Error('Exam not found');
  }

  // Check if already registered
  const existingRegistration = await Registration.findOne({
    where: { userId, examId }
  });

  if (existingRegistration) {
    res.status(400);
    throw new Error('Already registered for this exam');
  }

  // Create registration
  const registration = await Registration.create({
    userId,
    examId,
    paymentStatus: 'pending'
  });

  res.status(201).json(registration);
});

// @desc    Update payment status
// @access  Private
const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { paymentStatus } = req.body;
  const userId = req.user.id;

  const registration = await Registration.findOne({
    where: { id: req.params.id, userId }
  });

  if (!registration) {
    res.status(404);
    throw new Error('Registration not found');
  }

  registration.paymentStatus = paymentStatus;
  await registration.save();

  res.status(200).json(registration);
});

// @desc    Get user's registrations
// @access  Private
const getUserRegistrations = asyncHandler(async (req, res) => {
  const registrations = await Registration.findAll({
    where: { userId: req.user.id },
    include: [
      {
        model: Exam,
        attributes: ['id', 'name', 'category', 'date', 'duration', 'passingScore']
      }
    ]
  });

  res.status(200).json(registrations);
});

// @desc    Validate exam code
// @access  Public
const validateExamCode = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, examCode } = req.body;

  // Find user by email
  const user = await User.findOne({ where: { email } });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Find registration by exam code and user
  const registration = await Registration.findOne({
    where: { 
      examCode,
      userId: user.id,
      paymentStatus: 'completed'
    },
    include: [
      {
        model: Exam,
        attributes: { exclude: ['createdAt', 'updatedAt'] }
      }
    ]
  });

  if (!registration) {
    res.status(404);
    throw new Error('Invalid exam code or payment not completed');
  }

  res.status(200).json({
    registration,
    exam: registration.Exam,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email
    }
  });
});

export {
  registerForExam,
  updatePaymentStatus,
  getUserRegistrations,
  validateExamCode
};
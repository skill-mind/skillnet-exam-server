import express from 'express';
import { check } from 'express-validator';
import * as examController from '../controllers/exam.controller.js';
import { protect, admin } from '../middleware/auth.middleware.js';

const router = express.Router();

// @route   GET /api/exams
// @desc    Get all exams
// @access  Public
router.get('/', examController.getExams);

// @route   GET /api/exams/category/:category
// @desc    Get exams by category
// @access  Public
router.get('/category/:category', examController.getExamsByCategory);

// @route   GET /api/exams/:id
// @desc    Get exam by ID
// @access  Public
router.get('/:id', examController.getExamById);

// @route   POST /api/exams
// @desc    Create a new exam
// @access  Private/Admin
router.post('/', [
  protect,
  admin,
  [
    check('name', 'Name is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('category', 'Category is required').not().isEmpty(),
    check('date', 'Date is required').not().isEmpty(),
    check('duration', 'Duration is required').isNumeric(),
    check('passingScore', 'Passing score is required').isNumeric(),
    check('price', 'Price is required').isNumeric()
  ]
], examController.createExam);

// @route   PUT /api/exams/:id
// @desc    Update an exam
// @access  Private/Admin
router.put('/:id', [protect, admin], examController.updateExam);

// @route   DELETE /api/exams/:id
// @desc    Delete an exam
// @access  Private/Admin
router.delete('/:id', [protect, admin], examController.deleteExam);

export default router;
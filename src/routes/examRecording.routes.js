const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const examRecordingController = require('../controllers/examRecording.controller');
const { protect, admin } = require('../middleware/auth.middleware');

// @route   GET /api/exam-recordings
// @desc    Get all exam recordings
// @access  Public
router.get('/', examRecordingController.getExamRecordings);

// @route   GET /api/exam-recordings/:id
// @desc    Get exam recording by ID
// @access  Public
router.get('/:id', examRecordingController.getExamRecordingById);

// @route   POST /api/exam-recordings
// @desc    Create a new exam recording
// @access  Private/Admin
router.post('/', [
  protect,
  admin,
  [
    check('title', 'Title is required').not().isEmpty(),
    check('recordingUrl', 'Recording URL is required').not().isEmpty(),
    check('examId', 'Exam ID is required').not().isEmpty(),
  ]
], examRecordingController.createExamRecording);

// @route   PUT /api/exam-recordings/:id
// @desc    Update an exam recording
// @access  Private/Admin
router.put('/:id', [protect, admin], examRecordingController.updateExamRecording);

// @route   PATCH /api/exam-recordings/:id/publish
// @desc    Toggle publish status of an exam recording
// @access  Private/Admin
router.patch('/:id/publish', [protect, admin], examRecordingController.togglePublishStatus);

// @route   DELETE /api/exam-recordings/:id
// @desc    Delete an exam recording
// @access  Private/Admin
router.delete('/:id', [protect, admin], examRecordingController.deleteExamRecording);

module.exports = router;

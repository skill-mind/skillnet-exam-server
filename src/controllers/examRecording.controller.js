const { ExamRecording, Exam } = require('../models');
const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

// @desc    Get all exam recordings
// @route   GET /api/exam-recordings
// @access  Public
const getExamRecordings = asyncHandler(async (req, res) => {
  try {
    const { examId, published } = req.query;

    const whereClause = {};
    if (examId) {
      whereClause.examId = examId;
    }
    if (published === 'true') {
      whereClause.isPublished = true;
    } else if (published === 'false') {
      whereClause.isPublished = false;
    }

    logger.info(`Fetching exam recordings with filters: ${JSON.stringify(whereClause)}`);

    const examRecordings = await ExamRecording.findAll({
      where: whereClause,
      include: [
        {
          model: Exam,
          attributes: ['id', 'name', 'category'],
        },
      ],
      order: [
        ['recordedOn', 'DESC'],
      ],
    });

    logger.info(`Retrieved ${examRecordings.length} exam recordings`);
    res.status(200).json(examRecordings);
  } catch (error) {
    logger.error(`Error retrieving exam recordings: ${error.message}`, { error: error.stack });
    res.status(500);
    throw new Error('Error retrieving exam recordings');
  }
});

// @desc    Get exam recording by ID
// @route   GET /api/exam-recordings/:id
// @access  Public
const getExamRecordingById = asyncHandler(async (req, res) => {
  try {
    logger.info(`Fetching exam recording with id: ${req.params.id}`);

    const examRecording = await ExamRecording.findByPk(req.params.id, {
      include: [
        {
          model: Exam,
          attributes: ['id', 'name', 'category', 'description'],
        },
      ],
    });

    if (!examRecording) {
      logger.warn(`Exam recording with id ${req.params.id} not found`, { recordingId: req.params.id });
      res.status(404);
      throw new Error('Exam recording not found');
    }

    logger.info(`Retrieved exam recording ${examRecording.id}`);
    res.status(200).json(examRecording);
  } catch (error) {
    if (error.message === 'Exam recording not found') {
      throw error;
    }
    logger.error(`Error retrieving exam recording ${req.params.id}: ${error.message}`, {
      recordingId: req.params.id,
      error: error.stack
    });
    res.status(500);
    throw new Error('Error retrieving exam recording');
  }
});

// @desc    Create new exam recording
// @route   POST /api/exam-recordings
// @access  Private (Admin)
const createExamRecording = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn(`Validation errors in creating exam recording: ${JSON.stringify(errors.array())}`, {
      userId: req.user.id,
      validationErrors: errors.array()
    });
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    title,
    description,
    recordingUrl,
    duration,
    examId,
    presenter,
    recordedOn,
    isPublished,
    thumbnailUrl,
    tags,
  } = req.body;

  logger.info(`Admin ${req.user.id} creating exam recording: "${title}"`);

  try {
    // Check if exam exists
    const exam = await Exam.findByPk(examId);
    if (!exam) {
      logger.warn(`Exam with id ${examId} not found while admin ${req.user.id} creating recording`, {
        examId,
        adminId: req.user.id
      });
      res.status(404);
      throw new Error('Exam not found');
    }

    // Create recording
    const recording = await ExamRecording.create({
      title,
      description,
      recordingUrl,
      duration,
      examId,
      presenter,
      recordedOn: recordedOn || new Date(),
      isPublished: isPublished !== undefined ? isPublished : false,
      thumbnailUrl,
      tags: tags || [],
    });

    logger.info(`Created exam recording ${recording.id} by admin ${req.user.id}`, {
      recordingId: recording.id,
      adminId: req.user.id,
      examId: examId,
      isPublished: isPublished !== undefined ? isPublished : false
    });

    // Return the created recording with exam info
    const createdRecording = await ExamRecording.findByPk(recording.id, {
      include: [
        {
          model: Exam,
          attributes: ['id', 'name', 'category'],
        },
      ],
    });

    res.status(201).json(createdRecording);
  } catch (error) {
    if (error.message === 'Exam not found') {
      throw error;
    }
    logger.error(`Error creating exam recording by admin ${req.user.id}: ${error.message}`, {
      adminId: req.user.id,
      examId,
      error: error.stack
    });
    res.status(500);
    throw new Error('Error creating exam recording');
  }
});

// @desc    Update exam recording
// @route   PUT /api/exam-recordings/:id
// @access  Private (Admin)
const updateExamRecording = asyncHandler(async (req, res) => {
  try {
    logger.info(`Admin ${req.user.id} updating exam recording ${req.params.id}`);

    const recording = await ExamRecording.findByPk(req.params.id);

    if (!recording) {
      logger.warn(`Exam recording with id ${req.params.id} not found for update by admin ${req.user.id}`, {
        recordingId: req.params.id,
        adminId: req.user.id
      });
      res.status(404);
      throw new Error('Exam recording not found');
    }

    const {
      title,
      description,
      recordingUrl,
      duration,
      examId,
      presenter,
      recordedOn,
      isPublished,
      thumbnailUrl,
      tags,
    } = req.body;

    // If examId is being changed, verify the new exam exists
    if (examId && examId !== recording.examId) {
      const exam = await Exam.findByPk(examId);
      if (!exam) {
        logger.warn(`Exam with id ${examId} not found while admin ${req.user.id} updating recording ${req.params.id}`, {
          examId,
          recordingId: req.params.id,
          adminId: req.user.id
        });
        res.status(404);
        throw new Error('Exam not found');
      }
    }

    // Update recording
    await recording.update({
      title: title || recording.title,
      description: description !== undefined ? description : recording.description,
      recordingUrl: recordingUrl || recording.recordingUrl,
      duration: duration !== undefined ? duration : recording.duration,
      examId: examId || recording.examId,
      presenter: presenter !== undefined ? presenter : recording.presenter,
      recordedOn: recordedOn || recording.recordedOn,
      isPublished: isPublished !== undefined ? isPublished : recording.isPublished,
      thumbnailUrl: thumbnailUrl !== undefined ? thumbnailUrl : recording.thumbnailUrl,
      tags: tags || recording.tags,
    });

    logger.info(`Updated exam recording ${recording.id} by admin ${req.user.id}`, {
      recordingId: recording.id,
      adminId: req.user.id,
      changes: {
        title: !!title,
        description: description !== undefined,
        recordingUrl: !!recordingUrl,
        duration: duration !== undefined,
        examId: !!examId && examId !== recording.examId,
        presenter: presenter !== undefined,
        recordedOn: !!recordedOn,
        isPublished: isPublished !== undefined,
        thumbnailUrl: thumbnailUrl !== undefined,
        tags: !!tags
      }
    });

    // Return the updated recording with exam info
    const updatedRecording = await ExamRecording.findByPk(recording.id, {
      include: [
        {
          model: Exam,
          attributes: ['id', 'name', 'category'],
        },
      ],
    });

    res.status(200).json(updatedRecording);
  } catch (error) {
    if (error.message === 'Exam recording not found' || error.message === 'Exam not found') {
      throw error;
    }
    logger.error(`Error updating exam recording ${req.params.id} by admin ${req.user.id}: ${error.message}`, {
      recordingId: req.params.id,
      adminId: req.user.id,
      error: error.stack
    });
    res.status(500);
    throw new Error('Error updating exam recording');
  }
});

// @desc    Delete exam recording
// @route   DELETE /api/exam-recordings/:id
// @access  Private (Admin)
const deleteExamRecording = asyncHandler(async (req, res) => {
  try {
    logger.info(`Admin ${req.user.id} deleting exam recording ${req.params.id}`);

    const recording = await ExamRecording.findByPk(req.params.id);

    if (!recording) {
      logger.warn(`Exam recording with id ${req.params.id} not found for deletion by admin ${req.user.id}`, {
        recordingId: req.params.id,
        adminId: req.user.id
      });
      res.status(404);
      throw new Error('Exam recording not found');
    }

    // Delete recording
    await recording.destroy();

    logger.info(`Deleted exam recording ${req.params.id} by admin ${req.user.id}`, {
      recordingId: req.params.id,
      adminId: req.user.id,
      recordingData: {
        title: recording.title,
        examId: recording.examId,
        isPublished: recording.isPublished
      }
    });
    res.status(200).json({ id: req.params.id });
  } catch (error) {
    if (error.message === 'Exam recording not found') {
      throw error;
    }
    logger.error(`Error deleting exam recording ${req.params.id} by admin ${req.user.id}: ${error.message}`, {
      recordingId: req.params.id,
      adminId: req.user.id,
      error: error.stack
    });
    res.status(500);
    throw new Error('Error deleting exam recording');
  }
});

// @desc    Toggle publish status of an exam recording
// @route   PATCH /api/exam-recordings/:id/publish
// @access  Private (Admin)
const togglePublishStatus = asyncHandler(async (req, res) => {
  try {
    logger.info(`Admin ${req.user.id} toggling publish status for exam recording ${req.params.id}`);

    const recording = await ExamRecording.findByPk(req.params.id);

    if (!recording) {
      logger.warn(`Exam recording with id ${req.params.id} not found for status toggle by admin ${req.user.id}`, {
        recordingId: req.params.id,
        adminId: req.user.id
      });
      res.status(404);
      throw new Error('Exam recording not found');
    }

    // Toggle publish status
    const newStatus = !recording.isPublished;
    await recording.update({
      isPublished: newStatus,
    });

    logger.info(`Toggled exam recording ${recording.id} publish status to ${newStatus} by admin ${req.user.id}`, {
      recordingId: recording.id,
      adminId: req.user.id,
      newStatus: newStatus,
      previousStatus: !newStatus
    });

    res.status(200).json(recording);
  } catch (error) {
    if (error.message === 'Exam recording not found') {
      throw error;
    }
    logger.error(`Error toggling exam recording ${req.params.id} publish status by admin ${req.user.id}: ${error.message}`, {
      recordingId: req.params.id,
      adminId: req.user.id,
      error: error.stack
    });
    res.status(500);
    throw new Error('Error toggling publish status');
  }
});

module.exports = {
  getExamRecordings,
  getExamRecordingById,
  createExamRecording,
  updateExamRecording,
  deleteExamRecording,
  togglePublishStatus,
};

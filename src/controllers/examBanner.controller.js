const { ExamBanner, Exam } = require('../models');
const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

// @desc    Get all exam banners
// @route   GET /api/exam-banners
// @access  Public
const getExamBanners = asyncHandler(async (req, res) => {
  try {
    const { active } = req.query;

    const whereClause = {};
    if (active === 'true') {
      const now = new Date();
      whereClause.isActive = true;
      whereClause.startDate = { $lte: now }; // Start date is less than or equal to now
      whereClause.endDate = { $gte: now };   // End date is greater than or equal to now
    }

    logger.info(`Fetching exam banners with filters: ${JSON.stringify(whereClause)}`);

    const examBanners = await ExamBanner.findAll({
      where: whereClause,
      include: [
        {
          model: Exam,
          as: 'exam',
          attributes: ['id', 'name', 'category'],
        },
      ],
      order: [
        ['priority', 'DESC'],
        ['startDate', 'DESC'],
      ],
    });

    logger.info(`Retrieved ${examBanners.length} exam banners`);
    res.status(200).json(examBanners);
  } catch (error) {
    logger.error(`Error retrieving exam banners: ${error.message}`, { error: error.stack });
    res.status(500);
    throw new Error('Error retrieving exam banners');
  }
});

// @desc    Get exam banner by ID
// @route   GET /api/exam-banners/:id
// @access  Public
const getExamBannerById = asyncHandler(async (req, res) => {
  try {
    logger.info(`Fetching exam banner with id: ${req.params.id}`);

    const examBanner = await ExamBanner.findByPk(req.params.id, {
      include: [
        {
          model: Exam,
          as: 'exam',
          attributes: ['id', 'name', 'category', 'description'],
        },
      ],
    });

    if (!examBanner) {
      logger.warn(`Exam banner with id ${req.params.id} not found`, { bannerId: req.params.id });
      res.status(404);
      throw new Error('Exam banner not found');
    }

    logger.info(`Retrieved exam banner ${examBanner.id}`);
    res.status(200).json(examBanner);
  } catch (error) {
    if (error.message === 'Exam banner not found') {
      throw error;
    }
    logger.error(`Error retrieving exam banner ${req.params.id}: ${error.message}`, {
      bannerId: req.params.id,
      error: error.stack
    });
    res.status(500);
    throw new Error('Error retrieving exam banner');
  }
});

// @desc    Create new exam banner
// @route   POST /api/exam-banners
// @access  Private (Admin)
const createExamBanner = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn(`Validation errors in creating exam banner: ${JSON.stringify(errors.array())}`, {
      userId: req.user.id,
      validationErrors: errors.array()
    });
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    title,
    description,
    imageUrl,
    startDate,
    endDate,
    isActive,
    examId,
    buttonText,
    buttonLink,
    priority,
  } = req.body;

  logger.info(`Admin ${req.user.id} creating exam banner: "${title}"`);

  try {
    // Check if exam exists if examId is provided
    if (examId) {
      const exam = await Exam.findByPk(examId);
      if (!exam) {
        logger.warn(`Exam with id ${examId} not found while admin ${req.user.id} creating banner`, {
          examId,
          adminId: req.user.id
        });
        res.status(404);
        throw new Error('Exam not found');
      }
    }

    // Create banner
    const banner = await ExamBanner.create({
      title,
      description,
      imageUrl,
      startDate,
      endDate,
      isActive: isActive !== undefined ? isActive : true,
      examId,
      buttonText,
      buttonLink,
      priority: priority || 0,
    });

    logger.info(`Created exam banner ${banner.id} by admin ${req.user.id}`, {
      bannerId: banner.id,
      adminId: req.user.id,
      examId: examId || 'none'
    });

    // Return the created banner with exam info
    const createdBanner = await ExamBanner.findByPk(banner.id, {
      include: [
        {
          model: Exam,
          as: 'exam',
          attributes: ['id', 'name', 'category'],
        },
      ],
    });

    res.status(201).json(createdBanner);
  } catch (error) {
    if (error.message === 'Exam not found') {
      throw error;
    }
    logger.error(`Error creating exam banner by admin ${req.user.id}: ${error.message}`, {
      adminId: req.user.id,
      examId,
      error: error.stack
    });
    res.status(500);
    throw new Error('Error creating exam banner');
  }
});

// @desc    Update exam banner
// @route   PUT /api/exam-banners/:id
// @access  Private (Admin)
const updateExamBanner = asyncHandler(async (req, res) => {
  try {
    logger.info(`Admin ${req.user.id} updating exam banner ${req.params.id}`);

    const banner = await ExamBanner.findByPk(req.params.id);

    if (!banner) {
      logger.warn(`Exam banner with id ${req.params.id} not found for update by admin ${req.user.id}`, {
        bannerId: req.params.id,
        adminId: req.user.id
      });
      res.status(404);
      throw new Error('Exam banner not found');
    }

    const {
      title,
      description,
      imageUrl,
      startDate,
      endDate,
      isActive,
      examId,
      buttonText,
      buttonLink,
      priority,
    } = req.body;

    // If examId is being changed, verify the new exam exists
    if (examId && examId !== banner.examId) {
      const exam = await Exam.findByPk(examId);
      if (!exam) {
        logger.warn(`Exam with id ${examId} not found while admin ${req.user.id} updating banner ${req.params.id}`, {
          examId,
          bannerId: req.params.id,
          adminId: req.user.id
        });
        res.status(404);
        throw new Error('Exam not found');
      }
    }

    // Update banner
    await banner.update({
      title: title || banner.title,
      description: description !== undefined ? description : banner.description,
      imageUrl: imageUrl !== undefined ? imageUrl : banner.imageUrl,
      startDate: startDate || banner.startDate,
      endDate: endDate || banner.endDate,
      isActive: isActive !== undefined ? isActive : banner.isActive,
      examId: examId || banner.examId,
      buttonText: buttonText !== undefined ? buttonText : banner.buttonText,
      buttonLink: buttonLink !== undefined ? buttonLink : banner.buttonLink,
      priority: priority !== undefined ? priority : banner.priority,
    });

    logger.info(`Updated exam banner ${banner.id} by admin ${req.user.id}`, {
      bannerId: banner.id,
      adminId: req.user.id,
      changes: {
        title: !!title,
        description: description !== undefined,
        imageUrl: imageUrl !== undefined,
        startDate: !!startDate,
        endDate: !!endDate,
        isActive: isActive !== undefined,
        examId: !!examId && examId !== banner.examId,
        buttonText: buttonText !== undefined,
        buttonLink: buttonLink !== undefined,
        priority: priority !== undefined
      }
    });

    // Return the updated banner with exam info
    const updatedBanner = await ExamBanner.findByPk(banner.id, {
      include: [
        {
          model: Exam,
          as: 'exam',
          attributes: ['id', 'name', 'category'],
        },
      ],
    });

    res.status(200).json(updatedBanner);
  } catch (error) {
    if (error.message === 'Exam banner not found' || error.message === 'Exam not found') {
      throw error;
    }
    logger.error(`Error updating exam banner ${req.params.id} by admin ${req.user.id}: ${error.message}`, {
      bannerId: req.params.id,
      adminId: req.user.id,
      error: error.stack
    });
    res.status(500);
    throw new Error('Error updating exam banner');
  }
});

// @desc    Delete exam banner
// @route   DELETE /api/exam-banners/:id
// @access  Private (Admin)
const deleteExamBanner = asyncHandler(async (req, res) => {
  try {
    logger.info(`Admin ${req.user.id} deleting exam banner ${req.params.id}`);

    const banner = await ExamBanner.findByPk(req.params.id);

    if (!banner) {
      logger.warn(`Exam banner with id ${req.params.id} not found for deletion by admin ${req.user.id}`, {
        bannerId: req.params.id,
        adminId: req.user.id
      });
      res.status(404);
      throw new Error('Exam banner not found');
    }

    // Delete banner
    await banner.destroy();

    logger.info(`Deleted exam banner ${req.params.id} by admin ${req.user.id}`, {
      bannerId: req.params.id,
      adminId: req.user.id,
      bannerData: {
        title: banner.title,
        examId: banner.examId,
        isActive: banner.isActive
      }
    });
    res.status(200).json({ id: req.params.id });
  } catch (error) {
    if (error.message === 'Exam banner not found') {
      throw error;
    }
    logger.error(`Error deleting exam banner ${req.params.id} by admin ${req.user.id}: ${error.message}`, {
      bannerId: req.params.id,
      adminId: req.user.id,
      error: error.stack
    });
    res.status(500);
    throw new Error('Error deleting exam banner');
  }
});

module.exports = {
  getExamBanners,
  getExamBannerById,
  createExamBanner,
  updateExamBanner,
  deleteExamBanner,
};

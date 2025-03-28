const { Exam, Question, Option } = require('../models');
const { Op } = require('sequelize');
const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');

// @desc    Get all exams
// @route   GET /api/exams
// @access  Public
const getExams = asyncHandler(async (req, res) => {
  const { category } = req.query;
  
  const whereClause = {};
  if (category) {
    whereClause.category = category;
  }
  
  const exams = await Exam.findAll({
    where: whereClause,
    include: [
      {
        model: Question,
        attributes: ['id'], // Only count questions, don't return them
      },
    ],
  });
  
  res.status(200).json(exams);
});

// @desc    Get exam by ID
// @route   GET /api/exams/:id
// @access  Public
const getExamById = asyncHandler(async (req, res) => {
  const exam = await Exam.findByPk(req.params.id, {
    include: [
      {
        model: Question,
        include: [
          {
            model: Option,
            attributes: ['id', 'text', 'order'], // Don't expose correct answers
          },
        ],
      },
    ],
  });
  
  if (!exam) {
    res.status(404);
    throw new Error('Exam not found');
  }
  
  res.status(200).json(exam);
});

// @desc    Get exams by category
// @route   GET /api/exams/category/:category
// @access  Public
const getExamsByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  
  const exams = await Exam.findAll({
    where: { category },
    include: [
      {
        model: Question,
        attributes: ['id'], // Only count questions, don't return them
      },
    ],
  });
  
  res.status(200).json(exams);
});

// @desc    Create new exam
// @route   POST /api/exams
// @access  Private (Admin)
const createExam = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    name,
    description,
    category,
    date,
    duration,
    certification,
    passingScore,
    format,
    topicsCovered,
    benefits,
    price,
    instructions,
    questions,
  } = req.body;

  // Create exam
  const exam = await Exam.create({
    name,
    description,
    category,
    date,
    duration,
    certification,
    passingScore,
    format,
    topicsCovered,
    benefits,
    price,
    instructions,
  });

  // Create questions and options if provided
  if (questions && questions.length > 0) {
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const question = await Question.create({
        examId: exam.id,
        question: q.question,
        order: i + 1,
      });

      if (q.options && q.options.length > 0) {
        for (let j = 0; j < q.options.length; j++) {
          const opt = q.options[j];
          await Option.create({
            questionId: question.id,
            text: opt.text,
            isCorrect: opt.isCorrect,
            order: String.fromCharCode(65 + j), // A, B, C, D...
          });
        }
      }
    }
  }

  // Return the created exam with questions
  const createdExam = await Exam.findByPk(exam.id, {
    include: [
      {
        model: Question,
        include: [Option],
      },
    ],
  });

  res.status(201).json(createdExam);
});

// @desc    Update exam
// @route   PUT /api/exams/:id
// @access  Private (Admin)
const updateExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findByPk(req.params.id);

  if (!exam) {
    res.status(404);
    throw new Error('Exam not found');
  }

  const {
    name,
    description,
    category,
    date,
    duration,
    certification,
    passingScore,
    format,
    topicsCovered,
    benefits,
    price,
    instructions,
  } = req.body;

  // Update exam details
  await exam.update({
    name: name || exam.name,
    description: description || exam.description,
    category: category || exam.category,
    date: date || exam.date,
    duration: duration || exam.duration,
    certification: certification !== undefined ? certification : exam.certification,
    passingScore: passingScore || exam.passingScore,
    format: format || exam.format,
    topicsCovered: topicsCovered || exam.topicsCovered,
    benefits: benefits || exam.benefits,
    price: price || exam.price,
    instructions: instructions || exam.instructions,
  });

  // Get updated exam with questions
  const updatedExam = await Exam.findByPk(exam.id, {
    include: [
      {
        model: Question,
        include: [Option],
      },
    ],
  });

  res.status(200).json(updatedExam);
});

// @desc    Delete exam
// @route   DELETE /api/exams/:id
// @access  Private (Admin)
const deleteExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findByPk(req.params.id);

  if (!exam) {
    res.status(404);
    throw new Error('Exam not found');
  }

  // Delete associated questions and options
  const questions = await Question.findAll({ where: { examId: exam.id } });
  
  for (const question of questions) {
    await Option.destroy({ where: { questionId: question.id } });
  }
  
  await Question.destroy({ where: { examId: exam.id } });
  
  // Delete the exam
  await exam.destroy();

  res.status(200).json({ id: req.params.id });
});

module.exports = {
  getExams,
  getExamById,
  getExamsByCategory,
  createExam,
  updateExam,
  deleteExam,
};
const { Result, Registration, Exam, Question, Option } = require('../models');
const asyncHandler = require('express-async-handler');

// @desc    Submit exam and create result
// @access  Private
const submitExam = asyncHandler(async (req, res) => {
  const { registrationId, answers } = req.body;
  const userId = req.user.id;

  // Find registration
  const registration = await Registration.findOne({
    where: { id: registrationId, userId },
    include: [{ model: Exam }]
  });

  if (!registration) {
    res.status(404);
    throw new Error('Registration not found');
  }

  if (registration.status === 'completed') {
    res.status(400);
    throw new Error('Exam already completed');
  }

  // Get all questions for this exam
  const questions = await Question.findAll({
    where: { examId: registration.examId },
    include: [{ model: Option }]
  });

  // Calculate score
  let correctAnswers = 0;
  const processedAnswers = [];

  for (const answer of answers) {
    const question = questions.find(q => q.id === answer.questionId);
    if (!question) continue;

    const correctOption = question.Options.find(opt => opt.isCorrect);
    const isCorrect = correctOption && correctOption.id === answer.selectedOption;

    if (isCorrect) {
      correctAnswers++;
    }

    processedAnswers.push({
      questionId: answer.questionId,
      selectedOption: answer.selectedOption,
      isCorrect
    });
  }

  const totalQuestions = questions.length;
  const score = (correctAnswers / totalQuestions) * 100;
  const passed = score >= registration.Exam.passingScore;

  // Create result
  const result = await Result.create({
    registrationId,
    userId,
    examId: registration.examId,
    score,
    passed,
    answers: processedAnswers
  });

  // Update registration status
  registration.status = 'completed';
  await registration.save();

  res.status(201).json(result);
});

// @desc    Get user's results
// @access  Private
const getUserResults = asyncHandler(async (req, res) => {
  const results = await Result.findAll({
    where: { userId: req.user.id },
    include: [
      {
        model: Exam,
        attributes: ['id', 'name', 'category', 'passingScore', 'certification']
      }
    ]
  });

  res.status(200).json(results);
});

// @desc    Get result by ID
// @access  Private
const getResultById = asyncHandler(async (req, res) => {
  const result = await Result.findOne({
    where: { id: req.params.id, userId: req.user.id },
    include: [
      {
        model: Exam,
        attributes: { exclude: ['createdAt', 'updatedAt'] }
      }
    ]
  });

  if (!result) {
    res.status(404);
    throw new Error('Result not found');
  }

  res.status(200).json(result);
});

// @desc    Generate certificate for a result
// @access  Private
const generateCertificate = asyncHandler(async (req, res) => {
  const result = await Result.findOne({
    where: { id: req.params.id, userId: req.user.id, passed: true },
    include: [
      {
        model: Exam,
        attributes: ['name', 'category', 'certification']
      },
      {
        model: User,
        attributes: ['fullName']
      }
    ]
  });

  if (!result) {
    res.status(404);
    throw new Error('Result not found or exam not passed');
  }

  if (!result.Exam.certification) {
    res.status(400);
    throw new Error('This exam does not provide certification');
  }

  // In a real application, you would generate a PDF certificate here
  // For now, we'll just return the certificate data
  const certificateData = {
    certificateId: `CERT-${result.id}`,
    candidateName: result.User.fullName,
    examName: result.Exam.name,
    category: result.Exam.category,
    score: result.score,
    issueDate: new Date(),
    verificationUrl: `https://skillnet.example.com/verify/${result.id}`
  };

  res.status(200).json(certificateData);
});

module.exports = {
  submitExam,
  getUserResults,
  getResultById,
  generateCertificate
};
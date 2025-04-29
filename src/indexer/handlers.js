/**
 * Event handlers for Starknet contract events
 * Each handler processes a specific event type and takes actions in the backend
 */

const { FieldElement } = require("@apibara/starknet");
const { uint256 } = require('starknet');
const { User, Exam, Registration, Result, Notification } = require('../models');
const logger = require('../utils/logger');

// Utility to convert Starknet felt to string
const feltToString = (felt) => {
  if (!felt) return '';

  // Convert Starknet felts to readable strings when they represent text
  try {
    // Convert the felt to a hex string and then to ASCII
    const hex = FieldElement.toHex(felt);
    return hexToAscii(hex);
  } catch (error) {
    logger.warn(`Error converting felt to string: ${error.message}`);
    return felt.toString();
  }
};

// Helper function to convert hex to ASCII string
const hexToAscii = (hex) => {
  if (!hex || typeof hex !== 'string') return '';

  // Remove '0x' prefix if present
  hex = hex.startsWith('0x') ? hex.substring(2) : hex;

  let result = '';
  for (let i = 0; i < hex.length; i += 2) {
    const charCode = parseInt(hex.substr(i, 2), 16);
    // Only add printable ASCII characters
    if (charCode >= 32 && charCode <= 126) {
      result += String.fromCharCode(charCode);
    }
  }
  return result;
};

/**
 * Process an ExamCreated event
 * @param {Object} contractEvent - The contract event object from the database
 */
const handleExamCreated = async (contractEvent) => {
  try {
    const eventData = contractEvent.eventData;

    logger.info(`Processing Starknet ExamCreated event: Exam ID ${eventData.examId}, Creator ${eventData.creator}`);

    // For Starknet, examId is a felt that we need to convert to string
    const examIdStr = eventData.examId.toString();
    const nameStr = feltToString(eventData.name);

    // Check if the exam exists in our database, if not, create a placeholder
    // that can be updated later by admins with full details
    const [exam, created] = await Exam.findOrCreate({
      where: { id: examIdStr },
      defaults: {
        name: nameStr || `Exam ${examIdStr}`,
        description: `Starknet exam created by ${eventData.creator.toString()}`,
        category: 'Others',
        date: new Date(),
        duration: 60, // default 60 minutes
        certification: true,
        passingScore: 70,
        price: 0,
      }
    });

    if (created) {
      logger.info(`Created placeholder for Starknet exam: ${examIdStr}`);

      // Create a notification for admins about the new exam
      await Notification.create({
        title: 'New Exam Created on Starknet',
        message: `A new exam "${nameStr || `Exam ${examIdStr}`}" has been created on Starknet by ${eventData.creator.toString()}. Please update its details in the admin panel.`,
        type: 'info',
        // No userId means it's for all admins
      });
    } else {
      logger.info(`Exam ${examIdStr} already exists in the database`);
    }

    return true;
  } catch (error) {
    logger.error(`Error handling Starknet ExamCreated event: ${error.message}`);
    throw error;
  }
};

/**
 * Process a UserRegistered event
 * @param {Object} contractEvent - The contract event object from the database
 */
const handleUserRegistered = async (contractEvent) => {
  try {
    const eventData = contractEvent.eventData;

    // Convert Starknet felts to strings
    const examIdStr = eventData.examId.toString();
    const userAddress = eventData.user.toString();

    logger.info(`Processing Starknet UserRegistered event: Exam ID ${examIdStr}, User ${userAddress}`);

    // Find or create the user based on wallet address
    const [userRecord, userCreated] = await User.findOrCreate({
      where: { walletAddress: userAddress },
      defaults: {
        username: `user_${userAddress.substring(0, 8)}`,
        email: null, // We don't have email from blockchain events
        password: null, // Will need to be set by the user
      }
    });

    if (userCreated) {
      logger.info(`Created new user for Starknet wallet address: ${userAddress}`);
    }

    // Find the exam
    const exam = await Exam.findByPk(examIdStr);

    if (!exam) {
      logger.warn(`Exam ${examIdStr} not found for registration`);
      return false;
    }

    // Create registration
    const [registration, registrationCreated] = await Registration.findOrCreate({
      where: {
        userId: userRecord.id,
        examId: exam.id
      },
      defaults: {
        registrationDate: new Date(),
        status: 'confirmed',
        paymentStatus: 'completed',
      }
    });

    if (registrationCreated) {
      logger.info(`Created registration for user ${userRecord.id} for exam ${exam.id}`);

      // Create notification for the user
      await Notification.create({
        title: 'Exam Registration Confirmed',
        message: `Your registration for "${exam.name}" has been confirmed through Starknet.`,
        type: 'success',
        userId: userRecord.id,
      });
    } else {
      logger.info(`Registration for user ${userRecord.id} for exam ${exam.id} already exists`);
    }

    return true;
  } catch (error) {
    logger.error(`Error handling Starknet UserRegistered event: ${error.message}`);
    throw error;
  }
};

/**
 * Process an ExamCompleted event
 * @param {Object} contractEvent - The contract event object from the database
 */
const handleExamCompleted = async (contractEvent) => {
  try {
    const eventData = contractEvent.eventData;

    // Convert Starknet felts to appropriate formats
    const examIdStr = eventData.examId.toString();
    const userAddress = eventData.user.toString();
    const scoreValue = parseInt(eventData.score.toString(), 10);
    const isPassed = eventData.passed.toString() !== '0'; // In Starknet, 0 is false, non-zero is true

    logger.info(`Processing Starknet ExamCompleted event: Exam ID ${examIdStr}, User ${userAddress}, Score ${scoreValue}, Passed ${isPassed}`);

    // Find the user and exam
    const userRecord = await User.findOne({
      where: { walletAddress: userAddress }
    });

    if (!userRecord) {
      logger.warn(`User with Starknet wallet address ${userAddress} not found`);
      return false;
    }

    const exam = await Exam.findByPk(examIdStr);

    if (!exam) {
      logger.warn(`Exam ${examIdStr} not found`);
      return false;
    }

    // Find the registration
    const registration = await Registration.findOne({
      where: {
        userId: userRecord.id,
        examId: exam.id,
      }
    });

    if (!registration) {
      logger.warn(`Registration for user ${userRecord.id} and exam ${exam.id} not found`);
      return false;
    }

    // Create or update result
    const [result, resultCreated] = await Result.findOrCreate({
      where: {
        registrationId: registration.id,
        userId: userRecord.id,
        examId: exam.id,
      },
      defaults: {
        score: scoreValue,
        isPassed: isPassed,
        completionTime: new Date(),
        blockedStatus: false,
      }
    });

    if (!resultCreated) {
      await result.update({
        score: scoreValue,
        isPassed: isPassed,
        completionTime: new Date(),
      });
      logger.info(`Updated exam result for user ${userRecord.id} for exam ${exam.id}`);
    } else {
      logger.info(`Created exam result for user ${userRecord.id} for exam ${exam.id}`);
    }

    // Create notification for the user
    await Notification.create({
      title: 'Exam Results Available',
      message: `Your results for "${exam.name}" are now available. You ${isPassed ? 'passed' : 'did not pass'} with a score of ${scoreValue}.`,
      type: isPassed ? 'success' : 'info',
      userId: userRecord.id,
    });

    return true;
  } catch (error) {
    logger.error(`Error handling Starknet ExamCompleted event: ${error.message}`);
    throw error;
  }
};

/**
 * Process a CertificateIssued event
 * @param {Object} contractEvent - The contract event object from the database
 */
const handleCertificateIssued = async (contractEvent) => {
  try {
    const eventData = contractEvent.eventData;

    // Convert Starknet felts to appropriate formats
    const examIdStr = eventData.examId.toString();
    const certificateURIStr = feltToString(eventData.certificateURI);

    logger.info(`Processing Starknet CertificateIssued event: Exam ID ${examIdStr}, Certificate URI ${certificateURIStr}`);

    // Find the exam
    const exam = await Exam.findByPk(examIdStr);

    if (!exam) {
      logger.warn(`Exam ${examIdStr} not found for certificate`);
      return false;
    }

    // Find all passing results for this exam
    const results = await Result.findAll({
      where: {
        examId: exam.id,
        isPassed: true,
      },
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'email', 'walletAddress'],
        }
      ]
    });

    // Update certificate link for all passing results
    for (const result of results) {
      await result.update({
        certificateUrl: certificateURIStr,
      });

      // Create notification for each user
      if (result.User) {
        await Notification.create({
          title: 'Certificate Issued',
          message: `Your certificate for "${exam.name}" has been issued on Starknet. You can view and download it now.`,
          type: 'success',
          userId: result.User.id,
        });
      }
    }

    logger.info(`Updated certificate URI for ${results.length} passing results of exam ${exam.id}`);

    return true;
  } catch (error) {
    logger.error(`Error handling Starknet CertificateIssued event: ${error.message}`);
    throw error;
  }
};

module.exports = {
  handleExamCreated,
  handleUserRegistered,
  handleExamCompleted,
  handleCertificateIssued,
};

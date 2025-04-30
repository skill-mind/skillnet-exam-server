const { ContractEvent } = require('../models');
const asyncHandler = require('express-async-handler');
const indexer = require('../indexer/indexer');
const { getConfig } = require('../indexer/config');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

// @desc    Get indexer status
// @route   GET /api/indexer/status
// @access  Private
const getIndexerStatus = asyncHandler(async (req, res) => {
  try {
    logger.info('Fetching indexer status');

    // Get the last processed block from DB
    const lastEvent = await ContractEvent.findOne({
      order: [['blockNumber', 'DESC']],
      attributes: ['blockNumber', 'blockTimestamp', 'createdAt']
    });

    // Get current network config
    const config = getConfig();

    const status = {
      lastProcessedBlock: lastEvent ? Number(lastEvent.blockNumber) : null,
      lastBlockTimestamp: lastEvent ? new Date(Number(lastEvent.blockTimestamp) * 1000).toISOString() : null,
      lastProcessingTime: lastEvent ? lastEvent.createdAt : null,
      network: config.network,
      contractAddress: config.contractAddress,
      isRunning: indexer.isRunning(),
      startBlock: Number(process.env.INDEXER_START_BLOCK) || 0
    };

    logger.info(`Indexer status retrieved: ${JSON.stringify(status)}`);
    res.status(200).json(status);
  } catch (error) {
    logger.error(`Error retrieving indexer status: ${error.message}`, { error: error.stack });
    res.status(500);
    throw new Error('Error retrieving indexer status');
  }
});

// @desc    Trigger indexer to scan for events
// @route   POST /api/indexer/scan
// @access  Private (Admin)
const triggerScan = asyncHandler(async (req, res) => {
  try {
    logger.info(`Admin ${req.user.id} triggering indexer scan`);

    const { fromBlock, toBlock } = req.body;

    // Convert 'latest' string to null to use default behavior
    const from = fromBlock === 'latest' ? null : Number(fromBlock);
    const to = toBlock === 'latest' ? null : Number(toBlock);

    // Trigger a scan
    const result = await indexer.scanForEvents(from, to);

    logger.info(`Manual indexer scan completed by admin ${req.user.id}`, {
      adminId: req.user.id,
      eventsProcessed: result.events.length,
      fromBlock: result.fromBlock,
      toBlock: result.toBlock
    });

    res.status(200).json({
      message: 'Scan triggered successfully',
      eventsProcessed: result.events.length,
      fromBlock: result.fromBlock,
      toBlock: result.toBlock
    });
  } catch (error) {
    logger.error(`Error triggering indexer scan by admin ${req.user.id}: ${error.message}`, {
      adminId: req.user.id,
      error: error.stack
    });
    res.status(500);
    throw new Error('Error triggering indexer scan: ' + error.message);
  }
});

// @desc    Get contract events
// @route   GET /api/indexer/events
// @access  Private (Admin)
const getContractEvents = asyncHandler(async (req, res) => {
  try {
    logger.info(`Admin ${req.user.id} retrieving contract events`);

    const { eventName, fromBlock, toBlock, limit = 50 } = req.query;

    const whereClause = {};
    if (eventName) whereClause.eventName = eventName;
    if (fromBlock) whereClause.blockNumber = { [Op.gte]: fromBlock };
    if (toBlock) whereClause.blockNumber = {
      ...whereClause.blockNumber,
      [Op.lte]: toBlock
    };

    const events = await ContractEvent.findAll({
      where: whereClause,
      order: [['blockNumber', 'DESC'], ['logIndex', 'DESC']],
      limit: parseInt(limit)
    });

    logger.info(`Retrieved ${events.length} contract events for admin ${req.user.id}`, {
      adminId: req.user.id,
      filter: { eventName, fromBlock, toBlock, limit }
    });

    res.status(200).json(events);
  } catch (error) {
    logger.error(`Error retrieving contract events for admin ${req.user.id}: ${error.message}`, {
      adminId: req.user.id,
      error: error.stack
    });
    res.status(500);
    throw new Error('Error retrieving contract events');
  }
});

// @desc    Get indexed exams from blockchain
// @route   GET /api/indexer/exams
// @access  Private (Admin)
const getIndexedExams = asyncHandler(async (req, res) => {
  try {
    logger.info(`Admin ${req.user.id} retrieving exams from indexed blockchain events`);

    const events = await ContractEvent.findAll({
      where: {
        eventName: 'ExamCreated'
      },
      order: [['blockNumber', 'DESC']]
    });

    // Process and transform exam creation events
    const exams = events.map(event => {
      const { args } = JSON.parse(event.eventData);
      return {
        examId: args.examId,
        name: args.name,
        category: args.category,
        creatorAddress: args.creator,
        price: args.price,
        blockNumber: event.blockNumber,
        timestamp: event.blockTimestamp,
        transactionHash: event.transactionHash
      };
    });

    logger.info(`Retrieved ${exams.length} indexed exams for admin ${req.user.id}`);
    res.status(200).json(exams);
  } catch (error) {
    logger.error(`Error retrieving indexed exams for admin ${req.user.id}: ${error.message}`, {
      adminId: req.user.id,
      error: error.stack
    });
    res.status(500);
    throw new Error('Error retrieving indexed exams');
  }
});

// @desc    Get indexed registrations from blockchain
// @route   GET /api/indexer/registrations
// @access  Private (Admin)
const getIndexedRegistrations = asyncHandler(async (req, res) => {
  try {
    logger.info(`Admin ${req.user.id} retrieving registrations from indexed blockchain events`);

    const { examId } = req.query;

    const whereClause = { eventName: 'UserRegistered' };
    if (examId) {
      // Filter by examId in the JSON event data
      // This is a simplification - in actual implementation, you might need a more
      // sophisticated query approach depending on your database
      whereClause.$and = [
        { eventData: { $like: `%"examId":"${examId}"%` } }
      ];
    }

    const events = await ContractEvent.findAll({
      where: whereClause,
      order: [['blockNumber', 'DESC']]
    });

    // Process and transform registration events
    const registrations = events.map(event => {
      const { args } = JSON.parse(event.eventData);
      return {
        registrationId: args.registrationId,
        examId: args.examId,
        userAddress: args.user,
        registrationTime: args.timestamp,
        blockNumber: event.blockNumber,
        timestamp: event.blockTimestamp,
        transactionHash: event.transactionHash
      };
    });

    logger.info(`Retrieved ${registrations.length} indexed registrations for admin ${req.user.id}`, {
      adminId: req.user.id,
      filter: { examId }
    });
    res.status(200).json(registrations);
  } catch (error) {
    logger.error(`Error retrieving indexed registrations for admin ${req.user.id}: ${error.message}`, {
      adminId: req.user.id,
      error: error.stack
    });
    res.status(500);
    throw new Error('Error retrieving indexed registrations');
  }
});

// @desc    Get indexed exam results from blockchain
// @route   GET /api/indexer/results
// @access  Private (Admin)
const getIndexedResults = asyncHandler(async (req, res) => {
  try {
    logger.info(`Admin ${req.user.id} retrieving exam results from indexed blockchain events`);

    const { examId, userAddress } = req.query;

    const whereClause = { eventName: 'ExamCompleted' };
    // TODO: Implement proper filtering by examId and userAddress in the JSON

    const events = await ContractEvent.findAll({
      where: whereClause,
      order: [['blockNumber', 'DESC']]
    });

    // Process and transform result events
    const results = events.map(event => {
      const { args } = JSON.parse(event.eventData);
      return {
        resultId: args.resultId,
        examId: args.examId,
        userAddress: args.user,
        score: args.score,
        passed: args.passed,
        blockNumber: event.blockNumber,
        timestamp: event.blockTimestamp,
        transactionHash: event.transactionHash
      };
    });

    logger.info(`Retrieved ${results.length} indexed exam results for admin ${req.user.id}`, {
      adminId: req.user.id,
      filter: { examId, userAddress }
    });
    res.status(200).json(results);
  } catch (error) {
    logger.error(`Error retrieving indexed exam results for admin ${req.user.id}: ${error.message}`, {
      adminId: req.user.id,
      error: error.stack
    });
    res.status(500);
    throw new Error('Error retrieving indexed exam results');
  }
});

module.exports = {
  getIndexerStatus,
  triggerScan,
  getContractEvents,
  getIndexedExams,
  getIndexedRegistrations,
  getIndexedResults,
};

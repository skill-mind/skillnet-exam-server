/**
 * Entry point for the Apibara-based Starknet indexer
 * Starts the indexer as a standalone process
 */

require('dotenv').config();
const indexer = require('./indexer');
const logger = require('../utils/logger');
const db = require('../config/db');

const startIndexer = async () => {
  logger.info('Connecting to database...');
  try {
    // Initialize database connection
    await db.authenticate();
    logger.info('Database connection established');

    // Start the Apibara indexer
    logger.info('Starting Apibara Starknet indexer');
    await indexer.start();
  } catch (error) {
    logger.error(`Failed to start Apibara indexer: ${error.message}`);
    process.exit(1);
  }
};

// Handle shutdown gracefully
process.on('SIGINT', async () => {
  logger.info('Shutting down Apibara indexer...');
  try {
    await indexer.stop();
    process.exit(0);
  } catch (error) {
    logger.error(`Error during shutdown: ${error.message}`);
    process.exit(1);
  }
});

// Start the indexer
startIndexer().catch(error => {
  logger.error(`Critical error: ${error.message}`);
  process.exit(1);
});

module.exports = {
  startIndexer
};

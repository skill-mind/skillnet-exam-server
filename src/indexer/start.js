/**
 * Entry point for the Apibara-based Starknet indexer
 * Starts the indexer as a standalone process
 */

import 'dotenv/config';
import { indexer } from './indexer.js';
import logger from '../utils/logger.js';
import { sequelize } from '../config/db.js';

const startIndexer = async () => {
  logger.info('Connecting to database...');
  try {
    // Initialize database connection
    await sequelize.authenticate();
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

export { startIndexer };

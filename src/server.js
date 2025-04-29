const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const logger = require('./utils/logger');
const { connectDB } = require('./config/db');
const { syncDatabase } = require('./models');
const swaggerDocs = require('./docs/swagger');
// const { startIndexer } = require('./indexer/start');
require('dotenv').config();

// Connect to database and sync models
const startServer = async () => {
  try {
    logger.info('Starting server initialization...');

    // Connect to the database
    logger.info('Attempting to connect to database...');
    try {
      await connectDB();
      logger.info('Successfully connected to database');
    } catch (dbError) {
      logger.error(`Database connection failed: ${dbError.message}`);
      throw dbError; // Rethrow to be caught by the outer try/catch
    }

    // Sync all models with the database
    logger.info('Attempting to sync database models...');
    try {
      await syncDatabase();
      logger.info('Successfully synced database models');
    } catch (syncError) {
      logger.error(`Database sync failed: ${syncError.message}`);
      throw syncError; // Rethrow to be caught by the outer try/catch
    }

    logger.info('Initializing Express app...');
    const app = express();

    // Security middleware
    app.use(helmet());
    app.use(cors());

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later',
    });
    app.use('/api/', limiter);

    // Middleware
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(compression()); // Compress responses
    app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

    logger.info('Setting up Swagger documentation...');
    try {
      app.use('/api-docs', swaggerDocs.serve, swaggerDocs.setup);
      logger.info('Swagger documentation set up successfully');
    } catch (swaggerError) {
      logger.error(`Swagger setup failed: ${swaggerError.message}`);
      // Continue execution even if Swagger fails
    }

    // Routes
    logger.info('Setting up API routes...');
    try {
      app.use('/api/exams', require('./routes/exam.routes'));
      app.use('/api/users', require('./routes/user.routes'));
      app.use('/api/auth', require('./routes/auth.routes'));
      app.use('/api/registrations', require('./routes/registration.routes'));
      app.use('/api/results', require('./routes/result.routes'));
      app.use('/api/notifications', require('./routes/notification.routes'));
      app.use('/api/exam-banners', require('./routes/examBanner.routes'));
      app.use('/api/exam-recordings', require('./routes/examRecording.routes'));
      app.use('/api/indexer', require('./routes/indexer.routes')); // Added indexer routes
      logger.info('API routes set up successfully');
    } catch (routeError) {
      logger.error(`Route setup failed: ${routeError.message}`);
      throw routeError;
    }

    // Error handling middleware
    app.use((err, req, res, next) => {
      logger.error(`${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

      const statusCode = res.statusCode ? res.statusCode : 500;
      res.status(statusCode);

      res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
      });
    });

    const PORT = process.env.PORT || 5001;

    logger.info(`Attempting to start server on port ${PORT}...`);
    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      console.log(`Server running on port ${PORT}`);

      // Start the blockchain event indexer
      if (process.env.ENABLE_INDEXER === 'true') {
        logger.info('Starting blockchain event indexer');
        startIndexer().catch(error => {
          logger.error(`Failed to start blockchain event indexer: ${error.message}`);
        });
      }
    });

    // Handle server startup errors
    server.on('error', (err) => {
      logger.error(`Server failed to start: ${err.message}`);
      if (err.code === 'EADDRINUSE') {
        logger.error(`Port ${PORT} is already in use`);
      }
      process.exit(1);
    });

  } catch (error) {
    logger.error(`Fatal server error: ${error.message}`, { stack: error.stack });
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error(`Uncaught Exception: ${error.message}`, { stack: error.stack });
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
  console.error('Unhandled Rejection:', reason);
  process.exit(1);
});

startServer();

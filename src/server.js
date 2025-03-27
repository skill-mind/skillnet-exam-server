const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const winston = require('winston');
const { connectDB } = require('./config/db');
const { syncDatabase } = require('./models');
const swaggerDocs = require('./docs/swagger');
require('dotenv').config();

// Winston logger setup
const logger = winston.createLogger({
  // ... existing logger configuration ...
});

if (process.env.NODE_ENV !== 'production') {
  // ... existing logger console configuration ...
}

// Connect to database and sync models
const startServer = async () => {
  try {
    // Connect to the database
    await connectDB();
    
    // Sync all models with the database
    await syncDatabase();
    
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
    app.use('/api-docs', swaggerDocs.serve, swaggerDocs.setup);
    
    // Routes
    app.use('/api/exams', require('./routes/exam.routes'));
    app.use('/api/users', require('./routes/user.routes'));
    app.use('/api/auth', require('./routes/auth.routes'));
    app.use('/api/registrations', require('./routes/registration.routes'));
    app.use('/api/results', require('./routes/result.routes'));
    
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
    
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
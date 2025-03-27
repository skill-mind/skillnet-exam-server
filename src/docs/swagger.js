const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Import all route documentation
require('./user.docs');
require('./auth.docs');
require('./exam.docs');
require('./registration.docs');
require('./result.docs');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SkillNet Exam API',
      version: '1.0.0',
      description: 'API documentation for the SkillNet Exam Platform',
      contact: {
        name: 'SkillNet Support',
        email: 'support@skillnet.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5001/api',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    './src/docs/*.docs.js',
    './src/models/*.js' // Include models for schema definitions
  ],
};

const specs = swaggerJsdoc(options);

module.exports = {
  serve: swaggerUi.serve,
  setup: swaggerUi.setup(specs),
};
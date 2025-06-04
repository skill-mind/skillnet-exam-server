import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// Import all route documentation
import './user.docs.js';
import './auth.docs.js';
import './exam.docs.js';
import './registration.docs.js';
import './result.docs.js';

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

export const serve = swaggerUi.serve;
export const setup = swaggerUi.setup(specs);
export default { serve, setup };
import swaggerJsDoc from 'swagger-jsdoc';

// Configures the Swagger API Documentation generator
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Best College Admission API',
      version: '1.0.0',
      description: 'API Documentation for Best College Admission',
    },
    servers: [{ url: 'http://localhost:5000' }],
  },
  // Paths where Swagger should look for JSDoc annotations
  apis: ['./src/server.ts', './src/routes/*.ts', './src/routes/*.js'],
};

export const swaggerDocs = swaggerJsDoc(swaggerOptions);

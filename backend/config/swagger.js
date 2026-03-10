const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Billing API',
      version: '1.0.0',
      description: 'REST API documentation for Billing System'
    },
    servers: [
      {
        url: 'https://billing-app-o5vw.onrender.com',
        description: 'Production server'
      },
      {
        url: 'http://localhost:5000',
        description: 'Local server'
      }
    ]
  },

  apis: [
    './features/**/*.js'
  ]
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
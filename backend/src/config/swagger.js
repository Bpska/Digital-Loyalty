import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env.js';

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Digital Loyalty Voucher SaaS API',
      version: '1.0.0',
      description:
        'REST API for the Digital Loyalty Voucher multi-tenant SaaS platform. ' +
        'Serves Super Admin, Business Admin, Staff, and Customer panels.',
      contact: {
        name: 'Logisaar Technologies',
        email: 'dev@logisaar.com',
      },
    },
    servers: [
      { url: `${env.BACKEND_URL}/api/v1`, description: 'Current environment' },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        CookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'accessToken',
        },
      },
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
            message: { type: 'string' },
            errors: { type: 'array', items: { type: 'string' } },
          },
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            page: { type: 'integer' },
            limit: { type: 'integer' },
            total: { type: 'integer' },
            totalPages: { type: 'integer' },
          },
        },
      },
    },
    security: [{ BearerAuth: [] }, { CookieAuth: [] }],
  },
  // Glob for all route files containing JSDoc comments
  apis: ['./src/modules/**/*.routes.ts', './src/modules/**/*.controller.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);

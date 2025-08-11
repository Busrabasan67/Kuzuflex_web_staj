import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import path from "path";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Kuzuflex API",
      version: "1.0.0",
      description: "Kuzuflex Web API dokümantasyonu",
    },
    servers: [
      {
        url: "http://localhost:5000",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: [path.join(__dirname, "../routes/*.ts")], // Absolute path kullan
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerUi, swaggerSpec };

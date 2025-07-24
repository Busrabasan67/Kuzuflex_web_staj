import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

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
  },
  apis: ["./src/routes/*.ts"], // Route'ların yorumları buradan okunacak
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerUi, swaggerSpec };

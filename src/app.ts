import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import routes = require("./app/routes");
import { globalErrorHandler } from "./app/middlewares/globalErrorhandler";
import { notFound } from "./app/middlewares/notFound";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.BACKEND_URL || "http://localhost:5000",
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/*
 * Swagger configuration
 */
const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "Load Shedding Management API",
      version: "1.0.0",
      description:
        "API Documentation for Load Shedding and Power Outage Management System",
    },

    servers: [
      {
        url: "http://localhost:5000/api/v1",
        description: "Local development server",
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

 
  apis: [
    "./src/app/routes/**/*.ts",
    "./src/app/modules/**/*.route.ts",
    "./src/app.ts",
  ],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec),
);

/**
 * @openapi
 * /:
 *   get:
 *     summary: API health check
 *     description: Check whether the server is running
 *     responses:
 *       200:
 *         description: Server is running successfully
 */
app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Load shedding server is running!",
  });
});

app.use("/api/v1", routes.router);


app.use(notFound);
app.use(globalErrorHandler);

export default app;
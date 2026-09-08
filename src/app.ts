import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

import { globalErrorHandler } from "./app/middlewares/globalErrorhandler";
import { notFound } from "./app/middlewares/notFound";
import routes from "./app/routes";

const app = express();

const PORT = Number(process.env.PORT) || 5000;

app.use(helmet());

app.use(
  cors({
    origin:
      process.env.FRONTEND_URL ||
      "http://localhost:3000",
    credentials: true,
  }),
);

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.use(cookieParser());

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
        url: `http://localhost:${PORT}/api/v1`,
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

const swaggerSpec =
  swaggerJsdoc(swaggerOptions);

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

app.use("/api/v1", routes);

// এগুলো সব routes-এর পরে থাকবে
app.use(notFound);
app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(
    `Server is running on http://localhost:${PORT}`,
  );

  console.log(
    `Swagger documentation: http://localhost:${PORT}/api-docs`,
  );
});

export default app;
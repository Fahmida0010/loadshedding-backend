import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

const app = express();

app.use(express.json());


// Swagger Options Configuration
const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Load Shedding Management API",
      version: "1.0.0",
      description: "API Documentation for Load Shedding System",
    },
    servers: [
      {
        url: "http://localhost:5000/api/v1",
        description: "Local Server",
      },
    ],
  },
  apis: ["./src/routes/*.ts", "./src/app.ts"], 
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use("/api/v1", router);
// Swagger UI Route Setup
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @openapi
 * /:
 *   get:
 *     summary: Root Route Health Check
 *     description: Check if server is running
 *     responses:
 *       200:
 *         description: Server is running successfully
 */
app.get("/", (req, res) => {
  res.send("Load shedding Server is running!");
});

// Local Development-এর জন্য listener
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API Docs available at http://localhost:${PORT}/api-docs`);
  });
}

// Vercel-এর জন্য app export করা হলো
export default app;
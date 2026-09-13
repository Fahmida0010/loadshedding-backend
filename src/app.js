"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const helmet_1 = __importDefault(require("helmet"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const globalErrorhandler_1 = require("./app/middlewares/globalErrorhandler");
const notFound_1 = require("./app/middlewares/notFound");
const routes_1 = __importDefault(require("./app/routes"));
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 5000;
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false,
}));
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({
    extended: true,
}));
app.use((0, cookie_parser_1.default)());
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Load Shedding Management API",
            version: "1.0.0",
            description: "API Documentation for Load Shedding and Power Outage Management System",
        },
        servers: [
            {
                url: `${process.env.BACKEND_URL}/api/v1`,
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
const swaggerSpec = (0, swagger_jsdoc_1.default)(swaggerOptions);
app.use("/api-docs", swagger_ui_express_1.default.serveFiles(swaggerSpec), swagger_ui_express_1.default.setup(swaggerSpec));
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
const apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.method === "OPTIONS",
    handler: (_req, res) => {
        res.status(429).json({
            success: false,
            message: "Too many requests. Please try again after 15 minutes.",
        });
    },
});
app.use("/api/v1", apiLimiter);
app.use("/api/v1", routes_1.default);
app.use(notFound_1.notFound);
app.use(globalErrorhandler_1.globalErrorHandler);
app.listen(PORT, () => {
    console.log(`Server is running on ${process.env.BACKEND_URL}`);
    console.log(`Swagger documentation: ${process.env.BACKEND_URL}/api-docs`);
});
exports.default = app;

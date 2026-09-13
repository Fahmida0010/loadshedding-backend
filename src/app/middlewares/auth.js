"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../config/prisma");
const AppError_1 = require("../utils/AppError");
const auth = (...requiredRoles) => {
    return async (req, _res, next) => {
        try {
            const authorization = req.headers.authorization;
            if (!authorization || !authorization.startsWith("Bearer ")) {
                throw new AppError_1.AppError(401, "Authorization token is required");
            }
            const accessToken = authorization.split(" ")[1];
            if (!accessToken) {
                throw new AppError_1.AppError(401, "Access token is required");
            }
            if (!process.env.JWT_ACCESS_SECRET) {
                throw new AppError_1.AppError(500, "JWT access secret is not configured");
            }
            let decodedToken;
            try {
                decodedToken = jsonwebtoken_1.default.verify(accessToken, process.env.JWT_ACCESS_SECRET);
            }
            catch {
                throw new AppError_1.AppError(401, "Invalid or expired access token");
            }
            const user = await prisma_1.prisma.user.findUnique({
                where: {
                    id: decodedToken.userId,
                },
                select: {
                    id: true,
                    email: true,
                    role: true,
                    status: true,
                    deletedAt: true,
                },
            });
            if (!user || user.deletedAt) {
                throw new AppError_1.AppError(401, "User account not found");
            }
            if (user.status === "BLOCKED") {
                throw new AppError_1.AppError(403, "Your account has been blocked");
            }
            if (user.status === "INACTIVE") {
                throw new AppError_1.AppError(403, "Your account is inactive");
            }
            if (user.email !== decodedToken.email ||
                user.role !== decodedToken.role) {
                throw new AppError_1.AppError(401, "User authentication information has changed");
            }
            if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
                throw new AppError_1.AppError(403, "You do not have permission to access this resource");
            }
            req.user = {
                userId: user.id,
                email: user.email,
                role: user.role,
            };
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.auth = auth;

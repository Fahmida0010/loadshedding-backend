import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import type { UserRole } from "../../generated/prisma/enums";
import type { IJwtPayload } from "../modules/auth/auth.interface";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";

export const auth = (
  ...requiredRoles: UserRole[]
): RequestHandler => {
  return async (req, _res, next) => {
    try {
      const authorization = req.headers.authorization;

      if (
        !authorization ||
        !authorization.startsWith("Bearer ")
      ) {
        throw new AppError(
          401,
          "Authorization token is required",
        );
      }

      const accessToken = authorization.split(" ")[1];

      if (!accessToken) {
        throw new AppError(401, "Access token is required");
      }

      if (!process.env.JWT_ACCESS_SECRET) {
        throw new AppError(
          500,
          "JWT access secret is not configured",
        );
      }

      let decodedToken: IJwtPayload;

      try {
        decodedToken = jwt.verify(
          accessToken,
          process.env.JWT_ACCESS_SECRET,
        ) as IJwtPayload;
      } catch {
        throw new AppError(
          401,
          "Invalid or expired access token",
        );
      }

      const user = await prisma.user.findUnique({
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
        throw new AppError(401, "User account not found");
      }

      if (user.status === "BLOCKED") {
        throw new AppError(
          403,
          "Your account has been blocked",
        );
      }

      if (user.status === "INACTIVE") {
        throw new AppError(
          403,
          "Your account is inactive",
        );
      }

      if (
        user.email !== decodedToken.email ||
        user.role !== decodedToken.role
      ) {
        throw new AppError(
          401,
          "User authentication information has changed",
        );
      }

      if (
        requiredRoles.length > 0 &&
        !requiredRoles.includes(user.role)
      ) {
        throw new AppError(
          403,
          "You do not have permission to access this resource",
        );
      }

      req.user = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      next();
    } catch (error) {
      next(error);
    }
  };
};
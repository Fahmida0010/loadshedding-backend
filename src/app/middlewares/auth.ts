import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { UserRole } from "../../generated/prisma/enums";
import { AppError } from "../utils/AppError";
import { IJwtPayload } from "../modules/auth/auth.interface";
import { redis } from "../config/redis";
import { prisma } from "../config/prisma";

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

      let decodedToken: IJwtPayload;

      try {
        decodedToken = jwt.verify(
          accessToken,
          env.JWT_ACCESS_SECRET,
        ) as IJwtPayload;
      } catch {
        throw new AppError(
          401,
          "Invalid or expired access token",
        );
      }

      let user: {
        id: string;
        email: string;
        role: UserRole;
        status: string;
        deletedAt: Date | null;
      } | null = null;

      /*
       * প্রথমে Redis cache থেকে user খোঁজা হবে।
       */
      try {
        const cachedUser = await redis.get(
          `auth:user:${decodedToken.userId}`,
        );

        if (cachedUser) {
          user = JSON.parse(cachedUser);
        }
      } catch (error) {
        console.error("Redis cache read error:", error);
      }

      /*
       * Redis-এ না পাওয়া গেলে database থেকে নেওয়া হবে।
       */
      if (!user) {
        user = await prisma.user.findUnique({
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

        if (user) {
          try {
            await redis.set(
              `auth:user:${user.id}`,
              JSON.stringify(user),
              "EX",
              300,
            );
          } catch (error) {
            console.error("Redis cache write error:", error);
          }
        }
      }

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

      /*
       * Token-এর data এবং database-এর data মিলিয়ে দেখা হচ্ছে।
       */
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
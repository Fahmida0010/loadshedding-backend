import type { ErrorRequestHandler } from "express";
import jwt from "jsonwebtoken";
import { ZodError } from "zod";
import { Prisma } from "../../generated/prisma/client.js";
import { AppError } from "../errors/AppError.js";
import config = require("prisma/config");

type TErrorResponse = {
  statusCode: number;
  message: string;
  errorSources?: {
    path: string;
    message: string;
  }[];
};

export const globalErrorHandler: ErrorRequestHandler = (
  error,
  _req,
  res,
  _next,
) => {
  let errorResponse: TErrorResponse = {
    statusCode: 500,
    message: "Something went wrong",
  };

  /*
   * Custom application error
   */
  if (error instanceof AppError) {
    errorResponse = {
      statusCode: error.statusCode,
      message: error.message,
    };
  }

  /*
   * Zod validation error
   */
  else if (error instanceof ZodError) {
    errorResponse = {
      statusCode: 400,
      message: "Validation failed",
      errorSources: error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    };
  }

  /*
   * Prisma unique constraint error
   * Example: একই email বা phone দ্বিতীয়বার ব্যবহার করা।
   */
  else if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    const fields = Array.isArray(error.meta?.target)
      ? error.meta.target.join(", ")
      : "Unique field";

    errorResponse = {
      statusCode: 409,
      message: `${fields} already exists`,
    };
  }

  /*
   * Prisma record not found error
   */
  else if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025"
  ) {
    errorResponse = {
      statusCode: 404,
      message: "Requested record was not found",
    };
  }

  /*
   * Prisma foreign key constraint error
   */
  else if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2003"
  ) {
    errorResponse = {
      statusCode: 400,
      message: "Related record does not exist",
    };
  }

  /*
   * Prisma validation error
   */
  else if (
    error instanceof Prisma.PrismaClientValidationError
  ) {
    errorResponse = {
      statusCode: 400,
      message: "Invalid database request",
    };
  }

  /*
   * JWT expired error
   */
  else if (error instanceof jwt.TokenExpiredError) {
    errorResponse = {
      statusCode: 401,
      message: "Token has expired",
    };
  }

  /*
   * Invalid JWT error
   */
  else if (error instanceof jwt.JsonWebTokenError) {
    errorResponse = {
      statusCode: 401,
      message: "Invalid token",
    };
  }

  /*
   * Normal JavaScript error
   */
  else if (error instanceof Error) {
    errorResponse = {
      statusCode: 500,
      message: error.message || "Internal server error",
    };
  }

  res.status(errorResponse.statusCode).json({
    success: false,
    message: errorResponse.message,
    errorSources: errorResponse.errorSources,
    stack:
      config.env.NODE_ENV === "development"
        ? error instanceof Error
          ? error.stack
          : undefined
        : undefined,
  });
};
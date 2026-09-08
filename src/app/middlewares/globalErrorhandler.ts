import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError";

type TErrorSource = {
  path: string;
  message: string;
};

type TErrorResponse = {
  statusCode: number;
  message: string;
  errorSources?: TErrorSource[];
};

type TPrismaError = Error & {
  code?: string;
  meta?: {
    target?: string | string[];
    field_name?: string;
  };
};

const isPrismaError = (
  error: unknown,
): error is TPrismaError => {
  return (
    error instanceof Error &&
    "code" in error &&
    typeof (error as TPrismaError).code === "string"
  );
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
   * Prisma errors
   */
  else if (isPrismaError(error)) {
    if (error.code === "P2002") {
      const target = error.meta?.target;

      const fields = Array.isArray(target)
        ? target.join(", ")
        : typeof target === "string"
          ? target
          : "Email or phone";

      errorResponse = {
        statusCode: 409,
        message: `${fields} already exists`,
      };
    } else if (error.code === "P2025") {
      errorResponse = {
        statusCode: 404,
        message: "Requested record was not found",
      };
    } else if (error.code === "P2003") {
      errorResponse = {
        statusCode: 400,
        message: "Related record does not exist",
      };
    } else {
      errorResponse = {
        statusCode: 400,
        message: "Database request failed",
      };
    }
  }

  /*
   * Prisma validation error
   */
  else if (
    error instanceof Error &&
    error.name === "PrismaClientValidationError"
  ) {
    errorResponse = {
      statusCode: 400,
      message: "Invalid database request",
    };
  }

  /*
   * JWT expired error
   */
  else if (
    error instanceof Error &&
    error.name === "TokenExpiredError"
  ) {
    errorResponse = {
      statusCode: 401,
      message: "Token has expired",
    };
  }

  /*
   * Invalid JWT error
   */
  else if (
    error instanceof Error &&
    error.name === "JsonWebTokenError"
  ) {
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
      message:
        error.message || "Internal server error",
    };
  }

  res.status(errorResponse.statusCode).json({
    success: false,
    message: errorResponse.message,
    errorSources:
      errorResponse.errorSources ?? [],
    stack:
      process.env.NODE_ENV === "development" &&
      error instanceof Error
        ? error.stack
        : undefined,
  });
};
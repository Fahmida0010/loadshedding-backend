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

const isPrismaError = (error: unknown): error is TPrismaError => {
	return (
		error instanceof Error &&
		"code" in error &&
		typeof (error as TPrismaError).code === "string"
	);
};

export const globalErrorHandler: ErrorRequestHandler = (
	error,
	req,
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
	} else if (error instanceof ZodError) {
		/*
		 * Zod validation error
		 */
		errorResponse = {
			statusCode: 400,
			message: "Validation failed",
			errorSources: error.issues.map((issue) => ({
				path: issue.path.join("."),
				message: issue.message,
			})),
		};
	} else if (isPrismaError(error)) {
		/*
		 * Prisma errors
		 */
		if (error.code === "P2002") {
			const target = error.meta?.target;

			const targetText = Array.isArray(target)
				? target.join(" ").toLowerCase()
				: String(target ?? "").toLowerCase();

			const errorMessage =
				error instanceof Error ? error.message.toLowerCase() : "";

			const errorDetails = `${targetText} ${errorMessage}`;

			let message = "A record with the same value already exists";

			if (
				errorDetails.includes("substations_zoneid_name_key") ||
				(errorDetails.includes("zoneid") && errorDetails.includes("name"))
			) {
				const substationName = req.body?.name;

				message = substationName
					? `Substation name "${substationName}" already exists in this distribution zone`
					: "A substation with this name already exists in this distribution zone";
			} else if (
				errorDetails.includes("substations_code_key") ||
				errorDetails.includes("code")
			) {
				const code = req.body?.code;

				message = code
					? `Substation code "${code}" already exists`
					: "A substation with this code already exists";
			} else if (errorDetails.includes("email")) {
				message = "An account with this email already exists";
			} else if (errorDetails.includes("phone")) {
				message = "An account with this phone number already exists";
			}

			errorResponse = {
				statusCode: 409,
				message,
				errorSources: [],
			};
		}
	} else if (
		/*
		 * Prisma validation error
		 */
		error instanceof Error &&
		error.name === "PrismaClientValidationError"
	) {
		errorResponse = {
			statusCode: 400,
			message: "Invalid database request",
		};
	} else if (error instanceof Error && error.name === "TokenExpiredError") {
		/*
		 * JWT expired error
		 */
		errorResponse = {
			statusCode: 401,
			message: "Token has expired",
		};
	} else if (error instanceof Error && error.name === "JsonWebTokenError") {
		/*
		 * Invalid JWT error
		 */
		errorResponse = {
			statusCode: 401,
			message: "Invalid token",
		};
	} else if (error instanceof Error) {
		/*
		 * Normal JavaScript error
		 */
		errorResponse = {
			statusCode: 500,
			message: error.message || "Internal server error",
		};
	}

	res.status(errorResponse.statusCode).json({
		success: false,
		message: errorResponse.message,
		errorSources: errorResponse.errorSources ?? [],
		stack:
			process.env.NODE_ENV === "development" && error instanceof Error
				? error.stack
				: undefined,
	});
};

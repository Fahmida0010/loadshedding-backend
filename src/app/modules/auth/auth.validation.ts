import { z } from "zod";

const passwordValidation = z
	.string({
		error: "Password is required",
	})
	.min(8, "Password must be at least 8 characters")
	.max(72, "Password cannot be more than 72 characters")
	.regex(/[a-z]/, "Password must contain a lowercase letter")
	.regex(/[A-Z]/, "Password must contain an uppercase letter")
	.regex(/[0-9]/, "Password must contain a number");

const registerUserValidationSchema = z.object({
	body: z.object({
		name: z
			.string({
				error: "Name is required",
			})
			.trim()
			.min(2, "Name must be at least 2 characters")
			.max(80, "Name cannot be more than 80 characters"),

		email: z
			.email("Invalid email address")
			.transform((email) => email.toLowerCase()),

		password: passwordValidation,

		phone: z
			.string()
			.trim()
			.min(7, "Invalid phone number")
			.max(20, "Invalid phone number")
			.optional(),

		areaId: z.uuid("Invalid area ID").optional(),

		role: z.enum(["ADMIN", "TECHNICIAN", "CUSTOMER"]).default("CUSTOMER"),
	}),
});

const loginUserValidationSchema = z.object({
	body: z.object({
		email: z
			.email("Invalid email address")
			.transform((email) => email.toLowerCase()),

		password: z.string({
			error: "Password is required",
		}),
	}),
});

const googleLoginValidationSchema = z.object({
	body: z.object({
		idToken: z.string().min(1, "Google ID token is required"),
	}),
});

const refreshTokenValidationSchema = z.object({
	body: z
		.object({
			refreshToken: z.string().optional(),
		})
		.optional(),
});

const logoutValidationSchema = z.object({
	body: z
		.object({
			refreshToken: z.string().optional(),
		})
		.optional(),
});

const updateProfileValidationSchema = z.object({
	body: z
		.object({
			name: z
				.string()
				.trim()
				.min(2, "Name must contain at least 2 characters")
				.optional(),

			phone: z
				.string()
				.trim()
				.min(10, "Invalid phone number")
				.max(15, "Invalid phone number")
				.nullable()
				.optional(),

			profileImage: z
				.string()
				.url("Profile image must be a valid URL")
				.nullable()
				.optional(),

			areaId: z.string().uuid("Invalid area ID").nullable().optional(),
		})
		.refine(
			(data) => Object.values(data).some((value) => value !== undefined),
			{
				message: "At least one profile field is required",
			},
		),
});

const changePasswordValidationSchema = z.object({
	body: z
		.object({
			currentPassword: z.string().min(1, "Current password is required"),
			newPassword: passwordValidation,
		})
		.refine((data) => data.currentPassword !== data.newPassword, {
			message: "New password must be different from current password",
			path: ["newPassword"],
		}),
});

export const AuthValidation = {
	registerUserValidationSchema,
	loginUserValidationSchema,
	googleLoginValidationSchema,
	refreshTokenValidationSchema,
	logoutValidationSchema,
	updateProfileValidationSchema,
	changePasswordValidationSchema,
};

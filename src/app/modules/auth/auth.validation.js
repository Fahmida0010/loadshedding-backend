"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthValidation = void 0;
const zod_1 = require("zod");
const passwordValidation = zod_1.z
    .string({
    error: "Password is required",
})
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password cannot be more than 72 characters")
    .regex(/[a-z]/, "Password must contain a lowercase letter")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[0-9]/, "Password must contain a number");
const registerUserValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z
            .string({
            error: "Name is required",
        })
            .trim()
            .min(2, "Name must be at least 2 characters")
            .max(80, "Name cannot be more than 80 characters"),
        email: zod_1.z
            .email("Invalid email address")
            .transform((email) => email.toLowerCase()),
        password: passwordValidation,
        phone: zod_1.z
            .string()
            .trim()
            .min(7, "Invalid phone number")
            .max(20, "Invalid phone number")
            .optional(),
        areaId: zod_1.z.uuid("Invalid area ID").optional(),
        role: zod_1.z.enum(["ADMIN", "TECHNICIAN", "CUSTOMER"]).default("CUSTOMER"),
    }),
});
const loginUserValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z
            .email("Invalid email address")
            .transform((email) => email.toLowerCase()),
        password: zod_1.z.string({
            error: "Password is required",
        }),
    }),
});
const googleLoginValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        idToken: zod_1.z.string().min(1, "Google ID token is required"),
    }),
});
const refreshTokenValidationSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        refreshToken: zod_1.z.string().optional(),
    })
        .optional(),
});
const logoutValidationSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        refreshToken: zod_1.z.string().optional(),
    })
        .optional(),
});
const updateProfileValidationSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        name: zod_1.z
            .string()
            .trim()
            .min(2, "Name must contain at least 2 characters")
            .optional(),
        phone: zod_1.z
            .string()
            .trim()
            .min(10, "Invalid phone number")
            .max(15, "Invalid phone number")
            .nullable()
            .optional(),
        profileImage: zod_1.z
            .string()
            .url("Profile image must be a valid URL")
            .nullable()
            .optional(),
        areaId: zod_1.z.string().uuid("Invalid area ID").nullable().optional(),
    })
        .refine((data) => Object.values(data).some((value) => value !== undefined), {
        message: "At least one profile field is required",
    }),
});
const changePasswordValidationSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        currentPassword: zod_1.z.string().min(1, "Current password is required"),
        newPassword: passwordValidation,
    })
        .refine((data) => data.currentPassword !== data.newPassword, {
        message: "New password must be different from current password",
        path: ["newPassword"],
    }),
});
exports.AuthValidation = {
    registerUserValidationSchema,
    loginUserValidationSchema,
    googleLoginValidationSchema,
    refreshTokenValidationSchema,
    logoutValidationSchema,
    updateProfileValidationSchema,
    changePasswordValidationSchema,
};

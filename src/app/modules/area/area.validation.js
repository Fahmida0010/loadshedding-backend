"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AreaValidation = void 0;
const zod_1 = require("zod");
const prioritySchema = zod_1.z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);
const createAreaValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        feederId: zod_1.z
            .string({
            required_error: "Feeder ID is required",
        })
            .uuid("Invalid feeder ID"),
        name: zod_1.z
            .string({
            required_error: "Area name is required",
        })
            .trim()
            .min(2, "Area name must contain at least 2 characters")
            .max(100, "Area name cannot exceed 100 characters"),
        code: zod_1.z
            .string({
            required_error: "Area code is required",
        })
            .trim()
            .min(2, "Area code must contain at least 2 characters")
            .max(30, "Area code cannot exceed 30 characters")
            .transform((value) => value.toUpperCase()),
        location: zod_1.z
            .string()
            .trim()
            .max(255, "Location cannot exceed 255 characters")
            .optional(),
        population: zod_1.z
            .number({
            invalid_type_error: "Population must be a number",
        })
            .int("Population must be an integer")
            .nonnegative("Population cannot be negative")
            .optional(),
        priority: prioritySchema.default("MEDIUM"),
    }),
});
const updateAreaValidationSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        feederId: zod_1.z.string().uuid("Invalid feeder ID").optional(),
        name: zod_1.z
            .string()
            .trim()
            .min(2, "Area name must contain at least 2 characters")
            .max(100)
            .optional(),
        code: zod_1.z
            .string()
            .trim()
            .min(2, "Area code must contain at least 2 characters")
            .max(30)
            .transform((value) => value.toUpperCase())
            .optional(),
        location: zod_1.z.string().trim().max(255).nullable().optional(),
        population: zod_1.z
            .number()
            .int("Population must be an integer")
            .nonnegative("Population cannot be negative")
            .nullable()
            .optional(),
        priority: prioritySchema.optional(),
    })
        .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field is required for update",
    }),
});
const areaIdValidationSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid("Invalid area ID"),
    }),
});
exports.AreaValidation = {
    createAreaValidationSchema,
    updateAreaValidationSchema,
    areaIdValidationSchema,
};

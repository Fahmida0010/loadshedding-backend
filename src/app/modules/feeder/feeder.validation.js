"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeederValidation = void 0;
const zod_1 = require("zod");
const prioritySchema = zod_1.z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);
const createFeederValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        substationId: zod_1.z
            .string({
            required_error: "Substation ID is required",
        })
            .uuid("Invalid substation ID"),
        name: zod_1.z
            .string({
            required_error: "Feeder name is required",
        })
            .trim()
            .min(2, "Feeder name must contain at least 2 characters")
            .max(100, "Feeder name cannot exceed 100 characters"),
        code: zod_1.z
            .string({
            required_error: "Feeder code is required",
        })
            .trim()
            .min(2, "Feeder code must contain at least 2 characters")
            .max(30, "Feeder code cannot exceed 30 characters")
            .transform((value) => value.toUpperCase()),
        capacityMw: zod_1.z
            .number({
            invalid_type_error: "Capacity must be a number",
        })
            .positive("Capacity must be greater than zero")
            .optional(),
        priority: prioritySchema.default("MEDIUM"),
    }),
});
const updateFeederValidationSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        substationId: zod_1.z.string().uuid("Invalid substation ID").optional(),
        name: zod_1.z
            .string()
            .trim()
            .min(2, "Feeder name must contain at least 2 characters")
            .max(100)
            .optional(),
        code: zod_1.z
            .string()
            .trim()
            .min(2)
            .max(30)
            .transform((value) => value.toUpperCase())
            .optional(),
        capacityMw: zod_1.z
            .number()
            .positive("Capacity must be greater than zero")
            .nullable()
            .optional(),
        priority: prioritySchema.optional(),
    })
        .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field is required for update",
    }),
});
const feederIdValidationSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid("Invalid feeder ID"),
    }),
});
exports.FeederValidation = {
    createFeederValidationSchema,
    updateFeederValidationSchema,
    feederIdValidationSchema,
};

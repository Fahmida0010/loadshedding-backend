"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubstationValidation = void 0;
const zod_1 = require("zod");
const createSubstationValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        zoneId: zod_1.z
            .string({
            required_error: "Distribution zone ID is required",
        })
            .uuid("Invalid distribution zone ID"),
        name: zod_1.z
            .string({
            required_error: "Substation name is required",
        })
            .trim()
            .min(2, "Substation name must contain at least 2 characters")
            .max(100, "Substation name cannot exceed 100 characters"),
        code: zod_1.z
            .string({
            required_error: "Substation code is required",
        })
            .trim()
            .min(2, "Substation code must contain at least 2 characters")
            .max(30, "Substation code cannot exceed 30 characters")
            .transform((value) => value.toUpperCase()),
        location: zod_1.z
            .string()
            .trim()
            .max(255, "Location cannot exceed 255 characters")
            .optional(),
        capacityMw: zod_1.z
            .number()
            .positive("Capacity must be greater than zero")
            .optional(),
        voltageLevel: zod_1.z
            .string()
            .trim()
            .max(50, "Voltage level cannot exceed 50 characters")
            .optional(),
    }),
});
const updateSubstationValidationSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        zoneId: zod_1.z.string().uuid("Invalid distribution zone ID").optional(),
        name: zod_1.z
            .string()
            .trim()
            .min(2, "Substation name must contain at least 2 characters")
            .max(100)
            .optional(),
        code: zod_1.z
            .string()
            .trim()
            .min(2)
            .max(30)
            .transform((value) => value.toUpperCase())
            .optional(),
        location: zod_1.z.string().trim().max(255).nullable().optional(),
        capacityMw: zod_1.z
            .number()
            .positive("Capacity must be greater than zero")
            .nullable()
            .optional(),
        voltageLevel: zod_1.z.string().trim().max(50).nullable().optional(),
    })
        .refine((data) => Object.keys(data).length > 0, "At least one field is required for update"),
});
const substationIdValidationSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid("Invalid substation ID"),
    }),
});
exports.SubstationValidation = {
    createSubstationValidationSchema,
    updateSubstationValidationSchema,
    substationIdValidationSchema,
};

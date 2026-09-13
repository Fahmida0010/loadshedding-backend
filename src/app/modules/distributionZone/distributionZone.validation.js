"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DistributionZoneValidation = void 0;
const zod_1 = require("zod");
const createDistributionZoneValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z
            .string({
            message: "Zone name is required",
        })
            .trim()
            .min(2, "Zone name must be at least 2 characters")
            .max(100, "Zone name cannot exceed 100 characters"),
        code: zod_1.z
            .string({
            message: "Zone code is required",
        })
            .trim()
            .min(2, "Zone code must be at least 2 characters")
            .max(30, "Zone code cannot exceed 30 characters")
            .transform((value) => value.toUpperCase()),
        description: zod_1.z
            .string()
            .trim()
            .max(500, "Description cannot exceed 500 characters")
            .optional(),
    }),
});
const updateDistributionZoneValidationSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        name: zod_1.z
            .string()
            .trim()
            .min(2, "Zone name must be at least 2 characters")
            .max(100, "Zone name cannot exceed 100 characters")
            .optional(),
        code: zod_1.z
            .string()
            .trim()
            .min(2, "Zone code must be at least 2 characters")
            .max(30, "Zone code cannot exceed 30 characters")
            .transform((value) => value.toUpperCase())
            .optional(),
        description: zod_1.z
            .string()
            .trim()
            .max(500, "Description cannot exceed 500 characters")
            .nullable()
            .optional(),
    })
        .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field is required to update",
    }),
});
const distributionZoneIdValidationSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.uuid("Invalid distribution zone ID"),
    }),
});
exports.DistributionZoneValidation = {
    createDistributionZoneValidationSchema,
    updateDistributionZoneValidationSchema,
    distributionZoneIdValidationSchema,
};

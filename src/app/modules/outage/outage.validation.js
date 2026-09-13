"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutageValidation = exports.outageIdParamSchema = exports.updateOutageStatusSchema = exports.updateOutageSchema = exports.createOutageSchema = void 0;
const zod_1 = require("zod");
const prioritySchema = zod_1.z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);
const outageStatusSchema = zod_1.z.enum([
    "REPORTED",
    "CONFIRMED",
    "ASSIGNED",
    "IN_PROGRESS",
    "RESOLVED",
    "CLOSED",
    "CANCELLED",
]);
const nullableText = zod_1.z
    .union([zod_1.z.string().trim().max(1000), zod_1.z.null()])
    .optional();
const nullableDate = zod_1.z.union([zod_1.z.coerce.date(), zod_1.z.null()]).optional();
exports.createOutageSchema = zod_1.z.object({
    body: zod_1.z.object({
        areaId: zod_1.z.uuid("Invalid area ID"),
        title: zod_1.z
            .string()
            .trim()
            .min(3, "Title must be at least 3 characters")
            .max(150, "Title cannot exceed 150 characters"),
        description: zod_1.z
            .string()
            .trim()
            .max(1000, "Description cannot exceed 1000 characters")
            .optional(),
        reason: zod_1.z
            .string()
            .trim()
            .max(500, "Reason cannot exceed 500 characters")
            .optional(),
        priority: prioritySchema.default("MEDIUM"),
        estimatedRestoreAt: zod_1.z.coerce.date().optional(),
    }),
});
exports.updateOutageSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        areaId: zod_1.z.uuid("Invalid area ID").optional(),
        title: zod_1.z
            .string()
            .trim()
            .min(3, "Title must be at least 3 characters")
            .max(150, "Title cannot exceed 150 characters")
            .optional(),
        description: nullableText,
        reason: zod_1.z.union([zod_1.z.string().trim().max(500), zod_1.z.null()]).optional(),
        priority: prioritySchema.optional(),
        estimatedRestoreAt: nullableDate,
    })
        .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field is required for update",
    }),
});
exports.updateOutageStatusSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: outageStatusSchema,
        reason: zod_1.z
            .string()
            .trim()
            .max(500, "Reason cannot exceed 500 characters")
            .optional(),
        estimatedRestoreAt: nullableDate,
    }),
});
exports.outageIdParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.uuid("Invalid outage ID"),
    }),
});
exports.OutageValidation = {
    createOutageSchema: exports.createOutageSchema,
    updateOutageSchema: exports.updateOutageSchema,
    updateOutageStatusSchema: exports.updateOutageStatusSchema,
    outageIdParamSchema: exports.outageIdParamSchema,
};

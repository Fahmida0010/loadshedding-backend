"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TechnicianAssignmentValidation = void 0;
const zod_1 = require("zod");
const assignmentStatusEnum = zod_1.z.enum([
    "ASSIGNED",
    "ACCEPTED",
    "REJECTED",
    "IN_PROGRESS",
    "COMPLETED",
]);
const createTechnicianAssignmentSchema = zod_1.z.object({
    body: zod_1.z.object({
        outageId: zod_1.z.string().uuid("Invalid outage ID"),
        technicianId: zod_1.z.string().uuid("Invalid technician ID"),
        notes: zod_1.z
            .string()
            .trim()
            .max(1000, "Notes cannot exceed 1000 characters")
            .optional(),
    }),
});
const updateAssignmentStatusSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: assignmentStatusEnum,
        notes: zod_1.z
            .string()
            .trim()
            .max(1000, "Notes cannot exceed 1000 characters")
            .optional(),
    }),
});
const updateTechnicianAssignmentSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        technicianId: zod_1.z.string().uuid("Invalid technician ID").optional(),
        notes: zod_1.z
            .string()
            .trim()
            .max(1000, "Notes cannot exceed 1000 characters")
            .nullable()
            .optional(),
    })
        .refine((data) => data.technicianId !== undefined || data.notes !== undefined, {
        message: "At least one field is required",
    }),
});
const createRepairUpdateSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid("Valid assignment ID is required"),
    }),
    body: zod_1.z.object({
        note: zod_1.z
            .string()
            .trim()
            .min(5, "Repair note must be at least 5 characters")
            .max(1000, "Repair note is too long"),
    }),
});
const resolveOutageSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid("Valid assignment ID is required"),
    }),
    body: zod_1.z.object({
        description: zod_1.z
            .string()
            .trim()
            .min(10, "Resolution description must be at least 10 characters")
            .max(2000),
        actionTaken: zod_1.z.string().trim().min(5).max(1000).optional(),
        durationMinutes: zod_1.z
            .number()
            .int()
            .positive("Duration must be a positive number")
            .optional(),
    }),
});
exports.TechnicianAssignmentValidation = {
    createTechnicianAssignmentSchema,
    updateAssignmentStatusSchema,
    updateTechnicianAssignmentSchema,
    createRepairUpdateSchema,
    resolveOutageSchema,
};

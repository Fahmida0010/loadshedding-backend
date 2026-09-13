"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleValidation = exports.scheduleIdParamSchema = exports.updateScheduleSchema = exports.createScheduleSchema = void 0;
const zod_1 = require("zod");
const scheduleTypeSchema = zod_1.z.enum(["LOAD_SHEDDING", "PLANNED_OUTAGE"]);
const prioritySchema = zod_1.z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);
const scheduleStatusSchema = zod_1.z.enum([
    "SCHEDULED",
    "ACTIVE",
    "COMPLETED",
    "CANCELLED",
]);
exports.createScheduleSchema = zod_1.z.object({
    body: zod_1.z
        .object({
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
        type: scheduleTypeSchema.default("LOAD_SHEDDING"),
        priority: prioritySchema.default("MEDIUM"),
        scheduledStart: zod_1.z.coerce.date(),
        scheduledEnd: zod_1.z.coerce.date(),
        isRecurring: zod_1.z.boolean().default(false),
        recurrenceRule: zod_1.z.string().trim().max(255).optional(),
        status: scheduleStatusSchema.default("SCHEDULED"),
    })
        .superRefine((data, ctx) => {
        if (data.scheduledEnd <= data.scheduledStart) {
            ctx.addIssue({
                code: "custom",
                path: ["scheduledEnd"],
                message: "Scheduled end time must be later than scheduled start time",
            });
        }
        if (data.isRecurring && !data.recurrenceRule) {
            ctx.addIssue({
                code: "custom",
                path: ["recurrenceRule"],
                message: "Recurrence rule is required for a recurring schedule",
            });
        }
        if (!data.isRecurring && data.recurrenceRule) {
            ctx.addIssue({
                code: "custom",
                path: ["recurrenceRule"],
                message: "Recurrence rule is only allowed for recurring schedules",
            });
        }
    }),
});
exports.updateScheduleSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        areaId: zod_1.z.uuid("Invalid area ID").optional(),
        title: zod_1.z
            .string()
            .trim()
            .min(3, "Title must be at least 3 characters")
            .max(150, "Title cannot exceed 150 characters")
            .optional(),
        description: zod_1.z.string().trim().max(1000).nullable().optional(),
        type: scheduleTypeSchema.optional(),
        priority: prioritySchema.optional(),
        scheduledStart: zod_1.z.coerce.date().optional(),
        scheduledEnd: zod_1.z.coerce.date().optional(),
        isRecurring: zod_1.z.boolean().optional(),
        recurrenceRule: zod_1.z.string().trim().max(255).nullable().optional(),
        status: scheduleStatusSchema.optional(),
    })
        .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field is required for update",
    }),
});
exports.scheduleIdParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.uuid("Invalid schedule ID"),
    }),
});
exports.ScheduleValidation = {
    createScheduleSchema: exports.createScheduleSchema,
    updateScheduleSchema: exports.updateScheduleSchema,
    scheduleIdParamSchema: exports.scheduleIdParamSchema,
};

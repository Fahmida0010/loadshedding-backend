import { z } from "zod";

const scheduleTypeSchema = z.enum([
  "LOAD_SHEDDING",
  "PLANNED_OUTAGE",
]);

const prioritySchema = z.enum([
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
]);

const scheduleStatusSchema = z.enum([
  "SCHEDULED",
  "ACTIVE",
  "COMPLETED",
  "CANCELLED",
]);

export const createScheduleSchema = z.object({
  body: z
    .object({
      areaId: z.uuid("Invalid area ID"),

      title: z
        .string()
        .trim()
        .min(3, "Title must be at least 3 characters")
        .max(150, "Title cannot exceed 150 characters"),

      description: z
        .string()
        .trim()
        .max(1000, "Description cannot exceed 1000 characters")
        .optional(),

      type: scheduleTypeSchema.default("LOAD_SHEDDING"),

      priority: prioritySchema.default("MEDIUM"),

      scheduledStart: z.coerce.date(),

      scheduledEnd: z.coerce.date(),

      isRecurring: z.boolean().default(false),

      recurrenceRule: z
        .string()
        .trim()
        .max(255)
        .optional(),

      status: scheduleStatusSchema.default("SCHEDULED"),
    })
    .superRefine((data, ctx) => {
      if (data.scheduledEnd <= data.scheduledStart) {
        ctx.addIssue({
          code: "custom",
          path: ["scheduledEnd"],
          message:
            "Scheduled end time must be later than scheduled start time",
        });
      }

      if (data.isRecurring && !data.recurrenceRule) {
        ctx.addIssue({
          code: "custom",
          path: ["recurrenceRule"],
          message:
            "Recurrence rule is required for a recurring schedule",
        });
      }

      if (!data.isRecurring && data.recurrenceRule) {
        ctx.addIssue({
          code: "custom",
          path: ["recurrenceRule"],
          message:
            "Recurrence rule is only allowed for recurring schedules",
        });
      }
    }),
});

export const updateScheduleSchema = z.object({
  body: z
    .object({
      areaId: z.uuid("Invalid area ID").optional(),

      title: z
        .string()
        .trim()
        .min(3, "Title must be at least 3 characters")
        .max(150, "Title cannot exceed 150 characters")
        .optional(),

      description: z
        .string()
        .trim()
        .max(1000)
        .nullable()
        .optional(),

      type: scheduleTypeSchema.optional(),

      priority: prioritySchema.optional(),

      scheduledStart: z.coerce.date().optional(),

      scheduledEnd: z.coerce.date().optional(),

      isRecurring: z.boolean().optional(),

      recurrenceRule: z
        .string()
        .trim()
        .max(255)
        .nullable()
        .optional(),

      status: scheduleStatusSchema.optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field is required for update",
    }),
});

export const scheduleIdParamSchema = z.object({
  params: z.object({
    id: z.uuid("Invalid schedule ID"),
  }),
});

export const ScheduleValidation = {
  createScheduleSchema,
  updateScheduleSchema,
  scheduleIdParamSchema,
};
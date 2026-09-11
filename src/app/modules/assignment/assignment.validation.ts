import { z } from "zod";

const assignmentStatusEnum = z.enum([
  "ASSIGNED",
  "ACCEPTED",
  "REJECTED",
  "IN_PROGRESS",
  "COMPLETED",
]);

const createTechnicianAssignmentSchema = z.object({
  body: z.object({
    outageId: z.string().uuid("Invalid outage ID"),
    technicianId: z.string().uuid("Invalid technician ID"),
    notes: z
      .string()
      .trim()
      .max(1000, "Notes cannot exceed 1000 characters")
      .optional(),
  }),
});

const updateAssignmentStatusSchema = z.object({
  body: z.object({
    status: assignmentStatusEnum,
    notes: z
      .string()
      .trim()
      .max(1000, "Notes cannot exceed 1000 characters")
      .optional(),
  }),
});

const updateTechnicianAssignmentSchema = z.object({
  body: z
    .object({
      technicianId: z.string().uuid("Invalid technician ID").optional(),
      notes: z
        .string()
        .trim()
        .max(1000, "Notes cannot exceed 1000 characters")
        .nullable()
        .optional(),
    })
    .refine(
      (data) =>
        data.technicianId !== undefined ||
        data.notes !== undefined,
      {
        message: "At least one field is required",
      },
    ),
});

export const TechnicianAssignmentValidation = {
  createTechnicianAssignmentSchema,
  updateAssignmentStatusSchema,
  updateTechnicianAssignmentSchema,
};
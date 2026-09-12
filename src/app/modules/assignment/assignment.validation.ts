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
			(data) => data.technicianId !== undefined || data.notes !== undefined,
			{
				message: "At least one field is required",
			},
		),
});

const createRepairUpdateSchema = z.object({
	params: z.object({
		id: z.string().uuid("Valid assignment ID is required"),
	}),

	body: z.object({
		note: z
			.string()
			.trim()
			.min(5, "Repair note must be at least 5 characters")
			.max(1000, "Repair note is too long"),
	}),
});

const resolveOutageSchema = z.object({
	params: z.object({
		id: z.string().uuid("Valid assignment ID is required"),
	}),

	body: z.object({
		description: z
			.string()
			.trim()
			.min(10, "Resolution description must be at least 10 characters")
			.max(2000),

		actionTaken: z.string().trim().min(5).max(1000).optional(),

		durationMinutes: z
			.number()
			.int()
			.positive("Duration must be a positive number")
			.optional(),
	}),
});
export const TechnicianAssignmentValidation = {
	createTechnicianAssignmentSchema,
	updateAssignmentStatusSchema,
	updateTechnicianAssignmentSchema,
	createRepairUpdateSchema,
	resolveOutageSchema,
};

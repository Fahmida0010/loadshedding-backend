import { z } from "zod";

const prioritySchema = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);

const outageStatusSchema = z.enum([
	"REPORTED",
	"CONFIRMED",
	"ASSIGNED",
	"IN_PROGRESS",
	"RESOLVED",
	"CLOSED",
	"CANCELLED",
]);

const nullableText = z
	.union([z.string().trim().max(1000), z.null()])
	.optional();

const nullableDate = z.union([z.coerce.date(), z.null()]).optional();

export const createOutageSchema = z.object({
	body: z.object({
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

		reason: z
			.string()
			.trim()
			.max(500, "Reason cannot exceed 500 characters")
			.optional(),

		priority: prioritySchema.default("MEDIUM"),

		estimatedRestoreAt: z.coerce.date().optional(),
	}),
});

export const updateOutageSchema = z.object({
	body: z
		.object({
			areaId: z.uuid("Invalid area ID").optional(),

			title: z
				.string()
				.trim()
				.min(3, "Title must be at least 3 characters")
				.max(150, "Title cannot exceed 150 characters")
				.optional(),

			description: nullableText,

			reason: z.union([z.string().trim().max(500), z.null()]).optional(),

			priority: prioritySchema.optional(),

			estimatedRestoreAt: nullableDate,
		})
		.refine((data) => Object.keys(data).length > 0, {
			message: "At least one field is required for update",
		}),
});

export const updateOutageStatusSchema = z.object({
	body: z.object({
		status: outageStatusSchema,

		reason: z
			.string()
			.trim()
			.max(500, "Reason cannot exceed 500 characters")
			.optional(),

		estimatedRestoreAt: nullableDate,
	}),
});

export const outageIdParamSchema = z.object({
	params: z.object({
		id: z.uuid("Invalid outage ID"),
	}),
});

export const OutageValidation = {
	createOutageSchema,
	updateOutageSchema,
	updateOutageStatusSchema,
	outageIdParamSchema,
};

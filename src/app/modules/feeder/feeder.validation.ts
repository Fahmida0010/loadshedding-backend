import { z } from "zod";

const prioritySchema = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);

const createFeederValidationSchema = z.object({
	body: z.object({
		substationId: z
			.string({
				required_error: "Substation ID is required",
			})
			.uuid("Invalid substation ID"),

		name: z
			.string({
				required_error: "Feeder name is required",
			})
			.trim()
			.min(2, "Feeder name must contain at least 2 characters")
			.max(100, "Feeder name cannot exceed 100 characters"),

		code: z
			.string({
				required_error: "Feeder code is required",
			})
			.trim()
			.min(2, "Feeder code must contain at least 2 characters")
			.max(30, "Feeder code cannot exceed 30 characters")
			.transform((value) => value.toUpperCase()),

		capacityMw: z
			.number({
				invalid_type_error: "Capacity must be a number",
			})
			.positive("Capacity must be greater than zero")
			.optional(),

		priority: prioritySchema.default("MEDIUM"),
	}),
});

const updateFeederValidationSchema = z.object({
	body: z
		.object({
			substationId: z.string().uuid("Invalid substation ID").optional(),

			name: z
				.string()
				.trim()
				.min(2, "Feeder name must contain at least 2 characters")
				.max(100)
				.optional(),

			code: z
				.string()
				.trim()
				.min(2)
				.max(30)
				.transform((value) => value.toUpperCase())
				.optional(),

			capacityMw: z
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

const feederIdValidationSchema = z.object({
	params: z.object({
		id: z.string().uuid("Invalid feeder ID"),
	}),
});

export const FeederValidation = {
	createFeederValidationSchema,
	updateFeederValidationSchema,
	feederIdValidationSchema,
};

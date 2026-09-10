import { z } from "zod";

const createSubstationValidationSchema = z.object({
	body: z.object({
		zoneId: z
			.string({
				required_error: "Distribution zone ID is required",
			})
			.uuid("Invalid distribution zone ID"),

		name: z
			.string({
				required_error: "Substation name is required",
			})
			.trim()
			.min(2, "Substation name must contain at least 2 characters")
			.max(100, "Substation name cannot exceed 100 characters"),

		code: z
			.string({
				required_error: "Substation code is required",
			})
			.trim()
			.min(2, "Substation code must contain at least 2 characters")
			.max(30, "Substation code cannot exceed 30 characters")
			.transform((value) => value.toUpperCase()),

		location: z
			.string()
			.trim()
			.max(255, "Location cannot exceed 255 characters")
			.optional(),

		capacityMw: z
			.number()
			.positive("Capacity must be greater than zero")
			.optional(),

		voltageLevel: z
			.string()
			.trim()
			.max(50, "Voltage level cannot exceed 50 characters")
			.optional(),
	}),
});

const updateSubstationValidationSchema = z.object({
	body: z
		.object({
			zoneId: z.string().uuid("Invalid distribution zone ID").optional(),

			name: z
				.string()
				.trim()
				.min(2, "Substation name must contain at least 2 characters")
				.max(100)
				.optional(),

			code: z
				.string()
				.trim()
				.min(2)
				.max(30)
				.transform((value) => value.toUpperCase())
				.optional(),

			location: z.string().trim().max(255).nullable().optional(),

			capacityMw: z
				.number()
				.positive("Capacity must be greater than zero")
				.nullable()
				.optional(),

			voltageLevel: z.string().trim().max(50).nullable().optional(),
		})
		.refine(
			(data) => Object.keys(data).length > 0,
			"At least one field is required for update",
		),
});

const substationIdValidationSchema = z.object({
	params: z.object({
		id: z.string().uuid("Invalid substation ID"),
	}),
});

export const SubstationValidation = {
	createSubstationValidationSchema,
	updateSubstationValidationSchema,
	substationIdValidationSchema,
};

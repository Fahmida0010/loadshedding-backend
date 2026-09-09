import { z } from "zod";

const prioritySchema = z.enum([
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
]);

const createAreaValidationSchema = z.object({
  body: z.object({
    feederId: z
      .string({
        required_error: "Feeder ID is required",
      })
      .uuid("Invalid feeder ID"),

    name: z
      .string({
        required_error: "Area name is required",
      })
      .trim()
      .min(
        2,
        "Area name must contain at least 2 characters",
      )
      .max(
        100,
        "Area name cannot exceed 100 characters",
      ),

    code: z
      .string({
        required_error: "Area code is required",
      })
      .trim()
      .min(
        2,
        "Area code must contain at least 2 characters",
      )
      .max(
        30,
        "Area code cannot exceed 30 characters",
      )
      .transform((value) => value.toUpperCase()),

    location: z
      .string()
      .trim()
      .max(
        255,
        "Location cannot exceed 255 characters",
      )
      .optional(),

    population: z
      .number({
        invalid_type_error:
          "Population must be a number",
      })
      .int("Population must be an integer")
      .nonnegative("Population cannot be negative")
      .optional(),

    priority: prioritySchema.default("MEDIUM"),
  }),
});

const updateAreaValidationSchema = z.object({
  body: z
    .object({
      feederId: z
        .string()
        .uuid("Invalid feeder ID")
        .optional(),

      name: z
        .string()
        .trim()
        .min(
          2,
          "Area name must contain at least 2 characters",
        )
        .max(100)
        .optional(),

      code: z
        .string()
        .trim()
        .min(
          2,
          "Area code must contain at least 2 characters",
        )
        .max(30)
        .transform((value) => value.toUpperCase())
        .optional(),

      location: z
        .string()
        .trim()
        .max(255)
        .nullable()
        .optional(),

      population: z
        .number()
        .int("Population must be an integer")
        .nonnegative("Population cannot be negative")
        .nullable()
        .optional(),

      priority: prioritySchema.optional(),
    })
    .refine(
      (data) => Object.keys(data).length > 0,
      {
        message:
          "At least one field is required for update",
      },
    ),
});

const areaIdValidationSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid area ID"),
  }),
});

export const AreaValidation = {
  createAreaValidationSchema,
  updateAreaValidationSchema,
  areaIdValidationSchema,
};
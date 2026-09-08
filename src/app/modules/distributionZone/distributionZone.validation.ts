import { z } from "zod";

const createDistributionZoneValidationSchema =
  z.object({
    body: z.object({
      name: z
        .string({
          message: "Zone name is required",
        })
        .trim()
        .min(2, "Zone name must be at least 2 characters")
        .max(100, "Zone name cannot exceed 100 characters"),

      code: z
        .string({
          message: "Zone code is required",
        })
        .trim()
        .min(2, "Zone code must be at least 2 characters")
        .max(30, "Zone code cannot exceed 30 characters")
        .transform((value) => value.toUpperCase()),

      description: z
        .string()
        .trim()
        .max(
          500,
          "Description cannot exceed 500 characters",
        )
        .optional(),
    }),
  });

const updateDistributionZoneValidationSchema =
  z.object({
    body: z
      .object({
        name: z
          .string()
          .trim()
          .min(
            2,
            "Zone name must be at least 2 characters",
          )
          .max(
            100,
            "Zone name cannot exceed 100 characters",
          )
          .optional(),

        code: z
          .string()
          .trim()
          .min(
            2,
            "Zone code must be at least 2 characters",
          )
          .max(
            30,
            "Zone code cannot exceed 30 characters",
          )
          .transform((value) => value.toUpperCase())
          .optional(),

        description: z
          .string()
          .trim()
          .max(
            500,
            "Description cannot exceed 500 characters",
          )
          .nullable()
          .optional(),
      })
      .refine(
        (data) => Object.keys(data).length > 0,
        {
          message:
            "At least one field is required to update",
        },
      ),
  });

const distributionZoneIdValidationSchema =
  z.object({
    params: z.object({
      id: z.uuid("Invalid distribution zone ID"),
    }),
  });

export const DistributionZoneValidation = {
  createDistributionZoneValidationSchema,
  updateDistributionZoneValidationSchema,
  distributionZoneIdValidationSchema,
};
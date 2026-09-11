import { z } from "zod";

const updateUserRoleSchema = z.object({
  body: z.object({
    role: z.enum([
      "ADMIN",
      "TECHNICIAN",
      "CUSTOMER",
    ]),
  }),
});

export const AdminValidation = {
  updateUserRoleSchema,
};
import { z } from "zod";

const updateUserRoleSchema = z.object({
	body: z.object({
		role: z.enum(["ADMIN", "TECHNICIAN", "CUSTOMER"]),
	}),
});
const updateUserStatusSchema = z.object({
  body: z.object({
    status: z.enum(['ACTIVE', 'INACTIVE', 'BLOCKED'], {
      required_error: 'Status is required',
    }),
  }),
});
export const AdminValidation = {
	updateUserRoleSchema,
	updateUserStatusSchema,
};

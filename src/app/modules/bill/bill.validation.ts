import { z } from "zod";
import { BillStatus } from "../../../generated/prisma/enums";

const createBillSchema = z.object({
	body: z.object({
		userId: z
			.string({ required_error: "User ID is required" })
			.uuid("Invalid User ID format"),
		billNumber: z.string({ required_error: "Bill number is required" }),
		month: z.string({
			required_error: "Month is required (e.g., September 2026)",
		}),
		amount: z
			.number({ required_error: "Amount is required" })
			.positive("Amount must be greater than zero"),
		dueDate: z
			.string({ required_error: "Due date is required" })
			.transform((val) => new Date(val)),
	}),
});

export const BillValidation = {
	createBillSchema,
};

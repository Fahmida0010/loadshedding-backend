import { z } from "zod";

const initiatePaymentSchema = z.object({
  body: z.object({
    billId: z.string().uuid("Valid bill ID is required"),
  }),
});

const getPaymentSchema = z.object({
  params: z.object({
    id: z.string().uuid("Valid payment/bill ID is required"),
  }),
});

export const PaymentValidation = {
  initiatePaymentSchema,
  getPaymentSchema,
};
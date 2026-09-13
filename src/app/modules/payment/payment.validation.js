"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentValidation = void 0;
const zod_1 = require("zod");
const initiatePaymentSchema = zod_1.z.object({
    body: zod_1.z.object({
        billId: zod_1.z.string().uuid("Valid bill ID is required"),
    }),
});
const getPaymentSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid("Valid payment/bill ID is required"),
    }),
});
exports.PaymentValidation = {
    initiatePaymentSchema,
    getPaymentSchema,
};

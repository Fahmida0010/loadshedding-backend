import type { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsyc";
import { PaymentService } from "./payment.service";

const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

const initiatePayment = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;

    const result = await PaymentService.initiatePayment(
        req.body.billId,
        user.userId,
    );

    res.status(200).json({
        success: true,
        message: "Payment initiated successfully",
        data: result,
    });
});

const webhook = catchAsync(async (req: Request, res: Response) => {
    const callbackType =
        typeof req.query.callback === "string" ? req.query.callback : undefined;

    const result = await PaymentService.handleWebhook(req.body, callbackType);

    // SSLCommerz redirect korar somoy JSON return na kore direct browser redirect korano valo
    if (result.status === "PAID") {
        return res.redirect(`${frontendUrl}/dashboard/customer/payments/success?tran_id=${result.transactionId}`);
    }

    if (result.status === "CANCELLED") {
        return res.redirect(`${frontendUrl}/dashboard/customer/payments/failed?tran_id=${result.transactionId}&reason=cancelled`);
    }

    return res.redirect(`${frontendUrl}/dashboard/customer/payments/failed?tran_id=${result.transactionId}&reason=failed`);
});

const getPaymentById = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;

    const result = await PaymentService.getPaymentById(req.params.id, {
        userId: user.userId,
        role: user.role,
    });

    res.status(200).json({
        success: true,
        message: "Payment information retrieved successfully",
        data: result,
    });
});

export const PaymentController = {
    initiatePayment,
    webhook,
    getPaymentById,
};
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const catchAsyc_1 = require("../../utils/catchAsyc");
const payment_service_1 = require("./payment.service");
const initiatePayment = (0, catchAsyc_1.catchAsync)(async (req, res) => {
    const user = req.user;
    const result = await payment_service_1.PaymentService.initiatePayment(req.body.billId, user.userId);
    res.status(200).json({
        success: true,
        message: "Payment initiated successfully",
        data: result,
    });
});
const webhook = (0, catchAsyc_1.catchAsync)(async (req, res) => {
    const callbackType = typeof req.query.callback === "string" ? req.query.callback : undefined;
    const result = await payment_service_1.PaymentService.handleWebhook(req.body, callbackType);
    if (result.status === "PAID") {
        res.status(200).json({
            success: true,
            message: "Payment completed successfully",
            data: result,
        });
        return;
    }
    if (result.status === "CANCELLED") {
        res.status(200).json({
            success: false,
            message: "Payment was cancelled",
            data: result,
        });
        return;
    }
    res.status(400).json({
        success: false,
        message: "Payment failed",
        data: result,
    });
});
const getPaymentById = (0, catchAsyc_1.catchAsync)(async (req, res) => {
    const user = req.user;
    const result = await payment_service_1.PaymentService.getPaymentById(req.params.id, {
        userId: user.userId,
        role: user.role,
    });
    res.status(200).json({
        success: true,
        message: "Payment information retrieved successfully",
        data: result,
    });
});
exports.PaymentController = {
    initiatePayment,
    webhook,
    getPaymentById,
};

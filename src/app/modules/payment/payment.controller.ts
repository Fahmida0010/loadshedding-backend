import type { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsyc";
import { PaymentService } from "./payment.service";

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

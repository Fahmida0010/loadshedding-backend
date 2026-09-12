import type { Request, Response } from "express";
import { PaymentService } from "./payment.service";
import { catchAsync } from "../../utils/catchAsyc";

const initiatePayment = catchAsync(
  async (req: Request, res: Response) => {
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
  },
);

const webhook = catchAsync(
  async (req: Request, res: Response) => {
    const callbackType =
      typeof req.query.callback === "string"
        ? req.query.callback
        : undefined;

    const result = await PaymentService.handleWebhook(
      req.body,
      callbackType,
    );

    /*
     * IPN is server-to-server, তাই JSON response দেওয়া হবে।
     */
    if (callbackType === "ipn") {
      res.status(200).json({
        success: true,
        message: "Payment notification received",
        data: result,
      });

      return;
    }

    /*
     * Customer browser callback হলে frontend-এ পাঠানো হবে।
     */
    const redirectUrl = new URL(
      "/payment/result",
      process.env.FRONTEND_URL ||
        "http://localhost:3000",
    );

    redirectUrl.searchParams.set(
      "status",
      result.status,
    );

    redirectUrl.searchParams.set(
      "transactionId",
      result.transactionId,
    );

    if ("billId" in result && result.billId) {
      redirectUrl.searchParams.set(
        "billId",
        result.billId,
      );
    }

    if ("bill" in result && result.bill?.id) {
      redirectUrl.searchParams.set(
        "billId",
        result.bill.id,
      );
    }

    res.redirect(303, redirectUrl.toString());
  },
);

const getPaymentById = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;

    const result = await PaymentService.getPaymentById(
      req.params.id,
      {
        userId: user.userId,
        role: user.role,
      },
    );

    res.status(200).json({
      success: true,
      message: "Payment information retrieved successfully",
      data: result,
    });
  },
);

export const PaymentController = {
  initiatePayment,
  webhook,
  getPaymentById,
};
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const node_crypto_1 = __importDefault(require("node:crypto"));
const sslcommerz_lts_1 = __importDefault(require("sslcommerz-lts"));
const prisma_1 = require("../../config/prisma");
const AppError_1 = require("../../utils/AppError");
const storeId = process.env.SSLCOMMERZ_STORE_ID;
const storePassword = process.env.SSLCOMMERZ_STORE_PASSWORD;
const isLive = process.env.SSLCOMMERZ_IS_LIVE === "true";
const backendUrl = process.env.BACKEND_URL || "http://localhost:5000";
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
const getSSLCommerzClient = () => {
    if (!storeId || !storePassword) {
        throw new AppError_1.AppError(500, "SSLCommerz credentials are not configured");
    }
    return new sslcommerz_lts_1.default(storeId, storePassword, isLive);
};
const initiatePayment = async (billId, customerId) => {
    const bill = await prisma_1.prisma.bill.findFirst({
        where: {
            id: billId,
            userId: customerId,
            deletedAt: null,
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                },
            },
        },
    });
    if (!bill) {
        throw new AppError_1.AppError(404, "Bill not found or you are not allowed to pay this bill");
    }
    if (bill.status === "PAID") {
        throw new AppError_1.AppError(400, "This bill has already been paid");
    }
    if (bill.status === "CANCELLED") {
        throw new AppError_1.AppError(400, "Cancelled bill cannot be paid");
    }
    /*
     * A new transaction ID is created for every payment attempt.
     */
    const transactionId = `BILL-${Date.now()}-${node_crypto_1.default
        .randomBytes(4)
        .toString("hex")}`;
    const callbackUrl = `${backendUrl}/api/v1/payments/webhook`;
    const paymentData = {
        total_amount: Number(bill.amount.toFixed(2)),
        currency: "BDT",
        tran_id: transactionId,
        success_url: `${callbackUrl}?callback=success`,
        fail_url: `${callbackUrl}?callback=failed`,
        cancel_url: `${callbackUrl}?callback=cancelled`,
        ipn_url: `${callbackUrl}?callback=ipn`,
        shipping_method: "NO",
        product_name: `Electricity Bill - ${bill.month}`,
        product_category: "Utility Bill",
        product_profile: "general",
        cus_name: bill.user.name,
        cus_email: bill.user.email,
        cus_add1: "Bangladesh",
        cus_add2: "N/A",
        cus_city: "Sylhet",
        cus_state: "Sylhet",
        cus_postcode: "3100",
        cus_country: "Bangladesh",
        cus_phone: bill.user.phone || "01700000000",
        cus_fax: "N/A",
        ship_name: bill.user.name,
        ship_add1: "Bangladesh",
        ship_add2: "N/A",
        ship_city: "Sylhet",
        ship_state: "Sylhet",
        ship_postcode: "3100",
        ship_country: "Bangladesh",
        value_a: bill.id,
        value_b: bill.userId,
        value_c: bill.billNumber,
        value_d: bill.month,
    };
    const sslcz = getSSLCommerzClient();
    const sslResponse = await sslcz.init(paymentData);
    if (sslResponse.status !== "SUCCESS" || !sslResponse.GatewayPageURL) {
        throw new AppError_1.AppError(502, sslResponse.failedreason || "Unable to initialize SSLCommerz payment");
    }
    await prisma_1.prisma.bill.update({
        where: {
            id: bill.id,
        },
        data: {
            transactionId,
            paymentMethod: "SSLCOMMERZ",
        },
    });
    return {
        billId: bill.id,
        billNumber: bill.billNumber,
        amount: bill.amount,
        transactionId,
        paymentUrl: sslResponse.GatewayPageURL,
    };
};
const handleWebhook = async (payload, callbackType) => {
    const transactionId = payload.tran_id;
    if (!transactionId) {
        throw new AppError_1.AppError(400, "Transaction ID was not received from SSLCommerz");
    }
    const bill = await prisma_1.prisma.bill.findFirst({
        where: {
            transactionId,
            deletedAt: null,
        },
    });
    if (!bill) {
        throw new AppError_1.AppError(404, "Bill transaction not found");
    }
    /*
     * A failed or cancelled callback does not mark the bill as paid.
     */
    if (callbackType === "failed" ||
        callbackType === "cancelled" ||
        payload.status === "FAILED" ||
        payload.status === "CANCELLED") {
        return {
            success: false,
            status: callbackType === "cancelled" ? "CANCELLED" : "FAILED",
            billId: bill.id,
            transactionId: bill.transactionId,
        };
    }
    if (!payload.val_id) {
        throw new AppError_1.AppError(400, "Payment validation ID was not received");
    }
    const sslcz = getSSLCommerzClient();
    const validation = await sslcz.validate({
        val_id: payload.val_id,
    });
    const validStatuses = ["VALID", "VALIDATED"];
    if (!validation.status || !validStatuses.includes(validation.status)) {
        throw new AppError_1.AppError(400, "SSLCommerz payment validation failed");
    }
    if (validation.tran_id !== transactionId) {
        throw new AppError_1.AppError(400, "Transaction ID does not match");
    }
    const paidAmount = Number(validation.amount);
    const billAmount = Number(bill.amount);
    if (!Number.isFinite(paidAmount) ||
        Math.abs(paidAmount - billAmount) > 0.01) {
        throw new AppError_1.AppError(400, "Payment amount does not match");
    }
    /*
     * updateMany makes the operation idempotent.
     * Repeated callbacks cannot pay the bill multiple times.
     */
    await prisma_1.prisma.bill.updateMany({
        where: {
            id: bill.id,
            status: {
                not: "PAID",
            },
        },
        data: {
            status: "PAID",
            paidAt: new Date(),
            paymentMethod: "SSLCOMMERZ",
            transactionId,
        },
    });
    const updatedBill = await prisma_1.prisma.bill.findUnique({
        where: {
            id: bill.id,
        },
    });
    return {
        success: true,
        status: "PAID",
        billId: updatedBill?.id,
        transactionId: updatedBill?.transactionId,
        bill: updatedBill,
    };
};
const getPaymentById = async (billId, requester) => {
    const bill = await prisma_1.prisma.bill.findFirst({
        where: {
            id: billId,
            deletedAt: null,
            ...(requester.role === "CUSTOMER"
                ? {
                    userId: requester.userId,
                }
                : {}),
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                },
            },
        },
    });
    if (!bill) {
        throw new AppError_1.AppError(404, "Payment information not found or access denied");
    }
    return {
        id: bill.id,
        billNumber: bill.billNumber,
        month: bill.month,
        amount: bill.amount,
        dueDate: bill.dueDate,
        status: bill.status,
        transactionId: bill.transactionId,
        paymentMethod: bill.paymentMethod,
        paidAt: bill.paidAt,
        customer: bill.user,
    };
};
exports.PaymentService = {
    initiatePayment,
    handleWebhook,
    getPaymentById,
};

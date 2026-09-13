"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentRoutes = void 0;
const express_1 = require("express");
const enums_1 = require("../../../generated/prisma/enums");
const auth_1 = require("../../middlewares/auth");
const validateRequest_1 = require("../../middlewares/validateRequest");
const payment_controller_1 = require("./payment.controller");
const payment_validation_1 = require("./payment.validation");
const router = (0, express_1.Router)();
/**
 * @openapi
 * tags:
 *   - name: Payments
 *     description: Customer electricity bill payments
 */
/**
 * @openapi
 * /payments/initiate:
 *   post:
 *     summary: Initiate SSLCommerz bill payment
 *     tags:
 *       - Payments
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - billId
 *             properties:
 *               billId:
 *                 type: string
 *                 format: uuid
 *                 example: 9c33229e-5992-4dbd-a338-90f514c32d56
 *     responses:
 *       200:
 *         description: Payment initiated successfully
 *       400:
 *         description: Invalid or already paid bill
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Bill not found
 */
router.post("/initiate", (0, auth_1.auth)(enums_1.UserRole.CUSTOMER), (0, validateRequest_1.validateRequest)(payment_validation_1.PaymentValidation.initiatePaymentSchema), payment_controller_1.PaymentController.initiatePayment);
/**
 * @openapi
 * /payments/webhook:
 *   post:
 *     summary: Receive SSLCommerz callback or IPN
 *     tags:
 *       - Payments
 *     description: Public endpoint called by SSLCommerz
 *     requestBody:
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               val_id:
 *                 type: string
 *               tran_id:
 *                 type: string
 *               status:
 *                 type: string
 *               amount:
 *                 type: string
 *     responses:
 *       200:
 *         description: Callback processed
 *       303:
 *         description: Redirected to frontend result page
 */
router.post("/webhook", payment_controller_1.PaymentController.webhook);
/**
 * @openapi
 * /payments/{id}:
 *   get:
 *     summary: Get payment information by bill ID
 *     tags:
 *       - Payments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Payment information retrieved
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Payment information not found
 */
router.get("/:id", (0, auth_1.auth)(enums_1.UserRole.ADMIN, enums_1.UserRole.CUSTOMER), (0, validateRequest_1.validateRequest)(payment_validation_1.PaymentValidation.getPaymentSchema), payment_controller_1.PaymentController.getPaymentById);
exports.PaymentRoutes = router;

import { Router } from "express";

import { UserRole } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { PaymentController } from "./payment.controller";
import { PaymentValidation } from "./payment.validation";

const router = Router();

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
router.post(
  "/initiate",
  auth(UserRole.CUSTOMER),
  validateRequest(
    PaymentValidation.initiatePaymentSchema,
  ),
  PaymentController.initiatePayment,
);

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
router.post(
  "/webhook",
  PaymentController.webhook,
);

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
router.get(
  "/:id",
  auth(
    UserRole.ADMIN,
    UserRole.CUSTOMER,
  ),
  validateRequest(
    PaymentValidation.getPaymentSchema,
  ),
  PaymentController.getPaymentById,
);

export const PaymentRoutes = router;
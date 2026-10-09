import { Router } from "express";
import { UserRole } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { BillController } from "./bill.controller";
import { BillValidation } from "./bill.validation";

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     Bill:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         userId:
 *           type: string
 *           format: uuid
 *         billNumber:
 *           type: string
 *           example: BILL-2026-001
 *         month:
 *           type: string
 *           example: September 2026
 *         amount:
 *           type: number
 *           example: 1250.50
 *         dueDate:
 *           type: string
 *           format: date-time
 *         status:
 *           type: string
 *           enum:
 *             - UNPAID
 *             - PAID
 *             - OVERDUE
 *             - CANCELLED
 *         transactionId:
 *           type: string
 *           nullable: true
 *         paymentMethod:
 *           type: string
 *           nullable: true
 *         paidAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     CreateBill:
 *       type: object
 *       required:
 *         - userId
 *         - billNumber
 *         - month
 *         - amount
 *         - dueDate
 *       properties:
 *         userId:
 *           type: string
 *           format: uuid
 *         billNumber:
 *           type: string
 *           example: BILL-2026-001
 *         month:
 *           type: string
 *           example: September 2026
 *         amount:
 *           type: number
 *           example: 1250.50
 *         dueDate:
 *           type: string
 *           format: date-time
 *           example: 2026-10-15T23:59:59.000Z
 */

/**
 * @openapi
 * /bills:
 *   post:
 *     tags:
 *       - Bills
 *     summary: Create a new bill for a user (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBill'
 *     responses:
 *       201:
 *         description: Bill created successfully
 *       400:
 *         description: Invalid request data
 *       403:
 *         description: Admin access required
 *
 *   get:
 *     tags:
 *       - Bills
 *     summary: Get all bills across the system (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum:
 *             - UNPAID
 *             - PAID
 *             - OVERDUE
 *             - CANCELLED
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: billNumber
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Bills retrieved successfully
 *       403:
 *         description: Admin access required
 */
router.post(
	"/",
	auth(UserRole.ADMIN),
	validateRequest(BillValidation.createBillSchema),
	BillController.createBill,
);

router.get("/", auth(UserRole.ADMIN), BillController.getAllBills);

/**
 * @openapi
 * /bills/my-bills:
 *   get:
 *     tags:
 *       - Bills
 *     summary: Get logged-in customer's bills
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum:
 *             - UNPAID
 *             - PAID
 *             - OVERDUE
 *             - CANCELLED
 *     responses:
 *       200:
 *         description: Customer bills retrieved successfully
 *       403:
 *         description: Customer access required
 */
router.get("/my-bills", auth(UserRole.CUSTOMER), BillController.getMyBills);

/**
 * @openapi
 * /bills/{id}:
 *   get:
 *     tags:
 *       - Bills
 *     summary: Get single bill by ID (Admin or Owner Customer)
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
 *         description: Bill retrieved successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Bill not found
 */
router.get(
	"/:id",
	auth(UserRole.ADMIN, UserRole.CUSTOMER),
	BillController.getBillById,
);

export const BillRoutes = router;

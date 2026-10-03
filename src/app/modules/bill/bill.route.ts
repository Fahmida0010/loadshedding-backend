import { Router } from "express";
import { UserRole } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { BillController } from "./bill.controller";
import { BillValidation } from "./bill.validation";

const router = Router();

/**
 * @route POST /bills
 * @desc Create a new bill for a user (Admin only)
 */
router.post(
  "/",
  auth(UserRole.ADMIN),
  validateRequest(BillValidation.createBillSchema),
  BillController.createBill
);

/**
 * @route GET /bills
 * @desc Get all bills across the system (Admin only)
 */
router.get(
  "/",
  auth(UserRole.ADMIN),
  BillController.getAllBills
);

/**
 * @route GET /bills/my-bills
 * @desc Get logged-in customer's bills
 */
router.get(
  "/my-bills",
  auth(UserRole.CUSTOMER),
  BillController.getMyBills
);

/**
 * @route GET /bills/:id
 * @desc Get single bill by ID (Admin or Owner Customer)
 */
router.get(
  "/:id",
  auth(UserRole.ADMIN, UserRole.CUSTOMER),
  BillController.getBillById
);

export const BillRoutes = router;

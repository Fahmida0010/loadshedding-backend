import { Router } from "express";

import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";

import { FeederController } from "./feeder.controller";
import { FeederValidation } from "./feeder.validation";

const router = Router();

/**
 * @openapi
 * /feeders:
 *   post:
 *     tags:
 *       - Feeders
 *     summary: Create a new feeder
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - substationId
 *               - name
 *               - code
 *             properties:
 *               substationId:
 *                 type: string
 *                 format: uuid
 *               name:
 *                 type: string
 *                 example: Kumargaon Feeder 01
 *               code:
 *                 type: string
 *                 example: SYL-KGS-F01
 *               capacityMw:
 *                 type: number
 *                 example: 20
 *               priority:
 *                 type: string
 *                 enum:
 *                   - LOW
 *                   - MEDIUM
 *                   - HIGH
 *                   - URGENT
 *                 example: HIGH
 *     responses:
 *       201:
 *         description: Feeder created successfully
 *       404:
 *         description: Substation not found
 *       409:
 *         description: Feeder name or code already exists
 */
router.post(
  "/",
  auth("ADMIN"),
  validateRequest(
    FeederValidation.createFeederValidationSchema,
  ),
  FeederController.createFeeder,
);

/**
 * @openapi
 * /feeders:
 *   get:
 *     tags:
 *       - Feeders
 *     summary: Get all feeders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: searchTerm
 *         schema:
 *           type: string
 *       - in: query
 *         name: substationId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum:
 *             - LOW
 *             - MEDIUM
 *             - HIGH
 *             - URGENT
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
 *     responses:
 *       200:
 *         description: Feeders retrieved successfully
 */
router.get(
  "/",
  auth("ADMIN", "TECHNICIAN", "CUSTOMER"),
  FeederController.getAllFeeders,
);

/**
 * @openapi
 * /feeders/{id}:
 *   get:
 *     tags:
 *       - Feeders
 *     summary: Get a feeder by ID
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
 *         description: Feeder retrieved successfully
 *       404:
 *         description: Feeder not found
 */
router.get(
  "/:id",
  auth("ADMIN", "TECHNICIAN", "CUSTOMER"),
  validateRequest(
    FeederValidation.feederIdValidationSchema,
  ),
  FeederController.getFeederById,
);

/**
 * @openapi
 * /feeders/{id}:
 *   patch:
 *     tags:
 *       - Feeders
 *     summary: Update a feeder
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               substationId:
 *                 type: string
 *                 format: uuid
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               capacityMw:
 *                 type: number
 *               priority:
 *                 type: string
 *                 enum:
 *                   - LOW
 *                   - MEDIUM
 *                   - HIGH
 *                   - URGENT
 *     responses:
 *       200:
 *         description: Feeder updated successfully
 *       404:
 *         description: Feeder or substation not found
 *       409:
 *         description: Feeder name or code already exists
 */
router.patch(
  "/:id",
  auth("ADMIN"),
  validateRequest(
    FeederValidation.feederIdValidationSchema,
  ),
  validateRequest(
    FeederValidation.updateFeederValidationSchema,
  ),
  FeederController.updateFeeder,
);

/**
 * @openapi
 * /feeders/{id}:
 *   delete:
 *     tags:
 *       - Feeders
 *     summary: Soft delete a feeder
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
 *         description: Feeder deleted successfully
 *       404:
 *         description: Feeder not found
 *       409:
 *         description: Feeder contains active areas
 */
router.delete(
  "/:id",
  auth("ADMIN"),
  validateRequest(
    FeederValidation.feederIdValidationSchema,
  ),
  FeederController.deleteFeeder,
);

export const FeederRoutes = router;
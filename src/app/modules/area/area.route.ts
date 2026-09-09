import { Router } from "express";

import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";

import { AreaController } from "./area.controller";
import { AreaValidation } from "./area.validation";

const router = Router();

/**
 * @openapi
 * /areas:
 *   post:
 *     tags:
 *       - Areas
 *     summary: Create a new area
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - feederId
 *               - name
 *               - code
 *             properties:
 *               feederId:
 *                 type: string
 *                 format: uuid
 *               name:
 *                 type: string
 *                 example: Amberkhana
 *               code:
 *                 type: string
 *                 example: SYL-AMB-001
 *               location:
 *                 type: string
 *                 example: Amberkhana, Sylhet
 *               population:
 *                 type: integer
 *                 example: 35000
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH, URGENT]
 *                 example: HIGH
 *     responses:
 *       201:
 *         description: Area created successfully
 *       404:
 *         description: Feeder not found
 *       409:
 *         description: Area name or code already exists
 */
router.post(
  "/",
  auth("ADMIN"),
  validateRequest(
    AreaValidation.createAreaValidationSchema,
  ),
  AreaController.createArea,
);

/**
 * @openapi
 * /areas:
 *   get:
 *     tags:
 *       - Areas
 *     summary: Get all areas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: searchTerm
 *         schema:
 *           type: string
 *       - in: query
 *         name: feederId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, URGENT]
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
 *         description: Areas retrieved successfully
 */
router.get(
  "/",
  auth("ADMIN", "TECHNICIAN", "CUSTOMER"),
  AreaController.getAllAreas,
);

/**
 * @openapi
 * /areas/{id}:
 *   get:
 *     tags:
 *       - Areas
 *     summary: Get an area by ID
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
 *         description: Area retrieved successfully
 *       404:
 *         description: Area not found
 */
router.get(
  "/:id",
  auth("ADMIN", "TECHNICIAN", "CUSTOMER"),
  validateRequest(
    AreaValidation.areaIdValidationSchema,
  ),
  AreaController.getAreaById,
);

/**
 * @openapi
 * /areas/{id}:
 *   patch:
 *     tags:
 *       - Areas
 *     summary: Update an area
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
 *               feederId:
 *                 type: string
 *                 format: uuid
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               location:
 *                 type: string
 *                 nullable: true
 *               population:
 *                 type: integer
 *                 nullable: true
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH, URGENT]
 *     responses:
 *       200:
 *         description: Area updated successfully
 *       404:
 *         description: Area or feeder not found
 *       409:
 *         description: Area name or code already exists
 */
router.patch(
  "/:id",
  auth("ADMIN"),
  validateRequest(
    AreaValidation.areaIdValidationSchema,
  ),
  validateRequest(
    AreaValidation.updateAreaValidationSchema,
  ),
  AreaController.updateArea,
);

/**
 * @openapi
 * /areas/{id}:
 *   delete:
 *     tags:
 *       - Areas
 *     summary: Soft delete an area
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
 *         description: Area deleted successfully
 *       404:
 *         description: Area not found
 *       409:
 *         description: Area contains related records
 */
router.delete(
  "/:id",
  auth("ADMIN"),
  validateRequest(
    AreaValidation.areaIdValidationSchema,
  ),
  AreaController.deleteArea,
);

export const AreaRoutes = router;
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AreaRoutes = void 0;
const express_1 = require("express");
const auth_1 = require("../../middlewares/auth");
const validateRequest_1 = require("../../middlewares/validateRequest");
const area_controller_1 = require("./area.controller");
const area_validation_1 = require("./area.validation");
const router = (0, express_1.Router)();
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
router.post("/", (0, auth_1.auth)("ADMIN"), (0, validateRequest_1.validateRequest)(area_validation_1.AreaValidation.createAreaValidationSchema), area_controller_1.AreaController.createArea);
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
router.get("/", (0, auth_1.auth)("ADMIN", "TECHNICIAN", "CUSTOMER"), area_controller_1.AreaController.getAllAreas);
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
router.get("/:id", (0, auth_1.auth)("ADMIN", "TECHNICIAN", "CUSTOMER"), (0, validateRequest_1.validateRequest)(area_validation_1.AreaValidation.areaIdValidationSchema), area_controller_1.AreaController.getAreaById);
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
router.patch("/:id", (0, auth_1.auth)("ADMIN"), (0, validateRequest_1.validateRequest)(area_validation_1.AreaValidation.areaIdValidationSchema), (0, validateRequest_1.validateRequest)(area_validation_1.AreaValidation.updateAreaValidationSchema), area_controller_1.AreaController.updateArea);
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
router.delete("/:id", (0, auth_1.auth)("ADMIN"), (0, validateRequest_1.validateRequest)(area_validation_1.AreaValidation.areaIdValidationSchema), area_controller_1.AreaController.deleteArea);
exports.AreaRoutes = router;

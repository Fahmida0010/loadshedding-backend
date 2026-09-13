"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubstationRoutes = void 0;
const express_1 = require("express");
const auth_1 = require("../../middlewares/auth");
const validateRequest_1 = require("../../middlewares/validateRequest");
const substation_controller_1 = require("./substation.controller");
const substation_validation_1 = require("./substation.validation");
const router = (0, express_1.Router)();
/**
 * @openapi
 * /substations:
 *   post:
 *     tags:
 *       - Substations
 *     summary: Create a new substation
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - zoneId
 *               - name
 *               - code
 *             properties:
 *               zoneId:
 *                 type: string
 *                 format: uuid
 *               name:
 *                 type: string
 *                 example: Kumargaon Grid Substation
 *               code:
 *                 type: string
 *                 example: SYL-KGS-001
 *               location:
 *                 type: string
 *                 example: Kumargaon, Sylhet
 *               capacityMw:
 *                 type: number
 *                 example: 80
 *               voltageLevel:
 *                 type: string
 *                 example: 132/33 KV
 *     responses:
 *       201:
 *         description: Substation created successfully
 *       404:
 *         description: Distribution zone not found
 *       409:
 *         description: Substation name or code already exists
 */
router.post("/", (0, auth_1.auth)("ADMIN"), (0, validateRequest_1.validateRequest)(substation_validation_1.SubstationValidation.createSubstationValidationSchema), substation_controller_1.SubstationController.createSubstation);
/**
 * @openapi
 * /substations:
 *   get:
 *     tags:
 *       - Substations
 *     summary: Get all substations
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: searchTerm
 *         schema:
 *           type: string
 *       - in: query
 *         name: zoneId
 *         schema:
 *           type: string
 *           format: uuid
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
 *         description: Substations retrieved successfully
 */
router.get("/", (0, auth_1.auth)("ADMIN", "TECHNICIAN", "CUSTOMER"), substation_controller_1.SubstationController.getAllSubstations);
/**
 * @openapi
 * /substations/{id}:
 *   get:
 *     tags:
 *       - Substations
 *     summary: Get a substation by ID
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
 *         description: Substation retrieved successfully
 *       404:
 *         description: Substation not found
 */
router.get("/:id", (0, auth_1.auth)("ADMIN", "TECHNICIAN", "CUSTOMER"), (0, validateRequest_1.validateRequest)(substation_validation_1.SubstationValidation.substationIdValidationSchema), substation_controller_1.SubstationController.getSubstationById);
/**
 * @openapi
 * /substations/{id}:
 *   patch:
 *     tags:
 *       - Substations
 *     summary: Update a substation
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
 *               zoneId:
 *                 type: string
 *                 format: uuid
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               location:
 *                 type: string
 *               capacityMw:
 *                 type: number
 *               voltageLevel:
 *                 type: string
 *     responses:
 *       200:
 *         description: Substation updated successfully
 *       404:
 *         description: Substation or distribution zone not found
 *       409:
 *         description: Substation name or code already exists
 */
router.patch("/:id", (0, auth_1.auth)("ADMIN"), (0, validateRequest_1.validateRequest)(substation_validation_1.SubstationValidation.substationIdValidationSchema), (0, validateRequest_1.validateRequest)(substation_validation_1.SubstationValidation.updateSubstationValidationSchema), substation_controller_1.SubstationController.updateSubstation);
/**
 * @openapi
 * /substations/{id}:
 *   delete:
 *     tags:
 *       - Substations
 *     summary: Soft delete a substation
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
 *         description: Substation deleted successfully
 *       404:
 *         description: Substation not found
 *       409:
 *         description: Substation contains active feeders
 */
router.delete("/:id", (0, auth_1.auth)("ADMIN"), (0, validateRequest_1.validateRequest)(substation_validation_1.SubstationValidation.substationIdValidationSchema), substation_controller_1.SubstationController.deleteSubstation);
exports.SubstationRoutes = router;

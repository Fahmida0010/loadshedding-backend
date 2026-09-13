"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeederRoutes = void 0;
const express_1 = require("express");
const auth_1 = require("../../middlewares/auth");
const validateRequest_1 = require("../../middlewares/validateRequest");
const feeder_controller_1 = require("./feeder.controller");
const feeder_validation_1 = require("./feeder.validation");
const router = (0, express_1.Router)();
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
router.post("/", (0, auth_1.auth)("ADMIN"), (0, validateRequest_1.validateRequest)(feeder_validation_1.FeederValidation.createFeederValidationSchema), feeder_controller_1.FeederController.createFeeder);
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
router.get("/", (0, auth_1.auth)("ADMIN", "TECHNICIAN", "CUSTOMER"), feeder_controller_1.FeederController.getAllFeeders);
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
router.get("/:id", (0, auth_1.auth)("ADMIN", "TECHNICIAN", "CUSTOMER"), (0, validateRequest_1.validateRequest)(feeder_validation_1.FeederValidation.feederIdValidationSchema), feeder_controller_1.FeederController.getFeederById);
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
router.patch("/:id", (0, auth_1.auth)("ADMIN"), (0, validateRequest_1.validateRequest)(feeder_validation_1.FeederValidation.feederIdValidationSchema), (0, validateRequest_1.validateRequest)(feeder_validation_1.FeederValidation.updateFeederValidationSchema), feeder_controller_1.FeederController.updateFeeder);
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
router.delete("/:id", (0, auth_1.auth)("ADMIN"), (0, validateRequest_1.validateRequest)(feeder_validation_1.FeederValidation.feederIdValidationSchema), feeder_controller_1.FeederController.deleteFeeder);
exports.FeederRoutes = router;

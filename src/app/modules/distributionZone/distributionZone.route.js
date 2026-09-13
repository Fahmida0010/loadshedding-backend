"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DistributionZoneRoutes = void 0;
const express_1 = require("express");
const auth_1 = require("../../middlewares/auth");
const validateRequest_1 = require("../../middlewares/validateRequest");
const distributionZone_controller_1 = require("./distributionZone.controller");
const distributionZone_validation_1 = require("./distributionZone.validation");
const router = (0, express_1.Router)();
/**
 * @openapi
 * /distribution-zones:
 *   post:
 *     tags: [Distribution Zones]
 *     summary: Create a distribution zone
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Distribution zone created successfully
 */
router.post("/", (0, auth_1.auth)("ADMIN"), (0, validateRequest_1.validateRequest)(distributionZone_validation_1.DistributionZoneValidation.createDistributionZoneValidationSchema), distributionZone_controller_1.DistributionZoneController.createDistributionZone);
/**
 * @openapi
 * /distribution-zones:
 *   get:
 *     tags: [Distribution Zones]
 *     summary: Get all distribution zones
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: searchTerm
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Distribution zones retrieved successfully
 */
router.get("/", (0, auth_1.auth)("ADMIN", "TECHNICIAN", "CUSTOMER"), distributionZone_controller_1.DistributionZoneController.getAllDistributionZones);
/**
 * @openapi
 * /distribution-zones/{id}:
 *   get:
 *     tags: [Distribution Zones]
 *     summary: Get a distribution zone by ID
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
 *         description: Distribution zone retrieved successfully
 *       404:
 *         description: Distribution zone not found
 */
router.get("/:id", (0, auth_1.auth)("ADMIN", "TECHNICIAN", "CUSTOMER"), (0, validateRequest_1.validateRequest)(distributionZone_validation_1.DistributionZoneValidation.distributionZoneIdValidationSchema), distributionZone_controller_1.DistributionZoneController.getDistributionZoneById);
/**
 * @openapi
 * /distribution-zones/{id}:
 *   patch:
 *     tags: [Distribution Zones]
 *     summary: Update a distribution zone
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
 *         description: Distribution zone updated successfully
 *       404:
 *         description: Distribution zone not found
 */
router.patch("/:id", (0, auth_1.auth)("ADMIN"), (0, validateRequest_1.validateRequest)(distributionZone_validation_1.DistributionZoneValidation.distributionZoneIdValidationSchema), (0, validateRequest_1.validateRequest)(distributionZone_validation_1.DistributionZoneValidation.updateDistributionZoneValidationSchema), distributionZone_controller_1.DistributionZoneController.updateDistributionZone);
/**
 * @openapi
 * /distribution-zones/{id}:
 *   delete:
 *     tags: [Distribution Zones]
 *     summary: Delete a distribution zone
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
 *         description: Distribution zone deleted successfully
 *       409:
 *         description: Zone contains substations
 */
router.delete("/:id", (0, auth_1.auth)("ADMIN"), (0, validateRequest_1.validateRequest)(distributionZone_validation_1.DistributionZoneValidation.distributionZoneIdValidationSchema), distributionZone_controller_1.DistributionZoneController.deleteDistributionZone);
exports.DistributionZoneRoutes = router;

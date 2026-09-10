import { Router } from "express";

import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";

import { DistributionZoneController } from "./distributionZone.controller";
import { DistributionZoneValidation } from "./distributionZone.validation";

const router = Router();

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
router.post(
	"/",
	auth("ADMIN"),
	validateRequest(
		DistributionZoneValidation.createDistributionZoneValidationSchema,
	),
	DistributionZoneController.createDistributionZone,
);

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
router.get(
	"/",
	auth("ADMIN", "TECHNICIAN", "CUSTOMER"),
	DistributionZoneController.getAllDistributionZones,
);

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
router.get(
	"/:id",
	auth("ADMIN", "TECHNICIAN", "CUSTOMER"),
	validateRequest(
		DistributionZoneValidation.distributionZoneIdValidationSchema,
	),
	DistributionZoneController.getDistributionZoneById,
);

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
router.patch(
	"/:id",
	auth("ADMIN"),
	validateRequest(
		DistributionZoneValidation.distributionZoneIdValidationSchema,
	),
	validateRequest(
		DistributionZoneValidation.updateDistributionZoneValidationSchema,
	),
	DistributionZoneController.updateDistributionZone,
);

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
router.delete(
	"/:id",
	auth("ADMIN"),
	validateRequest(
		DistributionZoneValidation.distributionZoneIdValidationSchema,
	),
	DistributionZoneController.deleteDistributionZone,
);

export const DistributionZoneRoutes = router;

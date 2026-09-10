import { Router } from "express";

import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { OutageController } from "./outage.controller";
import { OutageValidation } from "./outage.validation";

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     CreateUnexpectedOutage:
 *       type: object
 *       required:
 *         - areaId
 *         - title
 *       properties:
 *         areaId:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *           example: Sudden electricity outage
 *         description:
 *           type: string
 *           example: Electricity has been unavailable for the last 30 minutes.
 *         reason:
 *           type: string
 *           example: Possible transformer failure
 *         priority:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, URGENT]
 *           default: MEDIUM
 *         estimatedRestoreAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *
 *     UpdateOutageStatus:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum:
 *             - REPORTED
 *             - CONFIRMED
 *             - ASSIGNED
 *             - IN_PROGRESS
 *             - RESOLVED
 *             - CLOSED
 *             - CANCELLED
 *         reason:
 *           type: string
 *         estimatedRestoreAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 */

/**
 * @openapi
 * /outages:
 *   post:
 *     summary: Report an unexpected outage
 *     tags: [Unexpected Outages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUnexpectedOutage'
 *     responses:
 *       201:
 *         description: Outage reported successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Area not found
 */
router.post(
	"/",
	auth("CUSTOMER", "ADMIN"),
	validateRequest(OutageValidation.createOutageSchema),
	OutageController.createOutage,
);

/**
 * @openapi
 * /outages/my-reports:
 *   get:
 *     summary: Get outages reported by the logged-in user
 *     tags: [Unexpected Outages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: areaId
 *         schema:
 *           type: string
 *           format: uuid
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
 *         description: User outage reports retrieved successfully
 */
router.get(
	"/my-reports",
	auth("CUSTOMER", "ADMIN"),
	OutageController.getMyOutages,
);

/**
 * @openapi
 * /outages:
 *   get:
 *     summary: Get all unexpected outages
 *     tags: [Unexpected Outages]
 *     parameters:
 *       - in: query
 *         name: searchTerm
 *         schema:
 *           type: string
 *       - in: query
 *         name: areaId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: reportedById
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, URGENT]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum:
 *             - REPORTED
 *             - CONFIRMED
 *             - ASSIGNED
 *             - IN_PROGRESS
 *             - RESOLVED
 *             - CLOSED
 *             - CANCELLED
 *       - in: query
 *         name: reportedFrom
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: reportedTo
 *         schema:
 *           type: string
 *           format: date-time
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
 *         name: sortBy
 *         schema:
 *           type: string
 *           example: reportedAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: Outages retrieved successfully
 */
router.get("/", OutageController.getAllOutages);

/**
 * @openapi
 * /outages/{id}:
 *   get:
 *     summary: Get an unexpected outage by ID
 *     tags: [Unexpected Outages]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Outage retrieved successfully
 *       404:
 *         description: Outage not found
 */
router.get(
	"/:id",
	validateRequest(OutageValidation.outageIdParamSchema),
	OutageController.getOutageById,
);

/**
 * @openapi
 * /outages/{id}:
 *   patch:
 *     summary: Update unexpected outage information
 *     tags: [Unexpected Outages]
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
 *               areaId:
 *                 type: string
 *                 format: uuid
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *                 nullable: true
 *               reason:
 *                 type: string
 *                 nullable: true
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH, URGENT]
 *               estimatedRestoreAt:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Outage updated successfully
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Outage not found
 */
router.patch(
	"/:id",
	auth("ADMIN", "CUSTOMER"),
	validateRequest(OutageValidation.outageIdParamSchema),
	validateRequest(OutageValidation.updateOutageSchema),
	OutageController.updateOutage,
);

/**
 * @openapi
 * /outages/{id}/status:
 *   patch:
 *     summary: Update outage status
 *     tags: [Unexpected Outages]
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
 *             $ref: '#/components/schemas/UpdateOutageStatus'
 *     responses:
 *       200:
 *         description: Outage status updated successfully
 *       400:
 *         description: Invalid status transition
 *       403:
 *         description: Admin or technician access required
 *       404:
 *         description: Outage not found
 */
router.patch(
	"/:id/status",
	auth("ADMIN"),
	validateRequest(OutageValidation.outageIdParamSchema),
	validateRequest(OutageValidation.updateOutageStatusSchema),
	OutageController.updateOutageStatus,
);

/**
 * @openapi
 * /outages/{id}:
 *   delete:
 *     summary: Soft delete an unexpected outage
 *     tags: [Unexpected Outages]
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
 *         description: Outage deleted successfully
 *       400:
 *         description: Assigned or active outage cannot be deleted
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Outage not found
 */
router.delete(
	"/:id",
	auth("ADMIN"),
	validateRequest(OutageValidation.outageIdParamSchema),
	OutageController.deleteOutage,
);

export const OutageRoutes = router;

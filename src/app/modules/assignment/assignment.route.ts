import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { TechnicianAssignmentController } from "./assignment.controller";
import { TechnicianAssignmentValidation } from "./assignment.validation";

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     TechnicianAssignment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         outageId:
 *           type: string
 *           format: uuid
 *         technicianId:
 *           type: string
 *           format: uuid
 *         assignedById:
 *           type: string
 *           format: uuid
 *         status:
 *           type: string
 *           enum:
 *             - ASSIGNED
 *             - ACCEPTED
 *             - REJECTED
 *             - IN_PROGRESS
 *             - COMPLETED
 *         notes:
 *           type: string
 *           nullable: true
 *         assignedAt:
 *           type: string
 *           format: date-time
 *         acceptedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         startedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         completedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *
 *     CreateTechnicianAssignment:
 *       type: object
 *       required:
 *         - outageId
 *         - technicianId
 *       properties:
 *         outageId:
 *           type: string
 *           format: uuid
 *         technicianId:
 *           type: string
 *           format: uuid
 *         notes:
 *           type: string
 *           example: Check transformer and feeder connection
 *
 *     UpdateAssignmentStatus:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum:
 *             - ACCEPTED
 *             - REJECTED
 *             - IN_PROGRESS
 *             - COMPLETED
 *         notes:
 *           type: string
 *           example: Repair work has started
 */

/**
 * @openapi
 * /assignments:
 *   post:
 *     tags:
 *       - Technician Assignments
 *     summary: Assign a technician to an unexpected outage
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTechnicianAssignment'
 *     responses:
 *       201:
 *         description: Technician assigned successfully
 *       400:
 *         description: Invalid request
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Outage or technician not found
 *       409:
 *         description: Technician already assigned
 *
 *   get:
 *     tags:
 *       - Technician Assignments
 *     summary: Get all technician assignments
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
 *             - ASSIGNED
 *             - ACCEPTED
 *             - REJECTED
 *             - IN_PROGRESS
 *             - COMPLETED
 *       - in: query
 *         name: technicianId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: outageId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum:
 *             - assignedAt
 *             - createdAt
 *             - updatedAt
 *             - status
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum:
 *             - asc
 *             - desc
 *     responses:
 *       200:
 *         description: Assignments retrieved successfully
 */
router
	.route("/")
	.post(
		auth("ADMIN"),
		validateRequest(
			TechnicianAssignmentValidation.createTechnicianAssignmentSchema,
		),
		TechnicianAssignmentController.createAssignment,
	)
	.get(auth("ADMIN"), TechnicianAssignmentController.getAllAssignments);

/**
 * @openapi
 * /assignments/my-assignments:
 *   get:
 *     tags:
 *       - Technician Assignments
 *     summary: Get logged-in technician assignments
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
 *             - ASSIGNED
 *             - ACCEPTED
 *             - REJECTED
 *             - IN_PROGRESS
 *             - COMPLETED
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum:
 *             - assignedAt
 *             - createdAt
 *             - updatedAt
 *             - status
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum:
 *             - asc
 *             - desc
 *     responses:
 *       200:
 *         description: Technician assignments retrieved successfully
 */
router.get(
	"/my-assignments",
	auth("TECHNICIAN"),
	TechnicianAssignmentController.getMyAssignments,
);

/**
 * @openapi
 * /assignments/{id}/status:
 *   patch:
 *     tags:
 *       - Technician Assignments
 *     summary: Update own assignment status
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
 *             $ref: '#/components/schemas/UpdateAssignmentStatus'
 *     responses:
 *       200:
 *         description: Assignment status updated successfully
 *       400:
 *         description: Invalid status transition
 *       404:
 *         description: Assignment not found
 */
router.patch(
	"/:id/status",
	auth("TECHNICIAN"),
	validateRequest(TechnicianAssignmentValidation.updateAssignmentStatusSchema),
	TechnicianAssignmentController.updateAssignmentStatus,
);
/**
 * @openapi
 * /assignments/{id}/repair-updates:
 *   post:
 *     tags:
 *       - Technician Assignments
 *     summary: Add a repair progress update
 *     description: The assigned technician adds a repair note and starts repair work.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Technician assignment ID
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - note
 *             properties:
 *               note:
 *                 type: string
 *                 example: Damaged feeder cable identified and replacement work started.
 *     responses:
 *       201:
 *         description: Repair update created successfully
 *       400:
 *         description: Invalid assignment state
 *       403:
 *         description: Technician access required
 *       404:
 *         description: Assignment not found
 */
router.post(
	"/:id/repair-updates",
	auth("TECHNICIAN"),
	validateRequest(TechnicianAssignmentValidation.createRepairUpdateSchema),
	TechnicianAssignmentController.createRepairUpdate,
);

/**
 * @openapi
 * /assignments/{id}/resolve:
 *   post:
 *     tags:
 *       - Technician Assignments
 *     summary: Resolve an outage and record power restoration
 *     description: Creates an outage resolution and completes the technician assignment.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Technician assignment ID
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - description
 *             properties:
 *               description:
 *                 type: string
 *                 example: Power supply has been restored successfully.
 *               actionTaken:
 *                 type: string
 *                 example: Replaced damaged cable and tested the feeder connection.
 *               durationMinutes:
 *                 type: integer
 *                 example: 75
 *     responses:
 *       201:
 *         description: Outage resolved successfully
 *       400:
 *         description: Assignment is not in progress
 *       403:
 *         description: Technician access required
 *       404:
 *         description: Assignment not found
 *       409:
 *         description: Outage already has a resolution
 */
router.post(
	"/:id/resolve",
	auth("TECHNICIAN"),
	validateRequest(TechnicianAssignmentValidation.resolveOutageSchema),
	TechnicianAssignmentController.resolveOutage,
);
/**
 * @openapi
 * /assignments/{id}:
 *   get:
 *     tags:
 *       - Technician Assignments
 *     summary: Get assignment by ID
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
 *         description: Assignment retrieved successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Assignment not found
 *
 *   patch:
 *     tags:
 *       - Technician Assignments
 *     summary: Reassign technician or update notes
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
 *               technicianId:
 *                 type: string
 *                 format: uuid
 *               notes:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Assignment updated successfully
 *
 *   delete:
 *     tags:
 *       - Technician Assignments
 *     summary: Soft delete an assignment
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
 *         description: Assignment deleted successfully
 */
router
	.route("/:id")
	.get(
		auth("ADMIN", "TECHNICIAN"),
		TechnicianAssignmentController.getAssignmentById,
	)
	.patch(
		auth("ADMIN"),
		validateRequest(
			TechnicianAssignmentValidation.updateTechnicianAssignmentSchema,
		),
		TechnicianAssignmentController.updateAssignment,
	)
	.delete(auth("ADMIN"), TechnicianAssignmentController.deleteAssignment);

export const TechnicianAssignmentRoutes = router;

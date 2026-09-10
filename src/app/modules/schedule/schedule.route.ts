import { Router } from "express";

import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { ScheduleController } from "./schedule.controller";
import { ScheduleValidation } from "./schedule.validation";

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     CreateSchedule:
 *       type: object
 *       required:
 *         - areaId
 *         - title
 *         - scheduledStart
 *         - scheduledEnd
 *       properties:
 *         areaId:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *           example: Scheduled load shedding in Uposhohor
 *         description:
 *           type: string
 *           example: Electricity supply will remain unavailable for maintenance.
 *         type:
 *           type: string
 *           enum: [LOAD_SHEDDING, PLANNED_OUTAGE]
 *           default: LOAD_SHEDDING
 *         priority:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, URGENT]
 *           default: MEDIUM
 *         scheduledStart:
 *           type: string
 *           format: date-time
 *           example: 2026-09-15T10:00:00.000Z
 *         scheduledEnd:
 *           type: string
 *           format: date-time
 *           example: 2026-09-15T12:00:00.000Z
 *         isRecurring:
 *           type: boolean
 *           default: false
 *         recurrenceRule:
 *           type: string
 *           nullable: true
 *           example: FREQ=WEEKLY;BYDAY=MON
 *         status:
 *           type: string
 *           enum: [SCHEDULED, ACTIVE, COMPLETED, CANCELLED]
 *           default: SCHEDULED
 */

/**
 * @openapi
 * /schedules:
 *   post:
 *     summary: Create a load-shedding schedule
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSchedule'
 *     responses:
 *       201:
 *         description: Schedule created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Area not found
 *       409:
 *         description: Schedule time conflict
 */
router.post(
	"/",
	auth("ADMIN"),
	validateRequest(ScheduleValidation.createScheduleSchema),
	ScheduleController.createSchedule,
);

/**
 * @openapi
 * /schedules:
 *   get:
 *     summary: Get all load-shedding schedules
 *     tags: [Schedules]
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
 *         name: type
 *         schema:
 *           type: string
 *           enum: [LOAD_SHEDDING, PLANNED_OUTAGE]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, URGENT]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [SCHEDULED, ACTIVE, COMPLETED, CANCELLED]
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
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
 *           example: scheduledStart
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: Schedules retrieved successfully
 */
router.get("/", ScheduleController.getAllSchedules);

/**
 * @openapi
 * /schedules/{id}:
 *   get:
 *     summary: Get a schedule by ID
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Schedule retrieved successfully
 *       404:
 *         description: Schedule not found
 */
router.get(
	"/:id",
	validateRequest(ScheduleValidation.scheduleIdParamSchema),
	ScheduleController.getScheduleById,
);

/**
 * @openapi
 * /schedules/{id}:
 *   patch:
 *     summary: Update a load-shedding schedule
 *     tags: [Schedules]
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
 *             $ref: '#/components/schemas/CreateSchedule'
 *     responses:
 *       200:
 *         description: Schedule updated successfully
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Schedule not found
 *       409:
 *         description: Schedule time conflict
 */
router.patch(
	"/:id",
	auth("ADMIN"),
	validateRequest(ScheduleValidation.scheduleIdParamSchema),
	validateRequest(ScheduleValidation.updateScheduleSchema),
	ScheduleController.updateSchedule,
);

/**
 * @openapi
 * /schedules/{id}:
 *   delete:
 *     summary: Soft delete a schedule
 *     tags: [Schedules]
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
 *         description: Schedule deleted successfully
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Schedule not found
 */
router.delete(
	"/:id",
	auth("ADMIN"),
	validateRequest(ScheduleValidation.scheduleIdParamSchema),
	ScheduleController.deleteSchedule,
);

export const ScheduleRoutes = router;

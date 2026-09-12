import { Router } from "express";

import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { AdminController } from "./admin.controller";
import { AdminValidation } from "./admin.validation";

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     UpdateUserRole:
 *       type: object
 *       required:
 *         - role
 *       properties:
 *         role:
 *           type: string
 *           enum:
 *             - ADMIN
 *             - TECHNICIAN
 *             - CUSTOMER
 *           example: TECHNICIAN
 */

/**
 * @openapi
 * /admin/users:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get all users
 *     description: Get paginated, filtered and sorted users
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
 *           maximum: 100
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, email, phone or employee ID
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum:
 *             - ADMIN
 *             - TECHNICIAN
 *             - CUSTOMER
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum:
 *             - ACTIVE
 *             - INACTIVE
 *             - BLOCKED
 *       - in: query
 *         name: areaId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum:
 *             - name
 *             - email
 *             - role
 *             - status
 *             - createdAt
 *             - updatedAt
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum:
 *             - asc
 *             - desc
 *           default: desc
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get("/users", auth("ADMIN"), AdminController.getAllUsers);

/**
 * @openapi
 * /admin/users/{id}/role:
 *   patch:
 *     tags:
 *       - Admin
 *     summary: Update a user's role
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
 *             $ref: '#/components/schemas/UpdateUserRole'
 *     responses:
 *       200:
 *         description: User role updated successfully
 *       400:
 *         description: Invalid role or own role update attempted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: User not found
 */
router.patch(
	"/users/:id/role",
	auth("ADMIN"),
	validateRequest(AdminValidation.updateUserRoleSchema),
	AdminController.updateUserRole,
);

/**
 * @openapi
 * /admin/dashboard-stats:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get admin dashboard statistics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get(
	"/dashboard-stats",
	auth("ADMIN"),
	AdminController.getDashboardStats,
);

/**
 * @openapi
 * /admin/audit-logs:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get audit logs
 *     description: Get paginated, filtered and sorted audit logs
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
 *           maximum: 100
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           example: UPDATE_USER_ROLE
 *       - in: query
 *         name: entityType
 *         schema:
 *           type: string
 *           example: User
 *       - in: query
 *         name: entityId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum:
 *             - action
 *             - entityType
 *             - createdAt
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum:
 *             - asc
 *             - desc
 *           default: desc
 *     responses:
 *       200:
 *         description: Audit logs retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get("/audit-logs", auth("ADMIN"), AdminController.getAuditLogs);

export const AdminRoutes = router;

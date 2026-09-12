import type { RequestHandler } from "express";
import { catchAsync } from "../../utils/catchAsyc";
import { sendResponse } from "../../utils/sendResponse";
import type { IAuditLogQuery, IUserQuery } from "./admin.interface";
import { AdminService } from "./admin.service";

const getAllUsers: RequestHandler = catchAsync(async (req, res) => {
	const result = await AdminService.getAllUsers(req.query as IUserQuery);

	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "Users retrieved successfully",
		meta: result.meta,
		data: result.data,
	});
});

const updateUserRole: RequestHandler = catchAsync(async (req, res) => {
	const ipAddress = req.ip || req.socket.remoteAddress || undefined;

	const userAgent = req.get("user-agent");

	const result = await AdminService.updateUserRole(
		req.params.id,
		req.body,
		req.user.userId,
		ipAddress,
		userAgent,
	);

	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "User role updated successfully",
		data: result,
	});
});

const getDashboardStats: RequestHandler = catchAsync(async (_req, res) => {
	const result = await AdminService.getDashboardStats();

	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "Dashboard statistics retrieved successfully",
		data: result,
	});
});

const getAuditLogs: RequestHandler = catchAsync(async (req, res) => {
	const result = await AdminService.getAuditLogs(req.query as IAuditLogQuery);

	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "Audit logs retrieved successfully",
		meta: result.meta,
		data: result.data,
	});
});

export const AdminController = {
	getAllUsers,
	updateUserRole,
	getDashboardStats,
	getAuditLogs,
};

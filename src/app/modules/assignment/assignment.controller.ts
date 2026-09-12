import type { RequestHandler } from "express";
import { catchAsync } from "../../utils/catchAsyc";
import { sendResponse } from "../../utils/sendResponse";
import type { IAssignmentQuery } from "./assignment.interface";
import { TechnicianAssignmentService } from "./assignment.service";

const createAssignment: RequestHandler = catchAsync(async (req, res) => {
	const result = await TechnicianAssignmentService.createAssignment(
		req.body,
		req.user.userId,
	);

	sendResponse(res, {
		statusCode: 201,
		success: true,
		message: "Technician assigned successfully",
		data: result,
	});
});

const getAllAssignments: RequestHandler = catchAsync(async (req, res) => {
	const result = await TechnicianAssignmentService.getAllAssignments(
		req.query as IAssignmentQuery,
	);

	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "Technician assignments retrieved successfully",
		meta: result.meta,
		data: result.data,
	});
});

const getMyAssignments: RequestHandler = catchAsync(async (req, res) => {
	const result = await TechnicianAssignmentService.getMyAssignments(
		req.user.userId,
		req.query as IAssignmentQuery,
	);

	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "Your assignments retrieved successfully",
		meta: result.meta,
		data: result.data,
	});
});

const getAssignmentById: RequestHandler = catchAsync(async (req, res) => {
	const result = await TechnicianAssignmentService.getAssignmentById(
		req.params.id,
		req.user.userId,
		req.user.role,
	);

	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "Technician assignment retrieved successfully",
		data: result,
	});
});

const updateAssignment: RequestHandler = catchAsync(async (req, res) => {
	const result = await TechnicianAssignmentService.updateAssignment(
		req.params.id,
		req.body,
	);

	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "Technician assignment updated successfully",
		data: result,
	});
});

const updateAssignmentStatus: RequestHandler = catchAsync(async (req, res) => {
	const result = await TechnicianAssignmentService.updateAssignmentStatus(
		req.params.id,
		req.user.userId,
		req.body,
	);

	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "Assignment status updated successfully",
		data: result,
	});
});

const deleteAssignment: RequestHandler = catchAsync(async (req, res) => {
	const result = await TechnicianAssignmentService.deleteAssignment(
		req.params.id,
	);

	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "Technician assignment deleted successfully",
		data: result,
	});
});

const createRepairUpdate = catchAsync(async (req: Request, res: Response) => {
	const result = await TechnicianAssignmentService.createRepairUpdate(
		req.params.id,
		req.user.userId,
		req.body,
	);

	res.status(201).json({
		success: true,
		message: "Repair update added successfully",
		data: result,
	});
});

const resolveOutage = catchAsync(async (req: Request, res: Response) => {
	const result = await TechnicianAssignmentService.resolveOutage(
		req.params.id,
		req.user.userId,
		req.body,
	);

	res.status(201).json({
		success: true,
		message: "Outage resolved and power restoration recorded successfully",
		data: result,
	});
});

export const TechnicianAssignmentController = {
	createAssignment,
	getAllAssignments,
	getMyAssignments,
	getAssignmentById,
	updateAssignment,
	updateAssignmentStatus,
	deleteAssignment,
	createRepairUpdate,
	resolveOutage,
};

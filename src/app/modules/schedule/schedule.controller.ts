import type { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsyc";
import { sendResponse } from "../../utils/sendResponse";
import type { IScheduleQuery } from "./schedule.interface";
import { ScheduleService } from "./schedule.service";

const createSchedule = catchAsync(
	async (req: Request, res: Response, _next: NextFunction) => {
		const userId = req.user!.userId;

		const result = await ScheduleService.createSchedule(userId, req.body);

		sendResponse(res, {
			statusCode: httpStatus.CREATED,
			success: true,
			message: "Schedule created successfully",
			data: result,
		});
	},
);

const getAllSchedules = catchAsync(async (req: Request, res: Response) => {
	const result = await ScheduleService.getAllSchedules(
		req.query as IScheduleQuery,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Schedules retrieved successfully",
		meta: result.meta,
		data: result.data,
	});
});

const getScheduleById = catchAsync(async (req: Request, res: Response) => {
	const result = await ScheduleService.getScheduleById(req.params.id);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Schedule retrieved successfully",
		data: result,
	});
});

const updateSchedule = catchAsync(async (req: Request, res: Response) => {
	const result = await ScheduleService.updateSchedule(req.params.id, req.body);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Schedule updated successfully",
		data: result,
	});
});

const deleteSchedule = catchAsync(async (req: Request, res: Response) => {
	await ScheduleService.deleteSchedule(req.params.id);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Schedule deleted successfully",
		data: null,
	});
});

export const ScheduleController = {
	createSchedule,
	getAllSchedules,
	getScheduleById,
	updateSchedule,
	deleteSchedule,
};

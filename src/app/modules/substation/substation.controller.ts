import type { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsyc";
import { sendResponse } from "../../utils/sendResponse";
import { SubstationService } from "./substation.service";

const createSubstation = catchAsync(async (req: Request, res: Response) => {
	const result = await SubstationService.createSubstation(req.body);

	sendResponse(res, {
		statusCode: 201,
		success: true,
		message: "Substation created successfully",
		data: result,
	});
});

const getAllSubstations = catchAsync(async (req: Request, res: Response) => {
	const result = await SubstationService.getAllSubstations(req.query);

	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "Substations retrieved successfully",
		meta: result.meta,
		data: result.data,
	});
});

const getSubstationById = catchAsync(async (req: Request, res: Response) => {
	const result = await SubstationService.getSubstationById(req.params.id);

	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "Substation retrieved successfully",
		data: result,
	});
});

const updateSubstation = catchAsync(async (req: Request, res: Response) => {
	const result = await SubstationService.updateSubstation(
		req.params.id,
		req.body,
	);

	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "Substation updated successfully",
		data: result,
	});
});

const deleteSubstation = catchAsync(async (req: Request, res: Response) => {
	const result = await SubstationService.deleteSubstation(req.params.id);

	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "Substation deleted successfully",
		data: result,
	});
});

export const SubstationController = {
	createSubstation,
	getAllSubstations,
	getSubstationById,
	updateSubstation,
	deleteSubstation,
};

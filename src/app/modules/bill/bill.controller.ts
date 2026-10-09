import { Request, Response } from "express";
import { sendResponse } from "../../utils/sendResponse";
import { BillService } from "./bill.service";
import { catchAsync } from "../../utils/catchAsyc";

const createBill = catchAsync(async (req: Request, res: Response) => {
	const result = await BillService.createBill(req.body);
	sendResponse(res, {
		statusCode: 201,
		success: true,
		message: "Bill created successfully",
		data: result,
	});
});

const getAllBills = catchAsync(async (req: Request, res: Response) => {
	const result = await BillService.getAllBillsForAdmin(req.query as any);
	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "All bills retrieved successfully (Admin)",
		data: result,
	});
});

const getMyBills = catchAsync(async (req: Request, res: Response) => {
	const user = req.user as any;
	const result = await BillService.getCustomerBills(user.userId);
	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "Customer bills retrieved successfully",
		data: result,
	});
});

const getBillById = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params;
	const requester = req.user as any;
	const result = await BillService.getBillById(id, requester);
	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "Bill details retrieved successfully",
		data: result,
	});
});

export const BillController = {
	createBill,
	getAllBills,
	getMyBills,
	getBillById,
};

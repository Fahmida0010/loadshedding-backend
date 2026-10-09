import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/AppError";
import { BillStatus } from "../../../generated/prisma/enums";

interface CreateBillPayload {
	userId: string;
	billNumber: string;
	month: string;
	amount: number;
	dueDate: Date;
}

const createBill = async (payload: CreateBillPayload) => {
	// Check if target user exists
	const user = await prisma.user.findUnique({
		where: { id: payload.userId, deletedAt: null },
	});

	if (!user) {
		throw new AppError(404, "Target user not found");
	}

	// Check if billNumber already exists
	const existingBill = await prisma.bill.findUnique({
		where: { billNumber: payload.billNumber },
	});

	if (existingBill) {
		throw new AppError(400, "A bill with this bill number already exists");
	}

	const bill = await prisma.bill.create({
		data: {
			userId: payload.userId,
			billNumber: payload.billNumber,
			month: payload.month,
			amount: payload.amount,
			dueDate: payload.dueDate,
			status: BillStatus.UNPAID,
		},
		include: {
			user: {
				select: { id: true, name: true, email: true, phone: true },
			},
		},
	});

	return bill;
};

const getAllBillsForAdmin = async (query: {
	status?: BillStatus;
	userId?: string;
	month?: string;
}) => {
	const { status, userId, month } = query;

	const bills = await prisma.bill.findMany({
		where: {
			deletedAt: null,
			...(status ? { status } : {}),
			...(userId ? { userId } : {}),
			...(month ? { month } : {}),
		},
		include: {
			user: {
				select: { id: true, name: true, email: true, phone: true },
			},
		},
		orderBy: { createdAt: "desc" },
	});

	return bills;
};

const getCustomerBills = async (userId: string) => {
	const bills = await prisma.bill.findMany({
		where: {
			userId,
			deletedAt: null,
		},
		orderBy: { createdAt: "desc" },
	});

	return bills;
};

const getBillById = async (
	billId: string,
	requester: { userId: string; role: string },
) => {
	const bill = await prisma.bill.findFirst({
		where: {
			id: billId,
			deletedAt: null,
			...(requester.role === "CUSTOMER" ? { userId: requester.userId } : {}),
		},
		include: {
			user: {
				select: { id: true, name: true, email: true, phone: true },
			},
		},
	});

	if (!bill) {
		throw new AppError(404, "Bill not found or access denied");
	}

	return bill;
};

export const BillService = {
	createBill,
	getAllBillsForAdmin,
	getCustomerBills,
	getBillById,
};

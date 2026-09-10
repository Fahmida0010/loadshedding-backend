import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/AppError";
import type {
	ICreateSchedule,
	IScheduleQuery,
	IUpdateSchedule,
} from "./schedule.interface.ts";

const scheduleInclude = {
	area: {
		select: {
			id: true,
			name: true,
			code: true,
			location: true,
			feeder: {
				select: {
					id: true,
					name: true,
					code: true,
					substation: {
						select: {
							id: true,
							name: true,
							code: true,
							zone: {
								select: {
									id: true,
									name: true,
									code: true,
								},
							},
						},
					},
				},
			},
		},
	},

	createdBy: {
		select: {
			id: true,
			name: true,
			email: true,
			role: true,
		},
	},
} satisfies Prisma.LoadSheddingScheduleInclude;

const checkAreaExists = async (areaId: string) => {
	const area = await prisma.area.findFirst({
		where: {
			id: areaId,
			deletedAt: null,
		},
	});

	if (!area) {
		throw new AppError(404, "Area not found");
	}

	return area;
};

const checkScheduleConflict = async (
	areaId: string,
	scheduledStart: Date,
	scheduledEnd: Date,
	excludeScheduleId?: string,
) => {
	const conflictingSchedule = await prisma.loadSheddingSchedule.findFirst({
		where: {
			areaId,
			deletedAt: null,

			id: excludeScheduleId
				? {
						not: excludeScheduleId,
					}
				: undefined,

			status: {
				in: ["SCHEDULED", "ACTIVE"],
			},

			scheduledStart: {
				lt: scheduledEnd,
			},

			scheduledEnd: {
				gt: scheduledStart,
			},
		},

		select: {
			id: true,
			title: true,
			scheduledStart: true,
			scheduledEnd: true,
		},
	});

	if (conflictingSchedule) {
		throw new AppError(
			409,
			`Schedule conflicts with "${conflictingSchedule.title}" from ${conflictingSchedule.scheduledStart.toISOString()} to ${conflictingSchedule.scheduledEnd.toISOString()}`,
		);
	}
};

const createSchedule = async (userId: string, payload: ICreateSchedule) => {
	await checkAreaExists(payload.areaId);

	const scheduledStart = new Date(payload.scheduledStart);
	const scheduledEnd = new Date(payload.scheduledEnd);

	if (
		Number.isNaN(scheduledStart.getTime()) ||
		Number.isNaN(scheduledEnd.getTime())
	) {
		throw new AppError(400, "Invalid schedule date");
	}

	if (scheduledEnd <= scheduledStart) {
		throw new AppError(400, "Scheduled end time must be later than start time");
	}

	await checkScheduleConflict(payload.areaId, scheduledStart, scheduledEnd);

	return prisma.loadSheddingSchedule.create({
		data: {
			areaId: payload.areaId,
			createdById: userId,
			title: payload.title,
			description: payload.description,
			type: payload.type ?? "LOAD_SHEDDING",
			priority: payload.priority ?? "MEDIUM",
			scheduledStart,
			scheduledEnd,
			isRecurring: payload.isRecurring ?? false,
			recurrenceRule: payload.isRecurring ? payload.recurrenceRule : null,
			status: payload.status ?? "SCHEDULED",
		},

		include: scheduleInclude,
	});
};

const getAllSchedules = async (query: IScheduleQuery) => {
	const page = Math.max(Number(query.page) || 1, 1);
	const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
	const skip = (page - 1) * limit;

	const allowedSortFields = [
		"createdAt",
		"updatedAt",
		"scheduledStart",
		"scheduledEnd",
		"title",
		"priority",
		"status",
	];

	const sortBy = allowedSortFields.includes(query.sortBy ?? "")
		? query.sortBy!
		: "scheduledStart";

	const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";

	const where: Prisma.LoadSheddingScheduleWhereInput = {
		deletedAt: null,
	};

	if (query.searchTerm) {
		where.OR = [
			{
				title: {
					contains: query.searchTerm,
					mode: "insensitive",
				},
			},
			{
				description: {
					contains: query.searchTerm,
					mode: "insensitive",
				},
			},
			{
				area: {
					name: {
						contains: query.searchTerm,
						mode: "insensitive",
					},
				},
			},
		];
	}

	if (query.areaId) {
		where.areaId = query.areaId;
	}

	if (query.type === "LOAD_SHEDDING" || query.type === "PLANNED_OUTAGE") {
		where.type = query.type;
	}

	if (
		query.priority === "LOW" ||
		query.priority === "MEDIUM" ||
		query.priority === "HIGH" ||
		query.priority === "URGENT"
	) {
		where.priority = query.priority;
	}

	if (
		query.status === "SCHEDULED" ||
		query.status === "ACTIVE" ||
		query.status === "COMPLETED" ||
		query.status === "CANCELLED"
	) {
		where.status = query.status;
	}

	if (query.startDate || query.endDate) {
		where.scheduledStart = {};

		if (query.startDate) {
			const startDate = new Date(query.startDate);

			if (Number.isNaN(startDate.getTime())) {
				throw new AppError(400, "Invalid startDate");
			}

			where.scheduledStart.gte = startDate;
		}

		if (query.endDate) {
			const endDate = new Date(query.endDate);

			if (Number.isNaN(endDate.getTime())) {
				throw new AppError(400, "Invalid endDate");
			}

			where.scheduledStart.lte = endDate;
		}
	}

	const [data, total] = await prisma.$transaction([
		prisma.loadSheddingSchedule.findMany({
			where,
			include: scheduleInclude,
			skip,
			take: limit,
			orderBy: {
				[sortBy]: sortOrder,
			},
		}),

		prisma.loadSheddingSchedule.count({
			where,
		}),
	]);

	return {
		meta: {
			page,
			limit,
			total,
			totalPage: Math.ceil(total / limit),
		},
		data,
	};
};

const getScheduleById = async (id: string) => {
	const schedule = await prisma.loadSheddingSchedule.findFirst({
		where: {
			id,
			deletedAt: null,
		},
		include: scheduleInclude,
	});

	if (!schedule) {
		throw new AppError(404, "Schedule not found");
	}

	return schedule;
};

const updateSchedule = async (id: string, payload: IUpdateSchedule) => {
	const existingSchedule = await prisma.loadSheddingSchedule.findFirst({
		where: {
			id,
			deletedAt: null,
		},
	});

	if (!existingSchedule) {
		throw new AppError(404, "Schedule not found");
	}

	const areaId = payload.areaId ?? existingSchedule.areaId;

	const scheduledStart = payload.scheduledStart
		? new Date(payload.scheduledStart)
		: existingSchedule.scheduledStart;

	const scheduledEnd = payload.scheduledEnd
		? new Date(payload.scheduledEnd)
		: existingSchedule.scheduledEnd;

	if (
		Number.isNaN(scheduledStart.getTime()) ||
		Number.isNaN(scheduledEnd.getTime())
	) {
		throw new AppError(400, "Invalid schedule date");
	}

	if (scheduledEnd <= scheduledStart) {
		throw new AppError(400, "Scheduled end time must be later than start time");
	}

	if (payload.areaId) {
		await checkAreaExists(payload.areaId);
	}

	const finalStatus = payload.status ?? existingSchedule.status;

	if (finalStatus === "SCHEDULED" || finalStatus === "ACTIVE") {
		await checkScheduleConflict(areaId, scheduledStart, scheduledEnd, id);
	}

	const isRecurring = payload.isRecurring ?? existingSchedule.isRecurring;

	const recurrenceRule =
		payload.recurrenceRule !== undefined
			? payload.recurrenceRule
			: existingSchedule.recurrenceRule;

	if (isRecurring && !recurrenceRule) {
		throw new AppError(
			400,
			"Recurrence rule is required for a recurring schedule",
		);
	}

	return prisma.loadSheddingSchedule.update({
		where: {
			id,
		},

		data: {
			areaId: payload.areaId,
			title: payload.title,
			description: payload.description,
			type: payload.type,
			priority: payload.priority,
			scheduledStart: payload.scheduledStart ? scheduledStart : undefined,
			scheduledEnd: payload.scheduledEnd ? scheduledEnd : undefined,
			isRecurring: payload.isRecurring,
			recurrenceRule: isRecurring ? recurrenceRule : null,
			status: payload.status,
		},

		include: scheduleInclude,
	});
};

const deleteSchedule = async (id: string) => {
	const schedule = await prisma.loadSheddingSchedule.findFirst({
		where: {
			id,
			deletedAt: null,
		},
	});

	if (!schedule) {
		throw new AppError(404, "Schedule not found");
	}

	return prisma.loadSheddingSchedule.update({
		where: {
			id,
		},
		data: {
			deletedAt: new Date(),
		},
	});
};

export const ScheduleService = {
	createSchedule,
	getAllSchedules,
	getScheduleById,
	updateSchedule,
	deleteSchedule,
};

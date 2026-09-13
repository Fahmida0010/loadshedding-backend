"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutageService = void 0;
const prisma_1 = require("../../config/prisma");
const AppError_1 = require("../../utils/AppError");
const outageInclude = {
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
                },
            },
        },
    },
    reportedBy: {
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
        },
    },
    _count: {
        select: {
            assignments: true,
            repairUpdates: true,
            history: true,
            notifications: true,
        },
    },
};
const allowedStatusTransitions = {
    REPORTED: ["CONFIRMED", "CANCELLED"],
    CONFIRMED: ["ASSIGNED", "CANCELLED"],
    ASSIGNED: ["IN_PROGRESS", "CANCELLED"],
    IN_PROGRESS: ["RESOLVED", "CANCELLED"],
    RESOLVED: ["CLOSED", "IN_PROGRESS"],
    CLOSED: [],
    CANCELLED: [],
};
const checkAreaExists = async (areaId) => {
    const area = await prisma_1.prisma.area.findFirst({
        where: {
            id: areaId,
            deletedAt: null,
        },
    });
    if (!area) {
        throw new AppError_1.AppError(404, "Area not found");
    }
    return area;
};
const validateEstimatedRestoreTime = (estimatedRestoreAt) => {
    if (!estimatedRestoreAt) {
        return null;
    }
    const restoreDate = new Date(estimatedRestoreAt);
    if (Number.isNaN(restoreDate.getTime())) {
        throw new AppError_1.AppError(400, "Invalid estimated restoration date");
    }
    return restoreDate;
};
const createOutage = async (reportedById, payload) => {
    await checkAreaExists(payload.areaId);
    // একই customer-এর একই active report আগে থেকেই আছে কি না
    const existingOutage = await prisma_1.prisma.unexpectedOutage.findFirst({
        where: {
            areaId: payload.areaId,
            reportedById,
            title: {
                equals: payload.title,
                mode: "insensitive",
            },
            status: {
                in: ["REPORTED", "CONFIRMED", "ASSIGNED", "IN_PROGRESS"],
            },
            deletedAt: null,
        },
        select: {
            id: true,
            title: true,
            status: true,
            reportedAt: true,
        },
    });
    if (existingOutage) {
        throw new AppError_1.AppError(409, "You have already reported this outage");
    }
    const estimatedRestoreAt = validateEstimatedRestoreTime(payload.estimatedRestoreAt);
    return prisma_1.prisma.unexpectedOutage.create({
        data: {
            areaId: payload.areaId,
            reportedById,
            title: payload.title,
            description: payload.description,
            reason: payload.reason,
            priority: payload.priority ?? "MEDIUM",
            status: "REPORTED",
            estimatedRestoreAt,
        },
        include: outageInclude,
    });
};
const getAllOutages = async (query) => {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
    const skip = (page - 1) * limit;
    const allowedSortFields = [
        "reportedAt",
        "createdAt",
        "updatedAt",
        "estimatedRestoreAt",
        "resolvedAt",
        "restoredAt",
        "priority",
        "status",
        "title",
    ];
    const sortBy = allowedSortFields.includes(query.sortBy ?? "")
        ? query.sortBy
        : "reportedAt";
    const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";
    const where = {
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
                reason: {
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
    if (query.reportedById) {
        where.reportedById = query.reportedById;
    }
    if (query.priority === "LOW" ||
        query.priority === "MEDIUM" ||
        query.priority === "HIGH" ||
        query.priority === "URGENT") {
        where.priority = query.priority;
    }
    if (query.status === "REPORTED" ||
        query.status === "CONFIRMED" ||
        query.status === "ASSIGNED" ||
        query.status === "IN_PROGRESS" ||
        query.status === "RESOLVED" ||
        query.status === "CLOSED" ||
        query.status === "CANCELLED") {
        where.status = query.status;
    }
    if (query.reportedFrom || query.reportedTo) {
        where.reportedAt = {};
        if (query.reportedFrom) {
            const reportedFrom = new Date(query.reportedFrom);
            if (Number.isNaN(reportedFrom.getTime())) {
                throw new AppError_1.AppError(400, "Invalid reportedFrom date");
            }
            where.reportedAt.gte = reportedFrom;
        }
        if (query.reportedTo) {
            const reportedTo = new Date(query.reportedTo);
            if (Number.isNaN(reportedTo.getTime())) {
                throw new AppError_1.AppError(400, "Invalid reportedTo date");
            }
            where.reportedAt.lte = reportedTo;
        }
    }
    const [data, total] = await prisma_1.prisma.$transaction([
        prisma_1.prisma.unexpectedOutage.findMany({
            where,
            include: outageInclude,
            skip,
            take: limit,
            orderBy: {
                [sortBy]: sortOrder,
            },
        }),
        prisma_1.prisma.unexpectedOutage.count({
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
const getMyOutages = async (reportedById, query) => {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
    const skip = (page - 1) * limit;
    const where = {
        reportedById,
        deletedAt: null,
    };
    if (query.status) {
        where.status = query.status;
    }
    if (query.areaId) {
        where.areaId = query.areaId;
    }
    const [data, total] = await prisma_1.prisma.$transaction([
        prisma_1.prisma.unexpectedOutage.findMany({
            where,
            include: outageInclude,
            skip,
            take: limit,
            orderBy: {
                reportedAt: "desc",
            },
        }),
        prisma_1.prisma.unexpectedOutage.count({
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
const getOutageById = async (id) => {
    const outage = await prisma_1.prisma.unexpectedOutage.findFirst({
        where: {
            id,
            deletedAt: null,
        },
        include: outageInclude,
    });
    if (!outage) {
        throw new AppError_1.AppError(404, "Unexpected outage not found");
    }
    return outage;
};
const updateOutage = async (id, payload) => {
    const existingOutage = await prisma_1.prisma.unexpectedOutage.findFirst({
        where: {
            id,
            deletedAt: null,
        },
    });
    if (!existingOutage) {
        throw new AppError_1.AppError(404, "Unexpected outage not found");
    }
    if (existingOutage.status === "CLOSED" ||
        existingOutage.status === "CANCELLED") {
        throw new AppError_1.AppError(400, `A ${existingOutage.status.toLowerCase()} outage cannot be edited`);
    }
    if (payload.areaId) {
        await checkAreaExists(payload.areaId);
    }
    let estimatedRestoreAt;
    if (payload.estimatedRestoreAt !== undefined) {
        estimatedRestoreAt = validateEstimatedRestoreTime(payload.estimatedRestoreAt);
    }
    return prisma_1.prisma.unexpectedOutage.update({
        where: {
            id,
        },
        data: {
            areaId: payload.areaId,
            title: payload.title,
            description: payload.description,
            reason: payload.reason,
            priority: payload.priority,
            estimatedRestoreAt,
        },
        include: outageInclude,
    });
};
const updateOutageStatus = async (id, payload) => {
    const existingOutage = await prisma_1.prisma.unexpectedOutage.findFirst({
        where: {
            id,
            deletedAt: null,
        },
    });
    if (!existingOutage) {
        throw new AppError_1.AppError(404, "Unexpected outage not found");
    }
    if (existingOutage.status === payload.status) {
        throw new AppError_1.AppError(400, `Outage status is already ${payload.status}`);
    }
    const allowedNextStatuses = allowedStatusTransitions[existingOutage.status];
    if (!allowedNextStatuses.includes(payload.status)) {
        throw new AppError_1.AppError(400, `Cannot change outage status from ${existingOutage.status} to ${payload.status}`);
    }
    let estimatedRestoreAt;
    if (payload.estimatedRestoreAt !== undefined) {
        estimatedRestoreAt = validateEstimatedRestoreTime(payload.estimatedRestoreAt);
    }
    const now = new Date();
    let resolvedAt;
    let restoredAt;
    if (payload.status === "RESOLVED") {
        resolvedAt = now;
        restoredAt = now;
    }
    // Reopening a resolved outage
    if (existingOutage.status === "RESOLVED" &&
        payload.status === "IN_PROGRESS") {
        resolvedAt = null;
        restoredAt = null;
    }
    return prisma_1.prisma.unexpectedOutage.update({
        where: {
            id,
        },
        data: {
            status: payload.status,
            reason: payload.reason !== undefined ? payload.reason : undefined,
            estimatedRestoreAt,
            resolvedAt,
            restoredAt,
        },
        include: outageInclude,
    });
};
const deleteOutage = async (id) => {
    const existingOutage = await prisma_1.prisma.unexpectedOutage.findFirst({
        where: {
            id,
            deletedAt: null,
        },
    });
    if (!existingOutage) {
        throw new AppError_1.AppError(404, "Unexpected outage not found");
    }
    if (existingOutage.status === "IN_PROGRESS" ||
        existingOutage.status === "ASSIGNED") {
        throw new AppError_1.AppError(400, "An assigned or in-progress outage cannot be deleted");
    }
    return prisma_1.prisma.unexpectedOutage.update({
        where: {
            id,
        },
        data: {
            deletedAt: new Date(),
        },
    });
};
exports.OutageService = {
    createOutage,
    getAllOutages,
    getMyOutages,
    getOutageById,
    updateOutage,
    updateOutageStatus,
    deleteOutage,
};

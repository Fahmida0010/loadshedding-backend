"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DistributionZoneService = void 0;
const prisma_1 = require("../../config/prisma");
const AppError_1 = require("../../utils/AppError");
const createDistributionZone = async (payload) => {
    const normalizedName = payload.name.trim();
    const normalizedCode = payload.code.trim().toUpperCase();
    const existingZone = await prisma_1.prisma.distributionZone.findFirst({
        where: {
            deletedAt: null,
            OR: [
                {
                    name: {
                        equals: normalizedName,
                        mode: "insensitive",
                    },
                },
                {
                    code: {
                        equals: normalizedCode,
                        mode: "insensitive",
                    },
                },
            ],
        },
    });
    if (existingZone) {
        if (existingZone.code.toLowerCase() === normalizedCode.toLowerCase()) {
            throw new AppError_1.AppError(409, "Distribution zone code already exists");
        }
        throw new AppError_1.AppError(409, "Distribution zone name already exists");
    }
    const result = await prisma_1.prisma.distributionZone.create({
        data: {
            name: normalizedName,
            code: normalizedCode,
            description: payload.description?.trim() || null,
        },
    });
    return result;
};
/**
 * Get all distribution zones
 */
const getAllDistributionZones = async (query) => {
    const parsedPage = Number.parseInt(query.page || "1", 10);
    const parsedLimit = Number.parseInt(query.limit || "10", 10);
    const page = Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
    const limit = Number.isNaN(parsedLimit) || parsedLimit < 1
        ? 10
        : Math.min(parsedLimit, 100);
    const skip = (page - 1) * limit;
    const allowedSortFields = ["name", "code", "createdAt", "updatedAt"];
    const sortBy = allowedSortFields.includes(query.sortBy)
        ? query.sortBy
        : "createdAt";
    const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";
    const searchTerm = query.searchTerm?.trim();
    const where = {
        deletedAt: null,
    };
    if (searchTerm) {
        where.OR = [
            {
                name: {
                    contains: searchTerm,
                    mode: "insensitive",
                },
            },
            {
                code: {
                    contains: searchTerm,
                    mode: "insensitive",
                },
            },
            {
                description: {
                    contains: searchTerm,
                    mode: "insensitive",
                },
            },
        ];
    }
    const [data, total] = await Promise.all([
        prisma_1.prisma.distributionZone.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                [sortBy]: sortOrder,
            },
            include: {
                _count: {
                    select: {
                        substations: {
                            where: {
                                deletedAt: null,
                            },
                        },
                    },
                },
            },
        }),
        prisma_1.prisma.distributionZone.count({
            where,
        }),
    ]);
    const meta = {
        page,
        limit,
        total,
        totalPage: Math.ceil(total / limit),
    };
    return {
        meta,
        data,
    };
};
/**
 * Get one distribution zone
 */
const getDistributionZoneById = async (id) => {
    const result = await prisma_1.prisma.distributionZone.findFirst({
        where: {
            id,
            deletedAt: null,
        },
        include: {
            substations: {
                where: {
                    deletedAt: null,
                },
                select: {
                    id: true,
                    name: true,
                    code: true,
                    location: true,
                    capacityMw: true,
                    voltageLevel: true,
                    createdAt: true,
                    updatedAt: true,
                },
                orderBy: {
                    createdAt: "desc",
                },
            },
            _count: {
                select: {
                    substations: {
                        where: {
                            deletedAt: null,
                        },
                    },
                },
            },
        },
    });
    if (!result) {
        throw new AppError_1.AppError(404, "Distribution zone not found");
    }
    return result;
};
/**
 * Update distribution zone
 */
const updateDistributionZone = async (id, payload) => {
    const existingZone = await prisma_1.prisma.distributionZone.findFirst({
        where: {
            id,
            deletedAt: null,
        },
    });
    if (!existingZone) {
        throw new AppError_1.AppError(404, "Distribution zone not found");
    }
    const normalizedName = payload.name?.trim();
    const normalizedCode = payload.code?.trim().toUpperCase();
    if (normalizedName) {
        const zoneWithSameName = await prisma_1.prisma.distributionZone.findFirst({
            where: {
                id: {
                    not: id,
                },
                deletedAt: null,
                name: {
                    equals: normalizedName,
                    mode: "insensitive",
                },
            },
        });
        if (zoneWithSameName) {
            throw new AppError_1.AppError(409, "Distribution zone name already exists");
        }
    }
    if (normalizedCode) {
        const zoneWithSameCode = await prisma_1.prisma.distributionZone.findFirst({
            where: {
                id: {
                    not: id,
                },
                deletedAt: null,
                code: {
                    equals: normalizedCode,
                    mode: "insensitive",
                },
            },
        });
        if (zoneWithSameCode) {
            throw new AppError_1.AppError(409, "Distribution zone code already exists");
        }
    }
    const result = await prisma_1.prisma.distributionZone.update({
        where: {
            id,
        },
        data: {
            ...(normalizedName !== undefined && {
                name: normalizedName,
            }),
            ...(normalizedCode !== undefined && {
                code: normalizedCode,
            }),
            ...(payload.description !== undefined && {
                description: payload.description?.trim() || null,
            }),
        },
    });
    return result;
};
/**
 * Soft delete distribution zone
 */
const deleteDistributionZone = async (id) => {
    const existingZone = await prisma_1.prisma.distributionZone.findFirst({
        where: {
            id,
            deletedAt: null,
        },
    });
    if (!existingZone) {
        throw new AppError_1.AppError(404, "Distribution zone not found");
    }
    const activeSubstationCount = await prisma_1.prisma.substation.count({
        where: {
            zoneId: id,
            deletedAt: null,
        },
    });
    if (activeSubstationCount > 0) {
        throw new AppError_1.AppError(409, "Cannot delete a distribution zone that has active substations");
    }
    const result = await prisma_1.prisma.distributionZone.update({
        where: {
            id,
        },
        data: {
            deletedAt: new Date(),
        },
    });
    return result;
};
exports.DistributionZoneService = {
    createDistributionZone,
    getAllDistributionZones,
    getDistributionZoneById,
    updateDistributionZone,
    deleteDistributionZone,
};

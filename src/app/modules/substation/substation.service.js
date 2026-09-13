"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubstationService = void 0;
const prisma_1 = require("../../config/prisma");
const AppError_1 = require("../../utils/AppError");
const createSubstation = async (payload) => {
    const zone = await prisma_1.prisma.distributionZone.findFirst({
        where: {
            id: payload.zoneId,
            deletedAt: null,
        },
    });
    if (!zone) {
        throw new AppError_1.AppError(404, "Distribution zone not found");
    }
    const normalizedCode = payload.code.trim().toUpperCase();
    const normalizedName = payload.name.trim();
    const existingCode = await prisma_1.prisma.substation.findFirst({
        where: {
            code: normalizedCode,
        },
    });
    if (existingCode) {
        throw new AppError_1.AppError(409, "A substation with this code already exists");
    }
    const existingName = await prisma_1.prisma.substation.findFirst({
        where: {
            zoneId: payload.zoneId,
            name: {
                equals: normalizedName,
                mode: "insensitive",
            },
            deletedAt: null,
        },
    });
    if (existingName) {
        throw new AppError_1.AppError(409, "A substation with this name already exists in this zone");
    }
    const result = await prisma_1.prisma.substation.create({
        data: {
            ...payload,
            name: normalizedName,
            code: normalizedCode,
        },
        include: {
            zone: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                },
            },
        },
    });
    return result;
};
const getAllSubstations = async (query) => {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
    const skip = (page - 1) * limit;
    const searchTerm = query.searchTerm?.trim();
    const where = {
        deletedAt: null,
        ...(query.zoneId && {
            zoneId: query.zoneId,
        }),
        ...(searchTerm && {
            OR: [
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
                    location: {
                        contains: searchTerm,
                        mode: "insensitive",
                    },
                },
                {
                    voltageLevel: {
                        contains: searchTerm,
                        mode: "insensitive",
                    },
                },
            ],
        }),
    };
    const [data, total] = await prisma_1.prisma.$transaction([
        prisma_1.prisma.substation.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                createdAt: "desc",
            },
            include: {
                zone: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                    },
                },
                _count: {
                    select: {
                        feeders: true,
                    },
                },
            },
        }),
        prisma_1.prisma.substation.count({
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
const getSubstationById = async (id) => {
    const result = await prisma_1.prisma.substation.findFirst({
        where: {
            id,
            deletedAt: null,
        },
        include: {
            zone: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                    description: true,
                },
            },
            feeders: {
                where: {
                    deletedAt: null,
                },
                select: {
                    id: true,
                    name: true,
                    code: true,
                    capacityMw: true,
                    priority: true,
                },
            },
        },
    });
    if (!result) {
        throw new AppError_1.AppError(404, "Substation not found");
    }
    return result;
};
const updateSubstation = async (id, payload) => {
    const existingSubstation = await prisma_1.prisma.substation.findFirst({
        where: {
            id,
            deletedAt: null,
        },
    });
    if (!existingSubstation) {
        throw new AppError_1.AppError(404, "Substation not found");
    }
    const targetZoneId = payload.zoneId ?? existingSubstation.zoneId;
    if (payload.zoneId) {
        const zone = await prisma_1.prisma.distributionZone.findFirst({
            where: {
                id: payload.zoneId,
                deletedAt: null,
            },
        });
        if (!zone) {
            throw new AppError_1.AppError(404, "Distribution zone not found");
        }
    }
    if (payload.code) {
        const normalizedCode = payload.code.trim().toUpperCase();
        const duplicateCode = await prisma_1.prisma.substation.findFirst({
            where: {
                code: normalizedCode,
                id: {
                    not: id,
                },
            },
        });
        if (duplicateCode) {
            throw new AppError_1.AppError(409, "A substation with this code already exists");
        }
        payload.code = normalizedCode;
    }
    const targetName = payload.name?.trim() ?? existingSubstation.name;
    const duplicateName = await prisma_1.prisma.substation.findFirst({
        where: {
            zoneId: targetZoneId,
            name: {
                equals: targetName,
                mode: "insensitive",
            },
            deletedAt: null,
            id: {
                not: id,
            },
        },
    });
    if (duplicateName) {
        throw new AppError_1.AppError(409, "A substation with this name already exists in this zone");
    }
    if (payload.name) {
        payload.name = payload.name.trim();
    }
    const result = await prisma_1.prisma.substation.update({
        where: {
            id,
        },
        data: payload,
        include: {
            zone: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                },
            },
        },
    });
    return result;
};
const deleteSubstation = async (id) => {
    const substation = await prisma_1.prisma.substation.findFirst({
        where: {
            id,
            deletedAt: null,
        },
    });
    if (!substation) {
        throw new AppError_1.AppError(404, "Substation not found");
    }
    const activeFeederCount = await prisma_1.prisma.feeder.count({
        where: {
            substationId: id,
            deletedAt: null,
        },
    });
    if (activeFeederCount > 0) {
        throw new AppError_1.AppError(409, "Substation cannot be deleted because it contains active feeders");
    }
    const result = await prisma_1.prisma.substation.update({
        where: {
            id,
        },
        data: {
            deletedAt: new Date(),
        },
    });
    return result;
};
exports.SubstationService = {
    createSubstation,
    getAllSubstations,
    getSubstationById,
    updateSubstation,
    deleteSubstation,
};

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeederService = void 0;
const prisma_1 = require("../../config/prisma");
const AppError_1 = require("../../utils/AppError");
/*
 * Create a feeder
 */
const createFeeder = async (payload) => {
    const substation = await prisma_1.prisma.substation.findFirst({
        where: {
            id: payload.substationId,
            deletedAt: null,
        },
    });
    if (!substation) {
        throw new AppError_1.AppError(404, "Substation not found");
    }
    const normalizedName = payload.name.trim();
    const normalizedCode = payload.code.trim().toUpperCase();
    /*
     * Feeder code globally unique
     */
    const existingCode = await prisma_1.prisma.feeder.findFirst({
        where: {
            code: normalizedCode,
        },
    });
    if (existingCode) {
        throw new AppError_1.AppError(409, `Feeder code "${normalizedCode}" already exists`);
    }
    /*
     * Feeder name unique inside the same substation
     */
    const existingName = await prisma_1.prisma.feeder.findFirst({
        where: {
            substationId: payload.substationId,
            name: {
                equals: normalizedName,
                mode: "insensitive",
            },
        },
    });
    if (existingName) {
        throw new AppError_1.AppError(409, `Feeder name "${normalizedName}" already exists in this substation`);
    }
    const result = await prisma_1.prisma.feeder.create({
        data: {
            substationId: payload.substationId,
            name: normalizedName,
            code: normalizedCode,
            capacityMw: payload.capacityMw,
            priority: payload.priority ?? "MEDIUM",
        },
        include: {
            substation: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                    location: true,
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
    });
    return result;
};
/*
 * Get all feeders
 */
const getAllFeeders = async (query) => {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
    const skip = (page - 1) * limit;
    const searchTerm = query.searchTerm?.trim();
    const where = {
        deletedAt: null,
        ...(query.substationId && {
            substationId: query.substationId,
        }),
        ...(query.priority && {
            priority: query.priority,
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
                    substation: {
                        name: {
                            contains: searchTerm,
                            mode: "insensitive",
                        },
                    },
                },
            ],
        }),
    };
    const [data, total] = await prisma_1.prisma.$transaction([
        prisma_1.prisma.feeder.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                createdAt: "desc",
            },
            include: {
                substation: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                        location: true,
                        zone: {
                            select: {
                                id: true,
                                name: true,
                                code: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        areas: true,
                    },
                },
            },
        }),
        prisma_1.prisma.feeder.count({
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
/*
 * Get a feeder by ID
 */
const getFeederById = async (id) => {
    const result = await prisma_1.prisma.feeder.findFirst({
        where: {
            id,
            deletedAt: null,
        },
        include: {
            substation: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                    location: true,
                    capacityMw: true,
                    voltageLevel: true,
                    zone: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                        },
                    },
                },
            },
            areas: {
                where: {
                    deletedAt: null,
                },
                select: {
                    id: true,
                    name: true,
                    code: true,
                    location: true,
                    population: true,
                    priority: true,
                    createdAt: true,
                },
            },
        },
    });
    if (!result) {
        throw new AppError_1.AppError(404, "Feeder not found");
    }
    return result;
};
/*
 * Update a feeder
 */
const updateFeeder = async (id, payload) => {
    const existingFeeder = await prisma_1.prisma.feeder.findFirst({
        where: {
            id,
            deletedAt: null,
        },
    });
    if (!existingFeeder) {
        throw new AppError_1.AppError(404, "Feeder not found");
    }
    /*
     * The substation where the feeder will remain or move
     */
    const targetSubstationId = payload.substationId ?? existingFeeder.substationId;
    /*
     * Check new substation if substationId is updated
     */
    if (payload.substationId) {
        const substation = await prisma_1.prisma.substation.findFirst({
            where: {
                id: payload.substationId,
                deletedAt: null,
            },
        });
        if (!substation) {
            throw new AppError_1.AppError(404, "Substation not found");
        }
    }
    /*
     * Check duplicate feeder code
     */
    if (payload.code !== undefined) {
        const normalizedCode = payload.code.trim().toUpperCase();
        const duplicateCode = await prisma_1.prisma.feeder.findFirst({
            where: {
                code: normalizedCode,
                id: {
                    not: id,
                },
            },
        });
        if (duplicateCode) {
            throw new AppError_1.AppError(409, `Feeder code "${normalizedCode}" already exists`);
        }
        payload.code = normalizedCode;
    }
    /*
     * Check duplicate feeder name inside target substation
     */
    const targetName = payload.name !== undefined ? payload.name.trim() : existingFeeder.name;
    const duplicateName = await prisma_1.prisma.feeder.findFirst({
        where: {
            substationId: targetSubstationId,
            name: {
                equals: targetName,
                mode: "insensitive",
            },
            id: {
                not: id,
            },
        },
    });
    if (duplicateName) {
        throw new AppError_1.AppError(409, `Feeder name "${targetName}" already exists in this substation`);
    }
    if (payload.name !== undefined) {
        payload.name = payload.name.trim();
    }
    const result = await prisma_1.prisma.feeder.update({
        where: {
            id,
        },
        data: {
            ...(payload.substationId !== undefined && {
                substationId: payload.substationId,
            }),
            ...(payload.name !== undefined && {
                name: payload.name,
            }),
            ...(payload.code !== undefined && {
                code: payload.code,
            }),
            ...(payload.capacityMw !== undefined && {
                capacityMw: payload.capacityMw,
            }),
            ...(payload.priority !== undefined && {
                priority: payload.priority,
            }),
        },
        include: {
            substation: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                    location: true,
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
    });
    return result;
};
/*
 * Soft delete a feeder
 */
const deleteFeeder = async (id) => {
    const feeder = await prisma_1.prisma.feeder.findFirst({
        where: {
            id,
            deletedAt: null,
        },
    });
    if (!feeder) {
        throw new AppError_1.AppError(404, "Feeder not found");
    }
    /*
     * A feeder cannot be deleted if it contains active areas
     */
    const activeAreaCount = await prisma_1.prisma.area.count({
        where: {
            feederId: id,
            deletedAt: null,
        },
    });
    if (activeAreaCount > 0) {
        throw new AppError_1.AppError(409, "Feeder cannot be deleted because it contains active areas");
    }
    const result = await prisma_1.prisma.feeder.update({
        where: {
            id,
        },
        data: {
            deletedAt: new Date(),
        },
    });
    return result;
};
exports.FeederService = {
    createFeeder,
    getAllFeeders,
    getFeederById,
    updateFeeder,
    deleteFeeder,
};

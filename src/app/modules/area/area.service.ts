import type { Prisma } from "../../../generated/prisma/client";

import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/AppError";

import type {
  IAreaQuery,
  ICreateArea,
  IUpdateArea,
} from "./area.interface";

/*
 * Create an area
 */
const createArea = async (payload: ICreateArea) => {
  const feeder = await prisma.feeder.findFirst({
    where: {
      id: payload.feederId,
      deletedAt: null,
    },
  });

  if (!feeder) {
    throw new AppError(404, "Feeder not found");
  }

  const normalizedName = payload.name.trim();
  const normalizedCode = payload.code
    .trim()
    .toUpperCase();

  /*
   * Area code is globally unique.
   * Soft-deleted records are also checked because
   * Prisma @unique includes soft-deleted rows.
   */
  const existingCode = await prisma.area.findFirst({
    where: {
      code: normalizedCode,
    },
  });

  if (existingCode) {
    throw new AppError(
      409,
      `Area code "${normalizedCode}" already exists`,
    );
  }

  /*
   * Area name must be unique inside the same feeder.
   */
  const existingName = await prisma.area.findFirst({
    where: {
      feederId: payload.feederId,
      name: {
        equals: normalizedName,
        mode: "insensitive",
      },
    },
  });

  if (existingName) {
    throw new AppError(
      409,
      `Area name "${normalizedName}" already exists in this feeder`,
    );
  }

  const result = await prisma.area.create({
    data: {
      feederId: payload.feederId,
      name: normalizedName,
      code: normalizedCode,
      location: payload.location?.trim(),
      population: payload.population,
      priority: payload.priority ?? "MEDIUM",
    },
    include: {
      feeder: {
        select: {
          id: true,
          name: true,
          code: true,
          priority: true,
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
  });

  return result;
};

/*
 * Get all areas
 */
const getAllAreas = async (query: IAreaQuery) => {
  const page = Math.max(Number(query.page) || 1, 1);

  const limit = Math.min(
    Math.max(Number(query.limit) || 10, 1),
    100,
  );

  const skip = (page - 1) * limit;
  const searchTerm = query.searchTerm?.trim();

  const where: Prisma.AreaWhereInput = {
    deletedAt: null,

    ...(query.feederId && {
      feederId: query.feederId,
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
          location: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
        {
          feeder: {
            is: {
              name: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
          },
        },
      ],
    }),
  };

  const [data, total] = await prisma.$transaction([
    prisma.area.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        feeder: {
          select: {
            id: true,
            name: true,
            code: true,
            capacityMw: true,
            priority: true,
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
        _count: {
          select: {
            users: true,
            schedules: true,
            unexpectedOutages: true,
          },
        },
      },
    }),

    prisma.area.count({
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
 * Get an area by ID
 */
const getAreaById = async (id: string) => {
  const result = await prisma.area.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    include: {
      feeder: {
        select: {
          id: true,
          name: true,
          code: true,
          capacityMw: true,
          priority: true,
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
        },
      },
      _count: {
        select: {
          users: true,
          schedules: true,
          unexpectedOutages: true,
        },
      },
    },
  });

  if (!result) {
    throw new AppError(404, "Area not found");
  }

  return result;
};

/*
 * Update an area
 */
const updateArea = async (
  id: string,
  payload: IUpdateArea,
) => {
  const existingArea = await prisma.area.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });

  if (!existingArea) {
    throw new AppError(404, "Area not found");
  }

  const targetFeederId =
    payload.feederId ?? existingArea.feederId;

  /*
   * Check new feeder when moving the area.
   */
  if (payload.feederId !== undefined) {
    const feeder = await prisma.feeder.findFirst({
      where: {
        id: payload.feederId,
        deletedAt: null,
      },
    });

    if (!feeder) {
      throw new AppError(404, "Feeder not found");
    }
  }

  /*
   * Check duplicate area code.
   */
  if (payload.code !== undefined) {
    const normalizedCode = payload.code
      .trim()
      .toUpperCase();

    const duplicateCode = await prisma.area.findFirst({
      where: {
        code: normalizedCode,
        id: {
          not: id,
        },
      },
    });

    if (duplicateCode) {
      throw new AppError(
        409,
        `Area code "${normalizedCode}" already exists`,
      );
    }

    payload.code = normalizedCode;
  }

  /*
   * Check duplicate name inside target feeder.
   */
  const targetName =
    payload.name !== undefined
      ? payload.name.trim()
      : existingArea.name;

  const duplicateName = await prisma.area.findFirst({
    where: {
      feederId: targetFeederId,
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
    throw new AppError(
      409,
      `Area name "${targetName}" already exists in this feeder`,
    );
  }

  if (payload.name !== undefined) {
    payload.name = payload.name.trim();
  }

  if (
    payload.location !== undefined &&
    payload.location !== null
  ) {
    payload.location = payload.location.trim();
  }

  const result = await prisma.area.update({
    where: {
      id,
    },
    data: {
      ...(payload.feederId !== undefined && {
        feederId: payload.feederId,
      }),

      ...(payload.name !== undefined && {
        name: payload.name,
      }),

      ...(payload.code !== undefined && {
        code: payload.code,
      }),

      ...(payload.location !== undefined && {
        location: payload.location,
      }),

      ...(payload.population !== undefined && {
        population: payload.population,
      }),

      ...(payload.priority !== undefined && {
        priority: payload.priority,
      }),
    },
    include: {
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
  });

  return result;
};

/*
 * Soft delete an area
 */
const deleteArea = async (id: string) => {
  const area = await prisma.area.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    include: {
      _count: {
        select: {
          users: true,
          schedules: true,
          unexpectedOutages: true,
        },
      },
    },
  });

  if (!area) {
    throw new AppError(404, "Area not found");
  }

  if (area._count.users > 0) {
    throw new AppError(
      409,
      "Area cannot be deleted because customers are connected to it",
    );
  }

  if (area._count.schedules > 0) {
    throw new AppError(
      409,
      "Area cannot be deleted because it contains load-shedding schedules",
    );
  }

  if (area._count.unexpectedOutages > 0) {
    throw new AppError(
      409,
      "Area cannot be deleted because it contains outage reports",
    );
  }

  const result = await prisma.area.update({
    where: {
      id,
    },
    data: {
      deletedAt: new Date(),
    },
  });

  return result;
};

export const AreaService = {
  createArea,
  getAllAreas,
  getAreaById,
  updateArea,
  deleteArea,
};
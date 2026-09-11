import type { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/AppError";

import type {
  IAuditLogQuery,
  IUpdateUserRole,
  IUserQuery,
} from "./admin.interface";

const allowedUserSortFields = [
  "name",
  "email",
  "role",
  "status",
  "createdAt",
  "updatedAt",
] as const;

const allowedAuditSortFields = [
  "action",
  "entityType",
  "createdAt",
] as const;

const getAllUsers = async (query: IUserQuery) => {
  const page = Math.max(Number(query.page) || 1, 1);

  const limit = Math.min(
    Math.max(Number(query.limit) || 10, 1),
    100,
  );

  const skip = (page - 1) * limit;

  const sortBy = allowedUserSortFields.includes(
    query.sortBy as (typeof allowedUserSortFields)[number],
  )
    ? query.sortBy!
    : "createdAt";

  const sortOrder: Prisma.SortOrder =
    query.sortOrder === "asc" ? "asc" : "desc";

  const where: Prisma.UserWhereInput = {
    deletedAt: null,

    ...(query.role && {
      role: query.role,
    }),

    ...(query.status && {
      status: query.status,
    }),

    ...(query.areaId && {
      areaId: query.areaId,
    }),

    ...(query.search && {
      OR: [
        {
          name: {
            contains: query.search,
            mode: "insensitive",
          },
        },
        {
          email: {
            contains: query.search,
            mode: "insensitive",
          },
        },
        {
          phone: {
            contains: query.search,
          },
        },
        {
          employeeId: {
            contains: query.search,
            mode: "insensitive",
          },
        },
      ],
    }),
  };

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        profileImage: true,
        authProvider: true,
        role: true,
        status: true,
        areaId: true,
        employeeId: true,
        skill: true,
        experienceYears: true,
        createdAt: true,
        updatedAt: true,

        area: {
          select: {
            id: true,
            name: true,
            code: true,
            location: true,
          },
        },
      },
    }),

    prisma.user.count({
      where,
    }),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: users,
  };
};

const updateUserRole = async (
  targetUserId: string,
  payload: IUpdateUserRole,
  adminId: string,
  ipAddress?: string,
  userAgent?: string,
) => {
  if (targetUserId === adminId) {
    throw new AppError(
      400,
      "You cannot change your own role",
    );
  }

  const user = await prisma.user.findFirst({
    where: {
      id: targetUserId,
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
    },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  if (user.role === payload.role) {
    throw new AppError(
      400,
      `User already has the ${payload.role} role`,
    );
  }

  const result = await prisma.$transaction(
    async (transactionClient) => {
      const updatedUser =
        await transactionClient.user.update({
          where: {
            id: targetUserId,
          },
          data: {
            role: payload.role,
          },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            profileImage: true,
            role: true,
            status: true,
            employeeId: true,
            skill: true,
            experienceYears: true,
            createdAt: true,
            updatedAt: true,
          },
        });

      await transactionClient.auditLog.create({
        data: {
          userId: adminId,
          action: "UPDATE_USER_ROLE",
          entityType: "User",
          entityId: targetUserId,
          oldValues: {
            role: user.role,
          },
          newValues: {
            role: payload.role,
          },
          ipAddress,
          userAgent,
        },
      });

      return updatedUser;
    },
  );

  return result;
};

const getDashboardStats = async () => {
  const [
    totalUsers,
    activeUsers,
    blockedUsers,
    totalAdmins,
    totalTechnicians,
    totalCustomers,
    totalSchedules,
    activeSchedules,
    totalOutages,
    activeOutages,
    resolvedOutages,
    totalAssignments,
    activeAssignments,
    completedAssignments,
    recentUsers,
    recentOutages,
  ] = await Promise.all([
    prisma.user.count({
      where: {
        deletedAt: null,
      },
    }),

    prisma.user.count({
      where: {
        deletedAt: null,
        status: "ACTIVE",
      },
    }),

    prisma.user.count({
      where: {
        deletedAt: null,
        status: "BLOCKED",
      },
    }),

    prisma.user.count({
      where: {
        deletedAt: null,
        role: "ADMIN",
      },
    }),

    prisma.user.count({
      where: {
        deletedAt: null,
        role: "TECHNICIAN",
      },
    }),

    prisma.user.count({
      where: {
        deletedAt: null,
        role: "CUSTOMER",
      },
    }),

    prisma.loadSheddingSchedule.count({
      where: {
        deletedAt: null,
      },
    }),

    prisma.loadSheddingSchedule.count({
      where: {
        deletedAt: null,
        status: "ACTIVE",
      },
    }),

    prisma.unexpectedOutage.count({
      where: {
        deletedAt: null,
      },
    }),

    prisma.unexpectedOutage.count({
      where: {
        deletedAt: null,
        status: {
          in: [
            "REPORTED",
            "CONFIRMED",
            "ASSIGNED",
            "IN_PROGRESS",
          ],
        },
      },
    }),

    prisma.unexpectedOutage.count({
      where: {
        deletedAt: null,
        status: {
          in: ["RESOLVED", "CLOSED"],
        },
      },
    }),

    prisma.technicianAssignment.count({
      where: {
        deletedAt: null,
      },
    }),

    prisma.technicianAssignment.count({
      where: {
        deletedAt: null,
        status: {
          in: [
            "ASSIGNED",
            "ACCEPTED",
            "IN_PROGRESS",
          ],
        },
      },
    }),

    prisma.technicianAssignment.count({
      where: {
        deletedAt: null,
        status: "COMPLETED",
      },
    }),

    prisma.user.findMany({
      where: {
        deletedAt: null,
      },
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    }),

    prisma.unexpectedOutage.findMany({
      where: {
        deletedAt: null,
      },
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        area: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        reportedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
  ]);

  return {
    users: {
      total: totalUsers,
      active: activeUsers,
      blocked: blockedUsers,
      byRole: {
        admins: totalAdmins,
        technicians: totalTechnicians,
        customers: totalCustomers,
      },
    },

    schedules: {
      total: totalSchedules,
      active: activeSchedules,
    },

    outages: {
      total: totalOutages,
      active: activeOutages,
      resolved: resolvedOutages,
    },

    assignments: {
      total: totalAssignments,
      active: activeAssignments,
      completed: completedAssignments,
    },

    recent: {
      users: recentUsers,
      outages: recentOutages,
    },
  };
};

const getAuditLogs = async (
  query: IAuditLogQuery,
) => {
  const page = Math.max(Number(query.page) || 1, 1);

  const limit = Math.min(
    Math.max(Number(query.limit) || 10, 1),
    100,
  );

  const skip = (page - 1) * limit;

  const sortBy = allowedAuditSortFields.includes(
    query.sortBy as (typeof allowedAuditSortFields)[number],
  )
    ? query.sortBy!
    : "createdAt";

  const sortOrder: Prisma.SortOrder =
    query.sortOrder === "asc" ? "asc" : "desc";

  const where: Prisma.AuditLogWhereInput = {
    ...(query.userId && {
      userId: query.userId,
    }),

    ...(query.action && {
      action: {
        equals: query.action,
        mode: "insensitive",
      },
    }),

    ...(query.entityType && {
      entityType: {
        equals: query.entityType,
        mode: "insensitive",
      },
    }),

    ...(query.entityId && {
      entityId: query.entityId,
    }),

    ...(query.search && {
      OR: [
        {
          action: {
            contains: query.search,
            mode: "insensitive",
          },
        },
        {
          entityType: {
            contains: query.search,
            mode: "insensitive",
          },
        },
        {
          entityId: {
            contains: query.search,
            mode: "insensitive",
          },
        },
        {
          user: {
            name: {
              contains: query.search,
              mode: "insensitive",
            },
          },
        },
        {
          user: {
            email: {
              contains: query.search,
              mode: "insensitive",
            },
          },
        },
      ],
    }),
  };

  const [auditLogs, total] = await prisma.$transaction([
    prisma.auditLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            profileImage: true,
          },
        },
      },
    }),

    prisma.auditLog.count({
      where,
    }),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: auditLogs,
  };
};

export const AdminService = {
  getAllUsers,
  updateUserRole,
  getDashboardStats,
  getAuditLogs,
};
import { Prisma } from "../../../generated/prisma/client";
import { AssignmentStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/AppError";
import { IAssignmentQuery, ICreateTechnicianAssignment, IUpdateAssignmentStatus } from "./assignment.interface";



const assignmentInclude = {
  outage: {
    include: {
      area: true,
    },
  },
  technician: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      employeeId: true,
      skill: true,
      experienceYears: true,
      role: true,
      status: true,
    },
  },
  assignedBy: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  },
} satisfies Prisma.TechnicianAssignmentInclude;

const allowedSortFields = [
  "assignedAt",
  "createdAt",
  "updatedAt",
  "status",
] as const;

const statusTransitions: Record<
  AssignmentStatus,
  AssignmentStatus[]
> = {
  ASSIGNED: ["ACCEPTED", "REJECTED"],
  ACCEPTED: ["IN_PROGRESS"],
  REJECTED: [],
  IN_PROGRESS: ["COMPLETED"],
  COMPLETED: [],
};

const createAssignment = async (
  payload: ICreateTechnicianAssignment,
  assignedById: string,
) => {
  const [outage, technician, admin] = await Promise.all([
    prisma.unexpectedOutage.findFirst({
      where: {
        id: payload.outageId,
        deletedAt: null,
      },
      select: {
        id: true,
      },
    }),

    prisma.user.findFirst({
      where: {
        id: payload.technicianId,
        role: "TECHNICIAN",
        status: "ACTIVE",
        deletedAt: null,
      },
      select: {
        id: true,
      },
    }),

    prisma.user.findFirst({
      where: {
        id: assignedById,
        role: "ADMIN",
        status: "ACTIVE",
        deletedAt: null,
      },
      select: {
        id: true,
      },
    }),
  ]);

  if (!outage) {
    throw new AppError(404, "Unexpected outage not found");
  }

  if (!technician) {
    throw new AppError(
      404,
      "Active technician not found",
    );
  }

  if (!admin) {
    throw new AppError(403, "Only an active admin can assign technicians");
  }

  const existingAssignment =
    await prisma.technicianAssignment.findFirst({
      where: {
        outageId: payload.outageId,
        technicianId: payload.technicianId,
      },
    });

  if (existingAssignment && !existingAssignment.deletedAt) {
    throw new AppError(
      409,
      "This technician is already assigned to this outage",
    );
  }

  /*
   * Because of @@unique([outageId, technicianId]), a soft-deleted
   * assignment cannot be created again as a new row. Therefore,
   * restore the previous assignment when it exists.
   */
  if (existingAssignment?.deletedAt) {
    return prisma.technicianAssignment.update({
      where: {
        id: existingAssignment.id,
      },
      data: {
        assignedById,
        status: "ASSIGNED",
        notes: payload.notes,
        assignedAt: new Date(),
        acceptedAt: null,
        startedAt: null,
        completedAt: null,
        deletedAt: null,
      },
      include: assignmentInclude,
    });
  }

  return prisma.technicianAssignment.create({
    data: {
      outageId: payload.outageId,
      technicianId: payload.technicianId,
      assignedById,
      notes: payload.notes,
    },
    include: assignmentInclude,
  });
};

const getAllAssignments = async (
  query: IAssignmentQuery,
) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(
    Math.max(Number(query.limit) || 10, 1),
    100,
  );
  const skip = (page - 1) * limit;

  const sortBy = allowedSortFields.includes(
    query.sortBy as (typeof allowedSortFields)[number],
  )
    ? query.sortBy!
    : "createdAt";

  const sortOrder =
    query.sortOrder === "asc" ? "asc" : "desc";

  const where: Prisma.TechnicianAssignmentWhereInput = {
    deletedAt: null,
    ...(query.status && {
      status: query.status,
    }),
    ...(query.technicianId && {
      technicianId: query.technicianId,
    }),
    ...(query.outageId && {
      outageId: query.outageId,
    }),
    ...(query.assignedById && {
      assignedById: query.assignedById,
    }),
    ...(query.search && {
      OR: [
        {
          notes: {
            contains: query.search,
            mode: "insensitive",
          },
        },
        {
          technician: {
            name: {
              contains: query.search,
              mode: "insensitive",
            },
          },
        },
        {
          technician: {
            email: {
              contains: query.search,
              mode: "insensitive",
            },
          },
        },
      ],
    }),
  };

  const [assignments, total] = await prisma.$transaction([
    prisma.technicianAssignment.findMany({
      where,
      include: assignmentInclude,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
    }),

    prisma.technicianAssignment.count({
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
    data: assignments,
  };
};

const getMyAssignments = async (
  technicianId: string,
  query: IAssignmentQuery,
) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(
    Math.max(Number(query.limit) || 10, 1),
    100,
  );
  const skip = (page - 1) * limit;

  const sortBy = allowedSortFields.includes(
    query.sortBy as (typeof allowedSortFields)[number],
  )
    ? query.sortBy!
    : "assignedAt";

  const sortOrder =
    query.sortOrder === "asc" ? "asc" : "desc";

  const where: Prisma.TechnicianAssignmentWhereInput = {
    technicianId,
    deletedAt: null,
    ...(query.status && {
      status: query.status,
    }),
    ...(query.outageId && {
      outageId: query.outageId,
    }),
    ...(query.search && {
      OR: [
        {
          notes: {
            contains: query.search,
            mode: "insensitive",
          },
        },
        {
          outage: {
            description: {
              contains: query.search,
              mode: "insensitive",
            },
          },
        },
      ],
    }),
  };

  const [assignments, total] = await prisma.$transaction([
    prisma.technicianAssignment.findMany({
      where,
      include: assignmentInclude,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
    }),

    prisma.technicianAssignment.count({
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
    data: assignments,
  };
};

const getAssignmentById = async (
  id: string,
  requesterId: string,
  requesterRole: string,
) => {
  const assignment =
    await prisma.technicianAssignment.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: assignmentInclude,
    });

  if (!assignment) {
    throw new AppError(
      404,
      "Technician assignment not found",
    );
  }

  if (
    requesterRole !== "ADMIN" &&
    assignment.technicianId !== requesterId
  ) {
    throw new AppError(
      403,
      "You are not allowed to view this assignment",
    );
  }

  return assignment;
};

const updateAssignment = async (
  id: string,
  payload: {
    technicianId?: string;
    notes?: string | null;
  },
) => {
  const assignment =
    await prisma.technicianAssignment.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

  if (!assignment) {
    throw new AppError(
      404,
      "Technician assignment not found",
    );
  }

  if (
    payload.technicianId &&
    payload.technicianId !== assignment.technicianId
  ) {
    if (
      assignment.status === "IN_PROGRESS" ||
      assignment.status === "COMPLETED"
    ) {
      throw new AppError(
        400,
        "An in-progress or completed assignment cannot be reassigned",
      );
    }

    const technician = await prisma.user.findFirst({
      where: {
        id: payload.technicianId,
        role: "TECHNICIAN",
        status: "ACTIVE",
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });

    if (!technician) {
      throw new AppError(
        404,
        "Active technician not found",
      );
    }

    const duplicate =
      await prisma.technicianAssignment.findFirst({
        where: {
          outageId: assignment.outageId,
          technicianId: payload.technicianId,
          deletedAt: null,
          NOT: {
            id,
          },
        },
      });

    if (duplicate) {
      throw new AppError(
        409,
        "This technician is already assigned to the outage",
      );
    }
  }

  return prisma.technicianAssignment.update({
    where: {
      id,
    },
    data: {
      ...(payload.technicianId && {
        technicianId: payload.technicianId,
        status: "ASSIGNED",
        assignedAt: new Date(),
        acceptedAt: null,
        startedAt: null,
        completedAt: null,
      }),
      ...(payload.notes !== undefined && {
        notes: payload.notes,
      }),
    },
    include: assignmentInclude,
  });
};

const updateAssignmentStatus = async (
  id: string,
  technicianId: string,
  payload: IUpdateAssignmentStatus,
) => {
  const assignment =
    await prisma.technicianAssignment.findFirst({
      where: {
        id,
        technicianId,
        deletedAt: null,
      },
    });

  if (!assignment) {
    throw new AppError(
      404,
      "Assignment not found or it does not belong to you",
    );
  }

  if (assignment.status === payload.status) {
    throw new AppError(
      400,
      `Assignment is already ${payload.status}`,
    );
  }

  const allowedNextStatuses =
    statusTransitions[assignment.status];

  if (!allowedNextStatuses.includes(payload.status)) {
    throw new AppError(
      400,
      `Cannot change assignment status from ${assignment.status} to ${payload.status}`,
    );
  }

  const now = new Date();

  const statusTimestamp: Prisma.TechnicianAssignmentUpdateInput =
    {};

  if (payload.status === "ACCEPTED") {
    statusTimestamp.acceptedAt = now;
  }

  if (payload.status === "IN_PROGRESS") {
    statusTimestamp.startedAt = now;
  }

  if (payload.status === "COMPLETED") {
    statusTimestamp.completedAt = now;
  }

  return prisma.technicianAssignment.update({
    where: {
      id,
    },
    data: {
      status: payload.status,
      ...(payload.notes !== undefined && {
        notes: payload.notes,
      }),
      ...statusTimestamp,
    },
    include: assignmentInclude,
  });
};

const deleteAssignment = async (id: string) => {
  const assignment =
    await prisma.technicianAssignment.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

  if (!assignment) {
    throw new AppError(
      404,
      "Technician assignment not found",
    );
  }

  if (assignment.status === "IN_PROGRESS") {
    throw new AppError(
      400,
      "An in-progress assignment cannot be deleted",
    );
  }

  if (assignment.status === "COMPLETED") {
    throw new AppError(
      400,
      "A completed assignment cannot be deleted",
    );
  }

  return prisma.technicianAssignment.update({
    where: {
      id,
    },
    data: {
      deletedAt: new Date(),
    },
  });
};

export const TechnicianAssignmentService = {
  createAssignment,
  getAllAssignments,
  getMyAssignments,
  getAssignmentById,
  updateAssignment,
  updateAssignmentStatus,
  deleteAssignment,
};
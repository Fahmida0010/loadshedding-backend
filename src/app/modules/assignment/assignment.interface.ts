import type { AssignmentStatus } from "../../../generated/prisma/enums";

export interface ICreateTechnicianAssignment {
  outageId: string;
  technicianId: string;
  notes?: string;
}

export interface IUpdateAssignmentStatus {
  status: AssignmentStatus;
  notes?: string;
}

export interface IAssignmentQuery {
  page?: string;
  limit?: string;
  status?: AssignmentStatus;
  technicianId?: string;
  outageId?: string;
  assignedById?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
import type {
  UserRole,
  UserStatus,
} from "../../../generated/prisma/enums";

export interface IUserQuery {
  page?: string;
  limit?: string;
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  areaId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface IUpdateUserRole {
  role: UserRole;
}

export interface IAuditLogQuery {
  page?: string;
  limit?: string;
  search?: string;
  userId?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
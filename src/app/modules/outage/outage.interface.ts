export type TPriority =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "URGENT";

export type TOutageStatus =
  | "REPORTED"
  | "CONFIRMED"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED"
  | "CANCELLED";

export interface ICreateOutage {
  areaId: string;
  title: string;
  description?: string;
  reason?: string;
  priority?: TPriority;
  estimatedRestoreAt?: string | Date;
}

export interface IUpdateOutage {
  areaId?: string;
  title?: string;
  description?: string | null;
  reason?: string | null;
  priority?: TPriority;
  estimatedRestoreAt?: string | Date | null;
}

export interface IUpdateOutageStatus {
  status: TOutageStatus;
  reason?: string;
  estimatedRestoreAt?: string | Date | null;
}

export interface IOutageQuery {
  searchTerm?: string;
  areaId?: string;
  reportedById?: string;
  priority?: TPriority;
  status?: TOutageStatus;
  reportedFrom?: string;
  reportedTo?: string;
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
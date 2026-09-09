export type TAreaPriority =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "URGENT";

export interface ICreateArea {
  feederId: string;
  name: string;
  code: string;
  location?: string;
  population?: number;
  priority?: TAreaPriority;
}

export interface IUpdateArea {
  feederId?: string;
  name?: string;
  code?: string;
  location?: string | null;
  population?: number | null;
  priority?: TAreaPriority;
}

export interface IAreaQuery {
  searchTerm?: string;
  feederId?: string;
  priority?: TAreaPriority;
  page?: string;
  limit?: string;
}
export type TPriority =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "URGENT";

export interface ICreateFeeder {
  substationId: string;
  name: string;
  code: string;
  capacityMw?: number;
  priority?: TPriority;
}

export interface IUpdateFeeder {
  substationId?: string;
  name?: string;
  code?: string;
  capacityMw?: number | null;
  priority?: TPriority;
}

export interface IFeederQuery {
  searchTerm?: string;
  substationId?: string;
  priority?: TPriority;
  page?: string;
  limit?: string;
}
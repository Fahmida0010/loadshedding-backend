export interface ICreateSubstation {
  zoneId: string;
  name: string;
  code: string;
  location?: string;
  capacityMw?: number;
  voltageLevel?: string;
}

export interface IUpdateSubstation {
  zoneId?: string;
  name?: string;
  code?: string;
  location?: string;
  capacityMw?: number;
  voltageLevel?: string;
}

export interface ISubstationQuery {
  searchTerm?: string;
  zoneId?: string;
  page?: string;
  limit?: string;
}
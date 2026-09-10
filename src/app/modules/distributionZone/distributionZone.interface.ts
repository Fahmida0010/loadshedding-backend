export interface ICreateDistributionZone {
	name: string;
	code: string;
	description?: string;
}

export interface IUpdateDistributionZone {
	name?: string;
	code?: string;
	description?: string | null;
}

export interface IDistributionZoneQuery {
	searchTerm?: string;
	page?: string;
	limit?: string;
	sortBy?: "name" | "code" | "createdAt" | "updatedAt";
	sortOrder?: "asc" | "desc";
}

export interface IPaginationMeta {
	page: number;
	limit: number;
	total: number;
	totalPage: number;
}

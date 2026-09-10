export interface ICreateSchedule {
	areaId: string;
	title: string;
	description?: string;
	type?: "LOAD_SHEDDING" | "PLANNED_OUTAGE";
	priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
	scheduledStart: string | Date;
	scheduledEnd: string | Date;
	isRecurring?: boolean;
	recurrenceRule?: string;
	status?: "SCHEDULED" | "ACTIVE" | "COMPLETED" | "CANCELLED";
}

export interface IUpdateSchedule {
	areaId?: string;
	title?: string;
	description?: string | null;
	type?: "LOAD_SHEDDING" | "PLANNED_OUTAGE";
	priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
	scheduledStart?: string | Date;
	scheduledEnd?: string | Date;
	isRecurring?: boolean;
	recurrenceRule?: string | null;
	status?: "SCHEDULED" | "ACTIVE" | "COMPLETED" | "CANCELLED";
}

export interface IScheduleQuery {
	searchTerm?: string;
	areaId?: string;
	type?: string;
	priority?: string;
	status?: string;
	startDate?: string;
	endDate?: string;
	page?: string;
	limit?: string;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
}

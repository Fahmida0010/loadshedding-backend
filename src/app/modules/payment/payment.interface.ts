export interface IInitiatePaymentPayload {
	billId: string;
}

export interface ISSLCCommerzCallback {
	val_id?: string;
	tran_id?: string;
	status?: string;
	amount?: string;
	card_type?: string;
	bank_tran_id?: string;
	card_issuer?: string;
	error?: string;
}

export interface IAuthenticatedUser {
	userId: string;
	email: string;
	role: "ADMIN" | "TECHNICIAN" | "CUSTOMER";
}

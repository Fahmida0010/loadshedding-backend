import type { UserRole } from "../../../generated/prisma/enums";

export interface IRegisterUser {
	name: string;
	email: string;
	password: string;
	phone?: string;
	areaId?: string;
	role?: UserRole;
}

export interface ILoginUser {
	email: string;
	password: string;
}

export interface IGoogleLogin {
	idToken: string;
}

export interface IUpdateProfile {
	name?: string;
	phone?: string | null;
	profileImage?: string | null;
	areaId?: string | null;
}

export interface IChangePassword {
	currentPassword: string;
	newPassword: string;
}

export interface IRefreshToken {
	refreshToken?: string;
}

export interface IJwtPayload {
	userId: string;
	email: string;
	role: UserRole;
}

export interface IRefreshTokenPayload {
	userId: string;
	tokenId: string;
	type: "refresh";
}

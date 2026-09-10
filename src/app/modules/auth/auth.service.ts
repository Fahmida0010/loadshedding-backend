import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import jwt, { type SignOptions } from "jsonwebtoken";

import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/AppError";
import type {
	IChangePassword,
	IGoogleLogin,
	IJwtPayload,
	ILoginUser,
	IRefreshTokenPayload,
	IRegisterUser,
	IUpdateProfile,
} from "./auth.interface";

const getRequiredEnv = (name: string): string => {
	const value = process.env[name];

	if (!value) {
		throw new Error(`${name} is missing from the .env file`);
	}

	return value;
};

const JWT_ACCESS_SECRET = getRequiredEnv("JWT_ACCESS_SECRET");

const JWT_REFRESH_SECRET = getRequiredEnv("JWT_REFRESH_SECRET");

const GOOGLE_CLIENT_ID = getRequiredEnv("GOOGLE_CLIENT_ID");

const JWT_ACCESS_EXPIRES_IN = (process.env.JWT_ACCESS_EXPIRES_IN ??
	"15m") as SignOptions["expiresIn"];

const JWT_REFRESH_EXPIRES_IN = (process.env.JWT_REFRESH_EXPIRES_IN ??
	"30d") as SignOptions["expiresIn"];

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

const userSelect = {
	id: true,
	name: true,
	email: true,
	phone: true,
	profileImage: true,
	role: true,
	status: true,
	areaId: true,
	authProvider: true,
	createdAt: true,
	updatedAt: true,
} as const;

const hashToken = (token: string): string => {
	return crypto.createHash("sha256").update(token).digest("hex");
};

const generateAccessToken = (payload: IJwtPayload): string => {
	return jwt.sign(payload, JWT_ACCESS_SECRET, {
		expiresIn: JWT_ACCESS_EXPIRES_IN,
	});
};

const generateRefreshToken = (userId: string, tokenId: string): string => {
	const payload: IRefreshTokenPayload = {
		userId,
		tokenId,
		type: "refresh",
	};

	return jwt.sign(payload, JWT_REFRESH_SECRET, {
		expiresIn: JWT_REFRESH_EXPIRES_IN,
	});
};

const verifyRefreshToken = (token: string): IRefreshTokenPayload => {
	try {
		return jwt.verify(token, JWT_REFRESH_SECRET) as IRefreshTokenPayload;
	} catch {
		throw new AppError(401, "Invalid or expired refresh token");
	}
};

const getTokenExpirationDate = (token: string): Date => {
	const decodedToken = jwt.decode(token);

	if (!decodedToken || typeof decodedToken === "string" || !decodedToken.exp) {
		throw new AppError(500, "Could not determine token expiration");
	}

	return new Date(decodedToken.exp * 1000);
};

const createAuthTokens = async (user: {
	id: string;
	email: string;
	role: "ADMIN" | "TECHNICIAN" | "CUSTOMER";
}) => {
	const accessTokenPayload: IJwtPayload = {
		userId: user.id,
		email: user.email,
		role: user.role,
	};

	const tokenId = crypto.randomUUID();

	const accessToken = generateAccessToken(accessTokenPayload);

	const refreshToken = generateRefreshToken(user.id, tokenId);

	await prisma.refreshToken.create({
		data: {
			userId: user.id,
			token: hashToken(refreshToken),
			expiresAt: getTokenExpirationDate(refreshToken),
		},
	});

	return {
		accessToken,
		refreshToken,
	};
};

const registerUser = async (payload: IRegisterUser) => {
	const email = payload.email.toLowerCase();

	const existingUser = await prisma.user.findUnique({
		where: {
			email,
		},
	});

	if (existingUser) {
		throw new AppError(409, "An account already exists with this email");
	}

	if (payload.phone) {
		const existingPhone = await prisma.user.findUnique({
			where: {
				phone: payload.phone,
			},
		});

		if (existingPhone) {
			throw new AppError(
				409,
				"An account already exists with this phone number",
			);
		}
	}

	if (payload.areaId) {
		const area = await prisma.area.findFirst({
			where: {
				id: payload.areaId,
				deletedAt: null,
			},
			select: {
				id: true,
			},
		});

		if (!area) {
			throw new AppError(404, "Area not found");
		}
	}

	const hashedPassword = await bcrypt.hash(payload.password, 12);

	const user = await prisma.user.create({
		data: {
			name: payload.name,
			email,
			password: hashedPassword,
			phone: payload.phone,
			areaId: payload.areaId,
			role: payload.role ?? "CUSTOMER",
			authProvider: "LOCAL",
		},
		select: userSelect,
	});

	const tokens = await createAuthTokens(user);

	return {
		user,
		...tokens,
	};
};

const loginUser = async (payload: ILoginUser) => {
	const email = payload.email.toLowerCase();

	const userAccount = await prisma.user.findUnique({
		where: {
			email,
		},
	});

	if (!userAccount?.password) {
		throw new AppError(401, "Invalid email or password");
	}

	const isPasswordMatched = await bcrypt.compare(
		payload.password,
		userAccount.password,
	);

	if (!isPasswordMatched) {
		throw new AppError(401, "Invalid email or password");
	}

	if (userAccount.status === "BLOCKED") {
		throw new AppError(403, "Your account has been blocked");
	}

	if (userAccount.status === "INACTIVE") {
		throw new AppError(403, "Your account is inactive");
	}

	if (userAccount.deletedAt) {
		throw new AppError(403, "Your account is unavailable");
	}

	const user = await prisma.user.findUniqueOrThrow({
		where: {
			id: userAccount.id,
		},
		select: userSelect,
	});

	const tokens = await createAuthTokens(user);

	return {
		user,
		...tokens,
	};
};

const loginWithGoogle = async (payload: IGoogleLogin) => {
	let googlePayload;

	try {
		const ticket = await googleClient.verifyIdToken({
			idToken: payload.idToken,
			audience: GOOGLE_CLIENT_ID,
		});

		googlePayload = ticket.getPayload();
	} catch {
		throw new AppError(401, "Invalid Google ID token");
	}

	if (
		!googlePayload?.sub ||
		!googlePayload.email ||
		!googlePayload.email_verified
	) {
		throw new AppError(401, "Google email could not be verified");
	}

	const email = googlePayload.email.toLowerCase();

	const existingUser = await prisma.user.findUnique({
		where: {
			email,
		},
	});

	if (existingUser?.deletedAt) {
		throw new AppError(403, "Your account is unavailable");
	}

	if (existingUser?.status === "BLOCKED") {
		throw new AppError(403, "Your account has been blocked");
	}

	if (existingUser?.status === "INACTIVE") {
		throw new AppError(403, "Your account is inactive");
	}

	let user;

	if (!existingUser) {
		user = await prisma.user.create({
			data: {
				name: googlePayload.name ?? email.split("@")[0],
				email,
				password: null,
				googleId: googlePayload.sub,
				profileImage: googlePayload.picture,
				authProvider: "GOOGLE",
				role: "CUSTOMER",
			},
			select: userSelect,
		});
	} else {
		user = await prisma.user.update({
			where: {
				id: existingUser.id,
			},
			data: {
				googleId: googlePayload.sub,
				profileImage: existingUser.profileImage ?? googlePayload.picture,
			},
			select: userSelect,
		});
	}

	const tokens = await createAuthTokens(user);

	return {
		user,
		...tokens,
	};
};

const refreshAccessToken = async (rawRefreshToken: string) => {
	const decodedToken = verifyRefreshToken(rawRefreshToken);

	if (decodedToken.type !== "refresh") {
		throw new AppError(401, "Invalid refresh token");
	}

	const storedToken = await prisma.refreshToken.findUnique({
		where: {
			token: hashToken(rawRefreshToken),
		},
		include: {
			user: true,
		},
	});

	if (!storedToken) {
		throw new AppError(401, "Refresh token was not found");
	}

	if (storedToken.revoked) {
		throw new AppError(401, "Refresh token has already been used");
	}

	if (storedToken.expiresAt <= new Date()) {
		throw new AppError(401, "Refresh token has expired");
	}

	if (storedToken.user.status !== "ACTIVE") {
		throw new AppError(403, "User account is unavailable");
	}

	if (storedToken.user.deletedAt) {
		throw new AppError(403, "User account has been deleted");
	}

	await prisma.refreshToken.update({
		where: {
			id: storedToken.id,
		},
		data: {
			revoked: true,
		},
	});

	const tokens = await createAuthTokens({
		id: storedToken.user.id,
		email: storedToken.user.email,
		role: storedToken.user.role,
	});

	return tokens;
};

const logoutUser = async (rawRefreshToken?: string): Promise<void> => {
	if (!rawRefreshToken) {
		return;
	}

	await prisma.refreshToken.updateMany({
		where: {
			token: hashToken(rawRefreshToken),
			revoked: false,
		},
		data: {
			revoked: true,
		},
	});
};

const getCurrentUser = async (userId: string) => {
	const user = await prisma.user.findFirst({
		where: {
			id: userId,
			deletedAt: null,
		},
		select: userSelect,
	});

	if (!user) {
		throw new AppError(404, "User not found");
	}

	return user;
};

const updateProfile = async (userId: string, payload: IUpdateProfile) => {
	const existingUser = await prisma.user.findFirst({
		where: {
			id: userId,
			deletedAt: null,
		},
		select: {
			id: true,
		},
	});

	if (!existingUser) {
		throw new AppError(404, "User not found");
	}

	if (payload.areaId) {
		const area = await prisma.area.findFirst({
			where: {
				id: payload.areaId,
				deletedAt: null,
			},
			select: {
				id: true,
			},
		});

		if (!area) {
			throw new AppError(404, "Area not found");
		}
	}

	const updatedUser = await prisma.user.update({
		where: {
			id: userId,
		},
		data: {
			name: payload.name,
			phone: payload.phone,
			profileImage: payload.profileImage,
			areaId: payload.areaId,
		},
		select: userSelect,
	});

	return updatedUser;
};

const changePassword = async (
	userId: string,
	payload: IChangePassword,
): Promise<void> => {
	const user = await prisma.user.findFirst({
		where: {
			id: userId,
			deletedAt: null,
		},
	});

	if (!user) {
		throw new AppError(404, "User not found");
	}

	if (!user.password) {
		throw new AppError(
			400,
			"This account uses Google login. Set a password first.",
		);
	}

	const isCurrentPasswordMatched = await bcrypt.compare(
		payload.currentPassword,
		user.password,
	);

	if (!isCurrentPasswordMatched) {
		throw new AppError(401, "Current password is incorrect");
	}

	const isSamePassword = await bcrypt.compare(
		payload.newPassword,
		user.password,
	);

	if (isSamePassword) {
		throw new AppError(
			400,
			"New password must be different from current password",
		);
	}

	const hashedPassword = await bcrypt.hash(payload.newPassword, 12);

	await prisma.$transaction([
		prisma.user.update({
			where: {
				id: userId,
			},
			data: {
				password: hashedPassword,
				authProvider: "LOCAL",
			},
		}),

		prisma.refreshToken.updateMany({
			where: {
				userId,
				revoked: false,
			},
			data: {
				revoked: true,
			},
		}),
	]);
};

export const AuthService = {
	registerUser,
	loginUser,
	loginWithGoogle,
	refreshAccessToken,
	logoutUser,
	getCurrentUser,
	updateProfile,
	changePassword,
};

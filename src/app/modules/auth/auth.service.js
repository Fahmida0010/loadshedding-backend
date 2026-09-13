"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const node_crypto_1 = __importDefault(require("node:crypto"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const google_auth_library_1 = require("google-auth-library");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../../config/prisma");
const AppError_1 = require("../../utils/AppError");
const getRequiredEnv = (name) => {
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
    "15m");
const JWT_REFRESH_EXPIRES_IN = (process.env.JWT_REFRESH_EXPIRES_IN ??
    "30d");
const googleClient = new google_auth_library_1.OAuth2Client(GOOGLE_CLIENT_ID);
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
};
const hashToken = (token) => {
    return node_crypto_1.default.createHash("sha256").update(token).digest("hex");
};
const generateAccessToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, JWT_ACCESS_SECRET, {
        expiresIn: JWT_ACCESS_EXPIRES_IN,
    });
};
const generateRefreshToken = (userId, tokenId) => {
    const payload = {
        userId,
        tokenId,
        type: "refresh",
    };
    return jsonwebtoken_1.default.sign(payload, JWT_REFRESH_SECRET, {
        expiresIn: JWT_REFRESH_EXPIRES_IN,
    });
};
const verifyRefreshToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, JWT_REFRESH_SECRET);
    }
    catch {
        throw new AppError_1.AppError(401, "Invalid or expired refresh token");
    }
};
const getTokenExpirationDate = (token) => {
    const decodedToken = jsonwebtoken_1.default.decode(token);
    if (!decodedToken || typeof decodedToken === "string" || !decodedToken.exp) {
        throw new AppError_1.AppError(500, "Could not determine token expiration");
    }
    return new Date(decodedToken.exp * 1000);
};
const createAuthTokens = async (user) => {
    const accessTokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
    };
    const tokenId = node_crypto_1.default.randomUUID();
    const accessToken = generateAccessToken(accessTokenPayload);
    const refreshToken = generateRefreshToken(user.id, tokenId);
    await prisma_1.prisma.refreshToken.create({
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
const registerUser = async (payload) => {
    const email = payload.email.toLowerCase();
    const existingUser = await prisma_1.prisma.user.findUnique({
        where: {
            email,
        },
    });
    if (existingUser) {
        throw new AppError_1.AppError(409, "An account already exists with this email");
    }
    if (payload.phone) {
        const existingPhone = await prisma_1.prisma.user.findUnique({
            where: {
                phone: payload.phone,
            },
        });
        if (existingPhone) {
            throw new AppError_1.AppError(409, "An account already exists with this phone number");
        }
    }
    if (payload.areaId) {
        const area = await prisma_1.prisma.area.findFirst({
            where: {
                id: payload.areaId,
                deletedAt: null,
            },
            select: {
                id: true,
            },
        });
        if (!area) {
            throw new AppError_1.AppError(404, "Area not found");
        }
    }
    const hashedPassword = await bcryptjs_1.default.hash(payload.password, 12);
    const user = await prisma_1.prisma.user.create({
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
const loginUser = async (payload) => {
    const email = payload.email.toLowerCase();
    const userAccount = await prisma_1.prisma.user.findUnique({
        where: {
            email,
        },
    });
    if (!userAccount?.password) {
        throw new AppError_1.AppError(401, "Invalid email or password");
    }
    const isPasswordMatched = await bcryptjs_1.default.compare(payload.password, userAccount.password);
    if (!isPasswordMatched) {
        throw new AppError_1.AppError(401, "Invalid email or password");
    }
    if (userAccount.status === "BLOCKED") {
        throw new AppError_1.AppError(403, "Your account has been blocked");
    }
    if (userAccount.status === "INACTIVE") {
        throw new AppError_1.AppError(403, "Your account is inactive");
    }
    if (userAccount.deletedAt) {
        throw new AppError_1.AppError(403, "Your account is unavailable");
    }
    const user = await prisma_1.prisma.user.findUniqueOrThrow({
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
const loginWithGoogle = async (payload) => {
    let googlePayload;
    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: payload.idToken,
            audience: GOOGLE_CLIENT_ID,
        });
        googlePayload = ticket.getPayload();
    }
    catch {
        throw new AppError_1.AppError(401, "Invalid Google ID token");
    }
    if (!googlePayload?.sub ||
        !googlePayload.email ||
        !googlePayload.email_verified) {
        throw new AppError_1.AppError(401, "Google email could not be verified");
    }
    const email = googlePayload.email.toLowerCase();
    const existingUser = await prisma_1.prisma.user.findUnique({
        where: {
            email,
        },
    });
    if (existingUser?.deletedAt) {
        throw new AppError_1.AppError(403, "Your account is unavailable");
    }
    if (existingUser?.status === "BLOCKED") {
        throw new AppError_1.AppError(403, "Your account has been blocked");
    }
    if (existingUser?.status === "INACTIVE") {
        throw new AppError_1.AppError(403, "Your account is inactive");
    }
    let user;
    if (!existingUser) {
        user = await prisma_1.prisma.user.create({
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
    }
    else {
        user = await prisma_1.prisma.user.update({
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
const refreshAccessToken = async (rawRefreshToken) => {
    const decodedToken = verifyRefreshToken(rawRefreshToken);
    if (decodedToken.type !== "refresh") {
        throw new AppError_1.AppError(401, "Invalid refresh token");
    }
    const storedToken = await prisma_1.prisma.refreshToken.findUnique({
        where: {
            token: hashToken(rawRefreshToken),
        },
        include: {
            user: true,
        },
    });
    if (!storedToken) {
        throw new AppError_1.AppError(401, "Refresh token was not found");
    }
    if (storedToken.revoked) {
        throw new AppError_1.AppError(401, "Refresh token has already been used");
    }
    if (storedToken.expiresAt <= new Date()) {
        throw new AppError_1.AppError(401, "Refresh token has expired");
    }
    if (storedToken.user.status !== "ACTIVE") {
        throw new AppError_1.AppError(403, "User account is unavailable");
    }
    if (storedToken.user.deletedAt) {
        throw new AppError_1.AppError(403, "User account has been deleted");
    }
    await prisma_1.prisma.refreshToken.update({
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
const logoutUser = async (rawRefreshToken) => {
    if (!rawRefreshToken) {
        return;
    }
    await prisma_1.prisma.refreshToken.updateMany({
        where: {
            token: hashToken(rawRefreshToken),
            revoked: false,
        },
        data: {
            revoked: true,
        },
    });
};
const getCurrentUser = async (userId) => {
    const user = await prisma_1.prisma.user.findFirst({
        where: {
            id: userId,
            deletedAt: null,
        },
        select: userSelect,
    });
    if (!user) {
        throw new AppError_1.AppError(404, "User not found");
    }
    return user;
};
const updateProfile = async (userId, payload) => {
    const existingUser = await prisma_1.prisma.user.findFirst({
        where: {
            id: userId,
            deletedAt: null,
        },
        select: {
            id: true,
        },
    });
    if (!existingUser) {
        throw new AppError_1.AppError(404, "User not found");
    }
    if (payload.areaId) {
        const area = await prisma_1.prisma.area.findFirst({
            where: {
                id: payload.areaId,
                deletedAt: null,
            },
            select: {
                id: true,
            },
        });
        if (!area) {
            throw new AppError_1.AppError(404, "Area not found");
        }
    }
    const updatedUser = await prisma_1.prisma.user.update({
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
const changePassword = async (userId, payload) => {
    const user = await prisma_1.prisma.user.findFirst({
        where: {
            id: userId,
            deletedAt: null,
        },
    });
    if (!user) {
        throw new AppError_1.AppError(404, "User not found");
    }
    if (!user.password) {
        throw new AppError_1.AppError(400, "This account uses Google login. Set a password first.");
    }
    const isCurrentPasswordMatched = await bcryptjs_1.default.compare(payload.currentPassword, user.password);
    if (!isCurrentPasswordMatched) {
        throw new AppError_1.AppError(401, "Current password is incorrect");
    }
    const isSamePassword = await bcryptjs_1.default.compare(payload.newPassword, user.password);
    if (isSamePassword) {
        throw new AppError_1.AppError(400, "New password must be different from current password");
    }
    const hashedPassword = await bcryptjs_1.default.hash(payload.newPassword, 12);
    await prisma_1.prisma.$transaction([
        prisma_1.prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                password: hashedPassword,
                authProvider: "LOCAL",
            },
        }),
        prisma_1.prisma.refreshToken.updateMany({
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
exports.AuthService = {
    registerUser,
    loginUser,
    loginWithGoogle,
    refreshAccessToken,
    logoutUser,
    getCurrentUser,
    updateProfile,
    changePassword,
};

import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { prisma } from "../../config/prisma.js";
import { redis } from "../../config/redis.js";
import { AppError } from "../../errors/AppError.js";
import type {
  IChangePassword,
  IGoogleLogin,
  IJwtPayload,
  ILoginUser,
  IRefreshTokenPayload,
  IRegisterUser,
} from "./auth.interface.js";

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

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
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  });
};

const generateRefreshToken = (
  userId: string,
  tokenId: string,
): string => {
  const payload: IRefreshTokenPayload = {
    userId,
    tokenId,
    type: "refresh",
  };

  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  });
};

const verifyRefreshToken = (
  token: string,
): IRefreshTokenPayload => {
  try {
    return jwt.verify(
      token,
      env.JWT_REFRESH_SECRET,
    ) as IRefreshTokenPayload;
  } catch {
    throw new AppError(401, "Invalid or expired refresh token");
  }
};

const getTokenExpirationDate = (token: string): Date => {
  const decodedToken = jwt.decode(token);

  if (
    !decodedToken ||
    typeof decodedToken === "string" ||
    !decodedToken.exp
  ) {
    throw new AppError(500, "Could not determine token expiration");
  }

  return new Date(decodedToken.exp * 1000);
};

const cacheUser = async (user: {
  id: string;
  [key: string]: unknown;
}): Promise<void> => {
  try {
    await redis.set(
      `auth:user:${user.id}`,
      JSON.stringify(user),
      "EX",
      300,
    );
  } catch (error) {
    console.error("Redis user cache error:", error);
  }
};

const removeCachedUser = async (userId: string): Promise<void> => {
  try {
    await redis.del(`auth:user:${userId}`);
  } catch (error) {
    console.error("Redis cache deletion error:", error);
  }
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

      // Database-এ raw refresh token রাখা হচ্ছে না।
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
      role: "CUSTOMER",
      authProvider: "LOCAL",
    },
    select: userSelect,
  });

  await cacheUser(user);

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

  await cacheUser(user);

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
      audience: env.GOOGLE_CLIENT_ID,
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

  let user = await prisma.user.findUnique({
    where: {
      email,
    },
    select: userSelect,
  });

  if (!user) {
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
    if (user.status === "BLOCKED") {
      throw new AppError(403, "Your account has been blocked");
    }

    if (user.status === "INACTIVE") {
      throw new AppError(403, "Your account is inactive");
    }

    user = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        googleId: googlePayload.sub,
        profileImage:
          user.profileImage ?? googlePayload.picture,
      },
      select: userSelect,
    });
  }

  await cacheUser(user);

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

  /*
   * পুরোনো refresh token revoke করে নতুন token তৈরি করা হচ্ছে।
   * এটিই refresh-token rotation।
   */
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

const logoutUser = async (
  rawRefreshToken?: string,
): Promise<void> => {
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
  try {
    const cachedUser = await redis.get(`auth:user:${userId}`);

    if (cachedUser) {
      return JSON.parse(cachedUser);
    }
  } catch (error) {
    console.error("Redis cache read error:", error);
  }

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

  await cacheUser(user);

  return user;
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

  const hashedPassword = await bcrypt.hash(
    payload.newPassword,
    12,
  );

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

    /*
     * Password পরিবর্তনের পর user-এর সব login session
     * revoke করা হচ্ছে।
     */
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

  await removeCachedUser(userId);
};

export const AuthService = {
  registerUser,
  loginUser,
  loginWithGoogle,
  refreshAccessToken,
  logoutUser,
  getCurrentUser,
  changePassword,
};
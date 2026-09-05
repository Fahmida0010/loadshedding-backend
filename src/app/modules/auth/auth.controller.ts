import type { Request, Response } from "express";
import { env } from "../../config/env.js";
import { AppError } from "../../errors/AppError.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { AuthService } from "./auth.service.js";

const refreshCookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite:
    env.NODE_ENV === "production"
      ? ("none" as const)
      : ("lax" as const),
  maxAge: env.REFRESH_TOKEN_COOKIE_DAYS * 24 * 60 * 60 * 1000,
  path: "/api/v1/auth",
};

const getRefreshTokenFromRequest = (
  req: Request,
): string | undefined => {
  return req.cookies?.refreshToken ?? req.body?.refreshToken;
};

const registerUser = catchAsync(
  async (req: Request, res: Response) => {
    const result = await AuthService.registerUser(req.body);

    res.cookie(
      "refreshToken",
      result.refreshToken,
      refreshCookieOptions,
    );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "User registered successfully",
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  },
);

const loginUser = catchAsync(
  async (req: Request, res: Response) => {
    const result = await AuthService.loginUser(req.body);

    res.cookie(
      "refreshToken",
      result.refreshToken,
      refreshCookieOptions,
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Logged in successfully",
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  },
);

const loginWithGoogle = catchAsync(
  async (req: Request, res: Response) => {
    const result = await AuthService.loginWithGoogle(req.body);

    res.cookie(
      "refreshToken",
      result.refreshToken,
      refreshCookieOptions,
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Google login successful",
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  },
);

const refreshAccessToken = catchAsync(
  async (req: Request, res: Response) => {
    const refreshToken = getRefreshTokenFromRequest(req);

    if (!refreshToken) {
      throw new AppError(401, "Refresh token is required");
    }

    const result =
      await AuthService.refreshAccessToken(refreshToken);

    res.cookie(
      "refreshToken",
      result.refreshToken,
      refreshCookieOptions,
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Access token generated successfully",
      data: {
        accessToken: result.accessToken,
      },
    });
  },
);

const logoutUser = catchAsync(
  async (req: Request, res: Response) => {
    const refreshToken = getRefreshTokenFromRequest(req);

    await AuthService.logoutUser(refreshToken);

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite:
        env.NODE_ENV === "production"
          ? ("none" as const)
          : ("lax" as const),
      path: "/api/v1/auth",
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Logged out successfully",
      data: null,
    });
  },
);

const getCurrentUser = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError(401, "Authentication is required");
    }

    const result = await AuthService.getCurrentUser(
      req.user.userId,
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Current user retrieved successfully",
      data: result,
    });
  },
);

const changePassword = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError(401, "Authentication is required");
    }

    await AuthService.changePassword(
      req.user.userId,
      req.body,
    );

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite:
        env.NODE_ENV === "production"
          ? ("none" as const)
          : ("lax" as const),
      path: "/api/v1/auth",
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message:
        "Password changed successfully. Please log in again.",
      data: null,
    });
  },
);

export const AuthController = {
  registerUser,
  loginUser,
  loginWithGoogle,
  refreshAccessToken,
  logoutUser,
  getCurrentUser,
  changePassword,
};
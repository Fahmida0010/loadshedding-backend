"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const AppError_1 = require("../../utils/AppError");
const catchAsyc_1 = require("../../utils/catchAsyc");
const sendResponse_1 = require("../../utils/sendResponse");
const auth_service_1 = require("./auth.service");
const refreshCookieOptions = {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: Number(process.env.REFRESH_TOKEN_COOKIE_DAYS || 7) * 24 * 60 * 60 * 1000,
    path: "/",
};
const getRefreshTokenFromRequest = (req) => {
    return req.cookies?.refreshToken ?? req.body?.refreshToken;
};
const registerUser = (0, catchAsyc_1.catchAsync)(async (req, res) => {
    const result = await auth_service_1.AuthService.registerUser(req.body);
    res.cookie("refreshToken", result.refreshToken, refreshCookieOptions);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 201,
        success: true,
        message: "User registered successfully",
        data: {
            user: result.user,
            accessToken: result.accessToken,
        },
    });
});
const loginUser = (0, catchAsyc_1.catchAsync)(async (req, res) => {
    const result = await auth_service_1.AuthService.loginUser(req.body);
    res.cookie("refreshToken", result.refreshToken, refreshCookieOptions);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Logged in successfully",
        data: {
            user: result.user,
            accessToken: result.accessToken,
        },
    });
});
const loginWithGoogle = (0, catchAsyc_1.catchAsync)(async (req, res) => {
    const result = await auth_service_1.AuthService.loginWithGoogle(req.body);
    res.cookie("refreshToken", result.refreshToken, refreshCookieOptions);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Google login successful",
        data: {
            user: result.user,
            accessToken: result.accessToken,
        },
    });
});
const refreshAccessToken = (0, catchAsyc_1.catchAsync)(async (req, res) => {
    const refreshToken = getRefreshTokenFromRequest(req);
    if (!refreshToken) {
        throw new AppError_1.AppError(401, "Refresh token is required");
    }
    const result = await auth_service_1.AuthService.refreshAccessToken(refreshToken);
    res.cookie("refreshToken", result.refreshToken, refreshCookieOptions);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Access token generated successfully",
        data: {
            accessToken: result.accessToken,
        },
    });
});
const logoutUser = (0, catchAsyc_1.catchAsync)(async (req, res) => {
    const refreshToken = getRefreshTokenFromRequest(req);
    await auth_service_1.AuthService.logoutUser(refreshToken);
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        path: "/",
    });
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Logged out successfully",
        data: null,
    });
});
const getCurrentUser = (0, catchAsyc_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new AppError_1.AppError(401, "Authentication is required");
    }
    const result = await auth_service_1.AuthService.getCurrentUser(req.user.userId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Current user retrieved successfully",
        data: result,
    });
});
const updateProfile = (0, catchAsyc_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new AppError_1.AppError(401, "Authentication is required");
    }
    const result = await auth_service_1.AuthService.updateProfile(req.user.userId, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Profile updated successfully",
        data: result,
    });
});
const changePassword = (0, catchAsyc_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new AppError_1.AppError(401, "Authentication is required");
    }
    await auth_service_1.AuthService.changePassword(req.user.userId, req.body);
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        path: "/",
    });
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Password changed successfully. Please log in again.",
        data: null,
    });
});
exports.AuthController = {
    registerUser,
    loginUser,
    loginWithGoogle,
    refreshAccessToken,
    logoutUser,
    getCurrentUser,
    updateProfile,
    changePassword,
};

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const catchAsyc_1 = require("../../utils/catchAsyc");
const sendResponse_1 = require("../../utils/sendResponse");
const admin_service_1 = require("./admin.service");
const getAllUsers = (0, catchAsyc_1.catchAsync)(async (req, res) => {
    const result = await admin_service_1.AdminService.getAllUsers(req.query);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Users retrieved successfully",
        meta: result.meta,
        data: result.data,
    });
});
const updateUserRole = (0, catchAsyc_1.catchAsync)(async (req, res) => {
    const ipAddress = req.ip || req.socket.remoteAddress || undefined;
    const userAgent = req.get("user-agent");
    const result = await admin_service_1.AdminService.updateUserRole(req.params.id, req.body, req.user.userId, ipAddress, userAgent);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "User role updated successfully",
        data: result,
    });
});
const getDashboardStats = (0, catchAsyc_1.catchAsync)(async (_req, res) => {
    const result = await admin_service_1.AdminService.getDashboardStats();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Dashboard statistics retrieved successfully",
        data: result,
    });
});
const getAuditLogs = (0, catchAsyc_1.catchAsync)(async (req, res) => {
    const result = await admin_service_1.AdminService.getAuditLogs(req.query);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Audit logs retrieved successfully",
        meta: result.meta,
        data: result.data,
    });
});
exports.AdminController = {
    getAllUsers,
    updateUserRole,
    getDashboardStats,
    getAuditLogs,
};

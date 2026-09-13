"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutageController = void 0;
const catchAsyc_1 = require("../../utils/catchAsyc");
const sendResponse_1 = require("../../utils/sendResponse");
const outage_service_1 = require("./outage.service");
const createOutage = (0, catchAsyc_1.catchAsync)(async (req, res) => {
    const reportedById = req.user.userId;
    const result = await outage_service_1.OutageService.createOutage(reportedById, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 201,
        success: true,
        message: "Unexpected outage reported successfully",
        data: result,
    });
});
const getAllOutages = (0, catchAsyc_1.catchAsync)(async (req, res) => {
    const result = await outage_service_1.OutageService.getAllOutages(req.query);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Unexpected outage reports retrieved successfully",
        meta: result.meta,
        data: result.data,
    });
});
const getMyOutages = (0, catchAsyc_1.catchAsync)(async (req, res) => {
    const reportedById = req.user.userId;
    const result = await outage_service_1.OutageService.getMyOutages(reportedById, req.query);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Your reported outages retrieved successfully",
        meta: result.meta,
        data: result.data,
    });
});
const getOutageById = (0, catchAsyc_1.catchAsync)(async (req, res) => {
    const result = await outage_service_1.OutageService.getOutageById(req.params.id);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Unexpected outage report retrieved successfully",
        data: result,
    });
});
const updateOutage = (0, catchAsyc_1.catchAsync)(async (req, res) => {
    const result = await outage_service_1.OutageService.updateOutage(req.params.id, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Unexpected outage report updated successfully",
        data: result,
    });
});
const updateOutageStatus = (0, catchAsyc_1.catchAsync)(async (req, res) => {
    const result = await outage_service_1.OutageService.updateOutageStatus(req.params.id, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Outage status updated successfully",
        data: result,
    });
});
const deleteOutage = (0, catchAsyc_1.catchAsync)(async (req, res) => {
    await outage_service_1.OutageService.deleteOutage(req.params.id);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Unexpected outage report deleted successfully",
        data: null,
    });
});
exports.OutageController = {
    createOutage,
    getAllOutages,
    getMyOutages,
    getOutageById,
    updateOutage,
    updateOutageStatus,
    deleteOutage,
};

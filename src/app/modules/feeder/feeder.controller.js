"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeederController = void 0;
const catchAsyc_1 = require("../../utils/catchAsyc");
const sendResponse_1 = require("../../utils/sendResponse");
const feeder_service_1 = require("./feeder.service");
const createFeeder = (0, catchAsyc_1.catchAsync)(async (req, res) => {
    const result = await feeder_service_1.FeederService.createFeeder(req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 201,
        success: true,
        message: "Feeder created successfully",
        data: result,
    });
});
const getAllFeeders = (0, catchAsyc_1.catchAsync)(async (req, res) => {
    const query = {
        searchTerm: typeof req.query.searchTerm === "string"
            ? req.query.searchTerm
            : undefined,
        substationId: typeof req.query.substationId === "string"
            ? req.query.substationId
            : undefined,
        priority: typeof req.query.priority === "string"
            ? req.query.priority
            : undefined,
        page: typeof req.query.page === "string" ? req.query.page : undefined,
        limit: typeof req.query.limit === "string" ? req.query.limit : undefined,
    };
    const result = await feeder_service_1.FeederService.getAllFeeders(query);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Feeders retrieved successfully",
        meta: result.meta,
        data: result.data,
    });
});
const getFeederById = (0, catchAsyc_1.catchAsync)(async (req, res) => {
    const id = String(req.params.id);
    const result = await feeder_service_1.FeederService.getFeederById(id);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Feeder retrieved successfully",
        data: result,
    });
});
const updateFeeder = (0, catchAsyc_1.catchAsync)(async (req, res) => {
    const id = String(req.params.id);
    const result = await feeder_service_1.FeederService.updateFeeder(id, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Feeder updated successfully",
        data: result,
    });
});
const deleteFeeder = (0, catchAsyc_1.catchAsync)(async (req, res) => {
    const id = String(req.params.id);
    const result = await feeder_service_1.FeederService.deleteFeeder(id);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Feeder deleted successfully",
        data: result,
    });
});
exports.FeederController = {
    createFeeder,
    getAllFeeders,
    getFeederById,
    updateFeeder,
    deleteFeeder,
};

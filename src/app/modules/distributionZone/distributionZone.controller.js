"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DistributionZoneController = void 0;
const catchAsyc_1 = require("../../utils/catchAsyc");
const sendResponse_1 = require("../../utils/sendResponse");
const distributionZone_service_1 = require("./distributionZone.service");
const createDistributionZone = (0, catchAsyc_1.catchAsync)(async (req, res) => {
    const result = await distributionZone_service_1.DistributionZoneService.createDistributionZone(req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 201,
        success: true,
        message: "Distribution zone created successfully",
        data: result,
    });
});
const getAllDistributionZones = (0, catchAsyc_1.catchAsync)(async (req, res) => {
    const result = await distributionZone_service_1.DistributionZoneService.getAllDistributionZones(req.query);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Distribution zones retrieved successfully",
        data: result,
    });
});
const getDistributionZoneById = (0, catchAsyc_1.catchAsync)(async (req, res) => {
    const result = await distributionZone_service_1.DistributionZoneService.getDistributionZoneById(req.params.id);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Distribution zone retrieved successfully",
        data: result,
    });
});
const updateDistributionZone = (0, catchAsyc_1.catchAsync)(async (req, res) => {
    const result = await distributionZone_service_1.DistributionZoneService.updateDistributionZone(req.params.id, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Distribution zone updated successfully",
        data: result,
    });
});
const deleteDistributionZone = (0, catchAsyc_1.catchAsync)(async (req, res) => {
    const result = await distributionZone_service_1.DistributionZoneService.deleteDistributionZone(req.params.id);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Distribution zone deleted successfully",
        data: result,
    });
});
exports.DistributionZoneController = {
    createDistributionZone,
    getAllDistributionZones,
    getDistributionZoneById,
    updateDistributionZone,
    deleteDistributionZone,
};

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubstationController = void 0;
const catchAsyc_1 = require("../../utils/catchAsyc");
const sendResponse_1 = require("../../utils/sendResponse");
const substation_service_1 = require("./substation.service");
const createSubstation = (0, catchAsyc_1.catchAsync)(async (req, res) => {
    const result = await substation_service_1.SubstationService.createSubstation(req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 201,
        success: true,
        message: "Substation created successfully",
        data: result,
    });
});
const getAllSubstations = (0, catchAsyc_1.catchAsync)(async (req, res) => {
    const result = await substation_service_1.SubstationService.getAllSubstations(req.query);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Substations retrieved successfully",
        meta: result.meta,
        data: result.data,
    });
});
const getSubstationById = (0, catchAsyc_1.catchAsync)(async (req, res) => {
    const result = await substation_service_1.SubstationService.getSubstationById(req.params.id);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Substation retrieved successfully",
        data: result,
    });
});
const updateSubstation = (0, catchAsyc_1.catchAsync)(async (req, res) => {
    const result = await substation_service_1.SubstationService.updateSubstation(req.params.id, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Substation updated successfully",
        data: result,
    });
});
const deleteSubstation = (0, catchAsyc_1.catchAsync)(async (req, res) => {
    const result = await substation_service_1.SubstationService.deleteSubstation(req.params.id);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Substation deleted successfully",
        data: result,
    });
});
exports.SubstationController = {
    createSubstation,
    getAllSubstations,
    getSubstationById,
    updateSubstation,
    deleteSubstation,
};

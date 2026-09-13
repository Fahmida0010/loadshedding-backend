"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TechnicianAssignmentController = void 0;
const catchAsyc_1 = require("../../utils/catchAsyc");
const sendResponse_1 = require("../../utils/sendResponse");
const assignment_service_1 = require("./assignment.service");
const createAssignment = (0, catchAsyc_1.catchAsync)(async (req, res) => {
    const result = await assignment_service_1.TechnicianAssignmentService.createAssignment(req.body, req.user.userId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 201,
        success: true,
        message: "Technician assigned successfully",
        data: result,
    });
});
const getAllAssignments = (0, catchAsyc_1.catchAsync)(async (req, res) => {
    const result = await assignment_service_1.TechnicianAssignmentService.getAllAssignments(req.query);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Technician assignments retrieved successfully",
        meta: result.meta,
        data: result.data,
    });
});
const getMyAssignments = (0, catchAsyc_1.catchAsync)(async (req, res) => {
    const result = await assignment_service_1.TechnicianAssignmentService.getMyAssignments(req.user.userId, req.query);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Your assignments retrieved successfully",
        meta: result.meta,
        data: result.data,
    });
});
const getAssignmentById = (0, catchAsyc_1.catchAsync)(async (req, res) => {
    const result = await assignment_service_1.TechnicianAssignmentService.getAssignmentById(req.params.id, req.user.userId, req.user.role);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Technician assignment retrieved successfully",
        data: result,
    });
});
const updateAssignment = (0, catchAsyc_1.catchAsync)(async (req, res) => {
    const result = await assignment_service_1.TechnicianAssignmentService.updateAssignment(req.params.id, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Technician assignment updated successfully",
        data: result,
    });
});
const updateAssignmentStatus = (0, catchAsyc_1.catchAsync)(async (req, res) => {
    const result = await assignment_service_1.TechnicianAssignmentService.updateAssignmentStatus(req.params.id, req.user.userId, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Assignment status updated successfully",
        data: result,
    });
});
const deleteAssignment = (0, catchAsyc_1.catchAsync)(async (req, res) => {
    const result = await assignment_service_1.TechnicianAssignmentService.deleteAssignment(req.params.id);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Technician assignment deleted successfully",
        data: result,
    });
});
const createRepairUpdate = (0, catchAsyc_1.catchAsync)(async (req, res) => {
    const result = await assignment_service_1.TechnicianAssignmentService.createRepairUpdate(req.params.id, req.user.userId, req.body);
    res.status(201).json({
        success: true,
        message: "Repair update added successfully",
        data: result,
    });
});
const resolveOutage = (0, catchAsyc_1.catchAsync)(async (req, res) => {
    const result = await assignment_service_1.TechnicianAssignmentService.resolveOutage(req.params.id, req.user.userId, req.body);
    res.status(201).json({
        success: true,
        message: "Outage resolved and power restoration recorded successfully",
        data: result,
    });
});
exports.TechnicianAssignmentController = {
    createAssignment,
    getAllAssignments,
    getMyAssignments,
    getAssignmentById,
    updateAssignment,
    updateAssignmentStatus,
    deleteAssignment,
    createRepairUpdate,
    resolveOutage,
};

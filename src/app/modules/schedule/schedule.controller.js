"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsyc_1 = require("../../utils/catchAsyc");
const sendResponse_1 = require("../../utils/sendResponse");
const schedule_service_1 = require("./schedule.service");
const createSchedule = (0, catchAsyc_1.catchAsync)(async (req, res, _next) => {
    const userId = req.user.userId;
    const result = await schedule_service_1.ScheduleService.createSchedule(userId, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: "Schedule created successfully",
        data: result,
    });
});
const getAllSchedules = (0, catchAsyc_1.catchAsync)(async (req, res) => {
    const result = await schedule_service_1.ScheduleService.getAllSchedules(req.query);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Schedules retrieved successfully",
        meta: result.meta,
        data: result.data,
    });
});
const getScheduleById = (0, catchAsyc_1.catchAsync)(async (req, res) => {
    const result = await schedule_service_1.ScheduleService.getScheduleById(req.params.id);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Schedule retrieved successfully",
        data: result,
    });
});
const updateSchedule = (0, catchAsyc_1.catchAsync)(async (req, res) => {
    const result = await schedule_service_1.ScheduleService.updateSchedule(req.params.id, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Schedule updated successfully",
        data: result,
    });
});
const deleteSchedule = (0, catchAsyc_1.catchAsync)(async (req, res) => {
    await schedule_service_1.ScheduleService.deleteSchedule(req.params.id);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Schedule deleted successfully",
        data: null,
    });
});
exports.ScheduleController = {
    createSchedule,
    getAllSchedules,
    getScheduleById,
    updateSchedule,
    deleteSchedule,
};

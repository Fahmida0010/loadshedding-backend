"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AreaController = void 0;
const catchAsyc_1 = require("../../utils/catchAsyc");
const sendResponse_1 = require("../../utils/sendResponse");
const area_service_1 = require("./area.service");
const createArea = (0, catchAsyc_1.catchAsync)(async (req, res) => {
    const result = await area_service_1.AreaService.createArea(req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 201,
        success: true,
        message: "Area created successfully",
        data: result,
    });
});
const getAllAreas = (0, catchAsyc_1.catchAsync)(async (req, res) => {
    const query = {
        searchTerm: typeof req.query.searchTerm === "string"
            ? req.query.searchTerm
            : undefined,
        feederId: typeof req.query.feederId === "string" ? req.query.feederId : undefined,
        priority: typeof req.query.priority === "string"
            ? req.query.priority
            : undefined,
        page: typeof req.query.page === "string" ? req.query.page : undefined,
        limit: typeof req.query.limit === "string" ? req.query.limit : undefined,
    };
    const result = await area_service_1.AreaService.getAllAreas(query);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Areas retrieved successfully",
        meta: result.meta,
        data: result.data,
    });
});
const getAreaById = (0, catchAsyc_1.catchAsync)(async (req, res) => {
    const id = String(req.params.id);
    const result = await area_service_1.AreaService.getAreaById(id);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Area retrieved successfully",
        data: result,
    });
});
const updateArea = (0, catchAsyc_1.catchAsync)(async (req, res) => {
    const id = String(req.params.id);
    const result = await area_service_1.AreaService.updateArea(id, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Area updated successfully",
        data: result,
    });
});
const deleteArea = (0, catchAsyc_1.catchAsync)(async (req, res) => {
    const id = String(req.params.id);
    const result = await area_service_1.AreaService.deleteArea(id);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Area deleted successfully",
        data: result,
    });
});
exports.AreaController = {
    createArea,
    getAllAreas,
    getAreaById,
    updateArea,
    deleteArea,
};

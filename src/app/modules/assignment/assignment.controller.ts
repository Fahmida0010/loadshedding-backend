import type { RequestHandler } from "express";
import { sendResponse } from "../../utils/sendResponse";
import { TechnicianAssignmentService } from "./assignment.service";
import { IAssignmentQuery } from "./assignment.interface";
import { catchAsync } from "../../utils/catchAsyc";

const createAssignment: RequestHandler = catchAsync(
  async (req, res) => {
    const result =
      await TechnicianAssignmentService.createAssignment(
        req.body,
        req.user.userId,
      );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Technician assigned successfully",
      data: result,
    });
  },
);

const getAllAssignments: RequestHandler = catchAsync(
  async (req, res) => {
    const result =
      await TechnicianAssignmentService.getAllAssignments(
        req.query as IAssignmentQuery,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Technician assignments retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  },
);

const getMyAssignments: RequestHandler = catchAsync(
  async (req, res) => {
    const result =
      await TechnicianAssignmentService.getMyAssignments(
        req.user.userId,
        req.query as IAssignmentQuery,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Your assignments retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  },
);

const getAssignmentById: RequestHandler = catchAsync(
  async (req, res) => {
    const result =
      await TechnicianAssignmentService.getAssignmentById(
        req.params.id,
        req.user.userId,
        req.user.role,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Technician assignment retrieved successfully",
      data: result,
    });
  },
);

const updateAssignment: RequestHandler = catchAsync(
  async (req, res) => {
    const result =
      await TechnicianAssignmentService.updateAssignment(
        req.params.id,
        req.body,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Technician assignment updated successfully",
      data: result,
    });
  },
);

const updateAssignmentStatus: RequestHandler = catchAsync(
  async (req, res) => {
    const result =
      await TechnicianAssignmentService.updateAssignmentStatus(
        req.params.id,
        req.user.userId,
        req.body,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Assignment status updated successfully",
      data: result,
    });
  },
);

const deleteAssignment: RequestHandler = catchAsync(
  async (req, res) => {
    const result =
      await TechnicianAssignmentService.deleteAssignment(
        req.params.id,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Technician assignment deleted successfully",
      data: result,
    });
  },
);

export const TechnicianAssignmentController = {
  createAssignment,
  getAllAssignments,
  getMyAssignments,
  getAssignmentById,
  updateAssignment,
  updateAssignmentStatus,
  deleteAssignment,
};
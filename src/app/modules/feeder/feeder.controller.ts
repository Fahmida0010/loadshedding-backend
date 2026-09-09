import type { Request, Response } from "express";
import { sendResponse } from "../../utils/sendResponse";

import type { IFeederQuery } from "./feeder.interface";
import { FeederService } from "./feeder.service";
import { catchAsync } from "../../utils/catchAsyc";

const createFeeder = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await FeederService.createFeeder(req.body);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Feeder created successfully",
      data: result,
    });
  },
);

const getAllFeeders = catchAsync(
  async (req: Request, res: Response) => {
    const query: IFeederQuery = {
      searchTerm:
        typeof req.query.searchTerm === "string"
          ? req.query.searchTerm
          : undefined,

      substationId:
        typeof req.query.substationId === "string"
          ? req.query.substationId
          : undefined,

      priority:
        typeof req.query.priority === "string"
          ? (req.query
              .priority as IFeederQuery["priority"])
          : undefined,

      page:
        typeof req.query.page === "string"
          ? req.query.page
          : undefined,

      limit:
        typeof req.query.limit === "string"
          ? req.query.limit
          : undefined,
    };

    const result =
      await FeederService.getAllFeeders(query);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Feeders retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  },
);

const getFeederById = catchAsync(
  async (req: Request, res: Response) => {
    const id = String(req.params.id);

    const result =
      await FeederService.getFeederById(id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Feeder retrieved successfully",
      data: result,
    });
  },
);

const updateFeeder = catchAsync(
  async (req: Request, res: Response) => {
    const id = String(req.params.id);

    const result =
      await FeederService.updateFeeder(
        id,
        req.body,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Feeder updated successfully",
      data: result,
    });
  },
);

const deleteFeeder = catchAsync(
  async (req: Request, res: Response) => {
    const id = String(req.params.id);

    const result =
      await FeederService.deleteFeeder(id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Feeder deleted successfully",
      data: result,
    });
  },
);

export const FeederController = {
  createFeeder,
  getAllFeeders,
  getFeederById,
  updateFeeder,
  deleteFeeder,
};
import type {
  Request,
  Response,
} from "express";
import { sendResponse } from "../../utils/sendResponse";

import type {
  ICreateDistributionZone,
  IDistributionZoneQuery,
  IUpdateDistributionZone,
} from "./distributionZone.interface";

import { DistributionZoneService } from "./distributionZone.service";
import { catchAsync } from "../../utils/catchAsyc";

const createDistributionZone = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await DistributionZoneService.createDistributionZone(
        req.body as ICreateDistributionZone,
      );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message:
        "Distribution zone created successfully",
      data: result,
    });
  },
);

const getAllDistributionZones = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await DistributionZoneService.getAllDistributionZones(
        req.query as IDistributionZoneQuery,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message:
        "Distribution zones retrieved successfully",
      data: result,
    });
  },
);

const getDistributionZoneById = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await DistributionZoneService.getDistributionZoneById(
        req.params.id,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message:
        "Distribution zone retrieved successfully",
      data: result,
    });
  },
);

const updateDistributionZone = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await DistributionZoneService.updateDistributionZone(
        req.params.id,
        req.body as IUpdateDistributionZone,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message:
        "Distribution zone updated successfully",
      data: result,
    });
  },
);

const deleteDistributionZone = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await DistributionZoneService.deleteDistributionZone(
        req.params.id,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message:
        "Distribution zone deleted successfully",
      data: result,
    });
  },
);

export const DistributionZoneController = {
  createDistributionZone,
  getAllDistributionZones,
  getDistributionZoneById,
  updateDistributionZone,
  deleteDistributionZone,
};
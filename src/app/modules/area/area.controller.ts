import type { Request, Response } from "express";
import { sendResponse } from "../../utils/sendResponse";

import type { IAreaQuery } from "./area.interface";
import { AreaService } from "./area.service";
import { catchAsync } from "../../utils/catchAsyc";


const createArea = catchAsync(
  async (req: Request, res: Response) => {
    const result = await AreaService.createArea(
      req.body,
    );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Area created successfully",
      data: result,
    });
  },
);

const getAllAreas = catchAsync(
  async (req: Request, res: Response) => {
    const query: IAreaQuery = {
      searchTerm:
        typeof req.query.searchTerm === "string"
          ? req.query.searchTerm
          : undefined,

      feederId:
        typeof req.query.feederId === "string"
          ? req.query.feederId
          : undefined,

      priority:
        typeof req.query.priority === "string"
          ? (req.query
              .priority as IAreaQuery["priority"])
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
      await AreaService.getAllAreas(query);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Areas retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  },
);

const getAreaById = catchAsync(
  async (req: Request, res: Response) => {
    const id = String(req.params.id);

    const result = await AreaService.getAreaById(id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Area retrieved successfully",
      data: result,
    });
  },
);

const updateArea = catchAsync(
  async (req: Request, res: Response) => {
    const id = String(req.params.id);

    const result = await AreaService.updateArea(
      id,
      req.body,
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Area updated successfully",
      data: result,
    });
  },
);

const deleteArea = catchAsync(
  async (req: Request, res: Response) => {
    const id = String(req.params.id);

    const result = await AreaService.deleteArea(id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Area deleted successfully",
      data: result,
    });
  },
);

export const AreaController = {
  createArea,
  getAllAreas,
  getAreaById,
  updateArea,
  deleteArea,
};
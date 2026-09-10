import type {
  Request,
  Response,
} from "express";
import { sendResponse } from "../../utils/sendResponse";
import type { IOutageQuery } from "./outage.interface";
import { OutageService } from "./outage.service";
import { catchAsync } from "../../utils/catchAsyc";


const createOutage = catchAsync(
  async (req: Request, res: Response) => {
    const reportedById =
      req.user!.userId;

    const result =
      await OutageService.createOutage(
        reportedById,
        req.body,
      );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message:
        "Unexpected outage reported successfully",
      data: result,
    });
  },
);

const getAllOutages = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await OutageService.getAllOutages(
        req.query as IOutageQuery,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message:
        "Unexpected outages retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  },
);

const getMyOutages = catchAsync(
  async (req: Request, res: Response) => {
    const reportedById =
      req.user!.userId;

    const result =
      await OutageService.getMyOutages(
        reportedById,
        req.query as IOutageQuery,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message:
        "Your reported outages retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  },
);

const getOutageById = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await OutageService.getOutageById(
        req.params.id,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message:
        "Unexpected outage retrieved successfully",
      data: result,
    });
  },
);

const updateOutage = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await OutageService.updateOutage(
        req.params.id,
        req.body,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message:
        "Unexpected outage updated successfully",
      data: result,
    });
  },
);

const updateOutageStatus = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await OutageService.updateOutageStatus(
        req.params.id,
        req.body,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message:
        "Outage status updated successfully",
      data: result,
    });
  },
);

const deleteOutage = catchAsync(
  async (req: Request, res: Response) => {
    await OutageService.deleteOutage(
      req.params.id,
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message:
        "Unexpected outage deleted successfully",
      data: null,
    });
  },
);

export const OutageController = {
  createOutage,
  getAllOutages,
  getMyOutages,
  getOutageById,
  updateOutage,
  updateOutageStatus,
  deleteOutage,
};
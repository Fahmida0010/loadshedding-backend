import type { Response } from "express";

type TResponse<T> = {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
};

export const sendResponse = <T>(
  res: Response,
  responseData: TResponse<T>,
): void => {
  const {
    statusCode,
    success,
    message,
    data,
    meta,
  } = responseData;

  res.status(statusCode).json({
    success,
    message,
    ...(meta && { meta }),
    data,
  });
};
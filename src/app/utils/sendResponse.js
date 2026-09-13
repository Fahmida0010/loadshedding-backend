"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResponse = void 0;
const sendResponse = (res, responseData) => {
    const { statusCode, success, message, data, meta } = responseData;
    res.status(statusCode).json({
        success,
        message,
        ...(meta && { meta }),
        data,
    });
};
exports.sendResponse = sendResponse;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = void 0;
const notFound = (req, res) => {
    res.status(404).json({
        success: false,
        message: "API endpoint not found",
        error: {
            method: req.method,
            path: req.originalUrl,
        },
    });
};
exports.notFound = notFound;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
exports.notFound = notFound;
const apiError_1 = require("../utils/apiError");
const logger_1 = require("../utils/logger");
function errorHandler(err, req, res, _next) {
    const error = err instanceof apiError_1.ApiError ? err : new apiError_1.ApiError(500, 'Internal server error');
    logger_1.logger.error({
        path: req.originalUrl,
        method: req.method,
        message: error.message,
        stack: err instanceof Error ? err.stack : undefined
    });
    res.status(error.statusCode).json({ error: error.message });
}
function notFound(req, res) {
    res.status(404).json({ error: `Route ${req.originalUrl} not found` });
}
//# sourceMappingURL=error.middleware.js.map
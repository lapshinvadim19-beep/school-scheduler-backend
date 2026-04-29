"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequired = validateRequired;
const apiError_1 = require("../utils/apiError");
const validation_1 = require("../utils/validation");
function validateRequired(fields) {
    return (req, _res, next) => {
        const missing = (0, validation_1.requireFields)(req.body, fields);
        if (missing.length > 0) {
            return next(new apiError_1.ApiError(400, `Не заполнены обязательные поля: ${missing.join(', ')}`));
        }
        next();
    };
}
//# sourceMappingURL=validation.middleware.js.map
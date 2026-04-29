"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
exports.roleMiddleware = roleMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const models_1 = require("../models");
const apiError_1 = require("../utils/apiError");
async function authMiddleware(req, _res, next) {
    try {
        const header = req.header('Authorization');
        const token = header?.startsWith('Bearer ') ? header.replace('Bearer ', '') : undefined;
        if (!token) {
            return next(new apiError_1.ApiError(401, 'Необходима авторизация'));
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secret');
        const user = await models_1.User.findByPk(decoded.id);
        if (!user || !user.isActive) {
            return next(new apiError_1.ApiError(401, 'Пользователь не найден или заблокирован'));
        }
        req.user = user;
        next();
    }
    catch (_error) {
        next(new apiError_1.ApiError(401, 'Недействительный токен'));
    }
}
function roleMiddleware(roles) {
    return (req, _res, next) => {
        if (!req.user) {
            return next(new apiError_1.ApiError(401, 'Необходима авторизация'));
        }
        if (!roles.includes(req.user.role)) {
            return next(new apiError_1.ApiError(403, 'Недостаточно прав для выполнения операции'));
        }
        next();
    };
}
//# sourceMappingURL=auth.middleware.js.map
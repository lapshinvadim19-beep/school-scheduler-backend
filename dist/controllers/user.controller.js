"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const models_1 = require("../models");
const apiError_1 = require("../utils/apiError");
class UserController {
    static async getAllUsers(_req, res, next) {
        try {
            const users = await models_1.User.findAll({
                attributes: { exclude: ['password'] },
                order: [['createdAt', 'DESC']]
            });
            res.json(users);
        }
        catch (error) {
            next(error);
        }
    }
    static async getCurrentUser(req, res, next) {
        try {
            if (!req.user)
                throw new apiError_1.ApiError(401, 'Пользователь не авторизован');
            res.json({
                id: req.user.id,
                email: req.user.email,
                fullName: req.user.fullName,
                role: req.user.role,
                avatar: req.user.avatar,
                isActive: req.user.isActive
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateCurrentUser(req, res, next) {
        try {
            if (!req.user)
                throw new apiError_1.ApiError(401, 'Пользователь не авторизован');
            const { fullName, avatar } = req.body;
            await req.user.update({ fullName, avatar });
            res.json({
                id: req.user.id,
                email: req.user.email,
                fullName: req.user.fullName,
                role: req.user.role,
                avatar: req.user.avatar,
                isActive: req.user.isActive
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateUser(req, res, next) {
        try {
            const user = await models_1.User.findByPk(Number(req.params.id));
            if (!user)
                throw new apiError_1.ApiError(404, 'Пользователь не найден');
            const { role, isActive } = req.body;
            await user.update({ role, isActive });
            res.json({
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                avatar: user.avatar,
                isActive: user.isActive
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteUser(req, res, next) {
        try {
            const user = await models_1.User.findByPk(Number(req.params.id));
            if (!user)
                throw new apiError_1.ApiError(404, 'Пользователь не найден');
            await user.destroy();
            res.json({ message: 'Пользователь удалён' });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.UserController = UserController;
//# sourceMappingURL=user.controller.js.map
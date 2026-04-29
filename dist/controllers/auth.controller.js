"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const models_1 = require("../models");
const auth_service_1 = require("../services/auth.service");
const apiError_1 = require("../utils/apiError");
class AuthController {
    static async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const user = await models_1.User.findOne({ where: { email } });
            if (!user || !(await user.validatePassword(password))) {
                throw new apiError_1.ApiError(401, 'Неверный email или пароль');
            }
            if (!user.isActive) {
                throw new apiError_1.ApiError(403, 'Пользователь деактивирован');
            }
            res.json((0, auth_service_1.buildAuthResponse)(user));
        }
        catch (error) {
            next(error);
        }
    }
    static async register(req, res, next) {
        try {
            const { email, password, fullName, role = 'student' } = req.body;
            const exists = await models_1.User.findOne({ where: { email } });
            if (exists) {
                throw new apiError_1.ApiError(400, 'Пользователь с таким email уже существует');
            }
            const user = await models_1.User.create({ email, password, fullName, role });
            res.status(201).json((0, auth_service_1.buildAuthResponse)(user));
        }
        catch (error) {
            next(error);
        }
    }
    static async getProfile(req, res, next) {
        try {
            const currentUser = req.user;
            if (!currentUser)
                throw new apiError_1.ApiError(401, 'Пользователь не авторизован');
            const teacherProfile = await models_1.Teacher.findOne({ where: { userId: currentUser.id } });
            res.json({
                id: currentUser.id,
                email: currentUser.email,
                fullName: currentUser.fullName,
                role: currentUser.role,
                avatar: currentUser.avatar,
                teacherProfile: teacherProfile
                    ? {
                        id: teacherProfile.id,
                        phone: teacherProfile.phone,
                        qualification: teacherProfile.qualification,
                        office: teacherProfile.office,
                        subjects: teacherProfile.subjects
                    }
                    : null
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async logout(_req, res) {
        res.json({ message: 'Выход выполнен успешно' });
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map
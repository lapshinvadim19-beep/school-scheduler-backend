"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportController = void 0;
const models_1 = require("../models");
const apiError_1 = require("../utils/apiError");
function mapReport(report) {
    const user = report.get('user');
    const lesson = report.get('lesson');
    return {
        id: report.id,
        userId: report.userId,
        userName: user?.fullName || '',
        userRole: user?.role || 'student',
        lessonId: report.lessonId,
        description: report.description,
        status: report.status,
        adminResponse: report.adminResponse,
        lesson: lesson || null,
        createdAt: report.createdAt,
        updatedAt: report.updatedAt
    };
}
async function fetchReports(where) {
    const reports = await models_1.Report.findAll({
        where,
        include: [
            { model: models_1.User, as: 'user', attributes: ['id', 'fullName', 'role'] },
            { model: models_1.Lesson, as: 'lesson' }
        ],
        order: [['createdAt', 'DESC']]
    });
    return reports.map((report) => mapReport(report));
}
class ReportController {
    static async getAll(req, res, next) {
        try {
            if (!req.user)
                throw new apiError_1.ApiError(401, 'Пользователь не авторизован');
            const where = req.user.role === 'admin' ? undefined : { userId: req.user.id };
            res.json(await fetchReports(where));
        }
        catch (error) {
            next(error);
        }
    }
    static async getMyReports(req, res, next) {
        try {
            if (!req.user)
                throw new apiError_1.ApiError(401, 'Пользователь не авторизован');
            res.json(await fetchReports({ userId: req.user.id }));
        }
        catch (error) {
            next(error);
        }
    }
    static async getById(req, res, next) {
        try {
            if (!req.user)
                throw new apiError_1.ApiError(401, 'Пользователь не авторизован');
            const report = await models_1.Report.findByPk(Number(req.params.id), {
                include: [
                    { model: models_1.User, as: 'user', attributes: ['id', 'fullName', 'role'] },
                    { model: models_1.Lesson, as: 'lesson' }
                ]
            });
            if (!report)
                throw new apiError_1.ApiError(404, 'Сообщение не найдено');
            if (req.user.role !== 'admin' && report.userId !== req.user.id) {
                throw new apiError_1.ApiError(403, 'Недостаточно прав для просмотра сообщения');
            }
            res.json(mapReport(report));
        }
        catch (error) {
            next(error);
        }
    }
    static async create(req, res, next) {
        try {
            if (!req.user)
                throw new apiError_1.ApiError(401, 'Пользователь не авторизован');
            const { description, lessonId } = req.body;
            const report = await models_1.Report.create({
                userId: req.user.id,
                lessonId: lessonId ? Number(lessonId) : null,
                description
            });
            const created = await models_1.Report.findByPk(report.id, {
                include: [
                    { model: models_1.User, as: 'user', attributes: ['id', 'fullName', 'role'] },
                    { model: models_1.Lesson, as: 'lesson' }
                ]
            });
            res.status(201).json(mapReport(created));
        }
        catch (error) {
            next(error);
        }
    }
    static async updateStatus(req, res, next) {
        try {
            const report = await models_1.Report.findByPk(Number(req.params.id));
            if (!report)
                throw new apiError_1.ApiError(404, 'Сообщение не найдено');
            const { status, adminResponse } = req.body;
            await report.update({ status, adminResponse });
            const updated = await models_1.Report.findByPk(report.id, {
                include: [
                    { model: models_1.User, as: 'user', attributes: ['id', 'fullName', 'role'] },
                    { model: models_1.Lesson, as: 'lesson' }
                ]
            });
            res.json(mapReport(updated));
        }
        catch (error) {
            next(error);
        }
    }
    static async delete(req, res, next) {
        try {
            const report = await models_1.Report.findByPk(Number(req.params.id));
            if (!report)
                throw new apiError_1.ApiError(404, 'Сообщение не найдено');
            await report.destroy();
            res.json({ message: 'Сообщение удалено' });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ReportController = ReportController;
//# sourceMappingURL=report.controller.js.map
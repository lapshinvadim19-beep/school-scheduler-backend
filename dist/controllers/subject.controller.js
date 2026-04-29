"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubjectController = void 0;
const models_1 = require("../models");
const apiError_1 = require("../utils/apiError");
class SubjectController {
    static async getAll(_req, res, next) {
        try {
            const subjects = await models_1.Subject.findAll({ order: [['name', 'ASC']] });
            res.json(subjects);
        }
        catch (error) {
            next(error);
        }
    }
    static async getById(req, res, next) {
        try {
            const subject = await models_1.Subject.findByPk(Number(req.params.id));
            if (!subject)
                throw new apiError_1.ApiError(404, 'Предмет не найден');
            res.json(subject);
        }
        catch (error) {
            next(error);
        }
    }
    static async create(req, res, next) {
        try {
            const { name, shortName, hoursPerWeek, department, color } = req.body;
            const subject = await models_1.Subject.create({
                name,
                shortName,
                hoursPerWeek: Number(hoursPerWeek) || 1,
                department,
                color: color || '#3B82F6'
            });
            res.status(201).json(subject);
        }
        catch (error) {
            next(error);
        }
    }
    static async update(req, res, next) {
        try {
            const subject = await models_1.Subject.findByPk(Number(req.params.id));
            if (!subject)
                throw new apiError_1.ApiError(404, 'Предмет не найден');
            const { name, shortName, hoursPerWeek, department, color, isActive } = req.body;
            await subject.update({
                name: name ?? subject.name,
                shortName: shortName ?? subject.shortName,
                hoursPerWeek: hoursPerWeek !== undefined ? Number(hoursPerWeek) : subject.hoursPerWeek,
                department: department ?? subject.department,
                color: color ?? subject.color,
                isActive: isActive ?? subject.isActive
            });
            res.json(subject);
        }
        catch (error) {
            next(error);
        }
    }
    static async delete(req, res, next) {
        try {
            const subject = await models_1.Subject.findByPk(Number(req.params.id));
            if (!subject)
                throw new apiError_1.ApiError(404, 'Предмет не найден');
            await subject.destroy();
            res.json({ message: 'Предмет удалён' });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.SubjectController = SubjectController;
//# sourceMappingURL=subject.controller.js.map
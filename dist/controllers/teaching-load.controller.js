"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeachingLoadController = void 0;
const models_1 = require("../models");
const apiError_1 = require("../utils/apiError");
function mapTeachingLoad(item) {
    const classModel = item.get('class');
    const teacher = item.get('teacher');
    const subject = item.get('subject');
    const teacherUser = teacher?.get('user');
    return {
        id: item.id,
        classId: item.classId,
        teacherId: item.teacherId,
        subjectId: item.subjectId,
        room: item.room,
        hoursPerWeek: item.hoursPerWeek,
        isActive: item.isActive,
        className: classModel?.name || '',
        teacherName: teacherUser?.fullName || '',
        subjectName: subject?.name || ''
    };
}
async function fetchLoads(where = {}) {
    const loads = await models_1.TeachingLoad.findAll({
        where,
        include: [
            { model: models_1.Class, as: 'class' },
            { model: models_1.Teacher, as: 'teacher', include: [{ model: models_1.User, as: 'user', attributes: ['fullName'] }] },
            { model: models_1.Subject, as: 'subject' }
        ],
        order: [['classId', 'ASC'], ['subjectId', 'ASC']]
    });
    return loads.map((item) => mapTeachingLoad(item));
}
class TeachingLoadController {
    static async getAll(req, res, next) {
        try {
            const where = {};
            if (req.query.classId)
                where.classId = Number(req.query.classId);
            if (req.query.teacherId)
                where.teacherId = Number(req.query.teacherId);
            res.json(await fetchLoads(where));
        }
        catch (error) {
            next(error);
        }
    }
    static async create(req, res, next) {
        try {
            const payload = {
                classId: Number(req.body.classId),
                teacherId: Number(req.body.teacherId),
                subjectId: Number(req.body.subjectId),
                room: String(req.body.room || ''),
                hoursPerWeek: Number(req.body.hoursPerWeek) || 1,
                isActive: req.body.isActive !== false
            };
            const created = await models_1.TeachingLoad.create(payload);
            const result = await fetchLoads({ id: created.id });
            res.status(201).json(result[0]);
        }
        catch (error) {
            next(error);
        }
    }
    static async update(req, res, next) {
        try {
            const load = await models_1.TeachingLoad.findByPk(Number(req.params.id));
            if (!load)
                throw new apiError_1.ApiError(404, 'Нагрузка не найдена');
            await load.update({
                classId: req.body.classId !== undefined ? Number(req.body.classId) : load.classId,
                teacherId: req.body.teacherId !== undefined ? Number(req.body.teacherId) : load.teacherId,
                subjectId: req.body.subjectId !== undefined ? Number(req.body.subjectId) : load.subjectId,
                room: req.body.room !== undefined ? String(req.body.room) : load.room,
                hoursPerWeek: req.body.hoursPerWeek !== undefined ? Number(req.body.hoursPerWeek) : load.hoursPerWeek,
                isActive: req.body.isActive !== undefined ? Boolean(req.body.isActive) : load.isActive
            });
            const result = await fetchLoads({ id: load.id });
            res.json(result[0]);
        }
        catch (error) {
            next(error);
        }
    }
    static async delete(req, res, next) {
        try {
            const load = await models_1.TeachingLoad.findByPk(Number(req.params.id));
            if (!load)
                throw new apiError_1.ApiError(404, 'Нагрузка не найдена');
            await load.destroy();
            res.json({ message: 'Нагрузка удалена' });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.TeachingLoadController = TeachingLoadController;
//# sourceMappingURL=teaching-load.controller.js.map
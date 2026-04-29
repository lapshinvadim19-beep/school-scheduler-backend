"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassController = void 0;
const models_1 = require("../models");
const apiError_1 = require("../utils/apiError");
function mapClass(item) {
    const teacher = item.get('teacher');
    const teacherUser = teacher?.get('user');
    return {
        id: item.id,
        name: item.name,
        grade: item.grade,
        studentsCount: item.studentsCount,
        teacherId: item.teacherId,
        teacherName: teacherUser?.fullName || '',
        teacher: teacherUser?.fullName || '',
        description: item.description || ''
    };
}
class ClassController {
    static async getAll(_req, res, next) {
        try {
            const classes = await models_1.Class.findAll({
                include: [{ model: models_1.Teacher, as: 'teacher', include: [{ model: models_1.User, as: 'user', attributes: ['fullName'] }] }],
                order: [['grade', 'ASC'], ['name', 'ASC']]
            });
            res.json(classes.map((item) => mapClass(item)));
        }
        catch (error) {
            next(error);
        }
    }
    static async getById(req, res, next) {
        try {
            const classItem = await models_1.Class.findByPk(Number(req.params.id), {
                include: [{ model: models_1.Teacher, as: 'teacher', include: [{ model: models_1.User, as: 'user', attributes: ['fullName'] }] }]
            });
            if (!classItem)
                throw new apiError_1.ApiError(404, 'Класс не найден');
            res.json(mapClass(classItem));
        }
        catch (error) {
            next(error);
        }
    }
    static async create(req, res, next) {
        try {
            const { name, grade, studentsCount = 0, teacherId = null, description = '' } = req.body;
            const classItem = await models_1.Class.create({
                name,
                grade,
                studentsCount: Number(studentsCount) || 0,
                teacherId: teacherId ? Number(teacherId) : null,
                description
            });
            const created = await models_1.Class.findByPk(classItem.id, {
                include: [{ model: models_1.Teacher, as: 'teacher', include: [{ model: models_1.User, as: 'user', attributes: ['fullName'] }] }]
            });
            res.status(201).json(mapClass(created));
        }
        catch (error) {
            next(error);
        }
    }
    static async update(req, res, next) {
        try {
            const classItem = await models_1.Class.findByPk(Number(req.params.id));
            if (!classItem)
                throw new apiError_1.ApiError(404, 'Класс не найден');
            const { name, grade, studentsCount, teacherId, description } = req.body;
            await classItem.update({
                name: name ?? classItem.name,
                grade: grade ?? classItem.grade,
                studentsCount: studentsCount !== undefined ? Number(studentsCount) : classItem.studentsCount,
                teacherId: teacherId !== undefined ? (teacherId ? Number(teacherId) : null) : classItem.teacherId,
                description: description ?? classItem.description
            });
            const updated = await models_1.Class.findByPk(classItem.id, {
                include: [{ model: models_1.Teacher, as: 'teacher', include: [{ model: models_1.User, as: 'user', attributes: ['fullName'] }] }]
            });
            res.json(mapClass(updated));
        }
        catch (error) {
            next(error);
        }
    }
    static async delete(req, res, next) {
        try {
            const classItem = await models_1.Class.findByPk(Number(req.params.id));
            if (!classItem)
                throw new apiError_1.ApiError(404, 'Класс не найден');
            await classItem.destroy();
            res.json({ message: 'Класс удалён' });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ClassController = ClassController;
//# sourceMappingURL=class.controller.js.map
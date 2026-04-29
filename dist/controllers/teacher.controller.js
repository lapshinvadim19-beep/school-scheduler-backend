"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeacherController = void 0;
const models_1 = require("../models");
const apiError_1 = require("../utils/apiError");
function mapTeacher(teacher) {
    const user = teacher.get('user');
    return {
        id: teacher.id,
        userId: teacher.userId,
        fullName: user?.fullName || '',
        email: user?.email || '',
        avatar: user?.avatar || null,
        subjects: teacher.subjects,
        subject: teacher.subjects[0] || '',
        experience: teacher.experience,
        qualification: teacher.qualification,
        phone: teacher.phone,
        office: teacher.office || ''
    };
}
class TeacherController {
    static async getAll(_req, res, next) {
        try {
            const teachers = await models_1.Teacher.findAll({
                include: [{ model: models_1.User, as: 'user', attributes: ['id', 'fullName', 'email', 'avatar'] }],
                order: [['id', 'ASC']]
            });
            res.json(teachers.map((teacher) => mapTeacher(teacher)));
        }
        catch (error) {
            next(error);
        }
    }
    static async getById(req, res, next) {
        try {
            const teacher = await models_1.Teacher.findByPk(Number(req.params.id), {
                include: [{ model: models_1.User, as: 'user', attributes: ['id', 'fullName', 'email', 'avatar'] }]
            });
            if (!teacher)
                throw new apiError_1.ApiError(404, 'Преподаватель не найден');
            res.json(mapTeacher(teacher));
        }
        catch (error) {
            next(error);
        }
    }
    static async create(req, res, next) {
        try {
            const { userId, fullName, email, password = 'teacher123', subjects = [], experience = 0, qualification = 'Без категории', phone = '', office = '' } = req.body;
            let resolvedUserId;
            if (userId) {
                const existingUser = await models_1.User.findByPk(Number(userId));
                if (!existingUser)
                    throw new apiError_1.ApiError(404, 'Пользователь не найден');
                await existingUser.update({ role: 'teacher' });
                resolvedUserId = existingUser.id;
            }
            else {
                if (!email || !fullName)
                    throw new apiError_1.ApiError(400, 'Для создания преподавателя необходимо указать fullName и email');
                const emailExists = await models_1.User.findOne({ where: { email } });
                if (emailExists)
                    throw new apiError_1.ApiError(400, 'Пользователь с таким email уже существует');
                const createdUser = await models_1.User.create({ email, password, fullName, role: 'teacher' });
                resolvedUserId = createdUser.id;
            }
            const duplicate = await models_1.Teacher.findOne({ where: { userId: resolvedUserId } });
            if (duplicate)
                throw new apiError_1.ApiError(400, 'Для этого пользователя профиль преподавателя уже создан');
            const teacher = await models_1.Teacher.create({
                userId: resolvedUserId,
                subjects: Array.isArray(subjects) ? subjects : String(subjects).split(',').map((item) => item.trim()).filter(Boolean),
                experience: Number(experience) || 0,
                qualification,
                phone,
                office
            });
            const created = await models_1.Teacher.findByPk(teacher.id, {
                include: [{ model: models_1.User, as: 'user', attributes: ['id', 'fullName', 'email', 'avatar'] }]
            });
            res.status(201).json(mapTeacher(created));
        }
        catch (error) {
            next(error);
        }
    }
    static async update(req, res, next) {
        try {
            const teacher = await models_1.Teacher.findByPk(Number(req.params.id), {
                include: [{ model: models_1.User, as: 'user', attributes: ['id', 'fullName', 'email', 'avatar'] }]
            });
            if (!teacher)
                throw new apiError_1.ApiError(404, 'Преподаватель не найден');
            const { fullName, email, subjects = teacher.subjects, experience = teacher.experience, qualification = teacher.qualification, phone = teacher.phone, office = teacher.office } = req.body;
            const user = await models_1.User.findByPk(teacher.userId);
            if (user) {
                await user.update({
                    fullName: fullName ?? user.fullName,
                    email: email ?? user.email,
                    role: 'teacher'
                });
            }
            await teacher.update({
                subjects: Array.isArray(subjects) ? subjects : String(subjects).split(',').map((item) => item.trim()).filter(Boolean),
                experience: Number(experience) || 0,
                qualification,
                phone,
                office
            });
            const updated = await models_1.Teacher.findByPk(teacher.id, {
                include: [{ model: models_1.User, as: 'user', attributes: ['id', 'fullName', 'email', 'avatar'] }]
            });
            res.json(mapTeacher(updated));
        }
        catch (error) {
            next(error);
        }
    }
    static async delete(req, res, next) {
        try {
            const teacher = await models_1.Teacher.findByPk(Number(req.params.id));
            if (!teacher)
                throw new apiError_1.ApiError(404, 'Преподаватель не найден');
            const user = await models_1.User.findByPk(teacher.userId);
            if (user)
                await user.update({ role: 'student' });
            await teacher.destroy();
            res.json({ message: 'Преподаватель удалён' });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.TeacherController = TeacherController;
//# sourceMappingURL=teacher.controller.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleController = void 0;
const sequelize_1 = require("sequelize");
const models_1 = require("../models");
const schedule_service_1 = require("../services/schedule.service");
const apiError_1 = require("../utils/apiError");
const PERIOD_TIMES = {
    1: { startTime: '08:30', endTime: '09:15' },
    2: { startTime: '09:25', endTime: '10:10' },
    3: { startTime: '10:30', endTime: '11:15' },
    4: { startTime: '11:25', endTime: '12:10' },
    5: { startTime: '12:30', endTime: '13:15' },
    6: { startTime: '13:25', endTime: '14:10' },
    7: { startTime: '14:20', endTime: '15:05' },
    8: { startTime: '15:15', endTime: '16:00' }
};
function mapLesson(lesson) {
    const classModel = lesson.get('class');
    const teacher = lesson.get('teacher');
    const subject = lesson.get('subject');
    const teacherUser = teacher?.get('user');
    return {
        id: lesson.id,
        classId: lesson.classId,
        teacherId: lesson.teacherId,
        subjectId: lesson.subjectId,
        room: lesson.room,
        dayOfWeek: lesson.dayOfWeek,
        period: lesson.period,
        startTime: lesson.startTime,
        endTime: lesson.endTime,
        weekType: lesson.weekType,
        className: classModel?.name || '',
        teacherName: teacherUser?.fullName || '',
        subjectName: subject?.name || ''
    };
}
async function fetchLessons(where) {
    const lessons = await models_1.Lesson.findAll({
        where,
        include: [
            { model: models_1.Class, as: 'class' },
            { model: models_1.Teacher, as: 'teacher', include: [{ model: models_1.User, as: 'user', attributes: ['fullName'] }] },
            { model: models_1.Subject, as: 'subject' }
        ],
        order: [['dayOfWeek', 'ASC'], ['period', 'ASC']]
    });
    return lessons.map((lesson) => mapLesson(lesson));
}
async function findFirstAvailableSlot(classId, teacherId, room, weekType = 'both') {
    for (let dayOfWeek = 1; dayOfWeek <= 5; dayOfWeek += 1) {
        for (let period = 1; period <= 8; period += 1) {
            try {
                await (0, schedule_service_1.ensureNoLessonConflict)({ classId, teacherId, room, dayOfWeek, period, weekType });
                return {
                    dayOfWeek,
                    period,
                    ...PERIOD_TIMES[period]
                };
            }
            catch {
                // try next slot
            }
        }
    }
    return null;
}
class ScheduleController {
    static async getSchedule(req, res, next) {
        try {
            const where = {};
            if (req.query.classId)
                where.classId = Number(req.query.classId);
            if (req.query.teacherId)
                where.teacherId = Number(req.query.teacherId);
            if (req.query.dayOfWeek)
                where.dayOfWeek = Number(req.query.dayOfWeek);
            res.json(await fetchLessons(where));
        }
        catch (error) {
            next(error);
        }
    }
    static async getClassSchedule(req, res, next) {
        try {
            res.json(await fetchLessons({ classId: Number(req.params.classId) }));
        }
        catch (error) {
            next(error);
        }
    }
    static async getTeacherSchedule(req, res, next) {
        try {
            res.json(await fetchLessons({ teacherId: Number(req.params.teacherId) }));
        }
        catch (error) {
            next(error);
        }
    }
    static async getRoomSchedule(req, res, next) {
        try {
            res.json(await fetchLessons({ room: req.params.room }));
        }
        catch (error) {
            next(error);
        }
    }
    static async createLesson(req, res, next) {
        try {
            const payloads = Array.isArray(req.body) ? req.body : [req.body];
            const createdItems = [];
            for (const payload of payloads) {
                const normalized = {
                    classId: Number(payload.classId),
                    teacherId: Number(payload.teacherId),
                    subjectId: Number(payload.subjectId),
                    room: String(payload.room),
                    dayOfWeek: Number(payload.dayOfWeek),
                    period: Number(payload.period),
                    startTime: String(payload.startTime),
                    endTime: String(payload.endTime),
                    weekType: (payload.weekType || 'both')
                };
                await (0, schedule_service_1.ensureNoLessonConflict)(normalized);
                const lesson = await models_1.Lesson.create(normalized);
                createdItems.push(lesson);
            }
            const ids = createdItems.map((item) => item.id);
            const result = await fetchLessons({ id: { [sequelize_1.Op.in]: ids } });
            res.status(201).json(Array.isArray(req.body) ? result : result[0]);
        }
        catch (error) {
            next(error);
        }
    }
    static async updateLesson(req, res, next) {
        try {
            const lesson = await models_1.Lesson.findByPk(Number(req.params.id));
            if (!lesson)
                throw new apiError_1.ApiError(404, 'Занятие не найдено');
            const payload = {
                classId: req.body.classId !== undefined ? Number(req.body.classId) : lesson.classId,
                teacherId: req.body.teacherId !== undefined ? Number(req.body.teacherId) : lesson.teacherId,
                subjectId: req.body.subjectId !== undefined ? Number(req.body.subjectId) : lesson.subjectId,
                room: req.body.room ?? lesson.room,
                dayOfWeek: req.body.dayOfWeek !== undefined ? Number(req.body.dayOfWeek) : lesson.dayOfWeek,
                period: req.body.period !== undefined ? Number(req.body.period) : lesson.period,
                startTime: req.body.startTime ?? lesson.startTime,
                endTime: req.body.endTime ?? lesson.endTime,
                weekType: (req.body.weekType ?? lesson.weekType)
            };
            await (0, schedule_service_1.ensureNoLessonConflict)({ ...payload, excludeId: lesson.id });
            await lesson.update(payload);
            const result = await fetchLessons({ id: lesson.id });
            res.json(result[0]);
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteLesson(req, res, next) {
        try {
            const lesson = await models_1.Lesson.findByPk(Number(req.params.id));
            if (!lesson)
                throw new apiError_1.ApiError(404, 'Занятие не найдено');
            await lesson.destroy();
            res.json({ message: 'Занятие удалено' });
        }
        catch (error) {
            next(error);
        }
    }
    static async generateForClass(req, res, next) {
        try {
            const classId = Number(req.params.classId);
            const replaceExisting = req.body?.replaceExisting === true;
            const classModel = await models_1.Class.findByPk(classId);
            if (!classModel)
                throw new apiError_1.ApiError(404, 'Класс не найден');
            const loads = await models_1.TeachingLoad.findAll({ where: { classId, isActive: true }, order: [['id', 'ASC']] });
            if (loads.length === 0)
                throw new apiError_1.ApiError(400, 'Для класса не задана учебная нагрузка');
            if (replaceExisting) {
                await models_1.Lesson.destroy({ where: { classId } });
            }
            const existingLessons = await models_1.Lesson.findAll({ where: { classId } });
            const existingKeyCount = new Map();
            for (const lesson of existingLessons) {
                const key = `${lesson.classId}:${lesson.teacherId}:${lesson.subjectId}`;
                existingKeyCount.set(key, (existingKeyCount.get(key) || 0) + 1);
            }
            const createdLessonIds = [];
            const skipped = [];
            for (const load of loads) {
                const key = `${load.classId}:${load.teacherId}:${load.subjectId}`;
                const existingCount = existingKeyCount.get(key) || 0;
                const missingCount = Math.max(0, load.hoursPerWeek - existingCount);
                for (let index = 0; index < missingCount; index += 1) {
                    const slot = await findFirstAvailableSlot(load.classId, load.teacherId, load.room || 'Кабинет не указан');
                    if (!slot) {
                        skipped.push({ loadId: load.id, reason: 'Свободный слот не найден' });
                        break;
                    }
                    const lesson = await models_1.Lesson.create({
                        classId: load.classId,
                        teacherId: load.teacherId,
                        subjectId: load.subjectId,
                        room: load.room || 'Кабинет не указан',
                        dayOfWeek: slot.dayOfWeek,
                        period: slot.period,
                        startTime: slot.startTime,
                        endTime: slot.endTime,
                        weekType: 'both'
                    });
                    createdLessonIds.push(lesson.id);
                    existingKeyCount.set(key, (existingKeyCount.get(key) || 0) + 1);
                }
            }
            const createdLessons = createdLessonIds.length > 0 ? await fetchLessons({ id: { [sequelize_1.Op.in]: createdLessonIds } }) : [];
            const schedule = await fetchLessons({ classId });
            res.json({
                message: createdLessons.length > 0 ? 'Занятия автоматически добавлены в сетку класса' : 'Новые занятия не были созданы',
                createdLessons,
                skipped,
                schedule
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ScheduleController = ScheduleController;
//# sourceMappingURL=schedule.controller.js.map
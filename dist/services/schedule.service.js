"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureNoLessonConflict = ensureNoLessonConflict;
const sequelize_1 = require("sequelize");
const models_1 = require("../models");
const apiError_1 = require("../utils/apiError");
function overlapCondition(weekType) {
    if (weekType === 'both') {
        return { [sequelize_1.Op.in]: ['even', 'odd', 'both'] };
    }
    return { [sequelize_1.Op.in]: [weekType, 'both'] };
}
async function ensureNoLessonConflict(payload) {
    const { teacherId, classId, room, dayOfWeek, period, weekType, excludeId } = payload;
    const whereBase = {
        dayOfWeek,
        period,
        id: excludeId ? { [sequelize_1.Op.ne]: excludeId } : { [sequelize_1.Op.ne]: 0 },
        weekType: overlapCondition(weekType)
    };
    const [teacherConflict, classConflict, roomConflict] = await Promise.all([
        models_1.Lesson.findOne({ where: { ...whereBase, teacherId } }),
        models_1.Lesson.findOne({ where: { ...whereBase, classId } }),
        models_1.Lesson.findOne({ where: { ...whereBase, room } })
    ]);
    if (teacherConflict)
        throw new apiError_1.ApiError(409, 'У преподавателя уже есть занятие в указанное время');
    if (classConflict)
        throw new apiError_1.ApiError(409, 'У класса уже есть занятие в указанное время');
    if (roomConflict)
        throw new apiError_1.ApiError(409, 'Кабинет уже занят в указанное время');
}
//# sourceMappingURL=schedule.service.js.map
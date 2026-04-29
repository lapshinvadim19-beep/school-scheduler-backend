"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDemoData = seedDemoData;
const models_1 = require("../models");
async function seedDemoData() {
    const usersCount = await models_1.User.count();
    if (usersCount > 0)
        return;
    const admin = await models_1.User.create({
        email: 'admin@school.ru',
        password: 'admin123',
        fullName: 'Администратор школы',
        role: 'admin'
    });
    const teacherUser = await models_1.User.create({
        email: 'teacher@school.ru',
        password: 'teacher123',
        fullName: 'Иванов Иван Иванович',
        role: 'teacher'
    });
    const student = await models_1.User.create({
        email: 'student@school.ru',
        password: 'student123',
        fullName: 'Петров Пётр Сергеевич',
        role: 'student'
    });
    const teacher = await models_1.Teacher.create({
        userId: teacherUser.id,
        subjects: ['Математика', 'Алгебра'],
        experience: 12,
        qualification: 'Высшая категория',
        phone: '+7 (900) 111-22-33',
        office: '301'
    });
    const subjectMath = await models_1.Subject.create({
        name: 'Математика',
        shortName: 'Мат.',
        hoursPerWeek: 5,
        department: 'Точные науки',
        color: '#2563EB'
    });
    const subjectPhysics = await models_1.Subject.create({
        name: 'Физика',
        shortName: 'Физ.',
        hoursPerWeek: 3,
        department: 'Точные науки',
        color: '#7C3AED'
    });
    const class10a = await models_1.Class.create({
        name: '10А',
        grade: '10',
        studentsCount: 25,
        teacherId: teacher.id,
        description: 'Профильный класс'
    });
    const class11a = await models_1.Class.create({
        name: '11А',
        grade: '11',
        studentsCount: 22,
        teacherId: teacher.id,
        description: 'Выпускной класс'
    });
    await models_1.TeachingLoad.bulkCreate([
        { classId: class10a.id, teacherId: teacher.id, subjectId: subjectMath.id, room: '301', hoursPerWeek: 2 },
        { classId: class10a.id, teacherId: teacher.id, subjectId: subjectPhysics.id, room: '305', hoursPerWeek: 1 },
        { classId: class11a.id, teacherId: teacher.id, subjectId: subjectMath.id, room: '301', hoursPerWeek: 1 }
    ]);
    await models_1.Lesson.bulkCreate([
        {
            classId: class10a.id,
            teacherId: teacher.id,
            subjectId: subjectMath.id,
            room: '301',
            dayOfWeek: 1,
            period: 1,
            startTime: '08:30',
            endTime: '09:15',
            weekType: 'both'
        },
        {
            classId: class10a.id,
            teacherId: teacher.id,
            subjectId: subjectPhysics.id,
            room: '305',
            dayOfWeek: 3,
            period: 3,
            startTime: '10:30',
            endTime: '11:15',
            weekType: 'both'
        },
        {
            classId: class11a.id,
            teacherId: teacher.id,
            subjectId: subjectMath.id,
            room: '301',
            dayOfWeek: 5,
            period: 2,
            startTime: '09:25',
            endTime: '10:10',
            weekType: 'both'
        }
    ]);
    await models_1.Report.create({
        userId: student.id,
        description: 'В расписании 10А нужно проверить кабинет для урока физики.',
        status: 'pending'
    });
    await models_1.Report.create({
        userId: teacherUser.id,
        description: 'Необходимо уточнить замену урока на пятницу.',
        status: 'in_progress',
        adminResponse: `Проверку выполняет ${admin.fullName}.`
    });
}
//# sourceMappingURL=seed.js.map
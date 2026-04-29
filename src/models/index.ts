import { Class } from './Class'
import { Lesson } from './Lesson'
import { Report } from './Report'
import { Subject } from './Subject'
import { Teacher } from './Teacher'
import { TeachingLoad } from './TeachingLoad'
import { User } from './User'

User.hasOne(Teacher, { foreignKey: 'userId', as: 'teacherProfile', onDelete: 'CASCADE' })
Teacher.belongsTo(User, { foreignKey: 'userId', as: 'user' })

Teacher.hasMany(Class, { foreignKey: 'teacherId', as: 'classes' })
Class.belongsTo(Teacher, { foreignKey: 'teacherId', as: 'teacher' })

Class.hasMany(Lesson, { foreignKey: 'classId', as: 'lessons', onDelete: 'CASCADE' })
Teacher.hasMany(Lesson, { foreignKey: 'teacherId', as: 'lessons', onDelete: 'CASCADE' })
Subject.hasMany(Lesson, { foreignKey: 'subjectId', as: 'lessons', onDelete: 'CASCADE' })

Class.hasMany(TeachingLoad, { foreignKey: 'classId', as: 'teachingLoads', onDelete: 'CASCADE' })
Teacher.hasMany(TeachingLoad, { foreignKey: 'teacherId', as: 'teachingLoads', onDelete: 'CASCADE' })
Subject.hasMany(TeachingLoad, { foreignKey: 'subjectId', as: 'teachingLoads', onDelete: 'CASCADE' })

TeachingLoad.belongsTo(Class, { foreignKey: 'classId', as: 'class' })
TeachingLoad.belongsTo(Teacher, { foreignKey: 'teacherId', as: 'teacher' })
TeachingLoad.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' })

Lesson.belongsTo(Class, { foreignKey: 'classId', as: 'class' })
Lesson.belongsTo(Teacher, { foreignKey: 'teacherId', as: 'teacher' })
Lesson.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' })

User.hasMany(Report, { foreignKey: 'userId', as: 'reports', onDelete: 'CASCADE' })
Report.belongsTo(User, { foreignKey: 'userId', as: 'user' })
Lesson.hasMany(Report, { foreignKey: 'lessonId', as: 'reports', onDelete: 'SET NULL' })
Report.belongsTo(Lesson, { foreignKey: 'lessonId', as: 'lesson' })

export { User, Teacher, Subject, Class, Lesson, Report, TeachingLoad }

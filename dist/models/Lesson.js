"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lesson = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Lesson extends sequelize_1.Model {
}
exports.Lesson = Lesson;
Lesson.init({
    id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    classId: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, references: { model: 'classes', key: 'id' } },
    teacherId: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, references: { model: 'teachers', key: 'id' } },
    subjectId: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, references: { model: 'subjects', key: 'id' } },
    room: { type: sequelize_1.DataTypes.STRING(30), allowNull: false },
    dayOfWeek: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 6 } },
    period: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 8 } },
    startTime: { type: sequelize_1.DataTypes.STRING(5), allowNull: false },
    endTime: { type: sequelize_1.DataTypes.STRING(5), allowNull: false },
    weekType: { type: sequelize_1.DataTypes.ENUM('even', 'odd', 'both'), allowNull: false, defaultValue: 'both' }
}, {
    sequelize: database_1.sequelize,
    tableName: 'lessons',
    timestamps: true,
    indexes: [
        { fields: ['classId', 'dayOfWeek', 'period', 'weekType'] },
        { fields: ['teacherId', 'dayOfWeek', 'period', 'weekType'] }
    ]
});
//# sourceMappingURL=Lesson.js.map
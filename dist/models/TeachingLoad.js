"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeachingLoad = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class TeachingLoad extends sequelize_1.Model {
}
exports.TeachingLoad = TeachingLoad;
TeachingLoad.init({
    id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    classId: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, references: { model: 'classes', key: 'id' } },
    teacherId: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, references: { model: 'teachers', key: 'id' } },
    subjectId: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, references: { model: 'subjects', key: 'id' } },
    room: { type: sequelize_1.DataTypes.STRING(30), allowNull: false, defaultValue: '' },
    hoursPerWeek: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, defaultValue: 1, validate: { min: 1, max: 12 } },
    isActive: { type: sequelize_1.DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
}, {
    sequelize: database_1.sequelize,
    tableName: 'teaching_loads',
    timestamps: true,
    indexes: [
        { fields: ['classId', 'teacherId', 'subjectId'] }
    ]
});
//# sourceMappingURL=TeachingLoad.js.map
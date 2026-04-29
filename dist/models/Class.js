"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Class = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Class extends sequelize_1.Model {
}
exports.Class = Class;
Class.init({
    id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: sequelize_1.DataTypes.STRING(20), allowNull: false, unique: true },
    grade: { type: sequelize_1.DataTypes.STRING(10), allowNull: false },
    studentsCount: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    teacherId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'teachers', key: 'id' }
    },
    description: { type: sequelize_1.DataTypes.TEXT, allowNull: true }
}, {
    sequelize: database_1.sequelize,
    tableName: 'classes',
    timestamps: true
});
//# sourceMappingURL=Class.js.map
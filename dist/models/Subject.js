"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Subject = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Subject extends sequelize_1.Model {
}
exports.Subject = Subject;
Subject.init({
    id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: sequelize_1.DataTypes.STRING(255), allowNull: false, unique: true },
    shortName: { type: sequelize_1.DataTypes.STRING(50), allowNull: false },
    hoursPerWeek: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    department: { type: sequelize_1.DataTypes.STRING(100), allowNull: false, defaultValue: 'Общее образование' },
    color: { type: sequelize_1.DataTypes.STRING(20), allowNull: false, defaultValue: '#3B82F6' },
    isActive: { type: sequelize_1.DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
}, {
    sequelize: database_1.sequelize,
    tableName: 'subjects',
    timestamps: true
});
//# sourceMappingURL=Subject.js.map
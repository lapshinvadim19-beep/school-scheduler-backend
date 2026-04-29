"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Report = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Report extends sequelize_1.Model {
}
exports.Report = Report;
Report.init({
    id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
    lessonId: { type: sequelize_1.DataTypes.INTEGER, allowNull: true, references: { model: 'lessons', key: 'id' } },
    description: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
    status: {
        type: sequelize_1.DataTypes.ENUM('pending', 'in_progress', 'resolved', 'rejected'),
        allowNull: false,
        defaultValue: 'pending'
    },
    adminResponse: { type: sequelize_1.DataTypes.TEXT, allowNull: true }
}, {
    sequelize: database_1.sequelize,
    tableName: 'reports',
    timestamps: true
});
//# sourceMappingURL=Report.js.map
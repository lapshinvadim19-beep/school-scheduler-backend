"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Teacher = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Teacher extends sequelize_1.Model {
}
exports.Teacher = Teacher;
Teacher.init({
    id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: { model: 'users', key: 'id' }
    },
    subjects: { type: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.STRING), allowNull: false, defaultValue: [] },
    experience: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    qualification: { type: sequelize_1.DataTypes.STRING(100), allowNull: false, defaultValue: 'Без категории' },
    phone: { type: sequelize_1.DataTypes.STRING(30), allowNull: false, defaultValue: '' },
    office: { type: sequelize_1.DataTypes.STRING(50), allowNull: true }
}, {
    sequelize: database_1.sequelize,
    tableName: 'teachers',
    timestamps: true
});
//# sourceMappingURL=Teacher.js.map
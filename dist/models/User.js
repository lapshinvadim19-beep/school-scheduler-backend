"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class User extends sequelize_1.Model {
    async validatePassword(password) {
        return bcryptjs_1.default.compare(password, this.password);
    }
}
exports.User = User;
User.init({
    id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    email: { type: sequelize_1.DataTypes.STRING(255), allowNull: false, unique: true, validate: { isEmail: true } },
    password: { type: sequelize_1.DataTypes.STRING(255), allowNull: false },
    fullName: { type: sequelize_1.DataTypes.STRING(255), allowNull: false },
    role: {
        type: sequelize_1.DataTypes.ENUM('admin', 'teacher', 'student'),
        allowNull: false,
        defaultValue: 'student'
    },
    avatar: { type: sequelize_1.DataTypes.STRING(500), allowNull: true },
    isActive: { type: sequelize_1.DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
}, {
    sequelize: database_1.sequelize,
    tableName: 'users',
    timestamps: true,
    hooks: {
        beforeCreate: async (user) => {
            user.password = await bcryptjs_1.default.hash(user.password, 10);
        },
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                user.password = await bcryptjs_1.default.hash(user.password, 10);
            }
        }
    }
});
//# sourceMappingURL=User.js.map
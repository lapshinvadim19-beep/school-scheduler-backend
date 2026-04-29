"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildAuthResponse = buildAuthResponse;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function buildAuthResponse(user) {
    const options = {
        expiresIn: (process.env.JWT_EXPIRES_IN || '7d')
    };
    const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'secret', options);
    return {
        token,
        user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            avatar: user.avatar
        }
    };
}
//# sourceMappingURL=auth.service.js.map
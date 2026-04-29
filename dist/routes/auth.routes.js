"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.post('/login', auth_controller_1.AuthController.login);
router.post('/register', auth_controller_1.AuthController.register);
router.get('/profile', auth_middleware_1.authMiddleware, auth_controller_1.AuthController.getProfile);
router.post('/logout', auth_middleware_1.authMiddleware, auth_controller_1.AuthController.logout);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map
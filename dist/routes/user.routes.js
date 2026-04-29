"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
router.get('/me', user_controller_1.UserController.getCurrentUser);
router.put('/me', user_controller_1.UserController.updateCurrentUser);
router.get('/', (0, auth_middleware_1.roleMiddleware)(['admin']), user_controller_1.UserController.getAllUsers);
router.put('/:id', (0, auth_middleware_1.roleMiddleware)(['admin']), user_controller_1.UserController.updateUser);
router.delete('/:id', (0, auth_middleware_1.roleMiddleware)(['admin']), user_controller_1.UserController.deleteUser);
exports.default = router;
//# sourceMappingURL=user.routes.js.map
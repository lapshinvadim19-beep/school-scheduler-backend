"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const teacher_controller_1 = require("../controllers/teacher.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
router.get('/', teacher_controller_1.TeacherController.getAll);
router.get('/:id', teacher_controller_1.TeacherController.getById);
router.post('/', (0, auth_middleware_1.roleMiddleware)(['admin']), teacher_controller_1.TeacherController.create);
router.put('/:id', (0, auth_middleware_1.roleMiddleware)(['admin']), teacher_controller_1.TeacherController.update);
router.delete('/:id', (0, auth_middleware_1.roleMiddleware)(['admin']), teacher_controller_1.TeacherController.delete);
exports.default = router;
//# sourceMappingURL=teacher.routes.js.map
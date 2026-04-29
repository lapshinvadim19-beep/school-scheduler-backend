"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const class_controller_1 = require("../controllers/class.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
router.get('/', class_controller_1.ClassController.getAll);
router.get('/:id', class_controller_1.ClassController.getById);
router.post('/', (0, auth_middleware_1.roleMiddleware)(['admin']), class_controller_1.ClassController.create);
router.put('/:id', (0, auth_middleware_1.roleMiddleware)(['admin']), class_controller_1.ClassController.update);
router.delete('/:id', (0, auth_middleware_1.roleMiddleware)(['admin']), class_controller_1.ClassController.delete);
exports.default = router;
//# sourceMappingURL=class.routes.js.map
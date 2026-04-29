"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const subject_controller_1 = require("../controllers/subject.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
router.get('/', subject_controller_1.SubjectController.getAll);
router.get('/:id', subject_controller_1.SubjectController.getById);
router.post('/', (0, auth_middleware_1.roleMiddleware)(['admin']), subject_controller_1.SubjectController.create);
router.put('/:id', (0, auth_middleware_1.roleMiddleware)(['admin']), subject_controller_1.SubjectController.update);
router.delete('/:id', (0, auth_middleware_1.roleMiddleware)(['admin']), subject_controller_1.SubjectController.delete);
exports.default = router;
//# sourceMappingURL=subject.routes.js.map
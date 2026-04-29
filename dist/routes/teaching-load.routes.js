"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const teaching_load_controller_1 = require("../controllers/teaching-load.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
router.get('/', teaching_load_controller_1.TeachingLoadController.getAll);
router.post('/', (0, auth_middleware_1.roleMiddleware)(['admin']), teaching_load_controller_1.TeachingLoadController.create);
router.put('/:id', (0, auth_middleware_1.roleMiddleware)(['admin']), teaching_load_controller_1.TeachingLoadController.update);
router.delete('/:id', (0, auth_middleware_1.roleMiddleware)(['admin']), teaching_load_controller_1.TeachingLoadController.delete);
exports.default = router;
//# sourceMappingURL=teaching-load.routes.js.map
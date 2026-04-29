"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const schedule_controller_1 = require("../controllers/schedule.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
router.get('/', schedule_controller_1.ScheduleController.getSchedule);
router.get('/class/:classId', schedule_controller_1.ScheduleController.getClassSchedule);
router.get('/teacher/:teacherId', schedule_controller_1.ScheduleController.getTeacherSchedule);
router.get('/room/:room', schedule_controller_1.ScheduleController.getRoomSchedule);
router.post('/generate/class/:classId', (0, auth_middleware_1.roleMiddleware)(['admin']), schedule_controller_1.ScheduleController.generateForClass);
router.post('/lessons', (0, auth_middleware_1.roleMiddleware)(['admin']), schedule_controller_1.ScheduleController.createLesson);
router.put('/lessons/:id', (0, auth_middleware_1.roleMiddleware)(['admin']), schedule_controller_1.ScheduleController.updateLesson);
router.delete('/lessons/:id', (0, auth_middleware_1.roleMiddleware)(['admin']), schedule_controller_1.ScheduleController.deleteLesson);
exports.default = router;
//# sourceMappingURL=schedule.routes.js.map
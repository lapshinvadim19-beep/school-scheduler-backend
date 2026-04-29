"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const report_controller_1 = require("../controllers/report.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
router.get('/my', report_controller_1.ReportController.getMyReports);
router.get('/', report_controller_1.ReportController.getAll);
router.get('/:id', report_controller_1.ReportController.getById);
router.post('/', report_controller_1.ReportController.create);
router.put('/:id/status', (0, auth_middleware_1.roleMiddleware)(['admin']), report_controller_1.ReportController.updateStatus);
router.delete('/:id', (0, auth_middleware_1.roleMiddleware)(['admin']), report_controller_1.ReportController.delete);
exports.default = router;
//# sourceMappingURL=report.routes.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVisibleReports = getVisibleReports;
const models_1 = require("../models");
async function getVisibleReports(userId, isAdmin) {
    if (isAdmin) {
        return models_1.Report.findAll();
    }
    return models_1.Report.findAll({ where: { userId } });
}
//# sourceMappingURL=report.service.js.map
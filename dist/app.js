"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const class_routes_1 = __importDefault(require("./routes/class.routes"));
const report_routes_1 = __importDefault(require("./routes/report.routes"));
const schedule_routes_1 = __importDefault(require("./routes/schedule.routes"));
const subject_routes_1 = __importDefault(require("./routes/subject.routes"));
const teacher_routes_1 = __importDefault(require("./routes/teacher.routes"));
const teaching_load_routes_1 = __importDefault(require("./routes/teaching-load.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const database_1 = require("./config/database");
const error_middleware_1 = require("./middleware/error.middleware");
require("./models");
const seed_1 = require("./utils/seed");
const logger_1 = require("./utils/logger");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT || 5000);
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));
app.use((0, helmet_1.default)());
app.use('/api', (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 300
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.use('/api/auth', auth_routes_1.default);
app.use('/api/users', user_routes_1.default);
app.use('/api/teachers', teacher_routes_1.default);
app.use('/api/teaching-loads', teaching_load_routes_1.default);
app.use('/api/classes', class_routes_1.default);
app.use('/api/subjects', subject_routes_1.default);
app.use('/api/schedule', schedule_routes_1.default);
app.use('/api/reports', report_routes_1.default);
app.use(error_middleware_1.notFound);
app.use(error_middleware_1.errorHandler);
async function startServer() {
    try {
        await (0, database_1.testConnection)();
        await database_1.sequelize.sync();
        if (process.env.SEED_DEMO_DATA !== 'false') {
            await (0, seed_1.seedDemoData)();
        }
        app.listen(PORT, () => {
            logger_1.logger.info(`Backend started on http://localhost:${PORT}`);
        });
    }
    catch (error) {
        logger_1.logger.error('Unable to start server', error);
        process.exit(1);
    }
}
startServer();
exports.default = app;
//# sourceMappingURL=app.js.map
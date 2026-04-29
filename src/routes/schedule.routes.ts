import { Router } from 'express'
import { ScheduleController } from '../controllers/schedule.controller'
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware'

const router = Router()

router.use(authMiddleware)
router.get('/', ScheduleController.getSchedule)
router.get('/class/:classId', ScheduleController.getClassSchedule)
router.get('/teacher/:teacherId', ScheduleController.getTeacherSchedule)
router.get('/room/:room', ScheduleController.getRoomSchedule)
router.post('/generate/class/:classId', roleMiddleware(['admin']), ScheduleController.generateForClass)
router.post('/lessons', roleMiddleware(['admin']), ScheduleController.createLesson)
router.put('/lessons/:id', roleMiddleware(['admin']), ScheduleController.updateLesson)
router.delete('/lessons/:id', roleMiddleware(['admin']), ScheduleController.deleteLesson)

export default router

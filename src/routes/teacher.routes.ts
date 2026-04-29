import { Router } from 'express'
import { TeacherController } from '../controllers/teacher.controller'
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware'

const router = Router()

router.use(authMiddleware)
router.get('/', TeacherController.getAll)
router.get('/:id', TeacherController.getById)
router.post('/', roleMiddleware(['admin']), TeacherController.create)
router.put('/:id', roleMiddleware(['admin']), TeacherController.update)
router.delete('/:id', roleMiddleware(['admin']), TeacherController.delete)

export default router

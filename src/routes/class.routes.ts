import { Router } from 'express'
import { ClassController } from '../controllers/class.controller'
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware'

const router = Router()

router.use(authMiddleware)
router.get('/', ClassController.getAll)
router.get('/:id', ClassController.getById)
router.post('/', roleMiddleware(['admin']), ClassController.create)
router.put('/:id', roleMiddleware(['admin']), ClassController.update)
router.delete('/:id', roleMiddleware(['admin']), ClassController.delete)

export default router

import { Router } from 'express'
import { TeachingLoadController } from '../controllers/teaching-load.controller'
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware'

const router = Router()

router.use(authMiddleware)
router.get('/', TeachingLoadController.getAll)
router.post('/', roleMiddleware(['admin']), TeachingLoadController.create)
router.put('/:id', roleMiddleware(['admin']), TeachingLoadController.update)
router.delete('/:id', roleMiddleware(['admin']), TeachingLoadController.delete)

export default router

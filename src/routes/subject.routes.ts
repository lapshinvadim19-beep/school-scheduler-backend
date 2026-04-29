import { Router } from 'express'
import { SubjectController } from '../controllers/subject.controller'
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware'

const router = Router()

router.use(authMiddleware)
router.get('/', SubjectController.getAll)
router.get('/:id', SubjectController.getById)
router.post('/', roleMiddleware(['admin']), SubjectController.create)
router.put('/:id', roleMiddleware(['admin']), SubjectController.update)
router.delete('/:id', roleMiddleware(['admin']), SubjectController.delete)

export default router

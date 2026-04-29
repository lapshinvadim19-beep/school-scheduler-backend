import { Router } from 'express'
import { UserController } from '../controllers/user.controller'
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware'

const router = Router()

router.use(authMiddleware)
router.get('/me', UserController.getCurrentUser)
router.put('/me', UserController.updateCurrentUser)
router.get('/', roleMiddleware(['admin']), UserController.getAllUsers)
router.put('/:id', roleMiddleware(['admin']), UserController.updateUser)
router.delete('/:id', roleMiddleware(['admin']), UserController.deleteUser)

export default router

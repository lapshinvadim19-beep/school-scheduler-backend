import { Router } from 'express'
import { ReportController } from '../controllers/report.controller'
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware'

const router = Router()

router.use(authMiddleware)
router.get('/my', ReportController.getMyReports)
router.get('/', ReportController.getAll)
router.get('/:id', ReportController.getById)
router.post('/', ReportController.create)
router.put('/:id/status', roleMiddleware(['admin']), ReportController.updateStatus)
router.delete('/:id', roleMiddleware(['admin']), ReportController.delete)

export default router

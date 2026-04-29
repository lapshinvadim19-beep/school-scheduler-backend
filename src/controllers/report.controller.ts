import { NextFunction, Response } from 'express'
import { AuthRequest } from '../middleware/auth.middleware'
import { Lesson, Report, User } from '../models'
import { ApiError } from '../utils/apiError'

function mapReport(report: Report & { user?: User | null; lesson?: Lesson | null }) {
  const user = report.get('user') as User | undefined
  const lesson = report.get('lesson') as Lesson | undefined
  return {
    id: report.id,
    userId: report.userId,
    userName: user?.fullName || '',
    userRole: user?.role || 'student',
    lessonId: report.lessonId,
    description: report.description,
    status: report.status,
    adminResponse: report.adminResponse,
    lesson: lesson || null,
    createdAt: report.createdAt,
    updatedAt: report.updatedAt
  }
}

async function fetchReports(where?: Record<string, unknown>) {
  const reports = await Report.findAll({
    where,
    include: [
      { model: User, as: 'user', attributes: ['id', 'fullName', 'role'] },
      { model: Lesson, as: 'lesson' }
    ],
    order: [['createdAt', 'DESC']]
  })
  return reports.map((report) => mapReport(report as Report & { user?: User | null; lesson?: Lesson | null }))
}

export class ReportController {
  static async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new ApiError(401, 'Пользователь не авторизован')
      const where = req.user.role === 'admin' ? undefined : { userId: req.user.id }
      res.json(await fetchReports(where))
    } catch (error) {
      next(error)
    }
  }

  static async getMyReports(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new ApiError(401, 'Пользователь не авторизован')
      res.json(await fetchReports({ userId: req.user.id }))
    } catch (error) {
      next(error)
    }
  }

  static async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new ApiError(401, 'Пользователь не авторизован')
      const report = await Report.findByPk(Number(req.params.id), {
        include: [
          { model: User, as: 'user', attributes: ['id', 'fullName', 'role'] },
          { model: Lesson, as: 'lesson' }
        ]
      })
      if (!report) throw new ApiError(404, 'Сообщение не найдено')
      if (req.user.role !== 'admin' && report.userId !== req.user.id) {
        throw new ApiError(403, 'Недостаточно прав для просмотра сообщения')
      }
      res.json(mapReport(report as Report & { user?: User | null; lesson?: Lesson | null }))
    } catch (error) {
      next(error)
    }
  }

  static async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new ApiError(401, 'Пользователь не авторизован')
      const { description, lessonId } = req.body
      const report = await Report.create({
        userId: req.user.id,
        lessonId: lessonId ? Number(lessonId) : null,
        description
      })
      const created = await Report.findByPk(report.id, {
        include: [
          { model: User, as: 'user', attributes: ['id', 'fullName', 'role'] },
          { model: Lesson, as: 'lesson' }
        ]
      })
      res.status(201).json(mapReport(created as Report & { user?: User | null; lesson?: Lesson | null }))
    } catch (error) {
      next(error)
    }
  }

  static async updateStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const report = await Report.findByPk(Number(req.params.id))
      if (!report) throw new ApiError(404, 'Сообщение не найдено')
      const { status, adminResponse } = req.body
      await report.update({ status, adminResponse })
      const updated = await Report.findByPk(report.id, {
        include: [
          { model: User, as: 'user', attributes: ['id', 'fullName', 'role'] },
          { model: Lesson, as: 'lesson' }
        ]
      })
      res.json(mapReport(updated as Report & { user?: User | null; lesson?: Lesson | null }))
    } catch (error) {
      next(error)
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const report = await Report.findByPk(Number(req.params.id))
      if (!report) throw new ApiError(404, 'Сообщение не найдено')
      await report.destroy()
      res.json({ message: 'Сообщение удалено' })
    } catch (error) {
      next(error)
    }
  }
}

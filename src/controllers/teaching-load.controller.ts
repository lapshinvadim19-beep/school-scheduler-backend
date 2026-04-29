import { NextFunction, Request, Response } from 'express'
import { Class, Subject, Teacher, TeachingLoad, User } from '../models'
import { ApiError } from '../utils/apiError'

function mapTeachingLoad(item: TeachingLoad & { class?: Class; teacher?: Teacher; subject?: Subject }) {
  const classModel = item.get('class') as Class | undefined
  const teacher = item.get('teacher') as Teacher | undefined
  const subject = item.get('subject') as Subject | undefined
  const teacherUser = teacher?.get('user') as User | undefined

  return {
    id: item.id,
    classId: item.classId,
    teacherId: item.teacherId,
    subjectId: item.subjectId,
    room: item.room,
    hoursPerWeek: item.hoursPerWeek,
    isActive: item.isActive,
    className: classModel?.name || '',
    teacherName: teacherUser?.fullName || '',
    subjectName: subject?.name || ''
  }
}

async function fetchLoads(where: Record<string, unknown> = {}) {
  const loads = await TeachingLoad.findAll({
    where,
    include: [
      { model: Class, as: 'class' },
      { model: Teacher, as: 'teacher', include: [{ model: User, as: 'user', attributes: ['fullName'] }] },
      { model: Subject, as: 'subject' }
    ],
    order: [['classId', 'ASC'], ['subjectId', 'ASC']]
  })
  return loads.map((item) => mapTeachingLoad(item as TeachingLoad & { class?: Class; teacher?: Teacher; subject?: Subject }))
}

export class TeachingLoadController {
  static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const where: Record<string, unknown> = {}
      if (req.query.classId) where.classId = Number(req.query.classId)
      if (req.query.teacherId) where.teacherId = Number(req.query.teacherId)
      res.json(await fetchLoads(where))
    } catch (error) {
      next(error)
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payload = {
        classId: Number(req.body.classId),
        teacherId: Number(req.body.teacherId),
        subjectId: Number(req.body.subjectId),
        room: String(req.body.room || ''),
        hoursPerWeek: Number(req.body.hoursPerWeek) || 1,
        isActive: req.body.isActive !== false
      }

      const created = await TeachingLoad.create(payload)
      const result = await fetchLoads({ id: created.id })
      res.status(201).json(result[0])
    } catch (error) {
      next(error)
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const load = await TeachingLoad.findByPk(Number(req.params.id))
      if (!load) throw new ApiError(404, 'Нагрузка не найдена')
      await load.update({
        classId: req.body.classId !== undefined ? Number(req.body.classId) : load.classId,
        teacherId: req.body.teacherId !== undefined ? Number(req.body.teacherId) : load.teacherId,
        subjectId: req.body.subjectId !== undefined ? Number(req.body.subjectId) : load.subjectId,
        room: req.body.room !== undefined ? String(req.body.room) : load.room,
        hoursPerWeek: req.body.hoursPerWeek !== undefined ? Number(req.body.hoursPerWeek) : load.hoursPerWeek,
        isActive: req.body.isActive !== undefined ? Boolean(req.body.isActive) : load.isActive
      })
      const result = await fetchLoads({ id: load.id })
      res.json(result[0])
    } catch (error) {
      next(error)
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const load = await TeachingLoad.findByPk(Number(req.params.id))
      if (!load) throw new ApiError(404, 'Нагрузка не найдена')
      await load.destroy()
      res.json({ message: 'Нагрузка удалена' })
    } catch (error) {
      next(error)
    }
  }
}

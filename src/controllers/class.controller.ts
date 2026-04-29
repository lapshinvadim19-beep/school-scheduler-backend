import { NextFunction, Request, Response } from 'express'
import { Class, Teacher, User } from '../models'
import { ApiError } from '../utils/apiError'

function mapClass(item: Class & { teacher?: Teacher | null }) {
  const teacher = item.get('teacher') as Teacher | undefined
  const teacherUser = teacher?.get('user') as User | undefined
  return {
    id: item.id,
    name: item.name,
    grade: item.grade,
    studentsCount: item.studentsCount,
    teacherId: item.teacherId,
    teacherName: teacherUser?.fullName || '',
    teacher: teacherUser?.fullName || '',
    description: item.description || ''
  }
}

export class ClassController {
  static async getAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const classes = await Class.findAll({
        include: [{ model: Teacher, as: 'teacher', include: [{ model: User, as: 'user', attributes: ['fullName'] }] }],
        order: [['grade', 'ASC'], ['name', 'ASC']]
      })
      res.json(classes.map((item) => mapClass(item as Class & { teacher?: Teacher | null })))
    } catch (error) {
      next(error)
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const classItem = await Class.findByPk(Number(req.params.id), {
        include: [{ model: Teacher, as: 'teacher', include: [{ model: User, as: 'user', attributes: ['fullName'] }] }]
      })
      if (!classItem) throw new ApiError(404, 'Класс не найден')
      res.json(mapClass(classItem as Class & { teacher?: Teacher | null }))
    } catch (error) {
      next(error)
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, grade, studentsCount = 0, teacherId = null, description = '' } = req.body
      const classItem = await Class.create({
        name,
        grade,
        studentsCount: Number(studentsCount) || 0,
        teacherId: teacherId ? Number(teacherId) : null,
        description
      })
      const created = await Class.findByPk(classItem.id, {
        include: [{ model: Teacher, as: 'teacher', include: [{ model: User, as: 'user', attributes: ['fullName'] }] }]
      })
      res.status(201).json(mapClass(created as Class & { teacher?: Teacher | null }))
    } catch (error) {
      next(error)
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const classItem = await Class.findByPk(Number(req.params.id))
      if (!classItem) throw new ApiError(404, 'Класс не найден')
      const { name, grade, studentsCount, teacherId, description } = req.body
      await classItem.update({
        name: name ?? classItem.name,
        grade: grade ?? classItem.grade,
        studentsCount: studentsCount !== undefined ? Number(studentsCount) : classItem.studentsCount,
        teacherId: teacherId !== undefined ? (teacherId ? Number(teacherId) : null) : classItem.teacherId,
        description: description ?? classItem.description
      })
      const updated = await Class.findByPk(classItem.id, {
        include: [{ model: Teacher, as: 'teacher', include: [{ model: User, as: 'user', attributes: ['fullName'] }] }]
      })
      res.json(mapClass(updated as Class & { teacher?: Teacher | null }))
    } catch (error) {
      next(error)
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const classItem = await Class.findByPk(Number(req.params.id))
      if (!classItem) throw new ApiError(404, 'Класс не найден')
      await classItem.destroy()
      res.json({ message: 'Класс удалён' })
    } catch (error) {
      next(error)
    }
  }
}

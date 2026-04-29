import { NextFunction, Request, Response } from 'express'
import { Subject } from '../models'
import { ApiError } from '../utils/apiError'

export class SubjectController {
  static async getAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const subjects = await Subject.findAll({ order: [['name', 'ASC']] })
      res.json(subjects)
    } catch (error) {
      next(error)
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const subject = await Subject.findByPk(Number(req.params.id))
      if (!subject) throw new ApiError(404, 'Предмет не найден')
      res.json(subject)
    } catch (error) {
      next(error)
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, shortName, hoursPerWeek, department, color } = req.body
      const subject = await Subject.create({
        name,
        shortName,
        hoursPerWeek: Number(hoursPerWeek) || 1,
        department,
        color: color || '#3B82F6'
      })
      res.status(201).json(subject)
    } catch (error) {
      next(error)
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const subject = await Subject.findByPk(Number(req.params.id))
      if (!subject) throw new ApiError(404, 'Предмет не найден')
      const { name, shortName, hoursPerWeek, department, color, isActive } = req.body
      await subject.update({
        name: name ?? subject.name,
        shortName: shortName ?? subject.shortName,
        hoursPerWeek: hoursPerWeek !== undefined ? Number(hoursPerWeek) : subject.hoursPerWeek,
        department: department ?? subject.department,
        color: color ?? subject.color,
        isActive: isActive ?? subject.isActive
      })
      res.json(subject)
    } catch (error) {
      next(error)
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const subject = await Subject.findByPk(Number(req.params.id))
      if (!subject) throw new ApiError(404, 'Предмет не найден')
      await subject.destroy()
      res.json({ message: 'Предмет удалён' })
    } catch (error) {
      next(error)
    }
  }
}

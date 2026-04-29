import { NextFunction, Request, Response } from 'express'
import { Teacher, User } from '../models'
import { ApiError } from '../utils/apiError'

function mapTeacher(teacher: Teacher & { user?: User | null }) {
  const user = teacher.get('user') as User | undefined
  return {
    id: teacher.id,
    userId: teacher.userId,
    fullName: user?.fullName || '',
    email: user?.email || '',
    avatar: user?.avatar || null,
    subjects: teacher.subjects,
    subject: teacher.subjects[0] || '',
    experience: teacher.experience,
    qualification: teacher.qualification,
    phone: teacher.phone,
    office: teacher.office || ''
  }
}

export class TeacherController {
  static async getAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const teachers = await Teacher.findAll({
        include: [{ model: User, as: 'user', attributes: ['id', 'fullName', 'email', 'avatar'] }],
        order: [['id', 'ASC']]
      })
      res.json(teachers.map((teacher) => mapTeacher(teacher as Teacher & { user?: User | null })))
    } catch (error) {
      next(error)
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const teacher = await Teacher.findByPk(Number(req.params.id), {
        include: [{ model: User, as: 'user', attributes: ['id', 'fullName', 'email', 'avatar'] }]
      })
      if (!teacher) throw new ApiError(404, 'Преподаватель не найден')
      res.json(mapTeacher(teacher as Teacher & { user?: User | null }))
    } catch (error) {
      next(error)
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        userId,
        fullName,
        email,
        password = 'teacher123',
        subjects = [],
        experience = 0,
        qualification = 'Без категории',
        phone = '',
        office = ''
      } = req.body

      let resolvedUserId: number

      if (userId) {
        const existingUser = await User.findByPk(Number(userId))
        if (!existingUser) throw new ApiError(404, 'Пользователь не найден')
        await existingUser.update({ role: 'teacher' })
        resolvedUserId = existingUser.id
      } else {
        if (!email || !fullName) throw new ApiError(400, 'Для создания преподавателя необходимо указать fullName и email')
        const emailExists = await User.findOne({ where: { email } })
        if (emailExists) throw new ApiError(400, 'Пользователь с таким email уже существует')
        const createdUser = await User.create({ email, password, fullName, role: 'teacher' })
        resolvedUserId = createdUser.id
      }

      const duplicate = await Teacher.findOne({ where: { userId: resolvedUserId } })
      if (duplicate) throw new ApiError(400, 'Для этого пользователя профиль преподавателя уже создан')

      const teacher = await Teacher.create({
        userId: resolvedUserId,
        subjects: Array.isArray(subjects) ? subjects : String(subjects).split(',').map((item) => item.trim()).filter(Boolean),
        experience: Number(experience) || 0,
        qualification,
        phone,
        office
      })

      const created = await Teacher.findByPk(teacher.id, {
        include: [{ model: User, as: 'user', attributes: ['id', 'fullName', 'email', 'avatar'] }]
      })

      res.status(201).json(mapTeacher(created as Teacher & { user?: User | null }))
    } catch (error) {
      next(error)
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const teacher = await Teacher.findByPk(Number(req.params.id), {
        include: [{ model: User, as: 'user', attributes: ['id', 'fullName', 'email', 'avatar'] }]
      })
      if (!teacher) throw new ApiError(404, 'Преподаватель не найден')

      const {
        fullName,
        email,
        subjects = teacher.subjects,
        experience = teacher.experience,
        qualification = teacher.qualification,
        phone = teacher.phone,
        office = teacher.office
      } = req.body

      const user = await User.findByPk(teacher.userId)
      if (user) {
        await user.update({
          fullName: fullName ?? user.fullName,
          email: email ?? user.email,
          role: 'teacher'
        })
      }

      await teacher.update({
        subjects: Array.isArray(subjects) ? subjects : String(subjects).split(',').map((item) => item.trim()).filter(Boolean),
        experience: Number(experience) || 0,
        qualification,
        phone,
        office
      })

      const updated = await Teacher.findByPk(teacher.id, {
        include: [{ model: User, as: 'user', attributes: ['id', 'fullName', 'email', 'avatar'] }]
      })

      res.json(mapTeacher(updated as Teacher & { user?: User | null }))
    } catch (error) {
      next(error)
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const teacher = await Teacher.findByPk(Number(req.params.id))
      if (!teacher) throw new ApiError(404, 'Преподаватель не найден')
      const user = await User.findByPk(teacher.userId)
      if (user) await user.update({ role: 'student' })
      await teacher.destroy()
      res.json({ message: 'Преподаватель удалён' })
    } catch (error) {
      next(error)
    }
  }
}

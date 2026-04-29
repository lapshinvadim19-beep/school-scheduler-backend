import { NextFunction, Request, Response } from 'express'
import { Teacher, User } from '../models'
import { buildAuthResponse } from '../services/auth.service'
import { ApiError } from '../utils/apiError'
import { AuthRequest } from '../middleware/auth.middleware'

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body
      const user = await User.findOne({ where: { email } })

      if (!user || !(await user.validatePassword(password))) {
        throw new ApiError(401, 'Неверный email или пароль')
      }

      if (!user.isActive) {
        throw new ApiError(403, 'Пользователь деактивирован')
      }

      res.json(buildAuthResponse(user))
    } catch (error) {
      next(error)
    }
  }

  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, fullName, role = 'student' } = req.body

      const exists = await User.findOne({ where: { email } })
      if (exists) {
        throw new ApiError(400, 'Пользователь с таким email уже существует')
      }

      const user = await User.create({ email, password, fullName, role })
      res.status(201).json(buildAuthResponse(user))
    } catch (error) {
      next(error)
    }
  }

  static async getProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUser = req.user
      if (!currentUser) throw new ApiError(401, 'Пользователь не авторизован')

      const teacherProfile = await Teacher.findOne({ where: { userId: currentUser.id } })

      res.json({
        id: currentUser.id,
        email: currentUser.email,
        fullName: currentUser.fullName,
        role: currentUser.role,
        avatar: currentUser.avatar,
        teacherProfile: teacherProfile
          ? {
              id: teacherProfile.id,
              phone: teacherProfile.phone,
              qualification: teacherProfile.qualification,
              office: teacherProfile.office,
              subjects: teacherProfile.subjects
            }
          : null
      })
    } catch (error) {
      next(error)
    }
  }

  static async logout(_req: Request, res: Response): Promise<void> {
    res.json({ message: 'Выход выполнен успешно' })
  }
}

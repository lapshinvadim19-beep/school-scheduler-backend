import { NextFunction, Response } from 'express'
import { AuthRequest } from '../middleware/auth.middleware'
import { User } from '../models'
import { ApiError } from '../utils/apiError'

export class UserController {
  static async getAllUsers(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await User.findAll({
        attributes: { exclude: ['password'] },
        order: [['createdAt', 'DESC']]
      })
      res.json(users)
    } catch (error) {
      next(error)
    }
  }

  static async getCurrentUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new ApiError(401, 'Пользователь не авторизован')
      res.json({
        id: req.user.id,
        email: req.user.email,
        fullName: req.user.fullName,
        role: req.user.role,
        avatar: req.user.avatar,
        isActive: req.user.isActive
      })
    } catch (error) {
      next(error)
    }
  }

  static async updateCurrentUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new ApiError(401, 'Пользователь не авторизован')
      const { fullName, avatar } = req.body
      await req.user.update({ fullName, avatar })
      res.json({
        id: req.user.id,
        email: req.user.email,
        fullName: req.user.fullName,
        role: req.user.role,
        avatar: req.user.avatar,
        isActive: req.user.isActive
      })
    } catch (error) {
      next(error)
    }
  }

  static async updateUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await User.findByPk(Number(req.params.id))
      if (!user) throw new ApiError(404, 'Пользователь не найден')
      const { role, isActive } = req.body
      await user.update({ role, isActive })
      res.json({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        avatar: user.avatar,
        isActive: user.isActive
      })
    } catch (error) {
      next(error)
    }
  }

  static async deleteUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await User.findByPk(Number(req.params.id))
      if (!user) throw new ApiError(404, 'Пользователь не найден')
      await user.destroy()
      res.json({ message: 'Пользователь удалён' })
    } catch (error) {
      next(error)
    }
  }
}

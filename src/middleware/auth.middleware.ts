import { NextFunction, Response } from 'express'
import jwt from 'jsonwebtoken'
import { User } from '../models'
import { ApiError } from '../utils/apiError'

import { Request } from 'express'

export interface AuthRequest extends Request {
  user?: User
}

interface TokenPayload {
  id: number
  email: string
  role: string
}

export async function authMiddleware(req: AuthRequest, _res: Response, next: NextFunction): Promise<void> {
  try {
    const header = req.header('Authorization')
    const token = header?.startsWith('Bearer ') ? header.replace('Bearer ', '') : undefined

    if (!token) {
      return next(new ApiError(401, 'Необходима авторизация'))
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as TokenPayload
    const user = await User.findByPk(decoded.id)

    if (!user || !user.isActive) {
      return next(new ApiError(401, 'Пользователь не найден или заблокирован'))
    }

    req.user = user
    next()
  } catch (_error) {
    next(new ApiError(401, 'Недействительный токен'))
  }
}

export function roleMiddleware(roles: string[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new ApiError(401, 'Необходима авторизация'))
    }

    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'Недостаточно прав для выполнения операции'))
    }

    next()
  }
}

import { NextFunction, Request, Response } from 'express'
import { ApiError } from '../utils/apiError'
import { requireFields } from '../utils/validation'

export function validateRequired(fields: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const missing = requireFields(req.body as Record<string, unknown>, fields)
    if (missing.length > 0) {
      return next(new ApiError(400, `Не заполнены обязательные поля: ${missing.join(', ')}`))
    }
    next()
  }
}

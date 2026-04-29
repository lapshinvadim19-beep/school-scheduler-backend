import { NextFunction, Request, Response } from 'express'
import { ApiError } from '../utils/apiError'
import { logger } from '../utils/logger'

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  const error = err instanceof ApiError ? err : new ApiError(500, 'Internal server error')

  logger.error({
    path: req.originalUrl,
    method: req.method,
    message: error.message,
    stack: err instanceof Error ? err.stack : undefined
  })

  res.status(error.statusCode).json({ error: error.message })
}

export function notFound(req: Request, res: Response): void {
  res.status(404).json({ error: `Route ${req.originalUrl} not found` })
}

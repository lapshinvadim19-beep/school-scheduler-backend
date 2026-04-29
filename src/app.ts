import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import authRoutes from './routes/auth.routes'
import classRoutes from './routes/class.routes'
import reportRoutes from './routes/report.routes'
import scheduleRoutes from './routes/schedule.routes'
import subjectRoutes from './routes/subject.routes'
import teacherRoutes from './routes/teacher.routes'
import teachingLoadRoutes from './routes/teaching-load.routes'
import userRoutes from './routes/user.routes'
import { sequelize, testConnection } from './config/database'
import { errorHandler, notFound } from './middleware/error.middleware'
import './models'
import { seedDemoData } from './utils/seed'
import { logger } from './utils/logger'

dotenv.config()

const app = express()
const PORT = Number(process.env.PORT || 5000)

const allowedOrigins = (process.env.CLIENT_URLS || process.env.CLIENT_URL || 'http://localhost:3000,http://localhost:5173')
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean)

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true)
        return
      }

      if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        callback(null, true)
        return
      }

      callback(new Error('CORS origin not allowed'))
    },
    credentials: true
  })
)
app.use(helmet())
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300
  })
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/teachers', teacherRoutes)
app.use('/api/teaching-loads', teachingLoadRoutes)
app.use('/api/classes', classRoutes)
app.use('/api/subjects', subjectRoutes)
app.use('/api/schedule', scheduleRoutes)
app.use('/api/reports', reportRoutes)

app.use(notFound)
app.use(errorHandler)

async function startServer(): Promise<void> {
  try {
    await testConnection()
    await sequelize.sync()

    if (process.env.SEED_DEMO_DATA !== 'false') {
      await seedDemoData()
    }

    app.listen(PORT, () => {
      logger.info(`Backend started on http://localhost:${PORT}`)
    })
  } catch (error) {
    logger.error('Unable to start server', error)
    process.exit(1)
  }
}

startServer()

export default app

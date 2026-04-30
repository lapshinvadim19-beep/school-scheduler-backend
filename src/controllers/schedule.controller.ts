import { NextFunction, Request, Response } from 'express'
import { Op } from 'sequelize'
import { Class, Lesson, Subject, Teacher, TeachingLoad, User } from '../models'
import { ensureNoLessonConflict } from '../services/schedule.service'
import { ApiError } from '../utils/apiError'

const PERIOD_TIMES: Record<number, { startTime: string; endTime: string }> = {
  1: { startTime: '08:30', endTime: '09:15' },
  2: { startTime: '09:25', endTime: '10:10' },
  3: { startTime: '10:30', endTime: '11:15' },
  4: { startTime: '11:25', endTime: '12:10' },
  5: { startTime: '12:30', endTime: '13:15' },
  6: { startTime: '13:25', endTime: '14:10' },
  7: { startTime: '14:20', endTime: '15:05' },
  8: { startTime: '15:15', endTime: '16:00' }
}

const WEEK_DAYS = [1, 2, 3, 4, 5]
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8]

function mapLesson(lesson: Lesson & { class?: Class; teacher?: Teacher; subject?: Subject }) {
  const classModel = lesson.get('class') as Class | undefined
  const teacher = lesson.get('teacher') as Teacher | undefined
  const subject = lesson.get('subject') as Subject | undefined
  const teacherUser = teacher?.get('user') as User | undefined

  return {
    id: lesson.id,
    classId: lesson.classId,
    teacherId: lesson.teacherId,
    subjectId: lesson.subjectId,
    room: lesson.room,
    dayOfWeek: lesson.dayOfWeek,
    period: lesson.period,
    startTime: lesson.startTime,
    endTime: lesson.endTime,
    weekType: lesson.weekType,
    className: classModel?.name || '',
    teacherName: teacherUser?.fullName || '',
    subjectName: subject?.name || ''
  }
}

async function fetchLessons(where: Record<string, unknown>) {
  const lessons = await Lesson.findAll({
    where,
    include: [
      { model: Class, as: 'class' },
      { model: Teacher, as: 'teacher', include: [{ model: User, as: 'user', attributes: ['fullName'] }] },
      { model: Subject, as: 'subject' }
    ],
    order: [['dayOfWeek', 'ASC'], ['period', 'ASC']]
  })

  return lessons.map((lesson) =>
    mapLesson(lesson as Lesson & { class?: Class; teacher?: Teacher; subject?: Subject })
  )
}

async function getDaysOrderedByClassLoad(classId: number): Promise<number[]> {
  const counts = await Promise.all(
    WEEK_DAYS.map((dayOfWeek) =>
      Lesson.count({
        where: { classId, dayOfWeek }
      })
    )
  )

  return [...WEEK_DAYS].sort((a, b) => {
    const countA = counts[a - 1]
    const countB = counts[b - 1]
    return countA - countB || a - b
  })
}

function buildPreferredDays(hoursPerWeek: number, orderedDays: number[]): number[] {
  if (hoursPerWeek <= 0) return []
  if (orderedDays.length === 0) return []

  if (hoursPerWeek === 1) {
    return [orderedDays[0]]
  }

  const result: number[] = []

  if (hoursPerWeek <= orderedDays.length) {
    const maxIndex = orderedDays.length - 1

    for (let i = 0; i < hoursPerWeek; i += 1) {
      const index = Math.round((i * maxIndex) / (hoursPerWeek - 1))
      result.push(orderedDays[index])
    }

    return result
  }

  // Если часов больше, чем дней, сначала даём по одному часу на каждый день,
  // потом повторяем цикл по дням.
  while (result.length < hoursPerWeek) {
    for (const day of orderedDays) {
      if (result.length >= hoursPerWeek) break
      result.push(day)
    }
  }

  return result
}

async function hasSameSubjectForClassInDay(classId: number, subjectId: number, dayOfWeek: number) {
  const sameSubjectCount = await Lesson.count({
    where: {
      classId,
      subjectId,
      dayOfWeek
    }
  })

  return sameSubjectCount > 0
}

async function findAvailableSlotForDay(
  classId: number,
  teacherId: number,
  subjectId: number,
  room: string,
  dayOfWeek: number,
  weekType: 'even' | 'odd' | 'both' = 'both',
  allowSameSubjectInDay = false
) {
  if (!allowSameSubjectInDay) {
    const alreadyHasThisSubject = await hasSameSubjectForClassInDay(classId, subjectId, dayOfWeek)
    if (alreadyHasThisSubject) {
      return null
    }
  }

  for (const period of PERIODS) {
    try {
      await ensureNoLessonConflict({
        classId,
        teacherId,
        room,
        dayOfWeek,
        period,
        weekType
      })

      return {
        dayOfWeek,
        period,
        ...PERIOD_TIMES[period]
      }
    } catch {
      // этот слот занят, пробуем следующий
    }
  }

  return null
}

async function findBestAvailableSlot(
  classId: number,
  teacherId: number,
  subjectId: number,
  room: string,
  preferredDay: number,
  weekType: 'even' | 'odd' | 'both' = 'both'
) {
  // 1. Сначала пытаемся поставить в целевой день без повторения предмета в этот день
  let slot = await findAvailableSlotForDay(
    classId,
    teacherId,
    subjectId,
    room,
    preferredDay,
    weekType,
    false
  )
  if (slot) return slot

  // 2. Потом пробуем остальные дни без повторения предмета в день
  const orderedDays = await getDaysOrderedByClassLoad(classId)
  for (const day of orderedDays) {
    if (day === preferredDay) continue

    slot = await findAvailableSlotForDay(
      classId,
      teacherId,
      subjectId,
      room,
      day,
      weekType,
      false
    )

    if (slot) return slot
  }

  // 3. Если не получилось, разрешаем повтор того же предмета в один день
  slot = await findAvailableSlotForDay(
    classId,
    teacherId,
    subjectId,
    room,
    preferredDay,
    weekType,
    true
  )
  if (slot) return slot

  // 4. Последняя попытка — любой день, даже если предмет уже есть в этот день
  for (const day of orderedDays) {
    if (day === preferredDay) continue

    slot = await findAvailableSlotForDay(
      classId,
      teacherId,
      subjectId,
      room,
      day,
      weekType,
      true
    )

    if (slot) return slot
  }

  return null
}

export class ScheduleController {
  static async getSchedule(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const where: Record<string, unknown> = {}
      if (req.query.classId) where.classId = Number(req.query.classId)
      if (req.query.teacherId) where.teacherId = Number(req.query.teacherId)
      if (req.query.dayOfWeek) where.dayOfWeek = Number(req.query.dayOfWeek)

      res.json(await fetchLessons(where))
    } catch (error) {
      next(error)
    }
  }

  static async getClassSchedule(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json(await fetchLessons({ classId: Number(req.params.classId) }))
    } catch (error) {
      next(error)
    }
  }

  static async getTeacherSchedule(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json(await fetchLessons({ teacherId: Number(req.params.teacherId) }))
    } catch (error) {
      next(error)
    }
  }

  static async getRoomSchedule(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json(await fetchLessons({ room: req.params.room }))
    } catch (error) {
      next(error)
    }
  }

  static async createLesson(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payloads = Array.isArray(req.body) ? req.body : [req.body]
      const createdItems = []

      for (const payload of payloads) {
        const normalized = {
          classId: Number(payload.classId),
          teacherId: Number(payload.teacherId),
          subjectId: Number(payload.subjectId),
          room: String(payload.room),
          dayOfWeek: Number(payload.dayOfWeek),
          period: Number(payload.period),
          startTime: String(payload.startTime),
          endTime: String(payload.endTime),
          weekType: (payload.weekType || 'both') as 'even' | 'odd' | 'both'
        }

        await ensureNoLessonConflict(normalized)
        const lesson = await Lesson.create(normalized)
        createdItems.push(lesson)
      }

      const ids = createdItems.map((item) => item.id)
      const result = await fetchLessons({ id: { [Op.in]: ids } })
      res.status(201).json(Array.isArray(req.body) ? result : result[0])
    } catch (error) {
      next(error)
    }
  }

  static async updateLesson(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const lesson = await Lesson.findByPk(Number(req.params.id))
      if (!lesson) throw new ApiError(404, 'Занятие не найдено')

      const payload = {
        classId: req.body.classId !== undefined ? Number(req.body.classId) : lesson.classId,
        teacherId: req.body.teacherId !== undefined ? Number(req.body.teacherId) : lesson.teacherId,
        subjectId: req.body.subjectId !== undefined ? Number(req.body.subjectId) : lesson.subjectId,
        room: req.body.room ?? lesson.room,
        dayOfWeek: req.body.dayOfWeek !== undefined ? Number(req.body.dayOfWeek) : lesson.dayOfWeek,
        period: req.body.period !== undefined ? Number(req.body.period) : lesson.period,
        startTime: req.body.startTime ?? lesson.startTime,
        endTime: req.body.endTime ?? lesson.endTime,
        weekType: (req.body.weekType ?? lesson.weekType) as 'even' | 'odd' | 'both'
      }

      await ensureNoLessonConflict({ ...payload, excludeId: lesson.id })
      await lesson.update(payload)

      const result = await fetchLessons({ id: lesson.id })
      res.json(result[0])
    } catch (error) {
      next(error)
    }
  }

  static async deleteLesson(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const lesson = await Lesson.findByPk(Number(req.params.id))
      if (!lesson) throw new ApiError(404, 'Занятие не найдено')

      await lesson.destroy()
      res.json({ message: 'Занятие удалено' })
    } catch (error) {
      next(error)
    }
  }

  static async generateForClass(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const classId = Number(req.params.classId)
      const replaceExisting = req.body?.replaceExisting === true

      const classModel = await Class.findByPk(classId)
      if (!classModel) throw new ApiError(404, 'Класс не найден')

      const loads = await TeachingLoad.findAll({
        where: { classId, isActive: true },
        order: [['id', 'ASC']]
      })

      if (loads.length === 0) {
        throw new ApiError(400, 'Для класса не задана учебная нагрузка')
      }

      if (replaceExisting) {
        await Lesson.destroy({ where: { classId } })
      }

      const existingLessons = await Lesson.findAll({ where: { classId } })
      const existingKeyCount = new Map<string, number>()

      for (const lesson of existingLessons) {
        const key = `${lesson.classId}:${lesson.teacherId}:${lesson.subjectId}`
        existingKeyCount.set(key, (existingKeyCount.get(key) || 0) + 1)
      }

      const createdLessonIds: number[] = []
      const skipped: Array<{ loadId: number; reason: string }> = []

      for (const load of loads) {
        const key = `${load.classId}:${load.teacherId}:${load.subjectId}`
        const existingCount = existingKeyCount.get(key) || 0
        const missingCount = Math.max(0, load.hoursPerWeek - existingCount)

        if (missingCount === 0) continue

        const orderedDays = await getDaysOrderedByClassLoad(load.classId)
        const preferredDays = buildPreferredDays(missingCount, orderedDays)

        for (let index = 0; index < missingCount; index += 1) {
          const preferredDay = preferredDays[index]

          const slot = await findBestAvailableSlot(
            load.classId,
            load.teacherId,
            load.subjectId,
            load.room || 'Кабинет не указан',
            preferredDay,
            'both'
          )

          if (!slot) {
            skipped.push({
              loadId: load.id,
              reason: 'Свободный слот не найден'
            })
            break
          }

          const lesson = await Lesson.create({
            classId: load.classId,
            teacherId: load.teacherId,
            subjectId: load.subjectId,
            room: load.room || 'Кабинет не указан',
            dayOfWeek: slot.dayOfWeek,
            period: slot.period,
            startTime: slot.startTime,
            endTime: slot.endTime,
            weekType: 'both'
          })

          createdLessonIds.push(lesson.id)
          existingKeyCount.set(key, (existingKeyCount.get(key) || 0) + 1)
        }
      }

      const createdLessons =
        createdLessonIds.length > 0
          ? await fetchLessons({ id: { [Op.in]: createdLessonIds } })
          : []

      const schedule = await fetchLessons({ classId })

      res.json({
        message:
          createdLessons.length > 0
            ? 'Занятия автоматически добавлены в сетку класса'
            : 'Новые занятия не были созданы',
        createdLessons,
        skipped,
        schedule
      })
    } catch (error) {
      next(error)
    }
  }
}
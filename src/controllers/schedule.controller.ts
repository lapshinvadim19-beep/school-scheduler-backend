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

type WeekType = 'even' | 'odd' | 'both'
type SubjectCategory = 'hard' | 'pe' | 'normal'

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

function normalizeSubjectName(name: string): string {
  return name.trim().toLowerCase()
}

function getSubjectCategory(subjectName: string): SubjectCategory {
  const normalized = normalizeSubjectName(subjectName)

  const peMarkers = ['физкульт', 'физра']
  if (peMarkers.some((marker) => normalized.includes(marker))) {
    return 'pe'
  }

  const hardMarkers = [
    'матем',
    'алгебр',
    'геометр',
    'русск',
    'физик',
    'хим',
    'информ'
  ]

  if (hardMarkers.some((marker) => normalized.includes(marker))) {
    return 'hard'
  }

  return 'normal'
}

function getDayPreferencePenalty(category: SubjectCategory, dayOfWeek: number): number {
  switch (category) {
    case 'hard': {
      // Сложные предметы лучше в середине недели
      const penalties: Record<number, number> = {
        1: 3,
        2: 0,
        3: 0,
        4: 1,
        5: 4
      }
      return penalties[dayOfWeek] ?? 2
    }

    case 'pe': {
      // Физкультура чаще нормально смотрится ближе к концу недели
      const penalties: Record<number, number> = {
        1: 3,
        2: 2,
        3: 1,
        4: 0,
        5: 0
      }
      return penalties[dayOfWeek] ?? 1
    }

    default: {
      const penalties: Record<number, number> = {
        1: 1,
        2: 0,
        3: 0,
        4: 0,
        5: 1
      }
      return penalties[dayOfWeek] ?? 1
    }
  }
}

function getPeriodPreferencePenalty(category: SubjectCategory, period: number): number {
  switch (category) {
    case 'hard': {
      // Сложные предметы лучше на 2–4 уроках
      const penalties: Record<number, number> = {
        1: 2,
        2: 0,
        3: 0,
        4: 1,
        5: 3,
        6: 6,
        7: 10,
        8: 14
      }
      return penalties[period] ?? 10
    }

    case 'pe': {
      // Физкультура лучше не в самом начале и не в самом конце
      const penalties: Record<number, number> = {
        1: 8,
        2: 5,
        3: 2,
        4: 0,
        5: 0,
        6: 1,
        7: 4,
        8: 7
      }
      return penalties[period] ?? 4
    }

    default: {
      const penalties: Record<number, number> = {
        1: 2,
        2: 1,
        3: 0,
        4: 0,
        5: 1,
        6: 2,
        7: 4,
        8: 6
      }
      return penalties[period] ?? 3
    }
  }
}

async function getClassDayLoadMap(classId: number): Promise<Map<number, number>> {
  const map = new Map<number, number>()

  for (const day of WEEK_DAYS) {
    const count = await Lesson.count({
      where: { classId, dayOfWeek: day }
    })
    map.set(day, count)
  }

  return map
}

function getDaysOrderedByClassLoadFromMap(dayLoadMap: Map<number, number>): number[] {
  return [...WEEK_DAYS].sort((a, b) => {
    const countA = dayLoadMap.get(a) || 0
    const countB = dayLoadMap.get(b) || 0
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

  while (result.length < hoursPerWeek) {
    for (const day of orderedDays) {
      if (result.length >= hoursPerWeek) break
      result.push(day)
    }
  }

  return result
}

async function hasSameSubjectForClassInDay(classId: number, subjectId: number, dayOfWeek: number) {
  const count = await Lesson.count({
    where: {
      classId,
      subjectId,
      dayOfWeek
    }
  })

  return count > 0
}

async function hasAdjacentSameSubject(
  classId: number,
  subjectId: number,
  dayOfWeek: number,
  period: number
) {
  const adjacentPeriods = [period - 1, period + 1].filter((value) => value >= 1 && value <= 8)

  if (adjacentPeriods.length === 0) return false

  const count = await Lesson.count({
    where: {
      classId,
      subjectId,
      dayOfWeek,
      period: { [Op.in]: adjacentPeriods }
    }
  })

  return count > 0
}

async function findCandidateSlotsForDay(
  classId: number,
  teacherId: number,
  subjectId: number,
  subjectName: string,
  room: string,
  dayOfWeek: number,
  dayLoadMap: Map<number, number>,
  weekType: WeekType = 'both',
  allowSameSubjectInDay = false
) {
  const category = getSubjectCategory(subjectName)

  if (!allowSameSubjectInDay) {
    const alreadyHasThisSubject = await hasSameSubjectForClassInDay(classId, subjectId, dayOfWeek)
    if (alreadyHasThisSubject) {
      return []
    }
  }

  const candidates: Array<{
    dayOfWeek: number
    period: number
    startTime: string
    endTime: string
    score: number
  }> = []

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
    } catch {
      continue
    }

    // Физкультура не должна идти подряд
    if (category === 'pe') {
      const hasAdjacentPe = await hasAdjacentSameSubject(classId, subjectId, dayOfWeek, period)
      if (hasAdjacentPe) {
        continue
      }
    }

    let score = 0

    // Чем больше уроков уже в этом дне, тем хуже
    const dayLoad = dayLoadMap.get(dayOfWeek) || 0
    score += dayLoad * 10

    // Предпочтения по дню и уроку
    score += getDayPreferencePenalty(category, dayOfWeek) * 4
    score += getPeriodPreferencePenalty(category, period) * 3

    // Дополнительные "школьные" штрафы
    if (category === 'hard' && period >= 6) {
      score += 12
    }

    if (category === 'pe' && (period === 1 || period === 8)) {
      score += 10
    }

    // Сильно перегруженные дни делаем менее привлекательными
    if (dayLoad >= 6) {
      score += 20
    }

    candidates.push({
      dayOfWeek,
      period,
      startTime: PERIOD_TIMES[period].startTime,
      endTime: PERIOD_TIMES[period].endTime,
      score
    })
  }

  return candidates
}

async function findBestAvailableSlot(
  classId: number,
  teacherId: number,
  subjectId: number,
  subjectName: string,
  room: string,
  preferredDay: number,
  dayLoadMap: Map<number, number>,
  weekType: WeekType = 'both'
) {
  const orderedDays = getDaysOrderedByClassLoadFromMap(dayLoadMap)

  const allCandidates: Array<{
    dayOfWeek: number
    period: number
    startTime: string
    endTime: string
    score: number
  }> = []

  // 1. Сначала любимый день, без повторения предмета в этот день
  const primaryCandidates = await findCandidateSlotsForDay(
    classId,
    teacherId,
    subjectId,
    subjectName,
    room,
    preferredDay,
    dayLoadMap,
    weekType,
    false
  )

  for (const candidate of primaryCandidates) {
    allCandidates.push({ ...candidate, score: candidate.score - 8 })
  }

  // 2. Потом остальные дни, тоже без повторения предмета
  for (const day of orderedDays) {
    if (day === preferredDay) continue

    const candidates = await findCandidateSlotsForDay(
      classId,
      teacherId,
      subjectId,
      subjectName,
      room,
      day,
      dayLoadMap,
      weekType,
      false
    )

    allCandidates.push(...candidates)
  }

  // 3. Если не нашли — разрешаем повтор предмета в день
  if (allCandidates.length === 0) {
    const fallbackPrimary = await findCandidateSlotsForDay(
      classId,
      teacherId,
      subjectId,
      subjectName,
      room,
      preferredDay,
      dayLoadMap,
      weekType,
      true
    )

    for (const candidate of fallbackPrimary) {
      allCandidates.push({ ...candidate, score: candidate.score + 15 })
    }

    for (const day of orderedDays) {
      if (day === preferredDay) continue

      const fallbackCandidates = await findCandidateSlotsForDay(
        classId,
        teacherId,
        subjectId,
        subjectName,
        room,
        day,
        dayLoadMap,
        weekType,
        true
      )

      for (const candidate of fallbackCandidates) {
        allCandidates.push({ ...candidate, score: candidate.score + 20 })
      }
    }
  }

  if (allCandidates.length === 0) {
    return null
  }

  allCandidates.sort((a, b) => a.score - b.score || a.dayOfWeek - b.dayOfWeek || a.period - b.period)
  return allCandidates[0]
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
          weekType: (payload.weekType || 'both') as WeekType
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
        weekType: (req.body.weekType ?? lesson.weekType) as WeekType
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

      const subjects = await Subject.findAll({ attributes: ['id', 'name'] })
      const subjectNameMap = new Map<number, string>()
      for (const subject of subjects) {
        subjectNameMap.set(subject.id, subject.name)
      }

      const existingLessons = await Lesson.findAll({ where: { classId } })
      const existingKeyCount = new Map<string, number>()

      for (const lesson of existingLessons) {
        const key = `${lesson.classId}:${lesson.teacherId}:${lesson.subjectId}`
        existingKeyCount.set(key, (existingKeyCount.get(key) || 0) + 1)
      }

      const dayLoadMap = await getClassDayLoadMap(classId)

      const createdLessonIds: number[] = []
      const skipped: Array<{ loadId: number; reason: string }> = []

      for (const load of loads) {
        const key = `${load.classId}:${load.teacherId}:${load.subjectId}`
        const existingCount = existingKeyCount.get(key) || 0
        const missingCount = Math.max(0, load.hoursPerWeek - existingCount)

        if (missingCount === 0) continue

        const orderedDays = getDaysOrderedByClassLoadFromMap(dayLoadMap)
        const preferredDays = buildPreferredDays(missingCount, orderedDays)
        const subjectName = subjectNameMap.get(load.subjectId) || 'Предмет'

        for (let index = 0; index < missingCount; index += 1) {
          const preferredDay = preferredDays[index]

          const slot = await findBestAvailableSlot(
            load.classId,
            load.teacherId,
            load.subjectId,
            subjectName,
            load.room || 'Кабинет не указан',
            preferredDay,
            dayLoadMap,
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
          dayLoadMap.set(slot.dayOfWeek, (dayLoadMap.get(slot.dayOfWeek) || 0) + 1)
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
            ? 'Занятия автоматически распределены по неделе'
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
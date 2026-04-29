import { Op } from 'sequelize'
import { Lesson } from '../models'
import { ApiError } from '../utils/apiError'

interface ConflictPayload {
  teacherId: number
  classId: number
  room: string
  dayOfWeek: number
  period: number
  weekType: 'even' | 'odd' | 'both'
  excludeId?: number
}

function overlapCondition(weekType: 'even' | 'odd' | 'both') {
  if (weekType === 'both') {
    return { [Op.in]: ['even', 'odd', 'both'] }
  }
  return { [Op.in]: [weekType, 'both'] }
}

export async function ensureNoLessonConflict(payload: ConflictPayload): Promise<void> {
  const { teacherId, classId, room, dayOfWeek, period, weekType, excludeId } = payload

  const whereBase = {
    dayOfWeek,
    period,
    id: excludeId ? { [Op.ne]: excludeId } : { [Op.ne]: 0 },
    weekType: overlapCondition(weekType)
  }

  const [teacherConflict, classConflict, roomConflict] = await Promise.all([
    Lesson.findOne({ where: { ...whereBase, teacherId } }),
    Lesson.findOne({ where: { ...whereBase, classId } }),
    Lesson.findOne({ where: { ...whereBase, room } })
  ])

  if (teacherConflict) throw new ApiError(409, 'У преподавателя уже есть занятие в указанное время')
  if (classConflict) throw new ApiError(409, 'У класса уже есть занятие в указанное время')
  if (roomConflict) throw new ApiError(409, 'Кабинет уже занят в указанное время')
}

import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/database'

export type WeekType = 'even' | 'odd' | 'both'

export interface LessonAttributes {
  id: number
  classId: number
  teacherId: number
  subjectId: number
  room: string
  dayOfWeek: number
  period: number
  startTime: string
  endTime: string
  weekType: WeekType
  createdAt?: Date
  updatedAt?: Date
}

export interface LessonCreationAttributes extends Optional<LessonAttributes, 'id' | 'weekType'> {}

export class Lesson extends Model<LessonAttributes, LessonCreationAttributes> implements LessonAttributes {
  public id!: number
  public classId!: number
  public teacherId!: number
  public subjectId!: number
  public room!: string
  public dayOfWeek!: number
  public period!: number
  public startTime!: string
  public endTime!: string
  public weekType!: WeekType
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

Lesson.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    classId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'classes', key: 'id' } },
    teacherId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'teachers', key: 'id' } },
    subjectId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'subjects', key: 'id' } },
    room: { type: DataTypes.STRING(30), allowNull: false },
    dayOfWeek: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 6 } },
    period: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 8 } },
    startTime: { type: DataTypes.STRING(5), allowNull: false },
    endTime: { type: DataTypes.STRING(5), allowNull: false },
    weekType: { type: DataTypes.ENUM('even', 'odd', 'both'), allowNull: false, defaultValue: 'both' }
  },
  {
    sequelize,
    tableName: 'lessons',
    timestamps: true,
    indexes: [
      { fields: ['classId', 'dayOfWeek', 'period', 'weekType'] },
      { fields: ['teacherId', 'dayOfWeek', 'period', 'weekType'] }
    ]
  }
)

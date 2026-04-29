import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/database'

export interface TeachingLoadAttributes {
  id: number
  classId: number
  teacherId: number
  subjectId: number
  room: string
  hoursPerWeek: number
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface TeachingLoadCreationAttributes extends Optional<TeachingLoadAttributes, 'id' | 'room' | 'hoursPerWeek' | 'isActive'> {}

export class TeachingLoad extends Model<TeachingLoadAttributes, TeachingLoadCreationAttributes> implements TeachingLoadAttributes {
  public id!: number
  public classId!: number
  public teacherId!: number
  public subjectId!: number
  public room!: string
  public hoursPerWeek!: number
  public isActive!: boolean
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

TeachingLoad.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    classId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'classes', key: 'id' } },
    teacherId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'teachers', key: 'id' } },
    subjectId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'subjects', key: 'id' } },
    room: { type: DataTypes.STRING(30), allowNull: false, defaultValue: '' },
    hoursPerWeek: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1, validate: { min: 1, max: 12 } },
    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
  },
  {
    sequelize,
    tableName: 'teaching_loads',
    timestamps: true,
    indexes: [
      { fields: ['classId', 'teacherId', 'subjectId'] }
    ]
  }
)

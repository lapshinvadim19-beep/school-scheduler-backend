import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/database'

export interface SubjectAttributes {
  id: number
  name: string
  shortName: string
  hoursPerWeek: number
  department: string
  color: string
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface SubjectCreationAttributes extends Optional<SubjectAttributes, 'id' | 'isActive' | 'color'> {}

export class Subject extends Model<SubjectAttributes, SubjectCreationAttributes> implements SubjectAttributes {
  public id!: number
  public name!: string
  public shortName!: string
  public hoursPerWeek!: number
  public department!: string
  public color!: string
  public isActive!: boolean
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

Subject.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    shortName: { type: DataTypes.STRING(50), allowNull: false },
    hoursPerWeek: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    department: { type: DataTypes.STRING(100), allowNull: false, defaultValue: 'Общее образование' },
    color: { type: DataTypes.STRING(20), allowNull: false, defaultValue: '#3B82F6' },
    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
  },
  {
    sequelize,
    tableName: 'subjects',
    timestamps: true
  }
)

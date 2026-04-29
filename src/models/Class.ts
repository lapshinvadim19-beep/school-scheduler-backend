import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/database'

export interface ClassAttributes {
  id: number
  name: string
  grade: string
  studentsCount: number
  teacherId?: number | null
  description?: string | null
  createdAt?: Date
  updatedAt?: Date
}

export interface ClassCreationAttributes extends Optional<ClassAttributes, 'id' | 'studentsCount' | 'teacherId' | 'description'> {}

export class Class extends Model<ClassAttributes, ClassCreationAttributes> implements ClassAttributes {
  public id!: number
  public name!: string
  public grade!: string
  public studentsCount!: number
  public teacherId?: number | null
  public description?: string | null
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

Class.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(20), allowNull: false, unique: true },
    grade: { type: DataTypes.STRING(10), allowNull: false },
    studentsCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    teacherId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'teachers', key: 'id' }
    },
    description: { type: DataTypes.TEXT, allowNull: true }
  },
  {
    sequelize,
    tableName: 'classes',
    timestamps: true
  }
)

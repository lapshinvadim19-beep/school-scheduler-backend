import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/database'

export interface TeacherAttributes {
  id: number
  userId: number
  subjects: string[]
  experience: number
  qualification: string
  phone: string
  office?: string | null
  createdAt?: Date
  updatedAt?: Date
}

export interface TeacherCreationAttributes
  extends Optional<TeacherAttributes, 'id' | 'subjects' | 'experience' | 'qualification' | 'phone' | 'office'> {}

export class Teacher extends Model<TeacherAttributes, TeacherCreationAttributes> implements TeacherAttributes {
  public id!: number
  public userId!: number
  public subjects!: string[]
  public experience!: number
  public qualification!: string
  public phone!: string
  public office?: string | null
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

Teacher.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: { model: 'users', key: 'id' }
    },
    subjects: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: false, defaultValue: [] },
    experience: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    qualification: { type: DataTypes.STRING(100), allowNull: false, defaultValue: 'Без категории' },
    phone: { type: DataTypes.STRING(30), allowNull: false, defaultValue: '' },
    office: { type: DataTypes.STRING(50), allowNull: true }
  },
  {
    sequelize,
    tableName: 'teachers',
    timestamps: true
  }
)

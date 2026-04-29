import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/database'

export type ReportStatus = 'pending' | 'in_progress' | 'resolved' | 'rejected'

export interface ReportAttributes {
  id: number
  userId: number
  lessonId?: number | null
  description: string
  status: ReportStatus
  adminResponse?: string | null
  createdAt?: Date
  updatedAt?: Date
}

export interface ReportCreationAttributes extends Optional<ReportAttributes, 'id' | 'lessonId' | 'status' | 'adminResponse'> {}

export class Report extends Model<ReportAttributes, ReportCreationAttributes> implements ReportAttributes {
  public id!: number
  public userId!: number
  public lessonId?: number | null
  public description!: string
  public status!: ReportStatus
  public adminResponse?: string | null
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

Report.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
    lessonId: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'lessons', key: 'id' } },
    description: { type: DataTypes.TEXT, allowNull: false },
    status: {
      type: DataTypes.ENUM('pending', 'in_progress', 'resolved', 'rejected'),
      allowNull: false,
      defaultValue: 'pending'
    },
    adminResponse: { type: DataTypes.TEXT, allowNull: true }
  },
  {
    sequelize,
    tableName: 'reports',
    timestamps: true
  }
)

import bcrypt from 'bcryptjs'
import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/database'

export type UserRole = 'admin' | 'teacher' | 'student'

export interface UserAttributes {
  id: number
  email: string
  password: string
  fullName: string
  role: UserRole
  avatar?: string | null
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'avatar' | 'isActive'> {}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number
  public email!: string
  public password!: string
  public fullName!: string
  public role!: UserRole
  public avatar?: string | null
  public isActive!: boolean
  public readonly createdAt!: Date
  public readonly updatedAt!: Date

  public async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password)
  }
}

User.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    email: { type: DataTypes.STRING(255), allowNull: false, unique: true, validate: { isEmail: true } },
    password: { type: DataTypes.STRING(255), allowNull: false },
    fullName: { type: DataTypes.STRING(255), allowNull: false },
    role: {
      type: DataTypes.ENUM('admin', 'teacher', 'student'),
      allowNull: false,
      defaultValue: 'student'
    },
    avatar: { type: DataTypes.STRING(500), allowNull: true },
    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    hooks: {
      beforeCreate: async (user: User) => {
        user.password = await bcrypt.hash(user.password, 10)
      },
      beforeUpdate: async (user: User) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 10)
        }
      }
    }
  }
)

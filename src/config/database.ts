import dotenv from 'dotenv'
import { Sequelize } from 'sequelize'

dotenv.config()

export const sequelize = new Sequelize(
  process.env.DB_NAME || 'school_scheduler',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres',
  {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    dialect: 'postgres',
    logging: process.env.DB_LOGGING === 'true' ? console.log : false,
    define: {
      underscored: false,
      freezeTableName: false
    }
  }
)

export async function testConnection(): Promise<void> {
  await sequelize.authenticate()
}

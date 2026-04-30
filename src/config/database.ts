import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

const connectionString = process.env.DATABASE_URL;

export const sequelize = connectionString
  ? new Sequelize(connectionString, {
      dialect: 'postgres',
      logging: false,
      dialectOptions: isProduction
        ? {
            ssl: {
              require: true,
              rejectUnauthorized: false,
            },
          }
        : {},
    })
  : new Sequelize(
      process.env.DB_NAME || 'school_scheduler',
      process.env.DB_USER || 'postgres',
      process.env.DB_PASSWORD || 'postgres',
      {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT || 5432),
        dialect: 'postgres',
        logging: false,
        dialectOptions: isProduction
          ? {
              ssl: {
                require: true,
                rejectUnauthorized: false,
              },
            }
          : {},
      }
    );

export const testConnection = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('[INFO] Database connection established successfully.');
  } catch (error) {
    console.error('[ERROR] Unable to connect to the database:', error);
    throw error;
  }
};

export default sequelize;
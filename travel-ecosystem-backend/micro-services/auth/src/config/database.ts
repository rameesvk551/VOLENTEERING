import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(
  process.env.DB_NAME || 'travel_auth',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres123',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: {
      connectTimeout: 60000
    },
    retry: {
      max: 3,
      timeout: 3000
    }
  }
);

export const connectDB = async (retries = 5, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`🔄 Attempting to connect to PostgreSQL (attempt ${i + 1}/${retries})...`);
      await sequelize.authenticate();
      console.log('✅ PostgreSQL Connection established successfully');
      console.log(`📍 Connected to: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
      
      // Sync models in development (be careful with this in production)
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Synchronizing database schema...');
        await sequelize.sync({ alter: true });
        console.log('✅ Database synchronized');
      }
      return;
    } catch (error) {
      console.error(`❌ PostgreSQL Connection Error (attempt ${i + 1}/${retries}):`, error instanceof Error ? error.message : error);
      
      if (i < retries - 1) {
        console.log(`⏳ Retrying in ${delay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error('❌ Failed to connect to PostgreSQL after multiple attempts');
        console.error('💡 Make sure PostgreSQL is running. Start it with: docker-compose up -d');
        process.exit(1);
      }
    }
  }
};

export { sequelize };

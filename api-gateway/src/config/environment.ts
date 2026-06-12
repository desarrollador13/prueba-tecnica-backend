import dotenv from 'dotenv';

dotenv.config();

export const ENV = {    
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret_key',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    PAYMENT_SERVICE_URL: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3001',
};
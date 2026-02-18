import dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT;
export const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/poke-auth';
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
export const JWT_SECRET = process.env.JWT_SECRET;
export const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:8080';

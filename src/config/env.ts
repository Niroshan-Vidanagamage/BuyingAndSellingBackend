// File: src/config/env.ts
//collect and validates env vars: MONGO_URI,JWT_SECRET,etc
import 'dotenv/config';


const required = (name: string, fallback?: string) => {
    const v = process.env[name] ?? fallback;
    if (v === undefined) throw new Error(`Missing env var: ${name}`);
        return v;
};


export const env = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: Number(process.env.PORT || 4000),
    MONGO_URI: required('MONGO_URI', 'mongodb://localhost:27017/marketplace'),
    JWT_SECRET: required('JWT_SECRET'),
    JWT_EXPIRES: process.env.JWT_EXPIRES || '15m',
    REFRESH_SECRET: required('REFRESH_SECRET', 'change_me_refresh'),
    REFRESH_EXPIRES: process.env.REFRESH_EXPIRES || '7d',
};


export default env;